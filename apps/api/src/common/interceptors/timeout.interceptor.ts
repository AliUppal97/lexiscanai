import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  RequestTimeoutException,
} from '@nestjs/common';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';

/**
 * TimeoutInterceptor - Prevents long-running requests
 * 
 * This interceptor automatically cancels requests that take too long,
 * preventing resource exhaustion and improving user experience.
 * 
 * Features:
 * - Configurable timeout per route
 * - Default timeout for all routes
 * - Graceful timeout handling
 * - Custom timeout messages
 * 
 * Benefits:
 * - Prevents hanging requests
 * - Frees up server resources
 * - Better error handling
 * - Improved user experience
 * 
 * Usage:
 * ```typescript
 * // Global usage with default timeout (in main.ts)
 * app.useGlobalInterceptors(new TimeoutInterceptor(new Reflector()));
 * 
 * // Custom timeout for specific route
 * @Timeout(60000) // 60 seconds
 * @Post('long-operation')
 * performLongOperation() { ... }
 * ```
 * 
 * @example
 * // Different timeouts for different routes
 * @Controller('operations')
 * export class OperationsController {
 *   @Timeout(5000) // 5 seconds
 *   @Get('quick')
 *   quickOperation() { ... }
 * 
 *   @Timeout(120000) // 2 minutes
 *   @Post('heavy')
 *   heavyOperation() { ... }
 * }
 */
@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  private readonly DEFAULT_TIMEOUT = 30000; // 30 seconds default

  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Get custom timeout from decorator or use default
    const customTimeout = this.reflector.getAllAndOverride<number>('timeout', [
      context.getHandler(),
      context.getClass(),
    ]);

    const timeoutMs = customTimeout || this.DEFAULT_TIMEOUT;

    return next.handle().pipe(
      timeout(timeoutMs),
      catchError((err) => {
        if (err instanceof TimeoutError) {
          return throwError(
            () =>
              new RequestTimeoutException(
                `Request timeout after ${timeoutMs}ms. The operation took too long to complete.`,
              ),
          );
        }
        return throwError(() => err);
      }),
    );
  }
}

/**
 * Timeout Decorator - Set custom timeout for specific routes
 * 
 * @param ms - Timeout duration in milliseconds
 * 
 * @example
 * @Timeout(60000) // 60 seconds
 * @Post('upload')
 * uploadFile() { ... }
 */
import { SetMetadata } from '@nestjs/common';

export const TIMEOUT_KEY = 'timeout';
export const Timeout = (ms: number) => SetMetadata(TIMEOUT_KEY, ms);

/**
 * No timeout for specific routes (use with caution)
 * 
 * @example
 * @NoTimeout()
 * @Post('webhook-receiver')
 * receiveWebhook() { ... }
 */
export const NO_TIMEOUT_KEY = 'noTimeout';
export const NoTimeout = () => SetMetadata(NO_TIMEOUT_KEY, true);

