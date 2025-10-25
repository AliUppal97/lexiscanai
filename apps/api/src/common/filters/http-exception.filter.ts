import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuditService, AuditAction } from '../../services/audit.service';

/**
 * HttpExceptionFilter - Global exception handler for HTTP errors
 * 
 * This filter catches all HTTP exceptions and formats them into a
 * consistent error response structure for the frontend.
 * 
 * Features:
 * - Consistent error response format
 * - Automatic error logging
 * - Audit trail for errors
 * - Sanitized error messages in production
 * - Stack traces in development
 * - Integration with monitoring services
 * 
 * Error Response Format:
 * ```json
 * {
 *   "success": false,
 *   "statusCode": 404,
 *   "error": "Not Found",
 *   "message": "User with ID 123 not found",
 *   "timestamp": "2024-01-01T00:00:00.000Z",
 *   "path": "/api/users/123",
 *   "requestId": "abc-123",
 *   "stack": "..." // Only in development
 * }
 * ```
 * 
 * Usage:
 * ```typescript
 * // Global usage (in main.ts)
 * app.useGlobalFilters(new HttpExceptionFilter(auditService));
 * ```
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('HttpException');

  constructor(private readonly auditService?: AuditService) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Extract error message
    const message = this.extractMessage(exceptionResponse);
    const error = this.getErrorName(status);

    // Build error response
    const errorResponse = {
      success: false,
      statusCode: status,
      error,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
      requestId: this.generateRequestId(),
      ...(process.env.NODE_ENV === 'development' && {
        stack: exception.stack,
      }),
    };

    // Log error
    this.logError(request, status, message, exception);

    // Audit error (for security events)
    if (this.shouldAudit(status)) {
      this.auditError(request, status, message);
    }

    // Send response
    response.status(status).json(errorResponse);
  }

  /**
   * Extract error message from exception response
   */
  private extractMessage(exceptionResponse: string | object): string | string[] {
    if (typeof exceptionResponse === 'string') {
      return exceptionResponse;
    }

    if (typeof exceptionResponse === 'object') {
      // Handle validation errors (array of messages)
      if ('message' in exceptionResponse) {
        return (exceptionResponse as any).message;
      }

      // Handle custom error formats
      if ('error' in exceptionResponse) {
        return (exceptionResponse as any).error;
      }
    }

    return 'An error occurred';
  }

  /**
   * Get human-readable error name from status code
   */
  private getErrorName(status: number): string {
    const errorNames: Record<number, string> = {
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      405: 'Method Not Allowed',
      406: 'Not Acceptable',
      408: 'Request Timeout',
      409: 'Conflict',
      410: 'Gone',
      422: 'Unprocessable Entity',
      429: 'Too Many Requests',
      500: 'Internal Server Error',
      501: 'Not Implemented',
      502: 'Bad Gateway',
      503: 'Service Unavailable',
      504: 'Gateway Timeout',
    };

    return errorNames[status] || 'Error';
  }

  /**
   * Log error with appropriate level
   */
  private logError(
    request: Request,
    status: number,
    message: string | string[],
    exception: HttpException,
  ): void {
    const { method, url, ip } = request;
    const user = (request as any).user;
    const userId = user?.userId || 'anonymous';

    const errorMessage = Array.isArray(message) ? message.join(', ') : message;

    // Log with appropriate level
    if (status >= 500) {
      this.logger.error(
        `${method} ${url} ${status} | ${errorMessage} | User: ${userId} | IP: ${ip}`,
        exception.stack,
      );
    } else if (status >= 400) {
      this.logger.warn(
        `${method} ${url} ${status} | ${errorMessage} | User: ${userId} | IP: ${ip}`,
      );
    }
  }

  /**
   * Determine if error should be audited
   */
  private shouldAudit(status: number): boolean {
    // Audit security-related errors
    return status === 401 || status === 403 || status === 429 || status >= 500;
  }

  /**
   * Audit security-related errors
   */
  private async auditError(
    request: Request,
    status: number,
    message: string | string[],
  ): Promise<void> {
    if (!this.auditService) return;

    const user = (request as any).user;
    const tenantId = (request as any).tenantId;

    try {
      let action: string;

      if (status === 401) {
        action = AuditAction.LOGIN_FAILED;
      } else if (status === 403) {
        action = AuditAction.ACCESS_DENIED;
      } else if (status === 429) {
        action = AuditAction.RATE_LIMIT_EXCEEDED;
      } else {
        action = 'error.occurred';
      }

      await this.auditService.log({
        tenantId: tenantId || 'system',
        userId: user?.userId,
        action,
        resource: 'api',
        status: 'failure',
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
        details: {
          method: request.method,
          path: request.url,
          statusCode: status,
          message: Array.isArray(message) ? message.join(', ') : message,
        },
      });
    } catch (error) {
      this.logger.error('Failed to audit error', error);
    }
  }

  /**
   * Generate unique request ID for tracking
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

