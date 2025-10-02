import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { User, Tenant, Session, Role, Permission } from '@prisma/client';

export interface LoginCredentials {
  email: string;
  password: string;
  tenantSlug: string;
}

export interface AuthResult {
  user: User;
  tenant: Tenant;
  accessToken: string;
  refreshToken: string;
  session: Session;
}

export interface TokenPayload {
  sub: string; // user ID
  email: string;
  tenantId: string;
  tenantSlug: string;
  roles: string[];
  permissions: string[];
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  sub: string; // session ID
  userId: string;
  tenantId: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(credentials: LoginCredentials): Promise<AuthResult> {
    const { email, password, tenantSlug } = credentials;

    // Find tenant
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug: tenantSlug, isActive: true, isDeleted: false },
    });

    if (!tenant) {
      throw new UnauthorizedException('Invalid tenant');
    }

    // Set tenant context for RLS
    await this.prisma.$executeRaw`SELECT set_current_tenant(${tenant.id})`;

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { 
        email_tenantId: { email, tenantId: tenant.id },
        isActive: true,
        isDeleted: false,
      },
      include: {
        userRoles: {
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
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    if (!user.passwordHash || !await bcrypt.compare(password, user.passwordHash)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user has any active roles
    const activeRoles = user.userRoles.filter(ur => 
      !ur.expiresAt || ur.expiresAt > new Date()
    );

    if (activeRoles.length === 0) {
      throw new ForbiddenException('No active roles assigned');
    }

    // Generate tokens
    const session = await this.createSession(user.id, tenant.id);
    const accessToken = await this.generateAccessToken(user, tenant, activeRoles);
    const refreshToken = await this.generateRefreshToken(session);

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Log authentication
    await this.logAuditEvent({
      tenantId: tenant.id,
      userId: user.id,
      action: 'user.login',
      resource: 'user',
      resourceId: user.id,
      sessionId: session.id,
    });

    return {
      user,
      tenant,
      accessToken,
      refreshToken,
      session,
    };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const tokenHash = this.hashToken(refreshToken);
    
    const session = await this.prisma.session.findUnique({
      where: { refreshTokenHash: tokenHash },
      include: {
        user: {
          include: {
            userRoles: {
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
        },
        tenant: true,
      },
    });

    if (!session || !session.isActive || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Set tenant context
    await this.prisma.$executeRaw`SELECT set_current_tenant(${session.tenantId})`;

    // Check if user is still active
    if (!session.user.isActive || session.user.isDeleted) {
      await this.revokeSession(session.id);
      throw new UnauthorizedException('User account is inactive');
    }

    // Generate new tokens
    const activeRoles = session.user.userRoles.filter(ur => 
      !ur.expiresAt || ur.expiresAt > new Date()
    );

    const accessToken = await this.generateAccessToken(session.user, session.tenant, activeRoles);
    const newRefreshToken = await this.generateRefreshToken(session);

    // Update session
    await this.prisma.session.update({
      where: { id: session.id },
      data: { 
        lastUsedAt: new Date(),
        refreshToken: this.hashToken(newRefreshToken),
        refreshTokenHash: this.hashToken(newRefreshToken),
      },
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(sessionId: string): Promise<void> {
    await this.revokeSession(sessionId);
  }

  async logoutAll(userId: string, tenantId: string): Promise<void> {
    await this.prisma.$executeRaw`SELECT revoke_user_sessions(${userId}, ${tenantId})`;
  }

  async validateUser(payload: TokenPayload): Promise<User | null> {
    // Set tenant context
    await this.prisma.$executeRaw`SELECT set_current_tenant(${payload.tenantId})`;

    const user = await this.prisma.user.findUnique({
      where: { 
        id: payload.sub,
        isActive: true,
        isDeleted: false,
      },
    });

    return user;
  }

  async checkPermission(userId: string, permission: string): Promise<boolean> {
    const result = await this.prisma.$queryRaw<[{user_has_permission: boolean}]>`
      SELECT user_has_permission(${userId}, ${permission}) as user_has_permission
    `;
    
    return result[0]?.user_has_permission || false;
  }

  async getUserPermissions(userId: string, tenantId: string): Promise<string[]> {
    await this.prisma.$executeRaw`SELECT set_current_tenant(${tenantId})`;

    const permissions = await this.prisma.permission.findMany({
      where: {
        tenantId,
        isActive: true,
        rolePermissions: {
          some: {
            role: {
              userRoles: {
                some: {
                  userId,
                  expiresAt: null,
                },
              },
            },
          },
        },
      },
      select: { name: true },
    });

    return permissions.map(p => p.name);
  }

  private async createSession(userId: string, tenantId: string): Promise<Session> {
    const refreshToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(refreshToken);
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    return await this.prisma.session.create({
      data: {
        userId,
        tenantId,
        refreshToken: tokenHash,
        refreshTokenHash: tokenHash,
        expiresAt,
      },
    });
  }

  private async generateAccessToken(
    user: User, 
    tenant: Tenant, 
    userRoles: any[]
  ): Promise<string> {
    const permissions = userRoles.flatMap(ur => 
      ur.role.rolePermissions.map(rp => rp.permission.name)
    );

    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      tenantId: tenant.id,
      tenantSlug: tenant.slug,
      roles: userRoles.map(ur => ur.role.name),
      permissions: [...new Set(permissions)], // Remove duplicates
    };

    return this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_EXPIRES_IN', '15m'),
    });
  }

  private async generateRefreshToken(session: Session): Promise<string> {
    const payload: RefreshTokenPayload = {
      sub: session.id,
      userId: session.userId,
      tenantId: session.tenantId,
    };

    return this.jwtService.sign(payload, {
      expiresIn: '30d',
    });
  }

  private async revokeSession(sessionId: string): Promise<void> {
    await this.prisma.session.update({
      where: { id: sessionId },
      data: { 
        isActive: false,
        revokedAt: new Date(),
      },
    });
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private async logAuditEvent(data: {
    tenantId: string;
    userId?: string;
    action: string;
    resource: string;
    resourceId?: string;
    sessionId?: string;
    details?: any;
  }): Promise<void> {
    await this.prisma.$executeRaw`
      SELECT create_audit_log(
        ${data.tenantId},
        ${data.userId || null},
        ${data.action},
        ${data.resource},
        ${data.resourceId || null},
        ${data.details ? JSON.stringify(data.details) : null},
        null,
        null,
        ${data.sessionId || null}
      )
    `;
  }
}

