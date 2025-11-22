import { Controller, Get, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EnhancedJwtAuthGuard } from '../auth/enhanced-auth.guard';
import { ModelTrainingService } from './model-training.service';
import { ModelDeploymentService } from './model-deployment.service';
import { ModelInferenceService } from './model-inference.service';
import { ModelMonitoringService } from './model-monitoring.service';
import { PrismaService } from '../../common/prisma.service';

@ApiTags('AI Models')
@ApiBearerAuth()
@Controller('ai-models')
@UseGuards(EnhancedJwtAuthGuard)
export class AIModelsController {
  constructor(
    private trainingService: ModelTrainingService,
    private deploymentService: ModelDeploymentService,
    private inferenceService: ModelInferenceService,
    private monitoringService: ModelMonitoringService,
    private prisma: PrismaService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List AI models' })
  async listModels(@Request() req: any): Promise<any[]> {
    const tenantId = req.user?.tenantId;
    
    // In production, would filter by tenantId if models are tenant-specific
    // For now, return all models (would add tenantId to AIModel model if needed)
    const models = await (this.prisma as any).aIModel.findMany({
      include: {
        deployments: {
          where: {
            status: 'ACTIVE',
          },
        },
        trainings: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return models.map((model) => ({
      id: model.id,
      name: model.name,
      description: model.description,
      type: model.type,
      version: model.version,
      status: model.status,
      metrics: model.metrics,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      deployments: model.deployments.map((d) => ({
        id: d.id,
        environment: d.environment,
        status: d.status,
        endpoint: d.endpoint,
        trafficPercentage: d.trafficPercentage,
      })),
      latestTraining: model.trainings[0] ? {
        id: model.trainings[0].id,
        status: model.trainings[0].status,
        metrics: model.trainings[0].metrics,
      } : null,
    }));
  }

  @Post()
  @ApiOperation({ summary: 'Create AI model' })
  async createModel(@Request() req: any, @Body() dto: {
    name: string;
    description?: string;
    type: string;
    config: any;
  }): Promise<any> {
    const model = await (this.prisma as any).aIModel.create({
      data: {
        name: dto.name,
        description: dto.description,
        type: dto.type as any,
        config: dto.config,
        status: 'DRAFT',
        version: '1.0.0',
      },
    });

    return {
      id: model.id,
      name: model.name,
      description: model.description,
      type: model.type,
      version: model.version,
      status: model.status,
      createdAt: model.createdAt,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get AI model' })
  async getModel(@Param('id') id: string): Promise<any> {
    const model = await (this.prisma as any).aIModel.findUnique({
      where: { id },
      include: {
        deployments: true,
        trainings: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        versions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!model) {
      throw new Error(`Model ${id} not found`);
    }

    return {
      id: model.id,
      name: model.name,
      description: model.description,
      type: model.type,
      version: model.version,
      status: model.status,
      config: model.config,
      metrics: model.metrics,
      deployments: model.deployments,
      trainings: model.trainings,
      versions: model.versions,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    };
  }

  @Post(':id/train')
  @ApiOperation({ summary: 'Train model' })
  async trainModel(@Param('id') id: string, @Body() dto: any): Promise<any> {
    return this.trainingService.trainModel({
      modelId: id,
      datasetId: dto.datasetId,
      config: dto.config,
    });
  }

  @Post(':id/deploy')
  @ApiOperation({ summary: 'Deploy model' })
  async deployModel(@Param('id') id: string, @Body() dto: { environment: string }): Promise<any> {
    return this.deploymentService.deployModel(id, dto.environment as any);
  }

  @Post(':id/predict')
  @ApiOperation({ summary: 'Run prediction' })
  async predict(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: { input: any },
  ): Promise<any> {
    const tenantId = req.user.tenantId;
    return this.inferenceService.predict(id, dto.input, tenantId);
  }

  @Get(':id/metrics')
  @ApiOperation({ summary: 'Get model metrics' })
  async getMetrics(@Param('id') id: string): Promise<any> {
    return this.inferenceService.getModelMetrics(id);
  }

  @Get(':id/training/:trainingId/logs')
  @ApiOperation({ summary: 'Get training logs' })
  async getTrainingLogs(@Param('id') id: string, @Param('trainingId') trainingId: string): Promise<any> {
    return this.trainingService.getTrainingLogs(trainingId);
  }

  @Get(':id/training/:trainingId/monitor')
  @ApiOperation({ summary: 'Monitor training job' })
  async monitorTraining(@Param('id') id: string, @Param('trainingId') trainingId: string): Promise<any> {
    return this.trainingService.monitorTrainingJob(trainingId);
  }

  @Get(':id/deployment/health')
  @ApiOperation({ summary: 'Health check for deployment' })
  async healthCheck(@Param('id') id: string): Promise<any> {
    return this.deploymentService.healthCheck(id);
  }

  @Get(':id/deployment/metrics')
  @ApiOperation({ summary: 'Get deployment metrics' })
  async getDeploymentMetrics(@Param('id') id: string): Promise<any> {
    return this.deploymentService.getDeploymentMetrics(id);
  }

  @Get(':id/monitoring/drift')
  @ApiOperation({ summary: 'Detect data drift' })
  async detectDrift(@Param('id') id: string): Promise<any> {
    return this.monitoringService.detectDrift(id);
  }

  @Get(':id/monitoring/anomalies')
  @ApiOperation({ summary: 'Detect model anomalies' })
  async detectAnomalies(@Param('id') id: string): Promise<any> {
    return this.monitoringService.detectAnomalies(id);
  }
}

