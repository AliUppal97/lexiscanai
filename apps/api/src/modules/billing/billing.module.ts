import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { SubscriptionService } from './subscription.service';
import { InvoiceService } from './invoice.service';
import { StripeService } from './stripe.service';
import { PrismaService } from '../../common/prisma.service';

@Module({
  imports: [ConfigModule],
  controllers: [BillingController],
  providers: [
    BillingService,
    SubscriptionService,
    InvoiceService,
    StripeService,
    PrismaService,
  ],
  exports: [
    BillingService,
    SubscriptionService,
    InvoiceService,
    StripeService,
  ],
})
export class BillingModule {}
