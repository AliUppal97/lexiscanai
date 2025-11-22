import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { QuotaAlert } from '@prisma/client';
import { QuotaAlertDto } from './dto';

@Injectable()
export class QuotaAlertService {
  private readonly logger = new Logger(QuotaAlertService.name);

  constructor(private prisma: PrismaService) {}

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
   * Send alert notification (email/Slack/webhook)
   */
  async sendAlertNotification(alert: QuotaAlert): Promise<void> {
    // TODO: Integrate with email service, Slack, webhooks
    this.logger.warn(`Quota alert: ${alert.message || 'Quota threshold reached'}`);

    // Example: Send email notification
    // await this.emailService.send({
    //   to: tenant.adminEmail,
    //   subject: `Quota Alert: ${alert.alertType}`,
    //   body: alert.message,
    // });

    // Example: Send Slack notification
    // await this.slackService.send({
    //   channel: '#alerts',
    //   message: alert.message,
    // });

    // Example: Trigger webhook
    // await this.webhookService.trigger(tenantId, 'QUOTA_ALERT', alert);
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

