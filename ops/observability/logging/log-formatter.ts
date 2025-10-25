/**
 * Log Formatter for LexiScan AI
 * 
 * Purpose:
 * - Standardizes log format across all services
 * - Adds business context to logs
 * - Formats logs for different outputs
 * - Ensures compliance and security
 * 
 * Features:
 * - Structured JSON formatting
 * - Business context enrichment
 * - Security data filtering
 * - Performance metrics
 * - Compliance formatting
 */

import { format } from 'winston';
import { Transform } from 'stream';

/**
 * Business context interface
 * Defines the structure of business context in logs
 */
export interface BusinessContext {
  userId?: string;
  organizationId?: string;
  requestId?: string;
  sessionId?: string;
  documentId?: string;
  subscriptionId?: string;
  feature?: string;
  action?: string;
  outcome?: string;
}

/**
 * Performance metrics interface
 * Defines performance data structure
 */
export interface PerformanceMetrics {
  duration?: number;
  memoryUsage?: NodeJS.MemoryUsage;
  cpuUsage?: NodeJS.CpuUsage;
  responseTime?: number;
  throughput?: number;
  errorRate?: number;
}

/**
 * Security context interface
 * Defines security-related log data
 */
export interface SecurityContext {
  ip?: string;
  userAgent?: string;
  country?: string;
  riskScore?: number;
  threatLevel?: 'low' | 'medium' | 'high' | 'critical';
  securityEvent?: string;
}

/**
 * LexiScan log entry interface
 * Complete log entry structure
 */
export interface LexiScanLogEntry {
  timestamp: string;
  level: string;
  message: string;
  service: string;
  environment: string;
  version: string;
  business?: BusinessContext;
  performance?: PerformanceMetrics;
  security?: SecurityContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
  };
  metadata?: Record<string, any>;
}

/**
 * Business context formatter
 * Adds business context to log entries
 */
export const businessContextFormatter = format((info) => {
  // Add business context if not present
  if (!info.business) {
    info.business = {};
  }
  
  // Extract business context from metadata
  const businessFields = [
    'userId', 'organizationId', 'requestId', 'sessionId', 
    'documentId', 'subscriptionId', 'feature', 'action', 'outcome'
  ];
  
  businessFields.forEach(field => {
    if (info[field] && !info.business[field]) {
      info.business[field] = info[field];
      delete info[field];
    }
  });
  
  return info;
});

/**
 * Performance metrics formatter
 * Adds performance data to log entries
 */
export const performanceFormatter = format((info) => {
  // Add performance context if not present
  if (!info.performance) {
    info.performance = {};
  }
  
  // Extract performance metrics from metadata
  const performanceFields = [
    'duration', 'memoryUsage', 'cpuUsage', 'responseTime', 
    'throughput', 'errorRate'
  ];
  
  performanceFields.forEach(field => {
    if (info[field] && !info.performance[field]) {
      info.performance[field] = info[field];
      delete info[field];
    }
  });
  
  // Add system performance metrics
  if (info.level === 'performance' || info.performance.duration) {
    info.performance.memoryUsage = process.memoryUsage();
    info.performance.cpuUsage = process.cpuUsage();
  }
  
  return info;
});

/**
 * Security context formatter
 * Adds security data to log entries
 */
export const securityFormatter = format((info) => {
  // Add security context if not present
  if (!info.security) {
    info.security = {};
  }
  
  // Extract security context from metadata
  const securityFields = [
    'ip', 'userAgent', 'country', 'riskScore', 
    'threatLevel', 'securityEvent'
  ];
  
  securityFields.forEach(field => {
    if (info[field] && !info.security[field]) {
      info.security[field] = info[field];
      delete info[field];
    }
  });
  
  return info;
});

/**
 * Error formatter
 * Standardizes error logging format
 */
export const errorFormatter = format((info) => {
  if (info.error) {
    // Ensure error is properly formatted
    if (typeof info.error === 'object') {
      info.error = {
        name: info.error.name || 'Error',
        message: info.error.message || 'Unknown error',
        stack: info.error.stack,
        code: info.error.code
      };
    }
  }
  
  return info;
});

/**
 * Security data filter
 * Removes sensitive information from logs
 */
export const securityFilter = format((info) => {
  const sensitiveFields = [
    'password', 'token', 'secret', 'key', 'auth', 'credential',
    'ssn', 'socialSecurityNumber', 'creditCard', 'cvv', 'pin'
  ];
  
  const filterSensitiveData = (obj: any, path: string = ''): any => {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    const filtered = Array.isArray(obj) ? [] : {};
    
    for (const key in obj) {
      const currentPath = path ? `${path}.${key}` : key;
      const lowerKey = key.toLowerCase();
      
      // Check if field contains sensitive data
      if (sensitiveFields.some(field => lowerKey.includes(field))) {
        if (Array.isArray(filtered)) {
          filtered.push('***REDACTED***');
        } else {
          filtered[key] = '***REDACTED***';
        }
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        const filteredValue = filterSensitiveData(obj[key], currentPath);
        if (Array.isArray(filtered)) {
          filtered.push(filteredValue);
        } else {
          filtered[key] = filteredValue;
        }
      } else {
        if (Array.isArray(filtered)) {
          filtered.push(obj[key]);
        } else {
          filtered[key] = obj[key];
        }
      }
    }
    
    return filtered;
  };
  
  // Filter sensitive data from all log fields
  const fieldsToFilter = ['metadata', 'business', 'security', 'performance'];
  fieldsToFilter.forEach(field => {
    if (info[field]) {
      info[field] = filterSensitiveData(info[field]);
    }
  });
  
  return info;
});

/**
 * Compliance formatter
 * Adds compliance-related fields to logs
 */
export const complianceFormatter = format((info) => {
  // Add compliance metadata
  info.compliance = {
    gdpr: {
      dataSubject: info.business?.userId,
      processingPurpose: info.business?.action,
      legalBasis: 'legitimate_interest',
      retentionPeriod: '7_years'
    },
    sox: {
      auditTrail: true,
      dataIntegrity: true,
      accessControl: true
    },
    hipaa: {
      phiAccess: info.business?.action?.includes('health') || false,
      auditRequired: true
    }
  };
  
  return info;
});

/**
 * JSON formatter for structured logging
 * Creates consistent JSON output
 */
export const jsonFormatter = format.combine(
  format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS'
  }),
  format.errors({ stack: true }),
  businessContextFormatter(),
  performanceFormatter(),
  securityFormatter(),
  errorFormatter(),
  securityFilter(),
  complianceFormatter(),
  format.json()
);

/**
 * Human-readable formatter for development
 * Creates readable log output for local development
 */
export const humanFormatter = format.combine(
  format.timestamp({
    format: 'HH:mm:ss.SSS'
  }),
  format.colorize(),
  format.printf(({ timestamp, level, message, service, business, ...meta }) => {
    const businessInfo = business ? 
      `[${business.userId || 'system'}:${business.action || 'unknown'}]` : '';
    const metaStr = Object.keys(meta).length ? 
      `\n${JSON.stringify(meta, null, 2)}` : '';
    
    return `${timestamp} [${level}] ${service}${businessInfo}: ${message}${metaStr}`;
  })
);

/**
 * Elasticsearch formatter
 * Optimizes logs for Elasticsearch indexing
 */
export const elasticsearchFormatter = format.combine(
  format.timestamp(),
  businessContextFormatter(),
  performanceFormatter(),
  securityFormatter(),
  errorFormatter(),
  format.printf((info) => {
    // Create Elasticsearch-optimized log entry
    const esLog = {
      '@timestamp': info.timestamp,
      level: info.level,
      message: info.message,
      service: info.service,
      environment: info.environment,
      version: info.version,
      business: info.business,
      performance: info.performance,
      security: info.security,
      error: info.error,
      metadata: info.metadata
    };
    
    return JSON.stringify(esLog);
  })
);

/**
 * Log aggregation formatter
 * Groups related log entries for analysis
 */
export const aggregationFormatter = format((info) => {
  // Add aggregation metadata
  info.aggregation = {
    groupBy: [
      info.service,
      info.business?.userId,
      info.business?.action,
      info.level
    ].filter(Boolean),
    timeWindow: '5m',
    correlationId: info.business?.requestId
  };
  
  return info;
});

/**
 * Metrics formatter
 * Extracts metrics from log entries
 */
export const metricsFormatter = format((info) => {
  // Extract metrics for monitoring
  if (info.performance) {
    info.metrics = {
      duration: info.performance.duration,
      memoryUsage: info.performance.memoryUsage?.heapUsed,
      cpuUsage: info.performance.cpuUsage?.user,
      responseTime: info.performance.responseTime,
      throughput: info.performance.throughput,
      errorRate: info.performance.errorRate
    };
  }
  
  return info;
});

/**
 * Custom log formatter for specific use cases
 * Creates specialized formatters for different scenarios
 */
export class LexiScanLogFormatter {
  private service: string;
  private environment: string;
  private version: string;
  
  constructor(service: string, environment: string, version: string) {
    this.service = service;
    this.environment = environment;
    this.version = version;
  }
  
  /**
   * Format business event log
   */
  formatBusinessEvent(event: string, context: BusinessContext, metrics?: PerformanceMetrics) {
    return {
      timestamp: new Date().toISOString(),
      level: 'business',
      message: event,
      service: this.service,
      environment: this.environment,
      version: this.version,
      business: context,
      performance: metrics
    };
  }
  
  /**
   * Format security event log
   */
  formatSecurityEvent(event: string, context: SecurityContext, business?: BusinessContext) {
    return {
      timestamp: new Date().toISOString(),
      level: 'security',
      message: event,
      service: this.service,
      environment: this.environment,
      version: this.version,
      security: context,
      business: business
    };
  }
  
  /**
   * Format performance log
   */
  formatPerformanceEvent(event: string, metrics: PerformanceMetrics, context?: BusinessContext) {
    return {
      timestamp: new Date().toISOString(),
      level: 'performance',
      message: event,
      service: this.service,
      environment: this.environment,
      version: this.version,
      performance: metrics,
      business: context
    };
  }
  
  /**
   * Format audit log
   */
  formatAuditEvent(event: string, context: BusinessContext, details?: Record<string, any>) {
    return {
      timestamp: new Date().toISOString(),
      level: 'audit',
      message: event,
      service: this.service,
      environment: this.environment,
      version: this.version,
      business: context,
      metadata: details
    };
  }
}

export default {
  businessContextFormatter,
  performanceFormatter,
  securityFormatter,
  errorFormatter,
  securityFilter,
  complianceFormatter,
  jsonFormatter,
  humanFormatter,
  elasticsearchFormatter,
  aggregationFormatter,
  metricsFormatter,
  LexiScanLogFormatter
};
