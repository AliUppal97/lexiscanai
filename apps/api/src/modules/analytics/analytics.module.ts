import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AnalyticsController } from './analytics.controller';
import { ReportBuilderService } from './report-builder.service';
import { DashboardService } from './dashboard.service';
import { ReportSchedulerService } from './report-scheduler.service';
import { PrismaService } from '../../common/prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [ScheduleModule.forRoot(), AuthModule],
  controllers: [AnalyticsController],
  providers: [
    ReportBuilderService,
    DashboardService,
    ReportSchedulerService,
    PrismaService,
  ],
  exports: [ReportBuilderService, DashboardService],
})
export class AnalyticsModule {}
