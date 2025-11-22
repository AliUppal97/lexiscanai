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
   * Track usage in real-time using Redis
   */
  async trackUsage(
    tenantId: string,
    resourceType: ResourceType,
    quantity: bigint = BigInt(1),
  ): Promise<void> {
    const key = this.getRedisKey(tenantId, resourceType);

    try {
      // Use cache service to increment (if Redis available)
      const current = await this.cache.get<string>(key);
      const newValue = (current ? BigInt(current) : BigInt(0)) + quantity;
      await this.cache.set(key, newValue.toString(), 3600); // 1 hour TTL

      // Also add to batch buffer for PostgreSQL write
      const bufferKey = `${tenantId}:${resourceType}`;
      const bufferCurrent = this.usageBuffer.get(bufferKey) || BigInt(0);
      this.usageBuffer.set(bufferKey, bufferCurrent + quantity);
    } catch (error) {
      this.logger.error(`Failed to track usage in Redis: ${error.message}`, error.stack);
      // Fallback: write directly to PostgreSQL
      await this.writeUsageDirectly(tenantId, resourceType, quantity);
    }
  }

  /**
   * Get real-time usage from Redis
   */
  async getRealTimeUsage(tenantId: string, resourceType: ResourceType): Promise<bigint> {
    const key = this.getRedisKey(tenantId, resourceType);

    try {
      const value = await this.cache.get<string>(key);
      return value ? BigInt(value) : BigInt(0);
    } catch (error) {
      this.logger.error(`Failed to get real-time usage from Redis: ${error.message}`);
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
   * Flush usage buffer to PostgreSQL
   */
  private async flushUsageBuffer(): Promise<void> {
    if (this.usageBuffer.size === 0) {
      return;
    }

    const buffer = new Map(this.usageBuffer);
    this.usageBuffer.clear();

    try {
      // Batch write to PostgreSQL
      const records = Array.from(buffer.entries()).map(([key, quantity]) => {
        const [tenantId, resourceType] = key.split(':');
        return {
          tenantId,
          resourceType: resourceType as ResourceType,
          quantity,
          timestamp: new Date(),
          metadata: {},
        };
      });

      if (records.length > 0) {
        await this.prisma.usageRecord.createMany({
          data: records,
          skipDuplicates: true,
        });

        this.logger.debug(`Flushed ${records.length} usage records to PostgreSQL`);
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
   * Write usage directly to PostgreSQL (fallback)
   */
  private async writeUsageDirectly(
    tenantId: string,
    resourceType: ResourceType,
    quantity: bigint,
  ): Promise<void> {
    try {
      await this.prisma.usageRecord.create({
        data: {
          tenantId,
          resourceType,
          quantity,
          timestamp: new Date(),
          metadata: {},
        },
      });
    } catch (error) {
      this.logger.error(`Failed to write usage directly: ${error.message}`, error.stack);
    }
  }

  /**
   * Get Redis key for usage tracking
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

