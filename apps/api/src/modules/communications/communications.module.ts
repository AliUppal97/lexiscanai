import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { MulterModule } from '@nestjs/platform-express';

// Email Services
import { EmailService } from './email/email.service';
import { EmailQueueService } from './email/email.queue';

// Notification Services
import { InAppNotificationService } from './notifications/in-app.service';
import { PushNotificationService } from './notifications/push.service';
import { SmsNotificationService } from './notifications/sms.service';

// Webhook Services
import { WebhookService } from './webhooks/webhook.service';
import { WebhookRetryService } from './webhooks/webhook-retry.service';

// Core Services
import { CacheService } from '../../services/cache.service';
import { QueueService } from '../../services/queue.service';
import { PrismaService } from '../../common/prisma.service';

/**
 * Communications Module for LexiScan AI
 * 
 * Comprehensive communication system including:
 * - Email services with template support and queue processing
 * - Multi-channel notifications (in-app, push, SMS)
 * - Webhook delivery with retry mechanisms
 * - Real-time communication capabilities
 * - Enterprise-grade reliability and scalability
 */
@Module({
  imports: [
    ConfigModule,
    ScheduleModule.forRoot(),
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
    MulterModule.register({
      dest: './uploads/email-attachments',
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  ],
  controllers: [],
  providers: [
    // Core Services
    PrismaService,
    CacheService,
    QueueService,
    
    // Email Services
    EmailService,
    EmailQueueService,
    
    // Notification Services
    InAppNotificationService,
    PushNotificationService,
    SmsNotificationService,
    
    // Webhook Services
    WebhookService,
    WebhookRetryService,
  ],
  exports: [
    // Email Services
    EmailService,
    EmailQueueService,
    
    // Notification Services
    InAppNotificationService,
    PushNotificationService,
    SmsNotificationService,
    
    // Webhook Services
    WebhookService,
    WebhookRetryService,
  ],
})
export class CommunicationsModule {}
