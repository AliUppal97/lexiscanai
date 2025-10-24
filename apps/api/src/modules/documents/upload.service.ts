import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface UploadResult {
  filePath: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  bucket?: string;
}

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly uploadDir: string;
  private readonly maxFileSize: number;
  private readonly allowedMimeTypes: string[];
  private readonly useS3: boolean;

  constructor(private configService: ConfigService) {
    this.uploadDir = this.configService.get<string>('UPLOAD_DIR', './uploads/documents');
    this.maxFileSize = this.configService.get<number>('MAX_FILE_SIZE', 100 * 1024 * 1024); // 100MB
    this.allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'image/jpeg',
      'image/png',
    ];
    this.useS3 = !!this.configService.get<string>('AWS_S3_BUCKET');
  }

  /**
   * Upload a file to storage
   */
  async uploadFile(
    file: Express.Multer.File,
    tenantId: string,
    userId: string,
  ): Promise<UploadResult> {
    // Validate file
    this.validateFile(file);

    // Generate unique filename
    const fileExtension = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;
    const filePath = this.useS3
      ? await this.uploadToS3(file, tenantId, userId, fileName)
      : await this.uploadToLocal(file, tenantId, userId, fileName);

    this.logger.log(`File uploaded successfully: ${filePath}`);

    return {
      filePath,
      fileName,
      fileSize: file.size,
      mimeType: file.mimetype,
    };
  }

  /**
   * Upload multiple files
   */
  async uploadMultipleFiles(
    files: Express.Multer.File[],
    tenantId: string,
    userId: string,
  ): Promise<UploadResult[]> {
    const uploadPromises = files.map((file) =>
      this.uploadFile(file, tenantId, userId),
    );

    return Promise.all(uploadPromises);
  }

  /**
   * Delete a file from storage
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      if (filePath.startsWith('s3://')) {
        await this.deleteFromS3(filePath);
      } else {
        await this.deleteFromLocal(filePath);
      }

      this.logger.log(`File deleted successfully: ${filePath}`);
    } catch (error) {
      this.logger.error(`Failed to delete file: ${error.message}`);
      throw new InternalServerErrorException('Failed to delete file');
    }
  }

  /**
   * Get file URL (for download/view)
   */
  async getFileUrl(filePath: string, expiresIn: number = 3600): Promise<string> {
    if (filePath.startsWith('s3://')) {
      return this.getS3SignedUrl(filePath, expiresIn);
    }

    // For local files, return direct path
    return filePath;
  }

  /**
   * Check if file exists
   */
  async fileExists(filePath: string): Promise<boolean> {
    try {
      if (filePath.startsWith('s3://')) {
        return await this.s3FileExists(filePath);
      }

      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Private validation methods
   */
  private validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${this.maxFileSize / (1024 * 1024)}MB`,
      );
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type ${file.mimetype} is not allowed`,
      );
    }
  }

  /**
   * Private upload methods
   */
  private async uploadToLocal(
    file: Express.Multer.File,
    tenantId: string,
    userId: string,
    fileName: string,
  ): Promise<string> {
    try {
      // Create directory structure: uploads/tenantId/userId/
      const dirPath = path.join(this.uploadDir, tenantId, userId);
      await fs.mkdir(dirPath, { recursive: true });

      const filePath = path.join(dirPath, fileName);
      await fs.writeFile(filePath, file.buffer);

      return filePath;
    } catch (error) {
      this.logger.error(`Failed to upload file locally: ${error.message}`);
      throw new InternalServerErrorException('Failed to upload file');
    }
  }

  private async deleteFromLocal(filePath: string): Promise<void> {
    await fs.unlink(filePath);
  }

  /**
   * S3 methods (mock implementations - replace with actual AWS SDK in production)
   */
  private async uploadToS3(
    file: Express.Multer.File,
    tenantId: string,
    userId: string,
    fileName: string,
  ): Promise<string> {
    // In production, use AWS SDK:
    // const s3 = new S3Client({ region: process.env.AWS_REGION });
    // const command = new PutObjectCommand({
    //   Bucket: process.env.AWS_S3_BUCKET,
    //   Key: `${tenantId}/${userId}/${fileName}`,
    //   Body: file.buffer,
    //   ContentType: file.mimetype,
    // });
    // await s3.send(command);

    const bucket = this.configService.get<string>('AWS_S3_BUCKET');
    const key = `${tenantId}/${userId}/${fileName}`;

    this.logger.log(`Mock S3 upload: ${bucket}/${key}`);

    return `s3://${bucket}/${key}`;
  }

  private async deleteFromS3(filePath: string): Promise<void> {
    // Parse S3 path: s3://bucket/key
    const [bucket, ...keyParts] = filePath.replace('s3://', '').split('/');
    const key = keyParts.join('/');

    // In production, use AWS SDK:
    // const s3 = new S3Client({ region: process.env.AWS_REGION });
    // const command = new DeleteObjectCommand({ Bucket: bucket, Key: key });
    // await s3.send(command);

    this.logger.log(`Mock S3 delete: ${bucket}/${key}`);
  }

  private async getS3SignedUrl(filePath: string, expiresIn: number): Promise<string> {
    // Parse S3 path
    const [bucket, ...keyParts] = filePath.replace('s3://', '').split('/');
    const key = keyParts.join('/');

    // In production, use AWS SDK:
    // const s3 = new S3Client({ region: process.env.AWS_REGION });
    // const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    // const signedUrl = await getSignedUrl(s3, command, { expiresIn });
    // return signedUrl;

    this.logger.log(`Mock S3 signed URL for: ${bucket}/${key}`);

    return `https://${bucket}.s3.amazonaws.com/${key}?expires=${expiresIn}`;
  }

  private async s3FileExists(filePath: string): Promise<boolean> {
    // In production, use AWS SDK to check if object exists
    this.logger.log(`Mock S3 file exists check: ${filePath}`);
    return true;
  }
}
