import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { UploadService } from './upload.service';
import { ProcessingService } from './processing.service';
import {
  CreateDocumentDto,
  UpdateDocumentDto,
  QueryDocumentsDto,
} from './dto';
import { Document, DocumentStatus } from '@prisma/client';

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,
    private processingService: ProcessingService,
  ) {}

  /**
   * Create a new document
   */
  async create(
    tenantId: string,
    userId: string,
    dto: CreateDocumentDto,
  ): Promise<Document> {
    const document = await this.prisma.document.create({
      data: {
        title: dto.title,
        content: dto.content,
        filePath: dto.filePath,
        fileSize: dto.fileSize,
        mimeType: dto.mimeType,
        status: dto.status || DocumentStatus.UPLOADED,
        uploadedBy: userId,
        tenantId,
      },
    });

    // Create audit log
    await this.createAuditLog(tenantId, userId, 'document.created', document.id);

    this.logger.log(`Document created: ${document.id}`);

    return document;
  }

  /**
   * Upload and create document
   */
  async uploadAndCreate(
    file: Express.Multer.File,
    title: string,
    tenantId: string,
    userId: string,
  ): Promise<Document> {
    // Upload file
    const uploadResult = await this.uploadService.uploadFile(file, tenantId, userId);

    // Create document record
    const document = await this.create(tenantId, userId, {
      title,
      filePath: uploadResult.filePath,
      fileSize: uploadResult.fileSize,
      mimeType: uploadResult.mimeType,
      status: DocumentStatus.UPLOADED,
    });

    // Process document asynchronously
    this.processingService.processDocument(document.id).catch((error) => {
      this.logger.error(`Background processing failed for ${document.id}: ${error.message}`);
    });

    return document;
  }

  /**
   * Get document by ID
   */
  async findOne(
    tenantId: string,
    documentId: string,
    userId: string,
  ): Promise<Document> {
    const document = await this.prisma.document.findFirst({
      where: {
        id: documentId,
        tenantId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        reviews: {
          select: {
            id: true,
            status: true,
            score: true,
            createdAt: true,
          },
        },
      },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return document;
  }

  /**
   * List documents with filters
   */
  async findAll(
    tenantId: string,
    userId: string,
    query: QueryDocumentsDto,
  ): Promise<{
    documents: Document[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const {
      status,
      search,
      userId: filterUserId,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20,
    } = query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = { tenantId };

    if (status) {
      where.status = status;
    }

    if (filterUserId) {
      where.uploadedBy = filterUserId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get documents and count
    const [documents, total] = await Promise.all([
      this.prisma.document.findMany({
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
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: limit,
      }),
      this.prisma.document.count({ where }),
    ]);

    return {
      documents,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Update document
   */
  async update(
    tenantId: string,
    documentId: string,
    userId: string,
    dto: UpdateDocumentDto,
  ): Promise<Document> {
    // Check if document exists and user has access
    const existing = await this.findOne(tenantId, documentId, userId);

    if (existing.uploadedBy !== userId) {
      throw new ForbiddenException('You do not have permission to update this document');
    }

    const updated = await this.prisma.document.update({
      where: { id: documentId },
      data: {
        title: dto.title,
        content: dto.content,
        status: dto.status,
        updatedAt: new Date(),
      },
    });

    // Create audit log
    await this.createAuditLog(tenantId, userId, 'document.updated', documentId);

    this.logger.log(`Document updated: ${documentId}`);

    return updated;
  }

  /**
   * Delete document
   */
  async remove(
    tenantId: string,
    documentId: string,
    userId: string,
  ): Promise<void> {
    // Check if document exists and user has access
    const document = await this.findOne(tenantId, documentId, userId);

    if (document.uploadedBy !== userId) {
      throw new ForbiddenException('You do not have permission to delete this document');
    }

    // Delete file from storage
    if (document.filePath) {
      await this.uploadService.deleteFile(document.filePath);
    }

    // Delete embeddings
    await this.prisma.embedding.deleteMany({
      where: { documentId },
    });

    // Delete document record
    await this.prisma.document.delete({
      where: { id: documentId },
    });

    // Create audit log
    await this.createAuditLog(tenantId, userId, 'document.deleted', documentId);

    this.logger.log(`Document deleted: ${documentId}`);
  }

  /**
   * Get document download URL
   */
  async getDownloadUrl(
    tenantId: string,
    documentId: string,
    userId: string,
  ): Promise<{ url: string }> {
    const document = await this.findOne(tenantId, documentId, userId);

    if (!document.filePath) {
      throw new NotFoundException('Document file not found');
    }

    const url = await this.uploadService.getFileUrl(document.filePath);

    return { url };
  }

  /**
   * Reprocess document
   */
  async reprocess(
    tenantId: string,
    documentId: string,
    userId: string,
  ): Promise<Document> {
    const document = await this.findOne(tenantId, documentId, userId);

    // Start reprocessing
    await this.processingService.reprocessDocument(documentId);

    // Return updated document
    return this.findOne(tenantId, documentId, userId);
  }

  /**
   * Get document statistics
   */
  async getStatistics(tenantId: string): Promise<{
    totalDocuments: number;
    byStatus: Record<DocumentStatus, number>;
    totalSize: number;
    recentDocuments: number;
  }> {
    const [totalDocuments, documents] = await Promise.all([
      this.prisma.document.count({ where: { tenantId } }),
      this.prisma.document.findMany({
        where: { tenantId },
        select: {
          status: true,
          fileSize: true,
          createdAt: true,
        },
      }),
    ]);

    const byStatus = documents.reduce((acc, doc) => {
      acc[doc.status] = (acc[doc.status] || 0) + 1;
      return acc;
    }, {} as Record<DocumentStatus, number>);

    const totalSize = documents.reduce((sum, doc) => sum + (doc.fileSize || 0), 0);

    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    const recentDocuments = documents.filter((doc) => doc.createdAt >= last7Days).length;

    return {
      totalDocuments,
      byStatus,
      totalSize,
      recentDocuments,
    };
  }

  /**
   * Private helper methods
   */
  private async createAuditLog(
    tenantId: string,
    userId: string,
    action: string,
    resourceId: string,
  ): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          tenantId,
          userId,
          action,
          resource: 'document',
          resourceId,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to create audit log: ${error.message}`);
    }
  }
}

