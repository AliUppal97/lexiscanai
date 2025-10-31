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

      // Verify token signature and expiration
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

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

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Extract API key from header
    const apiKey = this.extractApiKey(request);

    if (!apiKey) {
      throw new UnauthorizedException('API key required');
    }

    try {
      // TODO: Implement API key verification
      // const verification = await this.apiKeyService.verifyApiKey(apiKey);
      // if (!verification.valid) {
      //   throw new UnauthorizedException('Invalid API key');
      // }

      // Attach API key info to request
      // request.apiKey = verification;
      // request.userId = verification.userId;
      // request.tenantId = verification.tenantId;

      // For now, placeholder
      throw new UnauthorizedException('API key authentication not fully implemented');

      // return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      this.logger.error(`API key authentication failed: ${error.message}`);
      throw new UnauthorizedException('Invalid API key');
    }
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
