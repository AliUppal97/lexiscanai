import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { ReportGeneratorService } from './report-generator.service';
import { ExportService } from './export.service';
import { ScheduledReportsService } from './scheduled-reports.service';
import { CacheService } from '../../services/cache.service';
import { EmailService } from '../../services/email.service';
import { StorageService } from '../../services/storage.service';
import { PrismaService } from '../../common/prisma.service';

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
  ],
  controllers: [],
  providers: [
    PrismaService,
    CacheService,
    EmailService,
    StorageService,
    ReportGeneratorService,
    ExportService,
    ScheduledReportsService,
  ],
  exports: [
    ReportGeneratorService,
    ExportService,
    ScheduledReportsService,
  ],
})
export class ReportingModule {}
