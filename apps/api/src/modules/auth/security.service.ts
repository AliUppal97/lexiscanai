import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../common/prisma.service';
import { CacheService } from '../../services/cache.service';

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  maxAge?: number; // Days before password expires
  historyLimit?: number; // Number of previous passwords to prevent reuse
}

export interface AccountLockoutConfig {
  maxAttempts: number;
  lockoutDuration: number; // Seconds
  windowDuration: number; // Seconds for tracking attempts
}

@Injectable()
export class SecurityService {
  private readonly logger = new Logger(SecurityService.name);
  private readonly passwordPolicy: PasswordPolicy;
  private readonly lockoutConfig: AccountLockoutConfig;
  private readonly passwordHashRounds = 12;

  constructor(
    private prisma: PrismaService,
    private cacheService: CacheService,
    private configService: ConfigService,
  ) {
    // Password policy configuration
    this.passwordPolicy = {
      minLength: this.configService.get<number>('PASSWORD_MIN_LENGTH', 12),
      requireUppercase: this.configService.get<boolean>('PASSWORD_REQUIRE_UPPERCASE', true),
      requireLowercase: this.configService.get<boolean>('PASSWORD_REQUIRE_LOWERCASE', true),
      requireNumbers: this.configService.get<boolean>('PASSWORD_REQUIRE_NUMBERS', true),
      requireSpecialChars: this.configService.get<boolean>('PASSWORD_REQUIRE_SPECIAL', true),
      maxAge: this.configService.get<number>('PASSWORD_MAX_AGE_DAYS', 90),
      historyLimit: this.configService.get<number>('PASSWORD_HISTORY_LIMIT', 5),
    };

    // Account lockout configuration
    this.lockoutConfig = {
      maxAttempts: this.configService.get<number>('AUTH_MAX_ATTEMPTS', 5),
      lockoutDuration: this.configService.get<number>('AUTH_LOCKOUT_DURATION', 900), // 15 minutes
      windowDuration: this.configService.get<number>('AUTH_WINDOW_DURATION', 300), // 5 minutes
    };
  }

  /**
   * Hash password using bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.passwordHashRounds);
  }

  /**
   * Verify password against hash
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Validate password against policy
   */
  validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < this.passwordPolicy.minLength) {
      errors.push(`Password must be at least ${this.passwordPolicy.minLength} characters long`);
    }

    if (this.passwordPolicy.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (this.passwordPolicy.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (this.passwordPolicy.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (this.passwordPolicy.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    // Check for common weak passwords
    const commonPasswords = ['password', '12345678', 'qwerty', 'admin', 'letmein'];
    if (commonPasswords.some((common) => password.toLowerCase().includes(common))) {
      errors.push('Password is too common or easily guessable');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check if password was used recently (password history)
   */
  async checkPasswordHistory(
    userId: string,
    tenantId: string,
    newPassword: string,
  ): Promise<boolean> {
    if (!this.passwordPolicy.historyLimit) {
      return true; // No history check if not configured
    }

    // Get user's password history
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true },
    });

    if (!user?.passwordHash) {
      return true;
    }

    // In a production system, you would maintain a separate password history table
    // For now, we check against current password
    const isCurrentPassword = await this.verifyPassword(newPassword, user.passwordHash);
    if (isCurrentPassword) {
      return false; // Password is same as current
    }

    // TODO: Implement password history table in production
    // For now, we'll skip this check but log it
    this.logger.warn(`Password history check not fully implemented for user ${userId}`);

    return true;
  }

  /**
   * Check if password has expired
   */
  async isPasswordExpired(userId: string): Promise<boolean> {
    if (!this.passwordPolicy.maxAge) {
      return false; // No expiration if not configured
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { passwordChangedAt: true },
    });

    if (!user?.passwordChangedAt) {
      return false; // No password change date means it's a new user
    }

    const daysSinceChange =
      (Date.now() - user.passwordChangedAt.getTime()) / (1000 * 60 * 60 * 24);

    return daysSinceChange > (this.passwordPolicy.maxAge || 90);
  }

  /**
   * Record failed login attempt
   */
  async recordFailedAttempt(identifier: string, tenantId?: string): Promise<void> {
    const key = `auth:failed:${tenantId ? `${tenantId}:` : ''}${identifier}`;
    const windowKey = `${key}:window`;

    try {
      // Increment failed attempts counter
      const attempts = (await this.cacheService.increment(key)) || 1;
      await this.cacheService.expire(key, this.lockoutConfig.windowDuration);

      // Track window
      await this.cacheService.set(windowKey, Date.now(), this.lockoutConfig.windowDuration);

      // If exceeded max attempts, lock account
      if (attempts >= this.lockoutConfig.maxAttempts) {
        await this.lockAccount(identifier, tenantId);
      }
    } catch (error) {
      this.logger.error(`Failed to record failed attempt: ${error.message}`);
    }
  }

  /**
   * Clear failed login attempts (on successful login)
   */
  async clearFailedAttempts(identifier: string, tenantId?: string): Promise<void> {
    const key = `auth:failed:${tenantId ? `${tenantId}:` : ''}${identifier}`;
    const windowKey = `${key}:window`;

    try {
      await this.cacheService.delete(key);
      await this.cacheService.delete(windowKey);
    } catch (error) {
      this.logger.error(`Failed to clear failed attempts: ${error.message}`);
    }
  }

  /**
   * Check if account is locked
   */
  async isAccountLocked(identifier: string, tenantId?: string): Promise<boolean> {
    const lockKey = `auth:locked:${tenantId ? `${tenantId}:` : ''}${identifier}`;
    const isLocked = await this.cacheService.get(lockKey);
    return !!isLocked;
  }

  /**
   * Lock account
   */
  private async lockAccount(identifier: string, tenantId?: string): Promise<void> {
    const lockKey = `auth:locked:${tenantId ? `${tenantId}:` : ''}${identifier}`;
    await this.cacheService.set(lockKey, true, this.lockoutConfig.lockoutDuration);

    this.logger.warn(
      `Account locked: ${identifier}${tenantId ? ` (tenant: ${tenantId})` : ''} after ${this.lockoutConfig.maxAttempts} failed attempts`,
    );

    // Log security event
    await this.logSecurityEvent({
      action: 'account.locked',
      resource: 'user',
      details: {
        identifier,
        tenantId,
        reason: 'Too many failed login attempts',
        lockoutDuration: this.lockoutConfig.lockoutDuration,
      },
      tenantId,
    });
  }

  /**
   * Unlock account (admin operation)
   */
  async unlockAccount(identifier: string, tenantId?: string): Promise<void> {
    const lockKey = `auth:locked:${tenantId ? `${tenantId}:` : ''}${identifier}`;
    await this.cacheService.delete(lockKey);

    // Clear failed attempts
    await this.clearFailedAttempts(identifier, tenantId);

    this.logger.log(
      `Account unlocked: ${identifier}${tenantId ? ` (tenant: ${tenantId})` : ''}`,
    );

    // Log security event
    await this.logSecurityEvent({
      action: 'account.unlocked',
      resource: 'user',
      details: {
        identifier,
        tenantId,
      },
      tenantId,
    });
  }

  /**
   * Get remaining lockout time in seconds
   */
  async getLockoutRemainingTime(identifier: string, tenantId?: string): Promise<number> {
    const lockKey = `auth:locked:${tenantId ? `${tenantId}:` : ''}${identifier}`;
    const ttl = await this.cacheService.ttl(lockKey);
    return ttl > 0 ? ttl : 0;
  }

  /**
   * Get failed attempt count
   */
  async getFailedAttemptCount(identifier: string, tenantId?: string): Promise<number> {
    const key = `auth:failed:${tenantId ? `${tenantId}:` : ''}${identifier}`;
    const attempts = await this.cacheService.get<number>(key);
    return attempts || 0;
  }

  /**
   * Generate device fingerprint from request
   */
  generateDeviceFingerprint(request: any): string {
    const userAgent = request.headers['user-agent'] || '';
    const acceptLanguage = request.headers['accept-language'] || '';
    const acceptEncoding = request.headers['accept-encoding'] || '';
    const ip = this.getClientIp(request);

    // Create a simple fingerprint (in production, use a more sophisticated method)
    const fingerprint = `${ip}:${userAgent}:${acceptLanguage}:${acceptEncoding}`;
    
    // Hash it (in production, use crypto.createHash)
    // For now, return a simple hash
    return Buffer.from(fingerprint).toString('base64').substring(0, 64);
  }

  /**
   * Get client IP address
   */
  getClientIp(request: any): string {
    return (
      request.headers['x-forwarded-for']?.split(',')[0] ||
      request.headers['x-real-ip'] ||
      request.ip ||
      request.connection?.remoteAddress ||
      'unknown'
    );
  }

  /**
   * Log security event to audit log
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

  /**
   * Check password strength score (0-100)
   */
  calculatePasswordStrength(password: string): number {
    let score = 0;

    // Length
    if (password.length >= 8) score += 10;
    if (password.length >= 12) score += 10;
    if (password.length >= 16) score += 10;
    if (password.length >= 20) score += 10;

    // Character variety
    if (/[a-z]/.test(password)) score += 10;
    if (/[A-Z]/.test(password)) score += 10;
    if (/\d/.test(password)) score += 10;
    if (/[^a-zA-Z0-9]/.test(password)) score += 10;

    // Complexity
    if (/(?=.*[a-z])(?=.*[A-Z])/.test(password)) score += 5;
    if (/(?=.*\d)(?=.*[^a-zA-Z0-9])/.test(password)) score += 5;

    // Bonus for length
    if (password.length > 12 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9])/.test(password)) {
      score += 10;
    }

    return Math.min(100, score);
  }
}
