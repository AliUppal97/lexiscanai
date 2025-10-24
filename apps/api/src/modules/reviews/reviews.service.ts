import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateReviewDto, UpdateReviewDto, QueryReviewsDto } from './dto';
import { Review, ReviewStatus } from '@prisma/client';

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);

  constructor(private prisma: PrismaService) {}

  async create(
    tenantId: string,
    userId: string,
    dto: CreateReviewDto,
  ): Promise<Review> {
    // Verify document exists
    const document = await this.prisma.document.findFirst({
      where: {
        id: dto.documentId,
        tenantId,
      },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    const review = await this.prisma.review.create({
      data: {
        documentId: dto.documentId,
        userId,
        tenantId,
        status: dto.status || ReviewStatus.PENDING,
        score: dto.score,
        feedback: dto.feedback,
      },
    });

    this.logger.log(`Review created: ${review.id}`);
    return review;
  }

  async findAll(
    tenantId: string,
    query: QueryReviewsDto,
  ): Promise<{
    reviews: Review[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { status, documentId, userId, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = { tenantId };
    if (status) where.status = status;
    if (documentId) where.documentId = documentId;
    if (userId) where.userId = userId;

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          document: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.review.count({ where }),
    ]);

    return {
      reviews,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(tenantId: string, id: string): Promise<Review> {
    const review = await this.prisma.review.findFirst({
      where: { id, tenantId },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
        document: { select: { id: true, title: true } },
      },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }

  async update(
    tenantId: string,
    id: string,
    userId: string,
    dto: UpdateReviewDto,
  ): Promise<Review> {
    const existing = await this.findOne(tenantId, id);

    if (existing.userId !== userId) {
      throw new ForbiddenException('You do not have permission to update this review');
    }

    const updated = await this.prisma.review.update({
      where: { id },
      data: {
        status: dto.status,
        score: dto.score,
        feedback: dto.feedback,
        updatedAt: new Date(),
      },
    });

    this.logger.log(`Review updated: ${id}`);
    return updated;
  }

  async remove(tenantId: string, id: string, userId: string): Promise<void> {
    const existing = await this.findOne(tenantId, id);

    if (existing.userId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this review');
    }

    await this.prisma.review.delete({ where: { id } });
    this.logger.log(`Review deleted: ${id}`);
  }
}

