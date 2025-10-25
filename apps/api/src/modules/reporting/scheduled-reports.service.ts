import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../common/prisma.service';
import { CacheService } from '../../services/cache.service';
import { EmailService } from '../../services/email.service';
import { ReportGeneratorService } from './report-generator.service';

/**
 * Scheduled Reports Service
 * 
 * Provides automated report generation and distribution capabilities for the LexiScan AI platform.
 * Supports scheduled report generation, email distribution, and report automation workflows.
 * 
 * Key Features:
 * - Automated report scheduling
 * - Email distribution
 * - Report templates and customization
 * - Multi-recipient distribution
 * - Report archiving and retention
 * - Failure handling and retry logic
 * 
 * @author LexiScan AI Team
 * @version 1.0.0
 * @since 2024-01-01
 */
@Injectable()
export class ScheduledReportsService {
  private readonly logger = new Logger(ScheduledReportsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
    private readonly emailService: EmailService,
    private readonly reportGenerator: ReportGeneratorService,
  ) {}

  /**
   * Create scheduled report
   * 
   * @param tenantId - Tenant identifier
   * @param reportConfig - Report configuration
   * @returns Promise<ScheduledReport>
   */
  async createScheduledReport(
    tenantId: string,
    reportConfig: {
      name: string;
      description?: string;
      reportType: string;
      format: 'pdf' | 'excel' | 'csv' | 'json';
      schedule: {
        frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
        dayOfWeek?: number; // 0-6 for weekly
        dayOfMonth?: number; // 1-31 for monthly
        time: string; // HH:MM format
        timezone: string;
      };
      recipients: Array<{
        email: string;
        name?: string;
        role?: string;
      }>;
      filters?: Record<string, any>;
      includeCharts?: boolean;
      includeRawData?: boolean;
      retentionDays?: number;
      isActive?: boolean;
    },
  ): Promise<{
    id: string;
    name: string;
    description: string;
    reportType: string;
    format: string;
    schedule: any;
    recipients: any[];
    status: string;
    nextRun: Date;
    createdAt: Date;
  }> {
    try {
      this.logger.log(`Creating scheduled report for tenant ${tenantId}`);

      // Calculate next run time
      const nextRun = this.calculateNextRun(reportConfig.schedule);

      // Create scheduled report
      const scheduledReport = await this.prisma.scheduledReport.create({
        data: {
          tenantId,
          name: reportConfig.name,
          description: reportConfig.description,
          reportType: reportConfig.reportType,
          format: reportConfig.format,
          schedule: reportConfig.schedule,
          recipients: reportConfig.recipients,
          filters: reportConfig.filters,
          includeCharts: reportConfig.includeCharts,
          includeRawData: reportConfig.includeRawData,
          retentionDays: reportConfig.retentionDays,
          isActive: reportConfig.isActive ?? true,
          nextRun,
          status: 'active',
          createdAt: new Date(),
        },
      });

      this.logger.log(`Scheduled report created: ${scheduledReport.id}`);

      return {
        id: scheduledReport.id,
        name: scheduledReport.name,
        description: scheduledReport.description,
        reportType: scheduledReport.reportType,
        format: scheduledReport.format,
        schedule: scheduledReport.schedule,
        recipients: scheduledReport.recipients,
        status: scheduledReport.status,
        nextRun: scheduledReport.nextRun,
        createdAt: scheduledReport.createdAt,
      };
    } catch (error) {
      this.logger.error(`Failed to create scheduled report: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Update scheduled report
   * 
   * @param reportId - Report identifier
   * @param updates - Updates to apply
   * @returns Promise<ScheduledReport>
   */
  async updateScheduledReport(
    reportId: string,
    updates: {
      name?: string;
      description?: string;
      schedule?: any;
      recipients?: any[];
      filters?: Record<string, any>;
      includeCharts?: boolean;
      includeRawData?: boolean;
      retentionDays?: number;
      isActive?: boolean;
    },
  ): Promise<{
    id: string;
    name: string;
    description: string;
    reportType: string;
    format: string;
    schedule: any;
    recipients: any[];
    status: string;
    nextRun: Date;
    updatedAt: Date;
  }> {
    try {
      this.logger.log(`Updating scheduled report: ${reportId}`);

      // Calculate next run time if schedule is updated
      let nextRun;
      if (updates.schedule) {
        nextRun = this.calculateNextRun(updates.schedule);
      }

      // Update scheduled report
      const updatedReport = await this.prisma.scheduledReport.update({
        where: { id: reportId },
        data: {
          ...updates,
          nextRun,
          updatedAt: new Date(),
        },
      });

      this.logger.log(`Scheduled report updated: ${reportId}`);

      return {
        id: updatedReport.id,
        name: updatedReport.name,
        description: updatedReport.description,
        reportType: updatedReport.reportType,
        format: updatedReport.format,
        schedule: updatedReport.schedule,
        recipients: updatedReport.recipients,
        status: updatedReport.status,
        nextRun: updatedReport.nextRun,
        updatedAt: updatedReport.updatedAt,
      };
    } catch (error) {
      this.logger.error(`Failed to update scheduled report: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Delete scheduled report
   * 
   * @param reportId - Report identifier
   * @returns Promise<void>
   */
  async deleteScheduledReport(reportId: string): Promise<void> {
    try {
      this.logger.log(`Deleting scheduled report: ${reportId}`);

      await this.prisma.scheduledReport.delete({
        where: { id: reportId },
      });

      this.logger.log(`Scheduled report deleted: ${reportId}`);
    } catch (error) {
      this.logger.error(`Failed to delete scheduled report: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get scheduled report by ID
   * 
   * @param reportId - Report identifier
   * @returns Promise<ScheduledReport>
   */
  async getScheduledReport(reportId: string): Promise<{
    id: string;
    tenantId: string;
    name: string;
    description: string;
    reportType: string;
    format: string;
    schedule: any;
    recipients: any[];
    filters: any;
    includeCharts: boolean;
    includeRawData: boolean;
    retentionDays: number;
    isActive: boolean;
    status: string;
    nextRun: Date;
    lastRun: Date;
    createdAt: Date;
    updatedAt: Date;
  }> {
    try {
      const scheduledReport = await this.prisma.scheduledReport.findUnique({
        where: { id: reportId },
      });

      if (!scheduledReport) {
        throw new Error('Scheduled report not found');
      }

      return scheduledReport;
    } catch (error) {
      this.logger.error(`Failed to get scheduled report: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * List scheduled reports for a tenant
   * 
   * @param tenantId - Tenant identifier
   * @param filters - Filter options
   * @returns Promise<ScheduledReportList>
   */
  async listScheduledReports(
    tenantId: string,
    filters?: {
      reportType?: string;
      format?: string;
      status?: string;
      isActive?: boolean;
      page?: number;
      limit?: number;
    },
  ): Promise<{
    scheduledReports: Array<{
      id: string;
      name: string;
      description: string;
      reportType: string;
      format: string;
      schedule: any;
      recipients: any[];
      status: string;
      nextRun: Date;
      lastRun: Date;
      createdAt: Date;
    }>;
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const where: any = { tenantId };

      if (filters?.reportType) {
        where.reportType = filters.reportType;
      }

      if (filters?.format) {
        where.format = filters.format;
      }

      if (filters?.status) {
        where.status = filters.status;
      }

      if (filters?.isActive !== undefined) {
        where.isActive = filters.isActive;
      }

      const page = filters?.page || 1;
      const limit = filters?.limit || 20;
      const skip = (page - 1) * limit;

      const [scheduledReports, total] = await Promise.all([
        this.prisma.scheduledReport.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.scheduledReport.count({ where }),
      ]);

      return {
        scheduledReports: scheduledReports.map(report => ({
          id: report.id,
          name: report.name,
          description: report.description,
          reportType: report.reportType,
          format: report.format,
          schedule: report.schedule,
          recipients: report.recipients,
          status: report.status,
          nextRun: report.nextRun,
          lastRun: report.lastRun,
          createdAt: report.createdAt,
        })),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      this.logger.error(`Failed to list scheduled reports: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Execute scheduled report
   * 
   * @param reportId - Report identifier
   * @returns Promise<ReportExecution>
   */
  async executeScheduledReport(reportId: string): Promise<{
    executionId: string;
    reportId: string;
    status: string;
    startedAt: Date;
    completedAt?: Date;
    errorMessage?: string;
    reportUrl?: string;
  }> {
    try {
      this.logger.log(`Executing scheduled report: ${reportId}`);

      const scheduledReport = await this.prisma.scheduledReport.findUnique({
        where: { id: reportId },
      });

      if (!scheduledReport) {
        throw new Error('Scheduled report not found');
      }

      // Create execution record
      const execution = await this.prisma.reportExecution.create({
        data: {
          reportId,
          status: 'running',
          startedAt: new Date(),
        },
      });

      try {
        // Generate report
        const reportResult = await this.generateReport(scheduledReport);

        // Send email to recipients
        await this.sendReportEmail(scheduledReport, reportResult);

        // Update execution record
        await this.prisma.reportExecution.update({
          where: { id: execution.id },
          data: {
            status: 'completed',
            completedAt: new Date(),
            reportUrl: reportResult.downloadUrl,
          },
        });

        // Update scheduled report
        await this.prisma.scheduledReport.update({
          where: { id: reportId },
          data: {
            lastRun: new Date(),
            nextRun: this.calculateNextRun(scheduledReport.schedule),
          },
        });

        this.logger.log(`Scheduled report executed successfully: ${reportId}`);

        return {
          executionId: execution.id,
          reportId,
          status: 'completed',
          startedAt: execution.startedAt,
          completedAt: new Date(),
          reportUrl: reportResult.downloadUrl,
        };
      } catch (error) {
        // Update execution record with error
        await this.prisma.reportExecution.update({
          where: { id: execution.id },
          data: {
            status: 'failed',
            completedAt: new Date(),
            errorMessage: error.message,
          },
        });

        this.logger.error(`Scheduled report execution failed: ${error.message}`, error.stack);
        throw error;
      }
    } catch (error) {
      this.logger.error(`Failed to execute scheduled report: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get report execution history
   * 
   * @param reportId - Report identifier
   * @param filters - Filter options
   * @returns Promise<ReportExecutionList>
   */
  async getReportExecutionHistory(
    reportId: string,
    filters?: {
      status?: string;
      startDate?: Date;
      endDate?: Date;
      page?: number;
      limit?: number;
    },
  ): Promise<{
    executions: Array<{
      id: string;
      reportId: string;
      status: string;
      startedAt: Date;
      completedAt: Date;
      errorMessage: string;
      reportUrl: string;
    }>;
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const where: any = { reportId };

      if (filters?.status) {
        where.status = filters.status;
      }

      if (filters?.startDate || filters?.endDate) {
        where.startedAt = {};
        if (filters.startDate) {
          where.startedAt.gte = filters.startDate;
        }
        if (filters.endDate) {
          where.startedAt.lte = filters.endDate;
        }
      }

      const page = filters?.page || 1;
      const limit = filters?.limit || 20;
      const skip = (page - 1) * limit;

      const [executions, total] = await Promise.all([
        this.prisma.reportExecution.findMany({
          where,
          skip,
          take: limit,
          orderBy: { startedAt: 'desc' },
        }),
        this.prisma.reportExecution.count({ where }),
      ]);

      return {
        executions: executions.map(execution => ({
          id: execution.id,
          reportId: execution.reportId,
          status: execution.status,
          startedAt: execution.startedAt,
          completedAt: execution.completedAt,
          errorMessage: execution.errorMessage,
          reportUrl: execution.reportUrl,
        })),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      this.logger.error(`Failed to get report execution history: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Cron job to execute scheduled reports
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async executeScheduledReports(): Promise<void> {
    try {
      const now = new Date();
      
      // Get reports that are due to run
      const dueReports = await this.prisma.scheduledReport.findMany({
        where: {
          isActive: true,
          status: 'active',
          nextRun: { lte: now },
        },
      });

      for (const report of dueReports) {
        try {
          await this.executeScheduledReport(report.id);
        } catch (error) {
          this.logger.error(`Failed to execute scheduled report ${report.id}: ${error.message}`, error.stack);
        }
      }
    } catch (error) {
      this.logger.error(`Failed to execute scheduled reports: ${error.message}`, error.stack);
    }
  }

  /**
   * Calculate next run time
   * 
   * @param schedule - Schedule configuration
   * @returns Next run time
   */
  private calculateNextRun(schedule: any): Date {
    const now = new Date();
    const { frequency, dayOfWeek, dayOfMonth, time, timezone } = schedule;

    // Parse time
    const [hours, minutes] = time.split(':').map(Number);
    const nextRun = new Date(now);

    switch (frequency) {
      case 'daily':
        nextRun.setDate(nextRun.getDate() + 1);
        break;
      case 'weekly':
        const daysUntilNextWeek = (dayOfWeek - nextRun.getDay() + 7) % 7;
        nextRun.setDate(nextRun.getDate() + daysUntilNextWeek);
        break;
      case 'monthly':
        nextRun.setMonth(nextRun.getMonth() + 1);
        nextRun.setDate(dayOfMonth);
        break;
      case 'quarterly':
        nextRun.setMonth(nextRun.getMonth() + 3);
        break;
      case 'yearly':
        nextRun.setFullYear(nextRun.getFullYear() + 1);
        break;
    }

    nextRun.setHours(hours, minutes, 0, 0);

    return nextRun;
  }

  /**
   * Generate report
   * 
   * @param scheduledReport - Scheduled report configuration
   * @returns Report result
   */
  private async generateReport(scheduledReport: any): Promise<any> {
    const { reportType, format, filters, includeCharts, includeRawData } = scheduledReport;
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago

    switch (reportType) {
      case 'user_analytics':
        return await this.reportGenerator.generateAnalyticsReport(
          scheduledReport.tenantId,
          {
            reportType: 'user_analytics',
            startDate,
            endDate,
            format,
            includeCharts,
            includeRawData,
            filters,
          },
        );
      case 'document_analytics':
        return await this.reportGenerator.generateAnalyticsReport(
          scheduledReport.tenantId,
          {
            reportType: 'document_analytics',
            startDate,
            endDate,
            format,
            includeCharts,
            includeRawData,
            filters,
          },
        );
      case 'billing_analytics':
        return await this.reportGenerator.generateAnalyticsReport(
          scheduledReport.tenantId,
          {
            reportType: 'billing_analytics',
            startDate,
            endDate,
            format,
            includeCharts,
            includeRawData,
            filters,
          },
        );
      case 'performance_analytics':
        return await this.reportGenerator.generateAnalyticsReport(
          scheduledReport.tenantId,
          {
            reportType: 'performance_analytics',
            startDate,
            endDate,
            format,
            includeCharts,
            includeRawData,
            filters,
          },
        );
      default:
        throw new Error(`Unsupported report type: ${reportType}`);
    }
  }

  /**
   * Send report email
   * 
   * @param scheduledReport - Scheduled report configuration
   * @param reportResult - Report result
   * @returns Promise<void>
   */
  private async sendReportEmail(scheduledReport: any, reportResult: any): Promise<void> {
    const { recipients, name, reportType } = scheduledReport;

    for (const recipient of recipients) {
      await this.emailService.sendEmail({
        to: recipient.email,
        subject: `Scheduled Report: ${name}`,
        template: 'scheduled-report',
        data: {
          recipientName: recipient.name,
          reportName: name,
          reportType,
          downloadUrl: reportResult.downloadUrl,
          expiresAt: reportResult.expiresAt,
        },
      });
    }
  }
}
