import { Injectable, Logger, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/prisma.service';
import { SecurityService } from './security.service';
import { randomBytes, createHash } from 'crypto';
import * as bcrypt from 'bcryptjs';

export interface CreateSessionDto {
  userId: string;
  tenantId: string;
  deviceInfo?: any;
  ipAddress?: string;
  userAgent?: string;
}

export interface RefreshTokenPayload {
  sub: string; // Session ID
  userId: string;
  tenantId: string;
  type: 'refresh';
  iat: number;
  exp: number;
}

export interface AccessTokenPayload {
  sub: string; // User ID
  email: string;
  tenantId: string;
  tenantSlug: string;
  roles: string[];
  permissions: string[];
  sessionId: string;
  iat: number;
  exp: number;
}

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);
  private readonly accessTokenExpiry: string;
  private readonly refreshTokenExpiry: string;
  private readonly maxSessionsPerUser: number;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private securityService: SecurityService,
  ) {
    this.accessTokenExpiry = this.configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m');
    this.refreshTokenExpiry = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '30d');
    this.maxSessionsPerUser = this.configService.get<number>('MAX_SESSIONS_PER_USER', 10);
  }

  /**
   * Create a new session with refresh token
   */
  async createSession(data: CreateSessionDto): Promise<{ session: any; refreshToken: string; accessToken: string }> {
    const { userId, tenantId, deviceInfo, ipAddress, userAgent } = data;

    // Check max sessions per user
    const activeSessions = await this.prisma.session.count({
      where: {
        userId,
        tenantId,
        isActive: true,
        expiresAt: { gt: new Date() },
        revokedAt: null,
      },
    });

    // If max sessions reached, revoke oldest session
    if (activeSessions >= this.maxSessionsPerUser) {
      const oldestSession = await this.prisma.session.findFirst({
        where: {
          userId,
          tenantId,
          isActive: true,
        },
        orderBy: { lastUsedAt: 'asc' },
      });

      if (oldestSession) {
        await this.revokeSession(oldestSession.id);
      }
    }

    // Generate refresh token
    const rawRefreshToken = this.generateRefreshToken();
    const refreshTokenHash = await this.hashRefreshToken(rawRefreshToken);
    const doubleHash = await bcrypt.hash(refreshTokenHash, 10); // Double hash for extra security

    // Calculate expiry
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    // Create session
    const session = await this.prisma.session.create({
      data: {
        userId,
        tenantId,
        refreshToken: refreshTokenHash,
        refreshTokenHash: doubleHash,
        deviceInfo: deviceInfo || {},
        ipAddress,
        userAgent,
        expiresAt,
        isActive: true,
      },
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

    // Generate tokens
    const accessToken = await this.generateAccessToken(session);
    const refreshTokenJwt = await this.generateRefreshTokenJwt(session.id, userId, tenantId);

    return {
      session,
      refreshToken: refreshTokenJwt, // JWT refresh token
      accessToken,
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string, deviceInfo?: any): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      // Verify refresh token JWT
      const payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET') || this.configService.get<string>('JWT_SECRET'),
      });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      // Find session
      const session = await this.prisma.session.findUnique({
        where: { id: payload.sub },
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

      if (!session || !session.isActive || session.revokedAt || session.expiresAt < new Date()) {
        throw new UnauthorizedException('Session expired or revoked');
      }

      // Verify user is still active
      if (!session.user.isActive || session.user.isDeleted) {
        await this.revokeSession(session.id);
        throw new UnauthorizedException('User account is inactive');
      }

      // Verify tenant is still active
      if (!session.tenant.isActive || session.tenant.isDeleted) {
        throw new UnauthorizedException('Tenant account is inactive');
      }

      // Update session last used
      await this.prisma.session.update({
        where: { id: session.id },
        data: {
          lastUsedAt: new Date(),
          deviceInfo: deviceInfo || session.deviceInfo,
        },
      });

      // Rotate refresh token (security best practice)
      const newRawRefreshToken = this.generateRefreshToken();
      const newRefreshTokenHash = await this.hashRefreshToken(newRawRefreshToken);
      const newDoubleHash = await bcrypt.hash(newRefreshTokenHash, 10);

      await this.prisma.session.update({
        where: { id: session.id },
        data: {
          refreshToken: newRefreshTokenHash,
          refreshTokenHash: newDoubleHash,
        },
      });

      // Generate new tokens
      const newSession = {
        ...session,
        refreshToken: newRefreshTokenHash,
        refreshTokenHash: newDoubleHash,
      };

      const accessToken = await this.generateAccessToken(newSession);
      const newRefreshTokenJwt = await this.generateRefreshTokenJwt(session.id, session.userId, session.tenantId);

      return {
        accessToken,
        refreshToken: newRefreshTokenJwt,
      };
    } catch (error) {
      this.logger.error(`Token refresh failed: ${error.message}`);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Revoke a session
   */
  async revokeSession(sessionId: string): Promise<void> {
    await this.prisma.session.update({
      where: { id: sessionId },
      data: {
        isActive: false,
        revokedAt: new Date(),
      },
    });

    this.logger.log(`Session revoked: ${sessionId}`);
  }

  /**
   * Revoke all sessions for a user
   */
  async revokeAllUserSessions(userId: string, tenantId: string, excludeSessionId?: string): Promise<void> {
    await this.prisma.session.updateMany({
      where: {
        userId,
        tenantId,
        id: excludeSessionId ? { not: excludeSessionId } : undefined,
        isActive: true,
      },
      data: {
        isActive: false,
        revokedAt: new Date(),
      },
    });

    this.logger.log(`All sessions revoked for user: ${userId} (tenant: ${tenantId})`);
  }

  /**
   * Get active sessions for a user
   */
  async getUserSessions(userId: string, tenantId: string): Promise<any[]> {
    return this.prisma.session.findMany({
      where: {
        userId,
        tenantId,
        isActive: true,
        expiresAt: { gt: new Date() },
        revokedAt: null,
      },
      orderBy: { lastUsedAt: 'desc' },
      select: {
        id: true,
        deviceInfo: true,
        ipAddress: true,
        userAgent: true,
        lastUsedAt: true,
        createdAt: true,
      },
    });
  }

  /**
   * Verify session is still valid
   */
  async verifySession(sessionId: string): Promise<boolean> {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) return false;
    if (!session.isActive) return false;
    if (session.revokedAt) return false;
    if (session.expiresAt < new Date()) return false;

    return true;
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(): Promise<number> {
    const result = await this.prisma.session.updateMany({
      where: {
        expiresAt: { lt: new Date() },
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    this.logger.log(`Cleaned up ${result.count} expired sessions`);
    return result.count;
  }

  /**
   * Generate access token
   */
  private async generateAccessToken(session: any): Promise<string> {
    const user = session.user;
    const tenant = session.tenant;

    // Get user roles and permissions
    const roles = user.userRoles
      .filter((ur: any) => !ur.expiresAt || ur.expiresAt > new Date())
      .map((ur: any) => ur.role.name);

    const permissions = new Set<string>();
    user.userRoles.forEach((ur: any) => {
      if (!ur.expiresAt || ur.expiresAt > new Date()) {
        ur.role.rolePermissions.forEach((rp: any) => {
          permissions.add(rp.permission.name);
        });
      }
    });

    const payload: AccessTokenPayload = {
      sub: user.id,
      email: user.email,
      tenantId: tenant.id,
      tenantSlug: tenant.slug,
      roles: Array.from(roles),
      permissions: Array.from(permissions),
      sessionId: session.id,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + this.parseExpiry(this.accessTokenExpiry),
    };

    return this.jwtService.sign(payload);
  }

  /**
   * Generate refresh token JWT
   */
  private async generateRefreshTokenJwt(sessionId: string, userId: string, tenantId: string): Promise<string> {
    const payload: RefreshTokenPayload = {
      sub: sessionId,
      userId,
      tenantId,
      type: 'refresh',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + this.parseExpiry(this.refreshTokenExpiry),
    };

    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET') || this.configService.get<string>('JWT_SECRET'),
    });
  }

  /**
   * Generate raw refresh token
   */
  private generateRefreshToken(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * Hash refresh token
   */
  private async hashRefreshToken(token: string): Promise<string> {
    return createHash('sha256').update(token).digest('hex');
  }

  /**
   * Parse expiry string to seconds
   */
  private parseExpiry(expiry: string): number {
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) return 3600; // Default 1 hour

    const value = parseInt(match[1]);
    const unit = match[2];

    const multipliers: Record<string, number> = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
    };

    return value * (multipliers[unit] || 1);
  }
}
