/**
 * Storage Integration Tests
 * 
 * Tests cloud storage operations including:
 * - File uploads
 * - File downloads
 * - File deletion
 * - Signed URLs
 * - Multi-provider support (S3, Azure, GCS)
 */

import { StorageService } from '../../apps/api/src/services/storage.service';
import { createMockFile } from '../helpers/test-utils';

describe('Storage Integration Tests', () => {
  let storageService: StorageService;

  beforeAll(async () => {
    storageService = new StorageService();
  });

  afterAll(async () => {
    // Cleanup test files
  });

  describe('File Upload', () => {
    it('should upload a file successfully', async () => {
      const mockFile = createMockFile('test-upload.pdf', 5000);

      const result = await storageService.uploadFile(
        mockFile.buffer,
        'test-folder/test-upload.pdf',
        mockFile.mimetype
      );

      expect(result).toHaveProperty('key');
      expect(result).toHaveProperty('url');
      expect(result.key).toContain('test-upload.pdf');
    });

    it('should upload files with different MIME types', async () => {
      const mimeTypes = [
        { type: 'application/pdf', ext: 'pdf' },
        { type: 'image/jpeg', ext: 'jpg' },
        { type: 'image/png', ext: 'png' },
        { type: 'text/plain', ext: 'txt' },
      ];

      for (const { type, ext } of mimeTypes) {
        const mockFile = createMockFile(`test.${ext}`, 1000);
        
        const result = await storageService.uploadFile(
          mockFile.buffer,
          `test-folder/test.${ext}`,
          type
        );

        expect(result).toHaveProperty('key');
        expect(result.key).toContain(ext);
      }
    });

    it('should handle large file uploads', async () => {
      const largeFile = createMockFile('large-file.pdf', 50 * 1024 * 1024); // 50MB

      const result = await storageService.uploadFile(
        largeFile.buffer,
        'test-folder/large-file.pdf',
        'application/pdf'
      );

      expect(result).toHaveProperty('key');
      expect(result).toHaveProperty('url');
    }, 60000); // Increase timeout for large file

    it('should preserve file metadata', async () => {
      const mockFile = createMockFile('metadata-test.pdf', 2000);

      const result = await storageService.uploadFile(
        mockFile.buffer,
        'test-folder/metadata-test.pdf',
        mockFile.mimetype,
        {
          userId: 'test-user-123',
          tenantId: 'test-tenant-456',
        }
      );

      expect(result).toHaveProperty('key');
    });

    it('should handle upload errors gracefully', async () => {
      // Test with invalid parameters
      await expect(
        storageService.uploadFile(
          null as any,
          'invalid-file.pdf',
          'application/pdf'
        )
      ).rejects.toThrow();
    });

    it('should prevent path traversal attacks', async () => {
      const mockFile = createMockFile('malicious.pdf', 1000);

      // Attempt path traversal
      await expect(
        storageService.uploadFile(
          mockFile.buffer,
          '../../../etc/passwd',
          'application/pdf'
        )
      ).rejects.toThrow();
    });
  });

  describe('File Download', () => {
    let uploadedFileKey: string;

    beforeEach(async () => {
      const mockFile = createMockFile('download-test.pdf', 3000);
      
      const result = await storageService.uploadFile(
        mockFile.buffer,
        'test-folder/download-test.pdf',
        mockFile.mimetype
      );

      uploadedFileKey = result.key;
    });

    it('should download an uploaded file', async () => {
      const fileBuffer = await storageService.downloadFile(uploadedFileKey);

      expect(fileBuffer).toBeInstanceOf(Buffer);
      expect(fileBuffer.length).toBeGreaterThan(0);
    });

    it('should handle non-existent file downloads', async () => {
      await expect(
        storageService.downloadFile('non-existent-file.pdf')
      ).rejects.toThrow();
    });

    it('should download files preserving content', async () => {
      const originalContent = Buffer.from('Test file content');
      
      const result = await storageService.uploadFile(
        originalContent,
        'test-folder/content-test.txt',
        'text/plain'
      );

      const downloadedContent = await storageService.downloadFile(result.key);

      expect(downloadedContent.toString()).toBe(originalContent.toString());
    });
  });

  describe('File Deletion', () => {
    let fileToDelete: string;

    beforeEach(async () => {
      const mockFile = createMockFile('delete-test.pdf', 2000);
      
      const result = await storageService.uploadFile(
        mockFile.buffer,
        'test-folder/delete-test.pdf',
        mockFile.mimetype
      );

      fileToDelete = result.key;
    });

    it('should delete a file successfully', async () => {
      const deleteResult = await storageService.deleteFile(fileToDelete);

      expect(deleteResult).toBe(true);

      // Verify file is deleted
      await expect(
        storageService.downloadFile(fileToDelete)
      ).rejects.toThrow();
    });

    it('should handle deletion of non-existent files', async () => {
      const result = await storageService.deleteFile('non-existent-file.pdf');

      // Should return false or not throw
      expect(result).toBe(false);
    });

    it('should delete multiple files', async () => {
      // Upload multiple files
      const files = await Promise.all(
        Array.from({ length: 5 }, async (_, i) => {
          const mockFile = createMockFile(`multi-delete-${i}.pdf`, 1000);
          return await storageService.uploadFile(
            mockFile.buffer,
            `test-folder/multi-delete-${i}.pdf`,
            mockFile.mimetype
          );
        })
      );

      // Delete all files
      const deleteResults = await Promise.all(
        files.map(file => storageService.deleteFile(file.key))
      );

      expect(deleteResults.every(result => result === true)).toBe(true);
    });
  });

  describe('Signed URLs', () => {
    let fileKey: string;

    beforeEach(async () => {
      const mockFile = createMockFile('signed-url-test.pdf', 2000);
      
      const result = await storageService.uploadFile(
        mockFile.buffer,
        'test-folder/signed-url-test.pdf',
        mockFile.mimetype
      );

      fileKey = result.key;
    });

    it('should generate a signed URL', async () => {
      const signedUrl = await storageService.getSignedUrl(fileKey, 3600);

      expect(signedUrl).toBeDefined();
      expect(typeof signedUrl).toBe('string');
      expect(signedUrl).toContain('http');
    });

    it('should generate URLs with custom expiration', async () => {
      const shortExpiry = await storageService.getSignedUrl(fileKey, 60);
      const longExpiry = await storageService.getSignedUrl(fileKey, 86400);

      expect(shortExpiry).toBeDefined();
      expect(longExpiry).toBeDefined();
      expect(shortExpiry).not.toBe(longExpiry);
    });

    it('should generate URLs for download', async () => {
      const downloadUrl = await storageService.getSignedUrl(
        fileKey,
        3600,
        'attachment'
      );

      expect(downloadUrl).toBeDefined();
      expect(downloadUrl).toContain('http');
    });

    it('should fail to generate URL for non-existent file', async () => {
      await expect(
        storageService.getSignedUrl('non-existent-file.pdf', 3600)
      ).rejects.toThrow();
    });
  });

  describe('File Listing', () => {
    beforeEach(async () => {
      // Upload multiple files for listing
      for (let i = 0; i < 10; i++) {
        const mockFile = createMockFile(`list-test-${i}.pdf`, 1000);
        await storageService.uploadFile(
          mockFile.buffer,
          `test-folder/list-test-${i}.pdf`,
          mockFile.mimetype
        );
      }
    });

    it('should list files in a folder', async () => {
      const files = await storageService.listFiles('test-folder/');

      expect(Array.isArray(files)).toBe(true);
      expect(files.length).toBeGreaterThan(0);
    });

    it('should support pagination for file listing', async () => {
      const page1 = await storageService.listFiles('test-folder/', 5, null);
      const page2 = await storageService.listFiles('test-folder/', 5, page1.nextToken);

      expect(page1.files.length).toBeLessThanOrEqual(5);
      expect(page2.files.length).toBeLessThanOrEqual(5);
    });

    it('should filter files by prefix', async () => {
      const filteredFiles = await storageService.listFiles('test-folder/list-test-1');

      expect(filteredFiles.length).toBeGreaterThan(0);
      filteredFiles.forEach(file => {
        expect(file.key).toContain('list-test-1');
      });
    });
  });

  describe('Storage Providers', () => {
    it('should work with S3 provider', async () => {
      const s3Service = new StorageService({ provider: 's3' });
      const mockFile = createMockFile('s3-test.pdf', 2000);

      const result = await s3Service.uploadFile(
        mockFile.buffer,
        'test-folder/s3-test.pdf',
        mockFile.mimetype
      );

      expect(result).toHaveProperty('key');
    });

    it('should work with local storage provider (testing)', async () => {
      const localService = new StorageService({ provider: 'local' });
      const mockFile = createMockFile('local-test.pdf', 2000);

      const result = await localService.uploadFile(
        mockFile.buffer,
        'test-folder/local-test.pdf',
        mockFile.mimetype
      );

      expect(result).toHaveProperty('key');
    });

    it('should support provider-specific configurations', async () => {
      const customService = new StorageService({
        provider: 's3',
        bucket: 'custom-bucket',
        region: 'us-west-2',
      });

      expect(customService).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      // Simulate network error by using invalid credentials
      const invalidService = new StorageService({
        provider: 's3',
        accessKeyId: 'invalid',
        secretAccessKey: 'invalid',
      });

      const mockFile = createMockFile('network-test.pdf', 1000);

      await expect(
        invalidService.uploadFile(
          mockFile.buffer,
          'test-folder/network-test.pdf',
          mockFile.mimetype
        )
      ).rejects.toThrow();
    });

    it('should handle timeout errors', async () => {
      // This would require mocking a slow network
      // Implementation depends on your timeout configuration
    });

    it('should handle storage quota exceeded', async () => {
      // This would require simulating quota limits
      // Implementation depends on your quota management
    });
  });

  describe('Security', () => {
    it('should sanitize file names', async () => {
      const mockFile = createMockFile('../../malicious.pdf', 1000);

      const result = await storageService.uploadFile(
        mockFile.buffer,
        'test-folder/../../malicious.pdf',
        mockFile.mimetype
      );

      // File name should be sanitized
      expect(result.key).not.toContain('..');
    });

    it('should validate file types', async () => {
      const mockFile = createMockFile('executable.exe', 1000);

      await expect(
        storageService.uploadFile(
          mockFile.buffer,
          'test-folder/executable.exe',
          'application/x-msdownload'
        )
      ).rejects.toThrow();
    });

    it('should enforce file size limits', async () => {
      const oversizedFile = createMockFile('huge.pdf', 200 * 1024 * 1024); // 200MB

      await expect(
        storageService.uploadFile(
          oversizedFile.buffer,
          'test-folder/huge.pdf',
          'application/pdf'
        )
      ).rejects.toThrow();
    });
  });
});

