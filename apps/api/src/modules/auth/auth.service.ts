import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User, Tenant } from '@prisma/client';
import { SecurityService } from './security.service';
import { SessionService } from './session.service';
import { MfaService } from './mfa.service';
import { CacheService } from '../../services/cache.service';

export interface LoginCredentials {
  email: string;
  password: string;
  tenantSlug?: string;
  mfaCode?: string;
  deviceInfo?: any;
}

export interface RegisterInput {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  tenantSlug?: string;
}

export interface AuthResult {
  user: User;
  tenant: Tenant;
  accessToken: string;
  refreshToken: string;
  session: any;
  requiresMfa?: boolean;
}

export interface PasswordResetRequest {
  email: string;
  tenantSlug?: string;
}

export interface PasswordReset {
  token: string;
  newPassword: string;
}

const DEFAULT_TENANT_SLUG = 'default';
const PASSWORD_RESET_TOKEN_EXPIRY = 3600; // 1 hour

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private securityService: SecurityService,
    private sessionService: SessionService,
    private mfaService: MfaService,
    private cacheService: CacheService,
  ) {}

  /**
   * Register a new user
   */
  async register(input: RegisterInput): Promise<AuthResult> {
    const tenantSlug = input.tenantSlug || DEFAULT_TENANT_SLUG;

    // Validate password
    const passwordValidation = this.securityService.validatePassword(input.password);
    if (!passwordValidation.valid) {
      throw new BadRequestException(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
    }

    // Ensure tenant exists
    let tenant = await this.prisma.tenant.findUnique({
      where: { slug: tenantSlug, isDeleted: false },
    });

    if (!tenant) {
      tenant = await this.prisma.tenant.create({
        data: {
          name: tenantSlug,
          slug: tenantSlug,
        },
      });
    }

    // Check for existing user in tenant
    const existing = await this.prisma.user.findUnique({
      where: {
        email_tenantId: { email: input.email, tenantId: tenant.id },
        isDeleted: false,
      },
    });

    if (existing) {
      throw new ConflictException('Email already exists in this tenant');
    }

    // Hash password
    const passwordHash = await this.securityService.hashPassword(input.password);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        tenantId: tenant.id,
        isEmailVerified: false,
        passwordChangedAt: new Date(),
      },
    });

    // Create session
    const { session, accessToken, refreshToken } = await this.sessionService.createSession({
      userId: user.id,
      tenantId: tenant.id,
    });

    // Log security event
    await this.logSecurityEvent({
      action: 'user.registered',
      resource: 'user',
      resourceId: user.id,
      tenantId: tenant.id,
      userId: user.id,
    });

    return {
      user,
      tenant,
      accessToken,
      refreshToken,
      session,
    };
  }

  /**
   * Login user with enhanced security
   */
  async login(
    credentials: LoginCredentials,
    request?: any,
  ): Promise<AuthResult | { requiresMfa: boolean; mfaTypes: string[] }> {
    const { email, password, tenantSlug, mfaCode, deviceInfo } = credentials;
    const finalTenantSlug = tenantSlug || DEFAULT_TENANT_SLUG;

    // Get IP and device info
    const ipAddress = request ? this.securityService.getClientIp(request) : undefined;
    const userAgent = request?.headers['user-agent'];
    const deviceFingerprint = request ? this.securityService.generateDeviceFingerprint(request) : undefined;

    // Find tenant
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug: finalTenantSlug, isActive: true, isDeleted: false },
    });

    if (!tenant) {
      throw new UnauthorizedException('Invalid tenant');
    }

    // Check account lockout
    const isLocked = await this.securityService.isAccountLocked(email, tenant.id);
    if (isLocked) {
      const remainingTime = await this.securityService.getLockoutRemainingTime(email, tenant.id);
      throw new ForbiddenException(
        `Account is locked. Please try again in ${Math.ceil(remainingTime / 60)} minutes.`,
      );
    }

    // Find user
    const user = await this.prisma.user.findUnique({
      where: {
        email_tenantId: { email, tenantId: tenant.id },
        isDeleted: false,
      },
    });

    // Always record failed attempt if user not found or password wrong
    // This prevents user enumeration attacks
    if (!user || !user.passwordHash) {
      await this.securityService.recordFailedAttempt(email, tenant.id);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      await this.securityService.recordFailedAttempt(email, tenant.id);
      throw new UnauthorizedException('Account is inactive');
    }

    // Verify password
    const isPasswordValid = await this.securityService.verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      await this.securityService.recordFailedAttempt(email, tenant.id);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if MFA is enabled
    const mfaStatus = await this.mfaService.getMfaStatus(user.id, tenant.id);
    const requiresMfa = mfaStatus.totpEnabled || mfaStatus.smsEnabled || mfaStatus.emailEnabled;

    // If MFA is required but code not provided, return MFA challenge
    if (requiresMfa && !mfaCode) {
      const mfaTypes: string[] = [];
      if (mfaStatus.totpEnabled) mfaTypes.push('TOTP');
      if (mfaStatus.smsEnabled) mfaTypes.push('SMS');
      if (mfaStatus.emailEnabled) mfaTypes.push('EMAIL');

      return {
        requiresMfa: true,
        mfaTypes,
      };
    }

    // Verify MFA if code provided
    if (requiresMfa && mfaCode) {
      const mfaVerification = await this.mfaService.verifyMfa({
        userId: user.id,
        tenantId: tenant.id,
        code: mfaCode,
      });

      if (!mfaVerification.verified) {
        await this.securityService.recordFailedAttempt(email, tenant.id);
        throw new UnauthorizedException('Invalid MFA code');
      }
    }

    // Clear failed attempts on successful login
    await this.securityService.clearFailedAttempts(email, tenant.id);

    // Create session with device info
    const finalDeviceInfo = {
      ...deviceInfo,
      fingerprint: deviceFingerprint,
      ipAddress,
      userAgent,
    };

    const { session, accessToken, refreshToken } = await this.sessionService.createSession({
      userId: user.id,
      tenantId: tenant.id,
      deviceInfo: finalDeviceInfo,
      ipAddress,
      userAgent,
    });

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Log security event
    await this.logSecurityEvent({
      action: 'user.login',
      resource: 'user',
      resourceId: user.id,
      tenantId: tenant.id,
      userId: user.id,
      ipAddress,
      userAgent,
      sessionId: session.id,
    });

    return {
      user,
      tenant,
      accessToken,
      refreshToken,
      session,
      requiresMfa: false,
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string, deviceInfo?: any): Promise<{ accessToken: string; refreshToken: string }> {
    return this.sessionService.refreshAccessToken(refreshToken, deviceInfo);
  }

  /**
   * Logout user (revoke session)
   */
  async logout(sessionId: string, userId: string, tenantId: string): Promise<void> {
    await this.sessionService.revokeSession(sessionId);

    // Log security event
    await this.logSecurityEvent({
      action: 'user.logout',
      resource: 'user',
      resourceId: userId,
      tenantId,
      userId,
      sessionId,
    });
  }

  /**
   * Logout all sessions for user
   */
  async logoutAll(userId: string, tenantId: string, excludeSessionId?: string): Promise<void> {
    await this.sessionService.revokeAllUserSessions(userId, tenantId, excludeSessionId);

    // Log security event
    await this.logSecurityEvent({
      action: 'user.logout_all',
      resource: 'user',
      resourceId: userId,
      tenantId,
      userId,
    });
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(request: PasswordResetRequest): Promise<void> {
    const { email, tenantSlug } = request;
    const finalTenantSlug = tenantSlug || DEFAULT_TENANT_SLUG;

    // Find tenant
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug: finalTenantSlug, isActive: true, isDeleted: false },
    });

    if (!tenant) {
      // Don't reveal tenant existence
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

    // Generate reset token
    const resetToken = this.generateResetToken();
    const hashedToken = await this.securityService.hashPassword(resetToken);

    // Store reset token in cache
    const cacheKey = `password_reset:${hashedToken}`;
    await this.cacheService.set(
      cacheKey,
      {
        userId: user.id,
        tenantId: tenant.id,
        email: user.email,
      },
      PASSWORD_RESET_TOKEN_EXPIRY,
    );

    // TODO: Send password reset email
    this.logger.log(`Password reset token for ${email}: ${resetToken} (dev only - implement email service)`);

    // In production, send email:
    // await this.emailService.sendPasswordResetEmail(user.email, resetToken);

    // Log security event
    await this.logSecurityEvent({
      action: 'password.reset_requested',
      resource: 'user',
      resourceId: user.id,
      tenantId: tenant.id,
      userId: user.id,
    });
  }

  /**
   * Reset password using token
   */
  async resetPassword(reset: PasswordReset): Promise<void> {
    const { token, newPassword } = reset;

    // Validate new password
    const passwordValidation = this.securityService.validatePassword(newPassword);
    if (!passwordValidation.valid) {
      throw new BadRequestException(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
    }

    // Find reset token in cache
    // In production, use a database table for reset tokens
    // For now, check cache
    const cacheKey = `password_reset:${token}`;
    const resetData = await this.cacheService.get<{ userId: string; tenantId: string; email: string }>(cacheKey);

    if (!resetData) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Find user
    const user = await this.prisma.user.findUnique({
      where: {
        id: resetData.userId,
        tenantId: resetData.tenantId,
        isActive: true,
        isDeleted: false,
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Check password history
    const canUsePassword = await this.securityService.checkPasswordHistory(
      user.id,
      user.tenantId,
      newPassword,
    );

    if (!canUsePassword) {
      throw new BadRequestException('You cannot reuse a recent password');
    }

    // Hash new password
    const passwordHash = await this.securityService.hashPassword(newPassword);

    // Update user password
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordChangedAt: new Date(),
      },
    });

    // Revoke all sessions for security
    await this.sessionService.revokeAllUserSessions(user.id, user.tenantId);

    // Delete reset token
    await this.cacheService.delete(cacheKey);

    // Log security event
    await this.logSecurityEvent({
      action: 'password.reset_completed',
      resource: 'user',
      resourceId: user.id,
      tenantId: user.tenantId,
      userId: user.id,
    });

    this.logger.log(`Password reset completed for user ${user.id}`);
  }

  /**
   * Change password (authenticated user)
   */
  async changePassword(
    userId: string,
    tenantId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
        tenantId,
        isActive: true,
        isDeleted: false,
      },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await this.securityService.verifyPassword(
      currentPassword,
      user.passwordHash,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Validate new password
    const passwordValidation = this.securityService.validatePassword(newPassword);
    if (!passwordValidation.valid) {
      throw new BadRequestException(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
    }

    // Check password history
    const canUsePassword = await this.securityService.checkPasswordHistory(userId, tenantId, newPassword);
    if (!canUsePassword) {
      throw new BadRequestException('You cannot reuse a recent password');
    }

    // Hash new password
    const passwordHash = await this.securityService.hashPassword(newPassword);

    // Update password
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordChangedAt: new Date(),
      },
    });

    // Log security event
    await this.logSecurityEvent({
      action: 'password.changed',
      resource: 'user',
      resourceId: user.id,
      tenantId,
      userId: user.id,
    });

    this.logger.log(`Password changed for user ${user.id}`);
  }

  /**
   * Get active sessions for user
   */
  async getUserSessions(userId: string, tenantId: string): Promise<any[]> {
    return this.sessionService.getUserSessions(userId, tenantId);
  }

  /**
   * Generate password reset token
   */
  private generateResetToken(): string {
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
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