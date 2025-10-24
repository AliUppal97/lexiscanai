import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { ConfigService } from '@nestjs/config';
import { DocumentStatus } from '@prisma/client';
import * as pdfParse from 'pdf-parse';
import * as fs from 'fs/promises';

export interface ProcessingResult {
  text: string;
  pageCount: number;
  wordCount: number;
  metadata: any;
}

export interface AIAnalysisResult {
  summary: string;
  keyPoints: string[];
  entities: Array<{ type: string; value: string }>;
  sentiment: string;
  category: string;
}

@Injectable()
export class ProcessingService {
  private readonly logger = new Logger(ProcessingService.name);
  private readonly aiEnabled: boolean;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.aiEnabled = !!this.configService.get<string>('OPENAI_API_KEY');

    if (!this.aiEnabled) {
      this.logger.warn('AI processing is not configured. AI features will be limited.');
    }
  }

  /**
   * Process a document (extract text, analyze, generate embeddings)
   */
  async processDocument(documentId: string): Promise<ProcessingResult> {
    this.logger.log(`Processing document ${documentId}`);

    try {
      // Get document details
      const document = await this.prisma.document.findUnique({
        where: { id: documentId },
      });

      if (!document) {
        throw new Error('Document not found');
      }

      // Update status to processing
      await this.updateDocumentStatus(documentId, DocumentStatus.PROCESSING);

      // Extract text based on mime type
      let processingResult: ProcessingResult;

      if (document.mimeType === 'application/pdf') {
        processingResult = await this.processPDF(document.filePath);
      } else if (document.mimeType?.includes('word')) {
        processingResult = await this.processWord(document.filePath);
      } else if (document.mimeType === 'text/plain') {
        processingResult = await this.processText(document.filePath);
      } else {
        throw new Error(`Unsupported file type: ${document.mimeType}`);
      }

      // Update document with extracted content
      await this.prisma.document.update({
        where: { id: documentId },
        data: {
          content: processingResult.text,
          status: DocumentStatus.PROCESSED,
        },
      });

      // Generate embeddings for semantic search
      await this.generateEmbeddings(documentId, processingResult.text, document.tenantId);

      // Perform AI analysis if enabled
      if (this.aiEnabled) {
        await this.performAIAnalysis(documentId, processingResult.text, document.tenantId);
      }

      this.logger.log(`Successfully processed document ${documentId}`);

      return processingResult;
    } catch (error) {
      this.logger.error(`Failed to process document ${documentId}: ${error.message}`);

      // Update status to failed
      await this.updateDocumentStatus(documentId, DocumentStatus.FAILED);

      throw new InternalServerErrorException('Document processing failed');
    }
  }

  /**
   * Process PDF document
   */
  private async processPDF(filePath: string): Promise<ProcessingResult> {
    try {
      // For local files
      if (!filePath.startsWith('s3://')) {
        const fileBuffer = await fs.readFile(filePath);
        const data = await pdfParse(fileBuffer);

        return {
          text: data.text,
          pageCount: data.numpages,
          wordCount: data.text.split(/\s+/).length,
          metadata: data.info,
        };
      }

      // For S3 files, would need to download first
      // In production, stream from S3
      this.logger.log(`Mock PDF processing for S3 file: ${filePath}`);

      return {
        text: 'Mock extracted text from PDF',
        pageCount: 10,
        wordCount: 500,
        metadata: {},
      };
    } catch (error) {
      this.logger.error(`PDF processing failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Process Word document
   */
  private async processWord(filePath: string): Promise<ProcessingResult> {
    try {
      // In production, use mammoth library:
      // const mammoth = require('mammoth');
      // const result = await mammoth.extractRawText({ path: filePath });

      this.logger.log(`Mock Word processing for file: ${filePath}`);

      return {
        text: 'Mock extracted text from Word document',
        pageCount: 5,
        wordCount: 300,
        metadata: {},
      };
    } catch (error) {
      this.logger.error(`Word processing failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Process plain text
   */
  private async processText(filePath: string): Promise<ProcessingResult> {
    try {
      const text = await fs.readFile(filePath, 'utf-8');

      return {
        text,
        pageCount: 1,
        wordCount: text.split(/\s+/).length,
        metadata: {},
      };
    } catch (error) {
      this.logger.error(`Text processing failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate embeddings for semantic search
   */
  private async generateEmbeddings(
    documentId: string,
    text: string,
    tenantId: string,
  ): Promise<void> {
    try {
      // Split text into chunks (1000 words per chunk)
      const chunks = this.chunkText(text, 1000);

      // In production, generate embeddings using OpenAI or similar:
      // const embeddings = await this.generateEmbeddingVectors(chunks);

      // Store embeddings in database
      for (let i = 0; i < chunks.length; i++) {
        await this.prisma.embedding.create({
          data: {
            documentId,
            tenantId,
            chunkIndex: i,
            chunkText: chunks[i],
            embedding: this.generateMockEmbedding(), // Mock 1536-dimensional vector
            metadata: {
              wordCount: chunks[i].split(/\s+/).length,
            },
          },
        });
      }

      this.logger.log(`Generated ${chunks.length} embeddings for document ${documentId}`);
    } catch (error) {
      this.logger.error(`Embedding generation failed: ${error.message}`);
      // Don't throw - embeddings are optional
    }
  }

  /**
   * Perform AI analysis on document
   */
  private async performAIAnalysis(
    documentId: string,
    text: string,
    tenantId: string,
  ): Promise<AIAnalysisResult> {
    try {
      // In production, use OpenAI or similar:
      // const completion = await openai.chat.completions.create({
      //   model: "gpt-4",
      //   messages: [
      //     { role: "system", content: "You are a legal document analyzer." },
      //     { role: "user", content: `Analyze this document: ${text}` }
      //   ]
      // });

      this.logger.log(`Mock AI analysis for document ${documentId}`);

      const mockAnalysis: AIAnalysisResult = {
        summary: 'This is a legal contract document...',
        keyPoints: [
          'Contract duration: 12 months',
          'Payment terms: Net 30',
          'Liability clauses included',
        ],
        entities: [
          { type: 'ORGANIZATION', value: 'Acme Corp' },
          { type: 'DATE', value: '2024-01-01' },
          { type: 'MONEY', value: '$10,000' },
        ],
        sentiment: 'neutral',
        category: 'legal_contract',
      };

      // Store analysis results in metadata or separate table
      await this.prisma.document.update({
        where: { id: documentId },
        data: {
          content: text.substring(0, 10000), // Store first 10k chars
        },
      });

      return mockAnalysis;
    } catch (error) {
      this.logger.error(`AI analysis failed: ${error.message}`);
      // Return default result if AI fails
      return {
        summary: 'Analysis unavailable',
        keyPoints: [],
        entities: [],
        sentiment: 'unknown',
        category: 'unknown',
      };
    }
  }

  /**
   * Helper methods
   */
  private chunkText(text: string, wordsPerChunk: number): string[] {
    const words = text.split(/\s+/);
    const chunks: string[] = [];

    for (let i = 0; i < words.length; i += wordsPerChunk) {
      chunks.push(words.slice(i, i + wordsPerChunk).join(' '));
    }

    return chunks;
  }

  private generateMockEmbedding(): number[] {
    // Generate mock 1536-dimensional embedding vector (OpenAI ada-002 dimensions)
    return Array.from({ length: 1536 }, () => Math.random() * 2 - 1);
  }

  private async updateDocumentStatus(
    documentId: string,
    status: DocumentStatus,
  ): Promise<void> {
    await this.prisma.document.update({
      where: { id: documentId },
      data: { status },
    });
  }

  /**
   * Reprocess a document
   */
  async reprocessDocument(documentId: string): Promise<ProcessingResult> {
    this.logger.log(`Reprocessing document ${documentId}`);
    return this.processDocument(documentId);
  }

  /**
   * Get processing status
   */
  async getProcessingStatus(documentId: string): Promise<{
    status: DocumentStatus;
    progress: number;
    message: string;
  }> {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
      select: { status: true },
    });

    if (!document) {
      throw new Error('Document not found');
    }

    const progressMap = {
      [DocumentStatus.UPLOADED]: 0,
      [DocumentStatus.PROCESSING]: 50,
      [DocumentStatus.PROCESSED]: 100,
      [DocumentStatus.FAILED]: 0,
    };

    return {
      status: document.status,
      progress: progressMap[document.status],
      message: this.getStatusMessage(document.status),
    };
  }

  private getStatusMessage(status: DocumentStatus): string {
    const messages = {
      [DocumentStatus.UPLOADED]: 'Document uploaded, waiting for processing',
      [DocumentStatus.PROCESSING]: 'Processing document...',
      [DocumentStatus.PROCESSED]: 'Document processed successfully',
      [DocumentStatus.FAILED]: 'Processing failed',
    };

    return messages[status];
  }
}
