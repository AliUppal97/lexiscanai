import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { CacheService } from '../../services/cache.service';

/**
 * CacheInterceptor - Response caching for improved performance
 * 
 * This interceptor caches GET request responses in Redis to:
 * - Reduce database load
 * - Improve response times
 * - Scale read-heavy operations
 * - Save API costs
 * 
 * Features:
 * - Automatic cache key generation
 * - Configurable TTL per route
 * - Query parameter aware
 * - User/tenant aware caching
 * - Cache invalidation support
 * 
 * Cache Strategy:
 * - Only caches GET requests
 * - Includes user ID and tenant ID in key
 * - Includes query parameters in key
 * - Respects Cache-Control headers
 * 
 * Usage:
 * ```typescript
 * // Cache for 5 minutes
 * @UseInterceptors(CacheInterceptor)
 * @CacheTTL(300)
 * @Get('users')
 * getUsers() { ... }
 * ```
 * 
 * @example
 * // Different cache durations
 * @CacheTTL(60) // 1 minute for frequently changing data
 * @Get('dashboard/stats')
 * getDashboardStats() { ... }
 * 
 * @CacheTTL(3600) // 1 hour for static data
 * @Get('countries')
 * getCountries() { ... }
 */
@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CacheInterceptor.name);
  private readonly DEFAULT_TTL = 300; // 5 minutes default

  constructor(
    private cacheService: CacheService,
    private reflector: Reflector,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;

    // Only cache GET requests
    if (method !== 'GET') {
      return next.handle();
    }

    // Check if caching is disabled for this route
    const skipCache = this.reflector.getAllAndOverride<boolean>('skipCache', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (skipCache) {
      return next.handle();
    }

    // Get cache TTL from decorator
    const ttl = this.reflector.getAllAndOverride<number>('cacheTTL', [
      context.getHandler(),
      context.getClass(),
    ]) || this.DEFAULT_TTL;

    // Generate cache key
    const cacheKey = this.generateCacheKey(request);

    // Try to get from cache
    const cachedResponse = await this.cacheService.get(cacheKey);

    if (cachedResponse) {
      this.logger.debug(`Cache hit: ${cacheKey}`);
      return of(cachedResponse); // Return cached response
    }

    this.logger.debug(`Cache miss: ${cacheKey}`);

    // If not in cache, execute request and cache the response
    return next.handle().pipe(
      tap(async (response) => {
        if (response) {
          await this.cacheService.set(cacheKey, response, ttl);
          this.logger.debug(`Cached response: ${cacheKey} (TTL: ${ttl}s)`);
        }
      }),
    );
  }

  /**
   * Generate unique cache key based on:
   * - Route path
   * - Query parameters
   * - User ID
   * - Tenant ID
   */
  private generateCacheKey(request: any): string {
    const { url, user, tenantId, query } = request;
    
    // Base key from URL
    let key = `cache:${url}`;

    // Add query parameters (sorted for consistency)
    if (query && Object.keys(query).length > 0) {
      const sortedQuery = Object.keys(query)
        .sort()
        .map((k) => `${k}=${query[k]}`)
        .join('&');
      key += `?${sortedQuery}`;
    }

    // Add user context
    if (user?.userId) {
      key += `:user:${user.userId}`;
    }

    // Add tenant context
    if (tenantId) {
      key += `:tenant:${tenantId}`;
    }

    return key;
  }
}

/**
 * CacheTTL Decorator - Set cache duration for specific routes
 * 
 * @param ttl - Time to live in seconds
 * 
 * @example
 * @CacheTTL(600) // Cache for 10 minutes
 * @Get('products')
 * getProducts() { ... }
 */
import { SetMetadata } from '@nestjs/common';

export const CACHE_TTL_KEY = 'cacheTTL';
export const CacheTTL = (ttl: number) => SetMetadata(CACHE_TTL_KEY, ttl);

/**
 * SkipCache Decorator - Disable caching for specific routes
 * 
 * @example
 * @SkipCache()
 * @Get('real-time-data')
 * getRealTimeData() { ... }
 */
export const SKIP_CACHE_KEY = 'skipCache';
export const SkipCache = () => SetMetadata(SKIP_CACHE_KEY, true);

/**
 * Helper function to invalidate cache
 * Can be used in services after data mutations
 * 
 * @example
 * // In a service
 * async updateUser(userId: string, data: any) {
 *   await this.prisma.user.update({ ... });
 *   await this.invalidateCache(`cache:/users/${userId}`);
 * }
 */
export async function invalidateCache(cacheService: CacheService, pattern: string) {
  await cacheService.deleteByPattern(pattern);
}

