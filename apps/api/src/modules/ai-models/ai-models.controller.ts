import { Controller, Get, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EnhancedJwtAuthGuard } from '../auth/enhanced-auth.guard';
import { ModelTrainingService } from './model-training.service';
import { ModelDeploymentService } from './model-deployment.service';
import { ModelInferenceService } from './model-inference.service';
import { ModelMonitoringService } from './model-monitoring.service';

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
  ) {}

  @Get()
  @ApiOperation({ summary: 'List AI models' })
  async listModels(): Promise<any[]> {
    // TODO: Implement list
    return [];
  }

  @Post()
  @ApiOperation({ summary: 'Create AI model' })
  async createModel(@Body() dto: any): Promise<any> {
    // TODO: Implement create
    return {};
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get AI model' })
  async getModel(@Param('id') id: string): Promise<any> {
    // TODO: Implement get
    return {};
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
}

