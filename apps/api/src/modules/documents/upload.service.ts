import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs/promises';
import { createHash } from 'crypto';

export interface UploadedFile {
  originalName: string;
  filename: string;
  path: string;
  size: number;
  mimeType: string;
  hash: string;
}

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly uploadDir: string;
  private readonly maxFileSize: number;
  private readonly allowedMimeTypes: string[];

  constructor(private configService: ConfigService) {
    this.uploadDir = this.configService.get<string>('UPLOAD_DIR', './uploads');
    this.maxFileSize = this.configService.get<number>('MAX_FILE_SIZE', 50 * 1024 * 1024); // 50MB default
    this.allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
  }

  /**
   * Validate file before upload
   */
  validateFile(file: Express.Multer.File): void {
    // Check file size
    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${this.maxFileSize / 1024 / 1024}MB`,
      );
    }

    // Check MIME type
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type ${file.mimetype} is not allowed. Allowed types: ${this.allowedMimeTypes.join(', ')}`,
      );
    }

    this.logger.log(`File validated: ${file.originalname} (${file.size} bytes)`);
  }

  /**
   * Upload file to storage
   */
  async uploadFile(
    file: Express.Multer.File,
    tenantId: string,
    userId: string,
  ): Promise<UploadedFile> {
    try {
      // Validate file
      this.validateFile(file);

      // Generate unique filename
      const fileExt = path.extname(file.originalname);
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(7);
      const filename = `${timestamp}_${randomString}${fileExt}`;

      // Create tenant-specific directory
      const tenantDir = path.join(this.uploadDir, tenantId);
      await fs.mkdir(tenantDir, { recursive: true });

      // Full file path
      const filePath = path.join(tenantDir, filename);

      // Write file
      await fs.writeFile(filePath, file.buffer);

      // Calculate file hash for deduplication
      const hash = createHash('sha256').update(file.buffer).digest('hex');

      this.logger.log(`File uploaded: ${filePath}`);

      return {
        originalName: file.originalname,
        filename,
        path: filePath,
        size: file.size,
        mimeType: file.mimetype,
        hash,
      };
    } catch (error) {
      this.logger.error('Failed to upload file', error.stack);
      throw error;
    }
  }

  /**
   * Delete file from storage
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
      this.logger.log(`File deleted: ${filePath}`);
    } catch (error) {
      this.logger.error(`Failed to delete file: ${filePath}`, error.stack);
      // Don't throw error, just log it
    }
  }

  /**
   * Get file buffer
   */
  async getFile(filePath: string): Promise<Buffer> {
    try {
      return await fs.readFile(filePath);
    } catch (error) {
      this.logger.error(`Failed to read file: ${filePath}`, error.stack);
      throw new BadRequestException('File not found');
    }
  }

  /**
   * Check if file exists
   */
  async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}

