import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CustomerHealthScore, HealthTrend, SuccessMetricType } from '@prisma/client';

@Injectable()
export class CustomerHealthService {
  private readonly logger = new Logger(CustomerHealthService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Calculate customer health score
   */
  async calculateHealthScore(tenantId: string): Promise<CustomerHealthScore> {
    const factors: Record<string, any> = {};

    // Factor 1: Login frequency (30% weight)
    const loginFrequency = await this.getLoginFrequency(tenantId);
    factors.loginFrequency = loginFrequency;
    const loginScore = Math.min(100, loginFrequency * 10); // 0-10 logins/month = 0-100

    // Factor 2: Feature usage (25% weight)
    const featureUsage = await this.getFeatureUsage(tenantId);
    factors.featureUsage = featureUsage;
    const featureScore = Math.min(100, featureUsage.percentage);

    // Factor 3: Support tickets (20% weight)
    const supportTickets = await this.getSupportTicketCount(tenantId);
    factors.supportTickets = supportTickets;
    const supportScore = supportTickets === 0 ? 100 : Math.max(0, 100 - supportTickets * 10);

    // Factor 4: Payment history (15% weight)
    const paymentHistory = await this.getPaymentHistory(tenantId);
    factors.paymentHistory = paymentHistory;
    const paymentScore = paymentHistory.reliability * 100;

    // Factor 5: Contract value (10% weight)
    const contractValue = await this.getContractValue(tenantId);
    factors.contractValue = contractValue;
    const contractScore = Math.min(100, (contractValue / 10000) * 100); // Normalize to 10K

    // Calculate weighted score
    const score =
      loginScore * 0.3 +
      featureScore * 0.25 +
      supportScore * 0.2 +
      paymentScore * 0.15 +
      contractScore * 0.1;

    // Get previous score for trend
    const previous = await this.prisma.customerHealthScore.findUnique({
      where: { tenantId },
    });

    let trend: HealthTrend = HealthTrend.STABLE;
    if (previous) {
      if (score > previous.score + 5) {
        trend = HealthTrend.IMPROVING;
      } else if (score < previous.score - 5) {
        trend = HealthTrend.DECLINING;
      }
    }

    const healthScore = await this.prisma.customerHealthScore.upsert({
      where: { tenantId },
      update: {
        score: Math.round(score),
        factors,
        calculatedAt: new Date(),
        trend,
      },
      create: {
        tenantId,
        score: Math.round(score),
        factors,
        trend,
      },
    });

    return healthScore;
  }

  /**
   * Get health score
   */
  async getHealthScore(tenantId: string): Promise<CustomerHealthScore | null> {
    return this.prisma.customerHealthScore.findUnique({
      where: { tenantId },
    });
  }

  /**
   * Get health trend
   */
  async getHealthTrend(tenantId: string): Promise<HealthTrend> {
    const health = await this.getHealthScore(tenantId);
    return health?.trend || HealthTrend.STABLE;
  }

  /**
   * Get health factors
   */
  async getHealthFactors(tenantId: string): Promise<any> {
    const health = await this.getHealthScore(tenantId);
    return health?.factors || {};
  }

  /**
   * Get login frequency
   */
  private async getLoginFrequency(tenantId: string): Promise<number> {
    // Simplified - would query actual login data
    return 5; // logins per month
  }

  /**
   * Get feature usage
   */
  private async getFeatureUsage(tenantId: string): Promise<{ percentage: number; features: string[] }> {
    // Simplified - would query actual feature usage
    return { percentage: 60, features: ['documents', 'analytics'] };
  }

  /**
   * Get support ticket count
   */
  private async getSupportTicketCount(tenantId: string): Promise<number> {
    // Simplified - would query support tickets
    return 2;
  }

  /**
   * Get payment history
   */
  private async getPaymentHistory(tenantId: string): Promise<{ reliability: number }> {
    // Simplified - would query payment history
    return { reliability: 0.95 };
  }

  /**
   * Get contract value
   */
  private async getContractValue(tenantId: string): Promise<number> {
    // Simplified - would query billing/subscription
    return 5000; // $5K ARR
  }
}

