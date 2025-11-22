import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { ModelTraining, ModelTrainingStatus } from '@prisma/client';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';

@Injectable()
export class ModelTrainingService {
  private readonly logger = new Logger(ModelTrainingService.name);

  constructor(
    private prisma: PrismaService,
    @InjectQueue('model-training') private trainingQueue: Queue,
  ) {}

  /**
   * Train model
   */
  async trainModel(dto: {
    modelId: string;
    datasetId?: string;
    config: any;
  }): Promise<ModelTraining> {
    const training = await this.prisma.modelTraining.create({
      data: {
        modelId: dto.modelId,
        datasetId: dto.datasetId,
        config: dto.config,
        status: ModelTrainingStatus.PENDING,
      },
    });

    // Queue training job
    await this.trainingQueue.add('train', {
      trainingId: training.id,
      modelId: dto.modelId,
      datasetId: dto.datasetId,
      config: dto.config,
    });

    return training;
  }

  /**
   * Get training status
   */
  async getTrainingStatus(trainingId: string): Promise<ModelTraining | null> {
    return this.prisma.modelTraining.findUnique({
      where: { id: trainingId },
    });
  }

  /**
   * Cancel training
   */
  async cancelTraining(trainingId: string): Promise<void> {
    const training = await this.prisma.modelTraining.findUnique({
      where: { id: trainingId },
    });

    if (!training) {
      throw new Error(`Training ${trainingId} not found`);
    }

    if (training.status === ModelTrainingStatus.COMPLETED || training.status === ModelTrainingStatus.CANCELLED) {
      throw new Error(`Training ${trainingId} cannot be cancelled (status: ${training.status})`);
    }

    // Cancel training job in queue
    try {
      const jobs = await this.trainingQueue.getJobs(['active', 'waiting', 'delayed']);
      const job = jobs.find((j) => j.data.trainingId === trainingId);
      
      if (job) {
        await job.remove();
        this.logger.log(`Removed training job from queue: ${trainingId}`);
      }
    } catch (error) {
      this.logger.warn(`Failed to remove training job from queue: ${error.message}`);
    }

    // Update training status
    await this.prisma.modelTraining.update({
      where: { id: trainingId },
      data: {
        status: ModelTrainingStatus.CANCELLED,
        completedAt: new Date(),
        errorMessage: 'Training cancelled by user',
      },
    });

    this.logger.log(`Training ${trainingId} cancelled successfully`);
  }

  /**
   * Get training metrics
   */
  async getTrainingMetrics(trainingId: string): Promise<any> {
    const training = await this.getTrainingStatus(trainingId);
    return training?.metrics || {};
  }

  /**
   * Get training logs
   */
  async getTrainingLogs(trainingId: string): Promise<string[]> {
    const training = await this.prisma.modelTraining.findUnique({
      where: { id: trainingId },
    });

    if (!training) {
      throw new Error(`Training ${trainingId} not found`);
    }

    // In production, would fetch logs from:
    // 1. Training job logs (Kubernetes pod logs, cloud training service logs)
    // 2. Stored log files in S3/GCS
    // 3. Log aggregation service (CloudWatch, Datadog, etc.)

    // Try to get logs from queue job
    try {
      const jobs = await this.trainingQueue.getJobs(['completed', 'failed', 'active']);
      const job = jobs.find((j) => j.data.trainingId === trainingId);
      
      if (job && job.returnvalue?.logs) {
        return job.returnvalue.logs;
      }
    } catch (error) {
      this.logger.warn(`Failed to get logs from queue job: ${error.message}`);
    }

    // Fallback: Generate logs from training status
    const logs: string[] = [];
    logs.push(`[${training.startedAt?.toISOString() || new Date().toISOString()}] Training started`);
    
    if (training.status === ModelTrainingStatus.RUNNING) {
      logs.push(`[${new Date().toISOString()}] Training in progress...`);
      if (training.metrics) {
        const metrics = training.metrics as any;
        logs.push(`[${new Date().toISOString()}] Current metrics: ${JSON.stringify(metrics)}`);
      }
    } else if (training.status === ModelTrainingStatus.COMPLETED) {
      logs.push(`[${training.completedAt?.toISOString() || new Date().toISOString()}] Training completed`);
      if (training.metrics) {
        const metrics = training.metrics as any;
        logs.push(`[${new Date().toISOString()}] Final metrics: ${JSON.stringify(metrics)}`);
      }
    } else if (training.status === ModelTrainingStatus.FAILED) {
      logs.push(`[${training.completedAt?.toISOString() || new Date().toISOString()}] Training failed`);
      if (training.errorMessage) {
        logs.push(`[${new Date().toISOString()}] Error: ${training.errorMessage}`);
      }
    } else if (training.status === ModelTrainingStatus.CANCELLED) {
      logs.push(`[${training.completedAt?.toISOString() || new Date().toISOString()}] Training cancelled`);
    }

    return logs;
  }

  /**
   * Create training data pipeline (ETL)
   */
  async createTrainingPipeline(datasetId: string, config: any): Promise<any> {
    // In production, would:
    // 1. Extract data from source
    // 2. Transform data (cleaning, feature engineering)
    // 3. Load data into training format

    this.logger.log(`Creating training pipeline for dataset ${datasetId}`);

    return {
      pipelineId: `pipeline_${Date.now()}`,
      status: 'created',
      datasetId,
    };
  }

  /**
   * Monitor training job
   */
  async monitorTrainingJob(trainingId: string): Promise<{
    status: string;
    progress: number;
    metrics: any;
    estimatedCompletion: Date | null;
  }> {
    const training = await this.getTrainingStatus(trainingId);

    if (!training) {
      throw new Error(`Training ${trainingId} not found`);
    }

    // Calculate progress
    const progress = training.completedAt ? 100 : 50; // Simplified

    // Estimate completion
    const estimatedCompletion = training.startedAt
      ? new Date(training.startedAt.getTime() + 2 * 60 * 60 * 1000) // 2 hours estimate
      : null;

    return {
      status: training.status,
      progress,
      metrics: training.metrics || {},
      estimatedCompletion,
    };
  }
}

