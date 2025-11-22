import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EnhancedJwtAuthGuard } from '../auth/enhanced-auth.guard';
import { ReportBuilderService } from './report-builder.service';
import { DashboardService } from './dashboard.service';
import { ReportSchedulerService } from './report-scheduler.service';

@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('analytics')
@UseGuards(EnhancedJwtAuthGuard)
export class AnalyticsController {
  constructor(
    private reportBuilder: ReportBuilderService,
    private dashboardService: DashboardService,
    private reportScheduler: ReportSchedulerService,
  ) {}

  @Get('reports')
  @ApiOperation({ summary: 'List reports' })
  async listReports(@Request() req: any): Promise<any[]> {
    // TODO: Implement list
    return [];
  }

  @Post('reports')
  @ApiOperation({ summary: 'Create report' })
  async createReport(@Request() req: any, @Body() dto: any): Promise<any> {
    const tenantId = req.user.tenantId;
    const userId = req.user.id;
    return this.reportBuilder.createReport(tenantId, userId, dto);
  }

  @Get('reports/:id')
  @ApiOperation({ summary: 'Get report' })
  async getReport(@Request() req: any, @Param('id') id: string): Promise<any> {
    const tenantId = req.user.tenantId;
    return this.reportBuilder.getReportData(id, tenantId);
  }

  @Put('reports/:id')
  @ApiOperation({ summary: 'Update report' })
  async updateReport(@Request() req: any, @Param('id') id: string, @Body() dto: any): Promise<any> {
    const tenantId = req.user.tenantId;
    return this.reportBuilder.updateReport(id, tenantId, dto);
  }

  @Delete('reports/:id')
  @ApiOperation({ summary: 'Delete report' })
  async deleteReport(@Request() req: any, @Param('id') id: string): Promise<void> {
    const tenantId = req.user.tenantId;
    return this.reportBuilder.deleteReport(id, tenantId);
  }

  @Post('reports/:id/execute')
  @ApiOperation({ summary: 'Execute report' })
  async executeReport(@Request() req: any, @Param('id') id: string, @Body() filters?: any): Promise<any> {
    const tenantId = req.user.tenantId;
    return this.reportBuilder.executeReport(id, tenantId, filters);
  }

  @Get('dashboards')
  @ApiOperation({ summary: 'List dashboards' })
  async listDashboards(@Request() req: any): Promise<any[]> {
    // TODO: Implement list
    return [];
  }

  @Post('dashboards')
  @ApiOperation({ summary: 'Create dashboard' })
  async createDashboard(@Request() req: any, @Body() dto: any): Promise<any> {
    const tenantId = req.user.tenantId;
    const userId = req.user.id;
    return this.dashboardService.createDashboard(tenantId, userId, dto);
  }

  @Get('dashboards/:id')
  @ApiOperation({ summary: 'Get dashboard data' })
  async getDashboard(@Request() req: any, @Param('id') id: string): Promise<any> {
    const tenantId = req.user.tenantId;
    return this.dashboardService.getDashboardData(id, tenantId);
  }

  @Get('report-templates')
  @ApiOperation({ summary: 'List report templates' })
  async listTemplates(): Promise<any[]> {
    // TODO: Implement list
    return [];
  }

  @Get('scheduled-reports')
  @ApiOperation({ summary: 'List scheduled reports' })
  async listScheduledReports(@Request() req: any): Promise<any[]> {
    // TODO: Implement list
    return [];
  }
}
