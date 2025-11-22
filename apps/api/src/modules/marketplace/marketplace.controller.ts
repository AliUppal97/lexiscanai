import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EnhancedJwtAuthGuard } from '../auth/enhanced-auth.guard';
import { MarketplaceService } from './marketplace.service';
import { DeveloperPlatformService } from './developer-platform.service';
import { AppExecutionService } from './app-execution.service';
import { RevenueService } from './revenue.service';
import { DeveloperSdkService } from './developer-sdk.service';

@ApiTags('Marketplace')
@ApiBearerAuth()
@Controller('marketplace')
@UseGuards(EnhancedJwtAuthGuard)
export class MarketplaceController {
  constructor(
    private marketplaceService: MarketplaceService,
    private developerPlatformService: DeveloperPlatformService,
    private appExecutionService: AppExecutionService,
    private revenueService: RevenueService,
    private sdkService: DeveloperSdkService,
  ) {}

  @Get('apps')
  @ApiOperation({ summary: 'List marketplace apps' })
  async listApps(@Query() filters: any): Promise<any[]> {
    return this.marketplaceService.listApps(filters);
  }

  @Get('apps/:id')
  @ApiOperation({ summary: 'Get app details' })
  async getApp(@Param('id') id: string): Promise<any> {
    return this.marketplaceService.getApp(id);
  }

  @Post('apps/:id/install')
  @ApiOperation({ summary: 'Install app' })
  async installApp(@Request() req: any, @Param('id') id: string, @Body() config?: any): Promise<any> {
    const tenantId = req.user.tenantId;
    return this.marketplaceService.installApp(id, tenantId, config);
  }

  @Delete('apps/:id/uninstall')
  @ApiOperation({ summary: 'Uninstall app' })
  async uninstallApp(@Request() req: any, @Param('id') id: string): Promise<void> {
    const tenantId = req.user.tenantId;
    return this.marketplaceService.uninstallApp(id, tenantId);
  }

  @Get('developer/apps')
  @ApiOperation({ summary: 'List developer apps' })
  async listDeveloperApps(@Request() req: any): Promise<any[]> {
    const userId = req.user.id;
    const developer = await this.developerPlatformService.getDeveloperAccount(userId);
    if (!developer) {
      return [];
    }
    return this.developerPlatformService.getDeveloperApps(developer.id);
  }

  @Post('developer/apps')
  @ApiOperation({ summary: 'Create app' })
  async createApp(@Request() req: any, @Body() dto: any): Promise<any> {
    const userId = req.user.id;
    let developer = await this.developerPlatformService.getDeveloperAccount(userId);
    if (!developer) {
      developer = await this.developerPlatformService.registerDeveloper(userId, {});
    }
    return this.developerPlatformService.createApp(developer.id, dto);
  }

  @Post('developer/apps/:id/publish')
  @ApiOperation({ summary: 'Publish app' })
  async publishApp(@Request() req: any, @Param('id') id: string): Promise<any> {
    const userId = req.user.id;
    const developer = await this.developerPlatformService.getDeveloperAccount(userId);
    if (!developer) {
      throw new Error('Developer account not found');
    }
    return this.developerPlatformService.publishApp(id, developer.id);
  }

  @Get('developer/revenue')
  @ApiOperation({ summary: 'Get developer revenue' })
  async getDeveloperRevenue(@Request() req: any): Promise<any> {
    const userId = req.user.id;
    const developer = await this.developerPlatformService.getDeveloperAccount(userId);
    if (!developer) {
      return { totalRevenue: 0, platformCommission: 0, developerRevenue: 0, transactions: 0 };
    }
    return this.revenueService.getDeveloperRevenue(developer.id);
  }

  @Get('developer/sdk/docs')
  @ApiOperation({ summary: 'Get SDK documentation' })
  async getSdkDocs(): Promise<{ docs: string }> {
    const docs = await this.sdkService.generateSdkDocs();
    return { docs };
  }

  @Post('developer/api-key/regenerate')
  @ApiOperation({ summary: 'Regenerate API key' })
  async regenerateApiKey(@Request() req: any): Promise<{ apiKey: string }> {
    const userId = req.user.id;
    const developer = await this.developerPlatformService.getDeveloperAccount(userId);
    if (!developer) {
      throw new Error('Developer account not found');
    }
    const apiKey = await this.sdkService.generateApiKey(developer.id);
    return { apiKey };
  }

  @Post('apps/:id/validate')
  @ApiOperation({ summary: 'Validate app code' })
  async validateApp(@Param('id') id: string): Promise<any> {
    return this.appExecutionService.validateApp(id);
  }

  @Post('apps/:id/execute')
  @ApiOperation({ summary: 'Execute app in sandbox' })
  async executeApp(
    @Param('id') id: string,
    @Body() dto: { input: any; timeout?: number },
  ): Promise<any> {
    return this.appExecutionService.executeApp(id, dto.input);
  }
}

