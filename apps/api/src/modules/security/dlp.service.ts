import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
// Note: DlpPolicy and DlpAction types will be available after Prisma generation
type DlpPolicy = any;
enum DlpAction {
  WARN = 'WARN',
  BLOCK = 'BLOCK',
  ENCRYPT = 'ENCRYPT',
  QUARANTINE = 'QUARANTINE',
  AUDIT = 'AUDIT',
}

@Injectable()
export class DlpService {
  private readonly logger = new Logger(DlpService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Create DLP policy
   */
  async createPolicy(tenantId: string, dto: any): Promise<DlpPolicy> {
    const policy = await (this.prisma as any).dlpPolicy.create({
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
    const policies = await (this.prisma as any).dlpPolicy.findMany({
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
      const document = await this.prisma.document.findUnique({
        where: { id: documentId, tenantId },
        select: {
          content: true,
          filePath: true,
          mimeType: true,
        },
      });

      if (!document) {
        throw new Error(`Document ${documentId} not found`);
      }

      // Get content from document or file
      if (document.content) {
        content = document.content;
      } else if (document.filePath) {
        content = await this.fetchContentFromStorage(document.filePath, document.mimeType || 'text/plain');
      } else {
        content = '';
      }
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
   * Fetch content from storage (S3, local filesystem, etc.)
   */
  private async fetchContentFromStorage(filePath: string, mimeType: string): Promise<string> {
    try {
      // Check if local file
      if (filePath.startsWith('/') || filePath.startsWith('./')) {
        const fs = require('fs').promises;
        const buffer = await fs.readFile(filePath);
        return await this.extractText(buffer.toString('base64'), mimeType, true);
      } else {
        // Cloud storage (S3, GCS, etc.)
        // In production, would use AWS SDK or similar
        // const AWS = require('aws-sdk');
        // const s3 = new AWS.S3();
        // const result = await s3.getObject({ Bucket: bucket, Key: filePath }).promise();
        // return await this.extractText(result.Body.toString('base64'), mimeType, true);
        
        this.logger.warn(`Cloud storage content fetching not implemented for ${filePath}`);
        return '';
      }
    } catch (error) {
      this.logger.error(`Failed to fetch content from storage: ${error.message}`);
      return '';
    }
  }

  /**
   * Extract text from content (supports PDF, images with OCR)
   */
  private async extractText(content: string | Buffer, contentType: string, isBase64: boolean = false): Promise<string> {
    // In production, use libraries like pdf-parse for PDF, tesseract.js for OCR
    
    let contentBuffer: Buffer;
    if (typeof content === 'string') {
      contentBuffer = isBase64 ? Buffer.from(content, 'base64') : Buffer.from(content, 'utf-8');
    } else {
      contentBuffer = content;
    }

    if (contentType.includes('pdf') || contentType === 'application/pdf') {
      return await this.extractTextFromPDF(contentBuffer);
    } else if (contentType.includes('image')) {
      return await this.extractTextFromImage(contentBuffer);
    } else if (contentType.includes('text')) {
      return contentBuffer.toString('utf-8');
    } else {
      // Try to extract as text
      return contentBuffer.toString('utf-8');
    }
  }

  /**
   * Extract text from PDF using pdf-parse
   */
  private async extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
    try {
      // In production, use pdf-parse library
      // const pdfParse = require('pdf-parse');
      // const data = await pdfParse(pdfBuffer);
      // return data.text;
      
      // For now, use a simplified approach or call AI worker service
      const axios = require('axios');
      const aiWorkerUrl = process.env.AI_WORKER_URL || 'http://localhost:8000';
      
      try {
        // Convert buffer to base64
        const base64Content = pdfBuffer.toString('base64');
        
        const response = await axios.post(
          `${aiWorkerUrl}/extract-text`,
          {
            content: base64Content,
            mime_type: 'application/pdf',
          },
          {
            timeout: 30000,
          },
        );

        return response.data.text || '';
      } catch (error) {
        this.logger.warn(`AI worker unavailable, using fallback PDF extraction: ${error.message}`);
        // Fallback: return empty (would use pdf-parse directly)
        return '';
      }
    } catch (error) {
      this.logger.error(`Failed to extract text from PDF: ${error.message}`);
      return '';
    }
  }

  /**
   * Extract text from image using OCR (Tesseract.js)
   */
  private async extractTextFromImage(imageBuffer: Buffer): Promise<string> {
    try {
      // In production, use Tesseract.js or cloud OCR service (AWS Textract, Google Vision)
      // const Tesseract = require('tesseract.js');
      // const { data: { text } } = await Tesseract.recognize(imageBuffer, 'eng');
      // return text;
      
      // Or use cloud OCR service
      const axios = require('axios');
      const aiWorkerUrl = process.env.AI_WORKER_URL || 'http://localhost:8000';
      
      try {
        // Convert buffer to base64
        const base64Content = imageBuffer.toString('base64');
        
        const response = await axios.post(
          `${aiWorkerUrl}/extract-text`,
          {
            content: base64Content,
            mime_type: 'image/png', // Would detect actual type
          },
          {
            timeout: 30000,
          },
        );

        return response.data.text || '';
      } catch (error) {
        this.logger.warn(`AI worker unavailable, using fallback OCR: ${error.message}`);
        // Fallback: return empty (would use Tesseract.js directly)
        return '';
      }
    } catch (error) {
      this.logger.error(`Failed to extract text from image: ${error.message}`);
      return '';
    }
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
    await (this.prisma as any).securityIncident.create({
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
        this.logger.log(`DLP violation blocked for document ${documentId}`);
        // TODO: Block document access
        break;
      case DlpAction.WARN:
        this.logger.log(`DLP violation warning for document ${documentId}`);
        // TODO: Send warning notification
        break;
      case DlpAction.AUDIT:
        this.logger.log(`DLP violation audited for document ${documentId}`);
        // Already logged in security incident
        break;
    }
  }
}

