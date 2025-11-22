import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AnalyticsController } from './analytics.controller';
import { ReportBuilderService } from './report-builder.service';
import { DashboardService } from './dashboard.service';
import { ReportSchedulerService } from './report-scheduler.service';
import { QueryBuilderService } from './query-builder.service';
import { PrismaService } from '../../common/prisma.service';
import { CacheService } from '../../services/cache.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [ScheduleModule.forRoot(), AuthModule],
  controllers: [AnalyticsController],
  providers: [
    ReportBuilderService,
    DashboardService,
    ReportSchedulerService,
    QueryBuilderService,
    PrismaService,
    CacheService,
  ],
  exports: [ReportBuilderService, DashboardService],
})
export class AnalyticsModule {}
