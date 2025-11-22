import { Controller, Get, Put, Post, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EnhancedJwtAuthGuard } from '../auth/enhanced-auth.guard';
import { BrandingService } from './branding.service';
import { CustomDomainService } from './custom-domain.service';
import { ThemeService } from './theme.service';
import { EmailTemplateService } from './email-template.service';

@ApiTags('White-Labeling')
@ApiBearerAuth()
@Controller('branding')
@UseGuards(EnhancedJwtAuthGuard)
export class WhiteLabelingController {
  constructor(
    private brandingService: BrandingService,
    private customDomainService: CustomDomainService,
    private themeService: ThemeService,
    private emailTemplateService: EmailTemplateService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get branding configuration' })
  async getBranding(@Request() req: any): Promise<any> {
    const tenantId = req.user.tenantId;
    return this.brandingService.getBranding(tenantId);
  }

  @Put()
  @ApiOperation({ summary: 'Update branding' })
  async updateBranding(@Request() req: any, @Body() dto: any): Promise<any> {
    const tenantId = req.user.tenantId;
    return this.brandingService.updateBranding(tenantId, dto);
  }

  @Post('preview')
  @ApiOperation({ summary: 'Generate branding preview' })
  async generatePreview(@Request() req: any): Promise<{ html: string }> {
    const tenantId = req.user.tenantId;
    const html = await this.brandingService.generateBrandingPreview(tenantId);
    return { html };
  }

  @Get('custom-domains')
  @ApiOperation({ summary: 'List custom domains' })
  async listDomains(@Request() req: any): Promise<any[]> {
    // TODO: Implement list
    return [];
  }

  @Post('custom-domains')
  @ApiOperation({ summary: 'Add custom domain' })
  async addDomain(@Request() req: any, @Body() dto: { domain: string }): Promise<any> {
    const tenantId = req.user.tenantId;
    return this.customDomainService.addDomain(tenantId, dto.domain);
  }

  @Post('custom-domains/:id/verify')
  @ApiOperation({ summary: 'Verify custom domain' })
  async verifyDomain(@Request() req: any, @Param('id') id: string): Promise<{ verified: boolean }> {
    const tenantId = req.user.tenantId;
    // TODO: Get domain from ID
    const verified = await this.customDomainService.verifyDomain(tenantId, '');
    return { verified };
  }

  @Delete('custom-domains/:id')
  @ApiOperation({ summary: 'Remove custom domain' })
  async removeDomain(@Request() req: any, @Param('id') id: string): Promise<void> {
    const tenantId = req.user.tenantId;
    // TODO: Get domain from ID
    await this.customDomainService.removeDomain(tenantId, '');
  }

  @Get('themes')
  @ApiOperation({ summary: 'List themes' })
  async listThemes(@Request() req: any): Promise<any[]> {
    const tenantId = req.user?.tenantId || null;
    return this.themeService.getThemes(tenantId);
  }

  @Post('themes')
  @ApiOperation({ summary: 'Create theme' })
  async createTheme(@Request() req: any, @Body() dto: any): Promise<any> {
    const tenantId = req.user?.tenantId || null;
    return this.themeService.createTheme(tenantId, dto);
  }

  @Get('email-templates')
  @ApiOperation({ summary: 'List email templates' })
  async listEmailTemplates(@Request() req: any): Promise<any[]> {
    // TODO: Implement list
    return [];
  }

  @Post('email-templates')
  @ApiOperation({ summary: 'Create email template' })
  async createEmailTemplate(@Request() req: any, @Body() dto: any): Promise<any> {
    const tenantId = req.user?.tenantId || null;
    return this.emailTemplateService.createTemplate(tenantId, dto);
  }
}

