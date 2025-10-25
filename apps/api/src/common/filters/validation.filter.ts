import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * ValidationExceptionFilter - Handles DTO validation errors
 * 
 * This filter catches validation errors from class-validator and
 * formats them into a user-friendly response with detailed field errors.
 * 
 * Features:
 * - Field-specific error messages
 * - Multiple errors per field
 * - Nested object validation support
 * - Array validation support
 * - Sanitized error messages
 * 
 * Error Response Format:
 * ```json
 * {
 *   "success": false,
 *   "statusCode": 400,
 *   "error": "Validation Error",
 *   "message": "Validation failed",
 *   "errors": {
 *     "email": [
 *       "email must be a valid email address",
 *       "email should not be empty"
 *     ],
 *     "password": [
 *       "password must be longer than or equal to 8 characters"
 *     ]
 *   },
 *   "timestamp": "2024-01-01T00:00:00.000Z",
 *   "path": "/api/auth/signup"
 * }
 * ```
 * 
 * Usage:
 * ```typescript
 * // Global usage (in main.ts)
 * app.useGlobalFilters(new ValidationExceptionFilter());
 * 
 * // With global validation pipe
 * app.useGlobalPipes(
 *   new ValidationPipe({
 *     whitelist: true,
 *     forbidNonWhitelisted: true,
 *     transform: true,
 *     exceptionFactory: (errors) => new BadRequestException(errors),
 *   }),
 * );
 * ```
 */
@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ValidationException');

  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception.getStatus();
    const exceptionResponse: any = exception.getResponse();

    // Check if this is a validation error
    const isValidationError = this.isValidationError(exceptionResponse);

    if (!isValidationError) {
      // If not a validation error, pass through as regular error
      response.status(status).json({
        success: false,
        statusCode: status,
        error: 'Bad Request',
        message: exceptionResponse.message || exceptionResponse,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
      return;
    }

    // Extract and format validation errors
    const validationErrors = this.formatValidationErrors(exceptionResponse.message);

    // Log validation error
    this.logValidationError(request, validationErrors);

    // Build error response
    const errorResponse = {
      success: false,
      statusCode: status,
      error: 'Validation Error',
      message: 'Validation failed. Please check the provided data.',
      errors: validationErrors,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(errorResponse);
  }

  /**
   * Check if the exception is a validation error
   */
  private isValidationError(exceptionResponse: any): boolean {
    return (
      exceptionResponse &&
      typeof exceptionResponse === 'object' &&
      Array.isArray(exceptionResponse.message) &&
      exceptionResponse.message.length > 0 &&
      typeof exceptionResponse.message[0] === 'object' &&
      'property' in exceptionResponse.message[0]
    );
  }

  /**
   * Format validation errors into a user-friendly structure
   */
  private formatValidationErrors(errors: any[]): Record<string, string[]> {
    const formattedErrors: Record<string, string[]> = {};

    if (!Array.isArray(errors)) {
      return formattedErrors;
    }

    for (const error of errors) {
      if (typeof error === 'object' && 'property' in error) {
        const { property, constraints, children } = error;

        // Handle top-level property errors
        if (constraints) {
          formattedErrors[property] = Object.values(constraints);
        }

        // Handle nested object errors
        if (children && Array.isArray(children) && children.length > 0) {
          const nestedErrors = this.formatNestedErrors(property, children);
          Object.assign(formattedErrors, nestedErrors);
        }
      }
    }

    return formattedErrors;
  }

  /**
   * Format nested validation errors (for nested objects/arrays)
   */
  private formatNestedErrors(
    parentProperty: string,
    children: any[],
  ): Record<string, string[]> {
    const nestedErrors: Record<string, string[]> = {};

    for (const child of children) {
      const { property, constraints, children: grandChildren } = child;
      const fullProperty = `${parentProperty}.${property}`;

      if (constraints) {
        nestedErrors[fullProperty] = Object.values(constraints);
      }

      if (grandChildren && Array.isArray(grandChildren) && grandChildren.length > 0) {
        const deeperErrors = this.formatNestedErrors(fullProperty, grandChildren);
        Object.assign(nestedErrors, deeperErrors);
      }
    }

    return nestedErrors;
  }

  /**
   * Log validation errors
   */
  private logValidationError(
    request: Request,
    errors: Record<string, string[]>,
  ): void {
    const { method, url, ip } = request;
    const user = (request as any).user;
    const userId = user?.userId || 'anonymous';

    const errorFields = Object.keys(errors).join(', ');
    const errorCount = Object.keys(errors).length;

    this.logger.warn(
      `${method} ${url} 400 | Validation failed on ${errorCount} field(s): ${errorFields} | User: ${userId} | IP: ${ip}`,
    );

    // Log detailed errors in debug mode
    if (process.env.NODE_ENV === 'development') {
      this.logger.debug(`Validation errors: ${JSON.stringify(errors, null, 2)}`);
    }
  }
}

