/**
 * Log Aggregator for LexiScan AI
 * 
 * Purpose:
 * - Aggregates logs from multiple services
 * - Provides real-time log analysis
 * - Enables log correlation and tracing
 * - Supports log-based alerting
 * 
 * Features:
 * - Real-time log streaming
 * - Log correlation by request ID
 * - Business event aggregation
 * - Performance metrics aggregation
 * - Security event correlation
 */

import { EventEmitter } from 'events';
import { createReadStream, createWriteStream } from 'fs';
import { Transform, PassThrough } from 'stream';
import { parse } from 'jsonstream';
import { createHash } from 'crypto';

/**
 * Log entry interface
 * Standardized log entry structure
 */
export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  service: string;
  requestId?: string;
  userId?: string;
  business?: {
    action?: string;
    feature?: string;
    outcome?: string;
  };
  performance?: {
    duration?: number;
    memoryUsage?: number;
    responseTime?: number;
  };
  security?: {
    ip?: string;
    riskScore?: number;
    threatLevel?: string;
  };
  metadata?: Record<string, any>;
}

/**
 * Aggregation window interface
 * Defines time windows for log aggregation
 */
export interface AggregationWindow {
  start: Date;
  end: Date;
  duration: number; // in milliseconds
}

/**
 * Aggregated metrics interface
 * Structure for aggregated log metrics
 */
export interface AggregatedMetrics {
  totalLogs: number;
  errorRate: number;
  averageResponseTime: number;
  uniqueUsers: number;
  uniqueServices: number;
  businessEvents: number;
  securityEvents: number;
  performanceEvents: number;
}

/**
 * Log correlation interface
 * Structure for correlating related log entries
 */
export interface LogCorrelation {
  requestId: string;
  userId?: string;
  sessionId?: string;
  startTime: Date;
  endTime?: Date;
  logs: LogEntry[];
  metrics: {
    totalLogs: number;
    errorCount: number;
    duration: number;
    services: string[];
  };
}

/**
 * Log Aggregator class
 * Main class for log aggregation and analysis
 */
export class LogAggregator extends EventEmitter {
  private logStreams: Map<string, PassThrough> = new Map();
  private correlations: Map<string, LogCorrelation> = new Map();
  private metrics: AggregatedMetrics = {
    totalLogs: 0,
    errorRate: 0,
    averageResponseTime: 0,
    uniqueUsers: 0,
    uniqueServices: 0,
    businessEvents: 0,
    securityEvents: 0,
    performanceEvents: 0
  };
  private windowSize: number = 5 * 60 * 1000; // 5 minutes in milliseconds
  private cleanupInterval: NodeJS.Timeout;

  constructor(windowSize: number = 5 * 60 * 1000) {
    super();
    this.windowSize = windowSize;
    this.startCleanup();
  }

  /**
   * Add log stream from a service
   * Connects a service's log stream to the aggregator
   */
  addLogStream(serviceName: string, stream: PassThrough): void {
    this.logStreams.set(serviceName, stream);
    
    stream.on('data', (chunk: Buffer) => {
      try {
        const logEntry: LogEntry = JSON.parse(chunk.toString());
        this.processLogEntry(logEntry);
      } catch (error) {
        console.error('Error parsing log entry:', error);
      }
    });
    
    stream.on('error', (error) => {
      console.error(`Error in log stream for ${serviceName}:`, error);
    });
  }

  /**
   * Process individual log entry
   * Analyzes and correlates log entries
   */
  private processLogEntry(logEntry: LogEntry): void {
    // Update metrics
    this.updateMetrics(logEntry);
    
    // Correlate logs by request ID
    if (logEntry.requestId) {
      this.correlateLogEntry(logEntry);
    }
    
    // Emit events for real-time processing
    this.emit('logEntry', logEntry);
    
    // Emit specific event types
    if (logEntry.business) {
      this.emit('businessEvent', logEntry);
    }
    
    if (logEntry.security) {
      this.emit('securityEvent', logEntry);
    }
    
    if (logEntry.performance) {
      this.emit('performanceEvent', logEntry);
    }
    
    if (logEntry.level === 'error') {
      this.emit('errorEvent', logEntry);
    }
  }

  /**
   * Update aggregated metrics
   * Maintains real-time metrics from log entries
   */
  private updateMetrics(logEntry: LogEntry): void {
    this.metrics.totalLogs++;
    
    // Update error rate
    if (logEntry.level === 'error' || logEntry.level === 'warn') {
      this.metrics.errorRate = (this.metrics.errorRate + 1) / this.metrics.totalLogs;
    }
    
    // Update average response time
    if (logEntry.performance?.responseTime) {
      this.metrics.averageResponseTime = 
        (this.metrics.averageResponseTime + logEntry.performance.responseTime) / 2;
    }
    
    // Update unique users
    if (logEntry.userId) {
      // This would need to be tracked in a Set in a real implementation
      this.metrics.uniqueUsers++;
    }
    
    // Update unique services
    if (!this.logStreams.has(logEntry.service)) {
      this.metrics.uniqueServices++;
    }
    
    // Update event counts
    if (logEntry.business) {
      this.metrics.businessEvents++;
    }
    
    if (logEntry.security) {
      this.metrics.securityEvents++;
    }
    
    if (logEntry.performance) {
      this.metrics.performanceEvents++;
    }
  }

  /**
   * Correlate log entries by request ID
   * Groups related log entries for analysis
   */
  private correlateLogEntry(logEntry: LogEntry): void {
    const requestId = logEntry.requestId!;
    
    if (!this.correlations.has(requestId)) {
      this.correlations.set(requestId, {
        requestId,
        userId: logEntry.userId,
        startTime: new Date(logEntry.timestamp),
        logs: [],
        metrics: {
          totalLogs: 0,
          errorCount: 0,
          duration: 0,
          services: []
        }
      });
    }
    
    const correlation = this.correlations.get(requestId)!;
    correlation.logs.push(logEntry);
    correlation.metrics.totalLogs++;
    
    if (logEntry.level === 'error') {
      correlation.metrics.errorCount++;
    }
    
    if (!correlation.metrics.services.includes(logEntry.service)) {
      correlation.metrics.services.push(logEntry.service);
    }
    
    // Update duration
    const startTime = new Date(correlation.startTime);
    const currentTime = new Date(logEntry.timestamp);
    correlation.metrics.duration = currentTime.getTime() - startTime.getTime();
    
    // Emit correlation events
    this.emit('logCorrelation', correlation);
  }

  /**
   * Get aggregated metrics
   * Returns current aggregated metrics
   */
  getMetrics(): AggregatedMetrics {
    return { ...this.metrics };
  }

  /**
   * Get log correlations
   * Returns all current log correlations
   */
  getCorrelations(): LogCorrelation[] {
    return Array.from(this.correlations.values());
  }

  /**
   * Get correlation by request ID
   * Returns specific log correlation
   */
  getCorrelation(requestId: string): LogCorrelation | undefined {
    return this.correlations.get(requestId);
  }

  /**
   * Get logs by time window
   * Returns logs within specified time window
   */
  getLogsByTimeWindow(start: Date, end: Date): LogEntry[] {
    const logs: LogEntry[] = [];
    
    for (const correlation of this.correlations.values()) {
      for (const log of correlation.logs) {
        const logTime = new Date(log.timestamp);
        if (logTime >= start && logTime <= end) {
          logs.push(log);
        }
      }
    }
    
    return logs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  /**
   * Get logs by service
   * Returns logs from specific service
   */
  getLogsByService(serviceName: string): LogEntry[] {
    const logs: LogEntry[] = [];
    
    for (const correlation of this.correlations.values()) {
      for (const log of correlation.logs) {
        if (log.service === serviceName) {
          logs.push(log);
        }
      }
    }
    
    return logs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  /**
   * Get logs by user
   * Returns logs for specific user
   */
  getLogsByUser(userId: string): LogEntry[] {
    const logs: LogEntry[] = [];
    
    for (const correlation of this.correlations.values()) {
      if (correlation.userId === userId) {
        logs.push(...correlation.logs);
      }
    }
    
    return logs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  /**
   * Get business events
   * Returns all business-related log entries
   */
  getBusinessEvents(): LogEntry[] {
    const logs: LogEntry[] = [];
    
    for (const correlation of this.correlations.values()) {
      for (const log of correlation.logs) {
        if (log.business) {
          logs.push(log);
        }
      }
    }
    
    return logs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  /**
   * Get security events
   * Returns all security-related log entries
   */
  getSecurityEvents(): LogEntry[] {
    const logs: LogEntry[] = [];
    
    for (const correlation of this.correlations.values()) {
      for (const log of correlation.logs) {
        if (log.security) {
          logs.push(log);
        }
      }
    }
    
    return logs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  /**
   * Get performance events
   * Returns all performance-related log entries
   */
  getPerformanceEvents(): LogEntry[] {
    const logs: LogEntry[] = [];
    
    for (const correlation of this.correlations.values()) {
      for (const log of correlation.logs) {
        if (log.performance) {
          logs.push(log);
        }
      }
    }
    
    return logs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  /**
   * Get error events
   * Returns all error log entries
   */
  getErrorEvents(): LogEntry[] {
    const logs: LogEntry[] = [];
    
    for (const correlation of this.correlations.values()) {
      for (const log of correlation.logs) {
        if (log.level === 'error') {
          logs.push(log);
        }
      }
    }
    
    return logs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  /**
   * Start cleanup process
   * Removes old correlations to prevent memory leaks
   */
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      const now = new Date();
      const cutoffTime = new Date(now.getTime() - this.windowSize);
      
      for (const [requestId, correlation] of this.correlations.entries()) {
        if (new Date(correlation.startTime) < cutoffTime) {
          this.correlations.delete(requestId);
        }
      }
    }, this.windowSize);
  }

  /**
   * Stop cleanup process
   * Cleans up the aggregator
   */
  stop(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    
    for (const stream of this.logStreams.values()) {
      stream.destroy();
    }
    
    this.logStreams.clear();
    this.correlations.clear();
  }
}

/**
 * Log correlation analyzer
 * Analyzes log correlations for patterns and anomalies
 */
export class LogCorrelationAnalyzer {
  private aggregator: LogAggregator;

  constructor(aggregator: LogAggregator) {
    this.aggregator = aggregator;
  }

  /**
   * Analyze error patterns
   * Identifies patterns in error logs
   */
  analyzeErrorPatterns(): {
    commonErrors: Array<{ error: string; count: number }>;
    errorRateByService: Record<string, number>;
    errorRateByUser: Record<string, number>;
  } {
    const errorLogs = this.aggregator.getErrorEvents();
    const errorCounts: Record<string, number> = {};
    const serviceErrorCounts: Record<string, number> = {};
    const userErrorCounts: Record<string, number> = {};
    
    for (const log of errorLogs) {
      // Count common errors
      const errorKey = `${log.service}:${log.message}`;
      errorCounts[errorKey] = (errorCounts[errorKey] || 0) + 1;
      
      // Count errors by service
      serviceErrorCounts[log.service] = (serviceErrorCounts[log.service] || 0) + 1;
      
      // Count errors by user
      if (log.userId) {
        userErrorCounts[log.userId] = (userErrorCounts[log.userId] || 0) + 1;
      }
    }
    
    return {
      commonErrors: Object.entries(errorCounts)
        .map(([error, count]) => ({ error, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      errorRateByService: serviceErrorCounts,
      errorRateByUser: userErrorCounts
    };
  }

  /**
   * Analyze performance patterns
   * Identifies performance issues and patterns
   */
  analyzePerformancePatterns(): {
    slowServices: Array<{ service: string; averageResponseTime: number }>;
    memoryLeaks: Array<{ service: string; memoryTrend: number[] }>;
    cpuSpikes: Array<{ service: string; cpuUsage: number[] }>;
  } {
    const performanceLogs = this.aggregator.getPerformanceEvents();
    const serviceMetrics: Record<string, { responseTimes: number[]; memoryUsage: number[]; cpuUsage: number[] }> = {};
    
    for (const log of performanceLogs) {
      if (!serviceMetrics[log.service]) {
        serviceMetrics[log.service] = { responseTimes: [], memoryUsage: [], cpuUsage: [] };
      }
      
      if (log.performance?.responseTime) {
        serviceMetrics[log.service].responseTimes.push(log.performance.responseTime);
      }
      
      if (log.performance?.memoryUsage) {
        serviceMetrics[log.service].memoryUsage.push(log.performance.memoryUsage);
      }
    }
    
    const slowServices = Object.entries(serviceMetrics)
      .map(([service, metrics]) => ({
        service,
        averageResponseTime: metrics.responseTimes.reduce((a, b) => a + b, 0) / metrics.responseTimes.length
      }))
      .sort((a, b) => b.averageResponseTime - a.averageResponseTime);
    
    return {
      slowServices,
      memoryLeaks: [], // Would need more sophisticated analysis
      cpuSpikes: [] // Would need more sophisticated analysis
    };
  }

  /**
   * Analyze business patterns
   * Identifies business usage patterns
   */
  analyzeBusinessPatterns(): {
    popularFeatures: Array<{ feature: string; usage: number }>;
    userActivity: Record<string, number>;
    businessEvents: Array<{ event: string; count: number }>;
  } {
    const businessLogs = this.aggregator.getBusinessEvents();
    const featureUsage: Record<string, number> = {};
    const userActivity: Record<string, number> = {};
    const businessEventCounts: Record<string, number> = {};
    
    for (const log of businessLogs) {
      // Count feature usage
      if (log.business?.feature) {
        featureUsage[log.business.feature] = (featureUsage[log.business.feature] || 0) + 1;
      }
      
      // Count user activity
      if (log.userId) {
        userActivity[log.userId] = (userActivity[log.userId] || 0) + 1;
      }
      
      // Count business events
      if (log.business?.action) {
        businessEventCounts[log.business.action] = (businessEventCounts[log.business.action] || 0) + 1;
      }
    }
    
    return {
      popularFeatures: Object.entries(featureUsage)
        .map(([feature, usage]) => ({ feature, usage }))
        .sort((a, b) => b.usage - a.usage),
      userActivity,
      businessEvents: Object.entries(businessEventCounts)
        .map(([event, count]) => ({ event, count }))
        .sort((a, b) => b.count - a.count)
    };
  }
}

export default LogAggregator;
