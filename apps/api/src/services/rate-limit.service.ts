import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheService } from './cache.service';

export interface RateLimitConfig {
  points: number; // Number of requests
  duration: number; // Time window in seconds
  blockDuration?: number; // How long to block after exceeding limit (seconds)
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: Date;
  retryAfter?: number; // Seconds until retry
}

export interface RateLimitInfo {
  consumed: number;
  remaining: number;
  resetTime: Date;
  isBlocked: boolean;
}

@Injectable()
export class RateLimitService {
  private readonly logger = new Logger(RateLimitService.name);
  private readonly enabled: boolean;
  private readonly keyPrefix = 'ratelimit:';

  // Default rate limit configs for different tiers
  private readonly configs: Record<string, RateLimitConfig> = {
    free: { points: 100, duration: 3600, blockDuration: 600 }, // 100 requests per hour
    basic: { points: 1000, duration: 3600, blockDuration: 300 }, // 1000 requests per hour
    premium: { points: 10000, duration: 3600, blockDuration: 60 }, // 10k requests per hour
    enterprise: { points: 100000, duration: 3600, blockDuration: 0 }, // 100k requests per hour
    
    // Special limits
    auth: { points: 5, duration: 300, blockDuration: 900 }, // 5 attempts per 5 minutes
    upload: { points: 10, duration: 60, blockDuration: 300 }, // 10 uploads per minute
    export: { points: 5, duration: 3600, blockDuration: 1800 }, // 5 exports per hour
  };

  constructor(
    private cacheService: CacheService,
    private configService: ConfigService,
  ) {
    this.enabled = this.configService.get<boolean>('RATE_LIMIT_ENABLED', true);

    if (!this.enabled) {
      this.logger.warn('Rate limiting is disabled');
    }
  }

  /**
   * Check if request is allowed
   */
  async consume(
    identifier: string,
    tier: string = 'free',
    cost: number = 1,
  ): Promise<RateLimitResult> {
    if (!this.enabled) {
      return {
        allowed: true,
        remaining: Infinity,
        resetTime: new Date(Date.now() + 3600000),
      };
    }

    const config = this.configs[tier] || this.configs.free;
    const key = this.getKey(identifier, tier);

    try {
      // Check if currently blocked
      const blockKey = `${key}:block`;
      const blocked = await this.cacheService.get(blockKey);

      if (blocked) {
        const ttl = await this.cacheService.ttl(blockKey);
        return {
          allowed: false,
          remaining: 0,
          resetTime: new Date(Date.now() + ttl * 1000),
          retryAfter: ttl,
        };
      }

      // Get current consumption
      const current = (await this.cacheService.get<number>(key)) || 0;
      const newConsumption = current + cost;

      if (newConsumption > config.points) {
        // Exceeded rate limit
        if (config.blockDuration && config.blockDuration > 0) {
          await this.cacheService.set(blockKey, true, config.blockDuration);
        }

        const ttl = await this.cacheService.ttl(key);
        const resetTime = new Date(Date.now() + ttl * 1000);

        this.logger.warn(
          `Rate limit exceeded for ${identifier} (tier: ${tier})`,
        );

        return {
          allowed: false,
          remaining: 0,
          resetTime,
          retryAfter: config.blockDuration || ttl,
        };
      }

      // Consume points
      if (current === 0) {
        // First request in window
        await this.cacheService.set(key, newConsumption, config.duration);
      } else {
        // Subsequent requests
        await this.cacheService.increment(key, cost);
      }

      const ttl = await this.cacheService.ttl(key);
      const resetTime = new Date(Date.now() + ttl * 1000);

      return {
        allowed: true,
        remaining: Math.max(0, config.points - newConsumption),
        resetTime,
      };
    } catch (error) {
      this.logger.error(`Rate limit check failed: ${error.message}`);
      
      // On error, allow request (fail open)
      return {
        allowed: true,
        remaining: Infinity,
        resetTime: new Date(Date.now() + 3600000),
      };
    }
  }

  /**
   * Check rate limit without consuming
   */
  async check(identifier: string, tier: string = 'free'): Promise<RateLimitInfo> {
    if (!this.enabled) {
      return {
        consumed: 0,
        remaining: Infinity,
        resetTime: new Date(Date.now() + 3600000),
        isBlocked: false,
      };
    }

    const config = this.configs[tier] || this.configs.free;
    const key = this.getKey(identifier, tier);

    try {
      const blockKey = `${key}:block`;
      const blocked = await this.cacheService.exists(blockKey);
      const consumed = (await this.cacheService.get<number>(key)) || 0;
      const ttl = await this.cacheService.ttl(key);
      const resetTime = new Date(Date.now() + ttl * 1000);

      return {
        consumed,
        remaining: Math.max(0, config.points - consumed),
        resetTime,
        isBlocked: blocked,
      };
    } catch (error) {
      this.logger.error(`Rate limit check failed: ${error.message}`);
      return {
        consumed: 0,
        remaining: config.points,
        resetTime: new Date(Date.now() + config.duration * 1000),
        isBlocked: false,
      };
    }
  }

  /**
   * Reset rate limit for identifier
   */
  async reset(identifier: string, tier: string = 'free'): Promise<boolean> {
    const key = this.getKey(identifier, tier);
    const blockKey = `${key}:block`;

    try {
      await this.cacheService.delete(key);
      await this.cacheService.delete(blockKey);
      
      this.logger.log(`Rate limit reset for ${identifier} (tier: ${tier})`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to reset rate limit: ${error.message}`);
      return false;
    }
  }

  /**
   * Block identifier temporarily
   */
  async block(
    identifier: string,
    tier: string = 'free',
    duration?: number,
  ): Promise<boolean> {
    const config = this.configs[tier] || this.configs.free;
    const blockDuration = duration || config.blockDuration || 3600;
    const key = this.getKey(identifier, tier);
    const blockKey = `${key}:block`;

    try {
      await this.cacheService.set(blockKey, true, blockDuration);
      this.logger.log(
        `Blocked ${identifier} for ${blockDuration} seconds (tier: ${tier})`,
      );
      return true;
    } catch (error) {
      this.logger.error(`Failed to block identifier: ${error.message}`);
      return false;
    }
  }

  /**
   * Unblock identifier
   */
  async unblock(identifier: string, tier: string = 'free'): Promise<boolean> {
    const key = this.getKey(identifier, tier);
    const blockKey = `${key}:block`;

    try {
      await this.cacheService.delete(blockKey);
      this.logger.log(`Unblocked ${identifier} (tier: ${tier})`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to unblock identifier: ${error.message}`);
      return false;
    }
  }

  /**
   * Whitelist identifier (unlimited rate)
   */
  async whitelist(identifier: string): Promise<boolean> {
    const whitelistKey = `${this.keyPrefix}whitelist:${identifier}`;

    try {
      await this.cacheService.set(whitelistKey, true, 0); // No expiration
      this.logger.log(`Whitelisted ${identifier}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to whitelist: ${error.message}`);
      return false;
    }
  }

  /**
   * Remove from whitelist
   */
  async removeFromWhitelist(identifier: string): Promise<boolean> {
    const whitelistKey = `${this.keyPrefix}whitelist:${identifier}`;

    try {
      await this.cacheService.delete(whitelistKey);
      this.logger.log(`Removed ${identifier} from whitelist`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to remove from whitelist: ${error.message}`);
      return false;
    }
  }

  /**
   * Check if identifier is whitelisted
   */
  async isWhitelisted(identifier: string): Promise<boolean> {
    const whitelistKey = `${this.keyPrefix}whitelist:${identifier}`;
    return await this.cacheService.exists(whitelistKey);
  }

  /**
   * Blacklist identifier (permanent block)
   */
  async blacklist(identifier: string): Promise<boolean> {
    const blacklistKey = `${this.keyPrefix}blacklist:${identifier}`;

    try {
      await this.cacheService.set(blacklistKey, true, 0); // No expiration
      this.logger.log(`Blacklisted ${identifier}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to blacklist: ${error.message}`);
      return false;
    }
  }

  /**
   * Remove from blacklist
   */
  async removeFromBlacklist(identifier: string): Promise<boolean> {
    const blacklistKey = `${this.keyPrefix}blacklist:${identifier}`;

    try {
      await this.cacheService.delete(blacklistKey);
      this.logger.log(`Removed ${identifier} from blacklist`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to remove from blacklist: ${error.message}`);
      return false;
    }
  }

  /**
   * Check if identifier is blacklisted
   */
  async isBlacklisted(identifier: string): Promise<boolean> {
    const blacklistKey = `${this.keyPrefix}blacklist:${identifier}`;
    return await this.cacheService.exists(blacklistKey);
  }

  /**
   * Advanced rate limiting: consume with multiple tiers
   */
  async consumeMultiple(
    identifier: string,
    limits: Array<{ tier: string; cost?: number }>,
  ): Promise<{ allowed: boolean; results: RateLimitResult[] }> {
    const results = await Promise.all(
      limits.map((limit) =>
        this.consume(identifier, limit.tier, limit.cost),
      ),
    );

    const allowed = results.every((result) => result.allowed);

    return { allowed, results };
  }

  /**
   * Get rate limit statistics
   */
  async getStatistics(
    identifier: string,
    tiers?: string[],
  ): Promise<Record<string, RateLimitInfo>> {
    const tiersToCheck = tiers || Object.keys(this.configs);
    const stats: Record<string, RateLimitInfo> = {};

    for (const tier of tiersToCheck) {
      stats[tier] = await this.check(identifier, tier);
    }

    return stats;
  }

  /**
   * Custom rate limit (not tied to predefined tiers)
   */
  async consumeCustom(
    identifier: string,
    config: RateLimitConfig,
    namespace: string = 'custom',
  ): Promise<RateLimitResult> {
    const key = `${this.keyPrefix}${namespace}:${identifier}`;

    try {
      const current = (await this.cacheService.get<number>(key)) || 0;
      const newConsumption = current + 1;

      if (newConsumption > config.points) {
        const ttl = await this.cacheService.ttl(key);
        return {
          allowed: false,
          remaining: 0,
          resetTime: new Date(Date.now() + ttl * 1000),
          retryAfter: ttl,
        };
      }

      if (current === 0) {
        await this.cacheService.set(key, newConsumption, config.duration);
      } else {
        await this.cacheService.increment(key);
      }

      const ttl = await this.cacheService.ttl(key);

      return {
        allowed: true,
        remaining: Math.max(0, config.points - newConsumption),
        resetTime: new Date(Date.now() + ttl * 1000),
      };
    } catch (error) {
      this.logger.error(`Custom rate limit failed: ${error.message}`);
      return {
        allowed: true,
        remaining: Infinity,
        resetTime: new Date(Date.now() + config.duration * 1000),
      };
    }
  }

  /**
   * Sliding window rate limiter
   */
  async consumeSlidingWindow(
    identifier: string,
    points: number,
    windowSeconds: number,
  ): Promise<RateLimitResult> {
    const key = `${this.keyPrefix}sliding:${identifier}`;
    const now = Date.now();
    const windowStart = now - windowSeconds * 1000;

    try {
      // Get all timestamps in the current window
      const timestamps = await this.cacheService.lRange<number>(key, 0, -1);
      const validTimestamps = timestamps.filter((ts) => ts > windowStart);

      if (validTimestamps.length >= points) {
        const oldestTimestamp = Math.min(...validTimestamps);
        const resetTime = new Date(oldestTimestamp + windowSeconds * 1000);
        const retryAfter = Math.ceil((resetTime.getTime() - now) / 1000);

        return {
          allowed: false,
          remaining: 0,
          resetTime,
          retryAfter,
        };
      }

      // Add current timestamp
      await this.cacheService.rPush(key, now);
      await this.cacheService.expire(key, windowSeconds);

      // Clean old timestamps
      const allTimestamps = await this.cacheService.lRange<number>(key, 0, -1);
      const newValidTimestamps = allTimestamps.filter((ts) => ts > windowStart);
      
      // Re-create list with only valid timestamps (in production, use LTRIM)
      await this.cacheService.delete(key);
      if (newValidTimestamps.length > 0) {
        await this.cacheService.rPush(key, ...newValidTimestamps);
        await this.cacheService.expire(key, windowSeconds);
      }

      return {
        allowed: true,
        remaining: Math.max(0, points - validTimestamps.length - 1),
        resetTime: new Date(now + windowSeconds * 1000),
      };
    } catch (error) {
      this.logger.error(`Sliding window rate limit failed: ${error.message}`);
      return {
        allowed: true,
        remaining: points,
        resetTime: new Date(now + windowSeconds * 1000),
      };
    }
  }

  /**
   * Utility methods
   */

  private getKey(identifier: string, tier: string): string {
    return `${this.keyPrefix}${tier}:${identifier}`;
  }

  /**
   * Get all rate limit configurations
   */
  getConfigs(): Record<string, RateLimitConfig> {
    return { ...this.configs };
  }

  /**
   * Update rate limit configuration
   */
  updateConfig(tier: string, config: RateLimitConfig): void {
    this.configs[tier] = config;
    this.logger.log(`Updated rate limit config for tier: ${tier}`);
  }
}

