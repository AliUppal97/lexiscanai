import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CacheService } from '../../services/cache.service';
import { AnalyticsService } from '../../services/analytics.service';

/**
 * Usage Tracking Service
 * 
 * Provides comprehensive usage tracking capabilities for the LexiScan AI platform.
 * Tracks user interactions, feature usage, API calls, and system performance metrics.
 * 
 * Key Features:
 * - Real-time usage tracking
 * - Feature adoption analytics
 * - User behavior analysis
 * - Performance metrics collection
 * - Usage pattern identification
 * - Resource consumption tracking
 * 
 * @author LexiScan AI Team
 * @version 1.0.0
 * @since 2024-01-01
 */
@Injectable()
export class UsageTrackingService {
  private readonly logger = new Logger(UsageTrackingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
    private readonly analytics: AnalyticsService,
  ) {}

  /**
   * Track user session activity
   * 
   * @param tenantId - Tenant identifier
   * @param userId - User identifier
   * @param sessionData - Session information
   * @returns Promise<void>
   */
  async trackUserSession(
    tenantId: string,
    userId: string,
    sessionData: {
      sessionId: string;
      startTime: Date;
      endTime?: Date;
      duration?: number;
      pageViews: number;
      actions: number;
      deviceInfo: {
        userAgent: string;
        platform: string;
        browser: string;
        version: string;
      };
      location?: {
        country: string;
        region: string;
        city: string;
        timezone: string;
      };
    },
  ): Promise<void> {
    try {
      // Store session data in database
      await this.prisma.userSession.create({
        data: {
          tenantId,
          userId,
          sessionId: sessionData.sessionId,
          startTime: sessionData.startTime,
          endTime: sessionData.endTime,
          duration: sessionData.duration,
          pageViews: sessionData.pageViews,
          actions: sessionData.actions,
          deviceInfo: sessionData.deviceInfo,
          location: sessionData.location,
        },
      });

      // Track session analytics
      await this.analytics.track({
        tenantId,
        userId,
        event: 'session_activity',
        category: 'user_behavior',
        properties: {
          sessionId: sessionData.sessionId,
          duration: sessionData.duration,
          pageViews: sessionData.pageViews,
          actions: sessionData.actions,
          platform: sessionData.deviceInfo.platform,
          browser: sessionData.deviceInfo.browser,
        },
      });

      // Update real-time metrics
      await this.updateRealTimeMetrics(tenantId, 'session_activity');

      this.logger.log(`Session tracked for user ${userId} in tenant ${tenantId}`);
    } catch (error) {
      this.logger.error(`Failed to track user session: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Track feature usage
   * 
   * @param tenantId - Tenant identifier
   * @param userId - User identifier
   * @param featureData - Feature usage information
   * @returns Promise<void>
   */
  async trackFeatureUsage(
    tenantId: string,
    userId: string,
    featureData: {
      feature: string;
      action: string;
      context?: Record<string, any>;
      duration?: number;
      success: boolean;
      errorMessage?: string;
    },
  ): Promise<void> {
    try {
      // Store feature usage data
      await this.prisma.featureUsage.create({
        data: {
          tenantId,
          userId,
          feature: featureData.feature,
          action: featureData.action,
          context: featureData.context,
          duration: featureData.duration,
          success: featureData.success,
          errorMessage: featureData.errorMessage,
          timestamp: new Date(),
        },
      });

      // Track feature analytics
      await this.analytics.track({
        tenantId,
        userId,
        event: 'feature_usage',
        category: 'feature_adoption',
        properties: {
          feature: featureData.feature,
          action: featureData.action,
          duration: featureData.duration,
          success: featureData.success,
        },
      });

      // Update feature adoption metrics
      await this.updateFeatureAdoptionMetrics(tenantId, featureData.feature);

      this.logger.log(`Feature usage tracked: ${featureData.feature} by user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to track feature usage: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Track API usage
   * 
   * @param tenantId - Tenant identifier
   * @param userId - User identifier
   * @param apiData - API usage information
   * @returns Promise<void>
   */
  async trackAPIUsage(
    tenantId: string,
    userId: string,
    apiData: {
      endpoint: string;
      method: string;
      statusCode: number;
      responseTime: number;
      requestSize: number;
      responseSize: number;
      userAgent?: string;
      ipAddress?: string;
    },
  ): Promise<void> {
    try {
      // Store API usage data
      await this.prisma.apiUsage.create({
        data: {
          tenantId,
          userId,
          endpoint: apiData.endpoint,
          method: apiData.method,
          statusCode: apiData.statusCode,
          responseTime: apiData.responseTime,
          requestSize: apiData.requestSize,
          responseSize: apiData.responseSize,
          userAgent: apiData.userAgent,
          ipAddress: apiData.ipAddress,
          timestamp: new Date(),
        },
      });

      // Track API analytics
      await this.analytics.track({
        tenantId,
        userId,
        event: 'api_usage',
        category: 'api_performance',
        properties: {
          endpoint: apiData.endpoint,
          method: apiData.method,
          statusCode: apiData.statusCode,
          responseTime: apiData.responseTime,
          requestSize: apiData.requestSize,
          responseSize: apiData.responseSize,
        },
      });

      // Update API performance metrics
      await this.updateAPIPerformanceMetrics(tenantId, apiData);

      this.logger.log(`API usage tracked: ${apiData.method} ${apiData.endpoint} by user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to track API usage: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Track document processing usage
   * 
   * @param tenantId - Tenant identifier
   * @param userId - User identifier
   * @param documentData - Document processing information
   * @returns Promise<void>
   */
  async trackDocumentProcessing(
    tenantId: string,
    userId: string,
    documentData: {
      documentId: string;
      documentType: string;
      fileSize: number;
      processingTime: number;
      aiProcessingTime: number;
      success: boolean;
      errorMessage?: string;
      features: string[];
    },
  ): Promise<void> {
    try {
      // Store document processing data
      await this.prisma.documentProcessing.create({
        data: {
          tenantId,
          userId,
          documentId: documentData.documentId,
          documentType: documentData.documentType,
          fileSize: documentData.fileSize,
          processingTime: documentData.processingTime,
          aiProcessingTime: documentData.aiProcessingTime,
          success: documentData.success,
          errorMessage: documentData.errorMessage,
          features: documentData.features,
          timestamp: new Date(),
        },
      });

      // Track document analytics
      await this.analytics.track({
        tenantId,
        userId,
        event: 'document_processing',
        category: 'document_analytics',
        properties: {
          documentId: documentData.documentId,
          documentType: documentData.documentType,
          fileSize: documentData.fileSize,
          processingTime: documentData.processingTime,
          aiProcessingTime: documentData.aiProcessingTime,
          success: documentData.success,
          features: documentData.features,
        },
      });

      // Update document processing metrics
      await this.updateDocumentProcessingMetrics(tenantId, documentData);

      this.logger.log(`Document processing tracked: ${documentData.documentId} by user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to track document processing: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get usage statistics for a tenant
   * 
   * @param tenantId - Tenant identifier
   * @param startDate - Start date for statistics
   * @param endDate - End date for statistics
   * @returns Promise<UsageStatistics>
   */
  async getUsageStatistics(
    tenantId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{
    totalSessions: number;
    totalUsers: number;
    totalAPIRequests: number;
    totalDocuments: number;
    averageSessionDuration: number;
    featureAdoption: Array<{
      feature: string;
      users: number;
      usage: number;
      adoptionRate: number;
    }>;
    apiPerformance: {
      averageResponseTime: number;
      successRate: number;
      errorRate: number;
      topEndpoints: Array<{
        endpoint: string;
        requests: number;
        averageResponseTime: number;
      }>;
    };
    documentProcessing: {
      totalProcessed: number;
      successRate: number;
      averageProcessingTime: number;
      documentTypes: Array<{
        type: string;
        count: number;
        averageProcessingTime: number;
      }>;
    };
  }> {
    try {
      // Get session statistics
      const sessions = await this.prisma.userSession.findMany({
        where: {
          tenantId,
          startTime: { gte: startDate, lte: endDate },
        },
      });

      // Get user statistics
      const users = await this.prisma.userSession.findMany({
        where: {
          tenantId,
          startTime: { gte: startDate, lte: endDate },
        },
        distinct: ['userId'],
      });

      // Get API usage statistics
      const apiUsage = await this.prisma.apiUsage.findMany({
        where: {
          tenantId,
          timestamp: { gte: startDate, lte: endDate },
        },
      });

      // Get document processing statistics
      const documentProcessing = await this.prisma.documentProcessing.findMany({
        where: {
          tenantId,
          timestamp: { gte: startDate, lte: endDate },
        },
      });

      // Get feature usage statistics
      const featureUsage = await this.prisma.featureUsage.findMany({
        where: {
          tenantId,
          timestamp: { gte: startDate, lte: endDate },
        },
      });

      // Calculate statistics
      const totalSessions = sessions.length;
      const totalUsers = users.length;
      const totalAPIRequests = apiUsage.length;
      const totalDocuments = documentProcessing.length;
      const averageSessionDuration = sessions.reduce((sum, session) => sum + (session.duration || 0), 0) / totalSessions;

      // Calculate feature adoption
      const featureAdoption = this.calculateFeatureAdoption(featureUsage);

      // Calculate API performance
      const apiPerformance = this.calculateAPIPerformance(apiUsage);

      // Calculate document processing metrics
      const documentProcessingMetrics = this.calculateDocumentProcessingMetrics(documentProcessing);

      return {
        totalSessions,
        totalUsers,
        totalAPIRequests,
        totalDocuments,
        averageSessionDuration,
        featureAdoption,
        apiPerformance,
        documentProcessing: documentProcessingMetrics,
      };
    } catch (error) {
      this.logger.error(`Failed to get usage statistics: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get real-time usage metrics
   * 
   * @param tenantId - Tenant identifier
   * @returns Promise<RealTimeMetrics>
   */
  async getRealTimeMetrics(tenantId: string): Promise<{
    activeUsers: number;
    currentSessions: number;
    apiRequestsPerMinute: number;
    documentsProcessing: number;
    systemLoad: {
      cpu: number;
      memory: number;
      disk: number;
    };
  }> {
    try {
      const cacheKey = `realtime_metrics:${tenantId}`;
      const cached = await this.cache.get(cacheKey);
      
      if (cached) {
        return JSON.parse(cached);
      }

      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      // Get active users (users with activity in the last hour)
      const activeUsers = await this.prisma.userSession.count({
        where: {
          tenantId,
          startTime: { gte: oneHourAgo },
        },
        distinct: ['userId'],
      });

      // Get current sessions
      const currentSessions = await this.prisma.userSession.count({
        where: {
          tenantId,
          startTime: { gte: oneHourAgo },
          endTime: null,
        },
      });

      // Get API requests per minute
      const apiRequestsPerMinute = await this.prisma.apiUsage.count({
        where: {
          tenantId,
          timestamp: { gte: new Date(now.getTime() - 60 * 1000) },
        },
      });

      // Get documents currently processing
      const documentsProcessing = await this.prisma.documentProcessing.count({
        where: {
          tenantId,
          timestamp: { gte: oneHourAgo },
          success: null,
        },
      });

      const metrics = {
        activeUsers,
        currentSessions,
        apiRequestsPerMinute,
        documentsProcessing,
        systemLoad: {
          cpu: Math.random() * 100, // TODO: Implement actual system monitoring
          memory: Math.random() * 100,
          disk: Math.random() * 100,
        },
      };

      // Cache for 1 minute
      await this.cache.set(cacheKey, JSON.stringify(metrics), 60);

      return metrics;
    } catch (error) {
      this.logger.error(`Failed to get real-time metrics: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Update real-time metrics cache
   * 
   * @param tenantId - Tenant identifier
   * @param eventType - Type of event
   * @returns Promise<void>
   */
  private async updateRealTimeMetrics(tenantId: string, eventType: string): Promise<void> {
    try {
      const cacheKey = `realtime_metrics:${tenantId}`;
      await this.cache.del(cacheKey);
      
      // Trigger real-time metrics update
      await this.getRealTimeMetrics(tenantId);
    } catch (error) {
      this.logger.error(`Failed to update real-time metrics: ${error.message}`, error.stack);
    }
  }

  /**
   * Update feature adoption metrics
   * 
   * @param tenantId - Tenant identifier
   * @param feature - Feature name
   * @returns Promise<void>
   */
  private async updateFeatureAdoptionMetrics(tenantId: string, feature: string): Promise<void> {
    try {
      const cacheKey = `feature_adoption:${tenantId}:${feature}`;
      await this.cache.del(cacheKey);
    } catch (error) {
      this.logger.error(`Failed to update feature adoption metrics: ${error.message}`, error.stack);
    }
  }

  /**
   * Update API performance metrics
   * 
   * @param tenantId - Tenant identifier
   * @param apiData - API usage data
   * @returns Promise<void>
   */
  private async updateAPIPerformanceMetrics(tenantId: string, apiData: any): Promise<void> {
    try {
      const cacheKey = `api_performance:${tenantId}`;
      await this.cache.del(cacheKey);
    } catch (error) {
      this.logger.error(`Failed to update API performance metrics: ${error.message}`, error.stack);
    }
  }

  /**
   * Update document processing metrics
   * 
   * @param tenantId - Tenant identifier
   * @param documentData - Document processing data
   * @returns Promise<void>
   */
  private async updateDocumentProcessingMetrics(tenantId: string, documentData: any): Promise<void> {
    try {
      const cacheKey = `document_processing:${tenantId}`;
      await this.cache.del(cacheKey);
    } catch (error) {
      this.logger.error(`Failed to update document processing metrics: ${error.message}`, error.stack);
    }
  }

  /**
   * Calculate feature adoption metrics
   * 
   * @param featureUsage - Feature usage data
   * @returns Feature adoption metrics
   */
  private calculateFeatureAdoption(featureUsage: any[]): Array<{
    feature: string;
    users: number;
    usage: number;
    adoptionRate: number;
  }> {
    const featureMap = new Map<string, { users: Set<string>; usage: number }>();

    featureUsage.forEach(usage => {
      if (!featureMap.has(usage.feature)) {
        featureMap.set(usage.feature, { users: new Set(), usage: 0 });
      }
      
      const feature = featureMap.get(usage.feature);
      feature.users.add(usage.userId);
      feature.usage += 1;
    });

    return Array.from(featureMap.entries()).map(([feature, data]) => ({
      feature,
      users: data.users.size,
      usage: data.usage,
      adoptionRate: data.users.size / featureUsage.length * 100,
    }));
  }

  /**
   * Calculate API performance metrics
   * 
   * @param apiUsage - API usage data
   * @returns API performance metrics
   */
  private calculateAPIPerformance(apiUsage: any[]): {
    averageResponseTime: number;
    successRate: number;
    errorRate: number;
    topEndpoints: Array<{
      endpoint: string;
      requests: number;
      averageResponseTime: number;
    }>;
  } {
    const totalRequests = apiUsage.length;
    const successfulRequests = apiUsage.filter(usage => usage.statusCode < 400).length;
    const averageResponseTime = apiUsage.reduce((sum, usage) => sum + usage.responseTime, 0) / totalRequests;
    const successRate = (successfulRequests / totalRequests) * 100;
    const errorRate = 100 - successRate;

    // Calculate top endpoints
    const endpointMap = new Map<string, { requests: number; totalResponseTime: number }>();
    
    apiUsage.forEach(usage => {
      if (!endpointMap.has(usage.endpoint)) {
        endpointMap.set(usage.endpoint, { requests: 0, totalResponseTime: 0 });
      }
      
      const endpoint = endpointMap.get(usage.endpoint);
      endpoint.requests += 1;
      endpoint.totalResponseTime += usage.responseTime;
    });

    const topEndpoints = Array.from(endpointMap.entries())
      .map(([endpoint, data]) => ({
        endpoint,
        requests: data.requests,
        averageResponseTime: data.totalResponseTime / data.requests,
      }))
      .sort((a, b) => b.requests - a.requests)
      .slice(0, 10);

    return {
      averageResponseTime,
      successRate,
      errorRate,
      topEndpoints,
    };
  }

  /**
   * Calculate document processing metrics
   * 
   * @param documentProcessing - Document processing data
   * @returns Document processing metrics
   */
  private calculateDocumentProcessingMetrics(documentProcessing: any[]): {
    totalProcessed: number;
    successRate: number;
    averageProcessingTime: number;
    documentTypes: Array<{
      type: string;
      count: number;
      averageProcessingTime: number;
    }>;
  } {
    const totalProcessed = documentProcessing.length;
    const successfulProcessing = documentProcessing.filter(doc => doc.success).length;
    const successRate = (successfulProcessing / totalProcessed) * 100;
    const averageProcessingTime = documentProcessing.reduce((sum, doc) => sum + doc.processingTime, 0) / totalProcessed;

    // Calculate document types
    const typeMap = new Map<string, { count: number; totalProcessingTime: number }>();
    
    documentProcessing.forEach(doc => {
      if (!typeMap.has(doc.documentType)) {
        typeMap.set(doc.documentType, { count: 0, totalProcessingTime: 0 });
      }
      
      const type = typeMap.get(doc.documentType);
      type.count += 1;
      type.totalProcessingTime += doc.processingTime;
    });

    const documentTypes = Array.from(typeMap.entries())
      .map(([type, data]) => ({
        type,
        count: data.count,
        averageProcessingTime: data.totalProcessingTime / data.count,
      }))
      .sort((a, b) => b.count - a.count);

    return {
      totalProcessed,
      successRate,
      averageProcessingTime,
      documentTypes,
    };
  }
}
