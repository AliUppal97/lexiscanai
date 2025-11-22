import { Module } from '@nestjs/common';
import { FeatureFlagsController } from './feature-flags.controller';
import { FeatureFlagsService } from './feature-flags.service';
import { ABTestService } from './ab-test.service';
import { FeatureFlagsAnalyticsService } from './feature-flags-analytics.service';
import { ABTestAnalysisService } from './ab-test-analysis.service';
import { ABTestEventsService } from './ab-test-events.service';
import { PrismaService } from '../../common/prisma.service';
import { CacheService } from '../../services/cache.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [FeatureFlagsController],
  providers: [
    FeatureFlagsService,
    ABTestService,
    FeatureFlagsAnalyticsService,
    ABTestAnalysisService,
    ABTestEventsService,
    PrismaService,
    CacheService,
  ],
  exports: [FeatureFlagsService, ABTestService, FeatureFlagsAnalyticsService],
})
export class FeatureFlagsModule {}

