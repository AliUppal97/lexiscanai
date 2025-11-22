import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EnhancedJwtAuthGuard } from '../auth/enhanced-auth.guard';
import { FeatureFlagsService } from './feature-flags.service';
import { ABTestService } from './ab-test.service';
import { FeatureFlagsAnalyticsService } from './feature-flags-analytics.service';
import { ABTestAnalysisService } from './ab-test-analysis.service';
import { ABTestEventsService } from './ab-test-events.service';
import {
  CreateFeatureFlagDto,
  UpdateFeatureFlagDto,
  EvaluateFeatureFlagDto,
  CreateABTestDto,
} from './dto';

@ApiTags('Feature Flags')
@ApiBearerAuth()
@Controller('feature-flags')
@UseGuards(EnhancedJwtAuthGuard)
export class FeatureFlagsController {
  constructor(
    private featureFlagsService: FeatureFlagsService,
    private abTestService: ABTestService,
    private analyticsService: FeatureFlagsAnalyticsService,
    private abTestAnalysisService: ABTestAnalysisService,
    private abTestEventsService: ABTestEventsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all feature flags for tenant' })
  @ApiResponse({ status: 200, description: 'List of feature flags' })
  async listFlags(@Request() req: any): Promise<any[]> {
    const tenantId = req.user?.tenantId || null;
    return this.featureFlagsService.getFlagsForTenant(tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Create feature flag' })
  @ApiResponse({ status: 201, description: 'Feature flag created' })
  async createFlag(@Request() req: any, @Body() dto: CreateFeatureFlagDto): Promise<any> {
    const tenantId = req.user?.tenantId || null;
    const userId = req.user?.id;
    return this.featureFlagsService.createFlag(tenantId, userId, dto);
  }

  @Get(':key')
  @ApiOperation({ summary: 'Get feature flag by key' })
  @ApiResponse({ status: 200, description: 'Feature flag details' })
  async getFlag(@Request() req: any, @Param('key') key: string): Promise<any> {
    const tenantId = req.user?.tenantId || null;
    return this.featureFlagsService.evaluateFlag(key, req.user?.id, req.user?.tenantId);
  }

  @Put(':key')
  @ApiOperation({ summary: 'Update feature flag' })
  @ApiResponse({ status: 200, description: 'Feature flag updated' })
  async updateFlag(
    @Request() req: any,
    @Param('key') key: string,
    @Body() dto: UpdateFeatureFlagDto,
  ): Promise<any> {
    const tenantId = req.user?.tenantId || null;
    return this.featureFlagsService.updateFlag(key, tenantId, dto);
  }

  @Delete(':key')
  @ApiOperation({ summary: 'Delete feature flag' })
  @ApiResponse({ status: 200, description: 'Feature flag deleted' })
  async deleteFlag(@Request() req: any, @Param('key') key: string): Promise<void> {
    const tenantId = req.user?.tenantId || null;
    return this.featureFlagsService.deleteFlag(key, tenantId);
  }

  @Post(':key/evaluate')
  @ApiOperation({ summary: 'Evaluate feature flag' })
  @ApiResponse({ status: 200, description: 'Feature flag evaluation result' })
  async evaluateFlag(
    @Request() req: any,
    @Param('key') key: string,
    @Body() dto: EvaluateFeatureFlagDto,
  ): Promise<any> {
    const tenantId = req.user?.tenantId;
    const userId = dto.userId || req.user?.id;
    return this.featureFlagsService.evaluateFlag(key, userId, tenantId, dto.context);
  }

  @Get(':key/analytics')
  @ApiOperation({ summary: 'Get comprehensive feature flag analytics' })
  @ApiResponse({ status: 200, description: 'Feature flag analytics' })
  async getAnalytics(
    @Request() req: any,
    @Param('key') key: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<any> {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    return this.analyticsService.getFlagMetrics(key, start, end);
  }

  @Get(':key/metrics')
  @ApiOperation({ summary: 'Get feature flag metrics' })
  @ApiResponse({ status: 200, description: 'Feature flag metrics' })
  async getMetrics(
    @Request() req: any,
    @Param('key') key: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<any> {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    return this.analyticsService.getFlagMetrics(key, start, end);
  }

  @Get(':key/variants/distribution')
  @ApiOperation({ summary: 'Get variant distribution analysis' })
  @ApiResponse({ status: 200, description: 'Variant distribution' })
  async getVariantDistribution(@Param('key') key: string): Promise<any> {
    return this.analyticsService.getVariantDistribution(key);
  }

  @Get(':key/trends')
  @ApiOperation({ summary: 'Get flag trends over time' })
  @ApiResponse({ status: 200, description: 'Flag trends' })
  async getTrends(
    @Param('key') key: string,
    @Query('period') period?: 'hour' | 'day' | 'week' | 'month',
  ): Promise<any> {
    return this.analyticsService.getFlagTrends(key, period);
  }

  @Get(':key/impact')
  @ApiOperation({ summary: 'Get flag impact analysis' })
  @ApiResponse({ status: 200, description: 'Flag impact metrics' })
  async getImpact(@Param('key') key: string): Promise<any> {
    return this.analyticsService.getFlagImpact(key);
  }

  @Get('analytics/top')
  @ApiOperation({ summary: 'Get top flags by usage' })
  @ApiResponse({ status: 200, description: 'Top flags' })
  async getTopFlags(
    @Request() req: any,
    @Query('limit') limit?: string,
  ): Promise<any[]> {
    const tenantId = req.user?.tenantId || null;
    return this.analyticsService.getTopFlags(tenantId, limit ? parseInt(limit) : 10);
  }

  @Get('analytics/health')
  @ApiOperation({ summary: 'Get flag health scores' })
  @ApiResponse({ status: 200, description: 'Flag health scores' })
  async getHealth(@Query('flagKey') flagKey?: string): Promise<any> {
    if (!flagKey) {
      throw new Error('flagKey query parameter is required');
    }
    return this.analyticsService.getFlagHealth(flagKey);
  }

  @Post('ab-tests')
  @ApiOperation({ summary: 'Create A/B test' })
  @ApiResponse({ status: 201, description: 'A/B test created' })
  async createABTest(@Body() dto: CreateABTestDto): Promise<any> {
    return this.abTestService.createExperiment(dto);
  }

  @Get('ab-tests')
  @ApiOperation({ summary: 'List A/B tests' })
  @ApiResponse({ status: 200, description: 'List of A/B tests' })
  async listABTests(): Promise<any[]> {
    // TODO: Implement list
    return [];
  }

  @Get('ab-tests/:id/results')
  @ApiOperation({ summary: 'Get complete A/B test analysis with statistical significance' })
  @ApiResponse({ status: 200, description: 'Complete A/B test analysis' })
  async getABTestResults(@Param('id') id: string): Promise<any> {
    return this.abTestAnalysisService.analyzeResults(id);
  }

  @Get('ab-tests/:id/variants/:variant/performance')
  @ApiOperation({ summary: 'Get variant performance details' })
  @ApiResponse({ status: 200, description: 'Variant performance metrics' })
  async getVariantPerformance(
    @Param('id') id: string,
    @Param('variant') variant: string,
  ): Promise<any> {
    return this.abTestAnalysisService.getVariantPerformance(id, variant);
  }

  @Get('ab-tests/:id/conversion-funnel')
  @ApiOperation({ summary: 'Get conversion funnel analysis' })
  @ApiResponse({ status: 200, description: 'Conversion funnel metrics' })
  async getConversionFunnel(@Param('id') id: string): Promise<any> {
    return this.abTestAnalysisService.getConversionFunnel(id);
  }

  @Post('ab-tests/:id/events')
  @ApiOperation({ summary: 'Track conversion event (optimized)' })
  @ApiResponse({ status: 201, description: 'Event tracked successfully' })
  async trackEvent(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: { eventType: string; eventValue?: number; metadata?: any },
  ): Promise<any> {
    const userId = req.user?.id || dto.metadata?.userId;
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Get variant assignment
    const variant = await this.abTestService.assignVariant(userId, id);

    // Track event
    return this.abTestEventsService.trackEvent(id, userId, variant, dto.eventType, dto.eventValue, dto.metadata);
  }

  @Get('ab-tests/:id/sample-size')
  @ApiOperation({ summary: 'Calculate required sample size' })
  @ApiResponse({ status: 200, description: 'Sample size calculation' })
  async calculateSampleSize(
    @Param('id') id: string,
    @Query('mde') mde?: string,
    @Query('power') power?: string,
    @Query('alpha') alpha?: string,
  ): Promise<any> {
    return this.abTestAnalysisService.calculateSampleSize(
      id,
      mde ? parseFloat(mde) : undefined,
      power ? parseFloat(power) : undefined,
      alpha ? parseFloat(alpha) : undefined,
    );
  }

  @Get('ab-tests/:id/significance')
  @ApiOperation({ summary: 'Check statistical significance' })
  @ApiResponse({ status: 200, description: 'Statistical significance check' })
  async checkSignificance(@Param('id') id: string): Promise<any> {
    return this.abTestAnalysisService.checkStatisticalSignificance(id);
  }
}

