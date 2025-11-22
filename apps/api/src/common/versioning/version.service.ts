import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ApiVersion, ApiVersionStatus } from '@prisma/client';

@Injectable()
export class VersionService {
  private readonly logger = new Logger(VersionService.name);
  private latestVersionCache: string | null = null;

  constructor(private prisma: PrismaService) {}

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
   * Track API version usage
   */
  async trackUsage(version: string, tenantId: string, endpoint: string): Promise<void> {
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
          count: { increment: 1 },
          lastUsedAt: new Date(),
        },
        create: {
          version,
          tenantId,
          endpoint,
          count: 1,
        },
      });
    } catch (error) {
      this.logger.warn(`Failed to track version usage: ${error.message}`);
    }
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

