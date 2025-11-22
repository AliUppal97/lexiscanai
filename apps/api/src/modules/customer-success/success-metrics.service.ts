import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { SuccessMetric, SuccessMetricType } from '@prisma/client';

@Injectable()
export class SuccessMetricsService {
  private readonly logger = new Logger(SuccessMetricsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Track success metric
   */
  async trackMetric(
    tenantId: string,
    metricType: SuccessMetricType,
    value: number,
  ): Promise<SuccessMetric> {
    const period = this.getCurrentPeriod(); // YYYY-MM

    const metric = await this.prisma.successMetric.upsert({
      where: {
        tenantId_metricType_period: {
          tenantId,
          metricType,
          period,
        },
      },
      update: {
        value,
        recordedAt: new Date(),
      },
      create: {
        tenantId,
        metricType,
        value,
        period,
      },
    });

    return metric;
  }

  /**
   * Get metrics for period
   */
  async getMetrics(tenantId: string, period?: string): Promise<SuccessMetric[]> {
    const where: any = { tenantId };
    if (period) {
      where.period = period;
    } else {
      where.period = this.getCurrentPeriod();
    }

    return this.prisma.successMetric.findMany({
      where,
    });
  }

  /**
   * Get metric trend
   */
  async getMetricTrend(tenantId: string, metricType: SuccessMetricType): Promise<any> {
    const metrics = await this.prisma.successMetric.findMany({
      where: {
        tenantId,
        metricType,
      },
      orderBy: { period: 'asc' },
      take: 12, // Last 12 months
    });

    return {
      metricType,
      values: metrics.map((m) => ({ period: m.period, value: m.value })),
      trend: this.calculateTrend(metrics.map((m) => m.value)),
    };
  }

  /**
   * Get current period (YYYY-MM)
   */
  private getCurrentPeriod(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  /**
   * Calculate trend (increasing, decreasing, stable)
   */
  private calculateTrend(values: number[]): string {
    if (values.length < 2) {
      return 'stable';
    }

    const first = values[0];
    const last = values[values.length - 1];

    if (last > first * 1.1) {
      return 'increasing';
    } else if (last < first * 0.9) {
      return 'decreasing';
    } else {
      return 'stable';
    }
  }
}

