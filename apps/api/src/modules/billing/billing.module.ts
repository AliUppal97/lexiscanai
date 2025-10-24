import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { SubscriptionService } from './subscription.service';
import { InvoiceService } from './invoice.service';
import { StripeService } from './stripe.service';
import { PrismaService } from '../../common/prisma.service';

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
