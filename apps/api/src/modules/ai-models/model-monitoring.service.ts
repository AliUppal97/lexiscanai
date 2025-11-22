import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class ModelMonitoringService {
  private readonly logger = new Logger(ModelMonitoringService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Monitor model performance
   */
  async monitorPerformance(modelId: string): Promise<any> {
    const recentUsage = await (this.prisma as any).modelUsage.findMany({
      where: {
        modelId,
        timestamp: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
    });

    const metrics = {
      totalRequests: recentUsage.length,
      averageLatency: this.calculateAverage(recentUsage.map((u) => u.latency)),
      p95Latency: this.calculatePercentile(recentUsage.map((u) => u.latency), 95),
      p99Latency: this.calculatePercentile(recentUsage.map((u) => u.latency), 99),
      totalCost: recentUsage.reduce((sum, u) => sum + u.cost, 0),
      errorRate: this.calculateErrorRate(recentUsage),
    };

    return metrics;
  }

  /**
   * Detect data drift using statistical tests
   */
  async detectDrift(modelId: string): Promise<{ drifted: boolean; score: number; details: any }> {
    // Get recent input data distribution
    const recentUsage = await (this.prisma as any).modelUsage.findMany({
      where: {
        modelId,
        timestamp: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
      take: 1000,
    });

    if (recentUsage.length < 100) {
      return { drifted: false, score: 0, details: { reason: 'Insufficient data' } };
    }

    // Extract input features (simplified - would use actual feature extraction)
    const recentInputs = recentUsage.map((u) => (u.input as any) || {});
    const baselineInputs = await this.getBaselineInputs(modelId);

    // Calculate drift score using Kolmogorov-Smirnov test or similar
    const driftScore = this.calculateDriftScore(recentInputs, baselineInputs);

    // Threshold: score > 0.3 indicates drift
    const drifted = driftScore > 0.3;

    return {
      drifted,
      score: driftScore,
      details: {
        method: 'kolmogorov_smirnov',
        threshold: 0.3,
        sampleSize: recentUsage.length,
      },
    };
  }

  /**
   * Get baseline input distribution
   */
  private async getBaselineInputs(modelId: string): Promise<any[]> {
    // Get inputs from training data or historical production data
    // Use first 1000 production inputs as baseline (from first week of deployment)
    const model = await (this.prisma as any).aIModel.findUnique({
      where: { id: modelId },
      include: {
        deployments: {
          where: {
            environment: 'PRODUCTION',
            status: 'ACTIVE',
          },
          orderBy: { deployedAt: 'asc' },
          take: 1,
        },
      },
    });

    if (!model || model.deployments.length === 0) {
      return [];
    }

    const deployment = model.deployments[0];
    const baselineStartDate = deployment.deployedAt || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const baselineEndDate = new Date(baselineStartDate.getTime() + 7 * 24 * 60 * 60 * 1000); // First week

    const baselineUsage = await (this.prisma as any).modelUsage.findMany({
      where: {
        modelId,
        timestamp: {
          gte: baselineStartDate,
          lte: baselineEndDate,
        },
      },
      take: 1000,
      select: {
        input: true,
      },
    });

    return baselineUsage.map((u) => u.input as any).filter(Boolean);
  }

  /**
   * Calculate drift score using statistical test (Kolmogorov-Smirnov test)
   */
  private calculateDriftScore(recent: any[], baseline: any[]): number {
    if (baseline.length === 0 || recent.length === 0) {
      return 0; // No baseline or recent data to compare
    }

    // Extract numeric features from inputs (simplified - would use proper feature extraction)
    const recentFeatures = this.extractNumericFeatures(recent);
    const baselineFeatures = this.extractNumericFeatures(baseline);

    if (recentFeatures.length === 0 || baselineFeatures.length === 0) {
      return 0;
    }

    // Calculate Kolmogorov-Smirnov statistic for each feature
    const ksScores: number[] = [];
    
    // Get unique feature keys
    const featureKeys = new Set([
      ...Object.keys(recentFeatures[0] || {}),
      ...Object.keys(baselineFeatures[0] || {}),
    ]);

    for (const key of featureKeys) {
      const recentValues = recentFeatures.map((f) => f[key]).filter((v) => typeof v === 'number');
      const baselineValues = baselineFeatures.map((f) => f[key]).filter((v) => typeof v === 'number');

      if (recentValues.length > 0 && baselineValues.length > 0) {
        const ks = this.kolmogorovSmirnovTest(recentValues, baselineValues);
        ksScores.push(ks);
      }
    }

    // Return maximum KS score (worst drift)
    return ksScores.length > 0 ? Math.max(...ksScores) : 0;
  }

  /**
   * Extract numeric features from input data
   */
  private extractNumericFeatures(inputs: any[]): Array<Record<string, number>> {
    return inputs.map((input) => {
      const features: Record<string, number> = {};
      
      // Extract numeric values (simplified - would use proper feature engineering)
      if (typeof input === 'object' && input !== null) {
        for (const [key, value] of Object.entries(input)) {
          if (typeof value === 'number') {
            features[key] = value;
          } else if (typeof value === 'string' && !isNaN(Number(value))) {
            features[key] = Number(value);
          } else if (Array.isArray(value)) {
            features[`${key}_length`] = value.length;
          }
        }
      }
      
      return features;
    });
  }

  /**
   * Kolmogorov-Smirnov test for two samples
   */
  private kolmogorovSmirnovTest(sample1: number[], sample2: number[]): number {
    // Sort samples
    const sorted1 = [...sample1].sort((a, b) => a - b);
    const sorted2 = [...sample2].sort((a, b) => a - b);

    // Calculate empirical CDFs
    const n1 = sorted1.length;
    const n2 = sorted2.length;
    const allValues = [...new Set([...sorted1, ...sorted2])].sort((a, b) => a - b);

    let maxDiff = 0;

    for (const value of allValues) {
      const cdf1 = sorted1.filter((v) => v <= value).length / n1;
      const cdf2 = sorted2.filter((v) => v <= value).length / n2;
      const diff = Math.abs(cdf1 - cdf2);
      maxDiff = Math.max(maxDiff, diff);
    }

    return maxDiff; // KS statistic (0-1, higher = more drift)
  }

  /**
   * Calculate error rate from usage records
   */
  private calculateErrorRate(usage: any[]): number {
    if (usage.length === 0) {
      return 0;
    }

    const errorCount = usage.filter((u) => {
      const output = u.output as any;
      return output?.error || output?.status === 'error' || output?.success === false;
    }).length;

    return errorCount / usage.length;
  }

  /**
   * Detect model anomalies
   */
  async detectAnomalies(modelId: string): Promise<Array<{ type: string; severity: string; message: string }>> {
    const metrics = await this.monitorPerformance(modelId);
    const anomalies: Array<{ type: string; severity: string; message: string }> = [];

    // Check latency anomalies
    if (metrics.averageLatency > 1000) {
      anomalies.push({
        type: 'HIGH_LATENCY',
        severity: 'HIGH',
        message: `Average latency (${metrics.averageLatency}ms) exceeds threshold (1000ms)`,
      });
    }

    // Check error rate anomalies
    if (metrics.errorRate > 0.05) {
      anomalies.push({
        type: 'HIGH_ERROR_RATE',
        severity: 'CRITICAL',
        message: `Error rate (${(metrics.errorRate * 100).toFixed(2)}%) exceeds threshold (5%)`,
      });
    }

    // Check request volume anomalies
    const expectedRequests = 1000; // Would calculate from historical data
    if (metrics.totalRequests < expectedRequests * 0.5) {
      anomalies.push({
        type: 'LOW_TRAFFIC',
        severity: 'MEDIUM',
        message: `Request volume (${metrics.totalRequests}) is significantly lower than expected`,
      });
    }

    return anomalies;
  }

  /**
   * Alert on anomaly
   */
  async alertOnAnomaly(modelId: string): Promise<void> {
    const metrics = await this.monitorPerformance(modelId);

    // Check for anomalies
    if (metrics.averageLatency > 1000) {
      this.logger.warn(`High latency detected for model ${modelId}: ${metrics.averageLatency}ms`);
    }

    if (metrics.errorRate > 0.05) {
      this.logger.error(`High error rate detected for model ${modelId}: ${metrics.errorRate * 100}%`);
    }
  }

  /**
   * Calculate average
   */
  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, v) => sum + v, 0) / values.length;
  }

  /**
   * Calculate percentile
   */
  private calculatePercentile(values: number[], percentile: number): number {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }
}

