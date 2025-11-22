import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { ABTest, ABTestStatus } from '@prisma/client';
import { CreateABTestDto } from './dto';

@Injectable()
export class ABTestService {
  private readonly logger = new Logger(ABTestService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Create A/B test experiment
   */
  async createExperiment(dto: CreateABTestDto): Promise<ABTest> {
    const experiment = await this.prisma.aBTest.create({
      data: {
        name: dto.name,
        description: dto.description,
        flagKeys: dto.flagKeys,
        variants: dto.variants,
        startDate: dto.startDate,
        endDate: dto.endDate,
        status: ABTestStatus.DRAFT,
        successMetrics: dto.successMetrics || {},
      },
    });

    return experiment;
  }

  /**
   * Assign user to variant
   */
  async assignVariant(userId: string, experimentId: string): Promise<string> {
    const experiment = await this.prisma.aBTest.findUnique({
      where: { id: experimentId },
    });

    if (!experiment) {
      throw new NotFoundException(`Experiment ${experimentId} not found`);
    }

    if (experiment.status !== ABTestStatus.RUNNING) {
      throw new Error(`Experiment is not running`);
    }

    // Use consistent hashing to assign variant
    const variants = Object.keys(experiment.variants as Record<string, any>);
    const hash = this.hashString(`${experimentId}:${userId}`);
    const variantIndex = hash % variants.length;
    const variant = variants[variantIndex];

    return variant;
  }

  /**
   * Track conversion event
   */
  async trackEvent(
    userId: string,
    experimentId: string,
    event: string,
    eventValue?: number,
    metadata?: any,
  ): Promise<void> {
    const experiment = await this.prisma.aBTest.findUnique({
      where: { id: experimentId },
    });

    if (!experiment) {
      throw new NotFoundException(`Experiment ${experimentId} not found`);
    }

    // Get user's assigned variant
    const variant = await this.assignVariant(userId, experimentId);

    // Track event using events service (will be injected)
    // This is a placeholder - actual implementation will use ABTestEventsService
    this.logger.debug(
      `Event tracked: ${event} for user ${userId} in experiment ${experimentId}, variant: ${variant}`,
    );
  }

  /**
   * Analyze experiment results
   */
  async analyzeResults(experimentId: string): Promise<any> {
    const experiment = await this.prisma.aBTest.findUnique({
      where: { id: experimentId },
    });

    if (!experiment) {
      throw new NotFoundException(`Experiment ${experimentId} not found`);
    }

    // TODO: Calculate statistical significance
    // TODO: Compare variant performance
    // TODO: Return analysis results

    return {
      experimentId,
      status: experiment.status,
      message: 'Analysis not yet implemented',
    };
  }

  /**
   * Hash string to number
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}

