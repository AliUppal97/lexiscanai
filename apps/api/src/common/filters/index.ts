/**
 * Filters Index - Centralized export for all exception filters
 * 
 * Exception filters handle errors thrown during request processing.
 * They catch exceptions and transform them into proper HTTP responses.
 * 
 * Filter Order (recommended):
 * 1. HttpExceptionFilter - Catches all HTTP exceptions
 * 2. PrismaExceptionFilter - Catches Prisma DB errors
 * 3. ValidationExceptionFilter - Catches validation errors
 * 
 * Usage:
 * ```typescript
 * import {
 *   HttpExceptionFilter,
 *   PrismaExceptionFilter,
 *   ValidationExceptionFilter
 * } from './common/filters';
 * 
 * // Global usage in main.ts
 * app.useGlobalFilters(
 *   new HttpExceptionFilter(auditService),
 *   new PrismaExceptionFilter(),
 *   new ValidationExceptionFilter(),
 * );
 * ```
 */

export * from './http-exception.filter';
export * from './prisma-exception.filter';
export * from './validation.filter';

