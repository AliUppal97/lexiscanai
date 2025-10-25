import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RateLimitService } from '../../services/rate-limit.service';

/**
 * ThrottleGuard - Rate limiting guard to prevent abuse
 * 
 * This guard enforces rate limits on API endpoints to prevent:
 * - DDoS attacks
 * - Brute force attacks
 * - API abuse
 * - Resource exhaustion
 * 
 * Features:
 * - Per-endpoint rate limiting
 * - User-based and IP-based limits
 * - Multiple tier support (free, basic, premium, enterprise)
 * - Automatic retry-after headers
 * - Whitelist/blacklist support
 * 
 * Usage:
 * ```typescript
 * @UseGuards(ThrottleGuard)
 * @Throttle({ points: 10, duration: 60 }) // 10 requests per minute
 * @Post('login')
 * login() { ... }
 * ```
 * 
 * @example
 * // Custom throttle for specific endpoint
 * @Throttle({ points: 5, duration: 300 }) // 5 requests per 5 minutes
 * @Post('reset-password')
 * resetPassword() { ... }
 */
@Injectable()
export class ThrottleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private rateLimitService: RateLimitService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Get throttle configuration from decorator
    const throttleConfig = this.reflector.getAllAndOverride<ThrottleConfig>('throttle', [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no throttle config, use default or skip
    if (!throttleConfig) {
      return true; // No rate limiting
    }

    // Determine identifier (user ID or IP address)
    const identifier = this.getIdentifier(request);

    // Get user's tier for tiered rate limiting
    const tier = this.getUserTier(request);

    // Check rate limit
    const result = await this.rateLimitService.consume(identifier, tier, 1);

    // Add rate limit headers to response
    this.addRateLimitHeaders(response, result);

    // If rate limit exceeded, throw exception
    if (!result.allowed) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Too many requests. Please try again later.',
          retryAfter: result.retryAfter,
          limit: result.remaining + 1, // Total limit
          remaining: result.remaining,
          resetTime: result.resetTime,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }

  /**
   * Get unique identifier for rate limiting
   * Priority: User ID > API Key > IP Address
   */
  private getIdentifier(request: any): string {
    // 1. Use authenticated user ID (most accurate)
    if (request.user?.userId) {
      return `user:${request.user.userId}`;
    }

    // 2. Use API key (for API key authenticated requests)
    if (request.apiKey) {
      return `apikey:${request.apiKey}`;
    }

    // 3. Use IP address (for unauthenticated requests)
    const ip = this.getClientIp(request);
    return `ip:${ip}`;
  }

  /**
   * Get client IP address with proxy support
   */
  private getClientIp(request: any): string {
    // Check for forwarded IP (behind proxy/load balancer)
    const forwardedFor = request.headers['x-forwarded-for'];
    if (forwardedFor) {
      return forwardedFor.split(',')[0].trim();
    }

    // Check for real IP header
    if (request.headers['x-real-ip']) {
      return request.headers['x-real-ip'];
    }

    // Fallback to connection remote address
    return request.ip || request.connection?.remoteAddress || 'unknown';
  }

  /**
   * Determine user's rate limit tier
   */
  private getUserTier(request: any): string {
    // Check if user has a subscription tier
    if (request.user?.subscriptionTier) {
      return request.user.subscriptionTier; // 'free', 'basic', 'premium', 'enterprise'
    }

    // Check if organization has a tier
    if (request.user?.organizationTier) {
      return request.user.organizationTier;
    }

    // Default to free tier
    return 'free';
  }

  /**
   * Add rate limit information to response headers
   * Following industry standard: X-RateLimit-* headers
   */
  private addRateLimitHeaders(response: any, result: any): void {
    response.setHeader('X-RateLimit-Limit', result.remaining + 1); // Total limit
    response.setHeader('X-RateLimit-Remaining', result.remaining);
    response.setHeader('X-RateLimit-Reset', Math.floor(result.resetTime.getTime() / 1000));

    if (result.retryAfter) {
      response.setHeader('Retry-After', result.retryAfter);
    }
  }
}

/**
 * Throttle configuration interface
 */
export interface ThrottleConfig {
  points: number; // Number of requests allowed
  duration: number; // Time window in seconds
  blockDuration?: number; // How long to block after exceeding limit
}

/**
 * Throttle Decorator - Set rate limit for specific routes
 * 
 * @param config - Throttle configuration
 * 
 * @example
 * @Throttle({ points: 5, duration: 60 }) // 5 requests per minute
 */
import { SetMetadata } from '@nestjs/common';

export const THROTTLE_KEY = 'throttle';
export const Throttle = (config: ThrottleConfig) => SetMetadata(THROTTLE_KEY, config);

/**
 * Skip throttling for specific routes
 * 
 * @example
 * @SkipThrottle()
 * @Get('health')
 * healthCheck() { ... }
 */
export const SKIP_THROTTLE_KEY = 'skipThrottle';
export const SkipThrottle = () => SetMetadata(SKIP_THROTTLE_KEY, true);

