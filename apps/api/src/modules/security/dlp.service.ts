import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { DlpPolicy, DlpAction } from '@prisma/client';

@Injectable()
export class DlpService {
  private readonly logger = new Logger(DlpService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Create DLP policy
   */
  async createPolicy(tenantId: string, dto: any): Promise<DlpPolicy> {
    const policy = await this.prisma.dlpPolicy.create({
      data: {
        name: dto.name,
        description: dto.description,
        rules: dto.rules || {},
        action: dto.action || DlpAction.WARN,
        tenantId,
        enabled: dto.enabled !== undefined ? dto.enabled : true,
      },
    });

    return policy;
  }

  /**
   * Evaluate DLP policy against document/content
   */
  async evaluatePolicy(documentId: string, content: string, tenantId: string): Promise<{
    violation: boolean;
    policy?: DlpPolicy;
    matchedRules?: any[];
  }> {
    const policies = await this.prisma.dlpPolicy.findMany({
      where: {
        tenantId,
        enabled: true,
      },
    });

    for (const policy of policies) {
      const matchedRules = this.matchRules(policy.rules as any, content);
      if (matchedRules.length > 0) {
        // Handle violation
        await this.handleViolation(documentId, policy, matchedRules, tenantId);
        return {
          violation: true,
          policy,
          matchedRules,
        };
      }
    }

    return { violation: false };
  }

  /**
   * Scan document for DLP violations (supports multiple content types)
   */
  async scanDocument(documentId: string, tenantId: string, content?: string): Promise<any> {
    // Get document content if not provided
    if (!content) {
      // TODO: Fetch document content from storage
      // For now, use placeholder
      content = '';
    }

    // Detect content type and extract text
    const extractedContent = await this.extractText(content, 'text/plain');

    // Evaluate DLP policies
    const result = await this.evaluatePolicy(documentId, extractedContent, tenantId);

    // Scan for data patterns
    const dataPatterns = this.detectDataPatterns(extractedContent);

    return {
      ...result,
      dataPatterns,
      scannedAt: new Date(),
    };
  }

  /**
   * Extract text from content (supports PDF, images with OCR)
   */
  private async extractText(content: string, contentType: string): Promise<string> {
    // In production, use libraries like pdf-parse for PDF, tesseract.js for OCR
    if (contentType.includes('pdf')) {
      // TODO: Extract text from PDF
      return content; // Placeholder
    } else if (contentType.includes('image')) {
      // TODO: OCR image content
      return content; // Placeholder
    }
    return content;
  }

  /**
   * Detect data patterns (SSN, credit cards, emails, PII)
   */
  private detectDataPatterns(content: string): Array<{ type: string; pattern: string; count: number }> {
    const patterns: Array<{ type: string; pattern: string; count: number }> = [];

    // SSN pattern
    const ssnMatches = content.match(/\b\d{3}-\d{2}-\d{4}\b/g);
    if (ssnMatches) {
      patterns.push({ type: 'SSN', pattern: 'XXX-XX-XXXX', count: ssnMatches.length });
    }

    // Credit card pattern
    const ccMatches = content.match(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g);
    if (ccMatches) {
      patterns.push({ type: 'CREDIT_CARD', pattern: 'XXXX-XXXX-XXXX-XXXX', count: ccMatches.length });
    }

    // Email pattern
    const emailMatches = content.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g);
    if (emailMatches) {
      patterns.push({ type: 'EMAIL', pattern: 'email@domain.com', count: emailMatches.length });
    }

    // Phone number pattern
    const phoneMatches = content.match(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g);
    if (phoneMatches) {
      patterns.push({ type: 'PHONE', pattern: 'XXX-XXX-XXXX', count: phoneMatches.length });
    }

    return patterns;
  }

  /**
   * Batch scan documents
   */
  async batchScanDocuments(documentIds: string[], tenantId: string): Promise<any[]> {
    const results = await Promise.all(
      documentIds.map((id) => this.scanDocument(id, tenantId)),
    );
    return results;
  }

  /**
   * Match rules against content
   */
  private matchRules(rules: any, content: string): any[] {
    const matched: any[] = [];

    if (rules.patterns) {
      for (const pattern of rules.patterns) {
        const regex = new RegExp(pattern.regex, pattern.flags || 'gi');
        if (regex.test(content)) {
          matched.push(pattern);
        }
      }
    }

    if (rules.keywords) {
      for (const keyword of rules.keywords) {
        if (content.toLowerCase().includes(keyword.toLowerCase())) {
          matched.push({ type: 'keyword', value: keyword });
        }
      }
    }

    // Check for data patterns (SSN, credit cards, etc.)
    const dataPatterns = this.checkDataPatterns(content);
    matched.push(...dataPatterns);

    return matched;
  }

  /**
   * Check for common data patterns
   */
  private checkDataPatterns(content: string): any[] {
    const patterns: any[] = [];

    // SSN pattern
    const ssnPattern = /\b\d{3}-\d{2}-\d{4}\b/;
    if (ssnPattern.test(content)) {
      patterns.push({ type: 'ssn', pattern: 'SSN' });
    }

    // Credit card pattern
    const ccPattern = /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/;
    if (ccPattern.test(content)) {
      patterns.push({ type: 'credit_card', pattern: 'Credit Card' });
    }

    // Email pattern
    const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    if (emailPattern.test(content)) {
      patterns.push({ type: 'email', pattern: 'Email Address' });
    }

    return patterns;
  }

  /**
   * Handle DLP violation
   */
  private async handleViolation(
    documentId: string,
    policy: DlpPolicy,
    matchedRules: any[],
    tenantId: string,
  ): Promise<void> {
    // Create security incident
    await this.prisma.securityIncident.create({
      data: {
        type: 'DLP_VIOLATION',
        severity: 'HIGH',
        status: 'OPEN',
        details: {
          documentId,
          policyId: policy.id,
          policyName: policy.name,
          matchedRules,
        },
        tenantId,
      },
    });

    // Execute action based on policy
    switch (policy.action) {
      case DlpAction.BLOCK:
        this.logger.warn(`DLP violation blocked for document ${documentId}`);
        // TODO: Block document access
        break;
      case DlpAction.WARN:
        this.logger.warn(`DLP violation warning for document ${documentId}`);
        // TODO: Send warning notification
        break;
      case DlpAction.AUDIT:
        this.logger.info(`DLP violation audited for document ${documentId}`);
        // Already logged in security incident
        break;
    }
  }
}

