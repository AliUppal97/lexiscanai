import { Module } from '@nestjs/common';
import { SecurityController } from './security.controller';
import { DlpService } from './dlp.service';
import { DataClassificationService } from './data-classification.service';
import { ZeroTrustService } from './zero-trust.service';
import { DeviceTrustService } from './device-trust.service';
import { SoarService } from './soar.service';
import { PrismaService } from '../../common/prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [SecurityController],
  providers: [
    DlpService,
    DataClassificationService,
    ZeroTrustService,
    DeviceTrustService,
    SoarService,
    PrismaService,
  ],
  exports: [
    DlpService,
    DataClassificationService,
    ZeroTrustService,
    DeviceTrustService,
    SoarService,
  ],
})
export class SecurityModule {}

