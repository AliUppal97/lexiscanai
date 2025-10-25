import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * LoggingInterceptor - Comprehensive request/response logging
 * 
 * This interceptor logs all HTTP requests and responses for:
 * - Debugging and troubleshooting
 * - Performance monitoring
 * - Audit trail
 * - Security monitoring
 * 
 * Features:
 * - Logs request method, URL, body, headers
 * - Logs response status, duration
 * - Sanitizes sensitive data (passwords, tokens)
 * - Color-coded console output
 * - Integration with external logging services
 * 
 * Usage:
 * ```typescript
 * // Global usage (in main.ts)
 * app.useGlobalInterceptors(new LoggingInterceptor());
 * 
 * // Or per-controller
 * @UseInterceptors(LoggingInterceptor)
 * @Controller('users')
 * export class UsersController { ... }
 * ```
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    
    const { method, url, body, headers, ip } = request;
    const userAgent = headers['user-agent'] || '';
    const userId = request.user?.userId || 'anonymous';
    const tenantId = request.tenantId || 'none';

    // Start time for duration calculation
    const startTime = Date.now();

    // Log incoming request
    this.logRequest(method, url, userId, tenantId, ip, userAgent);

    // Log request body (sanitized)
    if (body && Object.keys(body).length > 0) {
      this.logger.debug(`Request Body: ${JSON.stringify(this.sanitizeData(body))}`);
    }

    return next.handle().pipe(
      tap({
        next: (data) => {
          // Log successful response
          const duration = Date.now() - startTime;
          this.logResponse(
            method,
            url,
            response.statusCode,
            duration,
            userId,
            tenantId,
          );

          // Log response size
          if (data) {
            const responseSize = JSON.stringify(data).length;
            this.logger.debug(`Response Size: ${this.formatBytes(responseSize)}`);
          }
        },
        error: (error) => {
          // Log error response
          const duration = Date.now() - startTime;
          this.logError(
            method,
            url,
            error.status || 500,
            duration,
            error.message,
            userId,
            tenantId,
          );
        },
      }),
    );
  }

  /**
   * Log incoming request
   */
  private logRequest(
    method: string,
    url: string,
    userId: string,
    tenantId: string,
    ip: string,
    userAgent: string,
  ): void {
    this.logger.log(
      `→ ${method} ${url} | User: ${userId} | Tenant: ${tenantId} | IP: ${ip}`,
    );

    if (userAgent) {
      this.logger.debug(`User-Agent: ${userAgent}`);
    }
  }

  /**
   * Log successful response
   */
  private logResponse(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    userId: string,
    tenantId: string,
  ): void {
    const color = this.getStatusColor(statusCode);
    this.logger.log(
      `← ${method} ${url} ${color}${statusCode}\x1b[0m ${duration}ms | User: ${userId} | Tenant: ${tenantId}`,
    );
  }

  /**
   * Log error response
   */
  private logError(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    errorMessage: string,
    userId: string,
    tenantId: string,
  ): void {
    this.logger.error(
      `← ${method} ${url} \x1b[31m${statusCode}\x1b[0m ${duration}ms | Error: ${errorMessage} | User: ${userId} | Tenant: ${tenantId}`,
    );
  }

  /**
   * Get ANSI color code based on status code
   */
  private getStatusColor(statusCode: number): string {
    if (statusCode >= 500) return '\x1b[31m'; // Red
    if (statusCode >= 400) return '\x1b[33m'; // Yellow
    if (statusCode >= 300) return '\x1b[36m'; // Cyan
    if (statusCode >= 200) return '\x1b[32m'; // Green
    return '\x1b[0m'; // Reset
  }

  /**
   * Sanitize sensitive data from logs
   */
  private sanitizeData(data: any): any {
    const sensitiveFields = [
      'password',
      'token',
      'apiKey',
      'secret',
      'creditCard',
      'ssn',
      'authorization',
    ];

    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const sanitized = { ...data };

    for (const key in sanitized) {
      const lowerKey = key.toLowerCase();
      
      // Check if field is sensitive
      if (sensitiveFields.some((field) => lowerKey.includes(field))) {
        sanitized[key] = '***REDACTED***';
      } else if (typeof sanitized[key] === 'object') {
        // Recursively sanitize nested objects
        sanitized[key] = this.sanitizeData(sanitized[key]);
      }
    }

    return sanitized;
  }

  /**
   * Format bytes to human-readable format
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}

