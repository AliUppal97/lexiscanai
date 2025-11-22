import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { Dashboard } from '@prisma/client';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Create dashboard
   */
  async createDashboard(tenantId: string, userId: string, dto: any): Promise<Dashboard> {
    const dashboard = await this.prisma.dashboard.create({
      data: {
        name: dto.name,
        description: dto.description,
        widgets: dto.widgets || [],
        tenantId,
        createdBy: userId,
      },
    });

    return dashboard;
  }

  /**
   * Update dashboard
   */
  async updateDashboard(id: string, tenantId: string, dto: any): Promise<Dashboard> {
    const dashboard = await this.prisma.dashboard.findFirst({
      where: { id, tenantId },
    });

    if (!dashboard) {
      throw new Error(`Dashboard ${id} not found`);
    }

    const updated = await this.prisma.dashboard.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        widgets: dto.widgets,
      },
    });

    return updated;
  }

  /**
   * Get dashboard data
   */
  async getDashboardData(id: string, tenantId: string): Promise<any> {
    const dashboard = await this.prisma.dashboard.findFirst({
      where: { id, tenantId },
    });

    if (!dashboard) {
      throw new Error(`Dashboard ${id} not found`);
    }

    // Execute widget queries and return data
    const widgets = (dashboard.widgets as any[]) || [];
    const widgetData = await Promise.all(
      widgets.map(async (widget) => {
        // Execute widget query
        return {
          id: widget.id,
          type: widget.type,
          data: await this.executeWidgetQuery(widget, tenantId),
        };
      }),
    );

    return {
      dashboard,
      widgets: widgetData,
    };
  }

  /**
   * Execute widget query
   */
  private async executeWidgetQuery(widget: any, tenantId: string): Promise<any> {
    // Simplified - would execute actual queries based on widget config
    this.logger.debug(`Executing widget query: ${widget.type} for tenant ${tenantId}`);
    return { data: [] };
  }
}

