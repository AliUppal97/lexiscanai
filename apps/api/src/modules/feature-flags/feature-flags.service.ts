import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CacheService } from '../../services/cache.service';
import { FeatureFlag, FeatureFlagTargetType } from '@prisma/client';
import { CreateFeatureFlagDto, UpdateFeatureFlagDto, EvaluateFeatureFlagDto } from './dto';
import * as crypto from 'crypto';

@Injectable()
export class FeatureFlagsService {
  private readonly logger = new Logger(FeatureFlagsService.name);
  private readonly CACHE_TTL = 60; // 1 minute

  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  /**
   * Create feature flag
   */
  async createFlag(tenantId: string | null, userId: string, dto: CreateFeatureFlagDto): Promise<FeatureFlag> {
    // Check if key already exists
    const existing = await this.prisma.featureFlag.findUnique({
      where: { key: dto.key },
    });

    if (existing) {
      throw new BadRequestException(`Feature flag with key '${dto.key}' already exists`);
    }

    const flag = await this.prisma.featureFlag.create({
      data: {
        key: dto.key,
        name: dto.name,
        description: dto.description,
        enabled: dto.enabled || false,
        rolloutPercentage: dto.rolloutPercentage || 0,
        targetingRules: dto.targetingRules || {},
        dependencies: dto.dependencies || {},
        tenantId,
        createdBy: userId,
      },
    });

    // Invalidate cache
    await this.invalidateCache(tenantId);

    return flag;
  }

  /**
   * Update feature flag
   */
  async updateFlag(key: string, tenantId: string | null, dto: UpdateFeatureFlagDto): Promise<FeatureFlag> {
    const flag = await this.getFlagByKey(key, tenantId);

    const updateData: any = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.enabled !== undefined) updateData.enabled = dto.enabled;
    if (dto.rolloutPercentage !== undefined) updateData.rolloutPercentage = dto.rolloutPercentage;
    if (dto.targetingRules !== undefined) updateData.targetingRules = dto.targetingRules;
    if (dto.dependencies !== undefined) updateData.dependencies = dto.dependencies;

    const updated = await this.prisma.featureFlag.update({
      where: { id: flag.id },
      data: updateData,
    });

    // Invalidate cache
    await this.invalidateCache(tenantId);

    return updated;
  }

  /**
   * Delete feature flag (soft delete by disabling)
   */
  async deleteFlag(key: string, tenantId: string | null): Promise<void> {
    const flag = await this.getFlagByKey(key, tenantId);

    // Soft delete by disabling
    await this.prisma.featureFlag.update({
      where: { id: flag.id },
      data: { enabled: false },
    });

    // Invalidate cache
    await this.invalidateCache(tenantId);
  }

  /**
   * Evaluate feature flag for user
   */
  async evaluateFlag(
    key: string,
    userId: string | null,
    tenantId: string,
    context?: Record<string, any>,
  ): Promise<{ enabled: boolean; value?: any; variantId?: string }> {
    const flag = await this.getFlagByKey(key, tenantId);

    // Check if flag is enabled
    if (!flag.enabled) {
      return { enabled: false };
    }

    // Check dependencies
    if (flag.dependencies && Object.keys(flag.dependencies).length > 0) {
      const dependenciesMet = await this.checkDependencies(flag.dependencies, userId, tenantId);
      if (!dependenciesMet) {
        return { enabled: false };
      }
    }

    // Check targeting rules
    const targetingResult = await this.evaluateTargeting(flag, userId, tenantId, context);
    if (!targetingResult.enabled) {
      return { enabled: false };
    }

    // Check percentage rollout
    if (flag.rolloutPercentage < 100) {
      const rolloutResult = this.evaluatePercentageRollout(flag, userId || tenantId);
      if (!rolloutResult) {
        return { enabled: false };
      }
    }

    // Get variant if exists
    const variants = await this.prisma.featureFlagVariant.findMany({
      where: { flagId: flag.id },
    });

    if (variants.length > 0) {
      const variant = this.selectVariant(variants, userId || tenantId);
      
      // Record evaluation
      await this.recordEvaluation(key, userId, tenantId, variant.id, context);

      return {
        enabled: true,
        value: variant.value,
        variantId: variant.id,
      };
    }

    // Record evaluation
    await this.recordEvaluation(key, userId, tenantId, null, context);

    return { enabled: true, value: true };
  }

  /**
   * Get all flags for tenant
   */
  async getFlagsForTenant(tenantId: string | null): Promise<FeatureFlag[]> {
    const cacheKey = `flags:${tenantId || 'global'}`;

    // Try cache first
    const cached = await this.cache.get<FeatureFlag[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const flags = await this.prisma.featureFlag.findMany({
      where: {
        tenantId: tenantId || null,
        enabled: true,
      },
      include: {
        variants: true,
        targets: true,
      },
    });

    // Cache result
    await this.cache.set(cacheKey, flags, this.CACHE_TTL);

    return flags;
  }

  /**
   * Get flag by key
   */
  private async getFlagByKey(key: string, tenantId: string | null): Promise<FeatureFlag> {
    const flag = await this.prisma.featureFlag.findFirst({
      where: {
        key,
        tenantId: tenantId || null,
      },
    });

    if (!flag) {
      throw new NotFoundException(`Feature flag '${key}' not found`);
    }

    return flag;
  }

  /**
   * Evaluate targeting rules
   */
  private async evaluateTargeting(
    flag: FeatureFlag,
    userId: string | null,
    tenantId: string,
    context?: Record<string, any>,
  ): Promise<{ enabled: boolean }> {
    // Check explicit targets
    const targets = await this.prisma.featureFlagTarget.findMany({
      where: {
        flagId: flag.id,
        enabled: true,
      },
    });

    if (targets.length > 0) {
      for (const target of targets) {
        switch (target.targetType) {
          case FeatureFlagTargetType.USER:
            if (userId && target.targetValue === userId) {
              return { enabled: true };
            }
            break;
          case FeatureFlagTargetType.TENANT:
            if (target.targetValue === tenantId) {
              return { enabled: true };
            }
            break;
          case FeatureFlagTargetType.ENVIRONMENT:
            if (context?.environment === target.targetValue) {
              return { enabled: true };
            }
            break;
          case FeatureFlagTargetType.CUSTOM_ATTRIBUTE:
            if (context && context[target.targetValue] !== undefined) {
              return { enabled: true };
            }
            break;
        }
      }
      // If targets exist but none match, disable
      return { enabled: false };
    }

    // Check targeting rules from JSON
    if (flag.targetingRules && Object.keys(flag.targetingRules).length > 0) {
      // TODO: Implement complex targeting rule evaluation
      // For now, return enabled if no explicit targets
      return { enabled: true };
    }

    return { enabled: true };
  }

  /**
   * Evaluate percentage rollout using consistent hashing
   */
  private evaluatePercentageRollout(flag: FeatureFlag, identifier: string): boolean {
    if (flag.rolloutPercentage === 0) {
      return false;
    }

    if (flag.rolloutPercentage === 100) {
      return true;
    }

    // Use consistent hashing based on flag key + identifier
    const hash = crypto
      .createHash('sha256')
      .update(`${flag.key}:${identifier}`)
      .digest('hex');

    // Convert first 8 characters to number (0-4294967295)
    const hashValue = parseInt(hash.substring(0, 8), 16);
    const percentage = (hashValue % 100) + 1;

    return percentage <= flag.rolloutPercentage;
  }

  /**
   * Check feature flag dependencies
   */
  private async checkDependencies(
    dependencies: Record<string, any>,
    userId: string | null,
    tenantId: string,
  ): Promise<boolean> {
    for (const [depKey, depValue] of Object.entries(dependencies)) {
      const depFlag = await this.prisma.featureFlag.findFirst({
        where: {
          key: depKey,
          tenantId: tenantId || null,
        },
      });

      if (!depFlag || !depFlag.enabled) {
        return false;
      }

      // Check if dependency value matches
      if (depValue !== undefined) {
        const depResult = await this.evaluateFlag(depKey, userId, tenantId);
        if (!depResult.enabled || depResult.value !== depValue) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Select variant based on weight
   */
  private selectVariant(variants: any[], identifier: string): any {
    if (variants.length === 1) {
      return variants[0];
    }

    // Use consistent hashing to select variant
    const hash = crypto
      .createHash('sha256')
      .update(identifier)
      .digest('hex');

    const hashValue = parseInt(hash.substring(0, 8), 16);
    const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0);
    let random = (hashValue % totalWeight) + 1;

    for (const variant of variants) {
      random -= variant.weight;
      if (random <= 0) {
        return variant;
      }
    }

    return variants[0];
  }

  /**
   * Record flag evaluation
   */
  private async recordEvaluation(
    flagKey: string,
    userId: string | null,
    tenantId: string,
    variantId: string | null,
    context?: Record<string, any>,
  ): Promise<void> {
    try {
      await this.prisma.featureFlagEvaluation.create({
        data: {
          flagKey,
          userId,
          tenantId,
          variantId,
          context: context || {},
        },
      });
    } catch (error) {
      // Don't fail evaluation if recording fails
      this.logger.warn(`Failed to record evaluation: ${error.message}`);
    }
  }

  /**
   * Invalidate cache
   */
  private async invalidateCache(tenantId: string | null): Promise<void> {
    const pattern = `flags:${tenantId || 'global'}`;
    await this.cache.deletePattern(pattern);
  }
}

