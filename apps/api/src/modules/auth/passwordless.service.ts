import {
  Injectable,
  Logger,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma.service';
import { SecurityService } from './security.service';
import { SessionService } from './session.service';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';

export interface SendMagicLinkDto {
  email: string;
  tenantSlug?: string;
  redirectUrl?: string;
}

export interface VerifyMagicLinkDto {
  token: string;
  tenantSlug?: string;
}

@Injectable()
export class PasswordlessService {
  private readonly logger = new Logger(PasswordlessService.name);
  private readonly baseUrl: string;
  private readonly tokenExpiry: number; // 15 minutes
  private readonly DEFAULT_TENANT_SLUG = 'default';

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private securityService: SecurityService,
    private sessionService: SessionService,
  ) {
    this.baseUrl = this.configService.get<string>('BASE_URL', 'http://localhost:3000');
    this.tokenExpiry = this.configService.get<number>('MAGIC_LINK_EXPIRY_SECONDS', 15 * 60); // 15 minutes
  }

  /**
   * Send magic link to user email
   */
  async sendMagicLink(dto: SendMagicLinkDto, request?: any): Promise<void> {
    const { email, tenantSlug, redirectUrl } = dto;
    const finalTenantSlug = tenantSlug || this.DEFAULT_TENANT_SLUG;

    // Find tenant
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug: finalTenantSlug, isActive: true, isDeleted: false },
    });

    if (!tenant) {
      // Don't reveal tenant existence (security best practice)
      return;
    }

    // Find user
    const user = await this.prisma.user.findUnique({
      where: {
        email_tenantId: { email, tenantId: tenant.id },
        isActive: true,
        isDeleted: false,
      },
    });

    // Don't reveal user existence (always return success)
    if (!user) {
      return;
    }

    // Generate magic link token
    const token = this.generateToken();
    const tokenHash = await this.hashToken(token);

    // Calculate expiry
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + this.tokenExpiry);

    // Get IP and user agent
    const ipAddress = request ? this.securityService.getClientIp(request) : undefined;
    const userAgent = request?.headers['user-agent'];

    // Invalidate any existing magic link tokens for this user
    await this.prisma.magicLinkToken.updateMany({
      where: {
        email,
        tenantId: tenant.id,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      data: {
        usedAt: new Date(), // Mark as used
      },
    });

    // Create new magic link token
    await this.prisma.magicLinkToken.create({
      data: {
        email,
        tenantId: tenant.id,
        token: token, // Store plain token for lookup (will be hashed in tokenHash)
        tokenHash,
        expiresAt,
        ipAddress,
        userAgent,
      },
    });

    // Build magic link URL
    const finalRedirectUrl = redirectUrl || `${this.baseUrl}/auth/callback`;
    const magicLink = `${this.baseUrl}/auth/passwordless/verify?token=${token}&redirect=${encodeURIComponent(finalRedirectUrl)}`;

    // TODO: Send email via email service
    this.logger.log(`Magic link for ${email}: ${magicLink} (dev only - implement email service)`);

    // In production, send email:
    // await this.emailService.sendMagicLinkEmail(user.email, magicLink);

    // Log security event
    await this.logSecurityEvent({
      action: 'passwordless.link_sent',
      resource: 'user',
      resourceId: user.id,
      tenantId: tenant.id,
      userId: user.id,
      ipAddress,
      userAgent,
    });
  }

  /**
   * Verify magic link token and create session
   */
  async verifyMagicLink(dto: VerifyMagicLinkDto, request?: any): Promise<any> {
    const { token, tenantSlug } = dto;

    if (!token) {
      throw new BadRequestException('Token is required');
    }

    // Hash token for lookup
    const tokenHash = await this.hashToken(token);

    // Find magic link token
    const magicLinkToken = await this.prisma.magicLinkToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: {
        tenant: true,
      },
    });

    if (!magicLinkToken) {
      throw new UnauthorizedException('Invalid or expired magic link token');
    }

    // Verify tenant slug if provided
    if (tenantSlug && magicLinkToken.tenant.slug !== tenantSlug) {
      throw new UnauthorizedException('Invalid tenant');
    }

    // Find user
    const user = await this.prisma.user.findUnique({
      where: {
        email_tenantId: {
          email: magicLinkToken.email,
          tenantId: magicLinkToken.tenantId,
        },
        isActive: true,
        isDeleted: false,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Mark token as used
    await this.prisma.magicLinkToken.update({
      where: { id: magicLinkToken.id },
      data: {
        usedAt: new Date(),
      },
    });

    // Create session
    const deviceInfo = request
      ? {
          ipAddress: this.securityService.getClientIp(request),
          userAgent: request.headers['user-agent'],
        }
      : {};

    const { session, accessToken, refreshToken } = await this.sessionService.createSession({
      userId: user.id,
      tenantId: magicLinkToken.tenantId,
      deviceInfo,
      ipAddress: deviceInfo.ipAddress,
      userAgent: deviceInfo.userAgent,
    });

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Log security event
    await this.logSecurityEvent({
      action: 'passwordless.login',
      resource: 'user',
      resourceId: user.id,
      tenantId: magicLinkToken.tenantId,
      userId: user.id,
      ipAddress: deviceInfo.ipAddress,
      userAgent: deviceInfo.userAgent,
      sessionId: session.id,
    });

    // Clean up expired tokens (async, don't wait)
    this.cleanupExpiredTokens().catch((err) => {
      this.logger.error(`Failed to cleanup expired tokens: ${err.message}`);
    });

    return {
      user,
      tenant: magicLinkToken.tenant,
      accessToken,
      refreshToken,
      session,
    };
  }

  /**
   * Generate secure random token
   */
  private generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Hash token for storage
   */
  private async hashToken(token: string): Promise<string> {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Clean up expired magic link tokens
   */
  private async cleanupExpiredTokens(): Promise<void> {
    const result = await this.prisma.magicLinkToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { usedAt: { not: null } },
        ],
      },
    });

    if (result.count > 0) {
      this.logger.log(`Cleaned up ${result.count} expired magic link tokens`);
    }
  }

  /**
   * Log security event
   */
  private async logSecurityEvent(data: {
    action: string;
    resource: string;
    resourceId?: string;
    details?: any;
    tenantId?: string;
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
  }): Promise<void> {
    try {
      if (data.tenantId) {
        await this.prisma.auditLog.create({
          data: {
            tenantId: data.tenantId,
            userId: data.userId,
            action: data.action,
            resource: data.resource,
            resourceId: data.resourceId,
            details: data.details || {},
            ipAddress: data.ipAddress,
            userAgent: data.userAgent,
            sessionId: data.sessionId,
          },
        });
      }
    } catch (error) {
      this.logger.error(`Failed to log security event: ${error.message}`);
    }
  }
}

