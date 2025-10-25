import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Response structure for all API responses
 */
export interface Response<T> {
  success: boolean;
  statusCode: number;
  message?: string;
  data: T;
  timestamp: string;
  path: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

/**
 * TransformInterceptor - Standardizes all API responses
 * 
 * This interceptor wraps all successful responses in a consistent format,
 * making it easier for frontend clients to handle responses.
 * 
 * Features:
 * - Consistent response structure
 * - Automatic timestamp addition
 * - Request path inclusion
 * - Pagination metadata support
 * - Success/error differentiation
 * 
 * Response Format:
 * ```json
 * {
 *   "success": true,
 *   "statusCode": 200,
 *   "message": "Success",
 *   "data": { ... },
 *   "timestamp": "2024-01-01T00:00:00.000Z",
 *   "path": "/api/users",
 *   "meta": {
 *     "page": 1,
 *     "limit": 20,
 *     "total": 100,
 *     "totalPages": 5
 *   }
 * }
 * ```
 * 
 * Usage:
 * ```typescript
 * // Global usage (in main.ts)
 * app.useGlobalInterceptors(new TransformInterceptor());
 * 
 * // Or per-controller
 * @UseInterceptors(TransformInterceptor)
 * @Controller('users')
 * export class UsersController { ... }
 * ```
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((data) => {
        // If data is already in the correct format, return as-is
        if (data && typeof data === 'object' && 'success' in data && 'statusCode' in data) {
          return data as Response<T>;
        }

        // Extract pagination metadata if present
        const meta = this.extractPaginationMeta(data);

        // Build standardized response
        return {
          success: true,
          statusCode: response.statusCode || 200,
          message: this.getSuccessMessage(request.method),
          data: meta ? this.extractData(data) : data,
          timestamp: new Date().toISOString(),
          path: request.url,
          ...(meta && { meta }),
        };
      }),
    );
  }

  /**
   * Extract pagination metadata from response data
   */
  private extractPaginationMeta(data: any): any {
    if (!data || typeof data !== 'object') {
      return null;
    }

    // Check if data has pagination properties
    if ('total' in data || 'page' in data || 'limit' in data) {
      const { page, limit, total, totalPages } = data;
      return {
        ...(page && { page: Number(page) }),
        ...(limit && { limit: Number(limit) }),
        ...(total !== undefined && { total: Number(total) }),
        ...(totalPages && { totalPages: Number(totalPages) }),
      };
    }

    return null;
  }

  /**
   * Extract actual data when pagination metadata is present
   */
  private extractData(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    // If data has items/results/records property, return that
    if ('items' in data) return data.items;
    if ('results' in data) return data.results;
    if ('records' in data) return data.records;
    if ('data' in data) return data.data;

    // Otherwise, return everything except pagination metadata
    const { page, limit, total, totalPages, ...rest } = data;
    return rest;
  }

  /**
   * Get success message based on HTTP method
   */
  private getSuccessMessage(method: string): string {
    const messages: Record<string, string> = {
      GET: 'Resource retrieved successfully',
      POST: 'Resource created successfully',
      PUT: 'Resource updated successfully',
      PATCH: 'Resource updated successfully',
      DELETE: 'Resource deleted successfully',
    };

    return messages[method] || 'Operation completed successfully';
  }
}

/**
 * Skip transformation for specific routes
 * Useful for routes that need custom response formats
 * 
 * @example
 * @SkipTransform()
 * @Get('raw-data')
 * getRawData() {
 *   return 'plain text response';
 * }
 */
import { SetMetadata } from '@nestjs/common';

export const SKIP_TRANSFORM_KEY = 'skipTransform';
export const SkipTransform = () => SetMetadata(SKIP_TRANSFORM_KEY, true);

