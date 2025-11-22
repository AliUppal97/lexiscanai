import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { QuotaAlert, QuotaConfig } from '@prisma/client';
import { QuotaAlertDto } from './dto';
import { EmailService } from '../../services/email.service';
import { NotificationService } from '../../services/notification.service';
import { WebhookService } from '../communications/webhooks/webhook.service';
import { CacheService } from '../../services/cache.service';

@Injectable()
export class QuotaAlertService {
  private readonly logger = new Logger(QuotaAlertService.name);
  private readonly ALERT_THROTTLE_TTL = 3600; // 1 hour

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private notificationService: NotificationService,
    private webhookService: WebhookService,
    private cacheService: CacheService,
  ) {}

  /**
   * Get quota alerts for tenant
   */
  async getAlerts(tenantId: string, acknowledged?: boolean): Promise<QuotaAlertDto[]> {
    const where: any = { tenantId };

    if (acknowledged !== undefined) {
      where.acknowledgedAt = acknowledged ? { not: null } : null;
    }

    const alerts = await this.prisma.quotaAlert.findMany({
      where,
      orderBy: { sentAt: 'desc' },
      take: 100,
      include: {
        quotaConfig: {
          select: {
            resourceType: true,
            limit: true,
            period: true,
          },
        },
      },
    });

    return alerts.map((alert) => this.toDto(alert));
  }

  /**
   * Acknowledge alert
   */
  async acknowledgeAlert(alertId: string, tenantId: string): Promise<QuotaAlertDto> {
    const alert = await this.prisma.quotaAlert.findFirst({
      where: {
        id: alertId,
        tenantId,
      },
    });

    if (!alert) {
      throw new Error(`Alert not found: ${alertId}`);
    }

    const updated = await this.prisma.quotaAlert.update({
      where: { id: alertId },
      data: { acknowledgedAt: new Date() },
    });

    return this.toDto(updated);
  }

  /**
   * Send alert notification (email/Slack/webhook/in-app)
   */
  async sendAlertNotification(alert: QuotaAlert, quotaConfig: QuotaConfig): Promise<void> {
    // Check throttling (prevent alert spam)
    const throttleKey = `quota_alert:${alert.tenantId}:${alert.quotaConfigId}:${alert.alertType}`;
    const lastSent = await this.cacheService.get<number>(throttleKey);
    
    if (lastSent && Date.now() - lastSent < this.ALERT_THROTTLE_TTL * 1000) {
      this.logger.debug(`Alert throttled for tenant ${alert.tenantId}, alert type ${alert.alertType}`);
      return;
    }

    // Get tenant and usage information
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: alert.tenantId },
      select: {
        id: true,
        name: true,
        settings: true,
      },
    });

    if (!tenant) {
      this.logger.warn(`Tenant ${alert.tenantId} not found for alert ${alert.id}`);
      return;
    }

    // Get current usage
    const usageRecord = await this.prisma.usageRecord.findFirst({
      where: {
        tenantId: alert.tenantId,
        resourceType: quotaConfig.resourceType,
      },
      orderBy: { timestamp: 'desc' },
    });

    const currentUsage = usageRecord?.quantity || BigInt(0);
    const limit = quotaConfig.limit;
    const percentage = Number((currentUsage * BigInt(100)) / limit);

    // Prepare template data
    const templateData = {
      tenantName: tenant.name,
      resourceType: quotaConfig.resourceType,
      currentUsage: currentUsage.toString(),
      limit: limit.toString(),
      percentage: percentage.toFixed(2),
      alertType: alert.alertType,
      thresholdPercentage: alert.thresholdPercentage,
      message: alert.message || `Quota threshold reached: ${percentage.toFixed(2)}%`,
    };

    // Get tenant notification preferences
    const notificationPreferences = (tenant.settings as any)?.notifications || {
      emailEnabled: true,
      inAppEnabled: true,
      webhookEnabled: false,
      slackEnabled: false,
    };

    // Send notifications via configured channels
    const promises: Promise<any>[] = [];

    // Email notification
    if (notificationPreferences.emailEnabled) {
      promises.push(this.sendEmailNotification(alert, templateData, tenant));
    }

    // In-app notification
    if (notificationPreferences.inAppEnabled) {
      promises.push(this.sendInAppNotification(alert, templateData));
    }

    // Webhook notification
    if (notificationPreferences.webhookEnabled) {
      promises.push(this.sendWebhookNotification(alert, templateData));
    }

    // Slack notification (if configured)
    if (notificationPreferences.slackEnabled && notificationPreferences.slackWebhookUrl) {
      promises.push(this.sendSlackNotification(alert, templateData, notificationPreferences.slackWebhookUrl));
    }

    // Execute all notifications
    const results = await Promise.allSettled(promises);
    
    // Log results
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        this.logger.error(`Failed to send notification ${index}: ${result.reason}`);
      }
    });

    // Update throttle timestamp
    await this.cacheService.set(throttleKey, Date.now(), this.ALERT_THROTTLE_TTL);

    this.logger.log(`Quota alert notifications sent for tenant ${alert.tenantId}, alert ${alert.id}`);
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(
    alert: QuotaAlert,
    templateData: any,
    tenant: any,
  ): Promise<void> {
    try {
      // Get tenant admin email from settings or user
      const adminUser = await this.prisma.user.findFirst({
        where: {
          tenantId: alert.tenantId,
          isActive: true,
        },
        orderBy: { createdAt: 'asc' },
      });

      if (!adminUser?.email) {
        this.logger.warn(`No admin email found for tenant ${alert.tenantId}`);
        return;
      }

      const subject = `Quota Alert: ${templateData.resourceType} - ${templateData.percentage}% Used`;
      const html = `
        <html>
          <body>
            <h2>Quota Alert</h2>
            <p>Hello ${tenant.name},</p>
            <p>Your quota for <strong>${templateData.resourceType}</strong> has reached <strong>${templateData.percentage}%</strong>.</p>
            <ul>
              <li><strong>Current Usage:</strong> ${templateData.currentUsage}</li>
              <li><strong>Limit:</strong> ${templateData.limit}</li>
              <li><strong>Threshold:</strong> ${templateData.thresholdPercentage}%</li>
            </ul>
            <p>${templateData.message}</p>
            <p>Please review your usage and consider upgrading your plan if needed.</p>
          </body>
        </html>
      `;

      await this.emailService.sendEmail({
        to: adminUser.email,
        subject,
        html,
        text: templateData.message,
      });

      this.logger.log(`Email notification sent for alert ${alert.id}`);
    } catch (error) {
      this.logger.error(`Failed to send email notification: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send in-app notification
   */
  private async sendInAppNotification(alert: QuotaAlert, templateData: any): Promise<void> {
    try {
      // Get tenant admin user
      const adminUser = await this.prisma.user.findFirst({
        where: {
          tenantId: alert.tenantId,
          isActive: true,
        },
        orderBy: { createdAt: 'asc' },
      });

      if (!adminUser) {
        return;
      }

      await this.notificationService.send({
        userId: adminUser.id,
        tenantId: alert.tenantId,
        title: `Quota Alert: ${templateData.resourceType}`,
        message: templateData.message,
        type: 'system_alert' as any,
        data: {
          alertId: alert.id,
          resourceType: templateData.resourceType,
          percentage: templateData.percentage,
          currentUsage: templateData.currentUsage,
          limit: templateData.limit,
        },
        channels: ['in_app'],
      });

      this.logger.log(`In-app notification sent for alert ${alert.id}`);
    } catch (error) {
      this.logger.error(`Failed to send in-app notification: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send webhook notification
   */
  private async sendWebhookNotification(alert: QuotaAlert, templateData: any): Promise<void> {
    try {
      // Get webhooks for tenant
      const webhooks = await this.prisma.webhook.findMany({
        where: {
          tenantId: alert.tenantId,
          isActive: true,
          events: {
            has: 'QUOTA_ALERT',
          },
        },
      });

      for (const webhook of webhooks) {
        await this.webhookService.sendWebhookEvent(
          alert.tenantId,
          'QUOTA_ALERT' as any,
          {
            alertId: alert.id,
            alertType: alert.alertType,
            resourceType: templateData.resourceType,
            currentUsage: templateData.currentUsage,
            limit: templateData.limit,
            percentage: templateData.percentage,
            thresholdPercentage: templateData.thresholdPercentage,
            message: templateData.message,
            timestamp: new Date().toISOString(),
          },
        );
      }

      this.logger.log(`Webhook notifications sent for alert ${alert.id}`);
    } catch (error) {
      this.logger.error(`Failed to send webhook notification: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send Slack notification
   */
  private async sendSlackNotification(
    alert: QuotaAlert,
    templateData: any,
    slackWebhookUrl: string,
  ): Promise<void> {
    try {
      const axios = require('axios');
      
      const slackMessage = {
        text: `🚨 Quota Alert: ${templateData.resourceType}`,
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: `🚨 Quota Alert: ${templateData.resourceType}`,
            },
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*Current Usage:*\n${templateData.currentUsage}`,
              },
              {
                type: 'mrkdwn',
                text: `*Limit:*\n${templateData.limit}`,
              },
              {
                type: 'mrkdwn',
                text: `*Percentage:*\n${templateData.percentage}%`,
              },
              {
                type: 'mrkdwn',
                text: `*Threshold:*\n${templateData.thresholdPercentage}%`,
              },
            ],
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: templateData.message,
            },
          },
        ],
      };

      await axios.post(slackWebhookUrl, slackMessage);

      this.logger.log(`Slack notification sent for alert ${alert.id}`);
    } catch (error) {
      this.logger.error(`Failed to send Slack notification: ${error.message}`);
      throw error;
    }
  }

  /**
   * Convert to DTO
   */
  private toDto(alert: QuotaAlert): QuotaAlertDto {
    return {
      id: alert.id,
      alertType: alert.alertType,
      thresholdPercentage: alert.thresholdPercentage,
      sentAt: alert.sentAt,
      acknowledgedAt: alert.acknowledgedAt || undefined,
      message: alert.message || undefined,
    };
  }
}

