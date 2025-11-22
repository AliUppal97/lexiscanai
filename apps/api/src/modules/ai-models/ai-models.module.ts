import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AIModelsController } from './ai-models.controller';
import { ModelTrainingService } from './model-training.service';
import { ModelDeploymentService } from './model-deployment.service';
import { ModelInferenceService } from './model-inference.service';
import { ModelMonitoringService } from './model-monitoring.service';
import { PrismaService } from '../../common/prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'model-training',
    }),
    AuthModule,
  ],
  controllers: [AIModelsController],
  providers: [
    ModelTrainingService,
    ModelDeploymentService,
    ModelInferenceService,
    ModelMonitoringService,
    PrismaService,
  ],
  exports: [
    ModelTrainingService,
    ModelDeploymentService,
    ModelInferenceService,
    ModelMonitoringService,
  ],
})
export class AIModelsModule {}

