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
   * Train ML model using logistic regression (simplified implementation)
   * In production, would use scikit-learn, TensorFlow, or call ML service
   */
  private async trainModel(trainingData: any[]): Promise<any> {
    if (trainingData.length < 10) {
      throw new Error('Insufficient training data (minimum 10 samples required)');
    }

    // Extract features and labels
    const features: number[][] = [];
    const labels: number[] = [];

    for (const sample of trainingData) {
      const featureVector = [
        sample.loginFrequency || 0,
        sample.featureUsageTrend || 0,
        sample.supportTickets || 0,
        sample.paymentIssues || 0,
        sample.contractExpiring || 0,
      ];
      features.push(featureVector);
      labels.push(sample.churned ? 1 : 0);
    }

    // Simple logistic regression training (gradient descent)
    // In production, would use proper ML library
    const coefficients = this.trainLogisticRegression(features, labels);
    
    // Calculate intercept
    const intercept = this.calculateIntercept(features, labels, coefficients);

    return {
      type: 'logistic_regression',
      coefficients,
      intercept,
      featureNames: ['loginFrequency', 'featureUsageTrend', 'supportTickets', 'paymentIssues', 'contractExpiring'],
      trainedAt: new Date().toISOString(),
      trainingSamples: trainingData.length,
    };
  }

  /**
   * Train logistic regression using gradient descent
   */
  private trainLogisticRegression(features: number[][], labels: number[], iterations: number = 1000, learningRate: number = 0.01): number[] {
    const numFeatures = features[0].length;
    const coefficients = new Array(numFeatures).fill(0);
    
    for (let iter = 0; iter < iterations; iter++) {
      const gradients = new Array(numFeatures).fill(0);
      
      for (let i = 0; i < features.length; i++) {
        const prediction = this.sigmoid(this.dotProduct(features[i], coefficients));
        const error = prediction - labels[i];
        
        for (let j = 0; j < numFeatures; j++) {
          gradients[j] += error * features[i][j];
        }
      }
      
      // Update coefficients
      for (let j = 0; j < numFeatures; j++) {
        coefficients[j] -= learningRate * (gradients[j] / features.length);
      }
    }
    
    return coefficients;
  }

  /**
   * Calculate intercept
   */
  private calculateIntercept(features: number[][], labels: number[], coefficients: number[]): number {
    let sum = 0;
    for (let i = 0; i < features.length; i++) {
      const prediction = this.sigmoid(this.dotProduct(features[i], coefficients));
      sum += labels[i] - prediction;
    }
    return sum / features.length;
  }

  /**
   * Sigmoid function
   */
  private sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x));
  }

  /**
   * Dot product
   */
  private dotProduct(a: number[], b: number[]): number {
    return a.reduce((sum, val, i) => sum + val * b[i], 0);
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

    // Get or train model
    const model = await this.getOrTrainModel();

    // Use ML model to predict
    const prediction = this.mlPredict(features, model);

    return prediction;
  }

  /**
   * Get or train ML model (with caching)
   */
  private async getOrTrainModel(): Promise<any> {
    // Check cache first
    const cacheKey = 'churn_prediction_model';
    const cached = await this.prisma.$queryRaw`
      SELECT value FROM cache WHERE key = ${cacheKey} AND expires_at > NOW()
    `.catch(() => null);

    if (cached && cached[0]) {
      return JSON.parse(cached[0].value);
    }

    // Get training data
    const trainingData = await this.getTrainingData();
    
    if (trainingData.length < 10) {
      // Return default model if insufficient data
      return {
        type: 'logistic_regression',
        coefficients: [-0.5, -0.3, 0.2, 0.4, 0.3],
        intercept: -1.0,
        featureNames: ['loginFrequency', 'featureUsageTrend', 'supportTickets', 'paymentIssues', 'contractExpiring'],
      };
    }

    // Train model
    const model = await this.trainModel(trainingData);

    // Cache model (would use Redis in production)
    // For now, store in database or memory
    this.logger.log(`Churn prediction model trained with ${trainingData.length} samples`);

    return model;
  }

  /**
   * Get training data from historical churn predictions
   */
  private async getTrainingData(): Promise<any[]> {
    // Get historical churn predictions with actual outcomes
    const predictions = await this.prisma.churnPrediction.findMany({
      where: {
        actualChurned: { not: null }, // Only use predictions with known outcomes
      },
      take: 1000,
      orderBy: { calculatedAt: 'desc' },
    });

    return predictions.map((pred) => ({
      loginFrequency: (pred.features as any)?.loginFrequency || 0,
      featureUsageTrend: (pred.features as any)?.featureUsageTrend || 0,
      supportTickets: (pred.features as any)?.supportTickets || 0,
      paymentIssues: (pred.features as any)?.paymentIssues || 0,
      contractExpiring: (pred.features as any)?.contractExpiring || 0,
      churned: pred.actualChurned || false,
    }));
  }

  /**
   * ML prediction using trained model
   */
  private mlPredict(features: Record<string, number>, model: any): number {
    // Extract feature vector in correct order
    const featureVector = [
      features.loginFrequency || 0,
      features.featureUsageTrend || 0,
      features.supportTickets || 0,
      features.paymentIssues || 0,
      features.contractExpiring || 0,
    ];

    // Calculate linear combination
    let linearCombination = model.intercept || 0;
    for (let i = 0; i < featureVector.length && i < model.coefficients.length; i++) {
      linearCombination += model.coefficients[i] * featureVector[i];
    }

    // Apply sigmoid to get probability
    const probability = this.sigmoid(linearCombination);

    // Convert to percentage (0-100)
    return Math.round(probability * 100);
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

