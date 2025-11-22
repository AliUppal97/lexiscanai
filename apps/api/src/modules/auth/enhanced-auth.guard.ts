import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma.service';
import { CacheService } from '../../services/cache.service';
import { SecurityService } from './security.service';
import { SessionService } from './session.service';
import { TokenSecurityService, TokenBindingInfo } from './token-security.service';
import { ApiKeyService } from './api-key.service';
import { Reflector } from '@nestjs/core';

/**
 * Enhanced JWT Authentication Guard
 * 
 * Features:
 * - Token verification with blacklisting
 * - Session validation
 * - Device fingerprinting
 * - User and tenant verification
 * - Permission extraction
 * - Security event logging
 * 
 * Usage:
 * ```typescript
 * @UseGuards(EnhancedJwtAuthGuard)
 * @Get('protected')
 * protectedRoute() { ... }
 * ```
 */
@Injectable()
export class EnhancedJwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(EnhancedJwtAuthGuard.name);
  private readonly tokenBlacklistPrefix = 'token:blacklist:';

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
    private cacheService: CacheService,
    private securityService: SecurityService,
    private sessionService: SessionService,
    private reflector: Reflector,
    private tokenSecurityService?: TokenSecurityService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Extract token from header
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No authentication token provided');
    }

    try {
      // Check token blacklist
      const isBlacklisted = await this.isTokenBlacklisted(token);
      if (isBlacklisted) {
        throw new UnauthorizedException('Token has been revoked');
      }

      // Verify token signature and expiration (with RS256/JWE support)
      let payload: any;
      if (this.tokenSecurityService) {
        payload = await this.tokenSecurityService.decryptToken(token);
      } else {
        payload = await this.jwtService.verifyAsync(token, {
          secret: this.configService.get<string>('JWT_SECRET'),
        });
      }

      // Verify token binding if enabled
      if (this.tokenSecurityService && payload.binding) {
        const deviceFingerprint = this.securityService.generateDeviceFingerprint(request);
        const clientIp = this.securityService.getClientIp(request);
        const bindingInfo: TokenBindingInfo = {
          deviceFingerprint,
          ipAddress: clientIp,
          userAgent: request.headers['user-agent'],
        };
        
        const bindingValid = this.tokenSecurityService.verifyTokenBinding(payload, bindingInfo);
        if (!bindingValid) {
          throw new UnauthorizedException('Token binding verification failed');
        }
      }

      // Verify session is still valid
      if (payload.sessionId) {
        const isSessionValid = await this.sessionService.verifySession(payload.sessionId);
        if (!isSessionValid) {
          throw new UnauthorizedException('Session expired or revoked');
        }
      }

      // Verify user is still active
      const user = await this.prisma.user.findUnique({
        where: {
          id: payload.sub,
          isActive: true,
          isDeleted: false,
        },
        include: {
          userRoles: {
            where: {
              expiresAt: null,
              OR: [{ expiresAt: { gt: new Date() } }],
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
          tenant: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException('User not found or inactive');
      }

      // Verify tenant is still active
      if (!user.tenant.isActive || user.tenant.isDeleted) {
        throw new UnauthorizedException('Tenant account is inactive');
      }

      // Verify token tenant matches user tenant
      if (payload.tenantId !== user.tenantId) {
        throw new ForbiddenException('Tenant mismatch');
      }

      // Extract permissions from roles
      const permissions = new Set<string>();
      user.userRoles.forEach((ur) => {
        ur.role.rolePermissions.forEach((rp) => {
          permissions.add(rp.permission.name);
        });
      });

      // Extract roles
      const roles = user.userRoles.map((ur) => ur.role.name);

      // Device fingerprinting for security
      const deviceFingerprint = this.securityService.generateDeviceFingerprint(request);
      const clientIp = this.securityService.getClientIp(request);

      // Attach user info to request
      request.user = user;
      request.userId = user.id;
      request.tenantId = user.tenantId;
      request.tenant = user.tenant;
      request.userRoles = roles;
      request.userPermissions = Array.from(permissions);
      request.sessionId = payload.sessionId;
      request.deviceFingerprint = deviceFingerprint;
      request.clientIp = clientIp;

      // Add security headers
      this.addSecurityHeaders(response);

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof ForbiddenException) {
        throw error;
      }

      this.logger.error(`Authentication failed: ${error.message}`);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  /**
   * Extract token from Authorization header
   */
  private extractTokenFromHeader(request: any): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return undefined;
    }

    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer' || !token) {
      return undefined;
    }

    return token;
  }

  /**
   * Check if token is blacklisted
   */
  private async isTokenBlacklisted(token: string): Promise<boolean> {
    try {
      // Hash token to create blacklist key
      const tokenHash = this.hashToken(token);
      const blacklistKey = `${this.tokenBlacklistPrefix}${tokenHash}`;
      const isBlacklisted = await this.cacheService.get(blacklistKey);
      return !!isBlacklisted;
    } catch (error) {
      this.logger.error(`Failed to check token blacklist: ${error.message}`);
      return false; // Fail open for availability
    }
  }

  /**
   * Hash token for blacklist key
   */
  private hashToken(token: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Add security headers to response
   */
  private addSecurityHeaders(response: any): void {
    // Security headers
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('X-Frame-Options', 'DENY');
    response.setHeader('X-XSS-Protection', '1; mode=block');
    response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Content Security Policy
    const csp = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';";
    response.setHeader('Content-Security-Policy', csp);

    // Strict Transport Security (HTTPS only in production)
    if (this.configService.get('NODE_ENV') === 'production') {
      response.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
  }
}

/**
 * API Key Authentication Guard
 * 
 * Validates API key authentication for server-to-server communication
 * 
 * Usage:
 * ```typescript
 * @UseGuards(ApiKeyAuthGuard)
 * @Get('api-endpoint')
 * apiEndpoint() { ... }
 * ```
 */
@Injectable()
export class ApiKeyAuthGuard implements CanActivate {
  private readonly logger = new Logger(ApiKeyAuthGuard.name);
  private readonly cachePrefix = 'api_key:';
  private readonly CACHE_TTL = 60; // 1 minute

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private cacheService: CacheService,
    private apiKeyService: ApiKeyService,
  ) {
    // Ensure ApiKeyService is injected
    if (!this.apiKeyService) {
      throw new Error('ApiKeyService must be injected into ApiKeyAuthGuard');
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Extract API key from header
    const apiKey = this.extractApiKey(request);

    if (!apiKey) {
      // Prevent key enumeration - same error for missing/invalid keys
      throw new UnauthorizedException('Invalid API key');
    }

    try {
      // Verify API key (with caching)
      const verification = await this.verifyApiKey(apiKey);

      if (!verification.valid) {
        this.logger.warn(`Invalid API key attempt: ${apiKey.substring(0, 8)}...`);
        throw new UnauthorizedException('Invalid API key');
      }

      // Check rate limits (would integrate with RateLimitService)
      await this.checkRateLimit(verification.keyId!, request);

      // Attach API key info to request
      request.apiKey = verification.apiKey;
      request.userId = verification.userId;
      request.tenantId = verification.tenantId;
      request.scopes = verification.scopes || [];

      // Track usage (async, don't wait)
      this.trackUsage(verification.keyId!, request).catch((error) => {
        this.logger.warn(`Failed to track API key usage: ${error.message}`);
      });

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof ForbiddenException) {
        throw error;
      }

      this.logger.error(`API key authentication failed: ${error.message}`, error.stack);
      throw new UnauthorizedException('Invalid API key');
    }
  }

  /**
   * Verify API key with caching
   */
  private async verifyApiKey(apiKey: string): Promise<{
    valid: boolean;
    userId?: string;
    tenantId?: string;
    scopes?: string[];
    keyId?: string;
    apiKey?: any;
  }> {
    // Check cache first
    const cacheKey = `${this.cachePrefix}${this.hashKey(apiKey)}`;
    const cached = await this.cacheService.get<{
      valid: boolean;
      userId?: string;
      tenantId?: string;
      scopes?: string[];
      keyId?: string;
      apiKey?: any;
    }>(cacheKey);

    if (cached) {
      return cached;
    }

    // Verify using ApiKeyService
    const verification = await this.apiKeyService.verifyApiKey(apiKey);

    // Cache result (even invalid ones to prevent enumeration)
    await this.cacheService.set(cacheKey, verification, this.CACHE_TTL);

    return verification;
  }

  /**
   * Check rate limits for API key
   */
  private async checkRateLimit(keyId: string, request: any): Promise<void> {
    // In production, integrate with RateLimitService
    // For now, use Redis for rate limiting
    const rateLimitKey = `api_key_rate_limit:${keyId}`;
    const current = await this.cacheService.get<number>(rateLimitKey) || 0;
    const limit = 1000; // 1000 requests per hour per API key

    if (current >= limit) {
      throw new ForbiddenException('API key rate limit exceeded');
    }

    // Increment counter
    await this.cacheService.increment(rateLimitKey);
    await this.cacheService.expire(rateLimitKey, 3600); // 1 hour TTL
  }

  /**
   * Track API key usage
   */
  private async trackUsage(keyId: string, request: any): Promise<void> {
    // Log usage for analytics and security monitoring
    this.logger.debug(`API key usage: ${keyId} - ${request.method} ${request.url}`);

    // In production, would store in database or analytics service
    // For now, just log
  }

  /**
   * Hash API key for cache key
   */
  private hashKey(key: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(key).digest('hex');
  }

  /**
   * Extract API key from header
   */
  private extractApiKey(request: any): string | undefined {
    return (
      request.headers['x-api-key'] ||
      request.headers['api-key'] ||
      request.query.apiKey
    );
  }
}

/**
 * Optional Authentication Guard
 * 
 * Validates authentication if token is provided, but doesn't require it
 * Useful for endpoints that work with or without authentication
 * 
 * Usage:
 * ```typescript
 * @UseGuards(OptionalAuthGuard)
 * @Get('public-with-user')
 * publicEndpoint(@Request() req) {
 *   if (req.user) {
 *     // Authenticated user
 *   } else {
 *     // Anonymous user
 *   }
 * }
 * ```
 */
@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(private enhancedJwtGuard: EnhancedJwtAuthGuard) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];

    // If no token, allow access
    if (!token) {
      return true;
    }

    // If token provided, validate it
    try {
      return await this.enhancedJwtGuard.canActivate(context);
    } catch (error) {
      // If validation fails, still allow access (optional auth)
      return true;
    }
  }
}
