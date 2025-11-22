import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { ChurnPrediction } from '@prisma/client';

@Injectable()
export class ChurnPredictionService {
  private readonly logger = new Logger(ChurnPredictionService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Predict churn probability
   */
  async predictChurn(tenantId: string): Promise<ChurnPrediction> {
    const riskFactors: Record<string, any> = {};

    // Factor 1: Low login frequency
    const loginFrequency = await this.getLoginFrequency(tenantId);
    if (loginFrequency < 2) {
      riskFactors.lowLoginFrequency = true;
    }

    // Factor 2: Declining feature usage
    const featureUsage = await this.getFeatureUsageTrend(tenantId);
    if (featureUsage.trend === 'declining') {
      riskFactors.decliningFeatureUsage = true;
    }

    // Factor 3: High support tickets
    const supportTickets = await this.getSupportTicketCount(tenantId);
    if (supportTickets > 5) {
      riskFactors.highSupportTickets = true;
    }

    // Factor 4: Payment issues
    const paymentIssues = await this.hasPaymentIssues(tenantId);
    if (paymentIssues) {
      riskFactors.paymentIssues = true;
    }

    // Factor 5: Contract expiration
    const contractExpiring = await this.isContractExpiring(tenantId);
    if (contractExpiring) {
      riskFactors.contractExpiring = true;
    }

    // Calculate churn probability
    const riskCount = Object.keys(riskFactors).length;
    const churnProbability = Math.min(100, riskCount * 20); // 20% per risk factor

    const prediction = await this.prisma.churnPrediction.upsert({
      where: { tenantId },
      update: {
        churnProbability,
        riskFactors,
        predictedAt: new Date(),
      },
      create: {
        tenantId,
        churnProbability,
        riskFactors,
      },
    });

    return prediction;
  }

  /**
   * Get churn risk
   */
  async getChurnRisk(tenantId: string): Promise<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'> {
    const prediction = await this.predictChurn(tenantId);

    if (prediction.churnProbability >= 80) {
      return 'CRITICAL';
    } else if (prediction.churnProbability >= 60) {
      return 'HIGH';
    } else if (prediction.churnProbability >= 40) {
      return 'MEDIUM';
    } else {
      return 'LOW';
    }
  }

  /**
   * Get risk factors
   */
  async getRiskFactors(tenantId: string): Promise<any> {
    const prediction = await this.predictChurn(tenantId);
    return prediction.riskFactors;
  }

  /**
   * Update ML model (retrain)
   */
  async updateModel(): Promise<void> {
    // TODO: Retrain ML model with historical data
    this.logger.log('Retraining churn prediction model');
  }

  private async getLoginFrequency(tenantId: string): Promise<number> {
    return 5;
  }

  private async getFeatureUsageTrend(tenantId: string): Promise<{ trend: string }> {
    return { trend: 'stable' };
  }

  private async getSupportTicketCount(tenantId: string): Promise<number> {
    return 2;
  }

  private async hasPaymentIssues(tenantId: string): Promise<boolean> {
    return false;
  }

  private async isContractExpiring(tenantId: string): Promise<boolean> {
    return false;
  }
}

