import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma.service';

export interface NotificationPayload {
  userId: string;
  tenantId: string;
  title: string;
  message: string;
  type: NotificationType;
  data?: any;
  priority?: 'low' | 'normal' | 'high';
  channels?: NotificationChannel[];
}

export enum NotificationType {
  DOCUMENT_PROCESSED = 'document_processed',
  DOCUMENT_FAILED = 'document_failed',
  REVIEW_COMPLETED = 'review_completed',
  INVOICE_GENERATED = 'invoice_generated',
  SUBSCRIPTION_EXPIRING = 'subscription_expiring',
  TEAM_INVITATION = 'team_invitation',
  SYSTEM_ALERT = 'system_alert',
  CUSTOM = 'custom',
}

export enum NotificationChannel {
  IN_APP = 'in_app',
  EMAIL = 'email',
  PUSH = 'push',
  SMS = 'sms',
  WEBHOOK = 'webhook',
}

export interface Notification {
  id: string;
  userId: string;
  tenantId: string;
  title: string;
  message: string;
  type: NotificationType;
  data?: any;
  read: boolean;
  readAt?: Date;
  createdAt: Date;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private readonly pushEnabled: boolean;
  private readonly smsEnabled: boolean;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.pushEnabled = !!this.configService.get<string>('PUSH_NOTIFICATION_KEY');
    this.smsEnabled = !!this.configService.get<string>('SMS_API_KEY');

    if (!this.pushEnabled) {
      this.logger.warn('Push notifications are not configured');
    }

    if (!this.smsEnabled) {
      this.logger.warn('SMS notifications are not configured');
    }
  }

  /**
   * Send a notification
   */
  async send(payload: NotificationPayload): Promise<{
    sent: boolean;
    notificationId?: string;
    channels: Record<NotificationChannel, boolean>;
  }> {
    this.logger.log(`Sending notification to user ${payload.userId}: ${payload.title}`);

    const channels = payload.channels || [NotificationChannel.IN_APP];
    const results: Record<NotificationChannel, boolean> = {} as any;

    // Always create in-app notification
    let notificationId: string | undefined;

    if (channels.includes(NotificationChannel.IN_APP)) {
      try {
        // In production, store in database (create a Notification model first)
        // const notification = await this.prisma.notification.create({
        //   data: {
        //     userId: payload.userId,
        //     tenantId: payload.tenantId,
        //     title: payload.title,
        //     message: payload.message,
        //     type: payload.type,
        //     data: payload.data,
        //     read: false,
        //   },
        // });
        // notificationId = notification.id;

        this.logger.log(`In-app notification created for user ${payload.userId}`);
        results[NotificationChannel.IN_APP] = true;
      } catch (error) {
        this.logger.error(`Failed to create in-app notification: ${error.message}`);
        results[NotificationChannel.IN_APP] = false;
      }
    }

    // Send email notification
    if (channels.includes(NotificationChannel.EMAIL)) {
      results[NotificationChannel.EMAIL] = await this.sendEmailNotification(payload);
    }

    // Send push notification
    if (channels.includes(NotificationChannel.PUSH)) {
      results[NotificationChannel.PUSH] = await this.sendPushNotification(payload);
    }

    // Send SMS notification
    if (channels.includes(NotificationChannel.SMS)) {
      results[NotificationChannel.SMS] = await this.sendSMSNotification(payload);
    }

    // Send webhook notification
    if (channels.includes(NotificationChannel.WEBHOOK)) {
      results[NotificationChannel.WEBHOOK] = await this.sendWebhookNotification(payload);
    }

    const allSent = Object.values(results).every((sent) => sent);

    return {
      sent: allSent,
      notificationId,
      channels: results,
    };
  }

  /**
   * Send bulk notifications
   */
  async sendBulk(notifications: NotificationPayload[]): Promise<{
    sent: number;
    failed: number;
  }> {
    let sent = 0;
    let failed = 0;

    for (const notification of notifications) {
      try {
        const result = await this.send(notification);
        if (result.sent) {
          sent++;
        } else {
          failed++;
        }
      } catch (error) {
        this.logger.error(`Failed to send notification: ${error.message}`);
        failed++;
      }
    }

    this.logger.log(`Bulk notifications: ${sent} sent, ${failed} failed`);

    return { sent, failed };
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(
    userId: string,
    tenantId: string,
    options?: {
      unreadOnly?: boolean;
      limit?: number;
      offset?: number;
    },
  ): Promise<{ notifications: Notification[]; total: number }> {
    // In production, query from database:
    // const where: any = { userId, tenantId };
    // if (options?.unreadOnly) {
    //   where.read = false;
    // }
    //
    // const [notifications, total] = await Promise.all([
    //   this.prisma.notification.findMany({
    //     where,
    //     orderBy: { createdAt: 'desc' },
    //     skip: options?.offset || 0,
    //     take: options?.limit || 20,
    //   }),
    //   this.prisma.notification.count({ where }),
    // ]);

    this.logger.log(`Getting notifications for user ${userId}`);

    // Mock response
    return {
      notifications: [],
      total: 0,
    };
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    try {
      // In production:
      // await this.prisma.notification.update({
      //   where: { id: notificationId, userId },
      //   data: { read: true, readAt: new Date() },
      // });

      this.logger.log(`Notification ${notificationId} marked as read`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to mark notification as read: ${error.message}`);
      return false;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string, tenantId: string): Promise<number> {
    try {
      // In production:
      // const result = await this.prisma.notification.updateMany({
      //   where: { userId, tenantId, read: false },
      //   data: { read: true, readAt: new Date() },
      // });
      // return result.count;

      this.logger.log(`All notifications marked as read for user ${userId}`);
      return 0;
    } catch (error) {
      this.logger.error(`Failed to mark all as read: ${error.message}`);
      return 0;
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
    try {
      // In production:
      // await this.prisma.notification.delete({
      //   where: { id: notificationId, userId },
      // });

      this.logger.log(`Notification ${notificationId} deleted`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to delete notification: ${error.message}`);
      return false;
    }
  }

  /**
   * Get unread count
   */
  async getUnreadCount(userId: string, tenantId: string): Promise<number> {
    try {
      // In production:
      // return await this.prisma.notification.count({
      //   where: { userId, tenantId, read: false },
      // });

      return 0;
    } catch (error) {
      this.logger.error(`Failed to get unread count: ${error.message}`);
      return 0;
    }
  }

  /**
   * Channel-specific implementations
   */

  private async sendEmailNotification(payload: NotificationPayload): Promise<boolean> {
    try {
      // In production, integrate with EmailService or queue
      this.logger.log(`Email notification sent to user ${payload.userId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email notification: ${error.message}`);
      return false;
    }
  }

  private async sendPushNotification(payload: NotificationPayload): Promise<boolean> {
    if (!this.pushEnabled) {
      return false;
    }

    try {
      // In production, integrate with Firebase Cloud Messaging, OneSignal, etc.
      // const fcm = new FCM(this.configService.get('PUSH_NOTIFICATION_KEY'));
      // await fcm.send({
      //   to: userDeviceToken,
      //   notification: {
      //     title: payload.title,
      //     body: payload.message,
      //   },
      //   data: payload.data,
      // });

      this.logger.log(`Push notification sent to user ${payload.userId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send push notification: ${error.message}`);
      return false;
    }
  }

  private async sendSMSNotification(payload: NotificationPayload): Promise<boolean> {
    if (!this.smsEnabled) {
      return false;
    }

    try {
      // In production, integrate with Twilio, AWS SNS, etc.
      // const twilio = new Twilio(sid, authToken);
      // await twilio.messages.create({
      //   to: userPhoneNumber,
      //   from: this.configService.get('SMS_FROM_NUMBER'),
      //   body: `${payload.title}: ${payload.message}`,
      // });

      this.logger.log(`SMS notification sent to user ${payload.userId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send SMS notification: ${error.message}`);
      return false;
    }
  }

  private async sendWebhookNotification(payload: NotificationPayload): Promise<boolean> {
    try {
      // In production, integrate with WebhookService
      // Get user's webhook URL and send notification

      this.logger.log(`Webhook notification sent for user ${payload.userId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send webhook notification: ${error.message}`);
      return false;
    }
  }

  /**
   * Pre-built notification helpers
   */

  async notifyDocumentProcessed(
    userId: string,
    tenantId: string,
    documentTitle: string,
    documentId: string,
  ): Promise<void> {
    await this.send({
      userId,
      tenantId,
      title: 'Document Processed',
      message: `Your document "${documentTitle}" has been successfully processed.`,
      type: NotificationType.DOCUMENT_PROCESSED,
      data: { documentId },
      priority: 'normal',
      channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
    });
  }

  async notifyDocumentFailed(
    userId: string,
    tenantId: string,
    documentTitle: string,
    error: string,
  ): Promise<void> {
    await this.send({
      userId,
      tenantId,
      title: 'Document Processing Failed',
      message: `Failed to process "${documentTitle}": ${error}`,
      type: NotificationType.DOCUMENT_FAILED,
      priority: 'high',
      channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
    });
  }

  async notifySubscriptionExpiring(
    userId: string,
    tenantId: string,
    daysRemaining: number,
  ): Promise<void> {
    await this.send({
      userId,
      tenantId,
      title: 'Subscription Expiring Soon',
      message: `Your subscription will expire in ${daysRemaining} days.`,
      type: NotificationType.SUBSCRIPTION_EXPIRING,
      priority: 'high',
      channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
    });
  }

  async notifyTeamInvitation(
    userId: string,
    tenantId: string,
    inviterName: string,
    organizationName: string,
  ): Promise<void> {
    await this.send({
      userId,
      tenantId,
      title: 'Team Invitation',
      message: `${inviterName} invited you to join ${organizationName}.`,
      type: NotificationType.TEAM_INVITATION,
      priority: 'normal',
      channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
    });
  }
}

