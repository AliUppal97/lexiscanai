import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class FeatureFlagsAnalyticsService {
  private readonly logger = new Logger(FeatureFlagsAnalyticsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Get flag usage metrics
   */
  async getFlagMetrics(flagKey: string, startDate: Date, endDate: Date): Promise<any> {
    const evaluations = await this.prisma.featureFlagEvaluation.findMany({
      where: {
        flagKey,
        evaluatedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const total = evaluations.length;
    const enabled = evaluations.filter((e) => e.variantId !== null).length;
    const disabled = total - enabled;

    // Group by variant
    const variantCounts: Record<string, number> = {};
    for (const eval_ of evaluations) {
      if (eval_.variantId) {
        variantCounts[eval_.variantId] = (variantCounts[eval_.variantId] || 0) + 1;
      }
    }

    return {
      flagKey,
      period: { startDate, endDate },
      total,
      enabled,
      disabled,
      enabledPercentage: total > 0 ? (enabled / total) * 100 : 0,
      variantDistribution: variantCounts,
    };
  }

  /**
   * Get variant distribution
   */
  async getVariantDistribution(flagKey: string): Promise<any> {
    const evaluations = await this.prisma.featureFlagEvaluation.findMany({
      where: { flagKey },
      include: { variant: true },
    });

    const distribution: Record<string, number> = {};
    for (const eval_ of evaluations) {
      const variantName = eval_.variant?.name || 'default';
      distribution[variantName] = (distribution[variantName] || 0) + 1;
    }

    return {
      flagKey,
      distribution,
      total: evaluations.length,
    };
  }

  /**
   * Get A/B test conversion rates
   */
  async getConversionRates(experimentId: string): Promise<any> {
    // TODO: Implement conversion rate calculation
    return {
      experimentId,
      message: 'Conversion rates not yet implemented',
    };
  }
}

