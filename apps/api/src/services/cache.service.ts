import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private client: RedisClientType;
  private enabled: boolean;
  private readonly defaultTTL: number;
  private readonly keyPrefix: string;

  constructor(private configService: ConfigService) {
    this.enabled = !!this.configService.get<string>('REDIS_HOST');
    this.defaultTTL = this.configService.get<number>('CACHE_TTL', 3600); // 1 hour default
    this.keyPrefix = this.configService.get<string>('CACHE_PREFIX', 'lexiscan:');

    if (this.enabled) {
      this.initializeClient();
    } else {
      this.logger.warn('Redis is not configured. Caching will be disabled.');
    }
  }

  private async initializeClient(): Promise<void> {
    try {
      this.client = createClient({
        socket: {
          host: this.configService.get<string>('REDIS_HOST'),
          port: this.configService.get<number>('REDIS_PORT', 6379),
        },
        password: this.configService.get<string>('REDIS_PASSWORD'),
        database: this.configService.get<number>('REDIS_DB', 0),
      });

      this.client.on('error', (error) => {
        this.logger.error(`Redis client error: ${error.message}`);
      });

      this.client.on('connect', () => {
        this.logger.log('Redis client connected successfully');
      });

      await this.client.connect();
    } catch (error) {
      this.logger.error(`Failed to initialize Redis client: ${error.message}`);
      this.enabled = false;
    }
  }

  /**
   * Set a value in cache
   */
  async set(key: string, value: unknown, ttl?: number): Promise<boolean> {
    if (!this.enabled) {
      return false;
    }

    try {
      const fullKey = this.getFullKey(key);
      const serialized = JSON.stringify(value);
      const expiry = ttl || this.defaultTTL;

      await this.client.setEx(fullKey, expiry, serialized);

      this.logger.debug(`Cache set: ${fullKey} (TTL: ${expiry}s)`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to set cache: ${error.message}`);
      return false;
    }
  }

  /**
   * Get a value from cache
   */
  async get<T = unknown>(key: string): Promise<T | null> {
    if (!this.enabled) {
      return null;
    }

    try {
      const fullKey = this.getFullKey(key);
      const cached = await this.client.get(fullKey);

      if (!cached) {
        this.logger.debug(`Cache miss: ${fullKey}`);
        return null;
      }

      this.logger.debug(`Cache hit: ${fullKey}`);
      return JSON.parse(cached) as T;
    } catch (error) {
      this.logger.error(`Failed to get cache: ${error.message}`);
      return null;
    }
  }

  /**
   * Get multiple values from cache
   */
  async mget<T = unknown>(keys: string[]): Promise<(T | null)[]> {
    if (!this.enabled) {
      return keys.map(() => null);
    }

    try {
      const fullKeys = keys.map((key) => this.getFullKey(key));
      const values = await this.client.mGet(fullKeys);

      return values.map((value) => {
        if (!value) return null;
        try {
          return JSON.parse(value) as T;
        } catch {
          return null;
        }
      });
    } catch (error) {
      this.logger.error(`Failed to mget cache: ${error.message}`);
      return keys.map(() => null);
    }
  }

  /**
   * Delete a key from cache
   */
  async delete(key: string): Promise<boolean> {
    if (!this.enabled) {
      return false;
    }

    try {
      const fullKey = this.getFullKey(key);
      await this.client.del(fullKey);

      this.logger.debug(`Cache deleted: ${fullKey}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to delete cache: ${error.message}`);
      return false;
    }
  }

  /**
   * Delete a key from cache (alias for delete)
   */
  async del(key: string): Promise<boolean> {
    return this.delete(key);
  }

  /**
   * Delete multiple keys from cache
   */
  async deleteMany(keys: string[]): Promise<number> {
    if (!this.enabled) {
      return 0;
    }

    try {
      const fullKeys = keys.map((key) => this.getFullKey(key));
      const deleted = await this.client.del(fullKeys);

      this.logger.debug(`Cache deleted ${deleted} keys`);
      return deleted;
    } catch (error) {
      this.logger.error(`Failed to delete cache keys: ${error.message}`);
      return 0;
    }
  }

  /**
   * Delete keys by pattern
   */
  async deleteByPattern(pattern: string): Promise<number> {
    if (!this.enabled) {
      return 0;
    }

    try {
      const fullPattern = this.getFullKey(pattern);
      const keys = await this.client.keys(fullPattern);

      if (keys.length === 0) {
        return 0;
      }

      const deleted = await this.client.del(keys);
      this.logger.debug(`Cache deleted ${deleted} keys matching pattern: ${pattern}`);
      return deleted;
    } catch (error) {
      this.logger.error(`Failed to delete by pattern: ${error.message}`);
      return 0;
    }
  }

  /**
   * Check if a key exists
   */
  async exists(key: string): Promise<boolean> {
    if (!this.enabled) {
      return false;
    }

    try {
      const fullKey = this.getFullKey(key);
      const exists = await this.client.exists(fullKey);
      return exists === 1;
    } catch (error) {
      this.logger.error(`Failed to check cache existence: ${error.message}`);
      return false;
    }
  }

  /**
   * Get time to live for a key
   */
  async ttl(key: string): Promise<number> {
    if (!this.enabled) {
      return -1;
    }

    try {
      const fullKey = this.getFullKey(key);
      return await this.client.ttl(fullKey);
    } catch (error) {
      this.logger.error(`Failed to get TTL: ${error.message}`);
      return -1;
    }
  }

  /**
   * Set expiration for a key
   */
  async expire(key: string, ttl: number): Promise<boolean> {
    if (!this.enabled) {
      return false;
    }

    try {
      const fullKey = this.getFullKey(key);
      await this.client.expire(fullKey, ttl);
      return true;
    } catch (error) {
      this.logger.error(`Failed to set expiration: ${error.message}`);
      return false;
    }
  }

  /**
   * Increment a numeric value
   */
  async increment(key: string, amount: number = 1): Promise<number> {
    if (!this.enabled) {
      return 0;
    }

    try {
      const fullKey = this.getFullKey(key);
      return await this.client.incrBy(fullKey, amount);
    } catch (error) {
      this.logger.error(`Failed to increment: ${error.message}`);
      return 0;
    }
  }

  /**
   * Decrement a numeric value
   */
  async decrement(key: string, amount: number = 1): Promise<number> {
    if (!this.enabled) {
      return 0;
    }

    try {
      const fullKey = this.getFullKey(key);
      return await this.client.decrBy(fullKey, amount);
    } catch (error) {
      this.logger.error(`Failed to decrement: ${error.message}`);
      return 0;
    }
  }

  /**
   * Set operations
   */

  async sAdd(key: string, ...members: string[]): Promise<number> {
    if (!this.enabled) return 0;
    const fullKey = this.getFullKey(key);
    return await this.client.sAdd(fullKey, members);
  }

  async sMembers(key: string): Promise<string[]> {
    if (!this.enabled) return [];
    const fullKey = this.getFullKey(key);
    return await this.client.sMembers(fullKey);
  }

  async sIsMember(key: string, member: string): Promise<boolean> {
    if (!this.enabled) return false;
    const fullKey = this.getFullKey(key);
    return await this.client.sIsMember(fullKey, member);
  }

  async sRem(key: string, ...members: string[]): Promise<number> {
    if (!this.enabled) return 0;
    const fullKey = this.getFullKey(key);
    return await this.client.sRem(fullKey, members);
  }

  /**
   * Hash operations
   */

  async hSet(key: string, field: string, value: unknown): Promise<number> {
    if (!this.enabled) return 0;
    const fullKey = this.getFullKey(key);
    const serialized = JSON.stringify(value);
    return await this.client.hSet(fullKey, field, serialized);
  }

  async hGet<T = unknown>(key: string, field: string): Promise<T | null> {
    if (!this.enabled) return null;
    const fullKey = this.getFullKey(key);
    const value = await this.client.hGet(fullKey, field);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  }

  async hGetAll<T = unknown>(key: string): Promise<Record<string, T>> {
    if (!this.enabled) return {};
    const fullKey = this.getFullKey(key);
    const values = await this.client.hGetAll(fullKey);
    const result: Record<string, T> = {};

    for (const [field, value] of Object.entries(values)) {
      try {
        result[field] = JSON.parse(value) as T;
      } catch {
        result[field] = value as unknown as T;
      }
    }

    return result;
  }

  async hDel(key: string, ...fields: string[]): Promise<number> {
    if (!this.enabled) return 0;
    const fullKey = this.getFullKey(key);
    return await this.client.hDel(fullKey, fields);
  }

  /**
   * List operations
   */

  async lPush(key: string, ...values: unknown[]): Promise<number> {
    if (!this.enabled) return 0;
    const fullKey = this.getFullKey(key);
    const serialized = values.map((v) => JSON.stringify(v));
    return await this.client.lPush(fullKey, serialized);
  }

  async rPush(key: string, ...values: unknown[]): Promise<number> {
    if (!this.enabled) return 0;
    const fullKey = this.getFullKey(key);
    const serialized = values.map((v) => JSON.stringify(v));
    return await this.client.rPush(fullKey, serialized);
  }

  async lRange<T = unknown>(key: string, start: number, stop: number): Promise<T[]> {
    if (!this.enabled) return [];
    const fullKey = this.getFullKey(key);
    const values = await this.client.lRange(fullKey, start, stop);
    return values.map((v) => {
      try {
        return JSON.parse(v) as T;
      } catch {
        return v as unknown as T;
      }
    });
  }

  /**
   * Clear all cache (use with caution)
   */
  async clear(): Promise<boolean> {
    if (!this.enabled) {
      return false;
    }

    try {
      await this.client.flushDb();
      this.logger.warn('Cache cleared completely');
      return true;
    } catch (error) {
      this.logger.error(`Failed to clear cache: ${error.message}`);
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    keys: number;
    memory: string;
    hits: number;
    misses: number;
  } | null> {
    if (!this.enabled) {
      return null;
    }

    try {
      const info = await this.client.info('stats');
      const memory = await this.client.info('memory');
      const dbSize = await this.client.dbSize();

      // Parse Redis INFO output
      const hitsMatch = info.match(/keyspace_hits:(\d+)/);
      const missesMatch = info.match(/keyspace_misses:(\d+)/);
      const memoryMatch = memory.match(/used_memory_human:(\S+)/);

      return {
        keys: dbSize,
        memory: memoryMatch ? memoryMatch[1] : '0',
        hits: hitsMatch ? parseInt(hitsMatch[1]) : 0,
        misses: missesMatch ? parseInt(missesMatch[1]) : 0,
      };
    } catch (error) {
      this.logger.error(`Failed to get cache stats: ${error.message}`);
      return null;
    }
  }

  /**
   * Cache-aside pattern helper
   */
  async remember<T>(
    key: string,
    ttl: number,
    callback: () => Promise<T>,
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Execute callback and cache result
    const result = await callback();
    await this.set(key, result, ttl);

    return result;
  }

  /**
   * Utility methods
   */

  private getFullKey(key: string): string {
    return `${this.keyPrefix}${key}`;
  }

  async onModuleDestroy() {
    if (this.client && this.enabled) {
      await this.client.quit();
      this.logger.log('Redis client disconnected');
    }
  }

  /**
   * Health check
   */
  async isHealthy(): Promise<boolean> {
    if (!this.enabled) {
      return false;
    }

    try {
      await this.client.ping();
      return true;
    } catch {
      return false;
    }
  }
}

