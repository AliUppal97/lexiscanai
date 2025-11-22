import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ParseEnumPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { EnhancedJwtAuthGuard } from '../auth/enhanced-auth.guard';
import { QuotasService } from './quotas.service';
import { QuotaAlertService } from './quota-alert.service';
import { UsageTrackerService } from './usage-tracker.service';
import {
  CreateQuotaConfigDto,
  UpdateQuotaConfigDto,
  QuotaUsageDto,
  UsageStatsDto,
  QuotaAlertDto,
} from './dto';
import { ResourceType, QuotaPeriod } from '@prisma/client';

@ApiTags('Quotas')
@ApiBearerAuth()
@Controller('quotas')
@UseGuards(EnhancedJwtAuthGuard)
export class QuotasController {
  constructor(
    private quotasService: QuotasService,
    private quotaAlertService: QuotaAlertService,
    private usageTrackerService: UsageTrackerService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all quotas for tenant' })
  @ApiResponse({ status: 200, description: 'List of quotas' })
  async listQuotas(@Request() req: any): Promise<any[]> {
    const tenantId = req.user.tenantId;
    // TODO: Implement list all quotas
    return [];
  }

  @Get(':resourceType')
  @ApiOperation({ summary: 'Get quota for specific resource type' })
  @ApiResponse({ status: 200, description: 'Quota configuration' })
  @ApiResponse({ status: 404, description: 'Quota not found' })
  async getQuota(
    @Request() req: any,
    @Param('resourceType', new ParseEnumPipe(ResourceType)) resourceType: ResourceType,
    @Query('period') period?: QuotaPeriod,
  ): Promise<any> {
    const tenantId = req.user.tenantId;
    const quota = await this.quotasService.getQuotaConfig(tenantId, resourceType, period);
    if (!quota) {
      return { message: 'Quota not configured for this resource type' };
    }
    return quota;
  }

  @Put(':resourceType')
  @ApiOperation({ summary: 'Update quota (admin only)' })
  @ApiResponse({ status: 200, description: 'Quota updated' })
  @ApiResponse({ status: 404, description: 'Quota not found' })
  async updateQuota(
    @Request() req: any,
    @Param('resourceType', new ParseEnumPipe(ResourceType)) resourceType: ResourceType,
    @Body() dto: UpdateQuotaConfigDto,
  ): Promise<any> {
    const tenantId = req.user.tenantId;
    // TODO: Check admin permissions
    return this.quotasService.updateQuotaConfig(tenantId, resourceType, dto);
  }

  @Get(':resourceType/usage')
  @ApiOperation({ summary: 'Get current usage for resource type' })
  @ApiResponse({ status: 200, description: 'Current usage information', type: QuotaUsageDto })
  async getUsage(
    @Request() req: any,
    @Param('resourceType', new ParseEnumPipe(ResourceType)) resourceType: ResourceType,
  ): Promise<QuotaUsageDto> {
    const tenantId = req.user.tenantId;
    return this.quotasService.getQuotaUsage(tenantId, resourceType);
  }

  @Get(':resourceType/usage/history')
  @ApiOperation({ summary: 'Get usage history' })
  @ApiResponse({ status: 200, description: 'Usage history', type: UsageStatsDto })
  @ApiQuery({ name: 'startDate', required: false, type: Date })
  @ApiQuery({ name: 'endDate', required: false, type: Date })
  async getUsageHistory(
    @Request() req: any,
    @Param('resourceType', new ParseEnumPipe(ResourceType)) resourceType: ResourceType,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<UsageStatsDto> {
    const tenantId = req.user.tenantId;
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default: 30 days ago
    const end = endDate ? new Date(endDate) : new Date();
    return this.quotasService.getUsageStats(tenantId, resourceType, start, end);
  }

  @Post(':resourceType/reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset quota (admin only)' })
  @ApiResponse({ status: 200, description: 'Quota reset' })
  @ApiResponse({ status: 404, description: 'Quota not found' })
  async resetQuota(
    @Request() req: any,
    @Param('resourceType', new ParseEnumPipe(ResourceType)) resourceType: ResourceType,
    @Query('period', new ParseEnumPipe(QuotaPeriod)) period: QuotaPeriod,
  ): Promise<{ message: string }> {
    const tenantId = req.user.tenantId;
    // TODO: Check admin permissions
    await this.quotasService.resetQuota(tenantId, resourceType, period);
    return { message: 'Quota reset successfully' };
  }

  @Get('alerts')
  @ApiOperation({ summary: 'Get quota alerts' })
  @ApiResponse({ status: 200, description: 'List of quota alerts', type: [QuotaAlertDto] })
  @ApiQuery({ name: 'acknowledged', required: false, type: Boolean })
  async getAlerts(
    @Request() req: any,
    @Query('acknowledged') acknowledged?: string,
  ): Promise<QuotaAlertDto[]> {
    const tenantId = req.user.tenantId;
    const acknowledgedBool = acknowledged === 'true' ? true : acknowledged === 'false' ? false : undefined;
    return this.quotaAlertService.getAlerts(tenantId, acknowledgedBool);
  }

  @Post('alerts/:alertId/acknowledge')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Acknowledge quota alert' })
  @ApiResponse({ status: 200, description: 'Alert acknowledged', type: QuotaAlertDto })
  async acknowledgeAlert(
    @Request() req: any,
    @Param('alertId') alertId: string,
  ): Promise<QuotaAlertDto> {
    const tenantId = req.user.tenantId;
    return this.quotaAlertService.acknowledgeAlert(alertId, tenantId);
  }
}

