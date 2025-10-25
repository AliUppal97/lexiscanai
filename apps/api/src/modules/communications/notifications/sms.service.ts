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
 * SMS Notification Service for LexiScan AI
 * 
 * Handles SMS notifications with:
 * - Twilio integration for SMS delivery
 * - AWS SNS support for SMS
 * - Message template management
 * - International SMS support
 * - Delivery status tracking
 * - Rate limiting and cost optimization
 */
@Injectable()
export class SmsNotificationService {
  private readonly logger = new Logger(SmsNotificationService.name);
  private readonly twilioEnabled: boolean;
  private readonly awsSnsEnabled: boolean;
  private readonly twilioClient: any;
  private readonly snsClient: any;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private cacheService: CacheService,
  ) {
    this.twilioEnabled = !!this.configService.get<string>('TWILIO_ACCOUNT_SID');
    this.awsSnsEnabled = !!this.configService.get<string>('AWS_ACCESS_KEY_ID');

    if (this.twilioEnabled) {
      try {
        const twilio = require('twilio');
        this.twilioClient = twilio(
          this.configService.get<string>('TWILIO_ACCOUNT_SID'),
          this.configService.get<string>('TWILIO_AUTH_TOKEN')
        );
        this.logger.log('Twilio SMS service initialized');
      } catch (error) {
        this.logger.error(`Failed to initialize Twilio: ${error.message}`);
      }
    }

    if (this.awsSnsEnabled) {
      try {
        const AWS = require('aws-sdk');
        this.snsClient = new AWS.SNS({
          accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
          secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
          region: this.configService.get<string>('AWS_REGION', 'us-east-1'),
        });
        this.logger.log('AWS SNS service initialized');
      } catch (error) {
        this.logger.error(`Failed to initialize AWS SNS: ${error.message}`);
      }
    }

    if (!this.twilioEnabled && !this.awsSnsEnabled) {
      this.logger.warn('No SMS services configured');
    }
  }

  /**
   * Send SMS notification to a single phone number
   */
  async sendSmsNotification(
    tenantId: string,
    notificationData: CreateNotificationDto,
    phoneNumber: string,
    provider: 'twilio' | 'aws-sns' = 'twilio'
  ): Promise<{ success: boolean; messageId?: string; error?: string; cost?: number }> {
    try {
      this.logger.log(`Sending SMS notification to ${phoneNumber} via ${provider}`);

      // Validate phone number format
      const formattedNumber = this.formatPhoneNumber(phoneNumber);
      if (!formattedNumber) {
        return { success: false, error: 'Invalid phone number format' };
      }

      // Check SMS preferences
      const preferences = await this.getUserSmsPreferences(tenantId, notificationData.recipients[0].userId);
      if (!preferences.smsEnabled) {
        return { success: false, error: 'SMS notifications disabled for user' };
      }

      let result: { success: boolean; messageId?: string; error?: string; cost?: number };

      switch (provider) {
        case 'twilio':
          result = await this.sendTwilioSms(tenantId, notificationData, formattedNumber);
          break;
        case 'aws-sns':
          result = await this.sendAwsSnsSms(tenantId, notificationData, formattedNumber);
          break;
        default:
          throw new Error(`Unsupported SMS provider: ${provider}`);
      }

      // Store SMS record
      if (result.success) {
        await this.storeSmsRecord(tenantId, {
          ...notificationData,
          phoneNumber: formattedNumber,
          provider,
          messageId: result.messageId,
          cost: result.cost,
          status: 'sent',
        });
      }

      return result;
    } catch (error) {
      this.logger.error(`Failed to send SMS notification: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send bulk SMS notifications
   */
  async sendBulkSmsNotifications(
    tenantId: string,
    notificationData: CreateNotificationDto,
    phoneNumbers: Array<{ phoneNumber: string; userId: string }>,
    provider: 'twilio' | 'aws-sns' = 'twilio'
  ): Promise<{
    totalSent: number;
    totalFailed: number;
    totalCost: number;
    results: Array<{ success: boolean; phoneNumber: string; error?: string; cost?: number }>;
  }> {
    try {
      this.logger.log(`Sending bulk SMS notifications to ${phoneNumbers.length} numbers via ${provider}`);

      const results: Array<{ success: boolean; phoneNumber: string; error?: string; cost?: number }> = [];
      let totalSent = 0;
      let totalFailed = 0;
      let totalCost = 0;

      // Process SMS in batches to respect rate limits
      const batchSize = 10;
      for (let i = 0; i < phoneNumbers.length; i += batchSize) {
        const batch = phoneNumbers.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async ({ phoneNumber, userId }) => {
          try {
            // Check user preferences
            const preferences = await this.getUserSmsPreferences(tenantId, userId);
            if (!preferences.smsEnabled) {
              return { success: false, phoneNumber, error: 'SMS disabled for user' };
            }

            const result = await this.sendSmsNotification(
              tenantId,
              { ...notificationData, recipients: [{ userId }] },
              phoneNumber,
              provider
            );

            if (result.success) {
              totalSent++;
              totalCost += result.cost || 0;
            } else {
              totalFailed++;
            }

            return { 
              success: result.success, 
              phoneNumber, 
              error: result.error,
              cost: result.cost 
            };
          } catch (error) {
            totalFailed++;
            return { success: false, phoneNumber, error: error.message };
          }
        });

        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);

        // Rate limiting delay
        if (i + batchSize < phoneNumbers.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      this.logger.log(`Bulk SMS completed: ${totalSent} sent, ${totalFailed} failed, $${totalCost.toFixed(4)} cost`);
      return { totalSent, totalFailed, totalCost, results };
    } catch (error) {
      this.logger.error(`Failed to send bulk SMS notifications: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send SMS via Twilio
   */
  private async sendTwilioSms(
    tenantId: string,
    notificationData: CreateNotificationDto,
    phoneNumber: string
  ): Promise<{ success: boolean; messageId?: string; error?: string; cost?: number }> {
    if (!this.twilioEnabled || !this.twilioClient) {
      return { success: false, error: 'Twilio not configured' };
    }

    try {
      const message = await this.twilioClient.messages.create({
        body: this.formatSmsMessage(notificationData),
        from: this.configService.get<string>('TWILIO_PHONE_NUMBER'),
        to: phoneNumber,
        statusCallback: `${this.configService.get('API_BASE_URL')}/webhooks/sms/twilio`,
      });

      this.logger.log(`Twilio SMS sent successfully: ${message.sid}`);
      return { 
        success: true, 
        messageId: message.sid,
        cost: parseFloat(message.price || '0')
      };
    } catch (error) {
      this.logger.error(`Twilio SMS failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send SMS via AWS SNS
   */
  private async sendAwsSnsSms(
    tenantId: string,
    notificationData: CreateNotificationDto,
    phoneNumber: string
  ): Promise<{ success: boolean; messageId?: string; error?: string; cost?: number }> {
    if (!this.awsSnsEnabled || !this.snsClient) {
      return { success: false, error: 'AWS SNS not configured' };
    }

    try {
      const params = {
        Message: this.formatSmsMessage(notificationData),
        PhoneNumber: phoneNumber,
        MessageAttributes: {
          'AWS.SNS.SMS.SMSType': {
            DataType: 'String',
            StringValue: 'Transactional',
          },
          'AWS.SNS.SMS.SenderID': {
            DataType: 'String',
            StringValue: 'LexiScan',
          },
        },
      };

      const result = await this.snsClient.publish(params).promise();
      
      this.logger.log(`AWS SNS SMS sent successfully: ${result.MessageId}`);
      return { 
        success: true, 
        messageId: result.MessageId,
        cost: 0.0075 // Approximate cost per SMS
      };
    } catch (error) {
      this.logger.error(`AWS SNS SMS failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Format SMS message based on notification type
   */
  private formatSmsMessage(notificationData: CreateNotificationDto): string {
    const templates = {
      [NotificationType.DOCUMENT_PROCESSED]: `✅ Document processed successfully! ${notificationData.title}. View results: ${notificationData.actionUrl || 'https://lexiscan.ai/dashboard'}`,
      [NotificationType.DOCUMENT_FAILED]: `❌ Document processing failed: ${notificationData.title}. Please try again or contact support.`,
      [NotificationType.REVIEW_COMPLETED]: `📋 Review completed: ${notificationData.title}. Check your dashboard for details.`,
      [NotificationType.INVOICE_GENERATED]: `💰 New invoice generated: ${notificationData.title}. Amount: ${notificationData.data?.amount || 'N/A'}. Due: ${notificationData.data?.dueDate || 'N/A'}`,
      [NotificationType.SUBSCRIPTION_EXPIRING]: `⚠️ Subscription expiring soon: ${notificationData.title}. Renew to continue service.`,
      [NotificationType.TEAM_INVITATION]: `👥 Team invitation: ${notificationData.title}. Accept invitation: ${notificationData.actionUrl || 'https://lexiscan.ai/invitations'}`,
      [NotificationType.SECURITY_ALERT]: `🔒 Security alert: ${notificationData.title}. Please review your account security.`,
      [NotificationType.SYSTEM_ALERT]: `⚠️ System alert: ${notificationData.title}. ${notificationData.message}`,
      [NotificationType.CUSTOM]: notificationData.message,
    };

    return templates[notificationData.type] || notificationData.message;
  }

  /**
   * Format phone number to international format
   */
  private formatPhoneNumber(phoneNumber: string): string | null {
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Add country code if not present (assuming US for now)
    if (cleaned.length === 10) {
      return `+1${cleaned}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+${cleaned}`;
    } else if (cleaned.startsWith('+')) {
      return phoneNumber;
    }
    
    return null;
  }

  /**
   * Get user SMS preferences
   */
  private async getUserSmsPreferences(
    tenantId: string,
    userId: string
  ): Promise<{ smsEnabled: boolean; enabledTypes: NotificationType[] }> {
    try {
      // Get from cache first
      const cached = await this.cacheService.get(`sms_preferences:${tenantId}:${userId}`);
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
        select: {
          smsEnabled: true,
          enabledTypes: true,
        },
      });

      const result = {
        smsEnabled: preferences?.smsEnabled ?? false,
        enabledTypes: preferences?.enabledTypes || [],
      };

      // Cache for 1 hour
      await this.cacheService.set(
        `sms_preferences:${tenantId}:${userId}`,
        result,
        3600
      );

      return result;
    } catch (error) {
      this.logger.error(`Failed to get SMS preferences: ${error.message}`);
      return {
        smsEnabled: false,
        enabledTypes: [],
      };
    }
  }

  /**
   * Store SMS record in database
   */
  private async storeSmsRecord(
    tenantId: string,
    data: {
      recipients: Array<{ userId: string }>;
      title: string;
      message: string;
      type: NotificationType;
      phoneNumber: string;
      provider: string;
      messageId?: string;
      cost?: number;
      status: string;
    }
  ): Promise<void> {
    try {
      await this.prisma.smsNotification.create({
        data: {
          tenantId,
          userId: data.recipients[0].userId,
          title: data.title,
          message: data.message,
          type: data.type,
          phoneNumber: data.phoneNumber,
          provider: data.provider,
          messageId: data.messageId,
          cost: data.cost,
          status: data.status,
          sentAt: new Date(),
        },
      });
    } catch (error) {
      this.logger.error(`Failed to store SMS record: ${error.message}`);
    }
  }

  /**
   * Get SMS delivery status
   */
  async getSmsDeliveryStatus(
    tenantId: string,
    messageId: string
  ): Promise<{ status: string; deliveredAt?: Date; error?: string }> {
    try {
      const sms = await this.prisma.smsNotification.findFirst({
        where: {
          tenantId,
          messageId,
        },
        select: {
          status: true,
          deliveredAt: true,
          error: true,
        },
      });

      return {
        status: sms?.status || 'unknown',
        deliveredAt: sms?.deliveredAt,
        error: sms?.error,
      };
    } catch (error) {
      this.logger.error(`Failed to get SMS delivery status: ${error.message}`);
      return { status: 'error', error: error.message };
    }
  }

  /**
   * Get SMS statistics for a tenant
   */
  async getSmsStats(
    tenantId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalSent: number;
    totalDelivered: number;
    totalFailed: number;
    totalCost: number;
    deliveryRate: number;
    averageCost: number;
  }> {
    try {
      const stats = await this.prisma.smsNotification.aggregate({
        where: {
          tenantId,
          sentAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        _count: true,
        _sum: {
          cost: true,
        },
      });

      const deliveredCount = await this.prisma.smsNotification.count({
        where: {
          tenantId,
          sentAt: {
            gte: startDate,
            lte: endDate,
          },
          status: 'delivered',
        },
      });

      const failedCount = await this.prisma.smsNotification.count({
        where: {
          tenantId,
          sentAt: {
            gte: startDate,
            lte: endDate,
          },
          status: 'failed',
        },
      });

      const totalSent = stats._count;
      const totalDelivered = deliveredCount;
      const totalFailed = failedCount;
      const totalCost = stats._sum.cost || 0;

      return {
        totalSent,
        totalDelivered,
        totalFailed,
        totalCost,
        deliveryRate: totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0,
        averageCost: totalSent > 0 ? totalCost / totalSent : 0,
      };
    } catch (error) {
      this.logger.error(`Failed to get SMS stats: ${error.message}`);
      return {
        totalSent: 0,
        totalDelivered: 0,
        totalFailed: 0,
        totalCost: 0,
        deliveryRate: 0,
        averageCost: 0,
      };
    }
  }
}
