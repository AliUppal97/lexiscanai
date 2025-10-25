import { Injectable, Logger, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';
import { PrismaService } from '../../../common/prisma.service';
import { CacheService } from '../../../services/cache.service';
import { 
  SendEmailDto, 
  BulkEmailDto, 
  EmailTemplateDto, 
  EmailQueryDto, 
  EmailStatsDto,
  EmailPriority,
  EmailStatus 
} from '../dto/email.dto';

/**
 * Enhanced Email Service for LexiScan AI
 * 
 * Provides comprehensive email functionality including:
 * - Template-based email sending
 * - Bulk email processing with rate limiting
 * - Email tracking and analytics
 * - Template management
 * - Queue integration for high-volume sending
 * - Multi-tenant support
 * - Email delivery optimization
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter;
  private readonly enabled: boolean;
  private readonly fromEmail: string;
  private readonly fromName: string;
  private readonly templatesPath: string;
  private readonly templateCache = new Map<string, HandlebarsTemplateDelegate>();

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private cacheService: CacheService,
  ) {
    this.fromEmail = this.configService.get<string>('FROM_EMAIL', 'noreply@lexiscan.ai');
    this.fromName = this.configService.get<string>('FROM_NAME', 'LexiScan AI');
    this.enabled = !!this.configService.get<string>('SMTP_HOST');
    this.templatesPath = path.join(__dirname, 'templates');

    if (this.enabled) {
      this.initializeTransporter();
    } else {
      this.logger.warn('Email service is not configured. Emails will not be sent.');
    }
  }

  /**
   * Initialize the email transporter with SMTP configuration
   */
  private initializeTransporter(): void {
    try {
      this.transporter = nodemailer.createTransporter({
        host: this.configService.get<string>('SMTP_HOST'),
        port: this.configService.get<number>('SMTP_PORT', 587),
        secure: this.configService.get<boolean>('SMTP_SECURE', false),
        auth: {
          user: this.configService.get<string>('SMTP_USER'),
          pass: this.configService.get<string>('SMTP_PASS'),
        },
        pool: true,
        maxConnections: 5,
        maxMessages: 100,
        rateLimit: 10, // 10 emails per second
      });

      this.logger.log('Email transporter initialized successfully');
    } catch (error) {
      this.logger.error(`Failed to initialize email transporter: ${error.message}`);
    }
  }

  /**
   * Send a single email with template support
   */
  async sendEmail(
    tenantId: string,
    emailData: SendEmailDto,
    options?: {
      trackOpens?: boolean;
      trackClicks?: boolean;
      priority?: EmailPriority;
    }
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.enabled) {
      this.logger.warn('Email service disabled. Email not sent:', emailData.subject);
      return { success: false, error: 'Email service disabled' };
    }

    try {
      let htmlContent = emailData.html;
      let textContent = emailData.text;

      // Process template if specified
      if (emailData.template) {
        const templateResult = await this.processTemplate(
          emailData.template,
          emailData.templateData || {}
        );
        htmlContent = templateResult.html;
        textContent = templateResult.text;
      }

      // Add tracking pixels and links if enabled
      if (options?.trackOpens || options?.trackClicks) {
        htmlContent = await this.addTracking(htmlContent, {
          trackOpens: options.trackOpens,
          trackClicks: options.trackClicks,
        });
      }

      const mailOptions = {
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: emailData.recipients.map(r => r.type === 'cc' || r.type === 'bcc' ? undefined : `${r.name ? `${r.name} <${r.email}>` : r.email}`).filter(Boolean),
        cc: emailData.recipients.filter(r => r.type === 'cc').map(r => r.name ? `${r.name} <${r.email}>` : r.email),
        bcc: emailData.recipients.filter(r => r.type === 'bcc').map(r => r.name ? `${r.name} <${r.email}>` : r.email),
        subject: emailData.subject,
        text: textContent,
        html: htmlContent,
        attachments: emailData.attachments?.map(att => ({
          filename: att.filename,
          content: att.content,
          path: att.path,
          contentType: att.contentType,
          encoding: att.encoding,
        })),
        headers: {
          ...emailData.headers,
          'X-Priority': this.getPriorityHeader(emailData.priority || EmailPriority.NORMAL),
          'X-Mailer': 'LexiScan AI Email Service',
          'X-Tenant-ID': tenantId,
        },
        replyTo: emailData.replyTo,
        messageId: emailData.messageId,
      };

      const result = await this.transporter.sendMail(mailOptions);

      // Store email record in database
      await this.storeEmailRecord(tenantId, {
        ...emailData,
        messageId: result.messageId,
        status: EmailStatus.SENT,
        sentAt: new Date(),
      });

      this.logger.log(`Email sent successfully: ${emailData.subject} to ${emailData.recipients.length} recipients`);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`);
      
      // Store failed email record
      await this.storeEmailRecord(tenantId, {
        ...emailData,
        status: EmailStatus.FAILED,
        error: error.message,
        sentAt: new Date(),
      });

      return { success: false, error: error.message };
    }
  }

  /**
   * Send bulk emails with rate limiting and batch processing
   */
  async sendBulkEmails(
    tenantId: string,
    bulkData: BulkEmailDto,
    options?: {
      batchSize?: number;
      delayBetweenBatches?: number;
      stopOnError?: boolean;
    }
  ): Promise<{
    totalSent: number;
    totalFailed: number;
    results: Array<{ success: boolean; messageId?: string; error?: string }>;
  }> {
    const batchSize = options?.batchSize || bulkData.batchSize || 10;
    const delayBetweenBatches = options?.delayBetweenBatches || bulkData.delayBetweenBatches || 1000;
    const stopOnError = options?.stopOnError ?? bulkData.stopOnError ?? false;

    const results: Array<{ success: boolean; messageId?: string; error?: string }> = [];
    let totalSent = 0;
    let totalFailed = 0;

    // Process emails in batches
    for (let i = 0; i < bulkData.emails.length; i += batchSize) {
      const batch = bulkData.emails.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (emailData) => {
        try {
          const result = await this.sendEmail(tenantId, emailData);
          if (result.success) {
            totalSent++;
          } else {
            totalFailed++;
            if (stopOnError) {
              throw new Error(`Email failed: ${result.error}`);
            }
          }
          return result;
        } catch (error) {
          totalFailed++;
          if (stopOnError) {
            throw error;
          }
          return { success: false, error: error.message };
        }
      });

      try {
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
      } catch (error) {
        this.logger.error(`Batch processing failed: ${error.message}`);
        if (stopOnError) {
          break;
        }
      }

      // Delay between batches to respect rate limits
      if (i + batchSize < bulkData.emails.length) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
      }
    }

    this.logger.log(`Bulk email processing completed: ${totalSent} sent, ${totalFailed} failed`);
    return { totalSent, totalFailed, results };
  }

  /**
   * Process email template with Handlebars
   */
  private async processTemplate(
    templateName: string,
    data: Record<string, any>
  ): Promise<{ html: string; text: string }> {
    try {
      // Check cache first
      let template = this.templateCache.get(templateName);
      
      if (!template) {
        const templatePath = path.join(this.templatesPath, `${templateName}.html`);
        
        if (!fs.existsSync(templatePath)) {
          throw new BadRequestException(`Template not found: ${templateName}`);
        }

        const templateContent = fs.readFileSync(templatePath, 'utf8');
        template = handlebars.compile(templateContent);
        this.templateCache.set(templateName, template);
      }

      const html = template(data);
      
      // Generate text version by stripping HTML
      const text = html
        .replace(/<[^>]*>/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      return { html, text };
    } catch (error) {
      this.logger.error(`Template processing failed: ${error.message}`);
      throw new InternalServerErrorException('Failed to process email template');
    }
  }

  /**
   * Add tracking pixels and links to email content
   */
  private async addTracking(
    htmlContent: string,
    options: { trackOpens?: boolean; trackClicks?: boolean }
  ): Promise<string> {
    let trackedContent = htmlContent;

    // Add open tracking pixel
    if (options.trackOpens) {
      const trackingPixel = `<img src="${this.configService.get('TRACKING_BASE_URL')}/track/open/{messageId}" width="1" height="1" style="display:none;" />`;
      trackedContent = trackedContent.replace('</body>', `${trackingPixel}</body>`);
    }

    // Add click tracking to links
    if (options.trackClicks) {
      trackedContent = trackedContent.replace(
        /<a\s+href="([^"]+)"/g,
        `<a href="${this.configService.get('TRACKING_BASE_URL')}/track/click/{messageId}?url=$1"`
      );
    }

    return trackedContent;
  }

  /**
   * Store email record in database for tracking and analytics
   */
  private async storeEmailRecord(
    tenantId: string,
    emailData: SendEmailDto & {
      messageId?: string;
      status: EmailStatus;
      sentAt: Date;
      error?: string;
    }
  ): Promise<void> {
    try {
      // Store in database (implement when Email model is created)
      // await this.prisma.email.create({
      //   data: {
      //     tenantId,
      //     messageId: emailData.messageId,
      //     subject: emailData.subject,
      //     recipients: emailData.recipients,
      //     status: emailData.status,
      //     sentAt: emailData.sentAt,
      //     error: emailData.error,
      //     template: emailData.template,
      //     priority: emailData.priority,
      //   },
      // });

      // Cache email stats for quick access
      await this.cacheService.set(
        `email:stats:${tenantId}:${new Date().toISOString().split('T')[0]}`,
        { count: 1, status: emailData.status },
        86400 // 24 hours
      );
    } catch (error) {
      this.logger.error(`Failed to store email record: ${error.message}`);
    }
  }

  /**
   * Get email statistics for a tenant
   */
  async getEmailStats(
    tenantId: string,
    query: EmailQueryDto
  ): Promise<EmailStatsDto> {
    try {
      // Implement email statistics retrieval
      // This would query the database for email records
      
      return {
        period: query.startDate ? `${query.startDate} to ${query.endDate}` : 'all time',
        totalSent: 0,
        totalDelivered: 0,
        totalOpened: 0,
        totalClicked: 0,
        totalBounced: 0,
        totalFailed: 0,
        deliveryRate: 0,
        openRate: 0,
        clickRate: 0,
        bounceRate: 0,
      };
    } catch (error) {
      this.logger.error(`Failed to get email stats: ${error.message}`);
      throw new InternalServerErrorException('Failed to retrieve email statistics');
    }
  }

  /**
   * Get priority header value for email
   */
  private getPriorityHeader(priority: EmailPriority): string {
    const priorityMap = {
      [EmailPriority.LOW]: '5',
      [EmailPriority.NORMAL]: '3',
      [EmailPriority.HIGH]: '1',
      [EmailPriority.URGENT]: '1',
    };
    return priorityMap[priority] || '3';
  }

  /**
   * Validate email configuration
   */
  async validateConfiguration(): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    if (!this.configService.get('SMTP_HOST')) {
      errors.push('SMTP_HOST is not configured');
    }

    if (!this.configService.get('SMTP_USER')) {
      errors.push('SMTP_USER is not configured');
    }

    if (!this.configService.get('SMTP_PASS')) {
      errors.push('SMTP_PASS is not configured');
    }

    if (this.enabled && this.transporter) {
      try {
        await this.transporter.verify();
      } catch (error) {
        errors.push(`SMTP connection failed: ${error.message}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Clean up resources
   */
  async onModuleDestroy(): Promise<void> {
    if (this.transporter) {
      this.transporter.close();
      this.logger.log('Email transporter closed');
    }
  }
}
