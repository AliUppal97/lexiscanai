import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../common/prisma.service';
import { CacheService } from '../../../services/cache.service';
import { QueueService } from '../../../services/queue.service';
import { DeliveryStatus } from '../dto/webhooks.dto';

/**
 * Webhook Retry Service for LexiScan AI
 * 
 * Handles webhook retry logic with:
 * - Automatic retry of failed webhook deliveries
 * - Exponential backoff for retry delays
 * - Dead letter queue for permanently failed webhooks
 * - Retry scheduling and management
 * - Delivery status monitoring
 * - Performance optimization
 */
@Injectable()
export class WebhookRetryService {
  private readonly logger = new Logger(WebhookRetryService.name);
  private readonly maxRetries: number;
  private readonly retryDelay: number;
  private readonly maxRetryDelay: number;

  constructor(
    private prisma: PrismaService,
    private cacheService: CacheService,
    private queueService: QueueService,
  ) {
    this.maxRetries = 3;
    this.retryDelay = 5000; // 5 seconds
    this.maxRetryDelay = 300000; // 5 minutes
  }

  /**
   * Process failed webhook deliveries for retry
   * Runs every 5 minutes
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async processFailedDeliveries(): Promise<void> {
    try {
      this.logger.log('Processing failed webhook deliveries for retry');

      // Get failed deliveries that can be retried
      const failedDeliveries = await this.prisma.webhookDelivery.findMany({
        where: {
          status: DeliveryStatus.FAILED,
          attemptCount: { lt: this.maxRetries },
          nextRetryAt: { lte: new Date() },
        },
        include: {
          webhook: true,
        },
        take: 100, // Process in batches
      });

      if (failedDeliveries.length === 0) {
        this.logger.log('No failed deliveries to retry');
        return;
      }

      this.logger.log(`Found ${failedDeliveries.length} failed deliveries to retry`);

      // Process each failed delivery
      for (const delivery of failedDeliveries) {
        try {
          await this.retryWebhookDelivery(delivery);
        } catch (error) {
          this.logger.error(`Failed to retry delivery ${delivery.id}: ${error.message}`);
        }
      }

      this.logger.log(`Processed ${failedDeliveries.length} failed deliveries`);
    } catch (error) {
      this.logger.error(`Failed to process failed deliveries: ${error.message}`);
    }
  }

  /**
   * Retry a specific webhook delivery
   */
  async retryWebhookDelivery(delivery: any): Promise<void> {
    try {
      this.logger.log(`Retrying webhook delivery: ${delivery.id}`);

      // Calculate next retry delay with exponential backoff
      const retryDelay = this.calculateRetryDelay(delivery.attemptCount);
      const nextRetryAt = new Date(Date.now() + retryDelay);

      // Update delivery record
      await this.prisma.webhookDelivery.update({
        where: { id: delivery.id },
        data: {
          status: DeliveryStatus.RETRYING,
          attemptCount: { increment: 1 },
          nextRetryAt,
        },
      });

      // Add to queue for retry
      await this.queueService.addJob('webhook', 'deliver-webhook', {
        deliveryId: delivery.id,
        webhookId: delivery.webhookId,
        url: delivery.webhook.url,
        secret: delivery.webhook.secret,
        headers: delivery.webhook.headers,
        timeout: delivery.webhook.timeout,
        event: delivery.event,
        payload: delivery.payload,
      }, {
        priority: 0,
        delay: retryDelay,
        attempts: 1, // Single attempt per retry
        removeOnComplete: 5,
        removeOnFail: 3,
      });

      this.logger.log(`Webhook delivery queued for retry: ${delivery.id} (delay: ${retryDelay}ms)`);
    } catch (error) {
      this.logger.error(`Failed to retry webhook delivery: ${error.message}`);
      throw error;
    }
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  private calculateRetryDelay(attemptCount: number): number {
    const baseDelay = this.retryDelay;
    const exponentialDelay = baseDelay * Math.pow(2, attemptCount);
    const jitter = Math.random() * 1000; // Add jitter to prevent thundering herd
    
    return Math.min(exponentialDelay + jitter, this.maxRetryDelay);
  }

  /**
   * Move permanently failed deliveries to dead letter queue
   * Runs every hour
   */
  @Cron(CronExpression.EVERY_HOUR)
  async moveToDeadLetterQueue(): Promise<void> {
    try {
      this.logger.log('Moving permanently failed deliveries to dead letter queue');

      // Get deliveries that have exceeded max retries
      const expiredDeliveries = await this.prisma.webhookDelivery.findMany({
        where: {
          status: DeliveryStatus.FAILED,
          attemptCount: { gte: this.maxRetries },
          movedToDeadLetter: false,
        },
        include: {
          webhook: true,
        },
        take: 100,
      });

      if (expiredDeliveries.length === 0) {
        this.logger.log('No expired deliveries to move to dead letter queue');
        return;
      }

      this.logger.log(`Found ${expiredDeliveries.length} expired deliveries to move`);

      // Move each delivery to dead letter queue
      for (const delivery of expiredDeliveries) {
        try {
          await this.moveDeliveryToDeadLetter(delivery);
        } catch (error) {
          this.logger.error(`Failed to move delivery ${delivery.id} to dead letter: ${error.message}`);
        }
      }

      this.logger.log(`Moved ${expiredDeliveries.length} deliveries to dead letter queue`);
    } catch (error) {
      this.logger.error(`Failed to move deliveries to dead letter queue: ${error.message}`);
    }
  }

  /**
   * Move a delivery to dead letter queue
   */
  private async moveDeliveryToDeadLetter(delivery: any): Promise<void> {
    try {
      // Create dead letter record
      await this.prisma.webhookDeadLetter.create({
        data: {
          webhookId: delivery.webhookId,
          event: delivery.event,
          payload: delivery.payload,
          originalDeliveryId: delivery.id,
          failureReason: 'Max retries exceeded',
          movedAt: new Date(),
        },
      });

      // Update delivery record
      await this.prisma.webhookDelivery.update({
        where: { id: delivery.id },
        data: {
          status: DeliveryStatus.EXPIRED,
          movedToDeadLetter: true,
          movedToDeadLetterAt: new Date(),
        },
      });

      this.logger.log(`Delivery moved to dead letter queue: ${delivery.id}`);
    } catch (error) {
      this.logger.error(`Failed to move delivery to dead letter: ${error.message}`);
      throw error;
    }
  }

  /**
   * Clean up old delivery records
   * Runs daily at 2 AM
   */
  @Cron('0 2 * * *')
  async cleanupOldDeliveries(): Promise<void> {
    try {
      this.logger.log('Cleaning up old webhook delivery records');

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 30); // Keep records for 30 days

      // Delete old successful deliveries
      const deletedSuccessful = await this.prisma.webhookDelivery.deleteMany({
        where: {
          status: DeliveryStatus.DELIVERED,
          deliveredAt: { lt: cutoffDate },
        },
      });

      // Delete old expired deliveries
      const deletedExpired = await this.prisma.webhookDelivery.deleteMany({
        where: {
          status: DeliveryStatus.EXPIRED,
          movedToDeadLetterAt: { lt: cutoffDate },
        },
      });

      this.logger.log(`Cleaned up ${deletedSuccessful.count + deletedExpired.count} old delivery records`);
    } catch (error) {
      this.logger.error(`Failed to cleanup old deliveries: ${error.message}`);
    }
  }

  /**
   * Get retry statistics
   */
  async getRetryStats(tenantId: string): Promise<{
    totalRetries: number;
    successfulRetries: number;
    failedRetries: number;
    averageRetryTime: number;
    retrySuccessRate: number;
  }> {
    try {
      const stats = await this.prisma.webhookDelivery.aggregate({
        where: {
          webhook: { tenantId },
          attemptCount: { gt: 0 },
        },
        _count: true,
        _avg: {
          responseTime: true,
        },
      });

      const successfulRetries = await this.prisma.webhookDelivery.count({
        where: {
          webhook: { tenantId },
          attemptCount: { gt: 0 },
          status: DeliveryStatus.DELIVERED,
        },
      });

      const failedRetries = await this.prisma.webhookDelivery.count({
        where: {
          webhook: { tenantId },
          attemptCount: { gt: 0 },
          status: DeliveryStatus.FAILED,
        },
      });

      const totalRetries = stats._count;
      const retrySuccessRate = totalRetries > 0 ? (successfulRetries / totalRetries) * 100 : 0;

      return {
        totalRetries,
        successfulRetries,
        failedRetries,
        averageRetryTime: stats._avg.responseTime || 0,
        retrySuccessRate,
      };
    } catch (error) {
      this.logger.error(`Failed to get retry stats: ${error.message}`);
      return {
        totalRetries: 0,
        successfulRetries: 0,
        failedRetries: 0,
        averageRetryTime: 0,
        retrySuccessRate: 0,
      };
    }
  }

  /**
   * Manually retry a specific delivery
   */
  async manualRetry(
    tenantId: string,
    deliveryId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const delivery = await this.prisma.webhookDelivery.findFirst({
        where: {
          id: deliveryId,
          webhook: { tenantId },
        },
        include: {
          webhook: true,
        },
      });

      if (!delivery) {
        return { success: false, message: 'Delivery not found' };
      }

      if (delivery.status === DeliveryStatus.DELIVERED) {
        return { success: false, message: 'Delivery already successful' };
      }

      if (delivery.attemptCount >= this.maxRetries) {
        return { success: false, message: 'Max retries exceeded' };
      }

      await this.retryWebhookDelivery(delivery);
      return { success: true, message: 'Delivery queued for retry' };
    } catch (error) {
      this.logger.error(`Failed to manually retry delivery: ${error.message}`);
      return { success: false, message: error.message };
    }
  }

  /**
   * Get dead letter queue items
   */
  async getDeadLetterQueue(
    tenantId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    items: any[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      const skip = (page - 1) * limit;

      const [items, total] = await Promise.all([
        this.prisma.webhookDeadLetter.findMany({
          where: {
            webhook: { tenantId },
          },
          include: {
            webhook: true,
          },
          orderBy: { movedAt: 'desc' },
          skip,
          take: limit,
        }),
        this.prisma.webhookDeadLetter.count({
          where: {
            webhook: { tenantId },
          },
        }),
      ]);

      return {
        items,
        total,
        hasMore: skip + limit < total,
      };
    } catch (error) {
      this.logger.error(`Failed to get dead letter queue: ${error.message}`);
      return { items: [], total: 0, hasMore: false };
    }
  }

  /**
   * Reprocess dead letter queue item
   */
  async reprocessDeadLetterItem(
    tenantId: string,
    deadLetterId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const deadLetterItem = await this.prisma.webhookDeadLetter.findFirst({
        where: {
          id: deadLetterId,
          webhook: { tenantId },
        },
        include: {
          webhook: true,
        },
      });

      if (!deadLetterItem) {
        return { success: false, message: 'Dead letter item not found' };
      }

      // Create new delivery record
      const newDelivery = await this.prisma.webhookDelivery.create({
        data: {
          webhookId: deadLetterItem.webhookId,
          event: deadLetterItem.event,
          payload: deadLetterItem.payload,
          status: DeliveryStatus.PENDING,
          attemptCount: 0,
          maxAttempts: deadLetterItem.webhook.retryAttempts,
        },
      });

      // Add to queue for processing
      await this.queueService.addJob('webhook', 'deliver-webhook', {
        deliveryId: newDelivery.id,
        webhookId: deadLetterItem.webhookId,
        url: deadLetterItem.webhook.url,
        secret: deadLetterItem.webhook.secret,
        headers: deadLetterItem.webhook.headers,
        timeout: deadLetterItem.webhook.timeout,
        event: deadLetterItem.event,
        payload: deadLetterItem.payload,
      }, {
        priority: 0,
        attempts: 1,
        removeOnComplete: 5,
        removeOnFail: 3,
      });

      // Mark dead letter item as reprocessed
      await this.prisma.webhookDeadLetter.update({
        where: { id: deadLetterId },
        data: {
          reprocessed: true,
          reprocessedAt: new Date(),
        },
      });

      return { success: true, message: 'Dead letter item queued for reprocessing' };
    } catch (error) {
      this.logger.error(`Failed to reprocess dead letter item: ${error.message}`);
      return { success: false, message: error.message };
    }
  }
}
