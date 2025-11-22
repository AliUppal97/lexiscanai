/**
 * Sample Size Calculator
 * Calculates required sample size for A/B tests
 */

export interface SampleSizeResult {
  requiredSampleSize: number;
  requiredSampleSizePerVariant: number;
  totalRequiredSampleSize: number;
  estimatedDuration: number; // days
  power: number;
  mde: number; // Minimum Detectable Effect
}

export class SampleSizeCalculator {
  /**
   * Calculate required sample size for A/B test
   * @param baselineConversionRate Baseline conversion rate (0-1)
   * @param mde Minimum Detectable Effect (as decimal, e.g., 0.05 for 5%)
   * @param power Statistical power (default 0.8)
   * @param alpha Significance level (default 0.05)
   * @param variants Number of variants (default 2)
   */
  static calculateSampleSize(
    baselineConversionRate: number,
    mde: number = 0.05,
    power: number = 0.8,
    alpha: number = 0.05,
    variants: number = 2,
  ): SampleSizeResult {
    // Z-scores
    const zAlpha = this.getZScore(alpha / 2); // Two-tailed
    const zBeta = this.getZScore(1 - power);

    // Expected conversion rate for variant
    const expectedConversionRate = baselineConversionRate * (1 + mde);

    // Pooled standard error
    const pooledConversionRate = (baselineConversionRate + expectedConversionRate) / 2;
    const pooledStd = Math.sqrt(
      pooledConversionRate * (1 - pooledConversionRate) * (1 / 1 + 1 / 1), // Equal split
    );

    // Standard errors for each variant
    const stdA = Math.sqrt(
      (baselineConversionRate * (1 - baselineConversionRate)) / 1,
    );
    const stdB = Math.sqrt(
      (expectedConversionRate * (1 - expectedConversionRate)) / 1,
    );

    // Combined standard error
    const combinedStd = Math.sqrt(stdA * stdA + stdB * stdB);

    // Required sample size per variant
    const numerator = Math.pow(zAlpha + zBeta, 2) * (stdA * stdA + stdB * stdB);
    const denominator = Math.pow(expectedConversionRate - baselineConversionRate, 2);
    const requiredSampleSizePerVariant = Math.ceil(numerator / denominator);

    // Total required sample size
    const totalRequiredSampleSize = requiredSampleSizePerVariant * variants;

    return {
      requiredSampleSize: requiredSampleSizePerVariant,
      requiredSampleSizePerVariant,
      totalRequiredSampleSize,
      estimatedDuration: 0, // Will be calculated based on traffic
      power,
      mde,
    };
  }

  /**
   * Estimate test duration based on daily traffic
   */
  static estimateDuration(
    requiredSampleSize: number,
    dailyTraffic: number,
    variants: number = 2,
  ): number {
    const dailyTrafficPerVariant = dailyTraffic / variants;
    if (dailyTrafficPerVariant === 0) return Infinity;

    const days = Math.ceil(requiredSampleSize / dailyTrafficPerVariant);
    return days;
  }

  /**
   * Calculate minimum detectable effect for given sample size
   */
  static calculateMDE(
    baselineConversionRate: number,
    sampleSizePerVariant: number,
    power: number = 0.8,
    alpha: number = 0.05,
  ): number {
    const zAlpha = this.getZScore(alpha / 2);
    const zBeta = this.getZScore(1 - power);

    const stdA = Math.sqrt(
      (baselineConversionRate * (1 - baselineConversionRate)) / sampleSizePerVariant,
    );

    // Solve for MDE
    const margin = (zAlpha + zBeta) * stdA * Math.sqrt(2);
    const mde = margin / baselineConversionRate;

    return mde;
  }

  /**
   * Get Z-score for given probability
   */
  private static getZScore(probability: number): number {
    // Inverse normal CDF approximation
    // For production, use proper statistical library
    if (probability <= 0 || probability >= 1) {
      throw new Error('Probability must be between 0 and 1');
    }

    // Approximation using inverse error function
    const sign = probability < 0.5 ? -1 : 1;
    const p = probability < 0.5 ? probability : 1 - probability;

    // Approximation formula
    const t = Math.sqrt(-2 * Math.log(p));
    const z =
      sign *
      (t -
        (2.515517 + 0.802853 * t + 0.010328 * t * t) /
          (1 + 1.432788 * t + 0.189269 * t * t + 0.001308 * t * t * t));

    return z;
  }
}

