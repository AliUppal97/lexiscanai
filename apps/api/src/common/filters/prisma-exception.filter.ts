import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';

/**
 * PrismaExceptionFilter - Handles Prisma ORM errors
 * 
 * This filter catches Prisma-specific errors and converts them into
 * user-friendly HTTP exceptions with appropriate status codes.
 * 
 * Handled Error Types:
 * - P2000: Value too long for column
 * - P2001: Record not found
 * - P2002: Unique constraint violation
 * - P2003: Foreign key constraint violation
 * - P2025: Record not found in operation
 * - And many more...
 * 
 * Features:
 * - User-friendly error messages
 * - Appropriate HTTP status codes
 * - Sanitized error details (no internal DB info leaked)
 * - Detailed logging for debugging
 * - Production-safe error responses
 * 
 * Usage:
 * ```typescript
 * // Global usage (in main.ts)
 * app.useGlobalFilters(new PrismaExceptionFilter());
 * ```
 * 
 * @example
 * // When a unique constraint is violated
 * // Prisma error: "Unique constraint failed on the fields: (`email`)"
 * // User sees: "A user with this email already exists"
 */
@Catch(Prisma.PrismaClientKnownRequestError, Prisma.PrismaClientValidationError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('PrismaException');

  catch(exception: Prisma.PrismaClientKnownRequestError | Prisma.PrismaClientValidationError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'An error occurred while processing your request';
    let error = 'Database Error';

    // Handle known Prisma errors
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const result = this.handleKnownError(exception);
      status = result.status;
      message = result.message;
      error = result.error;
    } else if (exception instanceof Prisma.PrismaClientValidationError) {
      const result = this.handleValidationError(exception);
      status = result.status;
      message = result.message;
      error = result.error;
    }

    // Log error
    this.logError(request, status, message, exception);

    // Build error response
    const errorResponse = {
      success: false,
      statusCode: status,
      error,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
      ...(process.env.NODE_ENV === 'development' && {
        details: this.getErrorDetails(exception),
      }),
    };

    response.status(status).json(errorResponse);
  }

  /**
   * Handle Prisma known request errors
   * @see https://www.prisma.io/docs/reference/api-reference/error-reference
   */
  private handleKnownError(exception: Prisma.PrismaClientKnownRequestError): {
    status: number;
    error: string;
    message: string;
  } {
    const { code, meta } = exception;

    switch (code) {
      // Unique constraint violation
      case 'P2002': {
        const fields = (meta?.target as string[]) || [];
        const fieldName = fields[0] || 'field';
        return {
          status: HttpStatus.CONFLICT,
          error: 'Conflict',
          message: `A record with this ${fieldName} already exists`,
        };
      }

      // Foreign key constraint violation
      case 'P2003': {
        return {
          status: HttpStatus.BAD_REQUEST,
          error: 'Bad Request',
          message: 'Related record not found or already in use',
        };
      }

      // Record not found (findUniqueOrThrow, findFirstOrThrow)
      case 'P2025': {
        return {
          status: HttpStatus.NOT_FOUND,
          error: 'Not Found',
          message: 'The requested record was not found',
        };
      }

      // Record not found in delete/update
      case 'P2001': {
        return {
          status: HttpStatus.NOT_FOUND,
          error: 'Not Found',
          message: 'The record does not exist',
        };
      }

      // Value too long for column
      case 'P2000': {
        const column = (meta?.column_name as string) || 'field';
        return {
          status: HttpStatus.BAD_REQUEST,
          error: 'Bad Request',
          message: `The value provided for ${column} is too long`,
        };
      }

      // Null constraint violation
      case 'P2011': {
        const column = (meta?.constraint as string) || 'field';
        return {
          status: HttpStatus.BAD_REQUEST,
          error: 'Bad Request',
          message: `${column} cannot be null`,
        };
      }

      // Required relation violation
      case 'P2014': {
        return {
          status: HttpStatus.BAD_REQUEST,
          error: 'Bad Request',
          message: 'Cannot delete record with dependent records',
        };
      }

      // Related record not found
      case 'P2015': {
        return {
          status: HttpStatus.BAD_REQUEST,
          error: 'Bad Request',
          message: 'Related record not found',
        };
      }

      // Query interpretation error
      case 'P2016': {
        return {
          status: HttpStatus.BAD_REQUEST,
          error: 'Bad Request',
          message: 'Query interpretation error',
        };
      }

      // Connection error
      case 'P1001':
      case 'P1002':
      case 'P1008': {
        return {
          status: HttpStatus.SERVICE_UNAVAILABLE,
          error: 'Service Unavailable',
          message: 'Database connection error. Please try again later.',
        };
      }

      // Timeout
      case 'P2024': {
        return {
          status: HttpStatus.REQUEST_TIMEOUT,
          error: 'Request Timeout',
          message: 'Database operation timed out',
        };
      }

      // Default for unknown Prisma errors
      default: {
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Internal Server Error',
          message: 'An unexpected database error occurred',
        };
      }
    }
  }

  /**
   * Handle Prisma validation errors
   */
  private handleValidationError(exception: Prisma.PrismaClientValidationError): {
    status: number;
    error: string;
    message: string;
  } {
    return {
      status: HttpStatus.BAD_REQUEST,
      error: 'Bad Request',
      message: 'Invalid data provided. Please check your input.',
    };
  }

  /**
   * Get error details for development environment
   */
  private getErrorDetails(exception: any): any {
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return {
        code: exception.code,
        meta: exception.meta,
        message: exception.message,
      };
    }

    return {
      message: exception.message,
    };
  }

  /**
   * Log error with appropriate level
   */
  private logError(
    request: Request,
    status: number,
    message: string,
    exception: any,
  ): void {
    const { method, url, ip } = request;
    const user = (request as any).user;
    const userId = user?.userId || 'anonymous';

    const code = exception instanceof Prisma.PrismaClientKnownRequestError
      ? exception.code
      : 'VALIDATION_ERROR';

    if (status >= 500) {
      this.logger.error(
        `${method} ${url} ${status} | Prisma ${code} | ${message} | User: ${userId} | IP: ${ip}`,
        exception.stack,
      );
    } else {
      this.logger.warn(
        `${method} ${url} ${status} | Prisma ${code} | ${message} | User: ${userId} | IP: ${ip}`,
      );
    }
  }
}

