import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * TenantGuard - Enforces multi-tenant data isolation
 * 
 * This guard ensures that users can only access data belonging to their tenant.
 * It extracts the tenantId from the request and verifies the user has access.
 * 
 * Features:
 * - Extracts tenantId from multiple sources (params, body, query, headers)
 * - Validates user belongs to the tenant
 * - Prevents cross-tenant data access
 * - Supports tenant switching for admins
 * 
 * Tenant ID Sources (in order of priority):
 * 1. Route parameter: /organizations/:tenantId/...
 * 2. Request body: { tenantId: '...' }
 * 3. Query parameter: ?tenantId=...
 * 4. Custom header: X-Tenant-ID
 * 5. User's default tenant
 * 
 * Usage:
 * ```typescript
 * @UseGuards(JwtAuthGuard, TenantGuard)
 * @Get('organizations/:tenantId/documents')
 * getDocuments(@Param('tenantId') tenantId: string) { ... }
 * ```
 */
@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Check if user exists
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Extract tenant ID from multiple sources
    const tenantId = this.extractTenantId(request);

    if (!tenantId) {
      throw new BadRequestException(
        'Tenant ID is required. Provide it via URL parameter, body, query, or header.',
      );
    }

    // Verify user has access to this tenant
    const hasAccess = await this.verifyTenantAccess(user, tenantId);

    if (!hasAccess) {
      throw new ForbiddenException(
        `Access denied. User does not have access to tenant: ${tenantId}`,
      );
    }

    // Attach tenant ID to request for downstream use
    request.tenantId = tenantId;

    return true;
  }

  /**
   * Extract tenant ID from various request sources
   * Priority: params > body > query > headers > user.tenantId
   */
  private extractTenantId(request: any): string | null {
    // 1. Check route parameters (highest priority)
    if (request.params?.tenantId) {
      return request.params.tenantId;
    }

    if (request.params?.organizationId) {
      return request.params.organizationId; // Support both naming conventions
    }

    // 2. Check request body
    if (request.body?.tenantId) {
      return request.body.tenantId;
    }

    // 3. Check query parameters
    if (request.query?.tenantId) {
      return request.query.tenantId;
    }

    // 4. Check custom header
    if (request.headers['x-tenant-id']) {
      return request.headers['x-tenant-id'];
    }

    // 5. Use user's default tenant (from JWT)
    if (request.user?.tenantId) {
      return request.user.tenantId;
    }

    return null;
  }

  /**
   * Verify if user has access to the specified tenant
   * 
   * In production, this should query the database to check
   * if the user is a member of the organization/tenant.
   * 
   * @param user - Authenticated user object
   * @param tenantId - Tenant ID to verify access
   */
  private async verifyTenantAccess(user: any, tenantId: string): Promise<boolean> {
    // Super admin bypass (if your system has super admins)
    if (user.role === 'super_admin') {
      return true;
    }

    // Check if user's default tenant matches
    if (user.tenantId === tenantId) {
      return true;
    }

    // In production, query database to check organization membership:
    // const membership = await this.prisma.organizationMember.findFirst({
    //   where: {
    //     userId: user.userId,
    //     organizationId: tenantId,
    //     isActive: true,
    //   },
    // });
    // return !!membership;

    // For now, allow if tenantId matches user's tenant
    // In production, implement proper organization membership check
    return user.tenantId === tenantId || user.organizationIds?.includes(tenantId);
  }
}

/**
 * Optional: Decorator to skip tenant validation for specific routes
 * 
 * Usage:
 * @SkipTenantCheck()
 * @Get('public-data')
 * getPublicData() { ... }
 */
import { SetMetadata } from '@nestjs/common';

export const SKIP_TENANT_CHECK = 'skipTenantCheck';
export const SkipTenantCheck = () => SetMetadata(SKIP_TENANT_CHECK, true);

