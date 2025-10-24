import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth.guard';
import { TenantId } from '../auth/auth.service';
import { WebhookService } from '../../services/webhook.service';
import { CreateWebhookDto, UpdateWebhookDto } from './dto';

@Controller('webhooks')
@UseGuards(JwtAuthGuard)
export class WebhooksController {
  constructor(private webhookService: WebhookService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createWebhook(@TenantId() tenantId: string, @Body() dto: CreateWebhookDto) {
    return this.webhookService.createEndpoint(
      tenantId,
      dto.url,
      dto.events,
      dto.headers,
    );
  }

  @Get()
  async listWebhooks(@TenantId() tenantId: string) {
    return this.webhookService.listEndpoints(tenantId);
  }

  @Get(':webhookId')
  async getWebhook(@Param('webhookId') webhookId: string) {
    return this.webhookService.getEndpoint(webhookId);
  }

  @Put(':webhookId')
  async updateWebhook(
    @Param('webhookId') webhookId: string,
    @Body() dto: UpdateWebhookDto,
  ) {
    return this.webhookService.updateEndpoint(webhookId, dto);
  }

  @Delete(':webhookId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteWebhook(@Param('webhookId') webhookId: string) {
    return this.webhookService.deleteEndpoint(webhookId);
  }

  @Post(':webhookId/test')
  async testWebhook(@Param('webhookId') webhookId: string) {
    return this.webhookService.testEndpoint(webhookId);
  }

  @Get(':webhookId/attempts')
  async getAttempts(
    @Param('webhookId') webhookId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('successOnly') successOnly?: string,
  ) {
    return this.webhookService.getAttempts(webhookId, {
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
      successOnly: successOnly === 'true',
    });
  }

  @Post('attempts/:attemptId/retry')
  async retryAttempt(@Param('attemptId') attemptId: string) {
    return this.webhookService.retry(attemptId);
  }
}

