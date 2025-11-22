import { Module } from '@nestjs/common';
import { QuotasController } from './quotas.controller';
import { QuotasService } from './quotas.service';
import { QuotaAlertService } from './quota-alert.service';
import { UsageTrackerService } from './usage-tracker.service';
import { QuotaEnforcementGuard } from './quota-enforcement.guard';
import { PrismaService } from '../../common/prisma.service';
import { CacheService } from '../../services/cache.service';
import { EmailService } from '../../services/email.service';
import { NotificationService } from '../../services/notification.service';
import { WebhookService } from '../communications/webhooks/webhook.service';
import { CommunicationsModule } from '../communications/communications.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule, CommunicationsModule],
  controllers: [QuotasController],
  providers: [
    QuotasService,
    QuotaAlertService,
    UsageTrackerService,
    QuotaEnforcementGuard,
    PrismaService,
    CacheService,
    EmailService,
    NotificationService,
  ],
  exports: [
    QuotasService,
    QuotaAlertService,
    UsageTrackerService,
    QuotaEnforcementGuard,
  ],
})
export class QuotasModule {}

