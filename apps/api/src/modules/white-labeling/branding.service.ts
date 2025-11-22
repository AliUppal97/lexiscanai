import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { BrandingConfig } from '@prisma/client';

@Injectable()
export class BrandingService {
  private readonly logger = new Logger(BrandingService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Get branding configuration
   */
  async getBranding(tenantId: string): Promise<BrandingConfig | null> {
    return this.prisma.brandingConfig.findUnique({
      where: { tenantId },
    });
  }

  /**
   * Update branding
   */
  async updateBranding(tenantId: string, dto: any): Promise<BrandingConfig> {
    const branding = await this.prisma.brandingConfig.upsert({
      where: { tenantId },
      update: {
        logoUrl: dto.logoUrl,
        faviconUrl: dto.faviconUrl,
        primaryColor: dto.primaryColor,
        secondaryColor: dto.secondaryColor,
        accentColor: dto.accentColor,
        fontFamily: dto.fontFamily,
        customCss: dto.customCss,
        customJs: dto.customJs,
        emailTemplate: dto.emailTemplate,
      },
      create: {
        tenantId,
        logoUrl: dto.logoUrl,
        faviconUrl: dto.faviconUrl,
        primaryColor: dto.primaryColor,
        secondaryColor: dto.secondaryColor,
        accentColor: dto.accentColor,
        fontFamily: dto.fontFamily,
        customCss: dto.customCss,
        customJs: dto.customJs,
        emailTemplate: dto.emailTemplate,
      },
    });

    return branding;
  }

  /**
   * Apply branding to response
   */
  async applyBranding(tenantId: string, request: any): Promise<any> {
    const branding = await this.getBranding(tenantId);
    if (!branding) {
      return {};
    }

    return {
      logo: branding.logoUrl,
      favicon: branding.faviconUrl,
      colors: {
        primary: branding.primaryColor,
        secondary: branding.secondaryColor,
        accent: branding.accentColor,
      },
      fontFamily: branding.fontFamily,
      customCss: branding.customCss,
      customJs: branding.customJs,
    };
  }

  /**
   * Generate branding preview
   */
  async generateBrandingPreview(tenantId: string): Promise<string> {
    const branding = await this.getBranding(tenantId);
    if (!branding) {
      return '';
    }

    // Generate preview HTML
    return `
      <html>
        <head>
          <style>
            :root {
              --primary-color: ${branding.primaryColor || '#000000'};
              --secondary-color: ${branding.secondaryColor || '#666666'};
              --accent-color: ${branding.accentColor || '#0066cc'};
              font-family: ${branding.fontFamily || 'Arial, sans-serif'};
            }
            ${branding.customCss || ''}
          </style>
        </head>
        <body>
          <div class="preview">
            <img src="${branding.logoUrl || ''}" alt="Logo" />
            <h1 style="color: var(--primary-color);">Branding Preview</h1>
          </div>
        </body>
      </html>
    `;
  }
}

