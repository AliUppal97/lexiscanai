/**
 * Conversion Rate Calculator
 * Calculates conversion rates with confidence intervals
 */

export interface ConversionMetrics {
  conversions: number;
  visitors: number;
  conversionRate: number;
  confidenceInterval: [number, number];
  standardError: number;
}

export interface VariantPerformance {
  variant: string;
  metrics: ConversionMetrics;
  lift?: number; // Lift compared to control variant
  liftConfidenceInterval?: [number, number];
}

export class ConversionCalculator {
  /**
   * Calculate conversion rate with confidence interval
   */
  static calculateConversionRate(
    conversions: number,
    visitors: number,
    confidenceLevel: number = 0.95,
  ): ConversionMetrics {
    if (visitors === 0) {
      return {
        conversions: 0,
        visitors: 0,
        conversionRate: 0,
        confidenceInterval: [0, 0],
        standardError: 0,
      };
    }

    const conversionRate = conversions / visitors;

    // Standard error for proportion
    const standardError = Math.sqrt((conversionRate * (1 - conversionRate)) / visitors);

    // Z-score for confidence level
    const zScore = this.getZScore(confidenceLevel);

    // Margin of error
    const margin = zScore * standardError;

    // Confidence interval
    const confidenceInterval: [number, number] = [
      Math.max(0, conversionRate - margin),
      Math.min(1, conversionRate + margin),
    ];

    return {
      conversions,
      visitors,
      conversionRate,
      confidenceInterval,
      standardError,
    };
  }

  /**
   * Calculate conversion rates for multiple variants
   */
  static calculateVariantPerformance(
    variantData: Record<string, { conversions: number; visitors: number }>,
    controlVariant: string,
    confidenceLevel: number = 0.95,
  ): VariantPerformance[] {
    const results: VariantPerformance[] = [];

    // Calculate control metrics
    const controlMetrics = this.calculateConversionRate(
      variantData[controlVariant].conversions,
      variantData[controlVariant].visitors,
      confidenceLevel,
    );

    // Calculate metrics for each variant
    for (const [variant, data] of Object.entries(variantData)) {
      const metrics = this.calculateConversionRate(
        data.conversions,
        data.visitors,
        confidenceLevel,
      );

      // Calculate lift compared to control
      let lift: number | undefined;
      let liftConfidenceInterval: [number, number] | undefined;

      if (variant !== controlVariant && controlMetrics.conversionRate > 0) {
        lift = (metrics.conversionRate - controlMetrics.conversionRate) / controlMetrics.conversionRate;

        // Calculate lift confidence interval
        const liftStdError = Math.sqrt(
          Math.pow(metrics.standardError / metrics.conversionRate, 2) +
            Math.pow(controlMetrics.standardError / controlMetrics.conversionRate, 2),
        );
        const zScore = this.getZScore(confidenceLevel);
        const liftMargin = zScore * liftStdError * Math.abs(lift);
        liftConfidenceInterval = [lift - liftMargin, lift + liftMargin];
      }

      results.push({
        variant,
        metrics,
        lift,
        liftConfidenceInterval,
      });
    }

    return results;
  }

  /**
   * Calculate conversion funnel metrics
   */
  static calculateConversionFunnel(
    funnelSteps: Array<{ step: string; visitors: number }>,
  ): Array<{ step: string; visitors: number; conversionRate: number; dropOffRate: number }> {
    if (funnelSteps.length === 0) return [];

    const baseVisitors = funnelSteps[0].visitors;
    const results = [];

    for (let i = 0; i < funnelSteps.length; i++) {
      const step = funnelSteps[i];
      const conversionRate = baseVisitors > 0 ? step.visitors / baseVisitors : 0;
      const previousVisitors = i > 0 ? funnelSteps[i - 1].visitors : baseVisitors;
      const dropOffRate =
        previousVisitors > 0 ? (previousVisitors - step.visitors) / previousVisitors : 0;

      results.push({
        step: step.step,
        visitors: step.visitors,
        conversionRate,
        dropOffRate,
      });
    }

    return results;
  }

  /**
   * Get Z-score for confidence level
   */
  private static getZScore(confidenceLevel: number): number {
    // Common confidence levels
    const zScores: Record<number, number> = {
      0.90: 1.645,
      0.95: 1.96,
      0.99: 2.576,
    };

    return zScores[confidenceLevel] || 1.96; // Default to 95%
  }
}

