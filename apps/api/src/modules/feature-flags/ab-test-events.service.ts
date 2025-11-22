import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { ABTestEvent } from '@prisma/client';
import { CacheService } from '../../services/cache.service';

@Injectable()
export class ABTestEventsService {
  private readonly logger = new Logger(ABTestEventsService.name);
  private readonly CACHE_TTL = 300; // 5 minutes
  private readonly BATCH_SIZE = 100;
  private eventBuffer: Map<string, ABTestEvent[]> = new Map();

  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {
    // Flush buffer every 30 seconds
    setInterval(() => this.flushBuffer(), 30000);
  }

  /**
   * Track conversion event
   */
  async trackEvent(
    experimentId: string,
    userId: string,
    variant: string,
    eventType: string,
    eventValue?: number,
    metadata?: any,
  ): Promise<ABTestEvent> {
    // Check for duplicate events (within 1 minute)
    const duplicateKey = `ab_event:${experimentId}:${userId}:${eventType}:${variant}`;
    const recentEvent = await this.cache.get(duplicateKey);
    if (recentEvent) {
      this.logger.debug(`Duplicate event detected: ${duplicateKey}`);
      return recentEvent as ABTestEvent;
    }

    // Create event
    const event = await this.prisma.aBTestEvent.create({
      data: {
        experimentId,
        userId,
        variant,
        eventType,
        eventValue: eventValue || null,
        metadata: metadata || {},
      },
    });

    // Cache to prevent duplicates
    await this.cache.set(duplicateKey, event, 60); // 1 minute

    // Update Redis counters for real-time aggregation
    await this.updateRedisCounters(experimentId, variant, eventType, eventValue);

    // Add to buffer for batch processing
    this.addToBuffer(event);

    return event;
  }

  /**
   * Get events for experiment
   */
  async getEvents(
    experimentId: string,
    filters?: {
      variant?: string;
      eventType?: string;
      startDate?: Date;
      endDate?: Date;
    },
  ): Promise<ABTestEvent[]> {
    const where: any = { experimentId };

    if (filters?.variant) {
      where.variant = filters.variant;
    }

    if (filters?.eventType) {
      where.eventType = filters.eventType;
    }

    if (filters?.startDate || filters?.endDate) {
      where.timestamp = {};
      if (filters.startDate) {
        where.timestamp.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.timestamp.lte = filters.endDate;
      }
    }

    return this.prisma.aBTestEvent.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: 10000, // Limit to prevent memory issues
    });
  }

  /**
   * Get aggregated event counts
   */
  async getEventCounts(
    experimentId: string,
    eventType: string,
  ): Promise<Record<string, { conversions: number; visitors: number }>> {
    const cacheKey = `ab_counts:${experimentId}:${eventType}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return cached as Record<string, { conversions: number; visitors: number }>;
    }

    // Get from Redis if available
    const redisCounts = await this.getRedisCounts(experimentId, eventType);
    if (redisCounts) {
      await this.cache.set(cacheKey, redisCounts, this.CACHE_TTL);
      return redisCounts;
    }

    // Fallback to database aggregation
    const events = await this.prisma.aBTestEvent.groupBy({
      by: ['variant'],
      where: {
        experimentId,
        eventType,
      },
      _count: {
        id: true,
      },
    });

    // Get unique visitors per variant
    const visitors = await this.prisma.aBTestEvent.groupBy({
      by: ['variant'],
      where: {
        experimentId,
      },
      _count: {
        userId: true,
      },
    });

    const counts: Record<string, { conversions: number; visitors: number }> = {};
    for (const event of events) {
      const visitorCount = visitors.find((v) => v.variant === event.variant)?._count.userId || 0;
      counts[event.variant] = {
        conversions: event._count.id,
        visitors: visitorCount,
      };
    }

    await this.cache.set(cacheKey, counts, this.CACHE_TTL);
    return counts;
  }

  /**
   * Update Redis counters for real-time aggregation
   */
  private async updateRedisCounters(
    experimentId: string,
    variant: string,
    eventType: string,
    eventValue?: number,
  ): Promise<void> {
    try {
      const conversionKey = `ab:${experimentId}:${variant}:${eventType}:conversions`;
      const valueKey = `ab:${experimentId}:${variant}:${eventType}:value`;

      await this.cache.increment(conversionKey);
      if (eventValue !== undefined) {
        await this.cache.incrementBy(valueKey, eventValue);
      }
    } catch (error) {
      this.logger.error(`Failed to update Redis counters: ${error.message}`);
    }
  }

  /**
   * Get counts from Redis
   */
  private async getRedisCounts(
    experimentId: string,
    eventType: string,
  ): Promise<Record<string, { conversions: number; visitors: number }> | null> {
    try {
      // This would require Redis pattern matching
      // For now, return null to fallback to database
      return null;
    } catch (error) {
      this.logger.error(`Failed to get Redis counts: ${error.message}`);
      return null;
    }
  }

  /**
   * Add event to buffer for batch processing
   */
  private addToBuffer(event: ABTestEvent): void {
    const key = `${event.experimentId}:${event.variant}`;
    if (!this.eventBuffer.has(key)) {
      this.eventBuffer.set(key, []);
    }
    this.eventBuffer.get(key)!.push(event);

    // Flush if buffer is full
    if (this.eventBuffer.get(key)!.length >= this.BATCH_SIZE) {
      this.flushBuffer(key);
    }
  }

  /**
   * Flush event buffer to database
   */
  private async flushBuffer(key?: string): Promise<void> {
    const keysToFlush = key ? [key] : Array.from(this.eventBuffer.keys());

    for (const bufferKey of keysToFlush) {
      const events = this.eventBuffer.get(bufferKey);
      if (!events || events.length === 0) continue;

      try {
        // Events are already saved, just clear buffer
        this.eventBuffer.set(bufferKey, []);
      } catch (error) {
        this.logger.error(`Failed to flush event buffer for ${bufferKey}: ${error.message}`);
      }
    }
  }
}

