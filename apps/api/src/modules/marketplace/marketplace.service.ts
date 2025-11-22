import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { MarketplaceApp, MarketplaceAppStatus } from '@prisma/client';

@Injectable()
export class MarketplaceService {
  private readonly logger = new Logger(MarketplaceService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * List apps with filters
   */
  async listApps(filters?: {
    category?: string;
    appType?: string;
    status?: MarketplaceAppStatus;
    search?: string;
  }): Promise<MarketplaceApp[]> {
    const where: any = {};

    if (filters?.category) {
      where.category = filters.category;
    }

    if (filters?.appType) {
      where.appType = filters.appType;
    }

    if (filters?.status) {
      where.status = filters.status;
    } else {
      where.status = MarketplaceAppStatus.PUBLISHED;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.marketplaceApp.findMany({
      where,
      include: {
        developer: {
          select: {
            companyName: true,
          },
        },
        reviews: {
          select: {
            rating: true,
          },
        },
      },
      orderBy: { rating: 'desc' },
    });
  }

  /**
   * Get app details
   */
  async getApp(id: string): Promise<MarketplaceApp | null> {
    return this.prisma.marketplaceApp.findUnique({
      where: { id },
      include: {
        developer: true,
        reviews: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  /**
   * Install app
   */
  async installApp(appId: string, tenantId: string, config?: any): Promise<any> {
    const app = await this.getApp(appId);
    if (!app) {
      throw new Error(`App ${appId} not found`);
    }

    // Check if already installed
    const existing = await this.prisma.appInstallation.findUnique({
      where: {
        appId_tenantId: {
          appId,
          tenantId,
        },
      },
    });

    if (existing) {
      throw new Error(`App ${appId} already installed`);
    }

    // Create installation
    const installation = await this.prisma.appInstallation.create({
      data: {
        appId,
        tenantId,
        config: config || {},
      },
    });

    // Increment download count
    await this.prisma.marketplaceApp.update({
      where: { id: appId },
      data: {
        downloads: { increment: 1 },
      },
    });

    return installation;
  }

  /**
   * Uninstall app
   */
  async uninstallApp(appId: string, tenantId: string): Promise<void> {
    await this.prisma.appInstallation.updateMany({
      where: {
        appId,
        tenantId,
      },
      data: {
        status: 'UNINSTALLED',
      },
    });
  }

  /**
   * Search apps
   */
  async searchApps(query: string): Promise<MarketplaceApp[]> {
    return this.listApps({ search: query });
  }
}

