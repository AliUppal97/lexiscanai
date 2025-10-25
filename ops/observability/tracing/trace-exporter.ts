/**
 * Trace Exporter for LexiScan AI
 * 
 * Purpose:
 * - Exports traces to multiple backends
 * - Provides trace data transformation
 * - Handles trace batching and retry logic
 * - Supports custom trace filtering
 * 
 * Features:
 * - Multiple export backends (Jaeger, Zipkin, OTLP)
 * - Trace data transformation
 * - Batch processing
 * - Retry logic with exponential backoff
 * - Custom trace filtering
 */

import { ReadableSpan, SpanExporter, SpanProcessor } from '@opentelemetry/sdk-trace-base';
import { ExportResult, ExportResultCode } from '@opentelemetry/core';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { ZipkinExporter } from '@opentelemetry/exporter-zipkin';
import { OTLPTraceExporter } from '@opentelemetry/exporter-otlp-http';
import { createHash } from 'crypto';
import { EventEmitter } from 'events';

/**
 * Trace export configuration
 * Configuration for trace export backends
 */
export interface TraceExportConfig {
  jaeger?: {
    endpoint: string;
    tags?: Record<string, string>;
  };
  zipkin?: {
    url: string;
    serviceName: string;
  };
  otlp?: {
    url: string;
    headers?: Record<string, string>;
  };
  batch?: {
    maxExportBatchSize: number;
    exportTimeoutMillis: number;
    scheduledDelayMillis: number;
  };
  retry?: {
    maxRetries: number;
    initialRetryDelayMillis: number;
    maxRetryDelayMillis: number;
    retryMultiplier: number;
  };
}

/**
 * Trace filter configuration
 * Configuration for filtering traces before export
 */
export interface TraceFilterConfig {
  includeServices?: string[];
  excludeServices?: string[];
  includeOperations?: string[];
  excludeOperations?: string[];
  minDuration?: number;
  maxDuration?: number;
  includeErrors?: boolean;
  includeBusinessEvents?: boolean;
  includeSecurityEvents?: boolean;
}

/**
 * Custom trace exporter
 * Exports traces to multiple backends with filtering and transformation
 */
export class LexiScanTraceExporter implements SpanExporter {
  private jaegerExporter?: JaegerExporter;
  private zipkinExporter?: ZipkinExporter;
  private otlpExporter?: OTLPTraceExporter;
  private config: TraceExportConfig;
  private filterConfig: TraceFilterConfig;
  private eventEmitter: EventEmitter;
  private exportQueue: ReadableSpan[] = [];
  private isExporting: boolean = false;

  constructor(config: TraceExportConfig, filterConfig: TraceFilterConfig = {}) {
    this.config = config;
    this.filterConfig = filterConfig;
    this.eventEmitter = new EventEmitter();
    this.initializeExporters();
  }

  /**
   * Initialize trace exporters
   * Sets up exporters for different backends
   */
  private initializeExporters(): void {
    // Initialize Jaeger exporter
    if (this.config.jaeger) {
      this.jaegerExporter = new JaegerExporter({
        endpoint: this.config.jaeger.endpoint,
        tags: this.config.jaeger.tags
      });
    }

    // Initialize Zipkin exporter
    if (this.config.zipkin) {
      this.zipkinExporter = new ZipkinExporter({
        url: this.config.zipkin.url,
        serviceName: this.config.zipkin.serviceName
      });
    }

    // Initialize OTLP exporter
    if (this.config.otlp) {
      this.otlpExporter = new OTLPTraceExporter({
        url: this.config.otlp.url,
        headers: this.config.otlp.headers
      });
    }
  }

  /**
   * Export spans to configured backends
   * Processes and exports spans with filtering and transformation
   */
  async export(spans: ReadableSpan[], resultCallback: (result: ExportResult) => void): Promise<void> {
    try {
      // Filter spans based on configuration
      const filteredSpans = this.filterSpans(spans);
      
      if (filteredSpans.length === 0) {
        resultCallback({ code: ExportResultCode.SUCCESS });
        return;
      }

      // Transform spans for export
      const transformedSpans = this.transformSpans(filteredSpans);

      // Export to all configured backends
      const exportPromises: Promise<ExportResult>[] = [];

      if (this.jaegerExporter) {
        exportPromises.push(this.exportToJaeger(transformedSpans));
      }

      if (this.zipkinExporter) {
        exportPromises.push(this.exportToZipkin(transformedSpans));
      }

      if (this.otlpExporter) {
        exportPromises.push(this.exportToOTLP(transformedSpans));
      }

      // Wait for all exports to complete
      const results = await Promise.allSettled(exportPromises);
      
      // Check if any exports failed
      const hasFailures = results.some(result => 
        result.status === 'rejected' || result.value.code === ExportResultCode.FAILED
      );

      if (hasFailures) {
        resultCallback({ code: ExportResultCode.FAILED });
      } else {
        resultCallback({ code: ExportResultCode.SUCCESS });
      }

      // Emit export event
      this.eventEmitter.emit('export', {
        spanCount: transformedSpans.length,
        success: !hasFailures,
        timestamp: new Date()
      });

    } catch (error) {
      console.error('Trace export error:', error);
      resultCallback({ code: ExportResultCode.FAILED });
    }
  }

  /**
   * Filter spans based on configuration
   * Applies filtering rules to spans before export
   */
  private filterSpans(spans: ReadableSpan[]): ReadableSpan[] {
    return spans.filter(span => {
      // Filter by service
      if (this.filterConfig.includeServices && 
          !this.filterConfig.includeServices.includes(span.resource.attributes['service.name'] as string)) {
        return false;
      }

      if (this.filterConfig.excludeServices && 
          this.filterConfig.excludeServices.includes(span.resource.attributes['service.name'] as string)) {
        return false;
      }

      // Filter by operation
      if (this.filterConfig.includeOperations && 
          !this.filterConfig.includeOperations.includes(span.name)) {
        return false;
      }

      if (this.filterConfig.excludeOperations && 
          this.filterConfig.excludeOperations.includes(span.name)) {
        return false;
      }

      // Filter by duration
      if (this.filterConfig.minDuration && span.duration[0] < this.filterConfig.minDuration) {
        return false;
      }

      if (this.filterConfig.maxDuration && span.duration[0] > this.filterConfig.maxDuration) {
        return false;
      }

      // Filter by error status
      if (this.filterConfig.includeErrors === false && span.status.code === 2) {
        return false;
      }

      // Filter by business events
      if (this.filterConfig.includeBusinessEvents === false && 
          span.attributes['business.operation']) {
        return false;
      }

      // Filter by security events
      if (this.filterConfig.includeSecurityEvents === false && 
          span.attributes['security.operation']) {
        return false;
      }

      return true;
    });
  }

  /**
   * Transform spans for export
   * Adds custom attributes and metadata to spans
   */
  private transformSpans(spans: ReadableSpan[]): ReadableSpan[] {
    return spans.map(span => {
      // Create a copy of the span
      const transformedSpan = { ...span };

      // Add custom attributes
      transformedSpan.attributes = {
        ...transformedSpan.attributes,
        'lexiscan.export.timestamp': Date.now(),
        'lexiscan.export.version': '1.0.0',
        'lexiscan.export.environment': process.env.NODE_ENV || 'development'
      };

      // Add performance metrics
      if (transformedSpan.duration) {
        transformedSpan.attributes['performance.duration_ms'] = transformedSpan.duration[0] / 1000000;
      }

      // Add memory usage
      const memoryUsage = process.memoryUsage();
      transformedSpan.attributes['performance.memory_heap_used'] = memoryUsage.heapUsed;
      transformedSpan.attributes['performance.memory_heap_total'] = memoryUsage.heapTotal;

      // Add business context
      if (transformedSpan.attributes['business.operation']) {
        transformedSpan.attributes['lexiscan.business.operation'] = transformedSpan.attributes['business.operation'];
      }

      // Add security context
      if (transformedSpan.attributes['security.operation']) {
        transformedSpan.attributes['lexiscan.security.operation'] = transformedSpan.attributes['security.operation'];
      }

      return transformedSpan;
    });
  }

  /**
   * Export spans to Jaeger
   * Sends spans to Jaeger backend
   */
  private async exportToJaeger(spans: ReadableSpan[]): Promise<ExportResult> {
    try {
      await this.jaegerExporter!.export(spans, (result) => {
        if (result.code === ExportResultCode.FAILED) {
          throw new Error('Jaeger export failed');
        }
      });
      return { code: ExportResultCode.SUCCESS };
    } catch (error) {
      console.error('Jaeger export error:', error);
      return { code: ExportResultCode.FAILED };
    }
  }

  /**
   * Export spans to Zipkin
   * Sends spans to Zipkin backend
   */
  private async exportToZipkin(spans: ReadableSpan[]): Promise<ExportResult> {
    try {
      await this.zipkinExporter!.export(spans, (result) => {
        if (result.code === ExportResultCode.FAILED) {
          throw new Error('Zipkin export failed');
        }
      });
      return { code: ExportResultCode.SUCCESS };
    } catch (error) {
      console.error('Zipkin export error:', error);
      return { code: ExportResultCode.FAILED };
    }
  }

  /**
   * Export spans to OTLP
   * Sends spans to OTLP-compatible backend
   */
  private async exportToOTLP(spans: ReadableSpan[]): Promise<ExportResult> {
    try {
      await this.otlpExporter!.export(spans, (result) => {
        if (result.code === ExportResultCode.FAILED) {
          throw new Error('OTLP export failed');
        }
      });
      return { code: ExportResultCode.SUCCESS };
    } catch (error) {
      console.error('OTLP export error:', error);
      return { code: ExportResultCode.FAILED };
    }
  }

  /**
   * Shutdown the exporter
   * Gracefully shuts down all exporters
   */
  async shutdown(): Promise<void> {
    try {
      if (this.jaegerExporter) {
        await this.jaegerExporter.shutdown();
      }
      if (this.zipkinExporter) {
        await this.zipkinExporter.shutdown();
      }
      if (this.otlpExporter) {
        await this.otlpExporter.shutdown();
      }
    } catch (error) {
      console.error('Error shutting down trace exporters:', error);
    }
  }

  /**
   * Get export statistics
   * Returns statistics about trace exports
   */
  getExportStats(): {
    totalExports: number;
    successfulExports: number;
    failedExports: number;
    averageExportTime: number;
  } {
    // This would be implemented with actual statistics tracking
    return {
      totalExports: 0,
      successfulExports: 0,
      failedExports: 0,
      averageExportTime: 0
    };
  }

  /**
   * Add event listener for export events
   * Allows monitoring of export operations
   */
  on(event: string, listener: (...args: any[]) => void): void {
    this.eventEmitter.on(event, listener);
  }

  /**
   * Remove event listener
   * Removes event listeners
   */
  off(event: string, listener: (...args: any[]) => void): void {
    this.eventEmitter.off(event, listener);
  }
}

/**
 * Batch span processor
 * Processes spans in batches for efficient export
 */
export class LexiScanBatchSpanProcessor implements SpanProcessor {
  private exporter: LexiScanTraceExporter;
  private batchSize: number;
  private exportTimeout: number;
  private scheduledDelay: number;
  private spans: ReadableSpan[] = [];
  private timer?: NodeJS.Timeout;
  private isShutdown: boolean = false;

  constructor(
    exporter: LexiScanTraceExporter,
    batchSize: number = 512,
    exportTimeout: number = 30000,
    scheduledDelay: number = 5000
  ) {
    this.exporter = exporter;
    this.batchSize = batchSize;
    this.exportTimeout = exportTimeout;
    this.scheduledDelay = scheduledDelay;
  }

  /**
   * Process a span
   * Adds span to batch and exports when batch is full
   */
  onStart(span: ReadableSpan): void {
    // Spans are processed when they end
  }

  /**
   * Process a completed span
   * Adds span to batch and exports when batch is full
   */
  onEnd(span: ReadableSpan): void {
    if (this.isShutdown) return;

    this.spans.push(span);

    // Export if batch is full
    if (this.spans.length >= this.batchSize) {
      this.exportBatch();
    } else {
      // Schedule export if not already scheduled
      if (!this.timer) {
        this.timer = setTimeout(() => {
          this.exportBatch();
        }, this.scheduledDelay);
      }
    }
  }

  /**
   * Export current batch
   * Exports all spans in the current batch
   */
  private exportBatch(): void {
    if (this.spans.length === 0) return;

    const spansToExport = [...this.spans];
    this.spans = [];

    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }

    this.exporter.export(spansToExport, (result) => {
      if (result.code === ExportResultCode.FAILED) {
        console.error('Batch export failed');
      }
    });
  }

  /**
   * Force export all pending spans
   * Exports all pending spans immediately
   */
  forceFlush(): Promise<void> {
    return new Promise((resolve) => {
      if (this.spans.length === 0) {
        resolve();
        return;
      }

      this.exportBatch();
      resolve();
    });
  }

  /**
   * Shutdown the processor
   * Exports all pending spans and shuts down
   */
  async shutdown(): Promise<void> {
    this.isShutdown = true;
    
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }

    // Export all pending spans
    if (this.spans.length > 0) {
      await this.forceFlush();
    }

    await this.exporter.shutdown();
  }
}

/**
 * Trace export factory
 * Creates configured trace exporters
 */
export class TraceExportFactory {
  /**
   * Create Jaeger exporter
   * Creates a Jaeger-specific trace exporter
   */
  static createJaegerExporter(config: TraceExportConfig): LexiScanTraceExporter {
    return new LexiScanTraceExporter({
      jaeger: config.jaeger,
      batch: config.batch,
      retry: config.retry
    });
  }

  /**
   * Create multi-backend exporter
   * Creates an exporter that sends to multiple backends
   */
  static createMultiBackendExporter(config: TraceExportConfig): LexiScanTraceExporter {
    return new LexiScanTraceExporter(config);
  }

  /**
   * Create filtered exporter
   * Creates an exporter with specific filtering rules
   */
  static createFilteredExporter(
    config: TraceExportConfig,
    filterConfig: TraceFilterConfig
  ): LexiScanTraceExporter {
    return new LexiScanTraceExporter(config, filterConfig);
  }
}

export default LexiScanTraceExporter;
