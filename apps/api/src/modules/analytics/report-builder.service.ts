import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { Report, ReportType } from '@prisma/client';
import { QueryBuilderService } from './query-builder.service';
import { CacheService } from '../../services/cache.service';

@Injectable()
export class ReportBuilderService {
  private readonly logger = new Logger(ReportBuilderService.name);
  private readonly CACHE_TTL = 300; // 5 minutes

  constructor(
    private prisma: PrismaService,
    private queryBuilder: QueryBuilderService,
    private cache: CacheService,
  ) {}

  /**
   * Create custom report
   */
  async createReport(tenantId: string, userId: string, dto: any): Promise<Report> {
    const report = await this.prisma.report.create({
      data: {
        name: dto.name,
        description: dto.description,
        type: ReportType.CUSTOM,
        config: dto.config || {},
        tenantId,
        createdBy: userId,
      },
    });

    return report;
  }

  /**
   * Update report
   */
  async updateReport(id: string, tenantId: string, dto: any): Promise<Report> {
    const report = await this.getReport(id, tenantId);

    const updated = await this.prisma.report.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        config: dto.config,
      },
    });

    return updated;
  }

  /**
   * Delete report
   */
  async deleteReport(id: string, tenantId: string): Promise<void> {
    await this.getReport(id, tenantId);
    await this.prisma.report.delete({ where: { id } });
  }

  /**
   * Execute report
   */
  async executeReport(id: string, tenantId: string, filters?: any): Promise<any> {
    const report = await this.getReport(id, tenantId);
    const startTime = Date.now();

    try {
      // Build query from report config
      const query = this.buildQuery(report.config, filters);

      // Execute query (simplified - would use actual query builder)
      const data = await this.executeQuery(query, tenantId);

      const duration = Date.now() - startTime;

      // Record execution
      await this.prisma.reportExecution.create({
        data: {
          reportId: id,
          duration,
          status: 'SUCCESS',
        },
      });

      return { data, duration };
    } catch (error) {
      const duration = Date.now() - startTime;
      await this.prisma.reportExecution.create({
        data: {
          reportId: id,
          duration,
          status: 'FAILED',
          errorMessage: error.message,
        },
      });
      throw error;
    }
  }

  /**
   * Get report data
   */
  async getReportData(id: string, tenantId: string, filters?: any): Promise<any> {
    const report = await this.getReport(id, tenantId);
    const query = this.buildQuery(report.config, filters);
    return this.executeQuery(query, tenantId);
  }

  /**
   * Build SQL query from report config
   */
  private buildQuery(config: any, filters?: any): string {
    // Simplified query builder - in production use a proper query builder
    const baseQuery = config.query || 'SELECT * FROM documents';
    const whereClause = filters ? this.buildWhereClause(filters) : '';
    return `${baseQuery} ${whereClause}`;
  }

  /**
   * Build WHERE clause from filters
   */
  private buildWhereClause(filters: any): string {
    // Simplified - in production use proper SQL escaping
    const conditions: string[] = [];
    if (filters.startDate) {
      conditions.push(`created_at >= '${filters.startDate}'`);
    }
    if (filters.endDate) {
      conditions.push(`created_at <= '${filters.endDate}'`);
    }
    return conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  }

  /**
   * Execute query (simplified - would use Prisma or raw SQL)
   */
  private async executeQuery(query: string, tenantId: string): Promise<any[]> {
    // In production, use Prisma query builder or raw SQL with proper escaping
    this.logger.debug(`Executing query: ${query} for tenant ${tenantId}`);
    return [];
  }

  /**
   * Get report by ID
   */
  private async getReport(id: string, tenantId: string): Promise<Report> {
    const report = await this.prisma.report.findFirst({
      where: { id, tenantId },
    });

    if (!report) {
      throw new NotFoundException(`Report ${id} not found`);
    }

    return report;
  }
}

