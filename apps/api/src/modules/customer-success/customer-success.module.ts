import { Module } from '@nestjs/common';
import { CustomerSuccessController } from './customer-success.controller';
import { CustomerHealthService } from './customer-health.service';
import { ChurnPredictionService } from './churn-prediction.service';
import { SuccessMetricsService } from './success-metrics.service';
import { CustomerPlaybookService } from './customer-playbook.service';
import { CustomerJourneyService } from './customer-journey.service';
import { PrismaService } from '../../common/prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [CustomerSuccessController],
  providers: [
    CustomerHealthService,
    ChurnPredictionService,
    SuccessMetricsService,
    CustomerPlaybookService,
    CustomerJourneyService,
    PrismaService,
  ],
  exports: [
    CustomerHealthService,
    ChurnPredictionService,
    SuccessMetricsService,
  ],
})
export class CustomerSuccessModule {}

