import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CustomerJourney, CustomerJourneyStage } from '@prisma/client';

@Injectable()
export class CustomerJourneyService {
  private readonly logger = new Logger(CustomerJourneyService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Track journey stage
   */
  async trackStage(tenantId: string, stage: CustomerJourneyStage, metadata?: any): Promise<CustomerJourney> {
    // End current stage if exists
    await this.prisma.customerJourney.updateMany({
      where: {
        tenantId,
        exitedAt: null,
      },
      data: {
        exitedAt: new Date(),
      },
    });

    // Create new stage
    const journey = await this.prisma.customerJourney.create({
      data: {
        tenantId,
        stage,
        metadata: metadata || {},
      },
    });

    return journey;
  }

  /**
   * Get customer journey
   */
  async getJourney(tenantId: string): Promise<CustomerJourney[]> {
    return this.prisma.customerJourney.findMany({
      where: { tenantId },
      orderBy: { enteredAt: 'asc' },
    });
  }

  /**
   * Get journey analytics
   */
  async getJourneyAnalytics(): Promise<any> {
    const journeys = await this.prisma.customerJourney.findMany({
      where: {
        exitedAt: null, // Current stage
      },
    });

    const stageDistribution: Record<string, number> = {};
    for (const journey of journeys) {
      stageDistribution[journey.stage] = (stageDistribution[journey.stage] || 0) + 1;
    }

    return {
      stageDistribution,
      totalCustomers: journeys.length,
    };
  }
}

