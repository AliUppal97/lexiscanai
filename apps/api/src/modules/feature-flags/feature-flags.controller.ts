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
  @ApiOperation({ summary: 'Get feature flag analytics' })
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
  @ApiOperation({ summary: 'Get A/B test results' })
  @ApiResponse({ status: 200, description: 'A/B test results' })
  async getABTestResults(@Param('id') id: string): Promise<any> {
    return this.abTestService.analyzeResults(id);
  }
}

