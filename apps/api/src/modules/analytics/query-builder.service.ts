import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class QueryBuilderService {
  private readonly logger = new Logger(QueryBuilderService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Build SQL query from report configuration
   */
  buildQuery(reportConfig: {
    dataSource: string;
    fields: string[];
    filters?: Array<{ field: string; operator: string; value: any }>;
    groupBy?: string[];
    aggregations?: Array<{ field: string; function: string; alias?: string }>;
    orderBy?: Array<{ field: string; direction: 'asc' | 'desc' }>;
    limit?: number;
  }): { query: string; params: any[] } {
    // Build SELECT clause
    const selectFields = this.buildSelectClause(reportConfig.fields, reportConfig.aggregations);
    
    // Build FROM clause
    const fromClause = `FROM ${reportConfig.dataSource}`;
    
    // Build WHERE clause
    const { whereClause, params } = this.buildWhereClause(reportConfig.filters || []);
    
    // Build GROUP BY clause
    const groupByClause = reportConfig.groupBy && reportConfig.groupBy.length > 0
      ? `GROUP BY ${reportConfig.groupBy.join(', ')}`
      : '';
    
    // Build ORDER BY clause
    const orderByClause = reportConfig.orderBy && reportConfig.orderBy.length > 0
      ? `ORDER BY ${reportConfig.orderBy.map(o => `${o.field} ${o.direction.toUpperCase()}`).join(', ')}`
      : '';
    
    // Build LIMIT clause
    const limitClause = reportConfig.limit ? `LIMIT ${reportConfig.limit}` : '';
    
    // Combine query
    const queryParts = [
      `SELECT ${selectFields}`,
      fromClause,
      whereClause,
      groupByClause,
      orderByClause,
      limitClause,
    ].filter(Boolean);
    
    const query = queryParts.join(' ');
    
    return { query, params };
  }

  /**
   * Validate query safety (prevent SQL injection)
   */
  validateQuery(query: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check for dangerous SQL keywords
    const dangerousKeywords = ['DROP', 'DELETE', 'TRUNCATE', 'ALTER', 'CREATE', 'INSERT', 'UPDATE'];
    const upperQuery = query.toUpperCase();
    
    for (const keyword of dangerousKeywords) {
      if (upperQuery.includes(keyword)) {
        errors.push(`Dangerous SQL keyword detected: ${keyword}`);
      }
    }
    
    // Check for semicolons (potential injection)
    if (query.includes(';')) {
      errors.push('Semicolon detected - potential SQL injection');
    }
    
    // Check for comments (potential injection)
    if (query.includes('--') || query.includes('/*')) {
      errors.push('SQL comments detected - potential injection');
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Optimize query performance
   */
  optimizeQuery(query: string, dataSource: string): string {
    // Add index hints if needed
    // In production, analyze query plan and suggest optimizations
    let optimized = query;
    
    // Add LIMIT if missing and query is large
    if (!query.toUpperCase().includes('LIMIT') && dataSource === 'documents') {
      optimized += ' LIMIT 1000';
    }
    
    return optimized;
  }

  /**
   * Build SELECT clause
   */
  private buildSelectClause(fields: string[], aggregations?: Array<{ field: string; function: string; alias?: string }>): string {
    const selectParts: string[] = [];
    
    // Add regular fields
    for (const field of fields) {
      selectParts.push(this.sanitizeField(field));
    }
    
    // Add aggregations
    if (aggregations) {
      for (const agg of aggregations) {
        const func = agg.function.toUpperCase();
        const field = this.sanitizeField(agg.field);
        const alias = agg.alias ? ` AS ${this.sanitizeField(agg.alias)}` : '';
        
        switch (func) {
          case 'SUM':
            selectParts.push(`SUM(${field})${alias}`);
            break;
          case 'AVG':
            selectParts.push(`AVG(${field})${alias}`);
            break;
          case 'COUNT':
            selectParts.push(`COUNT(${field})${alias}`);
            break;
          case 'MIN':
            selectParts.push(`MIN(${field})${alias}`);
            break;
          case 'MAX':
            selectParts.push(`MAX(${field})${alias}`);
            break;
          default:
            this.logger.warn(`Unknown aggregation function: ${func}`);
        }
      }
    }
    
    return selectParts.length > 0 ? selectParts.join(', ') : '*';
  }

  /**
   * Build WHERE clause with parameterized queries
   */
  private buildWhereClause(filters: Array<{ field: string; operator: string; value: any }>): { whereClause: string; params: any[] } {
    if (filters.length === 0) {
      return { whereClause: '', params: [] };
    }
    
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;
    
    for (const filter of filters) {
      const field = this.sanitizeField(filter.field);
      const operator = filter.operator.toUpperCase();
      const value = filter.value;
      
      switch (operator) {
        case 'EQUALS':
        case '=':
          conditions.push(`${field} = $${paramIndex}`);
          params.push(value);
          paramIndex++;
          break;
        case 'NOT_EQUALS':
        case '!=':
          conditions.push(`${field} != $${paramIndex}`);
          params.push(value);
          paramIndex++;
          break;
        case 'GREATER_THAN':
        case '>':
          conditions.push(`${field} > $${paramIndex}`);
          params.push(value);
          paramIndex++;
          break;
        case 'LESS_THAN':
        case '<':
          conditions.push(`${field} < $${paramIndex}`);
          params.push(value);
          paramIndex++;
          break;
        case 'CONTAINS':
        case 'LIKE':
          conditions.push(`${field} LIKE $${paramIndex}`);
          params.push(`%${value}%`);
          paramIndex++;
          break;
        case 'IN':
          if (Array.isArray(value)) {
            const placeholders = value.map(() => `$${paramIndex++}`).join(', ');
            conditions.push(`${field} IN (${placeholders})`);
            params.push(...value);
          }
          break;
        default:
          this.logger.warn(`Unknown operator: ${operator}`);
      }
    }
    
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    return { whereClause, params };
  }

  /**
   * Sanitize field name to prevent SQL injection
   */
  private sanitizeField(field: string): string {
    // Remove any non-alphanumeric characters except underscore and dot
    return field.replace(/[^a-zA-Z0-9_.]/g, '');
  }
}

