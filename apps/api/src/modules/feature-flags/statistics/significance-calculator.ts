/**
 * Statistical Significance Calculator
 * Implements Chi-square test, t-test, and Bayesian analysis for A/B testing
 */

export interface SignificanceResult {
  pValue: number;
  isSignificant: boolean;
  confidenceInterval: [number, number];
  effectSize: number;
  method: 'chi-square' | 't-test' | 'bayesian';
}

export class SignificanceCalculator {
  /**
   * Chi-square test for conversion rates
   * Tests if there's a significant difference between two conversion rates
   */
  static chiSquareTest(
    variantAConversions: number,
    variantAVisitors: number,
    variantBConversions: number,
    variantBVisitors: number,
  ): SignificanceResult {
    const conversionRateA = variantAConversions / variantAVisitors;
    const conversionRateB = variantBConversions / variantBVisitors;

    // Calculate expected values
    const totalConversions = variantAConversions + variantBConversions;
    const totalVisitors = variantAVisitors + variantBVisitors;
    const expectedConversionRate = totalConversions / totalVisitors;

    const expectedA = variantAVisitors * expectedConversionRate;
    const expectedB = variantBVisitors * expectedConversionRate;
    const expectedANon = variantAVisitors * (1 - expectedConversionRate);
    const expectedBNon = variantBVisitors * (1 - expectedConversionRate);

    // Calculate chi-square statistic
    const chiSquare =
      Math.pow(variantAConversions - expectedA, 2) / expectedA +
      Math.pow(variantBConversions - expectedB, 2) / expectedB +
      Math.pow(variantAVisitors - variantAConversions - expectedANon, 2) / expectedANon +
      Math.pow(variantBVisitors - variantBConversions - expectedBNon, 2) / expectedBNon;

    // Degrees of freedom = 1 (2x2 contingency table)
    const pValue = this.chiSquarePValue(chiSquare, 1);
    const isSignificant = pValue < 0.05;

    // Calculate effect size (relative lift)
    const effectSize = (conversionRateB - conversionRateA) / conversionRateA;

    // Calculate 95% confidence interval for difference
    const se = Math.sqrt(
      (conversionRateA * (1 - conversionRateA)) / variantAVisitors +
        (conversionRateB * (1 - conversionRateB)) / variantBVisitors,
    );
    const zScore = 1.96; // 95% confidence
    const diff = conversionRateB - conversionRateA;
    const margin = zScore * se;
    const confidenceInterval: [number, number] = [diff - margin, diff + margin];

    return {
      pValue,
      isSignificant,
      confidenceInterval,
      effectSize,
      method: 'chi-square',
    };
  }

  /**
   * T-test for continuous metrics (e.g., revenue, engagement time)
   */
  static tTest(
    variantAValues: number[],
    variantBValues: number[],
  ): SignificanceResult {
    const meanA = this.mean(variantAValues);
    const meanB = this.mean(variantBValues);
    const stdA = this.standardDeviation(variantAValues);
    const stdB = this.standardDeviation(variantBValues);
    const nA = variantAValues.length;
    const nB = variantBValues.length;

    // Pooled standard error
    const pooledStd = Math.sqrt(
      ((nA - 1) * stdA * stdA + (nB - 1) * stdB * stdB) / (nA + nB - 2),
    );
    const se = pooledStd * Math.sqrt(1 / nA + 1 / nB);

    // T-statistic
    const tStat = (meanB - meanA) / se;
    const degreesOfFreedom = nA + nB - 2;

    // P-value (two-tailed)
    const pValue = this.tTestPValue(Math.abs(tStat), degreesOfFreedom);
    const isSignificant = pValue < 0.05;

    // Effect size (Cohen's d)
    const effectSize = (meanB - meanA) / pooledStd;

    // 95% confidence interval
    const tCritical = this.tCriticalValue(degreesOfFreedom, 0.05);
    const margin = tCritical * se;
    const diff = meanB - meanA;
    const confidenceInterval: [number, number] = [diff - margin, diff + margin];

    return {
      pValue,
      isSignificant,
      confidenceInterval,
      effectSize,
      method: 't-test',
    };
  }

  /**
   * Bayesian analysis (simplified)
   * Returns probability that variant B is better than variant A
   */
  static bayesianAnalysis(
    variantAConversions: number,
    variantAVisitors: number,
    variantBConversions: number,
    variantBVisitors: number,
  ): SignificanceResult {
    // Beta distribution parameters (Beta-Binomial conjugate prior)
    const alphaA = variantAConversions + 1; // Prior: Beta(1, 1) = uniform
    const betaA = variantAVisitors - variantAConversions + 1;
    const alphaB = variantBConversions + 1;
    const betaB = variantBVisitors - variantBConversions + 1;

    // Monte Carlo simulation to estimate P(B > A)
    let wins = 0;
    const simulations = 10000;
    for (let i = 0; i < simulations; i++) {
      const sampleA = this.betaRandom(alphaA, betaA);
      const sampleB = this.betaRandom(alphaB, betaB);
      if (sampleB > sampleA) wins++;
    }

    const probabilityBBetter = wins / simulations;
    const isSignificant = probabilityBBetter > 0.95 || probabilityBBetter < 0.05;

    // Effect size
    const conversionRateA = variantAConversions / variantAVisitors;
    const conversionRateB = variantBConversions / variantBVisitors;
    const effectSize = (conversionRateB - conversionRateA) / conversionRateA;

    // Confidence interval (using Beta distribution percentiles)
    const se = Math.sqrt(
      (conversionRateA * (1 - conversionRateA)) / variantAVisitors +
        (conversionRateB * (1 - conversionRateB)) / variantBVisitors,
    );
    const diff = conversionRateB - conversionRateA;
    const margin = 1.96 * se;
    const confidenceInterval: [number, number] = [diff - margin, diff + margin];

    return {
      pValue: 1 - probabilityBBetter, // Convert to p-value-like metric
      isSignificant,
      confidenceInterval,
      effectSize,
      method: 'bayesian',
    };
  }

  /**
   * Calculate p-value from chi-square statistic
   */
  private static chiSquarePValue(chiSquare: number, degreesOfFreedom: number): number {
    // Simplified approximation using normal distribution for large samples
    // For production, use proper chi-square distribution
    if (degreesOfFreedom === 1) {
      const z = Math.sqrt(chiSquare);
      return 2 * (1 - this.normalCDF(Math.abs(z)));
    }
    return 0.05; // Placeholder
  }

  /**
   * Calculate p-value from t-statistic
   */
  private static tTestPValue(tStat: number, degreesOfFreedom: number): number {
    // Simplified approximation
    // For production, use proper t-distribution
    if (degreesOfFreedom > 30) {
      return 2 * (1 - this.normalCDF(Math.abs(tStat)));
    }
    // Use t-distribution approximation
    return 2 * (1 - this.tCDF(Math.abs(tStat), degreesOfFreedom));
  }

  /**
   * Normal CDF approximation
   */
  private static normalCDF(x: number): number {
    return 0.5 * (1 + this.erf(x / Math.sqrt(2)));
  }

  /**
   * Error function approximation
   */
  private static erf(x: number): number {
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - ((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
  }

  /**
   * T-distribution CDF approximation
   */
  private static tCDF(t: number, df: number): number {
    // Simplified approximation
    // For production, use proper t-distribution library
    if (df > 30) {
      return this.normalCDF(t);
    }
    // Approximation for small degrees of freedom
    return 0.5 + (t / Math.sqrt(df + t * t)) * 0.5;
  }

  /**
   * T-critical value (two-tailed, alpha=0.05)
   */
  private static tCriticalValue(df: number, alpha: number): number {
    // Simplified - for production use proper t-distribution table
    if (df >= 30) return 1.96;
    if (df >= 20) return 2.086;
    if (df >= 10) return 2.228;
    return 2.262;
  }

  /**
   * Beta random variate generation (for Bayesian analysis)
   */
  private static betaRandom(alpha: number, beta: number): number {
    // Simplified - for production use proper Beta distribution library
    const gamma1 = this.gammaRandom(alpha);
    const gamma2 = this.gammaRandom(beta);
    return gamma1 / (gamma1 + gamma2);
  }

  /**
   * Gamma random variate (simplified)
   */
  private static gammaRandom(shape: number): number {
    // Simplified - for production use proper Gamma distribution
    let sum = 0;
    for (let i = 0; i < shape; i++) {
      sum -= Math.log(Math.random());
    }
    return sum;
  }

  /**
   * Calculate mean
   */
  private static mean(values: number[]): number {
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  /**
   * Calculate standard deviation
   */
  private static standardDeviation(values: number[]): number {
    const mean = this.mean(values);
    const variance =
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }
}

