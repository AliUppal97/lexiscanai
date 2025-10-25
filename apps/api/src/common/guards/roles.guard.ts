import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

/**
 * RolesGuard - Enforces role-based access control
 * 
 * This guard checks if the authenticated user has one of the required roles
 * to access a specific route. Roles are defined using the @Roles() decorator.
 * 
 * Usage:
 * ```typescript
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Roles('admin', 'owner')
 * @Get('/sensitive-data')
 * getSensitiveData() { ... }
 * ```
 * 
 * @example
 * // In your controller
 * import { Roles } from './decorators/roles.decorator';
 * 
 * @Controller('users')
 * export class UsersController {
 *   @Roles('admin')
 *   @Get('all')
 *   getAllUsers() { ... }
 * }
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // Get required roles from decorator metadata
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Check if user exists (should be set by AuthGuard)
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Check if user has any of the required roles
    const hasRole = requiredRoles.some((role) => {
      // Support both string role and role object with name property
      const userRole = typeof user.role === 'string' ? user.role : user.role?.name;
      return userRole === role;
    });

    if (!hasRole) {
      throw new ForbiddenException(
        `Access denied. Required roles: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}

/**
 * Roles Decorator - Marks routes with required roles
 * 
 * @param roles - Array of role names that are allowed to access the route
 */
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

