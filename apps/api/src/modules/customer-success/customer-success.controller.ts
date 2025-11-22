import { Controller, Get, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EnhancedJwtAuthGuard } from '../auth/enhanced-auth.guard';
import { CustomerHealthService } from './customer-health.service';
import { ChurnPredictionService } from './churn-prediction.service';
import { SuccessMetricsService } from './success-metrics.service';
import { CustomerPlaybookService } from './customer-playbook.service';
import { CustomerJourneyService } from './customer-journey.service';

@ApiTags('Customer Success')
@ApiBearerAuth()
@Controller('customer-success')
@UseGuards(EnhancedJwtAuthGuard)
export class CustomerSuccessController {
  constructor(
    private healthService: CustomerHealthService,
    private churnService: ChurnPredictionService,
    private metricsService: SuccessMetricsService,
    private playbookService: CustomerPlaybookService,
    private journeyService: CustomerJourneyService,
  ) {}

  @Get('health/:tenantId')
  @ApiOperation({ summary: 'Get customer health score' })
  async getHealthScore(@Param('tenantId') tenantId: string): Promise<any> {
    return this.healthService.getHealthScore(tenantId);
  }

  @Post('health/:tenantId/calculate')
  @ApiOperation({ summary: 'Calculate customer health score' })
  async calculateHealthScore(@Param('tenantId') tenantId: string): Promise<any> {
    return this.healthService.calculateHealthScore(tenantId);
  }

  @Get('churn/:tenantId')
  @ApiOperation({ summary: 'Get churn prediction' })
  async getChurnPrediction(@Param('tenantId') tenantId: string): Promise<any> {
    return this.churnService.predictChurn(tenantId);
  }

  @Get('metrics/:tenantId')
  @ApiOperation({ summary: 'Get success metrics' })
  async getMetrics(@Param('tenantId') tenantId: string, @Body() period?: string): Promise<any[]> {
    return this.metricsService.getMetrics(tenantId, period);
  }

  @Post('playbooks')
  @ApiOperation({ summary: 'Create customer playbook' })
  async createPlaybook(@Request() req: any, @Body() dto: any): Promise<any> {
    const tenantId = req.user?.tenantId || null;
    return this.playbookService.createPlaybook(tenantId, dto);
  }

  @Get('journey/:tenantId')
  @ApiOperation({ summary: 'Get customer journey' })
  async getJourney(@Param('tenantId') tenantId: string): Promise<any[]> {
    return this.journeyService.getJourney(tenantId);
  }

  @Get('engagement/:tenantId')
  @ApiOperation({ summary: 'Get engagement score' })
  async getEngagement(@Param('tenantId') tenantId: string): Promise<any> {
    // TODO: Implement engagement score
    return { score: 75 };
  }
}

