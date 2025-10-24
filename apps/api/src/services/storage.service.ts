import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface StorageOptions {
  bucket?: string;
  acl?: 'private' | 'public-read' | 'public-read-write';
  contentType?: string;
  metadata?: Record<string, string>;
}

export interface StorageFile {
  key: string;
  bucket: string;
  url: string;
  size: number;
  contentType: string;
  etag?: string;
}

export interface UploadResult {
  url: string;
  key: string;
  bucket: string;
  size: number;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly storageType: 'local' | 's3' | 'azure' | 'gcs';
  private readonly defaultBucket: string;
  private readonly localStoragePath: string;
  private readonly publicUrl: string;

  constructor(private configService: ConfigService) {
    this.storageType = this.configService.get<'local' | 's3' | 'azure' | 'gcs'>(
      'STORAGE_TYPE',
      'local',
    );
    this.defaultBucket = this.configService.get<string>('STORAGE_BUCKET', 'lexiscan-storage');
    this.localStoragePath = this.configService.get<string>('STORAGE_PATH', './storage');
    this.publicUrl = this.configService.get<string>('STORAGE_PUBLIC_URL', 'http://localhost:3001/files');

    this.logger.log(`Storage service initialized with type: ${this.storageType}`);
  }

  /**
   * Upload a file to storage
   */
  async upload(
    file: Buffer | string,
    key: string,
    options?: StorageOptions,
  ): Promise<UploadResult> {
    const bucket = options?.bucket || this.defaultBucket;

    switch (this.storageType) {
      case 's3':
        return this.uploadToS3(file, key, bucket, options);
      case 'azure':
        return this.uploadToAzure(file, key, bucket, options);
      case 'gcs':
        return this.uploadToGCS(file, key, bucket, options);
      case 'local':
      default:
        return this.uploadToLocal(file, key, bucket, options);
    }
  }

  /**
   * Download a file from storage
   */
  async download(key: string, bucket?: string): Promise<Buffer> {
    const storageBucket = bucket || this.defaultBucket;

    switch (this.storageType) {
      case 's3':
        return this.downloadFromS3(key, storageBucket);
      case 'azure':
        return this.downloadFromAzure(key, storageBucket);
      case 'gcs':
        return this.downloadFromGCS(key, storageBucket);
      case 'local':
      default:
        return this.downloadFromLocal(key, storageBucket);
    }
  }

  /**
   * Delete a file from storage
   */
  async delete(key: string, bucket?: string): Promise<void> {
    const storageBucket = bucket || this.defaultBucket;

    switch (this.storageType) {
      case 's3':
        return this.deleteFromS3(key, storageBucket);
      case 'azure':
        return this.deleteFromAzure(key, storageBucket);
      case 'gcs':
        return this.deleteFromGCS(key, storageBucket);
      case 'local':
      default:
        return this.deleteFromLocal(key, storageBucket);
    }
  }

  /**
   * Get a signed URL for temporary access
   */
  async getSignedUrl(
    key: string,
    expiresIn: number = 3600,
    bucket?: string,
  ): Promise<string> {
    const storageBucket = bucket || this.defaultBucket;

    switch (this.storageType) {
      case 's3':
        return this.getS3SignedUrl(key, storageBucket, expiresIn);
      case 'azure':
        return this.getAzureSignedUrl(key, storageBucket, expiresIn);
      case 'gcs':
        return this.getGCSSignedUrl(key, storageBucket, expiresIn);
      case 'local':
      default:
        // For local storage, return direct URL (no expiration)
        return this.getLocalUrl(key, storageBucket);
    }
  }

  /**
   * Check if a file exists
   */
  async exists(key: string, bucket?: string): Promise<boolean> {
    const storageBucket = bucket || this.defaultBucket;

    try {
      switch (this.storageType) {
        case 's3':
          return this.s3FileExists(key, storageBucket);
        case 'azure':
          return this.azureFileExists(key, storageBucket);
        case 'gcs':
          return this.gcsFileExists(key, storageBucket);
        case 'local':
        default:
          return this.localFileExists(key, storageBucket);
      }
    } catch (error) {
      return false;
    }
  }

  /**
   * List files in a directory/prefix
   */
  async list(prefix: string, bucket?: string): Promise<StorageFile[]> {
    const storageBucket = bucket || this.defaultBucket;

    switch (this.storageType) {
      case 's3':
        return this.listS3Files(prefix, storageBucket);
      case 'azure':
        return this.listAzureFiles(prefix, storageBucket);
      case 'gcs':
        return this.listGCSFiles(prefix, storageBucket);
      case 'local':
      default:
        return this.listLocalFiles(prefix, storageBucket);
    }
  }

  /**
   * Copy a file to a new location
   */
  async copy(
    sourceKey: string,
    destinationKey: string,
    sourceBucket?: string,
    destinationBucket?: string,
  ): Promise<UploadResult> {
    const srcBucket = sourceBucket || this.defaultBucket;
    const destBucket = destinationBucket || this.defaultBucket;

    // Download from source and upload to destination
    const file = await this.download(sourceKey, srcBucket);
    return this.upload(file, destinationKey, { bucket: destBucket });
  }

  /**
   * Move a file to a new location
   */
  async move(
    sourceKey: string,
    destinationKey: string,
    sourceBucket?: string,
    destinationBucket?: string,
  ): Promise<UploadResult> {
    const result = await this.copy(sourceKey, destinationKey, sourceBucket, destinationBucket);
    await this.delete(sourceKey, sourceBucket);
    return result;
  }

  /**
   * Local Storage Implementation
   */

  private async uploadToLocal(
    file: Buffer | string,
    key: string,
    bucket: string,
    options?: StorageOptions,
  ): Promise<UploadResult> {
    try {
      const filePath = path.join(this.localStoragePath, bucket, key);
      const dir = path.dirname(filePath);

      // Create directory if it doesn't exist
      await fs.mkdir(dir, { recursive: true });

      // Write file
      const buffer = typeof file === 'string' ? Buffer.from(file) : file;
      await fs.writeFile(filePath, buffer);

      const stats = await fs.stat(filePath);

      this.logger.log(`File uploaded to local storage: ${filePath}`);

      return {
        url: this.getLocalUrl(key, bucket),
        key,
        bucket,
        size: stats.size,
      };
    } catch (error) {
      this.logger.error(`Local upload failed: ${error.message}`);
      throw new InternalServerErrorException('Failed to upload file');
    }
  }

  private async downloadFromLocal(key: string, bucket: string): Promise<Buffer> {
    try {
      const filePath = path.join(this.localStoragePath, bucket, key);
      return await fs.readFile(filePath);
    } catch (error) {
      this.logger.error(`Local download failed: ${error.message}`);
      throw new InternalServerErrorException('Failed to download file');
    }
  }

  private async deleteFromLocal(key: string, bucket: string): Promise<void> {
    try {
      const filePath = path.join(this.localStoragePath, bucket, key);
      await fs.unlink(filePath);
      this.logger.log(`File deleted from local storage: ${filePath}`);
    } catch (error) {
      this.logger.error(`Local delete failed: ${error.message}`);
      throw new InternalServerErrorException('Failed to delete file');
    }
  }

  private async localFileExists(key: string, bucket: string): Promise<boolean> {
    try {
      const filePath = path.join(this.localStoragePath, bucket, key);
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  private getLocalUrl(key: string, bucket: string): string {
    return `${this.publicUrl}/${bucket}/${key}`;
  }

  private async listLocalFiles(prefix: string, bucket: string): Promise<StorageFile[]> {
    try {
      const dirPath = path.join(this.localStoragePath, bucket, prefix);
      const files = await fs.readdir(dirPath, { withFileTypes: true });

      const result: StorageFile[] = [];

      for (const file of files) {
        if (file.isFile()) {
          const filePath = path.join(dirPath, file.name);
          const stats = await fs.stat(filePath);
          const key = path.join(prefix, file.name);

          result.push({
            key,
            bucket,
            url: this.getLocalUrl(key, bucket),
            size: stats.size,
            contentType: 'application/octet-stream',
          });
        }
      }

      return result;
    } catch (error) {
      this.logger.error(`Failed to list local files: ${error.message}`);
      return [];
    }
  }

  /**
   * S3 Storage Implementation (Mock - Replace with AWS SDK in production)
   */

  private async uploadToS3(
    file: Buffer | string,
    key: string,
    bucket: string,
    options?: StorageOptions,
  ): Promise<UploadResult> {
    // In production, use AWS SDK:
    // const s3 = new S3Client({ region: process.env.AWS_REGION });
    // const command = new PutObjectCommand({
    //   Bucket: bucket,
    //   Key: key,
    //   Body: file,
    //   ContentType: options?.contentType,
    //   ACL: options?.acl || 'private',
    //   Metadata: options?.metadata,
    // });
    // await s3.send(command);

    this.logger.log(`Mock S3 upload: ${bucket}/${key}`);

    const buffer = typeof file === 'string' ? Buffer.from(file) : file;

    return {
      url: `https://${bucket}.s3.amazonaws.com/${key}`,
      key,
      bucket,
      size: buffer.length,
    };
  }

  private async downloadFromS3(key: string, bucket: string): Promise<Buffer> {
    // In production, use AWS SDK:
    // const s3 = new S3Client({ region: process.env.AWS_REGION });
    // const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    // const response = await s3.send(command);
    // const stream = response.Body as Readable;
    // return Buffer.from(await streamToString(stream));

    this.logger.log(`Mock S3 download: ${bucket}/${key}`);
    return Buffer.from('mock-s3-file-content');
  }

  private async deleteFromS3(key: string, bucket: string): Promise<void> {
    // In production, use AWS SDK:
    // const s3 = new S3Client({ region: process.env.AWS_REGION });
    // const command = new DeleteObjectCommand({ Bucket: bucket, Key: key });
    // await s3.send(command);

    this.logger.log(`Mock S3 delete: ${bucket}/${key}`);
  }

  private async getS3SignedUrl(
    key: string,
    bucket: string,
    expiresIn: number,
  ): Promise<string> {
    // In production, use AWS SDK:
    // const s3 = new S3Client({ region: process.env.AWS_REGION });
    // const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    // return await getSignedUrl(s3, command, { expiresIn });

    this.logger.log(`Mock S3 signed URL: ${bucket}/${key}`);
    return `https://${bucket}.s3.amazonaws.com/${key}?expires=${expiresIn}`;
  }

  private async s3FileExists(key: string, bucket: string): Promise<boolean> {
    // In production, use AWS SDK headObject
    this.logger.log(`Mock S3 exists check: ${bucket}/${key}`);
    return true;
  }

  private async listS3Files(prefix: string, bucket: string): Promise<StorageFile[]> {
    // In production, use AWS SDK listObjectsV2
    this.logger.log(`Mock S3 list: ${bucket}/${prefix}`);
    return [];
  }

  /**
   * Azure Blob Storage (Mock implementations)
   */

  private async uploadToAzure(
    file: Buffer | string,
    key: string,
    bucket: string,
    options?: StorageOptions,
  ): Promise<UploadResult> {
    this.logger.log(`Mock Azure upload: ${bucket}/${key}`);
    const buffer = typeof file === 'string' ? Buffer.from(file) : file;
    return {
      url: `https://${bucket}.blob.core.windows.net/${key}`,
      key,
      bucket,
      size: buffer.length,
    };
  }

  private async downloadFromAzure(key: string, bucket: string): Promise<Buffer> {
    this.logger.log(`Mock Azure download: ${bucket}/${key}`);
    return Buffer.from('mock-azure-content');
  }

  private async deleteFromAzure(key: string, bucket: string): Promise<void> {
    this.logger.log(`Mock Azure delete: ${bucket}/${key}`);
  }

  private async getAzureSignedUrl(
    key: string,
    bucket: string,
    expiresIn: number,
  ): Promise<string> {
    this.logger.log(`Mock Azure signed URL: ${bucket}/${key}`);
    return `https://${bucket}.blob.core.windows.net/${key}?expires=${expiresIn}`;
  }

  private async azureFileExists(key: string, bucket: string): Promise<boolean> {
    this.logger.log(`Mock Azure exists: ${bucket}/${key}`);
    return true;
  }

  private async listAzureFiles(prefix: string, bucket: string): Promise<StorageFile[]> {
    this.logger.log(`Mock Azure list: ${bucket}/${prefix}`);
    return [];
  }

  /**
   * Google Cloud Storage (Mock implementations)
   */

  private async uploadToGCS(
    file: Buffer | string,
    key: string,
    bucket: string,
    options?: StorageOptions,
  ): Promise<UploadResult> {
    this.logger.log(`Mock GCS upload: ${bucket}/${key}`);
    const buffer = typeof file === 'string' ? Buffer.from(file) : file;
    return {
      url: `https://storage.googleapis.com/${bucket}/${key}`,
      key,
      bucket,
      size: buffer.length,
    };
  }

  private async downloadFromGCS(key: string, bucket: string): Promise<Buffer> {
    this.logger.log(`Mock GCS download: ${bucket}/${key}`);
    return Buffer.from('mock-gcs-content');
  }

  private async deleteFromGCS(key: string, bucket: string): Promise<void> {
    this.logger.log(`Mock GCS delete: ${bucket}/${key}`);
  }

  private async getGCSSignedUrl(
    key: string,
    bucket: string,
    expiresIn: number,
  ): Promise<string> {
    this.logger.log(`Mock GCS signed URL: ${bucket}/${key}`);
    return `https://storage.googleapis.com/${bucket}/${key}?expires=${expiresIn}`;
  }

  private async gcsFileExists(key: string, bucket: string): Promise<boolean> {
    this.logger.log(`Mock GCS exists: ${bucket}/${key}`);
    return true;
  }

  private async listGCSFiles(prefix: string, bucket: string): Promise<StorageFile[]> {
    this.logger.log(`Mock GCS list: ${bucket}/${prefix}`);
    return [];
  }

  /**
   * Utility methods
   */

  generateKey(filename: string, prefix?: string): string {
    const ext = path.extname(filename);
    const name = path.basename(filename, ext);
    const uuid = uuidv4();
    const key = `${name}-${uuid}${ext}`;
    return prefix ? `${prefix}/${key}` : key;
  }
}

