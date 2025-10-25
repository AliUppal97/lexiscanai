/**
 * Interceptors Index - Centralized export for all interceptors
 * 
 * Interceptors bind extra logic before/after method execution.
 * They have access to the response/request before and after the route handler.
 * 
 * Usage:
 * ```typescript
 * import {
 *   LoggingInterceptor,
 *   TransformInterceptor,
 *   TimeoutInterceptor,
 *   CacheInterceptor
 * } from './common/interceptors';
 * 
 * // Global usage in main.ts
 * app.useGlobalInterceptors(
 *   new LoggingInterceptor(),
 *   new TransformInterceptor(),
 *   new TimeoutInterceptor(new Reflector()),
 *   new CacheInterceptor(cacheService, new Reflector()),
 * );
 * ```
 */

export * from './logging.interceptor';
export * from './transform.interceptor';
export * from './timeout.interceptor';
export * from './cache.interceptor';

