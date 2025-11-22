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

    if (branding) {
      await this.prisma.brandingConfig.update({
        where: { tenantId },
        data: {
          primaryColor: (theme.config as any).primaryColor,
          secondaryColor: (theme.config as any).secondaryColor,
          accentColor: (theme.config as any).accentColor,
          fontFamily: (theme.config as any).fontFamily,
        },
      });
    }
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

