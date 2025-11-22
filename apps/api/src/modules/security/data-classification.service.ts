import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { DataClassification as DataClassificationEnum } from '@prisma/client';

@Injectable()
export class DataClassificationService {
  private readonly logger = new Logger(DataClassificationService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Classify document automatically with ML
   */
  async classifyDocument(documentId: string, content: string): Promise<any> {
    // ML-based classification
    const { classification, confidence } = await this.autoClassify(content);

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
   * Auto-classify content (ML-based in production)
   */
  async autoClassify(content: string): Promise<{ classification: DataClassificationEnum; confidence: number }> {
    // ML-based classification would use TensorFlow.js or external API
    // For now, use enhanced keyword-based classification

    const confidentialKeywords = ['confidential', 'secret', 'proprietary', 'private', 'sensitive'];
    const restrictedKeywords = ['top secret', 'classified', 'restricted', 'for internal use only'];
    const publicKeywords = ['public', 'published', 'open', 'disclosure'];

    const lowerContent = content.toLowerCase();
    let confidence = 0.5; // Base confidence

    // Check for restricted keywords
    for (const keyword of restrictedKeywords) {
      if (lowerContent.includes(keyword)) {
        confidence = 0.9;
        return { classification: DataClassificationEnum.RESTRICTED, confidence };
      }
    }

    // Check for confidential keywords
    let confidentialScore = 0;
    for (const keyword of confidentialKeywords) {
      if (lowerContent.includes(keyword)) {
        confidentialScore++;
      }
    }
    if (confidentialScore > 0) {
      confidence = Math.min(0.9, 0.6 + confidentialScore * 0.1);
      return { classification: DataClassificationEnum.CONFIDENTIAL, confidence };
    }

    // Check for public indicators
    for (const keyword of publicKeywords) {
      if (lowerContent.includes(keyword)) {
        confidence = 0.8;
        return { classification: DataClassificationEnum.PUBLIC, confidence };
      }
    }

    // Check for PII patterns (increases classification level)
    const piiPatterns = [
      /\b\d{3}-\d{2}-\d{4}\b/, // SSN
      /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/, // Credit card
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
    ];

    let piiCount = 0;
    for (const pattern of piiPatterns) {
      if (pattern.test(content)) {
        piiCount++;
      }
    }

    if (piiCount > 0) {
      confidence = Math.min(0.9, 0.7 + piiCount * 0.1);
      return { classification: DataClassificationEnum.CONFIDENTIAL, confidence };
    }

    // Default to internal
    return { classification: DataClassificationEnum.INTERNAL, confidence: 0.5 };
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

