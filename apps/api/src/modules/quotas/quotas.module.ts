import { Module } from '@nestjs/common';
import { QuotasController } from './quotas.controller';
import { QuotasService } from './quotas.service';
import { QuotaAlertService } from './quota-alert.service';
import { UsageTrackerService } from './usage-tracker.service';
import { QuotaEnforcementGuard } from './quota-enforcement.guard';
import { PrismaService } from '../../common/prisma.service';
import { CacheService } from '../../services/cache.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [QuotasController],
  providers: [
    QuotasService,
    QuotaAlertService,
    UsageTrackerService,
    QuotaEnforcementGuard,
    PrismaService,
    CacheService,
  ],
  exports: [
    QuotasService,
    QuotaAlertService,
    UsageTrackerService,
    QuotaEnforcementGuard,
  ],
})
export class QuotasModule {}

