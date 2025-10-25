import { 
  Controller, 
  Post, 
  Get, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
  ParseUUIDPipe,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { ThrottleGuard } from '../../common/guards/throttle.guard';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { UserId } from '../../common/decorators/user-id.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';

// Services
import { EmailService } from './email/email.service';
import { EmailQueueService } from './email/email.queue';
import { InAppNotificationService } from './notifications/in-app.service';
import { PushNotificationService } from './notifications/push.service';
import { SmsNotificationService } from './notifications/sms.service';
import { WebhookService } from './webhooks/webhook.service';
import { WebhookRetryService } from './webhooks/webhook-retry.service';

// DTOs
import {
  SendEmailDto,
  BulkEmailDto,
  EmailQueryDto,
  CreateNotificationDto,
  UpdateNotificationDto,
  NotificationQueryDto,
  CreateWebhookDto,
  UpdateWebhookDto,
  WebhookQueryDto,
  TestWebhookDto,
} from './dto';

/**
 * Communications Controller for LexiScan AI
 * 
 * Provides comprehensive API endpoints for:
 * - Email management and sending
 * - Multi-channel notifications
 * - Webhook configuration and delivery
 * - Communication analytics and monitoring
 */
@Controller('communications')
@UseGuards(JwtAuthGuard, TenantGuard, ThrottleGuard)
export class CommunicationsController {
  private readonly logger = new Logger(CommunicationsController.name);

  constructor(
    private emailService: EmailService,
    private emailQueueService: EmailQueueService,
    private inAppService: InAppNotificationService,
    private pushService: PushNotificationService,
    private smsService: SmsNotificationService,
    private webhookService: WebhookService,
    private webhookRetryService: WebhookRetryService,
  ) {}

  // ============================================================================
  // EMAIL ENDPOINTS
  // ============================================================================

  /**
   * Send a single email
   */
  @Post('email/send')
  @HttpCode(HttpStatus.OK)
  @Permissions('email:send')
  async sendEmail(
    @TenantId() tenantId: string,
    @Body(ValidationPipe) emailData: SendEmailDto,
  ) {
    this.logger.log(`Sending email for tenant ${tenantId}`);
    
    const result = await this.emailService.sendEmail(tenantId, emailData, {
      trackOpens: true,
      trackClicks: true,
      priority: emailData.priority,
    });

    return {
      success: result.success,
      messageId: result.messageId,
      error: result.error,
    };
  }

  /**
   * Send bulk emails
   */
  @Post('email/bulk')
  @HttpCode(HttpStatus.OK)
  @Permissions('email:send')
  async sendBulkEmails(
    @TenantId() tenantId: string,
    @Body(ValidationPipe) bulkData: BulkEmailDto,
  ) {
    this.logger.log(`Sending bulk emails for tenant ${tenantId}`);
    
    const result = await this.emailService.sendBulkEmails(tenantId, bulkData, {
      batchSize: bulkData.batchSize,
      delayBetweenBatches: bulkData.delayBetweenBatches,
      stopOnError: bulkData.stopOnError,
    });

    return {
      totalSent: result.totalSent,
      totalFailed: result.totalFailed,
      results: result.results,
    };
  }

  /**
   * Queue email for processing
   */
  @Post('email/queue')
  @HttpCode(HttpStatus.OK)
  @Permissions('email:send')
  async queueEmail(
    @TenantId() tenantId: string,
    @Body(ValidationPipe) emailData: SendEmailDto,
  ) {
    this.logger.log(`Queueing email for tenant ${tenantId}`);
    
    const result = await this.emailQueueService.addEmailToQueue(tenantId, emailData, {
      priority: emailData.priority === 'urgent' ? 1 : 0,
      delay: emailData.delay || 0,
      attempts: 3,
    });

    return {
      jobId: result.jobId,
      status: result.status,
    };
  }

  /**
   * Get email statistics
   */
  @Get('email/stats')
  @Permissions('email:read')
  async getEmailStats(
    @TenantId() tenantId: string,
    @Query(ValidationPipe) query: EmailQueryDto,
  ) {
    this.logger.log(`Getting email stats for tenant ${tenantId}`);
    
    const stats = await this.emailService.getEmailStats(tenantId, query);
    return stats;
  }

  /**
   * Validate email configuration
   */
  @Get('email/validate')
  @Permissions('email:read')
  async validateEmailConfig() {
    this.logger.log('Validating email configuration');
    
    const validation = await this.emailService.validateConfiguration();
    return validation;
  }

  // ============================================================================
  // NOTIFICATION ENDPOINTS
  // ============================================================================

  /**
   * Create in-app notification
   */
  @Post('notifications/in-app')
  @HttpCode(HttpStatus.CREATED)
  @Permissions('notification:create')
  async createNotification(
    @TenantId() tenantId: string,
    @Body(ValidationPipe) notificationData: CreateNotificationDto,
  ) {
    this.logger.log(`Creating notification for tenant ${tenantId}`);
    
    const result = await this.inAppService.createNotification(tenantId, notificationData);
    return result;
  }

  /**
   * Get user notifications
   */
  @Get('notifications')
  @Permissions('notification:read')
  async getUserNotifications(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Query(ValidationPipe) query: NotificationQueryDto,
  ) {
    this.logger.log(`Getting notifications for user ${userId} in tenant ${tenantId}`);
    
    const result = await this.inAppService.getUserNotifications(tenantId, userId, query);
    return result;
  }

  /**
   * Mark notification as read
   */
  @Put('notifications/:id/read')
  @HttpCode(HttpStatus.OK)
  @Permissions('notification:update')
  async markAsRead(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Param('id', ParseUUIDPipe) notificationId: string,
  ) {
    this.logger.log(`Marking notification ${notificationId} as read`);
    
    const result = await this.inAppService.markAsRead(tenantId, notificationId, userId);
    return result;
  }

  /**
   * Mark all notifications as read
   */
  @Put('notifications/read-all')
  @HttpCode(HttpStatus.OK)
  @Permissions('notification:update')
  async markAllAsRead(
    @TenantId() tenantId: string,
    @UserId() userId: string,
  ) {
    this.logger.log(`Marking all notifications as read for user ${userId}`);
    
    const result = await this.inAppService.markAllAsRead(tenantId, userId);
    return result;
  }

  /**
   * Delete notification
   */
  @Delete('notifications/:id')
  @HttpCode(HttpStatus.OK)
  @Permissions('notification:delete')
  async deleteNotification(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Param('id', ParseUUIDPipe) notificationId: string,
  ) {
    this.logger.log(`Deleting notification ${notificationId}`);
    
    const result = await this.inAppService.deleteNotification(tenantId, notificationId, userId);
    return result;
  }

  /**
   * Get notification statistics
   */
  @Get('notifications/stats')
  @Permissions('notification:read')
  async getNotificationStats(
    @TenantId() tenantId: string,
    @Query(ValidationPipe) query: NotificationQueryDto,
  ) {
    this.logger.log(`Getting notification stats for tenant ${tenantId}`);
    
    const stats = await this.inAppService.getNotificationStats(tenantId, query);
    return stats;
  }

  // ============================================================================
  // PUSH NOTIFICATION ENDPOINTS
  // ============================================================================

  /**
   * Register device token for push notifications
   */
  @Post('push/register')
  @HttpCode(HttpStatus.OK)
  @Permissions('notification:create')
  async registerDeviceToken(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Body() data: {
      token: string;
      platform: 'ios' | 'android' | 'web';
      deviceInfo?: {
        deviceId?: string;
        appVersion?: string;
        osVersion?: string;
        model?: string;
      };
    },
  ) {
    this.logger.log(`Registering device token for user ${userId}`);
    
    const result = await this.pushService.registerDeviceToken(
      tenantId,
      userId,
      data.token,
      data.platform,
      data.deviceInfo,
    );
    return result;
  }

  /**
   * Unregister device token
   */
  @Delete('push/unregister')
  @HttpCode(HttpStatus.OK)
  @Permissions('notification:delete')
  async unregisterDeviceToken(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Body() data: { token: string },
  ) {
    this.logger.log(`Unregistering device token for user ${userId}`);
    
    const result = await this.pushService.unregisterDeviceToken(tenantId, userId, data.token);
    return result;
  }

  /**
   * Get user device tokens
   */
  @Get('push/devices')
  @Permissions('notification:read')
  async getUserDeviceTokens(
    @TenantId() tenantId: string,
    @UserId() userId: string,
  ) {
    this.logger.log(`Getting device tokens for user ${userId}`);
    
    const tokens = await this.pushService.getUserDeviceTokens(tenantId, userId);
    return { tokens };
  }

  // ============================================================================
  // SMS NOTIFICATION ENDPOINTS
  // ============================================================================

  /**
   * Send SMS notification
   */
  @Post('sms/send')
  @HttpCode(HttpStatus.OK)
  @Permissions('notification:send')
  async sendSmsNotification(
    @TenantId() tenantId: string,
    @Body() data: {
      phoneNumber: string;
      message: string;
      provider?: 'twilio' | 'aws-sns';
    },
  ) {
    this.logger.log(`Sending SMS notification for tenant ${tenantId}`);
    
    const notificationData: CreateNotificationDto = {
      recipients: [{ userId: 'system' }],
      title: 'SMS Notification',
      message: data.message,
      type: 'CUSTOM' as any,
      channels: ['SMS' as any],
    };

    const result = await this.smsService.sendSmsNotification(
      tenantId,
      notificationData,
      data.phoneNumber,
      data.provider || 'twilio',
    );
    return result;
  }

  /**
   * Get SMS statistics
   */
  @Get('sms/stats')
  @Permissions('notification:read')
  async getSmsStats(
    @TenantId() tenantId: string,
    @Query() query: { startDate: string; endDate: string },
  ) {
    this.logger.log(`Getting SMS stats for tenant ${tenantId}`);
    
    const stats = await this.smsService.getSmsStats(
      tenantId,
      new Date(query.startDate),
      new Date(query.endDate),
    );
    return stats;
  }

  // ============================================================================
  // WEBHOOK ENDPOINTS
  // ============================================================================

  /**
   * Create webhook
   */
  @Post('webhooks')
  @HttpCode(HttpStatus.CREATED)
  @Permissions('webhook:create')
  async createWebhook(
    @TenantId() tenantId: string,
    @Body(ValidationPipe) webhookData: CreateWebhookDto,
  ) {
    this.logger.log(`Creating webhook for tenant ${tenantId}`);
    
    const result = await this.webhookService.createWebhook(tenantId, webhookData);
    return result;
  }

  /**
   * Get webhooks
   */
  @Get('webhooks')
  @Permissions('webhook:read')
  async getWebhooks(
    @TenantId() tenantId: string,
    @Query(ValidationPipe) query: WebhookQueryDto,
  ) {
    this.logger.log(`Getting webhooks for tenant ${tenantId}`);
    
    const result = await this.webhookService.getWebhooks(tenantId, query);
    return result;
  }

  /**
   * Update webhook
   */
  @Put('webhooks/:id')
  @HttpCode(HttpStatus.OK)
  @Permissions('webhook:update')
  async updateWebhook(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) webhookId: string,
    @Body(ValidationPipe) updateData: UpdateWebhookDto,
  ) {
    this.logger.log(`Updating webhook ${webhookId} for tenant ${tenantId}`);
    
    const result = await this.webhookService.updateWebhook(tenantId, webhookId, updateData);
    return result;
  }

  /**
   * Delete webhook
   */
  @Delete('webhooks/:id')
  @HttpCode(HttpStatus.OK)
  @Permissions('webhook:delete')
  async deleteWebhook(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) webhookId: string,
  ) {
    this.logger.log(`Deleting webhook ${webhookId} for tenant ${tenantId}`);
    
    const result = await this.webhookService.deleteWebhook(tenantId, webhookId);
    return result;
  }

  /**
   * Test webhook
   */
  @Post('webhooks/:id/test')
  @HttpCode(HttpStatus.OK)
  @Permissions('webhook:test')
  async testWebhook(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) webhookId: string,
    @Body() testData: TestWebhookDto,
  ) {
    this.logger.log(`Testing webhook ${webhookId} for tenant ${tenantId}`);
    
    const result = await this.webhookService.testWebhook(tenantId, webhookId, testData.testPayload);
    return result;
  }

  /**
   * Get webhook statistics
   */
  @Get('webhooks/stats')
  @Permissions('webhook:read')
  async getWebhookStats(
    @TenantId() tenantId: string,
    @Query() query: { startDate: string; endDate: string },
  ) {
    this.logger.log(`Getting webhook stats for tenant ${tenantId}`);
    
    const stats = await this.webhookService.getWebhookStats(
      tenantId,
      new Date(query.startDate),
      new Date(query.endDate),
    );
    return stats;
  }

  /**
   * Get dead letter queue
   */
  @Get('webhooks/dead-letter')
  @Permissions('webhook:read')
  async getDeadLetterQueue(
    @TenantId() tenantId: string,
    @Query() query: { page?: number; limit?: number },
  ) {
    this.logger.log(`Getting dead letter queue for tenant ${tenantId}`);
    
    const result = await this.webhookRetryService.getDeadLetterQueue(
      tenantId,
      query.page || 1,
      query.limit || 20,
    );
    return result;
  }

  /**
   * Reprocess dead letter item
   */
  @Post('webhooks/dead-letter/:id/reprocess')
  @HttpCode(HttpStatus.OK)
  @Permissions('webhook:reprocess')
  async reprocessDeadLetterItem(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) deadLetterId: string,
  ) {
    this.logger.log(`Reprocessing dead letter item ${deadLetterId} for tenant ${tenantId}`);
    
    const result = await this.webhookRetryService.reprocessDeadLetterItem(tenantId, deadLetterId);
    return result;
  }

  // ============================================================================
  // HEALTH CHECK ENDPOINTS
  // ============================================================================

  /**
   * Get communication service health
   */
  @Get('health')
  @Permissions('system:read')
  async getHealthStatus() {
    this.logger.log('Checking communication services health');
    
    const health = {
      email: await this.emailService.validateConfiguration(),
      push: {
        fcm: !!process.env.FCM_SERVER_KEY,
        apns: !!process.env.APNS_KEY_ID,
        webPush: !!process.env.VAPID_PUBLIC_KEY,
      },
      sms: {
        twilio: !!process.env.TWILIO_ACCOUNT_SID,
        awsSns: !!process.env.AWS_ACCESS_KEY_ID,
      },
      webhooks: {
        maxRetries: process.env.WEBHOOK_MAX_RETRIES || 3,
        retryDelay: process.env.WEBHOOK_RETRY_DELAY || 5000,
        timeout: process.env.WEBHOOK_TIMEOUT || 30000,
      },
    };

    return {
      status: 'healthy',
      services: health,
      timestamp: new Date().toISOString(),
    };
  }
}
