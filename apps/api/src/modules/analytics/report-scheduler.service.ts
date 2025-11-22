import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ScheduledReportStatus, ReportFormat } from '@prisma/client';
import { ReportBuilderService } from './report-builder.service';

@Injectable()
export class ReportSchedulerService {
  private readonly logger = new Logger(ReportSchedulerService.name);

  constructor(
    private prisma: PrismaService,
    private reportBuilder: ReportBuilderService,
  ) {}

  /**
   * Schedule report
   */
  async scheduleReport(reportId: string, schedule: string, recipients: string[], format: ReportFormat): Promise<any> {
    // Calculate next run time from cron expression
    const nextRunAt = this.calculateNextRun(schedule);

    const scheduled = await this.prisma.scheduledReport.create({
      data: {
        reportId,
        schedule,
        recipients,
        format,
        nextRunAt,
        status: ScheduledReportStatus.ACTIVE,
      },
    });

    return scheduled;
  }

  /**
   * Unschedule report
   */
  async unscheduleReport(reportId: string): Promise<void> {
    await this.prisma.scheduledReport.updateMany({
      where: { reportId },
      data: { status: ScheduledReportStatus.COMPLETED },
    });
  }

  /**
   * Execute scheduled reports (runs every minute)
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async executeScheduledReports(): Promise<void> {
    const now = new Date();
    const dueReports = await this.prisma.scheduledReport.findMany({
      where: {
        status: ScheduledReportStatus.ACTIVE,
        nextRunAt: {
          lte: now,
        },
      },
      include: { report: true },
    });

    for (const scheduled of dueReports) {
      try {
        await this.executeScheduledReport(scheduled);
      } catch (error) {
        this.logger.error(`Failed to execute scheduled report ${scheduled.id}: ${error.message}`);
      }
    }
  }

  /**
   * Execute a scheduled report
   */
  private async executeScheduledReport(scheduled: any): Promise<void> {
    const report = scheduled.report;

    // Execute report
    const result = await this.reportBuilder.executeReport(report.id, report.tenantId);

    // Generate report file
    const fileUrl = await this.generateReportFile(report, result.data, scheduled.format);

    // Send to recipients (would integrate with email service)
    // await this.emailService.sendReport(scheduled.recipients, fileUrl);

    // Update next run time
    const nextRunAt = this.calculateNextRun(scheduled.schedule);
    await this.prisma.scheduledReport.update({
      where: { id: scheduled.id },
      data: {
        lastRunAt: new Date(),
        nextRunAt,
      },
    });

    this.logger.log(`Executed scheduled report ${scheduled.id}`);
  }

  /**
   * Generate report file
   */
  private async generateReportFile(report: any, data: any[], format: ReportFormat): Promise<string> {
    // Simplified - would use libraries like PDFKit, ExcelJS, etc.
    this.logger.debug(`Generating ${format} report for ${report.name}`);
    return `https://reports.example.com/${report.id}.${format.toLowerCase()}`;
  }

  /**
   * Calculate next run time from cron expression
   */
  private calculateNextRun(cronExpression: string): Date {
    // Simplified - would use a proper cron parser like node-cron
    // For now, return 1 hour from now
    return new Date(Date.now() + 60 * 60 * 1000);
  }
}

