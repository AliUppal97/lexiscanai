import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma.service';

export interface AuditLogEntry {
  id?: string;
  tenantId: string;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  method?: string;
  status: 'success' | 'failure';
  ipAddress?: string;
  userAgent?: string;
  details?: any;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export enum AuditAction {
  // Authentication
  LOGIN = 'auth.login',
  LOGOUT = 'auth.logout',
  LOGIN_FAILED = 'auth.login_failed',
  PASSWORD_RESET = 'auth.password_reset',
  PASSWORD_CHANGED = 'auth.password_changed',
  
  // Documents
  DOCUMENT_CREATED = 'document.created',
  DOCUMENT_VIEWED = 'document.viewed',
  DOCUMENT_UPDATED = 'document.updated',
  DOCUMENT_DELETED = 'document.deleted',
  DOCUMENT_UPLOADED = 'document.uploaded',
  DOCUMENT_DOWNLOADED = 'document.downloaded',
  DOCUMENT_PROCESSED = 'document.processed',
  
  // Users
  USER_CREATED = 'user.created',
  USER_UPDATED = 'user.updated',
  USER_DELETED = 'user.deleted',
  USER_INVITED = 'user.invited',
  
  // Billing
  SUBSCRIPTION_CREATED = 'subscription.created',
  SUBSCRIPTION_UPDATED = 'subscription.updated',
  SUBSCRIPTION_CANCELLED = 'subscription.cancelled',
  PAYMENT_PROCESSED = 'payment.processed',
  PAYMENT_FAILED = 'payment.failed',
  
  // Settings
  SETTINGS_UPDATED = 'settings.updated',
  WEBHOOK_CREATED = 'webhook.created',
  WEBHOOK_DELETED = 'webhook.deleted',
  API_KEY_CREATED = 'api_key.created',
  API_KEY_REVOKED = 'api_key.revoked',
  
  // Security
  ACCESS_DENIED = 'security.access_denied',
  RATE_LIMIT_EXCEEDED = 'security.rate_limit_exceeded',
  SUSPICIOUS_ACTIVITY = 'security.suspicious_activity',
  
  // System
  EXPORT_REQUESTED = 'system.export_requested',
  EXPORT_COMPLETED = 'system.export_completed',
  IMPORT_REQUESTED = 'system.import_requested',
  IMPORT_COMPLETED = 'system.import_completed',
}

export interface AuditQuery {
  tenantId: string;
  userId?: string;
  action?: string;
  resource?: string;
  status?: 'success' | 'failure';
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);
  private readonly enabled: boolean;
  private readonly retentionDays: number;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.enabled = this.configService.get<boolean>('AUDIT_ENABLED', true);
    this.retentionDays = this.configService.get<number>('AUDIT_RETENTION_DAYS', 365);

    if (!this.enabled) {
      this.logger.warn('Audit logging is disabled');
    }
  }

  /**
   * Log an audit entry
   */
  async log(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<boolean> {
    if (!this.enabled) {
      return false;
    }

    try {
      const auditEntry: AuditLogEntry = {
        ...entry,
        timestamp: new Date(),
      };

      // In production, store in database:
      // await this.prisma.auditLog.create({
      //   data: {
      //     tenantId: auditEntry.tenantId,
      //     userId: auditEntry.userId,
      //     action: auditEntry.action,
      //     resource: auditEntry.resource,
      //     resourceId: auditEntry.resourceId,
      //     method: auditEntry.method,
      //     status: auditEntry.status,
      //     ipAddress: auditEntry.ipAddress,
      //     userAgent: auditEntry.userAgent,
      //     details: auditEntry.details,
      //     metadata: auditEntry.metadata,
      //   },
      // });

      // Also log to console in development
      if (this.configService.get('NODE_ENV') === 'development') {
        this.logger.log(
          `[AUDIT] ${auditEntry.action} - ${auditEntry.resource} - ${auditEntry.status}`,
        );
      }

      return true;
    } catch (error) {
      this.logger.error(`Failed to log audit entry: ${error.message}`);
      return false;
    }
  }

  /**
   * Query audit logs
   */
  async query(query: AuditQuery): Promise<{
    logs: AuditLogEntry[];
    total: number;
  }> {
    if (!this.enabled) {
      return { logs: [], total: 0 };
    }

    try {
      // In production, query from database:
      // const where: any = { tenantId: query.tenantId };
      //
      // if (query.userId) where.userId = query.userId;
      // if (query.action) where.action = query.action;
      // if (query.resource) where.resource = query.resource;
      // if (query.status) where.status = query.status;
      //
      // if (query.startDate || query.endDate) {
      //   where.timestamp = {};
      //   if (query.startDate) where.timestamp.gte = query.startDate;
      //   if (query.endDate) where.timestamp.lte = query.endDate;
      // }
      //
      // const [logs, total] = await Promise.all([
      //   this.prisma.auditLog.findMany({
      //     where,
      //     orderBy: { timestamp: 'desc' },
      //     skip: query.offset || 0,
      //     take: query.limit || 50,
      //   }),
      //   this.prisma.auditLog.count({ where }),
      // ]);

      return {
        logs: [],
        total: 0,
      };
    } catch (error) {
      this.logger.error(`Failed to query audit logs: ${error.message}`);
      return { logs: [], total: 0 };
    }
  }

  /**
   * Get audit logs for a specific resource
   */
  async getResourceHistory(
    tenantId: string,
    resource: string,
    resourceId: string,
    limit: number = 50,
  ): Promise<AuditLogEntry[]> {
    const result = await this.query({
      tenantId,
      resource,
      limit,
    });

    // Filter by resourceId (in production, add to database query)
    return result.logs.filter((log) => log.resourceId === resourceId);
  }

  /**
   * Get user activity
   */
  async getUserActivity(
    tenantId: string,
    userId: string,
    startDate?: Date,
    endDate?: Date,
    limit: number = 100,
  ): Promise<AuditLogEntry[]> {
    const result = await this.query({
      tenantId,
      userId,
      startDate,
      endDate,
      limit,
    });

    return result.logs;
  }

  /**
   * Get security events
   */
  async getSecurityEvents(
    tenantId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<AuditLogEntry[]> {
    const securityActions = [
      AuditAction.LOGIN_FAILED,
      AuditAction.ACCESS_DENIED,
      AuditAction.RATE_LIMIT_EXCEEDED,
      AuditAction.SUSPICIOUS_ACTIVITY,
    ];

    const result = await this.query({
      tenantId,
      startDate,
      endDate,
      limit: 1000,
    });

    // Filter by security actions (in production, optimize with database query)
    return result.logs.filter((log) => securityActions.includes(log.action as any));
  }

  /**
   * Get failed actions
   */
  async getFailedActions(
    tenantId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<AuditLogEntry[]> {
    const result = await this.query({
      tenantId,
      status: 'failure',
      startDate,
      endDate,
      limit: 500,
    });

    return result.logs;
  }

  /**
   * Export audit logs
   */
  async export(
    tenantId: string,
    startDate?: Date,
    endDate?: Date,
    format: 'json' | 'csv' = 'json',
  ): Promise<string> {
    const result = await this.query({
      tenantId,
      startDate,
      endDate,
      limit: 10000, // Maximum export limit
    });

    if (format === 'json') {
      return JSON.stringify(result.logs, null, 2);
    } else {
      // CSV format
      const headers = [
        'Timestamp',
        'User ID',
        'Action',
        'Resource',
        'Resource ID',
        'Status',
        'IP Address',
        'Details',
      ].join(',');

      const rows = result.logs.map((log) =>
        [
          log.timestamp.toISOString(),
          log.userId || '',
          log.action,
          log.resource,
          log.resourceId || '',
          log.status,
          log.ipAddress || '',
          JSON.stringify(log.details || {}),
        ]
          .map((val) => `"${val}"`)
          .join(','),
      );

      return [headers, ...rows].join('\n');
    }
  }

  /**
   * Clean old audit logs (based on retention policy)
   */
  async cleanOldLogs(): Promise<number> {
    if (!this.enabled) {
      return 0;
    }

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.retentionDays);

      // In production:
      // const result = await this.prisma.auditLog.deleteMany({
      //   where: {
      //     timestamp: {
      //       lt: cutoffDate,
      //     },
      //   },
      // });
      //
      // this.logger.log(`Cleaned ${result.count} old audit logs`);
      // return result.count;

      return 0;
    } catch (error) {
      this.logger.error(`Failed to clean old logs: ${error.message}`);
      return 0;
    }
  }

  /**
   * Get audit statistics
   */
  async getStatistics(
    tenantId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    totalLogs: number;
    successfulActions: number;
    failedActions: number;
    topActions: Array<{ action: string; count: number }>;
    topUsers: Array<{ userId: string; count: number }>;
    topResources: Array<{ resource: string; count: number }>;
  }> {
    const result = await this.query({
      tenantId,
      startDate,
      endDate,
      limit: 10000,
    });

    const logs = result.logs;

    // Calculate statistics
    const successfulActions = logs.filter((log) => log.status === 'success').length;
    const failedActions = logs.filter((log) => log.status === 'failure').length;

    // Top actions
    const actionCounts = new Map<string, number>();
    logs.forEach((log) => {
      actionCounts.set(log.action, (actionCounts.get(log.action) || 0) + 1);
    });
    const topActions = Array.from(actionCounts.entries())
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Top users
    const userCounts = new Map<string, number>();
    logs.forEach((log) => {
      if (log.userId) {
        userCounts.set(log.userId, (userCounts.get(log.userId) || 0) + 1);
      }
    });
    const topUsers = Array.from(userCounts.entries())
      .map(([userId, count]) => ({ userId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Top resources
    const resourceCounts = new Map<string, number>();
    logs.forEach((log) => {
      resourceCounts.set(log.resource, (resourceCounts.get(log.resource) || 0) + 1);
    });
    const topResources = Array.from(resourceCounts.entries())
      .map(([resource, count]) => ({ resource, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalLogs: logs.length,
      successfulActions,
      failedActions,
      topActions,
      topUsers,
      topResources,
    };
  }

  /**
   * Pre-built audit log helpers
   */

  async logLogin(
    tenantId: string,
    userId: string,
    success: boolean,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.log({
      tenantId,
      userId,
      action: success ? AuditAction.LOGIN : AuditAction.LOGIN_FAILED,
      resource: 'auth',
      status: success ? 'success' : 'failure',
      ipAddress,
      userAgent,
    });
  }

  async logDocumentAction(
    tenantId: string,
    userId: string,
    action: string,
    documentId: string,
    details?: any,
  ): Promise<void> {
    await this.log({
      tenantId,
      userId,
      action,
      resource: 'document',
      resourceId: documentId,
      status: 'success',
      details,
    });
  }

  async logPayment(
    tenantId: string,
    userId: string,
    success: boolean,
    amount: number,
    details?: any,
  ): Promise<void> {
    await this.log({
      tenantId,
      userId,
      action: success ? AuditAction.PAYMENT_PROCESSED : AuditAction.PAYMENT_FAILED,
      resource: 'billing',
      status: success ? 'success' : 'failure',
      details: {
        amount,
        ...details,
      },
    });
  }

  async logAccessDenied(
    tenantId: string,
    userId: string | undefined,
    resource: string,
    resourceId: string,
    reason: string,
    ipAddress?: string,
  ): Promise<void> {
    await this.log({
      tenantId,
      userId,
      action: AuditAction.ACCESS_DENIED,
      resource,
      resourceId,
      status: 'failure',
      ipAddress,
      details: { reason },
    });
  }

  async logRateLimitExceeded(
    tenantId: string,
    userId: string | undefined,
    endpoint: string,
    ipAddress?: string,
  ): Promise<void> {
    await this.log({
      tenantId,
      userId,
      action: AuditAction.RATE_LIMIT_EXCEEDED,
      resource: 'api',
      status: 'failure',
      ipAddress,
      details: { endpoint },
    });
  }
}

