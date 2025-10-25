import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsService } from '../../modules/roles/permissions.service';

/**
 * PermissionsGuard - Enforces granular permission-based access control
 * 
 * This guard checks if the authenticated user has specific permissions
 * to perform an action. Permissions are more granular than roles.
 * 
 * Features:
 * - Supports multiple permissions (OR logic)
 * - Checks against user's role permissions
 * - Supports wildcard permissions (*)
 * - Integrates with multi-tenancy
 * 
 * Usage:
 * ```typescript
 * @UseGuards(JwtAuthGuard, PermissionsGuard)
 * @RequirePermissions('documents:delete')
 * @Delete(':id')
 * deleteDocument() { ... }
 * ```
 * 
 * @example
 * // Multiple permissions (user needs ANY of these)
 * @RequirePermissions('documents:update', 'documents:admin')
 * @Put(':id')
 * updateDocument() { ... }
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionsService: PermissionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get required permissions from decorator metadata
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>('permissions', [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no permissions are required, allow access
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const tenantId = request.tenantId;

    // Check if user exists
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Check if tenant context exists (for multi-tenant routes)
    if (!tenantId) {
      throw new ForbiddenException('Tenant context not found');
    }

    // Check each required permission
    for (const permission of requiredPermissions) {
      const hasPermission = await this.permissionsService.checkPermission(
        user.userId,
        tenantId,
        permission,
      );

      if (hasPermission) {
        return true; // User has at least one required permission
      }
    }

    // User doesn't have any of the required permissions
    throw new ForbiddenException(
      `Access denied. Required permissions: ${requiredPermissions.join(' OR ')}`,
    );
  }
}

/**
 * RequirePermissions Decorator - Marks routes with required permissions
 * 
 * @param permissions - Array of permission strings that grant access
 */
import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

