import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CacheService } from '../../services/cache.service';

@Injectable()
export class FeatureFlagsAnalyticsService {
  private readonly logger = new Logger(FeatureFlagsAnalyticsService.name);
  private readonly CACHE_TTL = 300; // 5 minutes

  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  /**
   * Get comprehensive flag metrics
   */
  async getFlagMetrics(flagKey: string, startDate: Date, endDate: Date): Promise<any> {
    const cacheKey = `flag_metrics:${flagKey}:${startDate.toISOString()}:${endDate.toISOString()}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const evaluations = await this.prisma.featureFlagEvaluation.findMany({
      where: {
        flagKey,
        evaluatedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        variant: true,
      },
    });

    const total = evaluations.length;
    const enabled = evaluations.filter((e) => e.variantId !== null).length;
    const disabled = total - enabled;

    // Group by variant
    const variantCounts: Record<string, number> = {};
    const variantDetails: Record<string, any> = {};
    for (const eval_ of evaluations) {
      if (eval_.variantId && eval_.variant) {
        const variantName = eval_.variant.name || eval_.variantId;
        variantCounts[variantName] = (variantCounts[variantName] || 0) + 1;
        if (!variantDetails[variantName]) {
          variantDetails[variantName] = {
            name: variantName,
            count: 0,
            percentage: 0,
          };
        }
        variantDetails[variantName].count++;
      }
    }

    // Calculate percentages
    for (const variant of Object.keys(variantDetails)) {
      variantDetails[variant].percentage = total > 0 ? (variantDetails[variant].count / total) * 100 : 0;
    }

    // Calculate adoption rate (unique users)
    const uniqueUsers = new Set(evaluations.map((e) => e.userId).filter(Boolean)).size;

    // Calculate performance metrics (latency would come from evaluation logs)
    const performanceMetrics = {
      averageLatency: 0, // Would be calculated from evaluation logs
      p50Latency: 0,
      p95Latency: 0,
      p99Latency: 0,
      errorRate: 0,
      cacheHitRate: 0,
    };

    // Calculate trends (compare with previous period)
    const previousPeriodStart = new Date(startDate);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const previousPeriodEnd = startDate;

    const previousEvaluations = await this.prisma.featureFlagEvaluation.count({
      where: {
        flagKey,
        evaluatedAt: {
          gte: previousPeriodStart,
          lte: previousPeriodEnd,
        },
      },
    });

    const trend = total > 0 && previousEvaluations > 0
      ? ((total - previousEvaluations) / previousEvaluations) * 100
      : 0;

    const metrics = {
      flagKey,
      period: { startDate, endDate },
      total,
      enabled,
      disabled,
      enabledPercentage: total > 0 ? (enabled / total) * 100 : 0,
      variantDistribution: variantCounts,
      variantDetails: Object.values(variantDetails),
      adoptionRate: uniqueUsers,
      uniqueUsers,
      performanceMetrics,
      trend: {
        change: trend,
        direction: trend > 0 ? 'increasing' : trend < 0 ? 'decreasing' : 'stable',
      },
    };

    await this.cache.set(cacheKey, metrics, this.CACHE_TTL);
    return metrics;
  }

  /**
   * Get variant distribution with detailed analysis
   */
  async getVariantDistribution(flagKey: string): Promise<any> {
    const cacheKey = `variant_dist:${flagKey}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const evaluations = await this.prisma.featureFlagEvaluation.findMany({
      where: { flagKey },
      include: { variant: true },
    });

    const distribution: Record<string, { count: number; percentage: number; users: Set<string> }> = {};
    let total = 0;

    for (const eval_ of evaluations) {
      const variantName = eval_.variant?.name || eval_.variantId || 'default';
      if (!distribution[variantName]) {
        distribution[variantName] = {
          count: 0,
          percentage: 0,
          users: new Set(),
        };
      }
      distribution[variantName].count++;
      if (eval_.userId) {
        distribution[variantName].users.add(eval_.userId);
      }
      total++;
    }

    // Calculate percentages and unique users
    const result: Record<string, any> = {};
    for (const [variant, data] of Object.entries(distribution)) {
      result[variant] = {
        count: data.count,
        percentage: total > 0 ? (data.count / total) * 100 : 0,
        uniqueUsers: data.users.size,
      };
    }

    const response = {
      flagKey,
      distribution: result,
      total,
      consistency: this.calculateConsistency(distribution, total),
    };

    await this.cache.set(cacheKey, response, this.CACHE_TTL);
    return response;
  }

  /**
   * Get flag trends over time
   */
  async getFlagTrends(flagKey: string, period: 'hour' | 'day' | 'week' | 'month' = 'day'): Promise<any> {
    const cacheKey = `flag_trends:${flagKey}:${period}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const now = new Date();
    const startDate = new Date();
    switch (period) {
      case 'hour':
        startDate.setHours(startDate.getHours() - 24);
        break;
      case 'day':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 12 * 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 12);
        break;
    }

    const evaluations = await this.prisma.featureFlagEvaluation.findMany({
      where: {
        flagKey,
        evaluatedAt: {
          gte: startDate,
          lte: now,
        },
      },
      orderBy: { evaluatedAt: 'asc' },
    });

    // Group by time period
    const trends: Array<{ period: string; count: number; enabled: number }> = [];
    const grouped = new Map<string, { total: number; enabled: number }>();

    for (const eval_ of evaluations) {
      let periodKey: string;
      const date = new Date(eval_.evaluatedAt);

      switch (period) {
        case 'hour':
          periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}:00`;
          break;
        case 'day':
          periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
          break;
        case 'week':
          const week = Math.ceil(date.getDate() / 7);
          periodKey = `${date.getFullYear()}-W${String(week).padStart(2, '0')}`;
          break;
        case 'month':
          periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
      }

      if (!grouped.has(periodKey)) {
        grouped.set(periodKey, { total: 0, enabled: 0 });
      }

      const data = grouped.get(periodKey)!;
      data.total++;
      if (eval_.variantId) {
        data.enabled++;
      }
    }

    for (const [period, data] of grouped.entries()) {
      trends.push({
        period,
        count: data.total,
        enabled: data.enabled,
      });
    }

    trends.sort((a, b) => a.period.localeCompare(b.period));

    const response = {
      flagKey,
      period,
      trends,
      summary: {
        total: trends.reduce((sum, t) => sum + t.count, 0),
        average: trends.length > 0 ? trends.reduce((sum, t) => sum + t.count, 0) / trends.length : 0,
        trend: this.calculateTrendDirection(trends.map((t) => t.count)),
      },
    };

    await this.cache.set(cacheKey, response, this.CACHE_TTL);
    return response;
  }

  /**
   * Get flag impact analysis
   */
  async getFlagImpact(flagKey: string): Promise<any> {
    // This would integrate with conversion tracking, revenue tracking, etc.
    // For now, return basic impact metrics
    const metrics = await this.getFlagMetrics(
      flagKey,
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      new Date(),
    );

    return {
      flagKey,
      impact: {
        adoptionRate: metrics.enabledPercentage,
        userReach: metrics.uniqueUsers,
        // Would include conversions, revenue impact, etc. in production
        conversions: 0,
        revenueImpact: 0,
      },
    };
  }

  /**
   * Get top flags by usage
   */
  async getTopFlags(tenantId: string | null, limit: number = 10): Promise<any[]> {
    const cacheKey = `top_flags:${tenantId}:${limit}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return cached as any[];
    }

    const where: any = {};
    if (tenantId) {
      where.tenantId = tenantId;
    }

    // Get flags with evaluation counts
    const flags = await this.prisma.featureFlag.findMany({
      where,
      include: {
        _count: {
          select: { evaluations: true },
        },
      },
      orderBy: {
        evaluations: {
          _count: 'desc',
        },
      },
      take: limit,
    });

    const topFlags = flags.map((flag) => ({
      key: flag.key,
      name: flag.name,
      enabled: flag.enabled,
      evaluationCount: flag._count.evaluations,
    }));

    await this.cache.set(cacheKey, topFlags, this.CACHE_TTL);
    return topFlags;
  }

  /**
   * Get flag health score
   */
  async getFlagHealth(flagKey: string): Promise<any> {
    const cacheKey = `flag_health:${flagKey}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const flag = await this.prisma.featureFlag.findUnique({
      where: { key: flagKey },
      include: {
        _count: {
          select: { evaluations: true },
        },
      },
    });

    if (!flag) {
      throw new Error(`Flag ${flagKey} not found`);
    }

    // Calculate health score (0-100)
    let healthScore = 100;

    // Factor 1: Evaluation consistency
    const distribution = await this.getVariantDistribution(flagKey);
    const consistency = distribution.consistency || 0;
    healthScore *= consistency / 100;

    // Factor 2: Flag enabled status
    if (!flag.enabled) {
      healthScore -= 20;
    }

    // Factor 3: Recent usage
    const recentMetrics = await this.getFlagMetrics(
      flagKey,
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      new Date(),
    );
    if (recentMetrics.total === 0) {
      healthScore -= 30; // No recent usage
    }

    // Factor 4: Anomalies (would detect in production)
    const anomalies: string[] = [];
    if (healthScore < 50) {
      anomalies.push('Low health score detected');
    }

    const health = {
      flagKey,
      healthScore: Math.max(0, Math.min(100, healthScore)),
      factors: {
        consistency,
        enabled: flag.enabled,
        recentUsage: recentMetrics.total > 0,
      },
      anomalies,
      status: healthScore >= 80 ? 'healthy' : healthScore >= 50 ? 'warning' : 'critical',
    };

    await this.cache.set(cacheKey, health, this.CACHE_TTL);
    return health;
  }

  /**
   * Calculate variant distribution consistency
   */
  private calculateConsistency(
    distribution: Record<string, { count: number; percentage: number; users: Set<string> }>,
    total: number,
  ): number {
    if (total === 0) return 0;

    const percentages = Object.values(distribution).map((d) => d.percentage);
    if (percentages.length === 0) return 100;

    // Calculate coefficient of variation (lower is better)
    const mean = percentages.reduce((sum, p) => sum + p, 0) / percentages.length;
    const variance =
      percentages.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / percentages.length;
    const stdDev = Math.sqrt(variance);
    const cv = mean > 0 ? stdDev / mean : 0;

    // Convert to consistency score (0-100)
    return Math.max(0, Math.min(100, (1 - cv) * 100));
  }

  /**
   * Calculate trend direction
   */
  private calculateTrendDirection(values: number[]): 'increasing' | 'decreasing' | 'stable' {
    if (values.length < 2) return 'stable';

    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));

    const firstAvg = firstHalf.reduce((sum, v) => sum + v, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, v) => sum + v, 0) / secondHalf.length;

    const change = ((secondAvg - firstAvg) / firstAvg) * 100;

    if (change > 5) return 'increasing';
    if (change < -5) return 'decreasing';
    return 'stable';
  }

  /**
   * Get A/B test conversion rates
   */
  async getConversionRates(experimentId: string): Promise<any> {
    // This would integrate with ABTestAnalysisService
    return {
      experimentId,
      message: 'Use AB test analysis service for conversion rates',
    };
  }
}

