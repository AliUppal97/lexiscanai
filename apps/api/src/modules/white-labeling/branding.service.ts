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

    // Sanitize CSS to prevent XSS
    const sanitizedCss = this.sanitizeCss(branding.customCss || '');

    // Generate preview HTML
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Branding Preview</title>
          <style>
            :root {
              --primary-color: ${branding.primaryColor || '#000000'};
              --secondary-color: ${branding.secondaryColor || '#666666'};
              --accent-color: ${branding.accentColor || '#0066cc'};
            }
            body {
              font-family: ${branding.fontFamily || 'Arial, sans-serif'};
              margin: 0;
              padding: 20px;
            }
            .preview {
              max-width: 800px;
              margin: 0 auto;
            }
            .logo {
              max-width: 200px;
              margin-bottom: 20px;
            }
            h1 {
              color: var(--primary-color);
            }
            .button {
              background-color: var(--accent-color);
              color: white;
              padding: 10px 20px;
              border: none;
              border-radius: 4px;
              cursor: pointer;
            }
            ${sanitizedCss}
          </style>
        </head>
        <body>
          <div class="preview">
            ${branding.logoUrl ? `<img src="${branding.logoUrl}" alt="Logo" class="logo" />` : ''}
            <h1>Branding Preview</h1>
            <p style="color: var(--secondary-color);">This is how your brand will appear to users.</p>
            <button class="button">Sample Button</button>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Validate branding assets
   */
  async validateBrandingAssets(assets: {
    logoUrl?: string;
    faviconUrl?: string;
    customCss?: string;
    customJs?: string;
  }): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Validate logo size (max 2MB)
    if (assets.logoUrl) {
      // In production, would fetch and check actual file size
      // For now, just check URL format
      if (!assets.logoUrl.match(/^https?:\/\//)) {
        errors.push('Logo URL must be a valid HTTP/HTTPS URL');
      }
    }

    // Validate CSS (prevent XSS)
    if (assets.customCss) {
      const dangerousPatterns = ['javascript:', 'expression(', 'import ', '@import'];
      for (const pattern of dangerousPatterns) {
        if (assets.customCss.toLowerCase().includes(pattern.toLowerCase())) {
          errors.push(`CSS contains potentially dangerous pattern: ${pattern}`);
        }
      }
    }

    // Validate JS (would be sandboxed in production)
    if (assets.customJs) {
      // In production, would use VM2 or similar for sandboxing
      // For now, just warn
      this.logger.warn('Custom JavaScript detected - ensure proper sandboxing');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Sanitize CSS to prevent XSS
   */
  private sanitizeCss(css: string): string {
    // Remove dangerous CSS patterns
    let sanitized = css;

    // Remove javascript: URLs
    sanitized = sanitized.replace(/javascript:/gi, '');

    // Remove expression() functions
    sanitized = sanitized.replace(/expression\s*\(/gi, '');

    // Remove @import statements
    sanitized = sanitized.replace(/@import[^;]+;/gi, '');

    return sanitized;
  }
}

