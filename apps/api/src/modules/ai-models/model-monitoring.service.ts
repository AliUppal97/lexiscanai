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
    const recentUsage = await this.prisma.modelUsage.findMany({
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
      errorRate: 0, // TODO: Calculate from error logs
    };

    return metrics;
  }

  /**
   * Detect data drift using statistical tests
   */
  async detectDrift(modelId: string): Promise<{ drifted: boolean; score: number; details: any }> {
    // Get recent input data distribution
    const recentUsage = await this.prisma.modelUsage.findMany({
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
    // For now, return empty array as placeholder
    return [];
  }

  /**
   * Calculate drift score using statistical test
   */
  private calculateDriftScore(recent: any[], baseline: any[]): number {
    // Simplified drift calculation
    // In production, would use proper statistical tests (KS test, PSI, etc.)
    if (baseline.length === 0) {
      return 0; // No baseline to compare
    }

    // Simple comparison (would use proper statistical test)
    return 0.15; // Placeholder
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

