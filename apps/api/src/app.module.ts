import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { BillingModule } from './modules/billing/billing.module';
import { QuotasModule } from './modules/quotas/quotas.module';
import { FeatureFlagsModule } from './modules/feature-flags/feature-flags.module';
import { VersionModule } from './common/versioning/version.module';
import { GraphQLModule } from './graphql/graphql.module';
import { CollaborationModule } from './modules/collaboration/collaboration.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { WorkflowsModule } from './modules/workflows/workflows.module';
import { SecurityModule } from './modules/security/security.module';
import { WhiteLabelingModule } from './modules/white-labeling/white-labeling.module';
import { CustomerSuccessModule } from './modules/customer-success/customer-success.module';
import { MarketplaceModule } from './modules/marketplace/marketplace.module';
import { AIModelsModule } from './modules/ai-models/ai-models.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
      },
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    DocumentsModule,
    ReviewsModule,
    BillingModule,
    QuotasModule,
    FeatureFlagsModule,
    VersionModule,
    GraphQLModule,
    CollaborationModule,
    AnalyticsModule,
    WorkflowsModule,
    SecurityModule,
    WhiteLabelingModule,
    CustomerSuccessModule,
    MarketplaceModule,
    AIModelsModule,
  ],
})
export class AppModule {}
