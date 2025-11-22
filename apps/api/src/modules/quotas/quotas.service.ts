import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CacheService } from '../../services/cache.service';
import { ResourceType, QuotaPeriod, QuotaConfig, QuotaAlertType } from '@prisma/client';
import { CreateQuotaConfigDto, UpdateQuotaConfigDto, QuotaUsageDto, UsageStatsDto } from './dto';

@Injectable()
export class QuotasService {
  private readonly logger = new Logger(QuotasService.name);
  private readonly CACHE_TTL = 300; // 5 minutes

  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  /**
   * Get quota configuration for tenant and resource type
   */
  async getQuotaConfig(
    tenantId: string,
    resourceType: ResourceType,
    period?: QuotaPeriod,
  ): Promise<QuotaConfig | null> {
    const cacheKey = `quota:${tenantId}:${resourceType}:${period || 'default'}`;

    // Try cache first
    const cached = await this.cache.get<QuotaConfig>(cacheKey);
    if (cached) {
      return cached;
    }

    // Query database
    const where: any = {
      tenantId,
      resourceType,
      isActive: true,
    };

    if (period) {
      where.period = period;
    }

    const quota = await this.prisma.quotaConfig.findFirst({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // Cache result
    if (quota) {
      await this.cache.set(cacheKey, quota, this.CACHE_TTL);
    }

    return quota;
  }

  /**
   * Check if quota allows operation
   */
  async checkQuota(
    tenantId: string,
    resourceType: ResourceType,
    quantity: bigint = BigInt(1),
  ): Promise<{ allowed: boolean; remaining: bigint; quota?: QuotaConfig }> {
    const quota = await this.getQuotaConfig(tenantId, resourceType);

    if (!quota) {
      // No quota configured = unlimited
      return { allowed: true, remaining: BigInt(Number.MAX_SAFE_INTEGER) };
    }

    const currentUsage = await this.getCurrentUsage(tenantId, resourceType, quota.period);
    const remaining = quota.limit - currentUsage;

    // Check if quota allows
    if (currentUsage + quantity <= quota.limit) {
      return { allowed: true, remaining, quota };
    }

    // Check overage
    if (quota.overageAllowed && quota.overageLimit) {
      const totalWithOverage = currentUsage + quantity;
      if (totalWithOverage <= quota.limit + quota.overageLimit) {
        return { allowed: true, remaining: quota.overageLimit - (totalWithOverage - quota.limit), quota };
      }
    }

    return { allowed: false, remaining: BigInt(0), quota };
  }

  /**
   * Consume quota (record usage)
   */
  async consumeQuota(
    tenantId: string,
    resourceType: ResourceType,
    quantity: bigint = BigInt(1),
    metadata?: Record<string, any>,
    userId?: string,
    documentId?: string,
  ): Promise<void> {
    const quota = await this.getQuotaConfig(tenantId, resourceType);

    if (!quota) {
      // No quota configured, still record usage for analytics
      await this.recordUsage(tenantId, resourceType, quantity, metadata, userId, documentId);
      return;
    }

    // Check quota before consuming
    const check = await this.checkQuota(tenantId, resourceType, quantity);
    if (!check.allowed) {
      throw new BadRequestException(
        `Quota exceeded for ${resourceType}. Limit: ${quota.limit}, Current: ${await this.getCurrentUsage(tenantId, resourceType, quota.period)}`,
      );
    }

    // Record usage
    await this.recordUsage(tenantId, resourceType, quantity, metadata, userId, documentId, quota.id);

    // Check thresholds and send alerts
    await this.checkThresholds(tenantId, quota);
  }

  /**
   * Record usage in database
   */
  private async recordUsage(
    tenantId: string,
    resourceType: ResourceType,
    quantity: bigint,
    metadata?: Record<string, any>,
    userId?: string,
    documentId?: string,
    quotaConfigId?: string,
  ): Promise<void> {
    await this.prisma.usageRecord.create({
      data: {
        tenantId,
        resourceType,
        quantity,
        metadata: metadata || {},
        userId,
        documentId,
        quotaConfigId,
      },
    });

    // Invalidate cache
    await this.invalidateCache(tenantId, resourceType);
  }

  /**
   * Get current usage for tenant and resource type
   */
  async getCurrentUsage(
    tenantId: string,
    resourceType: ResourceType,
    period?: QuotaPeriod,
  ): Promise<bigint> {
    const cacheKey = `usage:${tenantId}:${resourceType}:${period || 'all'}`;

    // Try cache first
    const cached = await this.cache.get<string>(cacheKey);
    if (cached) {
      return BigInt(cached);
    }

    // Calculate date range based on period
    const dateRange = this.getDateRangeForPeriod(period);

    const where: any = {
      tenantId,
      resourceType,
    };

    if (dateRange.start) {
      where.timestamp = {
        gte: dateRange.start,
      };
    }

    if (dateRange.end) {
      where.timestamp = {
        ...where.timestamp,
        lte: dateRange.end,
      };
    }

    // Aggregate usage
    const result = await this.prisma.usageRecord.aggregate({
      where,
      _sum: {
        quantity: true,
      },
    });

    const totalUsage = result._sum.quantity || BigInt(0);

    // Cache result (1 minute TTL for usage)
    await this.cache.set(cacheKey, totalUsage.toString(), 60);

    return totalUsage;
  }

  /**
   * Get usage statistics
   */
  async getUsageStats(
    tenantId: string,
    resourceType: ResourceType,
    startDate: Date,
    endDate: Date,
  ): Promise<UsageStatsDto> {
    const where = {
      tenantId,
      resourceType,
      timestamp: {
        gte: startDate,
        lte: endDate,
      },
    };

    const [aggregate, count] = await Promise.all([
      this.prisma.usageRecord.aggregate({
        where,
        _sum: { quantity: true },
        _avg: { quantity: true },
      }),
      this.prisma.usageRecord.count({ where }),
    ]);

    return {
      totalUsage: aggregate._sum.quantity || BigInt(0),
      count,
      averageUsage: Number(aggregate._avg.quantity || 0),
      startDate,
      endDate,
    };
  }

  /**
   * Reset quota for period
   */
  async resetQuota(tenantId: string, resourceType: ResourceType, period: QuotaPeriod): Promise<void> {
    const quota = await this.getQuotaConfig(tenantId, resourceType, period);

    if (!quota) {
      throw new NotFoundException(`Quota not found for ${resourceType} with period ${period}`);
    }

    const nextResetDate = this.calculateNextResetDate(period);

    await this.prisma.quotaConfig.update({
      where: { id: quota.id },
      data: { resetDate: nextResetDate },
    });

    // Invalidate cache
    await this.invalidateCache(tenantId, resourceType);
  }

  /**
   * Create quota configuration
   */
  async createQuotaConfig(tenantId: string, dto: CreateQuotaConfigDto): Promise<QuotaConfig> {
    const resetDate = dto.resetDate || this.calculateNextResetDate(dto.period || QuotaPeriod.MONTHLY);

    const quota = await this.prisma.quotaConfig.create({
      data: {
        tenantId,
        resourceType: dto.resourceType,
        limit: BigInt(dto.limit),
        period: dto.period || QuotaPeriod.MONTHLY,
        resetDate,
        overageAllowed: dto.overageAllowed || false,
        overageLimit: dto.overageLimit ? BigInt(dto.overageLimit) : null,
      },
    });

    // Invalidate cache
    await this.invalidateCache(tenantId, dto.resourceType);

    return quota;
  }

  /**
   * Update quota configuration
   */
  async updateQuotaConfig(
    tenantId: string,
    resourceType: ResourceType,
    dto: UpdateQuotaConfigDto,
  ): Promise<QuotaConfig> {
    const quota = await this.getQuotaConfig(tenantId, resourceType);

    if (!quota) {
      throw new NotFoundException(`Quota not found for ${resourceType}`);
    }

    const updateData: any = {};

    if (dto.limit !== undefined) {
      updateData.limit = BigInt(dto.limit);
    }
    if (dto.period !== undefined) {
      updateData.period = dto.period;
      updateData.resetDate = this.calculateNextResetDate(dto.period);
    }
    if (dto.resetDate !== undefined) {
      updateData.resetDate = dto.resetDate;
    }
    if (dto.overageAllowed !== undefined) {
      updateData.overageAllowed = dto.overageAllowed;
    }
    if (dto.overageLimit !== undefined) {
      updateData.overageLimit = BigInt(dto.overageLimit);
    }
    if (dto.isActive !== undefined) {
      updateData.isActive = dto.isActive;
    }

    const updated = await this.prisma.quotaConfig.update({
      where: { id: quota.id },
      data: updateData,
    });

    // Invalidate cache
    await this.invalidateCache(tenantId, resourceType);

    return updated;
  }

  /**
   * Get quota usage information
   */
  async getQuotaUsage(tenantId: string, resourceType: ResourceType): Promise<QuotaUsageDto> {
    const quota = await this.getQuotaConfig(tenantId, resourceType);

    if (!quota) {
      throw new NotFoundException(`Quota not found for ${resourceType}`);
    }

    const currentUsage = await this.getCurrentUsage(tenantId, resourceType, quota.period);
    const usagePercentage = Number((currentUsage * BigInt(100)) / quota.limit);
    const remaining = quota.limit > currentUsage ? quota.limit - currentUsage : BigInt(0);

    return {
      currentUsage,
      limit: quota.limit,
      usagePercentage,
      remaining,
      isExceeded: currentUsage >= quota.limit,
      isWarning: usagePercentage >= 75,
      resourceType: quota.resourceType,
      period: quota.period,
      resetDate: quota.resetDate || undefined,
    };
  }

  /**
   * Check thresholds and send alerts
   */
  private async checkThresholds(tenantId: string, quota: QuotaConfig): Promise<void> {
    const currentUsage = await this.getCurrentUsage(tenantId, quota.resourceType, quota.period);
    const usagePercentage = Number((currentUsage * BigInt(100)) / quota.limit);

    const thresholds = [50, 75, 90, 100];
    const alertTypes: Record<number, QuotaAlertType> = {
      50: QuotaAlertType.WARNING,
      75: QuotaAlertType.WARNING,
      90: QuotaAlertType.CRITICAL,
      100: QuotaAlertType.EXHAUSTED,
    };

    for (const threshold of thresholds) {
      if (usagePercentage >= threshold) {
        // Check if alert already sent recently (within last hour)
        const recentAlert = await this.prisma.quotaAlert.findFirst({
          where: {
            tenantId,
            quotaConfigId: quota.id,
            thresholdPercentage: threshold,
            sentAt: {
              gte: new Date(Date.now() - 60 * 60 * 1000), // Last hour
            },
          },
        });

        if (!recentAlert) {
          await this.createAlert(tenantId, quota.id, alertTypes[threshold], threshold, usagePercentage);
        }
      }
    }
  }

  /**
   * Create quota alert
   */
  private async createAlert(
    tenantId: string,
    quotaConfigId: string,
    alertType: QuotaAlertType,
    thresholdPercentage: number,
    usagePercentage: number,
  ): Promise<void> {
    const message = this.getAlertMessage(alertType, thresholdPercentage, usagePercentage);

    await this.prisma.quotaAlert.create({
      data: {
        tenantId,
        quotaConfigId,
        alertType,
        thresholdPercentage,
        message,
        metadata: {
          usagePercentage,
        },
      },
    });

    // TODO: Send email/Slack notification
    this.logger.warn(`Quota alert: ${message} for tenant ${tenantId}`);
  }

  /**
   * Get alert message
   */
  private getAlertMessage(alertType: QuotaAlertType, threshold: number, usagePercentage: number): string {
    const messages: Record<QuotaAlertType, string> = {
      [QuotaAlertType.WARNING]: `Quota usage at ${usagePercentage.toFixed(1)}% (threshold: ${threshold}%)`,
      [QuotaAlertType.CRITICAL]: `Quota usage critical at ${usagePercentage.toFixed(1)}% (threshold: ${threshold}%)`,
      [QuotaAlertType.EXHAUSTED]: `Quota exhausted at ${usagePercentage.toFixed(1)}%`,
    };

    return messages[alertType];
  }

  /**
   * Calculate next reset date based on period
   */
  private calculateNextResetDate(period: QuotaPeriod): Date {
    const now = new Date();
    const next = new Date(now);

    switch (period) {
      case QuotaPeriod.DAILY:
        next.setDate(next.getDate() + 1);
        next.setHours(0, 0, 0, 0);
        break;
      case QuotaPeriod.MONTHLY:
        next.setMonth(next.getMonth() + 1);
        next.setDate(1);
        next.setHours(0, 0, 0, 0);
        break;
      case QuotaPeriod.YEARLY:
        next.setFullYear(next.getFullYear() + 1);
        next.setMonth(0);
        next.setDate(1);
        next.setHours(0, 0, 0, 0);
        break;
      case QuotaPeriod.LIFETIME:
        return new Date('2099-12-31');
    }

    return next;
  }

  /**
   * Get date range for period
   */
  private getDateRangeForPeriod(period?: QuotaPeriod): { start?: Date; end?: Date } {
    if (!period || period === QuotaPeriod.LIFETIME) {
      return {};
    }

    const now = new Date();
    const start = new Date(now);

    switch (period) {
      case QuotaPeriod.DAILY:
        start.setHours(0, 0, 0, 0);
        return { start, end: now };
      case QuotaPeriod.MONTHLY:
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        return { start, end: now };
      case QuotaPeriod.YEARLY:
        start.setMonth(0);
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        return { start, end: now };
    }

    return {};
  }

  /**
   * Invalidate cache for tenant and resource type
   */
  private async invalidateCache(tenantId: string, resourceType: ResourceType): Promise<void> {
    const patterns = [
      `quota:${tenantId}:${resourceType}:*`,
      `usage:${tenantId}:${resourceType}:*`,
    ];

    for (const pattern of patterns) {
      await this.cache.deletePattern(pattern);
    }
  }
}

