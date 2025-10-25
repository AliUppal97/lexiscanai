/**
 * Winston Configuration for LexiScan AI
 * 
 * Purpose:
 * - Centralized logging configuration for all services
 * - Structured logging with consistent format
 * - Multiple transports (console, file, remote)
 * - Log level management and filtering
 * - Performance optimization
 * 
 * Features:
 * - JSON structured logging
 * - Log rotation and retention
 * - Remote log shipping
 * - Performance metrics
 * - Security and compliance
 */

import winston from 'winston';
import { Logtail } from '@logtail/node';
import { ElasticsearchTransport } from 'winston-elasticsearch';
import { createWriteStream } from 'fs';
import { Transform } from 'stream';

// Environment configuration
const NODE_ENV = process.env.NODE_ENV || 'development';
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const SERVICE_NAME = process.env.SERVICE_NAME || 'lexiscan-api';
const LOGTAIL_TOKEN = process.env.LOGTAIL_TOKEN;
const ELASTICSEARCH_URL = process.env.ELASTICSEARCH_URL || 'http://elasticsearch:9200';

/**
 * Custom log format for LexiScan AI
 * Includes service context, request tracing, and business metrics
 */
const lexiscanFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, service, requestId, userId, ...meta }) => {
    return JSON.stringify({
      timestamp,
      level,
      message,
      service: service || SERVICE_NAME,
      requestId,
      userId,
      environment: NODE_ENV,
      ...meta
    });
  })
);

/**
 * Console format for development
 * Human-readable format for local development
 */
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss.SSS'
  }),
  winston.format.printf(({ timestamp, level, message, service, requestId, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `${timestamp} [${level}] ${service || SERVICE_NAME}${requestId ? ` [${requestId}]` : ''}: ${message} ${metaStr}`;
  })
);

/**
 * Security filter to remove sensitive information
 * Removes passwords, tokens, and other sensitive data from logs
 */
const securityFilter = winston.format((info) => {
  // Remove sensitive fields
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth', 'credential'];
  
  const filterSensitiveData = (obj: any): any => {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    const filtered = { ...obj };
    for (const key in filtered) {
      if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
        filtered[key] = '***REDACTED***';
      } else if (typeof filtered[key] === 'object') {
        filtered[key] = filterSensitiveData(filtered[key]);
      }
    }
    return filtered;
  };
  
  return filterSensitiveData(info);
});

/**
 * Performance metrics formatter
 * Adds performance data to logs
 */
const performanceFormatter = winston.format((info) => {
  if (info.duration) {
    info.performance = {
      duration: info.duration,
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage()
    };
  }
  return info;
});

/**
 * Create Winston logger instance
 * Configures transports based on environment
 */
export const logger = winston.createLogger({
  level: LOG_LEVEL,
  format: winston.format.combine(
    securityFilter(),
    performanceFormatter(),
    lexiscanFormat
  ),
  defaultMeta: {
    service: SERVICE_NAME,
    environment: NODE_ENV,
    version: process.env.APP_VERSION || '1.0.0'
  },
  transports: []
});

/**
 * Console transport for development
 */
if (NODE_ENV === 'development') {
  logger.add(new winston.transports.Console({
    format: consoleFormat,
    level: 'debug'
  }));
}

/**
 * File transport for production
 * Rotates logs daily and keeps 30 days
 */
if (NODE_ENV === 'production') {
  logger.add(new winston.transports.File({
    filename: `/app/logs/${SERVICE_NAME}-error.log`,
    level: 'error',
    maxsize: 10 * 1024 * 1024, // 10MB
    maxFiles: 30,
    tailable: true
  }));
  
  logger.add(new winston.transports.File({
    filename: `/app/logs/${SERVICE_NAME}-combined.log`,
    maxsize: 10 * 1024 * 1024, // 10MB
    maxFiles: 30,
    tailable: true
  }));
}

/**
 * Logtail transport for remote logging
 * Sends logs to Logtail for centralized logging
 */
if (LOGTAIL_TOKEN) {
  const logtail = new Logtail(LOGTAIL_TOKEN);
  
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json(),
      winston.format.printf((info) => {
        logtail.log(info.message, {
          level: info.level,
          service: info.service,
          timestamp: info.timestamp,
          ...info
        });
        return '';
      })
    )
  }));
}

/**
 * Elasticsearch transport for log aggregation
 * Sends logs to Elasticsearch for analysis
 */
if (ELASTICSEARCH_URL) {
  const esTransport = new ElasticsearchTransport({
    level: 'info',
    clientOpts: {
      node: ELASTICSEARCH_URL,
      auth: {
        username: process.env.ELASTICSEARCH_USERNAME || 'elastic',
        password: process.env.ELASTICSEARCH_PASSWORD || 'changeme'
      }
    },
    index: `logstash-${SERVICE_NAME}-${new Date().toISOString().split('T')[0]}`,
    indexTemplate: {
      'mappings': {
        'properties': {
          'timestamp': { 'type': 'date' },
          'level': { 'type': 'keyword' },
          'message': { 'type': 'text' },
          'service': { 'type': 'keyword' },
          'requestId': { 'type': 'keyword' },
          'userId': { 'type': 'keyword' },
          'environment': { 'type': 'keyword' }
        }
      }
    }
  });
  
  logger.add(esTransport);
}

/**
 * Custom log levels for LexiScan AI
 * Business-specific log levels for better categorization
 */
export const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6,
  // Custom business levels
  audit: 7,
  security: 8,
  performance: 9,
  business: 10
};

/**
 * Logging middleware for Express
 * Adds request context to all logs
 */
export const loggingMiddleware = (req: any, res: any, next: any) => {
  const requestId = req.headers['x-request-id'] || 
                   req.headers['x-correlation-id'] || 
                   `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  req.requestId = requestId;
  req.userId = req.user?.id;
  
  // Add request context to logger
  logger.defaultMeta = {
    ...logger.defaultMeta,
    requestId,
    userId: req.user?.id,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    method: req.method,
    url: req.url
  };
  
  // Log request start
  logger.http('Request started', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  
  // Log response
  res.on('finish', () => {
    logger.http('Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: Date.now() - req.startTime,
      contentLength: res.get('Content-Length')
    });
  });
  
  next();
};

/**
 * Business logging functions
 * Specialized logging for business events
 */
export const businessLogger = {
  userAction: (userId: string, action: string, details: any = {}) => {
    logger.business('User action', {
      userId,
      action,
      ...details
    });
  },
  
  documentProcessed: (documentId: string, status: string, duration: number, details: any = {}) => {
    logger.business('Document processed', {
      documentId,
      status,
      duration,
      ...details
    });
  },
  
  apiUsage: (endpoint: string, method: string, userId: string, duration: number) => {
    logger.business('API usage', {
      endpoint,
      method,
      userId,
      duration
    });
  },
  
  subscriptionEvent: (userId: string, event: string, plan: string, details: any = {}) => {
    logger.business('Subscription event', {
      userId,
      event,
      plan,
      ...details
    });
  }
};

/**
 * Security logging functions
 * Specialized logging for security events
 */
export const securityLogger = {
  loginAttempt: (email: string, success: boolean, ip: string, userAgent: string) => {
    logger.security('Login attempt', {
      email,
      success,
      ip,
      userAgent
    });
  },
  
  permissionDenied: (userId: string, resource: string, action: string, ip: string) => {
    logger.security('Permission denied', {
      userId,
      resource,
      action,
      ip
    });
  },
  
  suspiciousActivity: (userId: string, activity: string, details: any = {}) => {
    logger.security('Suspicious activity', {
      userId,
      activity,
      ...details
    });
  }
};

/**
 * Performance logging functions
 * Specialized logging for performance metrics
 */
export const performanceLogger = {
  slowQuery: (query: string, duration: number, table: string) => {
    logger.performance('Slow database query', {
      query,
      duration,
      table
    });
  },
  
  slowApiCall: (endpoint: string, method: string, duration: number, statusCode: number) => {
    logger.performance('Slow API call', {
      endpoint,
      method,
      duration,
      statusCode
    });
  },
  
  cacheMiss: (key: string, operation: string, duration: number) => {
    logger.performance('Cache miss', {
      key,
      operation,
      duration
    });
  }
};

/**
 * Audit logging functions
 * Specialized logging for compliance and auditing
 */
export const auditLogger = {
  dataAccess: (userId: string, resource: string, action: string, details: any = {}) => {
    logger.audit('Data access', {
      userId,
      resource,
      action,
      timestamp: new Date().toISOString(),
      ...details
    });
  },
  
  dataModification: (userId: string, resource: string, action: string, oldValue: any, newValue: any) => {
    logger.audit('Data modification', {
      userId,
      resource,
      action,
      oldValue,
      newValue,
      timestamp: new Date().toISOString()
    });
  },
  
  systemChange: (userId: string, change: string, details: any = {}) => {
    logger.audit('System change', {
      userId,
      change,
      timestamp: new Date().toISOString(),
      ...details
    });
  }
};

/**
 * Error handling for logger
 * Ensures logging doesn't break the application
 */
logger.on('error', (error) => {
  console.error('Logger error:', error);
});

/**
 * Graceful shutdown
 * Ensures all logs are written before process exit
 */
process.on('SIGINT', () => {
  logger.info('Shutting down logger...');
  logger.end();
});

process.on('SIGTERM', () => {
  logger.info('Shutting down logger...');
  logger.end();
});

export default logger;
