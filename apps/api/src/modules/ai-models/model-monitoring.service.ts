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
   * Detect data drift
   */
  async detectDrift(modelId: string): Promise<{ drifted: boolean; score: number }> {
    // TODO: Implement data drift detection using statistical tests
    // For now, return no drift
    return { drifted: false, score: 0.1 };
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

