import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ApiVersion, ApiVersionStatus, ApiVersionUsage } from '@prisma/client';
import { CacheService } from '../../services/cache.service';

@Injectable()
export class VersionService {
  private readonly logger = new Logger(VersionService.name);
  private latestVersionCache: string | null = null;
  private readonly CACHE_TTL = 300; // 5 minutes
  private usageBuffer: Map<string, { version: string; tenantId: string; endpoint: string }[]> = new Map();

  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {
    // Flush usage buffer every 30 seconds
    setInterval(() => this.flushUsageBuffer(), 30000);
  }

  /**
   * Get version information
   */
  async getVersion(version: string): Promise<ApiVersion | null> {
    return this.prisma.apiVersion.findUnique({
      where: { version },
    });
  }

  /**
   * Get latest active version
   */
  async getLatestVersion(): Promise<string> {
    if (this.latestVersionCache) {
      return this.latestVersionCache;
    }

    const latest = await this.prisma.apiVersion.findFirst({
      where: { status: ApiVersionStatus.ACTIVE },
      orderBy: { createdAt: 'desc' },
    });

    if (!latest) {
      // Default to v1 if no versions exist
      return 'v1';
    }

    this.latestVersionCache = latest.version;
    return latest.version;
  }

  /**
   * Check if version is deprecated
   */
  async isDeprecated(version: string): Promise<boolean> {
    const versionInfo = await this.getVersion(version);
    return versionInfo?.status === ApiVersionStatus.DEPRECATED || versionInfo?.status === ApiVersionStatus.SUNSET;
  }

  /**
   * Get migration guide
   */
  async getMigrationGuide(fromVersion: string, toVersion: string): Promise<string | null> {
    const from = await this.getVersion(fromVersion);
    const to = await this.getVersion(toVersion);

    if (!from || !to) {
      return null;
    }

    // Return migration guide from target version
    return to.migrationGuide || null;
  }

  /**
   * Track API version usage (batched for performance)
   */
  async trackUsage(version: string, tenantId: string, endpoint: string): Promise<void> {
    // Add to buffer for batch processing
    const key = `${version}:${tenantId}`;
    if (!this.usageBuffer.has(key)) {
      this.usageBuffer.set(key, []);
    }
    this.usageBuffer.get(key)!.push({ version, tenantId, endpoint });

    // Update Redis counter for real-time stats
    const redisKey = `api_usage:${version}:${tenantId}:${endpoint}`;
    await this.cache.increment(redisKey);

    // Flush if buffer is full
    if (this.usageBuffer.get(key)!.length >= 100) {
      await this.flushUsageBuffer(key);
    }
  }

  /**
   * Flush usage buffer to database
   */
  private async flushUsageBuffer(key?: string): Promise<void> {
    const keysToFlush = key ? [key] : Array.from(this.usageBuffer.keys());

    for (const bufferKey of keysToFlush) {
      const usages = this.usageBuffer.get(bufferKey);
      if (!usages || usages.length === 0) continue;

      // Group by version, tenantId, endpoint
      const grouped = new Map<string, number>();
      for (const usage of usages) {
        const groupKey = `${usage.version}:${usage.tenantId}:${usage.endpoint}`;
        grouped.set(groupKey, (grouped.get(groupKey) || 0) + 1);
      }

      // Batch upsert
      for (const [groupKey, count] of grouped.entries()) {
        const [version, tenantId, endpoint] = groupKey.split(':');
        try {
          await this.prisma.apiVersionUsage.upsert({
            where: {
              version_tenantId_endpoint: {
                version,
                tenantId,
                endpoint,
              },
            },
            update: {
              count: { increment: count },
              lastUsedAt: new Date(),
            },
            create: {
              version,
              tenantId,
              endpoint,
              count,
            },
          });
        } catch (error) {
          this.logger.warn(`Failed to flush usage buffer: ${error.message}`);
        }
      }

      // Clear buffer
      this.usageBuffer.set(bufferKey, []);
    }
  }

  /**
   * Get usage statistics for version
   */
  async getUsageStatistics(
    version: string,
    period?: { startDate: Date; endDate: Date },
  ): Promise<{
    version: string;
    totalRequests: number;
    uniqueTenants: number;
    uniqueEndpoints: number;
    requestsByTenant: Record<string, number>;
    requestsByEndpoint: Record<string, number>;
    errorRate: number;
    averageLatency: number;
  }> {
    const cacheKey = `usage_stats:${version}:${period ? `${period.startDate}:${period.endDate}` : 'all'}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return cached as any;
    }

    const where: any = { version };
    if (period) {
      where.lastUsedAt = {
        gte: period.startDate,
        lte: period.endDate,
      };
    }

    const usageRecords = await this.prisma.apiVersionUsage.findMany({
      where,
    });

    const totalRequests = usageRecords.reduce((sum, record) => sum + record.count, 0);
    const uniqueTenants = new Set(usageRecords.map((r) => r.tenantId)).size;
    const uniqueEndpoints = new Set(usageRecords.map((r) => r.endpoint)).size;

    const requestsByTenant: Record<string, number> = {};
    const requestsByEndpoint: Record<string, number> = {};

    for (const record of usageRecords) {
      requestsByTenant[record.tenantId] = (requestsByTenant[record.tenantId] || 0) + record.count;
      requestsByEndpoint[record.endpoint] = (requestsByEndpoint[record.endpoint] || 0) + record.count;
    }

    const stats = {
      version,
      totalRequests,
      uniqueTenants,
      uniqueEndpoints,
      requestsByTenant,
      requestsByEndpoint,
      errorRate: 0, // Would come from error tracking
      averageLatency: 0, // Would come from performance monitoring
    };

    await this.cache.set(cacheKey, stats, this.CACHE_TTL);
    return stats;
  }

  /**
   * Get tenants using deprecated version
   */
  async getDeprecatedVersionUsers(version: string): Promise<Array<{ tenantId: string; endpoint: string; lastUsedAt: Date; count: number }>> {
    const versionInfo = await this.getVersion(version);
    if (!versionInfo || versionInfo.status !== ApiVersionStatus.DEPRECATED) {
      return [];
    }

    const usage = await this.prisma.apiVersionUsage.findMany({
      where: { version },
      orderBy: { lastUsedAt: 'desc' },
    });

    return usage.map((u) => ({
      tenantId: u.tenantId,
      endpoint: u.endpoint,
      lastUsedAt: u.lastUsedAt,
      count: u.count,
    }));
  }

  /**
   * Create migration guide
   */
  async createMigrationGuide(
    fromVersion: string,
    toVersion: string,
    changes: Array<{ type: string; description: string; example?: string }>,
  ): Promise<string> {
    const from = await this.getVersion(fromVersion);
    const to = await this.getVersion(toVersion);

    if (!from || !to) {
      throw new NotFoundException(`Version ${fromVersion} or ${toVersion} not found`);
    }

    let guide = `# Migration Guide: ${fromVersion} → ${toVersion}\n\n`;
    guide += `This guide will help you migrate from API version ${fromVersion} to ${toVersion}.\n\n`;

    guide += `## Overview\n\n`;
    guide += `- **From Version:** ${fromVersion}\n`;
    guide += `- **To Version:** ${toVersion}\n`;
    guide += `- **Status:** ${to.status}\n`;
    if (to.deprecationDate) {
      guide += `- **Deprecation Date:** ${to.deprecationDate.toISOString()}\n`;
    }
    if (to.sunsetDate) {
      guide += `- **Sunset Date:** ${to.sunsetDate.toISOString()}\n`;
    }
    guide += `\n`;

    guide += `## Breaking Changes\n\n`;
    for (const change of changes) {
      guide += `### ${change.type}\n`;
      guide += `${change.description}\n\n`;
      if (change.example) {
        guide += `**Example:**\n\`\`\`\n${change.example}\n\`\`\`\n\n`;
      }
    }

    guide += `## Migration Steps\n\n`;
    guide += `1. Review all breaking changes listed above\n`;
    guide += `2. Update your API client to use version ${toVersion}\n`;
    guide += `3. Test your integration thoroughly\n`;
    guide += `4. Deploy your updated application\n`;
    guide += `5. Monitor for any issues\n\n`;

    guide += `## Support\n\n`;
    guide += `If you encounter any issues during migration, please contact our support team.\n`;

    // Update migration guide in version record
    await this.prisma.apiVersion.update({
      where: { version: toVersion },
      data: { migrationGuide: guide },
    });

    return guide;
  }

  /**
   * Get migration progress for tenant
   */
  async getMigrationProgress(tenantId: string, targetVersion: string): Promise<{
    tenantId: string;
    currentVersions: Record<string, number>;
    targetVersion: string;
    progress: number;
    recommendations: string[];
  }> {
    const usage = await this.prisma.apiVersionUsage.findMany({
      where: { tenantId },
    });

    const currentVersions: Record<string, number> = {};
    let totalRequests = 0;

    for (const record of usage) {
      currentVersions[record.version] = (currentVersions[record.version] || 0) + record.count;
      totalRequests += record.count;
    }

    const targetRequests = currentVersions[targetVersion] || 0;
    const progress = totalRequests > 0 ? (targetRequests / totalRequests) * 100 : 0;

    const recommendations: string[] = [];
    for (const [version, count] of Object.entries(currentVersions)) {
      if (version !== targetVersion) {
        const versionInfo = await this.getVersion(version);
        if (versionInfo?.status === ApiVersionStatus.DEPRECATED) {
          recommendations.push(
            `Migrate from ${version} to ${targetVersion}. ${count} requests still using deprecated version.`,
          );
        }
      }
    }

    return {
      tenantId,
      currentVersions,
      targetVersion,
      progress,
      recommendations,
    };
  }

  /**
   * Check deprecation status
   */
  async checkDeprecationStatus(version: string): Promise<{
    isDeprecated: boolean;
    isSunset: boolean;
    deprecationDate?: Date;
    sunsetDate?: Date;
    daysUntilSunset?: number;
  }> {
    const versionInfo = await this.getVersion(version);
    if (!versionInfo) {
      return {
        isDeprecated: false,
        isSunset: false,
      };
    }

    const isDeprecated = versionInfo.status === ApiVersionStatus.DEPRECATED;
    const isSunset = versionInfo.status === ApiVersionStatus.SUNSET;

    let daysUntilSunset: number | undefined;
    if (versionInfo.sunsetDate) {
      const now = new Date();
      const days = Math.ceil((versionInfo.sunsetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      daysUntilSunset = days > 0 ? days : 0;
    }

    return {
      isDeprecated,
      isSunset,
      deprecationDate: versionInfo.deprecationDate || undefined,
      sunsetDate: versionInfo.sunsetDate || undefined,
      daysUntilSunset,
    };
  }

  /**
   * Deprecate version
   */
  async deprecateVersion(
    version: string,
    deprecationDate?: Date,
    sunsetDate?: Date,
  ): Promise<ApiVersion> {
    const versionInfo = await this.getVersion(version);
    if (!versionInfo) {
      throw new NotFoundException(`Version ${version} not found`);
    }

    const updated = await this.prisma.apiVersion.update({
      where: { version },
      data: {
        status: ApiVersionStatus.DEPRECATED,
        deprecationDate: deprecationDate || new Date(),
        sunsetDate: sunsetDate || (deprecationDate ? new Date(deprecationDate.getTime() + 90 * 24 * 60 * 60 * 1000) : undefined), // 90 days default
      },
    });

    // Invalidate cache
    this.latestVersionCache = null;

    this.logger.log(`Version ${version} deprecated. Sunset date: ${updated.sunsetDate?.toISOString()}`);

    return updated;
  }

  /**
   * List all versions
   */
  async listVersions(): Promise<ApiVersion[]> {
    return this.prisma.apiVersion.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * List deprecated versions
   */
  async listDeprecatedVersions(): Promise<ApiVersion[]> {
    return this.prisma.apiVersion.findMany({
      where: {
        status: {
          in: [ApiVersionStatus.DEPRECATED, ApiVersionStatus.SUNSET],
        },
      },
      orderBy: { sunsetDate: 'asc' },
    });
  }

  /**
   * Create API version
   */
  async createVersion(data: {
    version: string;
    status?: ApiVersionStatus;
    deprecationDate?: Date;
    sunsetDate?: Date;
    changelog?: any;
    migrationGuide?: string;
  }): Promise<ApiVersion> {
    const version = await this.prisma.apiVersion.create({
      data: {
        version: data.version,
        status: data.status || ApiVersionStatus.ACTIVE,
        deprecationDate: data.deprecationDate,
        sunsetDate: data.sunsetDate,
        changelog: data.changelog || {},
        migrationGuide: data.migrationGuide,
      },
    });

    // Invalidate cache
    this.latestVersionCache = null;

    return version;
  }
}

