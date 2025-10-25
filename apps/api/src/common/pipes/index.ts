/**
 * Pipes Index - Centralized export for all pipes
 * 
 * Pipes transform and validate input data before it reaches the route handler.
 * They operate on the arguments being processed by the controller method.
 * 
 * Common use cases:
 * - Validation (ValidationPipe)
 * - Transformation (TransformPipe, ParseIntPipe, etc.)
 * - Type conversion
 * - Data sanitization
 * 
 * Usage:
 * ```typescript
 * import {
 *   ValidationPipe,
 *   TransformPipe,
 *   ParseIntPipe,
 *   TrimPipe
 * } from './common/pipes';
 * 
 * // Global validation pipe
 * app.useGlobalPipes(
 *   new ValidationPipe({
 *     whitelist: true,
 *     forbidNonWhitelisted: true,
 *     transform: true,
 *   }),
 * );
 * 
 * // Per-route pipes
 * @Get(':id')
 * getById(@Param('id', ParseIntPipe) id: number) { ... }
 * 
 * @Post()
 * create(@Body(TransformPipe) data: CreateDto) { ... }
 * ```
 */

export * from './validation.pipe';
export * from './transform.pipe';

