import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { DeveloperAccount, MarketplaceApp, MarketplaceAppStatus } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class DeveloperPlatformService {
  private readonly logger = new Logger(DeveloperPlatformService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Register developer
   */
  async registerDeveloper(userId: string, dto: any): Promise<DeveloperAccount> {
    // Generate API key
    const apiKey = this.generateApiKey();

    const developer = await this.prisma.developerAccount.create({
      data: {
        userId,
        companyName: dto.companyName,
        apiKey,
        webhookUrl: dto.webhookUrl,
        revenueShare: dto.revenueShare || 0.7,
      },
    });

    return developer;
  }

  /**
   * Create app
   */
  async createApp(developerId: string, dto: any): Promise<MarketplaceApp> {
    const app = await this.prisma.marketplaceApp.create({
      data: {
        name: dto.name,
        description: dto.description,
        category: dto.category,
        developerId,
        appType: dto.appType,
        config: dto.config || {},
        pricing: dto.pricing || {},
        status: MarketplaceAppStatus.DRAFT,
      },
    });

    return app;
  }

  /**
   * Update app
   */
  async updateApp(id: string, developerId: string, dto: any): Promise<MarketplaceApp> {
    const app = await this.getDeveloperApp(id, developerId);

    return this.prisma.marketplaceApp.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        category: dto.category,
        config: dto.config,
        pricing: dto.pricing,
      },
    });
  }

  /**
   * Publish app
   */
  async publishApp(id: string, developerId: string): Promise<MarketplaceApp> {
    const app = await this.getDeveloperApp(id, developerId);

    // Validate app before publishing
    await this.validateApp(id);

    return this.prisma.marketplaceApp.update({
      where: { id },
      data: { status: MarketplaceAppStatus.PUBLISHED },
    });
  }

  /**
   * Get developer apps
   */
  async getDeveloperApps(developerId: string): Promise<MarketplaceApp[]> {
    return this.prisma.marketplaceApp.findMany({
      where: { developerId },
    });
  }

  /**
   * Get developer account
   */
  async getDeveloperAccount(userId: string): Promise<DeveloperAccount | null> {
    return this.prisma.developerAccount.findUnique({
      where: { userId },
    });
  }

  /**
   * Validate app before publishing
   */
  private async validateApp(appId: string): Promise<void> {
    const app = await this.prisma.marketplaceApp.findUnique({
      where: { id: appId },
    });

    if (!app) {
      throw new Error(`App ${appId} not found`);
    }

    // Validate required fields
    if (!app.name || !app.description || !app.category) {
      throw new Error('App must have name, description, and category');
    }

    // Validate config
    if (!app.config || Object.keys(app.config as any).length === 0) {
      throw new Error('App must have configuration');
    }
  }

  /**
   * Get developer app
   */
  private async getDeveloperApp(appId: string, developerId: string): Promise<MarketplaceApp> {
    const app = await this.prisma.marketplaceApp.findFirst({
      where: {
        id: appId,
        developerId,
      },
    });

    if (!app) {
      throw new Error(`App ${appId} not found or not owned by developer`);
    }

    return app;
  }

  /**
   * Generate API key
   */
  private generateApiKey(): string {
    return `sk_${crypto.randomBytes(32).toString('hex')}`;
  }
}

