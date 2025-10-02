import { Injectable, UnauthorizedException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { AuthService } from './auth.service';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { User, Tenant, Role, Permission } from '@prisma/client';

export interface CreateUserDto {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  roleIds: string[];
  tenantId: string;
}

export interface CreateTenantDto {
  name: string;
  slug: string;
  domain?: string;
  adminEmail: string;
  adminPassword: string;
  adminFirstName?: string;
  adminLastName?: string;
}

export interface AssignRoleDto {
  userId: string;
  roleId: string;
  expiresAt?: Date;
  assignedBy: string;
}

@Injectable()
export class UserManagementService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
  ) {}

  async createTenant(dto: CreateTenantDto): Promise<{ tenant: Tenant; admin: User }> {
    const { name, slug, domain, adminEmail, adminPassword, adminFirstName, adminLastName } = dto;

    // Check if tenant slug is available
    const existingTenant = await this.prisma.tenant.findUnique({
      where: { slug },
    });

    if (existingTenant) {
      throw new ConflictException('Tenant slug already exists');
    }

    // Check if domain is available (if provided)
    if (domain) {
      const existingDomain = await this.prisma.tenant.findUnique({
        where: { domain },
      });

      if (existingDomain) {
        throw new ConflictException('Domain already in use');
      }
    }

    return await this.prisma.$transaction(async (tx) => {
      // Create tenant
      const tenant = await tx.tenant.create({
        data: {
          name,
          slug,
          domain,
        },
      });

      // Set tenant context
      await tx.$executeRaw`SELECT set_current_tenant(${tenant.id})`;

      // Create default permissions and roles
      await tx.$executeRaw`SELECT create_default_permissions(${tenant.id})`;
      await tx.$executeRaw`SELECT create_default_roles(${tenant.id})`;

      // Get admin role
      const adminRole = await tx.role.findFirst({
        where: { name: 'Admin', tenantId: tenant.id },
      });

      if (!adminRole) {
        throw new Error('Failed to create admin role');
      }

      // Create admin user
      const passwordHash = await bcrypt.hash(adminPassword, 12);
      const admin = await tx.user.create({
        data: {
          email: adminEmail,
          passwordHash,
          firstName: adminFirstName,
          lastName: adminLastName,
          isEmailVerified: true,
          emailVerifiedAt: new Date(),
          tenantId: tenant.id,
        },
      });

      // Assign admin role
      await tx.userRole.create({
        data: {
          userId: admin.id,
          roleId: adminRole.id,
          tenantId: tenant.id,
        },
      });

      // Log tenant creation
      await tx.$executeRaw`
        SELECT create_audit_log(
          ${tenant.id},
          ${admin.id},
          'tenant.created',
          'tenant',
          ${tenant.id},
          ${JSON.stringify({ name, slug, domain })},
          null,
          null,
          null
        )
      `;

      return { tenant, admin };
    });
  }

  async createUser(dto: CreateUserDto): Promise<User> {
    const { email, password, firstName, lastName, roleIds, tenantId } = dto;

    // Set tenant context
    await this.prisma.$executeRaw`SELECT set_current_tenant(${tenantId})`;

    // Check if user already exists in tenant
    const existingUser = await this.prisma.user.findUnique({
      where: { email_tenantId: { email, tenantId } },
    });

    if (existingUser) {
      throw new ConflictException('User already exists in this tenant');
    }

    // Verify all roles belong to tenant
    const roles = await this.prisma.role.findMany({
      where: {
        id: { in: roleIds },
        tenantId,
        isActive: true,
      },
    });

    if (roles.length !== roleIds.length) {
      throw new ForbiddenException('One or more roles are invalid');
    }

    return await this.prisma.$transaction(async (tx) => {
      // Create user
      const passwordHash = await bcrypt.hash(password, 12);
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          firstName,
          lastName,
          tenantId,
        },
      });

      // Assign roles
      await tx.userRole.createMany({
        data: roleIds.map(roleId => ({
          userId: user.id,
          roleId,
          tenantId,
        })),
      });

      // Log user creation
      await tx.$executeRaw`
        SELECT create_audit_log(
          ${tenantId},
          null,
          'user.created',
          'user',
          ${user.id},
          ${JSON.stringify({ email, roleIds })},
          null,
          null,
          null
        )
      `;

      return user;
    });
  }

  async assignRole(dto: AssignRoleDto): Promise<void> {
    const { userId, roleId, expiresAt, assignedBy } = dto;

    // Get user and role to determine tenant
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { tenant: true },
    });

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role || role.tenantId !== user.tenantId) {
      throw new ForbiddenException('Invalid role');
    }

    // Set tenant context
    await this.prisma.$executeRaw`SELECT set_current_tenant(${user.tenantId})`;

    // Check if user already has this role
    const existingUserRole = await this.prisma.userRole.findUnique({
      where: { userId_roleId: { userId, roleId } },
    });

    if (existingUserRole) {
      throw new ConflictException('User already has this role');
    }

    await this.prisma.userRole.create({
      data: {
        userId,
        roleId,
        assignedBy,
        expiresAt,
        tenantId: user.tenantId,
      },
    });

    // Log role assignment
    await this.prisma.$executeRaw`
      SELECT create_audit_log(
        ${user.tenantId},
        ${assignedBy},
        'role.assigned',
        'user_role',
        ${userId},
        ${JSON.stringify({ roleId, expiresAt })},
        null,
        null,
        null
      )
    `;
  }

  async revokeRole(userId: string, roleId: string, revokedBy: string): Promise<void> {
    const userRole = await this.prisma.userRole.findUnique({
      where: { userId_roleId: { userId, roleId } },
      include: { user: true },
    });

    if (!userRole) {
      throw new ForbiddenException('User role not found');
    }

    await this.prisma.userRole.delete({
      where: { userId_roleId: { userId, roleId } },
    });

    // Log role revocation
    await this.prisma.$executeRaw`
      SELECT create_audit_log(
        ${userRole.tenantId},
        ${revokedBy},
        'role.revoked',
        'user_role',
        ${userId},
        ${JSON.stringify({ roleId })},
        null,
        null,
        null
      )
    `;
  }

  async getUserWithRoles(userId: string, tenantId: string): Promise<User & { roles: Role[] }> {
    await this.prisma.$executeRaw`SELECT set_current_tenant(${tenantId})`;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: true,
          },
          where: {
            expiresAt: null,
          },
        },
      },
    });

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    return {
      ...user,
      roles: user.userRoles.map(ur => ur.role),
    };
  }

  async getTenantUsers(tenantId: string, page: number = 1, limit: number = 20): Promise<{
    users: User[];
    total: number;
    page: number;
    limit: number;
  }> {
    await this.prisma.$executeRaw`SELECT set_current_tenant(${tenantId})`;

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: { tenantId, isDeleted: false },
        include: {
          userRoles: {
            include: {
              role: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({
        where: { tenantId, isDeleted: false },
      }),
    ]);

    return {
      users,
      total,
      page,
      limit,
    };
  }

  async getTenantRoles(tenantId: string): Promise<Role[]> {
    await this.prisma.$executeRaw`SELECT set_current_tenant(${tenantId})`;

    return await this.prisma.role.findMany({
      where: { tenantId, isActive: true },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async getTenantPermissions(tenantId: string): Promise<Permission[]> {
    await this.prisma.$executeRaw`SELECT set_current_tenant(${tenantId})`;

    return await this.prisma.permission.findMany({
      where: { tenantId, isActive: true },
      orderBy: [{ resource: 'asc' }, { action: 'asc' }],
    });
  }

  async softDeleteUser(userId: string, deletedBy: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    await this.prisma.$transaction(async (tx) => {
      // Soft delete user
      await tx.user.update({
        where: { id: userId },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      });

      // Revoke all sessions
      await tx.$executeRaw`SELECT revoke_user_sessions(${userId}, ${user.tenantId})`;

      // Log deletion
      await tx.$executeRaw`
        SELECT create_audit_log(
          ${user.tenantId},
          ${deletedBy},
          'user.deleted',
          'user',
          ${userId},
          null,
          null,
          null,
          null
        )
      `;
    });
  }
}

