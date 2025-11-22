import { Module } from '@nestjs/common';
import { WhiteLabelingController } from './white-labeling.controller';
import { BrandingService } from './branding.service';
import { CustomDomainService } from './custom-domain.service';
import { ThemeService } from './theme.service';
import { EmailTemplateService } from './email-template.service';
import { PrismaService } from '../../common/prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [WhiteLabelingController],
  providers: [
    BrandingService,
    CustomDomainService,
    ThemeService,
    EmailTemplateService,
    PrismaService,
  ],
  exports: [BrandingService, CustomDomainService, ThemeService, EmailTemplateService],
})
export class WhiteLabelingModule {}

