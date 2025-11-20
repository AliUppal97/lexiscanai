import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CacheService } from '../../services/cache.service';
import { AbacService, AbacContext } from './abac.service';

export interface PermissionCondition {
  attribute: string;
  operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'greater_than' | 'less_than';
  value: any;
}

export interface HierarchicalPermission {
  pattern: string; // e.g., "documents.*", "documents.read.*"
  permissions: string[]; // e.g., ["documents.read.own", "documents.read.team", "documents.read.all"]
}

@Injectable()
export class EnhancedPermissionsService {
  private readonly logger = new Logger(EnhancedPermissionsService.name);
  private readonly cachePrefix = 'permissions:';
  private readonly cacheTtl = 300; // 5 minutes

  constructor(
    private prisma: PrismaService,
    private cacheService: CacheService,
    private abacService: AbacService,
  ) {}

  /**
   * Check if user has permission with hierarchical and conditional support
   */
  async checkPermission(
    userId: string,
    tenantId: string,
    permission: string,
    context?: {
      resource?: any;
      action?: string;
      environment?: any;
    },
  ): Promise<boolean> {
    // Try cache first
    const cacheKey = `${this.cachePrefix}${userId}:${tenantId}:${permission}`;
    const cached = await this.cacheService.get<boolean>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    // Get user with roles and permissions
    const user = await this.prisma.user.findUnique({
      where: { id: userId, tenantId, isActive: true, isDeleted: false },
      include: {
        userRoles: {
          where: {
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: new Date() } },
            ],
          },
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return false;
    }

    // Collect all permissions from roles
    const userPermissions = new Set<string>();
    const roles: string[] = [];

    for (const userRole of user.userRoles) {
      roles.push(userRole.role.name);
      for (const rolePermission of userRole.role.rolePermissions) {
        userPermissions.add(rolePermission.permission.name);
      }
    }

    // Check hierarchical permissions
    const hasPermission = this.checkHierarchicalPermission(userPermissions, permission);

    // If hierarchical check passes, check ABAC policies if context provided
    if (hasPermission && context?.resource) {
      const abacContext: AbacContext = {
        user: {
          id: user.id,
          tenantId: user.tenantId,
          email: user.email,
          roles,
          permissions: Array.from(userPermissions),
        },
        resource: {
          id: context.resource.id,
          tenantId: context.resource.tenantId,
          type: context.resource.type || 'unknown',
          attributes: context.resource.attributes || {},
        },
        action: context.action || permission.split('.')[1] || 'read',
        environment: context.environment,
      };

      const abacResult = await this.abacService.evaluateAccess(abacContext);
      if (!abacResult.allowed) {
        // Cache negative result for shorter time
        await this.cacheService.set(cacheKey, false, 60);
        return false;
      }
    }

    // Cache result
    await this.cacheService.set(cacheKey, hasPermission, this.cacheTtl);

    return hasPermission;
  }

  /**
   * Check hierarchical permissions
   * Supports patterns like:
   * - documents.* (all document permissions)
   * - documents.read.* (all read permissions)
   * - documents.read.own (specific permission)
   */
  private checkHierarchicalPermission(userPermissions: Set<string>, requiredPermission: string): boolean {
    // Exact match
    if (userPermissions.has(requiredPermission)) {
      return true;
    }

    // Check for wildcard permissions
    const parts = requiredPermission.split('.');

    // Check each level of hierarchy
    for (let i = parts.length; i > 0; i--) {
      const pattern = parts.slice(0, i).join('.') + '.*';
      if (userPermissions.has(pattern)) {
        return true;
      }
    }

    // Check for admin permissions
    if (userPermissions.has('*') || userPermissions.has('admin.*') || userPermissions.has('admin.all')) {
      return true;
    }

    return false;
  }

  /**
   * Get all permissions for user (with hierarchy expansion)
   */
  async getUserPermissions(userId: string, tenantId: string): Promise<string[]> {
    const cacheKey = `${this.cachePrefix}list:${userId}:${tenantId}`;
    const cached = await this.cacheService.get<string[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId, tenantId, isActive: true, isDeleted: false },
      include: {
        userRoles: {
          where: {
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: new Date() } },
            ],
          },
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return [];
    }

    const permissions = new Set<string>();

    for (const userRole of user.userRoles) {
      for (const rolePermission of userRole.role.rolePermissions) {
        permissions.add(rolePermission.permission.name);
      }
    }

    const permissionList = Array.from(permissions);

    // Cache result
    await this.cacheService.set(cacheKey, permissionList, this.cacheTtl);

    return permissionList;
  }

  /**
   * Check multiple permissions (OR logic - user needs ANY)
   */
  async checkAnyPermission(
    userId: string,
    tenantId: string,
    permissions: string[],
    context?: {
      resource?: any;
      action?: string;
      environment?: any;
    },
  ): Promise<boolean> {
    for (const permission of permissions) {
      if (await this.checkPermission(userId, tenantId, permission, context)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check multiple permissions (AND logic - user needs ALL)
   */
  async checkAllPermissions(
    userId: string,
    tenantId: string,
    permissions: string[],
    context?: {
      resource?: any;
      action?: string;
      environment?: any;
    },
  ): Promise<boolean> {
    for (const permission of permissions) {
      if (!(await this.checkPermission(userId, tenantId, permission, context))) {
        return false;
      }
    }
    return true;
  }

  /**
   * Invalidate permission cache for user
   */
  async invalidateUserCache(userId: string, tenantId: string): Promise<void> {
    const patterns = [
      `${this.cachePrefix}${userId}:${tenantId}:*`,
      `${this.cachePrefix}list:${userId}:${tenantId}`,
    ];

    // Note: Redis pattern deletion requires SCAN + DEL in production
    // For now, we'll rely on TTL expiration
    this.logger.log(`Permission cache invalidation requested for user ${userId}`);
  }
}

