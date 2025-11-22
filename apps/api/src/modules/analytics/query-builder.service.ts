import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class QueryBuilderService {
  private readonly logger = new Logger(QueryBuilderService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Build SQL query from report configuration with full SQL engine support
   */
  buildQuery(reportConfig: {
    dataSource: string;
    fields: string[];
    filters?: Array<{ field: string; operator: string; value: any; logic?: 'AND' | 'OR' }>;
    joins?: Array<{ table: string; type: 'INNER' | 'LEFT' | 'RIGHT' | 'FULL'; on: string }>;
    groupBy?: string[];
    having?: Array<{ field: string; operator: string; value: any }>;
    aggregations?: Array<{ field: string; function: string; alias?: string }>;
    orderBy?: Array<{ field: string; direction: 'asc' | 'desc' }>;
    limit?: number;
    offset?: number;
    tenantId: string; // Required for RLS
  }): { query: string; params: any[] } {
    // Validate configuration
    this.validateConfig(reportConfig);

    // Build SELECT clause
    const selectFields = this.buildSelectClause(reportConfig.fields, reportConfig.aggregations);
    
    // Build FROM clause with JOINs
    const fromClause = this.buildFromClause(reportConfig.dataSource, reportConfig.joins || []);
    
    // Build WHERE clause with parameterization
    const { whereClause, params } = this.buildWhereClause(reportConfig.filters || [], reportConfig.tenantId);
    
    // Build GROUP BY clause
    const groupByClause = this.buildGroupByClause(reportConfig.groupBy || []);
    
    // Build HAVING clause
    const havingClause = this.buildHavingClause(reportConfig.having || [], params.length);
    
    // Build ORDER BY clause
    const orderByClause = this.buildOrderByClause(reportConfig.orderBy || []);
    
    // Build LIMIT/OFFSET clause
    const limitClause = this.buildLimitClause(reportConfig.limit, reportConfig.offset);
    
    // Combine query
    const queryParts = [
      `SELECT ${selectFields}`,
      fromClause,
      whereClause,
      groupByClause,
      havingClause,
      orderByClause,
      limitClause,
    ].filter(Boolean);
    
    const query = queryParts.join(' ');
    
    // Validate query safety
    const validation = this.validateQuery(query);
    if (!validation.valid) {
      throw new Error(`Invalid query: ${validation.errors.join(', ')}`);
    }
    
    return { query, params };
  }

  /**
   * Validate report configuration
   */
  private validateConfig(config: any): void {
    if (!config.dataSource) {
      throw new Error('Report configuration must specify a data source');
    }

    if (!config.tenantId) {
      throw new Error('Report configuration must specify tenantId for security');
    }

    // Validate field names
    const allowedFields = this.getAllowedFields(config.dataSource);
    if (config.fields && config.fields.length > 0) {
      for (const field of config.fields) {
        if (!this.isFieldAllowed(field, allowedFields)) {
          throw new Error(`Field '${field}' is not allowed for data source '${config.dataSource}'`);
        }
      }
    }
  }

  /**
   * Get allowed fields for a data source (whitelist)
   */
  private getAllowedFields(dataSource: string): string[] {
    // In production, load from schema or configuration
    const fieldWhitelist: Record<string, string[]> = {
      documents: ['id', 'title', 'content', 'status', 'createdAt', 'updatedAt', 'tenantId'],
      users: ['id', 'email', 'firstName', 'lastName', 'isActive', 'createdAt', 'tenantId'],
      usageRecords: ['id', 'resourceType', 'quantity', 'timestamp', 'tenantId'],
    };

    return fieldWhitelist[dataSource] || [];
  }

  /**
   * Check if field is allowed
   */
  private isFieldAllowed(field: string, allowedFields: string[]): boolean {
    // Allow dot notation for joined fields (e.g., "users.email")
    const baseField = field.split('.')[field.split('.').length - 1];
    return allowedFields.includes(baseField) || allowedFields.includes(field);
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
   * Build WHERE clause with parameterized queries and complex logic (AND/OR/NOT)
   */
  private buildWhereClause(
    filters: Array<{ field: string; operator: string; value: any; logic?: 'AND' | 'OR' }>,
    tenantId: string,
  ): { whereClause: string; params: any[] } {
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;
    
    // Always add tenant filter for security (Row-Level Security)
    conditions.push(`"tenantId" = $${paramIndex++}`);
    params.push(tenantId);
    
    if (filters.length === 0) {
      return { whereClause: `WHERE ${conditions.join(' AND ')}`, params };
    }
    
    for (const filter of filters) {
      const field = this.sanitizeField(filter.field);
      const operator = filter.operator.toUpperCase();
      const value = filter.value;
      const logic = filter.logic || 'AND';
      
      let condition: string;
      
      switch (operator) {
        case 'EQUALS':
        case '=':
          condition = `${field} = $${paramIndex}`;
          params.push(value);
          paramIndex++;
          break;
        case 'NOT_EQUALS':
        case '!=':
        case '<>':
          condition = `${field} != $${paramIndex}`;
          params.push(value);
          paramIndex++;
          break;
        case 'GREATER_THAN':
        case '>':
          condition = `${field} > $${paramIndex}`;
          params.push(value);
          paramIndex++;
          break;
        case 'LESS_THAN':
        case '<':
          condition = `${field} < $${paramIndex}`;
          params.push(value);
          paramIndex++;
          break;
        case 'GREATER_THAN_OR_EQUAL':
        case '>=':
          condition = `${field} >= $${paramIndex}`;
          params.push(value);
          paramIndex++;
          break;
        case 'LESS_THAN_OR_EQUAL':
        case '<=':
          condition = `${field} <= $${paramIndex}`;
          params.push(value);
          paramIndex++;
          break;
        case 'CONTAINS':
        case 'LIKE':
          condition = `${field} ILIKE $${paramIndex}`; // Case-insensitive LIKE
          params.push(`%${value}%`);
          paramIndex++;
          break;
        case 'STARTS_WITH':
          condition = `${field} ILIKE $${paramIndex}`;
          params.push(`${value}%`);
          paramIndex++;
          break;
        case 'ENDS_WITH':
          condition = `${field} ILIKE $${paramIndex}`;
          params.push(`%${value}`);
          paramIndex++;
          break;
        case 'IN':
          if (Array.isArray(value) && value.length > 0) {
            const placeholders = value.map(() => `$${paramIndex++}`).join(', ');
            condition = `${field} IN (${placeholders})`;
            params.push(...value);
          } else {
            continue; // Skip empty IN clause
          }
          break;
        case 'NOT_IN':
          if (Array.isArray(value) && value.length > 0) {
            const placeholders = value.map(() => `$${paramIndex++}`).join(', ');
            condition = `${field} NOT IN (${placeholders})`;
            params.push(...value);
          } else {
            continue;
          }
          break;
        case 'IS_NULL':
          condition = `${field} IS NULL`;
          break;
        case 'IS_NOT_NULL':
          condition = `${field} IS NOT NULL`;
          break;
        case 'BETWEEN':
          if (Array.isArray(value) && value.length === 2) {
            condition = `${field} BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
            params.push(value[0], value[1]);
            paramIndex += 2;
          } else {
            continue;
          }
          break;
        default:
          this.logger.warn(`Unknown operator: ${operator}`);
          continue;
      }
      
      if (logic === 'OR') {
        conditions.push(`OR ${condition}`);
      } else {
        conditions.push(`AND ${condition}`);
      }
    }
    
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' ')}` : '';
    return { whereClause, params };
  }

  /**
   * Build FROM clause with JOINs
   */
  private buildFromClause(dataSource: string, joins: Array<{ table: string; type: string; on: string }>): string {
    let fromClause = `FROM "${dataSource}"`;
    
    for (const join of joins) {
      const joinType = join.type.toUpperCase();
      const table = this.sanitizeTable(join.table);
      const onCondition = this.sanitizeJoinCondition(join.on);
      
      fromClause += ` ${joinType} JOIN "${table}" ON ${onCondition}`;
    }
    
    return fromClause;
  }

  /**
   * Build GROUP BY clause
   */
  private buildGroupByClause(groupBy: string[]): string {
    if (groupBy.length === 0) {
      return '';
    }
    
    const sanitized = groupBy.map(field => this.sanitizeField(field));
    return `GROUP BY ${sanitized.join(', ')}`;
  }

  /**
   * Build HAVING clause
   */
  private buildHavingClause(
    having: Array<{ field: string; operator: string; value: any }>,
    startParamIndex: number,
  ): string {
    if (having.length === 0) {
      return '';
    }
    
    const conditions: string[] = [];
    let paramIndex = startParamIndex;
    
    for (const condition of having) {
      const field = this.sanitizeField(condition.field);
      const operator = condition.operator.toUpperCase();
      const value = condition.value;
      
      switch (operator) {
        case '>':
          conditions.push(`${field} > $${paramIndex++}`);
          break;
        case '<':
          conditions.push(`${field} < $${paramIndex++}`);
          break;
        case '=':
          conditions.push(`${field} = $${paramIndex++}`);
          break;
        default:
          this.logger.warn(`Unknown HAVING operator: ${operator}`);
      }
    }
    
    return conditions.length > 0 ? `HAVING ${conditions.join(' AND ')}` : '';
  }

  /**
   * Build ORDER BY clause
   */
  private buildOrderByClause(orderBy: Array<{ field: string; direction: 'asc' | 'desc' }>): string {
    if (orderBy.length === 0) {
      return '';
    }
    
    const orders = orderBy.map(order => {
      const field = this.sanitizeField(order.field);
      const direction = order.direction.toUpperCase();
      return `${field} ${direction}`;
    });
    
    return `ORDER BY ${orders.join(', ')}`;
  }

  /**
   * Build LIMIT/OFFSET clause
   */
  private buildLimitClause(limit?: number, offset?: number): string {
    const clauses: string[] = [];
    
    if (limit !== undefined && limit > 0) {
      clauses.push(`LIMIT ${limit}`);
    }
    
    if (offset !== undefined && offset >= 0) {
      clauses.push(`OFFSET ${offset}`);
    }
    
    return clauses.join(' ');
  }

  /**
   * Sanitize table name
   */
  private sanitizeTable(table: string): string {
    return table.replace(/[^a-zA-Z0-9_]/g, '');
  }

  /**
   * Sanitize JOIN condition
   */
  private sanitizeJoinCondition(condition: string): string {
    // Allow field.field format for JOIN conditions
    return condition.replace(/[^a-zA-Z0-9_.= ]/g, '');
  }

  /**
   * Sanitize field name to prevent SQL injection
   */
  private sanitizeField(field: string): string {
    // Remove any non-alphanumeric characters except underscore and dot
    return field.replace(/[^a-zA-Z0-9_.]/g, '');
  }
}

