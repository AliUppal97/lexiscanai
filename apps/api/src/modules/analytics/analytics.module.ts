import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from '../../services/analytics.service';
import { CacheService } from '../../services/cache.service';
import { PrismaService } from '../../common/prisma.service';
import { UsageTrackingService } from './usage-tracking.service';
import { BillingAnalyticsService } from './billing-analytics.service';
import { UserAnalyticsService } from './user-analytics.service';
import { DocumentAnalyticsService } from './document-analytics.service';
import { DashboardMetricsService } from './dashboard-metrics.service';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '7d'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AnalyticsController],
  providers: [
    PrismaService,
    AnalyticsService,
    CacheService,
    UsageTrackingService,
    BillingAnalyticsService,
    UserAnalyticsService,
    DocumentAnalyticsService,
    DashboardMetricsService,
  ],
  exports: [
    AnalyticsService,
    UsageTrackingService,
    BillingAnalyticsService,
    UserAnalyticsService,
    DocumentAnalyticsService,
    DashboardMetricsService,
  ],
})
export class AnalyticsModule {}

