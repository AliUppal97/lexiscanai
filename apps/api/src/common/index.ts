/**
 * Common Module - Enterprise Middleware, Guards, Interceptors, Filters & Pipes
 * 
 * This module contains all reusable infrastructure components for the API:
 * - Guards: Access control (roles, permissions, tenant, throttle)
 * - Interceptors: Request/response processing (logging, transform, timeout, cache)
 * - Filters: Error handling (HTTP, Prisma, validation)
 * - Pipes: Data validation and transformation
 * 
 * Usage:
 * ```typescript
 * import { RolesGuard, LoggingInterceptor, HttpExceptionFilter, ValidationPipe } from './common';
 * 
 * // In main.ts - Global setup
 * async function bootstrap() {
 *   const app = await NestFactory.create(AppModule);
 * 
 *   // Global pipes
 *   app.useGlobalPipes(
 *     new ValidationPipe({
 *       whitelist: true,
 *       forbidNonWhitelisted: true,
 *       transform: true,
 *     }),
 *   );
 * 
 *   // Global interceptors
 *   app.useGlobalInterceptors(
 *     new LoggingInterceptor(),
 *     new TransformInterceptor(),
 *     new TimeoutInterceptor(new Reflector()),
 *     new CacheInterceptor(cacheService, new Reflector()),
 *   );
 * 
 *   // Global filters
 *   app.useGlobalFilters(
 *     new HttpExceptionFilter(auditService),
 *     new PrismaExceptionFilter(),
 *     new ValidationExceptionFilter(),
 *   );
 * 
 *   await app.listen(3001);
 * }
 * ```
 */

// Guards
export * from './guards';

// Interceptors
export * from './interceptors';

// Filters
export * from './filters';

// Pipes
export * from './pipes';

// Services
export * from './prisma.service';

