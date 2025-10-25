/**
 * Guards Index - Centralized export for all guards
 * 
 * Guards are used to determine whether a request will be handled by the route handler.
 * They have access to the ExecutionContext and can return true/false or throw exceptions.
 * 
 * Usage:
 * ```typescript
 * import { RolesGuard, PermissionsGuard, TenantGuard } from './common/guards';
 * 
 * @UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
 * @Roles('admin')
 * @Controller('admin')
 * export class AdminController { ... }
 * ```
 */

export * from './roles.guard';
export * from './permissions.guard';
export * from './tenant.guard';
export * from './throttle.guard';

