import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class ModelInferenceService {
  private readonly logger = new Logger(ModelInferenceService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Run prediction/inference
   */
  async predict(modelId: string, input: any, tenantId: string): Promise<any> {
    const startTime = Date.now();

    const model = await (this.prisma as any).aIModel.findUnique({
      where: { id: modelId },
      include: {
        deployments: {
          where: {
            status: 'ACTIVE',
            environment: 'PRODUCTION',
          },
        },
      },
    });

    if (!model || model.deployments.length === 0) {
      throw new Error(`Model ${modelId} not deployed`);
    }

    const deployment = model.deployments[0];

    // Call actual model endpoint
    const output = await this.callModelEndpoint(deployment.endpoint!, input);

    const latency = Date.now() - startTime;
    const cost = this.calculateCost(model, latency);

    // Record usage
    await this.recordUsage(modelId, tenantId, input, output, latency, cost);

    return output;
  }

  /**
   * Batch prediction
   */
  async batchPredict(modelId: string, inputs: any[], tenantId: string): Promise<any[]> {
    const results = await Promise.all(
      inputs.map((input) => this.predict(modelId, input, tenantId)),
    );

    return results;
  }

  /**
   * Get model metrics
   */
  async getModelMetrics(modelId: string): Promise<any> {
    const model = await (this.prisma as any).aIModel.findUnique({
      where: { id: modelId },
    });

    // Get usage statistics
    const usageStats = await (this.prisma as any).modelUsage.aggregate({
      where: { modelId },
      _count: { id: true },
      _avg: { latency: true, cost: true },
    });

    return {
      model: model?.metrics || {},
      usage: {
        totalRequests: usageStats._count.id,
        averageLatency: usageStats._avg.latency,
        averageCost: usageStats._avg.cost,
      },
    };
  }

  /**
   * Call model endpoint (with retry and error handling)
   */
  private async callModelEndpoint(endpoint: string, input: any, retries: number = 3): Promise<any> {
    const axios = require('axios');
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        this.logger.debug(`Calling model endpoint: ${endpoint} (attempt ${attempt})`);

        const startTime = Date.now();
        
        // Make actual HTTP request to model endpoint
        const response = await axios.post(
          `${endpoint}/predict`,
          { input },
          {
            timeout: 30000, // 30 second timeout
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.AI_MODEL_API_KEY || ''}`,
            },
          },
        );

        const latency = Date.now() - startTime;

        // Validate response
        if (!response.data || response.status !== 200) {
          throw new Error(`Invalid response from model endpoint: ${response.status}`);
        }

        this.logger.debug(`Model inference completed in ${latency}ms`);

        return {
          ...response.data,
          latency,
          endpoint,
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        this.logger.warn(`Model endpoint call failed (attempt ${attempt}/${retries}): ${error.message}`);
        
        if (attempt === retries) {
          // Log final failure
          this.logger.error(`Model inference failed after ${retries} attempts: ${error.message}`);
          throw new Error(`Model inference failed: ${error.message}`);
        }
        
        // Exponential backoff before retry
        const backoffDelay = Math.pow(2, attempt) * 1000;
        this.logger.debug(`Retrying in ${backoffDelay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, backoffDelay));
      }
    }

    throw new Error('Model inference failed after retries');
  }

  /**
   * Calculate cost
   */
  private calculateCost(model: any, latency: number): number {
    // Simplified cost calculation
    // In production, use actual pricing model
    return 0.001; // $0.001 per request
  }

  /**
   * Record model usage
   */
  private async recordUsage(
    modelId: string,
    tenantId: string,
    input: any,
    output: any,
    latency: number,
    cost: number,
  ): Promise<void> {
    await (this.prisma as any).modelUsage.create({
      data: {
        modelId,
        tenantId,
        input,
        output,
        latency,
        cost,
      },
    });
  }
}

