import { Module } from '@nestjs/common';
import { VersionController } from './version.controller';
import { VersionService } from './version.service';
import { VersionGuard } from './version.guard';
import { VersionInterceptor } from './version.interceptor';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [VersionController],
  providers: [VersionService, VersionGuard, VersionInterceptor, PrismaService],
  exports: [VersionService, VersionGuard, VersionInterceptor],
})
export class VersionModule {}

