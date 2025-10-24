import { Controller, Get, Post, Query, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth.guard';
import { TenantId, UserId } from '../auth/auth.service';
import { AnalyticsService } from '../../services/analytics.service';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Post('track')
  async trackEvent(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Body()
    body: {
      event: string;
      category: string;
      properties?: Record<string, any>;
      metadata?: Record<string, any>;
    },
  ) {
    await this.analyticsService.track({
      tenantId,
      userId,
      ...body,
    });
    return { success: true };
  }

  @Get('metrics')
  async getMetrics(
    @TenantId() tenantId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getMetrics(
      tenantId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('realtime')
  async getRealTimeMetrics(@TenantId() tenantId: string) {
    return this.analyticsService.getRealTimeMetrics(tenantId);
  }

  @Get('time-series')
  async getTimeSeries(
    @TenantId() tenantId: string,
    @Query('event') event: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('interval') interval?: 'hour' | 'day' | 'week' | 'month',
  ) {
    return this.analyticsService.getTimeSeries(
      tenantId,
      event,
      new Date(startDate),
      new Date(endDate),
      interval || 'day',
    );
  }

  @Get('funnel')
  async getFunnelAnalytics(
    @TenantId() tenantId: string,
    @Query('steps') steps: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getFunnelAnalytics(
      tenantId,
      steps.split(','),
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('cohort')
  async getCohortAnalytics(
    @TenantId() tenantId: string,
    @Query('cohortDate') cohortDate: string,
    @Query('retentionPeriods') retentionPeriods?: string,
  ) {
    return this.analyticsService.getCohortAnalytics(
      tenantId,
      new Date(cohortDate),
      retentionPeriods ? parseInt(retentionPeriods) : undefined,
    );
  }

  @Get('feature-usage')
  async getFeatureUsage(
    @TenantId() tenantId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getFeatureUsage(
      tenantId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('api-usage')
  async getAPIUsage(
    @TenantId() tenantId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getAPIUsage(
      tenantId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('export')
  async exportData(
    @TenantId() tenantId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('format') format?: 'json' | 'csv',
  ) {
    return this.analyticsService.exportData(
      tenantId,
      new Date(startDate),
      new Date(endDate),
      format || 'json',
    );
  }
}

