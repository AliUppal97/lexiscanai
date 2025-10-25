import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../common/prisma.service';
import { CacheService } from '../../../services/cache.service';
import { QueueService } from '../../../services/queue.service';
import { 
  CreateWebhookDto, 
  UpdateWebhookDto, 
  WebhookQueryDto,
  WebhookStatsDto,
  WebhookEvent,
  WebhookStatus,
  DeliveryStatus 
} from '../dto/webhooks.dto';
import * as crypto from 'crypto';

/**
 * Webhook Service for LexiScan AI
 * 
 * Handles webhook delivery with:
 * - Reliable webhook delivery with retry mechanisms
 * - HMAC signature verification for security
 * - Event filtering and transformation
 * - Delivery status tracking and analytics
 * - Rate limiting and throttling
 * - Dead letter queue for failed webhooks
 */
@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);
  private readonly maxRetries: number;
  private readonly retryDelay: number;
  private readonly timeout: number;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private cacheService: CacheService,
    private queueService: QueueService,
  ) {
    this.maxRetries = this.configService.get<number>('WEBHOOK_MAX_RETRIES', 3);
    this.retryDelay = this.configService.get<number>('WEBHOOK_RETRY_DELAY', 5000);
    this.timeout = this.configService.get<number>('WEBHOOK_TIMEOUT', 30000);
  }

  /**
   * Create a new webhook
   */
  async createWebhook(
    tenantId: string,
    webhookData: CreateWebhookDto
  ): Promise<{ id: string; status: string }> {
    try {
      // Generate webhook secret if not provided
      const secret = webhookData.secret || this.generateWebhookSecret();

      const webhook = await this.prisma.webhook.create({
        data: {
          tenantId,
          name: webhookData.name,
          url: webhookData.url,
          events: webhookData.events,
          secret,
          headers: webhookData.headers || [],
          isActive: webhookData.isActive ?? true,
          timeout: webhookData.timeout || this.timeout,
          retryAttempts: webhookData.retryAttempts || this.maxRetries,
          retryDelay: webhookData.retryDelay || this.retryDelay,
          description: webhookData.description,
          filters: webhookData.filters || {},
        },
      });

      // Cache webhook for quick access
      await this.cacheService.set(
        `webhook:${webhook.id}`,
        webhook,
        3600 // 1 hour
      );

      this.logger.log(`Webhook created: ${webhook.id} for tenant ${tenantId}`);
      return { id: webhook.id, status: 'created' };
    } catch (error) {
      this.logger.error(`Failed to create webhook: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update an existing webhook
   */
  async updateWebhook(
    tenantId: string,
    webhookId: string,
    updateData: UpdateWebhookDto
  ): Promise<{ success: boolean; message: string }> {
    try {
      const webhook = await this.prisma.webhook.update({
        where: {
          id: webhookId,
          tenantId,
        },
        data: {
          ...updateData,
          updatedAt: new Date(),
        },
      });

      // Update cache
      await this.cacheService.set(
        `webhook:${webhookId}`,
        webhook,
        3600
      );

      this.logger.log(`Webhook updated: ${webhookId}`);
      return { success: true, message: 'Webhook updated successfully' };
    } catch (error) {
      this.logger.error(`Failed to update webhook: ${error.message}`);
      return { success: false, message: error.message };
    }
  }

  /**
   * Delete a webhook
   */
  async deleteWebhook(
    tenantId: string,
    webhookId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      await this.prisma.webhook.delete({
        where: {
          id: webhookId,
          tenantId,
        },
      });

      // Remove from cache
      await this.cacheService.del(`webhook:${webhookId}`);

      this.logger.log(`Webhook deleted: ${webhookId}`);
      return { success: true, message: 'Webhook deleted successfully' };
    } catch (error) {
      this.logger.error(`Failed to delete webhook: ${error.message}`);
      return { success: false, message: error.message };
    }
  }

  /**
   * Get webhooks for a tenant
   */
  async getWebhooks(
    tenantId: string,
    query: WebhookQueryDto
  ): Promise<{
    webhooks: any[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      const page = query.page || 1;
      const limit = query.limit || 20;
      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = { tenantId };

      if (query.name) {
        where.name = { contains: query.name, mode: 'insensitive' };
      }

      if (query.status) {
        where.isActive = query.status === WebhookStatus.ACTIVE;
      }

      if (query.event) {
        where.events = { has: query.event };
      }

      if (query.startDate && query.endDate) {
        where.createdAt = {
          gte: new Date(query.startDate),
          lte: new Date(query.endDate),
        };
      }

      const [webhooks, total] = await Promise.all([
        this.prisma.webhook.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        this.prisma.webhook.count({ where }),
      ]);

      return {
        webhooks,
        total,
        hasMore: skip + limit < total,
      };
    } catch (error) {
      this.logger.error(`Failed to get webhooks: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send webhook event
   */
  async sendWebhookEvent(
    tenantId: string,
    event: WebhookEvent,
    payload: Record<string, any>,
    options?: {
      webhookId?: string;
      priority?: number;
      delay?: number;
    }
  ): Promise<{ sent: number; failed: number; results: any[] }> {
    try {
      this.logger.log(`Sending webhook event: ${event} for tenant ${tenantId}`);

      // Get webhooks for this event
      const webhooks = await this.getWebhooksForEvent(tenantId, event, options?.webhookId);

      if (webhooks.length === 0) {
        this.logger.warn(`No webhooks found for event: ${event}`);
        return { sent: 0, failed: 0, results: [] };
      }

      const results: any[] = [];
      let sent = 0;
      let failed = 0;

      // Process webhooks in parallel
      const webhookPromises = webhooks.map(async (webhook) => {
        try {
          const result = await this.deliverWebhook(webhook, event, payload);
          if (result.success) {
            sent++;
          } else {
            failed++;
          }
          return result;
        } catch (error) {
          failed++;
          return { success: false, webhookId: webhook.id, error: error.message };
        }
      });

      const webhookResults = await Promise.all(webhookPromises);
      results.push(...webhookResults);

      this.logger.log(`Webhook event processed: ${sent} sent, ${failed} failed`);
      return { sent, failed, results };
    } catch (error) {
      this.logger.error(`Failed to send webhook event: ${error.message}`);
      throw error;
    }
  }

  /**
   * Deliver webhook to a specific endpoint
   */
  private async deliverWebhook(
    webhook: any,
    event: WebhookEvent,
    payload: Record<string, any>
  ): Promise<{ success: boolean; webhookId: string; deliveryId?: string; error?: string }> {
    try {
      // Create delivery record
      const delivery = await this.prisma.webhookDelivery.create({
        data: {
          webhookId: webhook.id,
          event,
          payload,
          status: DeliveryStatus.PENDING,
          attemptCount: 0,
          maxAttempts: webhook.retryAttempts,
        },
      });

      // Add to queue for processing
      await this.queueService.addJob('webhook', 'deliver-webhook', {
        deliveryId: delivery.id,
        webhookId: webhook.id,
        url: webhook.url,
        secret: webhook.secret,
        headers: webhook.headers,
        timeout: webhook.timeout,
        event,
        payload,
      }, {
        priority: 0,
        attempts: webhook.retryAttempts,
        backoff: {
          type: 'exponential',
          delay: webhook.retryDelay,
        },
        removeOnComplete: 10,
        removeOnFail: 5,
      });

      this.logger.log(`Webhook queued for delivery: ${delivery.id}`);
      return { success: true, webhookId: webhook.id, deliveryId: delivery.id };
    } catch (error) {
      this.logger.error(`Failed to queue webhook delivery: ${error.message}`);
      return { success: false, webhookId: webhook.id, error: error.message };
    }
  }

  /**
   * Process webhook delivery job
   */
  async processWebhookDelivery(jobData: {
    deliveryId: string;
    webhookId: string;
    url: string;
    secret: string;
    headers: any[];
    timeout: number;
    event: WebhookEvent;
    payload: Record<string, any>;
  }): Promise<void> {
    try {
      this.logger.log(`Processing webhook delivery: ${jobData.deliveryId}`);

      // Update delivery status
      await this.prisma.webhookDelivery.update({
        where: { id: jobData.deliveryId },
        data: {
          status: DeliveryStatus.RETRYING,
          attemptCount: { increment: 1 },
        },
      });

      // Prepare webhook payload
      const webhookPayload = {
        id: jobData.deliveryId,
        event: jobData.event,
        data: jobData.payload,
        timestamp: new Date().toISOString(),
        tenantId: jobData.payload.tenantId,
      };

      // Generate HMAC signature
      const signature = this.generateHmacSignature(webhookPayload, jobData.secret);

      // Prepare headers
      const headers = {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-Event': jobData.event,
        'X-Webhook-Delivery': jobData.deliveryId,
        'User-Agent': 'LexiScan-AI-Webhook/1.0',
        ...this.parseHeaders(jobData.headers),
      };

      // Send HTTP request
      const response = await this.sendHttpRequest(
        jobData.url,
        webhookPayload,
        headers,
        jobData.timeout
      );

      // Update delivery status
      await this.prisma.webhookDelivery.update({
        where: { id: jobData.deliveryId },
        data: {
          status: response.success ? DeliveryStatus.DELIVERED : DeliveryStatus.FAILED,
          responseCode: response.statusCode,
          responseBody: response.body,
          deliveredAt: response.success ? new Date() : null,
          errorMessage: response.error,
        },
      });

      if (response.success) {
        this.logger.log(`Webhook delivered successfully: ${jobData.deliveryId}`);
      } else {
        this.logger.error(`Webhook delivery failed: ${jobData.deliveryId} - ${response.error}`);
      }
    } catch (error) {
      this.logger.error(`Failed to process webhook delivery: ${error.message}`);
      
      // Update delivery status
      await this.prisma.webhookDelivery.update({
        where: { id: jobData.deliveryId },
        data: {
          status: DeliveryStatus.FAILED,
          errorMessage: error.message,
        },
      });

      throw error;
    }
  }

  /**
   * Send HTTP request to webhook URL
   */
  private async sendHttpRequest(
    url: string,
    payload: any,
    headers: Record<string, string>,
    timeout: number
  ): Promise<{ success: boolean; statusCode?: number; body?: string; error?: string }> {
    try {
      const fetch = require('node-fetch');
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        timeout,
      });

      const body = await response.text();
      
      if (response.ok) {
        return { success: true, statusCode: response.status, body };
      } else {
        return { 
          success: false, 
          statusCode: response.status, 
          body, 
          error: `HTTP ${response.status}: ${body}` 
        };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate HMAC signature for webhook security
   */
  private generateHmacSignature(payload: any, secret: string): string {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(JSON.stringify(payload));
    return `sha256=${hmac.digest('hex')}`;
  }

  /**
   * Generate webhook secret
   */
  private generateWebhookSecret(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Parse headers from array format
   */
  private parseHeaders(headers: any[]): Record<string, string> {
    const parsed: Record<string, string> = {};
    if (Array.isArray(headers)) {
      headers.forEach(header => {
        parsed[header.name] = header.value;
      });
    }
    return parsed;
  }

  /**
   * Get webhooks for a specific event
   */
  private async getWebhooksForEvent(
    tenantId: string,
    event: WebhookEvent,
    webhookId?: string
  ): Promise<any[]> {
    try {
      const where: any = {
        tenantId,
        isActive: true,
        events: { has: event },
      };

      if (webhookId) {
        where.id = webhookId;
      }

      return await this.prisma.webhook.findMany({ where });
    } catch (error) {
      this.logger.error(`Failed to get webhooks for event: ${error.message}`);
      return [];
    }
  }

  /**
   * Get webhook delivery statistics
   */
  async getWebhookStats(
    tenantId: string,
    startDate: Date,
    endDate: Date
  ): Promise<WebhookStatsDto> {
    try {
      const stats = await this.prisma.webhookDelivery.aggregate({
        where: {
          webhook: { tenantId },
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        _count: true,
        _avg: {
          responseTime: true,
        },
      });

      const successfulDeliveries = await this.prisma.webhookDelivery.count({
        where: {
          webhook: { tenantId },
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          status: DeliveryStatus.DELIVERED,
        },
      });

      const failedDeliveries = await this.prisma.webhookDelivery.count({
        where: {
          webhook: { tenantId },
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          status: DeliveryStatus.FAILED,
        },
      });

      const totalDeliveries = stats._count;
      const successRate = totalDeliveries > 0 ? (successfulDeliveries / totalDeliveries) * 100 : 0;

      return {
        period: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
        totalDeliveries,
        successfulDeliveries,
        failedDeliveries,
        successRate,
        averageResponseTime: stats._avg.responseTime || 0,
        totalRetries: 0, // Calculate from delivery records
        byEvent: {},
        byStatus: {},
      };
    } catch (error) {
      this.logger.error(`Failed to get webhook stats: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test webhook endpoint
   */
  async testWebhook(
    tenantId: string,
    webhookId: string,
    testPayload?: Record<string, any>
  ): Promise<{ success: boolean; response?: any; error?: string }> {
    try {
      const webhook = await this.prisma.webhook.findFirst({
        where: {
          id: webhookId,
          tenantId,
        },
      });

      if (!webhook) {
        return { success: false, error: 'Webhook not found' };
      }

      const payload = testPayload || {
        test: true,
        timestamp: new Date().toISOString(),
        tenantId,
      };

      const result = await this.deliverWebhook(webhook, WebhookEvent.CUSTOM, payload);
      return { success: result.success, error: result.error };
    } catch (error) {
      this.logger.error(`Failed to test webhook: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}
