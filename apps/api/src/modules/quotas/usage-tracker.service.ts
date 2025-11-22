import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CacheService } from '../../services/cache.service';
import { ResourceType } from '@prisma/client';

@Injectable()
export class UsageTrackerService implements OnModuleDestroy {
  private readonly logger = new Logger(UsageTrackerService.name);
  private readonly BATCH_WRITE_INTERVAL = 30000; // 30 seconds
  private batchWriteTimer?: NodeJS.Timeout;
  private usageBuffer: Map<string, bigint> = new Map();

  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {
    // Start batch write timer
    this.startBatchWriteTimer();
  }

  /**
   * Track usage in real-time using Redis with atomic operations
   */
  async trackUsage(
    tenantId: string,
    resourceType: ResourceType,
    quantity: bigint = BigInt(1),
    metadata?: Record<string, any>,
  ): Promise<void> {
    const now = new Date();
    const period = this.getCurrentPeriod(now);
    const timestampKey = this.getTimestampKey(now);
    
    // Redis key format: usage:{tenantId}:{resourceType}:{period}:{timestamp}
    const redisKey = `usage:${tenantId}:${resourceType}:${period}:${timestampKey}`;

    try {
      // Use atomic Redis INCRBY operation
      await this.cache.increment(redisKey, Number(quantity));
      
      // Set expiration (keep for 90 days)
      await this.cache.expire(redisKey, 90 * 24 * 60 * 60);

      // Also add to batch buffer for PostgreSQL write
      const bufferKey = `${tenantId}:${resourceType}:${period}`;
      const bufferCurrent = this.usageBuffer.get(bufferKey) || BigInt(0);
      this.usageBuffer.set(bufferKey, bufferCurrent + quantity);

      // Queue for batch persistence (async)
      this.queueBatchWrite({
        tenantId,
        resourceType,
        quantity,
        timestamp: now,
        metadata,
        period,
      }).catch((error) => {
        this.logger.warn(`Failed to queue batch write: ${error.message}`);
      });
    } catch (error) {
      this.logger.error(`Failed to track usage in Redis: ${error.message}`, error.stack);
      // Fallback: write directly to PostgreSQL
      await this.writeUsageDirectly(tenantId, resourceType, quantity, metadata);
    }
  }

  /**
   * Get real-time usage from Redis (aggregated across all periods)
   */
  async getRealTimeUsage(
    tenantId: string,
    resourceType: ResourceType,
    period?: 'daily' | 'monthly' | 'yearly',
  ): Promise<bigint> {
    const now = new Date();
    const targetPeriod = period || this.getCurrentPeriod(now);
    const timestampKey = this.getTimestampKey(now, targetPeriod);
    
    const redisKey = `usage:${tenantId}:${resourceType}:${targetPeriod}:${timestampKey}`;

    try {
      const value = await this.cache.get<string>(redisKey);
      if (value) {
        return BigInt(value);
      }

      // Fallback to PostgreSQL if Redis unavailable
      return await this.getUsageFromDatabase(tenantId, resourceType, targetPeriod);
    } catch (error) {
      this.logger.error(`Failed to get real-time usage from Redis: ${error.message}`);
      // Fallback to PostgreSQL
      return await this.getUsageFromDatabase(tenantId, resourceType, targetPeriod);
    }
  }

  /**
   * Get usage from database (fallback)
   */
  private async getUsageFromDatabase(
    tenantId: string,
    resourceType: ResourceType,
    period: string,
  ): Promise<bigint> {
    try {
      const now = new Date();
      let startDate: Date;

      switch (period) {
        case 'daily':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'monthly':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'yearly':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      }

      const records = await this.prisma.usageRecord.findMany({
        where: {
          tenantId,
          resourceType,
          timestamp: {
            gte: startDate,
          },
        },
        select: {
          quantity: true,
        },
      });

      return records.reduce((sum, record) => sum + record.quantity, BigInt(0));
    } catch (error) {
      this.logger.error(`Failed to get usage from database: ${error.message}`);
      return BigInt(0);
    }
  }

  /**
   * Start batch write timer
   */
  private startBatchWriteTimer(): void {
    this.batchWriteTimer = setInterval(() => {
      this.flushUsageBuffer().catch((error) => {
        this.logger.error(`Failed to flush usage buffer: ${error.message}`, error.stack);
      });
    }, this.BATCH_WRITE_INTERVAL);
  }

  /**
   * Flush usage buffer to PostgreSQL with aggregation
   */
  private async flushUsageBuffer(): Promise<void> {
    if (this.usageBuffer.size === 0) {
      return;
    }

    const buffer = new Map(this.usageBuffer);
    this.usageBuffer.clear();

    try {
      // Aggregate by tenant/resource/period
      const aggregated = new Map<string, { tenantId: string; resourceType: ResourceType; quantity: bigint; period: string }>();
      
      for (const [key, quantity] of buffer.entries()) {
        const [tenantId, resourceType, period] = key.split(':');
        const aggKey = `${tenantId}:${resourceType}:${period}`;
        
        const existing = aggregated.get(aggKey);
        if (existing) {
          existing.quantity += quantity;
        } else {
          aggregated.set(aggKey, {
            tenantId,
            resourceType: resourceType as ResourceType,
            quantity,
            period: period || 'daily',
          });
        }
      }

      // Batch write to PostgreSQL
      const records = Array.from(aggregated.values()).map((agg) => ({
        tenantId: agg.tenantId,
        resourceType: agg.resourceType,
        quantity: agg.quantity,
        timestamp: new Date(),
        metadata: { period: agg.period },
      }));

      if (records.length > 0) {
        await this.prisma.usageRecord.createMany({
          data: records,
          skipDuplicates: true,
        });

        this.logger.debug(`Flushed ${records.length} aggregated usage records to PostgreSQL`);
      }
    } catch (error) {
      this.logger.error(`Failed to flush usage buffer: ${error.message}`, error.stack);
      // Re-add to buffer for retry
      buffer.forEach((value, key) => {
        const current = this.usageBuffer.get(key) || BigInt(0);
        this.usageBuffer.set(key, current + value);
      });
    }
  }

  /**
   * Queue batch write (async)
   */
  private async queueBatchWrite(data: {
    tenantId: string;
    resourceType: ResourceType;
    quantity: bigint;
    timestamp: Date;
    metadata?: Record<string, any>;
    period: string;
  }): Promise<void> {
    // In production, would use BullMQ queue
    // For now, just add to buffer
    const bufferKey = `${data.tenantId}:${data.resourceType}:${data.period}`;
    const current = this.usageBuffer.get(bufferKey) || BigInt(0);
    this.usageBuffer.set(bufferKey, current + data.quantity);
  }

  /**
   * Get current period (daily, monthly, yearly)
   */
  private getCurrentPeriod(date: Date): 'daily' | 'monthly' | 'yearly' {
    // Default to daily for real-time tracking
    return 'daily';
  }

  /**
   * Get timestamp key for Redis
   */
  private getTimestampKey(date: Date, period: 'daily' | 'monthly' | 'yearly' = 'daily'): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    switch (period) {
      case 'daily':
        return `${year}-${month}-${day}`;
      case 'monthly':
        return `${year}-${month}`;
      case 'yearly':
        return `${year}`;
      default:
        return `${year}-${month}-${day}`;
    }
  }

  /**
   * Write usage directly to PostgreSQL (fallback)
   */
  private async writeUsageDirectly(
    tenantId: string,
    resourceType: ResourceType,
    quantity: bigint,
    metadata?: Record<string, any>,
  ): Promise<void> {
    try {
      await this.prisma.usageRecord.create({
        data: {
          tenantId,
          resourceType,
          quantity,
          timestamp: new Date(),
          metadata: metadata || {},
        },
      });
    } catch (error) {
      this.logger.error(`Failed to write usage directly: ${error.message}`, error.stack);
    }
  }

  /**
   * Get Redis key for usage tracking (deprecated - use trackUsage instead)
   */
  private getRedisKey(tenantId: string, resourceType: ResourceType): string {
    return `usage:realtime:${tenantId}:${resourceType}`;
  }

  /**
   * Cleanup on module destroy
   */
  async onModuleDestroy(): Promise<void> {
    if (this.batchWriteTimer) {
      clearInterval(this.batchWriteTimer);
    }
    // Flush remaining buffer
    try {
      await this.flushUsageBuffer();
    } catch (error) {
      this.logger.error(`Failed to flush usage buffer on destroy: ${error.message}`);
    }
  }
}

