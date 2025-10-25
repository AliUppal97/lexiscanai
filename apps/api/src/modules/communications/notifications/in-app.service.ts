import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';
import { CacheService } from '../../../services/cache.service';
import { 
  CreateNotificationDto, 
  UpdateNotificationDto, 
  NotificationQueryDto,
  NotificationStatsDto,
  NotificationType,
  NotificationStatus,
  NotificationPriority 
} from '../dto/notifications.dto';

/**
 * In-App Notification Service for LexiScan AI
 * 
 * Handles in-app notifications with:
 * - Real-time delivery via WebSocket
 * - Notification persistence and management
 * - User notification preferences
 * - Notification history and analytics
 * - Multi-tenant support
 * - Notification categorization and filtering
 */
@Injectable()
export class InAppNotificationService {
  private readonly logger = new Logger(InAppNotificationService.name);

  constructor(
    private prisma: PrismaService,
    private cacheService: CacheService,
  ) {}

  /**
   * Create a new in-app notification
   */
  async createNotification(
    tenantId: string,
    notificationData: CreateNotificationDto
  ): Promise<{ id: string; status: string }> {
    try {
      // Check user notification preferences
      const preferences = await this.getUserNotificationPreferences(
        tenantId,
        notificationData.recipients[0].userId
      );

      if (!preferences.inAppEnabled) {
        this.logger.warn(`In-app notifications disabled for user ${notificationData.recipients[0].userId}`);
        return { id: '', status: 'disabled' };
      }

      // Create notification record
      const notification = await this.prisma.notification.create({
        data: {
          tenantId,
          userId: notificationData.recipients[0].userId,
          title: notificationData.title,
          message: notificationData.message,
          type: notificationData.type,
          status: NotificationStatus.PENDING,
          priority: notificationData.priority || NotificationPriority.NORMAL,
          data: notificationData.data || {},
          actionUrl: notificationData.actionUrl,
          actionText: notificationData.actionText,
          persistent: notificationData.persistent || false,
          silent: notificationData.silent || false,
          scheduledAt: notificationData.scheduledAt ? new Date(notificationData.scheduledAt) : null,
          expiresAt: notificationData.expiresIn 
            ? new Date(Date.now() + notificationData.expiresIn * 1000)
            : null,
        },
      });

      // Cache notification for quick access
      await this.cacheService.set(
        `notification:${notification.id}`,
        notification,
        3600 // 1 hour
      );

      // Add to user's notification list
      await this.addToUserNotificationList(tenantId, notification.userId, notification.id);

      this.logger.log(`In-app notification created: ${notification.id} for user ${notification.userId}`);
      return { id: notification.id, status: 'created' };
    } catch (error) {
      this.logger.error(`Failed to create in-app notification: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update an existing notification
   */
  async updateNotification(
    tenantId: string,
    notificationId: string,
    updateData: UpdateNotificationDto
  ): Promise<{ success: boolean; message: string }> {
    try {
      const notification = await this.prisma.notification.update({
        where: {
          id: notificationId,
          tenantId,
        },
        data: {
          ...updateData,
          updatedAt: new Date(),
        },
      });

      // Update cache
      await this.cacheService.set(
        `notification:${notificationId}`,
        notification,
        3600
      );

      this.logger.log(`Notification updated: ${notificationId}`);
      return { success: true, message: 'Notification updated successfully' };
    } catch (error) {
      this.logger.error(`Failed to update notification: ${error.message}`);
      return { success: false, message: error.message };
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(
    tenantId: string,
    notificationId: string,
    userId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const notification = await this.prisma.notification.update({
        where: {
          id: notificationId,
          tenantId,
          userId,
        },
        data: {
          status: NotificationStatus.READ,
          readAt: new Date(),
        },
      });

      // Update cache
      await this.cacheService.set(
        `notification:${notificationId}`,
        notification,
        3600
      );

      // Remove from unread count
      await this.decrementUnreadCount(tenantId, userId);

      this.logger.log(`Notification marked as read: ${notificationId}`);
      return { success: true, message: 'Notification marked as read' };
    } catch (error) {
      this.logger.error(`Failed to mark notification as read: ${error.message}`);
      return { success: false, message: error.message };
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(
    tenantId: string,
    userId: string
  ): Promise<{ success: boolean; count: number }> {
    try {
      const result = await this.prisma.notification.updateMany({
        where: {
          tenantId,
          userId,
          status: NotificationStatus.PENDING,
        },
        data: {
          status: NotificationStatus.READ,
          readAt: new Date(),
        },
      });

      // Clear unread count
      await this.cacheService.del(`unread_count:${tenantId}:${userId}`);

      this.logger.log(`Marked ${result.count} notifications as read for user ${userId}`);
      return { success: true, count: result.count };
    } catch (error) {
      this.logger.error(`Failed to mark all notifications as read: ${error.message}`);
      return { success: false, count: 0 };
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(
    tenantId: string,
    notificationId: string,
    userId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      await this.prisma.notification.delete({
        where: {
          id: notificationId,
          tenantId,
          userId,
        },
      });

      // Remove from cache
      await this.cacheService.del(`notification:${notificationId}`);

      // Remove from user's notification list
      await this.removeFromUserNotificationList(tenantId, userId, notificationId);

      this.logger.log(`Notification deleted: ${notificationId}`);
      return { success: true, message: 'Notification deleted successfully' };
    } catch (error) {
      this.logger.error(`Failed to delete notification: ${error.message}`);
      return { success: false, message: error.message };
    }
  }

  /**
   * Get user notifications with pagination and filtering
   */
  async getUserNotifications(
    tenantId: string,
    userId: string,
    query: NotificationQueryDto
  ): Promise<{
    notifications: any[];
    total: number;
    unreadCount: number;
    hasMore: boolean;
  }> {
    try {
      const page = query.page || 1;
      const limit = query.limit || 20;
      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {
        tenantId,
        userId,
      };

      if (query.type) {
        where.type = query.type;
      }

      if (query.status) {
        where.status = query.status;
      }

      if (query.priority) {
        where.priority = query.priority;
      }

      if (query.read !== undefined) {
        where.status = query.read ? NotificationStatus.READ : NotificationStatus.PENDING;
      }

      if (query.startDate && query.endDate) {
        where.createdAt = {
          gte: new Date(query.startDate),
          lte: new Date(query.endDate),
        };
      }

      // Get notifications
      const [notifications, total, unreadCount] = await Promise.all([
        this.prisma.notification.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        this.prisma.notification.count({ where }),
        this.getUnreadCount(tenantId, userId),
      ]);

      return {
        notifications,
        total,
        unreadCount,
        hasMore: skip + limit < total,
      };
    } catch (error) {
      this.logger.error(`Failed to get user notifications: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats(
    tenantId: string,
    query: NotificationQueryDto
  ): Promise<NotificationStatsDto> {
    try {
      const startDate = query.startDate ? new Date(query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = query.endDate ? new Date(query.endDate) : new Date();

      const stats = await this.prisma.notification.groupBy({
        by: ['status', 'type', 'channel'],
        where: {
          tenantId,
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        _count: true,
      });

      // Process statistics
      const totalSent = stats.reduce((sum, stat) => sum + stat._count, 0);
      const totalDelivered = stats.filter(s => s.status === NotificationStatus.DELIVERED).reduce((sum, stat) => sum + stat._count, 0);
      const totalRead = stats.filter(s => s.status === NotificationStatus.READ).reduce((sum, stat) => sum + stat._count, 0);
      const totalFailed = stats.filter(s => s.status === NotificationStatus.FAILED).reduce((sum, stat) => sum + stat._count, 0);

      return {
        period: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
        totalSent,
        totalDelivered,
        totalRead,
        totalFailed,
        deliveryRate: totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0,
        readRate: totalDelivered > 0 ? (totalRead / totalDelivered) * 100 : 0,
        failureRate: totalSent > 0 ? (totalFailed / totalSent) * 100 : 0,
        byChannel: {},
        byType: {},
      };
    } catch (error) {
      this.logger.error(`Failed to get notification stats: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get user notification preferences
   */
  private async getUserNotificationPreferences(
    tenantId: string,
    userId: string
  ): Promise<{
    inAppEnabled: boolean;
    emailEnabled: boolean;
    pushEnabled: boolean;
    smsEnabled: boolean;
    enabledTypes: NotificationType[];
  }> {
    try {
      // Get from cache first
      const cached = await this.cacheService.get(`notification_preferences:${tenantId}:${userId}`);
      if (cached) {
        return cached;
      }

      // Get from database
      const preferences = await this.prisma.notificationPreferences.findUnique({
        where: {
          tenantId_userId: {
            tenantId,
            userId,
          },
        },
      });

      const result = {
        inAppEnabled: preferences?.inAppEnabled ?? true,
        emailEnabled: preferences?.emailEnabled ?? true,
        pushEnabled: preferences?.pushEnabled ?? true,
        smsEnabled: preferences?.smsEnabled ?? false,
        enabledTypes: preferences?.enabledTypes || Object.values(NotificationType),
      };

      // Cache for 1 hour
      await this.cacheService.set(
        `notification_preferences:${tenantId}:${userId}`,
        result,
        3600
      );

      return result;
    } catch (error) {
      this.logger.error(`Failed to get notification preferences: ${error.message}`);
      return {
        inAppEnabled: true,
        emailEnabled: true,
        pushEnabled: true,
        smsEnabled: false,
        enabledTypes: Object.values(NotificationType),
      };
    }
  }

  /**
   * Add notification to user's notification list
   */
  private async addToUserNotificationList(
    tenantId: string,
    userId: string,
    notificationId: string
  ): Promise<void> {
    try {
      await this.cacheService.lpush(
        `user_notifications:${tenantId}:${userId}`,
        notificationId
      );

      // Increment unread count
      await this.incrementUnreadCount(tenantId, userId);
    } catch (error) {
      this.logger.error(`Failed to add notification to user list: ${error.message}`);
    }
  }

  /**
   * Remove notification from user's notification list
   */
  private async removeFromUserNotificationList(
    tenantId: string,
    userId: string,
    notificationId: string
  ): Promise<void> {
    try {
      await this.cacheService.lrem(
        `user_notifications:${tenantId}:${userId}`,
        1,
        notificationId
      );
    } catch (error) {
      this.logger.error(`Failed to remove notification from user list: ${error.message}`);
    }
  }

  /**
   * Get unread notification count
   */
  private async getUnreadCount(tenantId: string, userId: string): Promise<number> {
    try {
      const cached = await this.cacheService.get(`unread_count:${tenantId}:${userId}`);
      if (cached !== null) {
        return cached;
      }

      const count = await this.prisma.notification.count({
        where: {
          tenantId,
          userId,
          status: NotificationStatus.PENDING,
        },
      });

      // Cache for 5 minutes
      await this.cacheService.set(
        `unread_count:${tenantId}:${userId}`,
        count,
        300
      );

      return count;
    } catch (error) {
      this.logger.error(`Failed to get unread count: ${error.message}`);
      return 0;
    }
  }

  /**
   * Increment unread count
   */
  private async incrementUnreadCount(tenantId: string, userId: string): Promise<void> {
    try {
      await this.cacheService.incr(`unread_count:${tenantId}:${userId}`);
    } catch (error) {
      this.logger.error(`Failed to increment unread count: ${error.message}`);
    }
  }

  /**
   * Decrement unread count
   */
  private async decrementUnreadCount(tenantId: string, userId: string): Promise<void> {
    try {
      const count = await this.cacheService.decr(`unread_count:${tenantId}:${userId}`);
      if (count < 0) {
        await this.cacheService.set(`unread_count:${tenantId}:${userId}`, 0, 300);
      }
    } catch (error) {
      this.logger.error(`Failed to decrement unread count: ${error.message}`);
    }
  }
}
