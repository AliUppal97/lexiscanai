import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma.service';
import { CacheService } from './cache.service';

export interface AnalyticsEvent {
  tenantId: string;
  userId?: string;
  event: string;
  category: AnalyticsCategory;
  properties?: Record<string, any>;
  metadata?: Record<string, any>;
  timestamp?: Date;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export enum AnalyticsCategory {
  USER = 'user',
  DOCUMENT = 'document',
  BILLING = 'billing',
  API = 'api',
  FEATURE = 'feature',
  PERFORMANCE = 'performance',
  ERROR = 'error',
  SYSTEM = 'system',
}

export interface AnalyticsMetrics {
  totalEvents: number;
  uniqueUsers: number;
  eventsByCategory: Record<string, number>;
  topEvents: Array<{ event: string; count: number }>;
  avgSessionDuration?: number;
}

export interface TimeSeriesData {
  timestamp: Date;
  value: number;
}

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);
  private readonly enabled: boolean;
  private readonly realTimeEnabled: boolean;

  constructor(
    private prisma: PrismaService,
    private cacheService: CacheService,
    private configService: ConfigService,
  ) {
    this.enabled = this.configService.get<boolean>('ANALYTICS_ENABLED', true);
    this.realTimeEnabled = this.configService.get<boolean>(
      'ANALYTICS_REALTIME_ENABLED',
      true,
    );

    if (!this.enabled) {
      this.logger.warn('Analytics is disabled');
    }
  }

  /**
   * Track an event
   */
  async track(event: AnalyticsEvent): Promise<boolean> {
    if (!this.enabled) {
      return false;
    }

    try {
      const analyticsEvent = {
        ...event,
        timestamp: event.timestamp || new Date(),
      };

      // Store in database (in production)
      // await this.prisma.analyticsEvent.create({
      //   data: {
      //     tenantId: analyticsEvent.tenantId,
      //     userId: analyticsEvent.userId,
      //     event: analyticsEvent.event,
      //     category: analyticsEvent.category,
      //     properties: analyticsEvent.properties,
      //     metadata: analyticsEvent.metadata,
      //     sessionId: analyticsEvent.sessionId,
      //     ipAddress: analyticsEvent.ipAddress,
      //     userAgent: analyticsEvent.userAgent,
      //     timestamp: analyticsEvent.timestamp,
      //   },
      // });

      // Update real-time counters
      if (this.realTimeEnabled) {
        await this.updateRealTimeMetrics(analyticsEvent);
      }

      this.logger.debug(
        `Analytics event tracked: ${event.event} (${event.category})`,
      );

      return true;
    } catch (error) {
      this.logger.error(`Failed to track event: ${error.message}`);
      return false;
    }
  }

  /**
   * Track multiple events
   */
  async trackBatch(events: AnalyticsEvent[]): Promise<number> {
    let tracked = 0;

    for (const event of events) {
      const success = await this.track(event);
      if (success) tracked++;
    }

    return tracked;
  }

  /**
   * Get analytics metrics for a tenant
   */
  async getMetrics(
    tenantId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<AnalyticsMetrics> {
    if (!this.enabled) {
      return {
        totalEvents: 0,
        uniqueUsers: 0,
        eventsByCategory: {},
        topEvents: [],
      };
    }

    try {
      // In production, query from database:
      // const where: any = { tenantId };
      // if (startDate || endDate) {
      //   where.timestamp = {};
      //   if (startDate) where.timestamp.gte = startDate;
      //   if (endDate) where.timestamp.lte = endDate;
      // }
      //
      // const events = await this.prisma.analyticsEvent.findMany({ where });
      //
      // const totalEvents = events.length;
      // const uniqueUsers = new Set(events.map(e => e.userId).filter(Boolean)).size;
      //
      // // Group by category
      // const eventsByCategory = events.reduce((acc, event) => {
      //   acc[event.category] = (acc[event.category] || 0) + 1;
      //   return acc;
      // }, {} as Record<string, number>);
      //
      // // Top events
      // const eventCounts = events.reduce((acc, event) => {
      //   acc[event.event] = (acc[event.event] || 0) + 1;
      //   return acc;
      // }, {} as Record<string, number>);
      //
      // const topEvents = Object.entries(eventCounts)
      //   .map(([event, count]) => ({ event, count }))
      //   .sort((a, b) => b.count - a.count)
      //   .slice(0, 10);

      return {
        totalEvents: 0,
        uniqueUsers: 0,
        eventsByCategory: {},
        topEvents: [],
      };
    } catch (error) {
      this.logger.error(`Failed to get metrics: ${error.message}`);
      return {
        totalEvents: 0,
        uniqueUsers: 0,
        eventsByCategory: {},
        topEvents: [],
      };
    }
  }

  /**
   * Get time series data
   */
  async getTimeSeries(
    tenantId: string,
    event: string,
    startDate: Date,
    endDate: Date,
    interval: 'hour' | 'day' | 'week' | 'month' = 'day',
  ): Promise<TimeSeriesData[]> {
    if (!this.enabled) {
      return [];
    }

    try {
      // In production, implement time-series aggregation query
      // This would typically use database-specific features or
      // a time-series database like TimescaleDB, InfluxDB, etc.

      return [];
    } catch (error) {
      this.logger.error(`Failed to get time series: ${error.message}`);
      return [];
    }
  }

  /**
   * Get funnel analytics
   */
  async getFunnelAnalytics(
    tenantId: string,
    steps: string[],
    startDate?: Date,
    endDate?: Date,
  ): Promise<
    Array<{
      step: string;
      users: number;
      conversionRate: number;
    }>
  > {
    if (!this.enabled || steps.length === 0) {
      return [];
    }

    try {
      // In production, query database for funnel steps
      // Calculate conversion rates between steps

      return steps.map((step, index) => ({
        step,
        users: 0,
        conversionRate: index === 0 ? 100 : 0,
      }));
    } catch (error) {
      this.logger.error(`Failed to get funnel analytics: ${error.message}`);
      return [];
    }
  }

  /**
   * Get user cohort analytics
   */
  async getCohortAnalytics(
    tenantId: string,
    cohortDate: Date,
    retentionPeriods: number = 12, // months
  ): Promise<
    Array<{
      period: number;
      users: number;
      retentionRate: number;
    }>
  > {
    if (!this.enabled) {
      return [];
    }

    try {
      // In production, implement cohort retention analysis
      // Calculate user retention over time

      return Array.from({ length: retentionPeriods }, (_, i) => ({
        period: i,
        users: 0,
        retentionRate: 0,
      }));
    } catch (error) {
      this.logger.error(`Failed to get cohort analytics: ${error.message}`);
      return [];
    }
  }

  /**
   * Get user journey
   */
  async getUserJourney(
    tenantId: string,
    userId: string,
    sessionId?: string,
    limit: number = 100,
  ): Promise<AnalyticsEvent[]> {
    if (!this.enabled) {
      return [];
    }

    try {
      // In production, query user's events:
      // const where: any = { tenantId, userId };
      // if (sessionId) where.sessionId = sessionId;
      //
      // return await this.prisma.analyticsEvent.findMany({
      //   where,
      //   orderBy: { timestamp: 'asc' },
      //   take: limit,
      // });

      return [];
    } catch (error) {
      this.logger.error(`Failed to get user journey: ${error.message}`);
      return [];
    }
  }

  /**
   * Get feature usage
   */
  async getFeatureUsage(
    tenantId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<
    Array<{
      feature: string;
      users: number;
      totalUsage: number;
      avgUsagePerUser: number;
    }>
  > {
    if (!this.enabled) {
      return [];
    }

    try {
      // In production, aggregate feature usage from events

      return [];
    } catch (error) {
      this.logger.error(`Failed to get feature usage: ${error.message}`);
      return [];
    }
  }

  /**
   * Get API usage statistics
   */
  async getAPIUsage(
    tenantId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    totalRequests: number;
    successRate: number;
    avgResponseTime: number;
    topEndpoints: Array<{ endpoint: string; count: number }>;
    errorRate: number;
  }> {
    if (!this.enabled) {
      return {
        totalRequests: 0,
        successRate: 0,
        avgResponseTime: 0,
        topEndpoints: [],
        errorRate: 0,
      };
    }

    try {
      // In production, query API events and calculate statistics

      return {
        totalRequests: 0,
        successRate: 0,
        avgResponseTime: 0,
        topEndpoints: [],
        errorRate: 0,
      };
    } catch (error) {
      this.logger.error(`Failed to get API usage: ${error.message}`);
      return {
        totalRequests: 0,
        successRate: 0,
        avgResponseTime: 0,
        topEndpoints: [],
        errorRate: 0,
      };
    }
  }

  /**
   * Real-time metrics (cached)
   */

  private async updateRealTimeMetrics(event: AnalyticsEvent): Promise<void> {
    const cacheKey = `analytics:realtime:${event.tenantId}`;

    try {
      // Increment counters
      await this.cacheService.hSet(cacheKey, 'totalEvents', 1);
      await this.cacheService.hSet(
        cacheKey,
        `category:${event.category}`,
        1,
      );
      await this.cacheService.hSet(cacheKey, `event:${event.event}`, 1);

      if (event.userId) {
        await this.cacheService.sAdd(`${cacheKey}:users`, event.userId);
      }

      // Set expiration (5 minutes)
      await this.cacheService.expire(cacheKey, 300);
    } catch (error) {
      this.logger.error(`Failed to update real-time metrics: ${error.message}`);
    }
  }

  async getRealTimeMetrics(tenantId: string): Promise<{
    activeUsers: number;
    eventsLastMinute: number;
    topEvents: Record<string, number>;
  }> {
    if (!this.realTimeEnabled) {
      return {
        activeUsers: 0,
        eventsLastMinute: 0,
        topEvents: {},
      };
    }

    const cacheKey = `analytics:realtime:${tenantId}`;

    try {
      const [users, events] = await Promise.all([
        this.cacheService.sMembers(`${cacheKey}:users`),
        this.cacheService.hGetAll(cacheKey),
      ]);

      const topEvents: Record<string, number> = {};
      for (const [key, value] of Object.entries(events)) {
        if (key.startsWith('event:')) {
          const eventName = key.replace('event:', '');
          topEvents[eventName] = Number(value);
        }
      }

      return {
        activeUsers: users.length,
        eventsLastMinute: Number(events.totalEvents) || 0,
        topEvents,
      };
    } catch (error) {
      this.logger.error(`Failed to get real-time metrics: ${error.message}`);
      return {
        activeUsers: 0,
        eventsLastMinute: 0,
        topEvents: {},
      };
    }
  }

  /**
   * Pre-built analytics tracking methods
   */

  async trackDocumentUpload(
    tenantId: string,
    userId: string,
    documentId: string,
    fileSize: number,
    mimeType: string,
  ): Promise<void> {
    await this.track({
      tenantId,
      userId,
      event: 'document_uploaded',
      category: AnalyticsCategory.DOCUMENT,
      properties: {
        documentId,
        fileSize,
        mimeType,
      },
    });
  }

  async trackDocumentProcessing(
    tenantId: string,
    userId: string,
    documentId: string,
    duration: number,
    success: boolean,
  ): Promise<void> {
    await this.track({
      tenantId,
      userId,
      event: success ? 'document_processed' : 'document_processing_failed',
      category: AnalyticsCategory.DOCUMENT,
      properties: {
        documentId,
        duration,
        success,
      },
    });
  }

  async trackAPIRequest(
    tenantId: string,
    userId: string | undefined,
    endpoint: string,
    method: string,
    statusCode: number,
    responseTime: number,
  ): Promise<void> {
    await this.track({
      tenantId,
      userId,
      event: 'api_request',
      category: AnalyticsCategory.API,
      properties: {
        endpoint,
        method,
        statusCode,
        responseTime,
        success: statusCode >= 200 && statusCode < 400,
      },
    });
  }

  async trackFeatureUsage(
    tenantId: string,
    userId: string,
    feature: string,
    action: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    await this.track({
      tenantId,
      userId,
      event: `feature_${action}`,
      category: AnalyticsCategory.FEATURE,
      properties: {
        feature,
        action,
      },
      metadata,
    });
  }

  async trackError(
    tenantId: string,
    userId: string | undefined,
    error: string,
    context: string,
    stack?: string,
  ): Promise<void> {
    await this.track({
      tenantId,
      userId,
      event: 'error',
      category: AnalyticsCategory.ERROR,
      properties: {
        error,
        context,
        stack,
      },
    });
  }

  async trackPayment(
    tenantId: string,
    userId: string,
    amount: number,
    currency: string,
    status: string,
  ): Promise<void> {
    await this.track({
      tenantId,
      userId,
      event: 'payment_processed',
      category: AnalyticsCategory.BILLING,
      properties: {
        amount,
        currency,
        status,
      },
    });
  }

  async trackUserLogin(
    tenantId: string,
    userId: string,
    method: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.track({
      tenantId,
      userId,
      event: 'user_login',
      category: AnalyticsCategory.USER,
      properties: {
        method,
      },
      ipAddress,
      userAgent,
    });
  }

  async trackPerformance(
    tenantId: string,
    operation: string,
    duration: number,
    metadata?: Record<string, any>,
  ): Promise<void> {
    await this.track({
      tenantId,
      event: 'performance_metric',
      category: AnalyticsCategory.PERFORMANCE,
      properties: {
        operation,
        duration,
      },
      metadata,
    });
  }

  /**
   * Export analytics data
   */
  async exportData(
    tenantId: string,
    startDate: Date,
    endDate: Date,
    format: 'json' | 'csv' = 'json',
  ): Promise<string> {
    // In production, query all events and export

    const events: AnalyticsEvent[] = [];

    if (format === 'json') {
      return JSON.stringify(events, null, 2);
    } else {
      // CSV format
      const headers = [
        'Timestamp',
        'User ID',
        'Event',
        'Category',
        'Properties',
      ].join(',');

      const rows = events.map((event) =>
        [
          event.timestamp?.toISOString() || '',
          event.userId || '',
          event.event,
          event.category,
          JSON.stringify(event.properties || {}),
        ]
          .map((val) => `"${val}"`)
          .join(','),
      );

      return [headers, ...rows].join('\n');
    }
  }
}

