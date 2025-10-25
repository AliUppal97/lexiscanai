/**
 * OpenTelemetry Configuration for LexiScan AI
 * 
 * Purpose:
 * - Configures distributed tracing across all services
 * - Integrates with Jaeger for trace visualization
 * - Provides performance monitoring and debugging
 * - Enables request correlation and analysis
 * 
 * Features:
 * - Automatic instrumentation
 * - Custom span creation
 * - Trace context propagation
 * - Performance metrics
 * - Error tracking
 */

import { NodeSDK } from '@opentelemetry/auto-instrumentations-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { ZipkinExporter } from '@opentelemetry/exporter-zipkin';
import { OTLPTraceExporter } from '@opentelemetry/exporter-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { trace, metrics, context, SpanStatusCode, SpanKind } from '@opentelemetry/api';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { MeterProvider } from '@opentelemetry/sdk-metrics';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import { PrismaInstrumentation } from '@opentelemetry/instrumentation-prisma';
import { RedisInstrumentation } from '@opentelemetry/instrumentation-redis';
import { PinoInstrumentation } from '@opentelemetry/instrumentation-pino';

// Environment configuration
const NODE_ENV = process.env.NODE_ENV || 'development';
const SERVICE_NAME = process.env.SERVICE_NAME || 'lexiscan-api';
const SERVICE_VERSION = process.env.SERVICE_VERSION || '1.0.0';
const JAEGER_ENDPOINT = process.env.JAEGER_ENDPOINT || 'http://jaeger:14268/api/traces';
const OTLP_ENDPOINT = process.env.OTLP_ENDPOINT || 'http://jaeger:4317';

/**
 * Resource configuration
 * Defines service metadata for tracing
 */
const resource = new Resource({
  [SemanticResourceAttributes.SERVICE_NAME]: SERVICE_NAME,
  [SemanticResourceAttributes.SERVICE_VERSION]: SERVICE_VERSION,
  [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: NODE_ENV,
  [SemanticResourceAttributes.SERVICE_NAMESPACE]: 'lexiscan',
  [SemanticResourceAttributes.SERVICE_INSTANCE_ID]: process.env.HOSTNAME || 'unknown',
});

/**
 * Jaeger exporter configuration
 * Sends traces to Jaeger for visualization
 */
const jaegerExporter = new JaegerExporter({
  endpoint: JAEGER_ENDPOINT,
  tags: [
    { key: 'service.name', value: SERVICE_NAME },
    { key: 'service.version', value: SERVICE_VERSION },
    { key: 'environment', value: NODE_ENV }
  ]
});

/**
 * OTLP exporter configuration
 * Sends traces to OTLP-compatible backends
 */
const otlpExporter = new OTLPTraceExporter({
  url: OTLP_ENDPOINT,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Zipkin exporter configuration (alternative)
 * Sends traces to Zipkin for visualization
 */
const zipkinExporter = new ZipkinExporter({
  url: 'http://jaeger:9411/api/v2/spans',
  serviceName: SERVICE_NAME
});

/**
 * Tracer provider configuration
 * Configures trace sampling and export
 */
const tracerProvider = new NodeTracerProvider({
  resource,
  sampler: {
    shouldSample: (context, traceId, spanName, spanKind, attributes, links) => {
      // Sample all traces in development, 10% in production
      if (NODE_ENV === 'development') {
        return { decision: 'RECORD_AND_SAMPLE' };
      }
      
      // Production sampling based on trace ID hash
      const hash = traceId.slice(-8);
      const sampleRate = parseInt(hash, 16) / 0xffffffff;
      return sampleRate < 0.1 ? { decision: 'RECORD_AND_SAMPLE' } : { decision: 'NOT_RECORD' };
    }
  }
});

// Add exporters to tracer provider
tracerProvider.addSpanProcessor(new BatchSpanProcessor(jaegerExporter));
tracerProvider.addSpanProcessor(new BatchSpanProcessor(otlpExporter));

// Register the tracer provider
tracerProvider.register();

/**
 * Meter provider configuration
 * Configures metrics collection
 */
const meterProvider = new MeterProvider({
  resource,
  readers: [
    new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter({
        url: OTLP_ENDPOINT.replace('traces', 'metrics')
      }),
      exportIntervalMillis: 10000
    })
  ]
});

// Register the meter provider
metrics.setGlobalMeterProvider(meterProvider);

/**
 * Instrumentation configuration
 * Automatically instruments common libraries
 */
const instrumentations = [
  new HttpInstrumentation({
    requestHook: (span, request) => {
      span.setAttributes({
        'http.request.headers.user-agent': request.headers['user-agent'],
        'http.request.headers.content-type': request.headers['content-type'],
        'http.request.headers.authorization': request.headers['authorization'] ? '***' : undefined
      });
    },
    responseHook: (span, response) => {
      span.setAttributes({
        'http.response.headers.content-type': response.headers['content-type'],
        'http.response.headers.content-length': response.headers['content-length']
      });
    }
  }),
  new ExpressInstrumentation({
    requestHook: (span, info) => {
      span.setAttributes({
        'express.route': info.route?.path,
        'express.method': info.request.method,
        'express.url': info.request.url
      });
    }
  }),
  new NestInstrumentation({
    requestHook: (span, info) => {
      span.setAttributes({
        'nest.controller': info.controller,
        'nest.method': info.method,
        'nest.route': info.route
      });
    }
  }),
  new PrismaInstrumentation({
    middleware: true,
    captureParameters: true,
    captureReturnValues: true
  }),
  new RedisInstrumentation({
    dbStatementSanitizer: (cmd, args) => {
      // Sanitize sensitive Redis commands
      if (cmd === 'AUTH') {
        return [cmd, '***'];
      }
      return [cmd, ...args];
    }
  }),
  new PinoInstrumentation({
    logHook: (span, record, level) => {
      span.setAttributes({
        'log.level': level,
        'log.message': record.msg,
        'log.service': record.service
      });
    }
  })
];

// Register all instrumentations
registerInstrumentations({
  instrumentations
});

/**
 * Custom span decorator for methods
 * Automatically creates spans for decorated methods
 */
export function Trace(operationName?: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    const spanName = operationName || `${target.constructor.name}.${propertyName}`;
    
    descriptor.value = function (...args: any[]) {
      const tracer = trace.getTracer(SERVICE_NAME);
      const span = tracer.startSpan(spanName, {
        kind: SpanKind.INTERNAL,
        attributes: {
          'method.name': propertyName,
          'class.name': target.constructor.name,
          'method.arguments': JSON.stringify(args)
        }
      });
      
      return context.with(trace.setSpan(context.active(), span), () => {
        try {
          const result = method.apply(this, args);
          
          // Handle async methods
          if (result instanceof Promise) {
            return result
              .then((res) => {
                span.setStatus({ code: SpanStatusCode.OK });
                span.setAttributes({ 'method.result': JSON.stringify(res) });
                return res;
              })
              .catch((error) => {
                span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
                span.setAttributes({ 'error.message': error.message, 'error.stack': error.stack });
                throw error;
              })
              .finally(() => {
                span.end();
              });
          }
          
          // Handle sync methods
          span.setStatus({ code: SpanStatusCode.OK });
          span.setAttributes({ 'method.result': JSON.stringify(result) });
          return result;
        } catch (error) {
          span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
          span.setAttributes({ 'error.message': error.message, 'error.stack': error.stack });
          throw error;
        } finally {
          span.end();
        }
      });
    };
  };
}

/**
 * Database span decorator
 * Creates spans for database operations
 */
export function TraceDatabase(operationName?: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    const spanName = operationName || `database.${propertyName}`;
    
    descriptor.value = function (...args: any[]) {
      const tracer = trace.getTracer(SERVICE_NAME);
      const span = tracer.startSpan(spanName, {
        kind: SpanKind.CLIENT,
        attributes: {
          'db.operation': propertyName,
          'db.system': 'postgresql',
          'db.connection_string': '***'
        }
      });
      
      return context.with(trace.setSpan(context.active(), span), () => {
        try {
          const result = method.apply(this, args);
          
          if (result instanceof Promise) {
            return result
              .then((res) => {
                span.setStatus({ code: SpanStatusCode.OK });
                span.setAttributes({ 'db.rows_affected': res?.rowCount || 0 });
                return res;
              })
              .catch((error) => {
                span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
                span.setAttributes({ 'error.message': error.message });
                throw error;
              })
              .finally(() => {
                span.end();
              });
          }
          
          span.setStatus({ code: SpanStatusCode.OK });
          return result;
        } catch (error) {
          span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
          throw error;
        } finally {
          span.end();
        }
      });
    };
  };
}

/**
 * HTTP span decorator
 * Creates spans for HTTP operations
 */
export function TraceHTTP(operationName?: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    const spanName = operationName || `http.${propertyName}`;
    
    descriptor.value = function (...args: any[]) {
      const tracer = trace.getTracer(SERVICE_NAME);
      const span = tracer.startSpan(spanName, {
        kind: SpanKind.CLIENT,
        attributes: {
          'http.method': 'GET', // Would be determined from request
          'http.url': '***', // Would be determined from request
          'http.scheme': 'https'
        }
      });
      
      return context.with(trace.setSpan(context.active(), span), () => {
        try {
          const result = method.apply(this, args);
          
          if (result instanceof Promise) {
            return result
              .then((res) => {
                span.setStatus({ code: SpanStatusCode.OK });
                span.setAttributes({ 'http.status_code': res?.status || 200 });
                return res;
              })
              .catch((error) => {
                span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
                span.setAttributes({ 'http.status_code': error.status || 500 });
                throw error;
              })
              .finally(() => {
                span.end();
              });
          }
          
          span.setStatus({ code: SpanStatusCode.OK });
          return result;
        } catch (error) {
          span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
          throw error;
        } finally {
          span.end();
        }
      });
    };
  };
}

/**
 * Business span decorator
 * Creates spans for business operations
 */
export function TraceBusiness(operationName?: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    const spanName = operationName || `business.${propertyName}`;
    
    descriptor.value = function (...args: any[]) {
      const tracer = trace.getTracer(SERVICE_NAME);
      const span = tracer.startSpan(spanName, {
        kind: SpanKind.INTERNAL,
        attributes: {
          'business.operation': propertyName,
          'business.service': SERVICE_NAME,
          'business.environment': NODE_ENV
        }
      });
      
      return context.with(trace.setSpan(context.active(), span), () => {
        try {
          const result = method.apply(this, args);
          
          if (result instanceof Promise) {
            return result
              .then((res) => {
                span.setStatus({ code: SpanStatusCode.OK });
                span.setAttributes({ 'business.result': JSON.stringify(res) });
                return res;
              })
              .catch((error) => {
                span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
                span.setAttributes({ 'error.message': error.message });
                throw error;
              })
              .finally(() => {
                span.end();
              });
          }
          
          span.setStatus({ code: SpanStatusCode.OK });
          return result;
        } catch (error) {
          span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
          throw error;
        } finally {
          span.end();
        }
      });
    };
  };
}

/**
 * Custom span creation utility
 * Creates custom spans for specific operations
 */
export class TraceUtils {
  /**
   * Create a custom span
   */
  static createSpan(name: string, attributes: Record<string, any> = {}): any {
    const tracer = trace.getTracer(SERVICE_NAME);
    return tracer.startSpan(name, { attributes });
  }
  
  /**
   * Create a span for document processing
   */
  static createDocumentProcessingSpan(documentId: string, userId: string): any {
    const tracer = trace.getTracer(SERVICE_NAME);
    return tracer.startSpan('document.processing', {
      attributes: {
        'document.id': documentId,
        'user.id': userId,
        'business.operation': 'document_processing'
      }
    });
  }
  
  /**
   * Create a span for user authentication
   */
  static createAuthSpan(userId: string, action: string): any {
    const tracer = trace.getTracer(SERVICE_NAME);
    return tracer.startSpan('auth.operation', {
      attributes: {
        'user.id': userId,
        'auth.action': action,
        'security.operation': 'authentication'
      }
    });
  }
  
  /**
   * Create a span for API calls
   */
  static createAPISpan(endpoint: string, method: string, userId?: string): any {
    const tracer = trace.getTracer(SERVICE_NAME);
    return tracer.startSpan('api.call', {
      attributes: {
        'http.endpoint': endpoint,
        'http.method': method,
        'user.id': userId,
        'api.operation': 'external_call'
      }
    });
  }
}

/**
 * Trace context utilities
 * Utilities for working with trace context
 */
export class TraceContext {
  /**
   * Get current trace ID
   */
  static getTraceId(): string | undefined {
    const span = trace.getActiveSpan();
    return span?.spanContext().traceId;
  }
  
  /**
   * Get current span ID
   */
  static getSpanId(): string | undefined {
    const span = trace.getActiveSpan();
    return span?.spanContext().spanId;
  }
  
  /**
   * Add attributes to current span
   */
  static addAttributes(attributes: Record<string, any>): void {
    const span = trace.getActiveSpan();
    span?.setAttributes(attributes);
  }
  
  /**
   * Add events to current span
   */
  static addEvent(name: string, attributes: Record<string, any> = {}): void {
    const span = trace.getActiveSpan();
    span?.addEvent(name, attributes);
  }
  
  /**
   * Set span status
   */
  static setStatus(code: SpanStatusCode, message?: string): void {
    const span = trace.getActiveSpan();
    span?.setStatus({ code, message });
  }
}

/**
 * Initialize OpenTelemetry
 * Sets up tracing for the application
 */
export function initializeOpenTelemetry(): void {
  // The SDK is already initialized through the NodeSDK
  console.log(`OpenTelemetry initialized for ${SERVICE_NAME} v${SERVICE_VERSION}`);
}

/**
 * Shutdown OpenTelemetry
 * Gracefully shuts down tracing
 */
export async function shutdownOpenTelemetry(): Promise<void> {
  await tracerProvider.shutdown();
  await meterProvider.shutdown();
  console.log('OpenTelemetry shutdown complete');
}

// Initialize OpenTelemetry on module load
initializeOpenTelemetry();

export default {
  Trace,
  TraceDatabase,
  TraceHTTP,
  TraceBusiness,
  TraceUtils,
  TraceContext,
  initializeOpenTelemetry,
  shutdownOpenTelemetry
};
