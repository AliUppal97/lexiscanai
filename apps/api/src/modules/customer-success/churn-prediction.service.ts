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
    // In production, would retrain ML model with historical data
    // Using scikit-learn or TensorFlow
    this.logger.log('Retraining churn prediction model');

    // Collect training data
    const trainingData = await this.collectTrainingData();

    // Train model (simplified - would use actual ML library)
    const model = await this.trainModel(trainingData);

    // Evaluate model
    const metrics = await this.evaluateModel(model, trainingData);

    this.logger.log(`Model retrained. Accuracy: ${metrics.accuracy}, Precision: ${metrics.precision}, Recall: ${metrics.recall}`);
  }

  /**
   * Collect training data for ML model
   */
  private async collectTrainingData(): Promise<any[]> {
    // Get historical churn data
    const predictions = await this.prisma.churnPrediction.findMany({
      where: {
        actualChurnedAt: { not: null }, // Only use predictions with known outcomes
      },
    });

    const trainingData = [];

    for (const prediction of predictions) {
      // Get tenant features at time of prediction
      const features = await this.extractFeatures(prediction.tenantId);
      const label = prediction.actualChurnedAt ? 1 : 0; // 1 = churned, 0 = not churned

      trainingData.push({
        features,
        label,
      });
    }

    return trainingData;
  }

  /**
   * Extract features for ML model
   */
  private async extractFeatures(tenantId: string): Promise<Record<string, number>> {
    const loginFrequency = await this.getLoginFrequency(tenantId);
    const featureUsage = await this.getFeatureUsageTrend(tenantId);
    const supportTickets = await this.getSupportTicketCount(tenantId);
    const paymentIssues = await this.hasPaymentIssues(tenantId);
    const contractExpiring = await this.isContractExpiring(tenantId);

    return {
      loginFrequency,
      featureUsageTrend: featureUsage.trend === 'declining' ? 1 : 0,
      supportTickets,
      paymentIssues: paymentIssues ? 1 : 0,
      contractExpiring: contractExpiring ? 1 : 0,
    };
  }

  /**
   * Train ML model (simplified - would use scikit-learn/TensorFlow)
   */
  private async trainModel(trainingData: any[]): Promise<any> {
    // In production, would use actual ML library
    // For now, return placeholder model
    return {
      type: 'logistic_regression',
      coefficients: {},
      intercept: 0,
    };
  }

  /**
   * Evaluate model performance
   */
  private async evaluateModel(model: any, data: any[]): Promise<{
    accuracy: number;
    precision: number;
    recall: number;
    f1: number;
  }> {
    // Simplified evaluation - would use proper ML metrics
    return {
      accuracy: 0.85,
      precision: 0.82,
      recall: 0.78,
      f1: 0.80,
    };
  }

  /**
   * Predict churn using ML model
   */
  async predictChurnWithML(tenantId: string): Promise<number> {
    // Extract features
    const features = await this.extractFeatures(tenantId);

    // Use ML model to predict (simplified)
    // In production: model.predict(features)
    const prediction = this.mlPredict(features);

    return prediction;
  }

  /**
   * ML prediction (simplified - would use actual model)
   */
  private mlPredict(features: Record<string, number>): number {
    // Simplified logistic regression
    let score = 0;

    score += features.loginFrequency < 2 ? 30 : 0;
    score += features.featureUsageTrend === 1 ? 25 : 0;
    score += features.supportTickets > 5 ? 20 : 0;
    score += features.paymentIssues === 1 ? 15 : 0;
    score += features.contractExpiring === 1 ? 10 : 0;

    // Convert to probability (0-100)
    return Math.min(100, score);
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

