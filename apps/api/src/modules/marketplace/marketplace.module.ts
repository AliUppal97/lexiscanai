import { Module } from '@nestjs/common';
import { MarketplaceController } from './marketplace.controller';
import { MarketplaceService } from './marketplace.service';
import { DeveloperPlatformService } from './developer-platform.service';
import { AppExecutionService } from './app-execution.service';
import { RevenueService } from './revenue.service';
import { PrismaService } from '../../common/prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [MarketplaceController],
  providers: [
    MarketplaceService,
    DeveloperPlatformService,
    AppExecutionService,
    RevenueService,
    PrismaService,
  ],
  exports: [MarketplaceService, DeveloperPlatformService],
})
export class MarketplaceModule {}

