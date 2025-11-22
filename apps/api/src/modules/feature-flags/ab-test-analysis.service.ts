import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { ABTest } from '@prisma/client';
import { CacheService } from '../../services/cache.service';
import { ABTestEventsService } from './ab-test-events.service';
import { SignificanceCalculator, SignificanceResult } from './statistics/significance-calculator';
import { ConversionCalculator, VariantPerformance } from './statistics/conversion-calculator';
import { SampleSizeCalculator, SampleSizeResult } from './statistics/sample-size-calculator';

@Injectable()
export class ABTestAnalysisService {
  private readonly logger = new Logger(ABTestAnalysisService.name);
  private readonly CACHE_TTL = 300; // 5 minutes

  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
    private eventsService: ABTestEventsService,
  ) {}

  /**
   * Analyze experiment results with complete statistical analysis
   */
  async analyzeResults(experimentId: string): Promise<{
    experimentId: string;
    status: string;
    variants: VariantPerformance[];
    significance: SignificanceResult;
    sampleSize: SampleSizeResult;
    recommendations: string[];
  }> {
    const cacheKey = `ab_analysis:${experimentId}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return cached as any;
    }

    const experiment = await this.prisma.aBTest.findUnique({
      where: { id: experimentId },
    });

    if (!experiment) {
      throw new Error(`Experiment ${experimentId} not found`);
    }

    // Get success metrics configuration
    const successMetrics = (experiment.successMetrics as any) || {};
    const primaryMetric = successMetrics.primary || 'conversion';

    // Get event counts per variant
    const eventCounts = await this.eventsService.getEventCounts(experimentId, primaryMetric);

    if (Object.keys(eventCounts).length < 2) {
      throw new Error('Insufficient data for analysis. Need at least 2 variants with data.');
    }

    // Get control variant (first variant or specified)
    const variants = Object.keys(eventCounts);
    const controlVariant = successMetrics.controlVariant || variants[0];

    // Calculate conversion rates
    const variantPerformance = ConversionCalculator.calculateVariantPerformance(
      eventCounts,
      controlVariant,
    );

    // Calculate statistical significance
    const controlData = eventCounts[controlVariant];
    const testVariants = variants.filter((v) => v !== controlVariant);

    let significance: SignificanceResult | null = null;
    if (testVariants.length > 0) {
      const testVariant = testVariants[0];
      const testData = eventCounts[testVariant];

      // Use Chi-square test for conversion rates
      significance = SignificanceCalculator.chiSquareTest(
        controlData.conversions,
        controlData.visitors,
        testData.conversions,
        testData.visitors,
      );
    }

    // Calculate sample size requirements
    const baselineRate = controlData.conversions / controlData.visitors;
    const sampleSize = SampleSizeCalculator.calculateSampleSize(baselineRate, 0.05, 0.8, 0.05);

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      experiment,
      variantPerformance,
      significance,
      sampleSize,
    );

    const analysis = {
      experimentId,
      status: experiment.status,
      variants: variantPerformance,
      significance,
      sampleSize,
      recommendations,
    };

    await this.cache.set(cacheKey, analysis, this.CACHE_TTL);
    return analysis;
  }

  /**
   * Get variant performance details
   */
  async getVariantPerformance(experimentId: string, variant: string): Promise<VariantPerformance> {
    const analysis = await this.analyzeResults(experimentId);
    const variantData = analysis.variants.find((v) => v.variant === variant);

    if (!variantData) {
      throw new Error(`Variant ${variant} not found in experiment ${experimentId}`);
    }

    return variantData;
  }

  /**
   * Get conversion funnel analysis
   */
  async getConversionFunnel(experimentId: string): Promise<any> {
    const experiment = await this.prisma.aBTest.findUnique({
      where: { id: experimentId },
    });

    if (!experiment) {
      throw new Error(`Experiment ${experimentId} not found`);
    }

    const successMetrics = (experiment.successMetrics as any) || {};
    const funnelSteps = successMetrics.funnelSteps || [];

    // Get events for each step
    const funnelData: Array<{ step: string; visitors: number }> = [];

    for (const step of funnelSteps) {
      const events = await this.eventsService.getEvents(experimentId, {
        eventType: step.eventType,
      });
      const uniqueVisitors = new Set(events.map((e) => e.userId)).size;
      funnelData.push({ step: step.name, visitors: uniqueVisitors });
    }

    return ConversionCalculator.calculateConversionFunnel(funnelData);
  }

  /**
   * Calculate required sample size
   */
  async calculateSampleSize(
    experimentId: string,
    mde: number = 0.05,
    power: number = 0.8,
    alpha: number = 0.05,
  ): Promise<SampleSizeResult> {
    const experiment = await this.prisma.aBTest.findUnique({
      where: { id: experimentId },
    });

    if (!experiment) {
      throw new Error(`Experiment ${experimentId} not found`);
    }

    // Get baseline conversion rate from control variant
    const eventCounts = await this.eventsService.getEventCounts(experimentId, 'conversion');
    const variants = Object.keys(eventCounts);
    const controlVariant = variants[0] || 'control';
    const controlData = eventCounts[controlVariant] || { conversions: 0, visitors: 0 };

    const baselineRate =
      controlData.visitors > 0 ? controlData.conversions / controlData.visitors : 0.01; // Default 1%

    const sampleSize = SampleSizeCalculator.calculateSampleSize(
      baselineRate,
      mde,
      power,
      alpha,
      variants.length,
    );

    return sampleSize;
  }

  /**
   * Check if results are statistically significant
   */
  async checkStatisticalSignificance(experimentId: string): Promise<{
    isSignificant: boolean;
    pValue: number;
    confidenceLevel: number;
  }> {
    const analysis = await this.analyzeResults(experimentId);

    return {
      isSignificant: analysis.significance?.isSignificant || false,
      pValue: analysis.significance?.pValue || 1.0,
      confidenceLevel: 0.95,
    };
  }

  /**
   * Generate recommendations based on analysis
   */
  private generateRecommendations(
    experiment: ABTest,
    variants: VariantPerformance[],
    significance: SignificanceResult | null,
    sampleSize: SampleSizeResult,
  ): string[] {
    const recommendations: string[] = [];

    // Check sample size
    const totalVisitors = variants.reduce((sum, v) => sum + v.metrics.visitors, 0);
    if (totalVisitors < sampleSize.totalRequiredSampleSize) {
      recommendations.push(
        `Insufficient sample size. Need ${sampleSize.totalRequiredSampleSize} visitors, have ${totalVisitors}.`,
      );
    }

    // Check statistical significance
    if (significance && !significance.isSignificant) {
      recommendations.push(
        `Results are not statistically significant (p=${significance.pValue.toFixed(4)}). Continue experiment or increase sample size.`,
      );
    } else if (significance && significance.isSignificant) {
      const winner = variants.find((v) => v.lift && v.lift > 0);
      if (winner) {
        recommendations.push(
          `Variant "${winner.variant}" shows significant improvement (${(winner.lift! * 100).toFixed(2)}% lift). Consider implementing.`,
        );
      }
    }

    // Check experiment duration
    const daysRunning = Math.floor(
      (Date.now() - experiment.startDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (daysRunning < 7) {
      recommendations.push('Experiment has been running for less than a week. Wait for more data.');
    }

    // Check for early winners/losers
    if (significance && significance.isSignificant && daysRunning >= 7) {
      recommendations.push('Results are significant and experiment has run long enough. Consider stopping and implementing winner.');
    }

    return recommendations;
  }
}

