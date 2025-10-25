import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../common/prisma.service';
import { CacheService } from '../../../services/cache.service';
import { 
  CreateNotificationDto, 
  NotificationType,
  NotificationPriority 
} from '../dto/notifications.dto';

/**
 * Push Notification Service for LexiScan AI
 * 
 * Handles push notifications with:
 * - Firebase Cloud Messaging (FCM) integration
 * - Apple Push Notification Service (APNs) support
 * - Web Push API for browsers
 * - Device token management
 * - Notification scheduling and delivery
 * - Multi-platform support (iOS, Android, Web)
 */
@Injectable()
export class PushNotificationService {
  private readonly logger = new Logger(PushNotificationService.name);
  private readonly fcmEnabled: boolean;
  private readonly apnsEnabled: boolean;
  private readonly webPushEnabled: boolean;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private cacheService: CacheService,
  ) {
    this.fcmEnabled = !!this.configService.get<string>('FCM_SERVER_KEY');
    this.apnsEnabled = !!this.configService.get<string>('APNS_KEY_ID');
    this.webPushEnabled = !!this.configService.get<string>('VAPID_PUBLIC_KEY');

    if (!this.fcmEnabled && !this.apnsEnabled && !this.webPushEnabled) {
      this.logger.warn('No push notification services configured');
    }
  }

  /**
   * Send push notification to a single device
   */
  async sendPushNotification(
    tenantId: string,
    notificationData: CreateNotificationDto,
    deviceToken: string,
    platform: 'ios' | 'android' | 'web'
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      this.logger.log(`Sending push notification to ${platform} device: ${deviceToken}`);

      let result: { success: boolean; messageId?: string; error?: string };

      switch (platform) {
        case 'ios':
          result = await this.sendAPNsNotification(tenantId, notificationData, deviceToken);
          break;
        case 'android':
          result = await this.sendFCMNotification(tenantId, notificationData, deviceToken);
          break;
        case 'web':
          result = await this.sendWebPushNotification(tenantId, notificationData, deviceToken);
          break;
        default:
          throw new Error(`Unsupported platform: ${platform}`);
      }

      // Store notification record
      if (result.success) {
        await this.storePushNotificationRecord(tenantId, {
          ...notificationData,
          deviceToken,
          platform,
          messageId: result.messageId,
          status: 'sent',
        });
      }

      return result;
    } catch (error) {
      this.logger.error(`Failed to send push notification: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send push notification to multiple devices
   */
  async sendBulkPushNotifications(
    tenantId: string,
    notificationData: CreateNotificationDto,
    deviceTokens: Array<{ token: string; platform: 'ios' | 'android' | 'web' }>
  ): Promise<{
    totalSent: number;
    totalFailed: number;
    results: Array<{ success: boolean; deviceToken: string; error?: string }>;
  }> {
    try {
      this.logger.log(`Sending bulk push notifications to ${deviceTokens.length} devices`);

      const results: Array<{ success: boolean; deviceToken: string; error?: string }> = [];
      let totalSent = 0;
      let totalFailed = 0;

      // Process notifications in parallel with rate limiting
      const batchSize = 100;
      for (let i = 0; i < deviceTokens.length; i += batchSize) {
        const batch = deviceTokens.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async ({ token, platform }) => {
          try {
            const result = await this.sendPushNotification(tenantId, notificationData, token, platform);
            if (result.success) {
              totalSent++;
            } else {
              totalFailed++;
            }
            return { success: result.success, deviceToken: token, error: result.error };
          } catch (error) {
            totalFailed++;
            return { success: false, deviceToken: token, error: error.message };
          }
        });

        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);

        // Rate limiting delay
        if (i + batchSize < deviceTokens.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      this.logger.log(`Bulk push notifications completed: ${totalSent} sent, ${totalFailed} failed`);
      return { totalSent, totalFailed, results };
    } catch (error) {
      this.logger.error(`Failed to send bulk push notifications: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send Firebase Cloud Messaging notification
   */
  private async sendFCMNotification(
    tenantId: string,
    notificationData: CreateNotificationDto,
    deviceToken: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.fcmEnabled) {
      return { success: false, error: 'FCM not configured' };
    }

    try {
      const fcm = require('firebase-admin');
      
      const message = {
        token: deviceToken,
        notification: {
          title: notificationData.title,
          body: notificationData.message,
        },
        data: {
          type: notificationData.type,
          tenantId,
          actionUrl: notificationData.actionUrl || '',
          actionText: notificationData.actionText || '',
          ...notificationData.data,
        },
        android: {
          priority: this.getAndroidPriority(notificationData.priority),
          notification: {
            icon: 'ic_notification',
            color: '#2563eb',
            sound: 'default',
            clickAction: 'FLUTTER_NOTIFICATION_CLICK',
          },
        },
        apns: {
          payload: {
            aps: {
              alert: {
                title: notificationData.title,
                body: notificationData.message,
              },
              badge: 1,
              sound: 'default',
              category: notificationData.type,
            },
          },
        },
      };

      const response = await fcm.messaging().send(message);
      
      this.logger.log(`FCM notification sent successfully: ${response}`);
      return { success: true, messageId: response };
    } catch (error) {
      this.logger.error(`FCM notification failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send Apple Push Notification Service notification
   */
  private async sendAPNsNotification(
    tenantId: string,
    notificationData: CreateNotificationDto,
    deviceToken: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.apnsEnabled) {
      return { success: false, error: 'APNs not configured' };
    }

    try {
      const apn = require('apn');
      
      const provider = new apn.Provider({
        token: {
          key: this.configService.get<string>('APNS_KEY_PATH'),
          keyId: this.configService.get<string>('APNS_KEY_ID'),
          teamId: this.configService.get<string>('APNS_TEAM_ID'),
        },
        production: this.configService.get<string>('NODE_ENV') === 'production',
      });

      const notification = new apn.Notification();
      notification.alert = {
        title: notificationData.title,
        body: notificationData.message,
      };
      notification.badge = 1;
      notification.sound = 'default';
      notification.category = notificationData.type;
      notification.payload = {
        type: notificationData.type,
        tenantId,
        actionUrl: notificationData.actionUrl,
        actionText: notificationData.actionText,
        ...notificationData.data,
      };
      notification.priority = this.getAPNsPriority(notificationData.priority);
      notification.expiry = Math.floor(Date.now() / 1000) + 3600; // 1 hour

      const response = await provider.send(notification, deviceToken);
      
      if (response.failed && response.failed.length > 0) {
        throw new Error(`APNs delivery failed: ${response.failed[0].error}`);
      }

      this.logger.log(`APNs notification sent successfully`);
      return { success: true, messageId: response.sent[0]?.toString() };
    } catch (error) {
      this.logger.error(`APNs notification failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send Web Push notification
   */
  private async sendWebPushNotification(
    tenantId: string,
    notificationData: CreateNotificationDto,
    deviceToken: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.webPushEnabled) {
      return { success: false, error: 'Web Push not configured' };
    }

    try {
      const webpush = require('web-push');
      
      const vapidKeys = {
        publicKey: this.configService.get<string>('VAPID_PUBLIC_KEY'),
        privateKey: this.configService.get<string>('VAPID_PRIVATE_KEY'),
      };

      webpush.setVapidDetails(
        'mailto:admin@lexiscan.ai',
        vapidKeys.publicKey,
        vapidKeys.privateKey
      );

      const payload = JSON.stringify({
        title: notificationData.title,
        body: notificationData.message,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        data: {
          type: notificationData.type,
          tenantId,
          actionUrl: notificationData.actionUrl,
          actionText: notificationData.actionText,
          ...notificationData.data,
        },
        actions: notificationData.actionText ? [{
          action: 'open',
          title: notificationData.actionText,
        }] : [],
      });

      const response = await webpush.sendNotification(deviceToken, payload);
      
      this.logger.log(`Web Push notification sent successfully`);
      return { success: true, messageId: response.headers['location'] };
    } catch (error) {
      this.logger.error(`Web Push notification failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Register device token for push notifications
   */
  async registerDeviceToken(
    tenantId: string,
    userId: string,
    deviceToken: string,
    platform: 'ios' | 'android' | 'web',
    deviceInfo?: {
      deviceId?: string;
      appVersion?: string;
      osVersion?: string;
      model?: string;
    }
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Store device token in database
      await this.prisma.deviceToken.create({
        data: {
          tenantId,
          userId,
          token: deviceToken,
          platform,
          deviceId: deviceInfo?.deviceId,
          appVersion: deviceInfo?.appVersion,
          osVersion: deviceInfo?.osVersion,
          model: deviceInfo?.model,
          isActive: true,
        },
      });

      // Cache device token for quick access
      await this.cacheService.set(
        `device_token:${tenantId}:${userId}:${deviceToken}`,
        { platform, isActive: true },
        86400 // 24 hours
      );

      this.logger.log(`Device token registered: ${deviceToken} for user ${userId}`);
      return { success: true, message: 'Device token registered successfully' };
    } catch (error) {
      this.logger.error(`Failed to register device token: ${error.message}`);
      return { success: false, message: error.message };
    }
  }

  /**
   * Unregister device token
   */
  async unregisterDeviceToken(
    tenantId: string,
    userId: string,
    deviceToken: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Deactivate device token
      await this.prisma.deviceToken.updateMany({
        where: {
          tenantId,
          userId,
          token: deviceToken,
        },
        data: {
          isActive: false,
          deactivatedAt: new Date(),
        },
      });

      // Remove from cache
      await this.cacheService.del(`device_token:${tenantId}:${userId}:${deviceToken}`);

      this.logger.log(`Device token unregistered: ${deviceToken} for user ${userId}`);
      return { success: true, message: 'Device token unregistered successfully' };
    } catch (error) {
      this.logger.error(`Failed to unregister device token: ${error.message}`);
      return { success: false, message: error.message };
    }
  }

  /**
   * Get user's device tokens
   */
  async getUserDeviceTokens(
    tenantId: string,
    userId: string
  ): Promise<Array<{
    token: string;
    platform: string;
    isActive: boolean;
    lastUsed: Date;
  }>> {
    try {
      const tokens = await this.prisma.deviceToken.findMany({
        where: {
          tenantId,
          userId,
          isActive: true,
        },
        select: {
          token: true,
          platform: true,
          isActive: true,
          lastUsed: true,
        },
      });

      return tokens;
    } catch (error) {
      this.logger.error(`Failed to get user device tokens: ${error.message}`);
      return [];
    }
  }

  /**
   * Store push notification record
   */
  private async storePushNotificationRecord(
    tenantId: string,
    data: {
      recipients: Array<{ userId: string }>;
      title: string;
      message: string;
      type: NotificationType;
      deviceToken: string;
      platform: string;
      messageId?: string;
      status: string;
    }
  ): Promise<void> {
    try {
      await this.prisma.pushNotification.create({
        data: {
          tenantId,
          userId: data.recipients[0].userId,
          title: data.title,
          message: data.message,
          type: data.type,
          deviceToken: data.deviceToken,
          platform: data.platform,
          messageId: data.messageId,
          status: data.status,
          sentAt: new Date(),
        },
      });
    } catch (error) {
      this.logger.error(`Failed to store push notification record: ${error.message}`);
    }
  }

  /**
   * Get Android priority from notification priority
   */
  private getAndroidPriority(priority?: NotificationPriority): string {
    const priorityMap = {
      [NotificationPriority.LOW]: 'normal',
      [NotificationPriority.NORMAL]: 'normal',
      [NotificationPriority.HIGH]: 'high',
      [NotificationPriority.URGENT]: 'high',
    };
    return priorityMap[priority || NotificationPriority.NORMAL];
  }

  /**
   * Get APNs priority from notification priority
   */
  private getAPNsPriority(priority?: NotificationPriority): number {
    const priorityMap = {
      [NotificationPriority.LOW]: 5,
      [NotificationPriority.NORMAL]: 5,
      [NotificationPriority.HIGH]: 10,
      [NotificationPriority.URGENT]: 10,
    };
    return priorityMap[priority || NotificationPriority.NORMAL];
  }
}
