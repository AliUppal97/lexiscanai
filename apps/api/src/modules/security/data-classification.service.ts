import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { DataClassification as DataClassificationEnum } from '@prisma/client';

@Injectable()
export class DataClassificationService {
  private readonly logger = new Logger(DataClassificationService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Classify document automatically
   */
  async classifyDocument(documentId: string, content: string): Promise<any> {
    // Simple classification logic - in production use ML model
    const classification = this.autoClassify(content);
    const confidence = this.calculateConfidence(content, classification);

    const result = await this.prisma.documentClassification.upsert({
      where: { documentId },
      update: {
        classification,
        confidence,
        classifiedAt: new Date(),
        classifiedBy: 'system',
      },
      create: {
        documentId,
        classification,
        confidence,
        classifiedBy: 'system',
      },
    });

    return result;
  }

  /**
   * Auto-classify content
   */
  autoClassify(content: string): DataClassificationEnum {
    // Simple keyword-based classification
    const confidentialKeywords = ['confidential', 'secret', 'proprietary', 'private'];
    const restrictedKeywords = ['top secret', 'classified', 'restricted'];

    const lowerContent = content.toLowerCase();

    for (const keyword of restrictedKeywords) {
      if (lowerContent.includes(keyword)) {
        return DataClassificationEnum.RESTRICTED;
      }
    }

    for (const keyword of confidentialKeywords) {
      if (lowerContent.includes(keyword)) {
        return DataClassificationEnum.CONFIDENTIAL;
      }
    }

    // Check for public indicators
    if (lowerContent.includes('public') || lowerContent.includes('published')) {
      return DataClassificationEnum.PUBLIC;
    }

    // Default to internal
    return DataClassificationEnum.INTERNAL;
  }

  /**
   * Calculate classification confidence
   */
  private calculateConfidence(content: string, classification: DataClassificationEnum): number {
    // Simplified confidence calculation
    // In production, use ML model confidence scores
    return 0.8; // Default confidence
  }

  /**
   * Get classification for document
   */
  async getClassification(documentId: string): Promise<any> {
    return this.prisma.documentClassification.findUnique({
      where: { documentId },
    });
  }

  /**
   * Update classification manually
   */
  async updateClassification(
    documentId: string,
    classification: DataClassificationEnum,
    userId: string,
  ): Promise<any> {
    return this.prisma.documentClassification.upsert({
      where: { documentId },
      update: {
        classification,
        classifiedBy: userId,
        classifiedAt: new Date(),
      },
      create: {
        documentId,
        classification,
        classifiedBy: userId,
      },
    });
  }
}

