/**
 * Encryption Service Unit Tests
 * 
 * Tests encryption service functionality:
 * - AES-256-GCM encryption/decryption
 * - RSA-4096 encryption/decryption
 * - Password hashing with bcrypt
 * - HMAC signature generation/verification
 */

import { EncryptionService } from '../../../apps/api/src/services/encryption.service';

describe('EncryptionService', () => {
  let service: EncryptionService;

  beforeEach(() => {
    service = new EncryptionService();
  });

  describe('AES-256-GCM Encryption', () => {
    it('should encrypt and decrypt data correctly', () => {
      const data = 'sensitive data';

      const encrypted = service.encrypt(data);
      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBe(data);

      const decrypted = service.decrypt(encrypted);
      expect(decrypted).toBe(data);
    });

    it('should produce different ciphertext for same plaintext', () => {
      const data = 'test data';

      const encrypted1 = service.encrypt(data);
      const encrypted2 = service.encrypt(data);

      expect(encrypted1).not.toBe(encrypted2);
      expect(service.decrypt(encrypted1)).toBe(data);
      expect(service.decrypt(encrypted2)).toBe(data);
    });

    it('should handle empty strings', () => {
      const encrypted = service.encrypt('');
      const decrypted = service.decrypt(encrypted);

      expect(decrypted).toBe('');
    });

    it('should handle special characters', () => {
      const data = '!@#$%^&*()_+-=[]{}|;:,.<>?';

      const encrypted = service.encrypt(data);
      const decrypted = service.decrypt(encrypted);

      expect(decrypted).toBe(data);
    });

    it('should handle Unicode characters', () => {
      const data = '测试数据 🔐 тест данных';

      const encrypted = service.encrypt(data);
      const decrypted = service.decrypt(encrypted);

      expect(decrypted).toBe(data);
    });

    it('should throw error on tampered ciphertext', () => {
      const data = 'test data';
      const encrypted = service.encrypt(data);

      // Tamper with the ciphertext
      const tampered = encrypted.slice(0, -5) + 'xxxxx';

      expect(() => {
        service.decrypt(tampered);
      }).toThrow();
    });

    it('should throw error on invalid ciphertext format', () => {
      expect(() => {
        service.decrypt('invalid-format');
      }).toThrow();
    });
  });

  describe('RSA-4096 Encryption', () => {
    it('should encrypt and decrypt data with RSA', () => {
      const data = 'sensitive data';

      const encrypted = service.encryptAsymmetric(data);
      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBe(data);

      const decrypted = service.decryptAsymmetric(encrypted);
      expect(decrypted).toBe(data);
    });

    it('should handle data up to RSA key size limit', () => {
      const data = 'x'.repeat(190); // Near RSA-4096 limit with OAEP padding

      const encrypted = service.encryptAsymmetric(data);
      const decrypted = service.decryptAsymmetric(encrypted);

      expect(decrypted).toBe(data);
    });

    it('should throw error on data exceeding RSA limits', () => {
      const data = 'x'.repeat(500); // Exceeds RSA-4096 limit

      expect(() => {
        service.encryptAsymmetric(data);
      }).toThrow();
    });

    it('should throw error on invalid private key', () => {
      const invalidService = new EncryptionService({
        rsaPrivateKey: 'invalid-key',
      });

      expect(() => {
        invalidService.decryptAsymmetric('test');
      }).toThrow();
    });
  });

  describe('Password Hashing', () => {
    it('should hash password', async () => {
      const password = 'SecurePassword123!';

      const hash = await service.hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(50);
    });

    it('should produce different hashes for same password', async () => {
      const password = 'SecurePassword123!';

      const hash1 = await service.hashPassword(password);
      const hash2 = await service.hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });

    it('should verify correct password', async () => {
      const password = 'SecurePassword123!';
      const hash = await service.hashPassword(password);

      const isValid = await service.verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'SecurePassword123!';
      const hash = await service.hashPassword(password);

      const isValid = await service.verifyPassword('WrongPassword456!', hash);

      expect(isValid).toBe(false);
    });

    it('should handle empty password', async () => {
      await expect(service.hashPassword('')).rejects.toThrow();
    });

    it('should handle very long passwords', async () => {
      const longPassword = 'a'.repeat(100);

      const hash = await service.hashPassword(longPassword);
      const isValid = await service.verifyPassword(longPassword, hash);

      expect(isValid).toBe(true);
    });
  });

  describe('PII Encryption', () => {
    it('should encrypt and decrypt PII', () => {
      const pii = 'john.doe@example.com';

      const encrypted = service.encryptPII(pii);
      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBe(pii);

      const decrypted = service.decryptPII(encrypted);
      expect(decrypted).toBe(pii);
    });

    it('should use deterministic encryption for PII', () => {
      const pii = 'john.doe@example.com';

      const encrypted1 = service.encryptPII(pii);
      const encrypted2 = service.encryptPII(pii);

      // Should be the same for searchability
      expect(encrypted1).toBe(encrypted2);
    });

    it('should handle various PII types', () => {
      const piiExamples = [
        'john.doe@example.com',
        '+1-555-123-4567',
        '123-45-6789',
        '4532 1234 5678 9010',
      ];

      piiExamples.forEach(pii => {
        const encrypted = service.encryptPII(pii);
        const decrypted = service.decryptPII(encrypted);

        expect(decrypted).toBe(pii);
      });
    });
  });

  describe('HMAC Signatures', () => {
    it('should generate HMAC signature', () => {
      const data = 'data to sign';

      const signature = service.generateHMAC(data);

      expect(signature).toBeDefined();
      expect(typeof signature).toBe('string');
      expect(signature.length).toBeGreaterThan(0);
    });

    it('should verify valid HMAC signature', () => {
      const data = 'data to sign';
      const signature = service.generateHMAC(data);

      const isValid = service.verifyHMAC(data, signature);

      expect(isValid).toBe(true);
    });

    it('should reject invalid HMAC signature', () => {
      const data = 'data to sign';
      const signature = service.generateHMAC(data);

      const isValid = service.verifyHMAC('different data', signature);

      expect(isValid).toBe(false);
    });

    it('should reject tampered signature', () => {
      const data = 'data to sign';
      const signature = service.generateHMAC(data);

      const tamperedSignature = signature.slice(0, -5) + 'xxxxx';
      const isValid = service.verifyHMAC(data, tamperedSignature);

      expect(isValid).toBe(false);
    });

    it('should produce consistent signatures', () => {
      const data = 'data to sign';

      const signature1 = service.generateHMAC(data);
      const signature2 = service.generateHMAC(data);

      expect(signature1).toBe(signature2);
    });

    it('should handle empty data', () => {
      const signature = service.generateHMAC('');
      const isValid = service.verifyHMAC('', signature);

      expect(isValid).toBe(true);
    });

    it('should handle binary data', () => {
      const data = Buffer.from([1, 2, 3, 4, 5]).toString('base64');

      const signature = service.generateHMAC(data);
      const isValid = service.verifyHMAC(data, signature);

      expect(isValid).toBe(true);
    });
  });

  describe('Key Derivation', () => {
    it('should derive key from password', () => {
      const password = 'user-password';
      const salt = 'random-salt';

      const key1 = service.deriveKey(password, salt);
      const key2 = service.deriveKey(password, salt);

      expect(key1).toBe(key2);
    });

    it('should produce different keys for different salts', () => {
      const password = 'user-password';

      const key1 = service.deriveKey(password, 'salt1');
      const key2 = service.deriveKey(password, 'salt2');

      expect(key1).not.toBe(key2);
    });

    it('should produce different keys for different passwords', () => {
      const salt = 'same-salt';

      const key1 = service.deriveKey('password1', salt);
      const key2 = service.deriveKey('password2', salt);

      expect(key1).not.toBe(key2);
    });
  });

  describe('Random Generation', () => {
    it('should generate random bytes', () => {
      const bytes1 = service.generateRandomBytes(32);
      const bytes2 = service.generateRandomBytes(32);

      expect(bytes1).not.toBe(bytes2);
      expect(bytes1.length).toBe(32);
      expect(bytes2.length).toBe(32);
    });

    it('should generate random tokens', () => {
      const token1 = service.generateRandomToken(64);
      const token2 = service.generateRandomToken(64);

      expect(token1).not.toBe(token2);
      expect(typeof token1).toBe('string');
      expect(typeof token2).toBe('string');
    });
  });

  describe('Performance', () => {
    it('should encrypt data efficiently', () => {
      const data = 'x'.repeat(1000);
      const startTime = Date.now();

      for (let i = 0; i < 100; i++) {
        service.encrypt(data);
      }

      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should hash passwords efficiently', async () => {
      const password = 'SecurePassword123!';
      const startTime = Date.now();

      await service.hashPassword(password);

      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(500); // Should complete within 500ms
    });
  });
});

