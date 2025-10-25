import { Injectable, Logger } from '@nestjs/common';
import { QueueService } from '../../../services/queue.service';
import { EmailService } from './email.service';
import { SendEmailDto, BulkEmailDto } from '../dto/email.dto';

/**
 * Email Queue Service for LexiScan AI
 * 
 * Handles email queue processing with:
 * - High-volume email sending
 * - Rate limiting and throttling
 * - Retry mechanisms for failed emails
 * - Priority-based processing
 * - Dead letter queue for failed emails
 * - Email delivery optimization
 */
@Injectable()
export class EmailQueueService {
  private readonly logger = new Logger(EmailQueueService.name);

  constructor(
    private queueService: QueueService,
    private emailService: EmailService,
  ) {}

  /**
   * Add single email to queue
   */
  async addEmailToQueue(
    tenantId: string,
    emailData: SendEmailDto,
    options?: {
      priority?: number;
      delay?: number;
      attempts?: number;
      backoff?: {
        type: 'fixed' | 'exponential';
        delay: number;
      };
    }
  ): Promise<{ jobId: string; status: string }> {
    try {
      const jobData = {
        tenantId,
        emailData,
        type: 'single',
        timestamp: new Date().toISOString(),
      };

      const job = await this.queueService.addJob('email', 'send-single-email', jobData, {
        priority: options?.priority || 0,
        delay: options?.delay || 0,
        attempts: options?.attempts || 3,
        backoff: options?.backoff || {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: 10,
        removeOnFail: 5,
      });

      this.logger.log(`Email queued successfully: ${emailData.subject} (Job ID: ${job.id})`);
      return { jobId: job.id, status: 'queued' };
    } catch (error) {
      this.logger.error(`Failed to queue email: ${error.message}`);
      throw error;
    }
  }

  /**
   * Add bulk emails to queue
   */
  async addBulkEmailsToQueue(
    tenantId: string,
    bulkData: BulkEmailDto,
    options?: {
      priority?: number;
      delay?: number;
      batchSize?: number;
      delayBetweenBatches?: number;
    }
  ): Promise<{ jobId: string; status: string; totalEmails: number }> {
    try {
      const jobData = {
        tenantId,
        bulkData,
        type: 'bulk',
        timestamp: new Date().toISOString(),
        batchSize: options?.batchSize || 10,
        delayBetweenBatches: options?.delayBetweenBatches || 1000,
      };

      const job = await this.queueService.addJob('email', 'send-bulk-emails', jobData, {
        priority: options?.priority || 0,
        delay: options?.delay || 0,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: 5,
        removeOnFail: 3,
      });

      this.logger.log(`Bulk emails queued successfully: ${bulkData.emails.length} emails (Job ID: ${job.id})`);
      return { 
        jobId: job.id, 
        status: 'queued', 
        totalEmails: bulkData.emails.length 
      };
    } catch (error) {
      this.logger.error(`Failed to queue bulk emails: ${error.message}`);
      throw error;
    }
  }

  /**
   * Add template-based email to queue
   */
  async addTemplateEmailToQueue(
    tenantId: string,
    templateName: string,
    recipients: Array<{ email: string; name?: string }>,
    templateData: Record<string, any>,
    options?: {
      priority?: number;
      delay?: number;
      subject?: string;
    }
  ): Promise<{ jobId: string; status: string }> {
    try {
      const jobData = {
        tenantId,
        templateName,
        recipients,
        templateData,
        subject: options?.subject,
        type: 'template',
        timestamp: new Date().toISOString(),
      };

      const job = await this.queueService.addJob('email', 'send-template-email', jobData, {
        priority: options?.priority || 0,
        delay: options?.delay || 0,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: 10,
        removeOnFail: 5,
      });

      this.logger.log(`Template email queued successfully: ${templateName} (Job ID: ${job.id})`);
      return { jobId: job.id, status: 'queued' };
    } catch (error) {
      this.logger.error(`Failed to queue template email: ${error.message}`);
      throw error;
    }
  }

  /**
   * Add scheduled email to queue
   */
  async addScheduledEmailToQueue(
    tenantId: string,
    emailData: SendEmailDto,
    scheduledAt: Date,
    options?: {
      priority?: number;
      attempts?: number;
    }
  ): Promise<{ jobId: string; status: string }> {
    try {
      const delay = scheduledAt.getTime() - Date.now();
      
      if (delay <= 0) {
        throw new Error('Scheduled time must be in the future');
      }

      const jobData = {
        tenantId,
        emailData,
        type: 'scheduled',
        scheduledAt: scheduledAt.toISOString(),
        timestamp: new Date().toISOString(),
      };

      const job = await this.queueService.addJob('email', 'send-scheduled-email', jobData, {
        priority: options?.priority || 0,
        delay,
        attempts: options?.attempts || 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: 10,
        removeOnFail: 5,
      });

      this.logger.log(`Scheduled email queued successfully: ${emailData.subject} (Job ID: ${job.id})`);
      return { jobId: job.id, status: 'queued' };
    } catch (error) {
      this.logger.error(`Failed to queue scheduled email: ${error.message}`);
      throw error;
    }
  }

  /**
   * Process single email job
   */
  async processSingleEmail(jobData: {
    tenantId: string;
    emailData: SendEmailDto;
    type: string;
    timestamp: string;
  }): Promise<void> {
    try {
      this.logger.log(`Processing single email: ${jobData.emailData.subject}`);
      
      const result = await this.emailService.sendEmail(
        jobData.tenantId,
        jobData.emailData,
        {
          trackOpens: true,
          trackClicks: true,
          priority: jobData.emailData.priority,
        }
      );

      if (result.success) {
        this.logger.log(`Email sent successfully: ${jobData.emailData.subject}`);
      } else {
        this.logger.error(`Email failed: ${result.error}`);
        throw new Error(`Email sending failed: ${result.error}`);
      }
    } catch (error) {
      this.logger.error(`Failed to process single email: ${error.message}`);
      throw error;
    }
  }

  /**
   * Process bulk emails job
   */
  async processBulkEmails(jobData: {
    tenantId: string;
    bulkData: BulkEmailDto;
    type: string;
    timestamp: string;
    batchSize: number;
    delayBetweenBatches: number;
  }): Promise<void> {
    try {
      this.logger.log(`Processing bulk emails: ${jobData.bulkData.emails.length} emails`);
      
      const result = await this.emailService.sendBulkEmails(
        jobData.tenantId,
        jobData.bulkData,
        {
          batchSize: jobData.batchSize,
          delayBetweenBatches: jobData.delayBetweenBatches,
          stopOnError: false,
        }
      );

      this.logger.log(`Bulk emails processed: ${result.totalSent} sent, ${result.totalFailed} failed`);
    } catch (error) {
      this.logger.error(`Failed to process bulk emails: ${error.message}`);
      throw error;
    }
  }

  /**
   * Process template email job
   */
  async processTemplateEmail(jobData: {
    tenantId: string;
    templateName: string;
    recipients: Array<{ email: string; name?: string }>;
    templateData: Record<string, any>;
    subject?: string;
    type: string;
    timestamp: string;
  }): Promise<void> {
    try {
      this.logger.log(`Processing template email: ${jobData.templateName}`);
      
      // Convert recipients to email format
      const emailData: SendEmailDto = {
        recipients: jobData.recipients.map(r => ({
          email: r.email,
          name: r.name,
          type: 'to' as const,
        })),
        subject: jobData.subject || `Notification from LexiScan AI`,
        template: jobData.templateName,
        templateData: jobData.templateData,
      };

      const result = await this.emailService.sendEmail(
        jobData.tenantId,
        emailData,
        {
          trackOpens: true,
          trackClicks: true,
        }
      );

      if (result.success) {
        this.logger.log(`Template email sent successfully: ${jobData.templateName}`);
      } else {
        this.logger.error(`Template email failed: ${result.error}`);
        throw new Error(`Template email sending failed: ${result.error}`);
      }
    } catch (error) {
      this.logger.error(`Failed to process template email: ${error.message}`);
      throw error;
    }
  }

  /**
   * Process scheduled email job
   */
  async processScheduledEmail(jobData: {
    tenantId: string;
    emailData: SendEmailDto;
    type: string;
    scheduledAt: string;
    timestamp: string;
  }): Promise<void> {
    try {
      this.logger.log(`Processing scheduled email: ${jobData.emailData.subject}`);
      
      const result = await this.emailService.sendEmail(
        jobData.tenantId,
        jobData.emailData,
        {
          trackOpens: true,
          trackClicks: true,
          priority: jobData.emailData.priority,
        }
      );

      if (result.success) {
        this.logger.log(`Scheduled email sent successfully: ${jobData.emailData.subject}`);
      } else {
        this.logger.error(`Scheduled email failed: ${result.error}`);
        throw new Error(`Scheduled email sending failed: ${result.error}`);
      }
    } catch (error) {
      this.logger.error(`Failed to process scheduled email: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
  }> {
    try {
      // Get queue statistics from Redis
      const stats = await this.queueService.getQueueStats('email');
      return stats;
    } catch (error) {
      this.logger.error(`Failed to get queue stats: ${error.message}`);
      return {
        waiting: 0,
        active: 0,
        completed: 0,
        failed: 0,
        delayed: 0,
      };
    }
  }

  /**
   * Clean up failed jobs
   */
  async cleanupFailedJobs(): Promise<{ cleaned: number }> {
    try {
      // Clean up old failed jobs
      const result = await this.queueService.cleanupFailedJobs('email', 7); // 7 days
      this.logger.log(`Cleaned up ${result.cleaned} failed email jobs`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to cleanup failed jobs: ${error.message}`);
      return { cleaned: 0 };
    }
  }

  /**
   * Pause email queue
   */
  async pauseQueue(): Promise<void> {
    try {
      await this.queueService.pauseQueue('email');
      this.logger.log('Email queue paused');
    } catch (error) {
      this.logger.error(`Failed to pause email queue: ${error.message}`);
      throw error;
    }
  }

  /**
   * Resume email queue
   */
  async resumeQueue(): Promise<void> {
    try {
      await this.queueService.resumeQueue('email');
      this.logger.log('Email queue resumed');
    } catch (error) {
      this.logger.error(`Failed to resume email queue: ${error.message}`);
      throw error;
    }
  }
}
