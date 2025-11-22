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
    await this.prisma.modelTraining.update({
      where: { id: trainingId },
      data: {
        status: ModelTrainingStatus.CANCELLED,
        completedAt: new Date(),
      },
    });

    // TODO: Cancel training job
  }

  /**
   * Get training metrics
   */
  async getTrainingMetrics(trainingId: string): Promise<any> {
    const training = await this.getTrainingStatus(trainingId);
    return training?.metrics || {};
  }
}

