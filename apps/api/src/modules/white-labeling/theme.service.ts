import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { Theme } from '@prisma/client';

@Injectable()
export class ThemeService {
  private readonly logger = new Logger(ThemeService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Create theme
   */
  async createTheme(tenantId: string | null, dto: any): Promise<Theme> {
    const theme = await this.prisma.theme.create({
      data: {
        name: dto.name,
        description: dto.description,
        config: dto.config || {},
        isPublic: dto.isPublic || false,
        tenantId,
      },
    });

    return theme;
  }

  /**
   * Apply theme to tenant
   */
  async applyTheme(tenantId: string, themeId: string): Promise<void> {
    const theme = await this.prisma.theme.findFirst({
      where: {
        id: themeId,
        OR: [{ tenantId }, { isPublic: true }],
      },
    });

    if (!theme) {
      throw new Error(`Theme ${themeId} not found`);
    }

    // Update branding config with theme
    const branding = await this.prisma.brandingConfig.findUnique({
      where: { tenantId },
    });

    const themeConfig = theme.config as any;

    if (branding) {
      await this.prisma.brandingConfig.update({
        where: { tenantId },
        data: {
          primaryColor: themeConfig.primaryColor || branding.primaryColor,
          secondaryColor: themeConfig.secondaryColor || branding.secondaryColor,
          accentColor: themeConfig.accentColor || branding.accentColor,
          fontFamily: themeConfig.fontFamily || branding.fontFamily,
          customCss: themeConfig.customCss || branding.customCss,
        },
      });
    } else {
      // Create branding config if it doesn't exist
      await this.prisma.brandingConfig.create({
        data: {
          tenantId,
          primaryColor: themeConfig.primaryColor,
          secondaryColor: themeConfig.secondaryColor,
          accentColor: themeConfig.accentColor,
          fontFamily: themeConfig.fontFamily,
          customCss: themeConfig.customCss,
        },
      });
    }
  }

  /**
   * Generate theme preview
   */
  async generateThemePreview(themeId: string): Promise<string> {
    const theme = await this.prisma.theme.findUnique({
      where: { id: themeId },
    });

    if (!theme) {
      throw new Error(`Theme ${themeId} not found`);
    }

    const config = theme.config as any;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            :root {
              --primary-color: ${config.primaryColor || '#000000'};
              --secondary-color: ${config.secondaryColor || '#666666'};
              --accent-color: ${config.accentColor || '#0066cc'};
            }
            body {
              font-family: ${config.fontFamily || 'Arial, sans-serif'};
            }
            ${config.customCss || ''}
          </style>
        </head>
        <body>
          <h1 style="color: var(--primary-color);">Theme Preview</h1>
          <p style="color: var(--secondary-color);">${theme.description || ''}</p>
        </body>
      </html>
    `;
  }

  /**
   * Get themes
   */
  async getThemes(tenantId: string | null): Promise<Theme[]> {
    return this.prisma.theme.findMany({
      where: {
        OR: [{ tenantId }, { isPublic: true }],
      },
    });
  }
}

