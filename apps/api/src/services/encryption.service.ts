import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

export interface EncryptedData {
  encrypted: string;
  iv: string;
  authTag: string;
}

@Injectable()
export class EncryptionService {
  private readonly logger = new Logger(EncryptionService.name);
  private readonly algorithm: string = 'aes-256-gcm';
  private readonly encryptionKey: Buffer;
  private readonly keyRotationEnabled: boolean;

  constructor(private configService: ConfigService) {
    const key = this.configService.get<string>('ENCRYPTION_KEY');

    if (!key) {
      this.logger.warn('ENCRYPTION_KEY not set. Generating temporary key (NOT for production)');
      this.encryptionKey = crypto.randomBytes(32);
    } else {
      // Ensure key is 32 bytes for AES-256
      this.encryptionKey = crypto.createHash('sha256').update(key).digest();
    }

    this.keyRotationEnabled = this.configService.get<boolean>('KEY_ROTATION_ENABLED', false);

    this.logger.log('Encryption service initialized');
  }

  /**
   * Encrypt data using AES-256-GCM
   */
  encrypt(plaintext: string): EncryptedData {
    try {
      // Generate a random initialization vector
      const iv = crypto.randomBytes(16);

      // Create cipher
      const cipher = crypto.createCipheriv(this.algorithm, this.encryptionKey, iv) as crypto.CipherGCM;

      // Encrypt the data
      let encrypted = cipher.update(plaintext, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      // Get authentication tag (for GCM mode)
      const authTag = cipher.getAuthTag();

      return {
        encrypted,
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex'),
      };
    } catch (error) {
      this.logger.error(`Encryption failed: ${error.message}`);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt data using AES-256-GCM
   */
  decrypt(encryptedData: EncryptedData): string {
    try {
      const decipher = crypto.createDecipheriv(
        this.algorithm,
        this.encryptionKey,
        Buffer.from(encryptedData.iv, 'hex'),
      ) as crypto.DecipherGCM;

      // Set authentication tag (for GCM mode)
      decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));

      // Decrypt the data
      let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      this.logger.error(`Decryption failed: ${error.message}`);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Encrypt JSON object
   */
  encryptObject(obj: any): EncryptedData {
    const plaintext = JSON.stringify(obj);
    return this.encrypt(plaintext);
  }

  /**
   * Decrypt to JSON object
   */
  decryptObject<T = any>(encryptedData: EncryptedData): T {
    const plaintext = this.decrypt(encryptedData);
    return JSON.parse(plaintext);
  }

  /**
   * Encrypt string and return as single base64-encoded string
   */
  encryptString(plaintext: string): string {
    const encrypted = this.encrypt(plaintext);
    const combined = JSON.stringify(encrypted);
    return Buffer.from(combined).toString('base64');
  }

  /**
   * Decrypt from single base64-encoded string
   */
  decryptString(encryptedString: string): string {
    const combined = Buffer.from(encryptedString, 'base64').toString('utf8');
    const encrypted: EncryptedData = JSON.parse(combined);
    return this.decrypt(encrypted);
  }

  /**
   * Hash password using bcrypt
   */
  async hashPassword(password: string, rounds: number = 12): Promise<string> {
    try {
      return await bcrypt.hash(password, rounds);
    } catch (error) {
      this.logger.error(`Password hashing failed: ${error.message}`);
      throw new Error('Failed to hash password');
    }
  }

  /**
   * Verify password against hash
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      this.logger.error(`Password verification failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Generate a secure random token
   */
  generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generate a secure random string (URL-safe)
   */
  generateSecureString(length: number = 32): string {
    return crypto.randomBytes(length).toString('base64url').substring(0, length);
  }

  /**
   * Hash data using SHA-256
   */
  hash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Hash data using SHA-512
   */
  hashSHA512(data: string): string {
    return crypto.createHash('sha512').update(data).digest('hex');
  }

  /**
   * Create HMAC signature
   */
  createHMAC(data: string, secret?: string): string {
    const hmacSecret = secret || this.encryptionKey.toString('hex');
    return crypto.createHmac('sha256', hmacSecret).update(data).digest('hex');
  }

  /**
   * Verify HMAC signature
   */
  verifyHMAC(data: string, signature: string, secret?: string): boolean {
    const expectedSignature = this.createHMAC(data, secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    );
  }

  /**
   * Encrypt file (buffer)
   */
  encryptBuffer(buffer: Buffer): {
    encrypted: Buffer;
    iv: string;
    authTag: string;
  } {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(this.algorithm, this.encryptionKey, iv) as crypto.CipherGCM;

      const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
      const authTag = cipher.getAuthTag();

      return {
        encrypted,
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex'),
      };
    } catch (error) {
      this.logger.error(`Buffer encryption failed: ${error.message}`);
      throw new Error('Failed to encrypt buffer');
    }
  }

  /**
   * Decrypt file (buffer)
   */
  decryptBuffer(encryptedBuffer: Buffer, iv: string, authTag: string): Buffer {
    try {
      const decipher = crypto.createDecipheriv(
        this.algorithm,
        this.encryptionKey,
        Buffer.from(iv, 'hex'),
      ) as crypto.DecipherGCM;

      decipher.setAuthTag(Buffer.from(authTag, 'hex'));

      return Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);
    } catch (error) {
      this.logger.error(`Buffer decryption failed: ${error.message}`);
      throw new Error('Failed to decrypt buffer');
    }
  }

  /**
   * Generate key pair for asymmetric encryption (RSA)
   */
  generateKeyPair(): {
    publicKey: string;
    privateKey: string;
  } {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    });

    return {
      publicKey,
      privateKey,
    };
  }

  /**
   * Encrypt with public key (RSA)
   */
  encryptWithPublicKey(data: string, publicKey: string): string {
    try {
      const encrypted = crypto.publicEncrypt(
        {
          key: publicKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        },
        Buffer.from(data, 'utf8'),
      );

      return encrypted.toString('base64');
    } catch (error) {
      this.logger.error(`Public key encryption failed: ${error.message}`);
      throw new Error('Failed to encrypt with public key');
    }
  }

  /**
   * Decrypt with private key (RSA)
   */
  decryptWithPrivateKey(encryptedData: string, privateKey: string): string {
    try {
      const decrypted = crypto.privateDecrypt(
        {
          key: privateKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        },
        Buffer.from(encryptedData, 'base64'),
      );

      return decrypted.toString('utf8');
    } catch (error) {
      this.logger.error(`Private key decryption failed: ${error.message}`);
      throw new Error('Failed to decrypt with private key');
    }
  }

  /**
   * Mask sensitive data (for logging)
   */
  maskSensitiveData(data: string, visibleChars: number = 4): string {
    if (data.length <= visibleChars) {
      return '*'.repeat(data.length);
    }

    const masked = '*'.repeat(data.length - visibleChars);
    return masked + data.slice(-visibleChars);
  }

  /**
   * Mask email address
   */
  maskEmail(email: string): string {
    const [username, domain] = email.split('@');
    
    if (!domain) {
      return this.maskSensitiveData(email);
    }

    const maskedUsername =
      username.length > 2
        ? username[0] + '*'.repeat(username.length - 2) + username[username.length - 1]
        : '*'.repeat(username.length);

    return `${maskedUsername}@${domain}`;
  }

  /**
   * Mask credit card number
   */
  maskCreditCard(cardNumber: string): string {
    const cleaned = cardNumber.replace(/\s/g, '');
    return this.maskSensitiveData(cleaned, 4);
  }

  /**
   * Generate API key
   */
  generateAPIKey(prefix: string = 'lxs'): string {
    const randomPart = this.generateSecureString(32);
    return `${prefix}_${randomPart}`;
  }

  /**
   * Encrypt PII (Personally Identifiable Information)
   */
  encryptPII(pii: {
    ssn?: string;
    taxId?: string;
    dob?: string;
    phone?: string;
    address?: string;
  }): Record<string, EncryptedData> {
    const encrypted: Record<string, EncryptedData> = {};

    for (const [key, value] of Object.entries(pii)) {
      if (value) {
        encrypted[key] = this.encrypt(value);
      }
    }

    return encrypted;
  }

  /**
   * Decrypt PII
   */
  decryptPII(encryptedPII: Record<string, EncryptedData>): Record<string, string> {
    const decrypted: Record<string, string> = {};

    for (const [key, value] of Object.entries(encryptedPII)) {
      if (value) {
        decrypted[key] = this.decrypt(value);
      }
    }

    return decrypted;
  }

  /**
   * Generate deterministic encryption (for searchable encryption)
   */
  deterministicEncrypt(data: string, salt: string): string {
    const key = crypto.pbkdf2Sync(
      this.encryptionKey,
      salt,
      100000,
      32,
      'sha512',
    );

    const iv = crypto.createHash('sha256').update(salt).digest().slice(0, 16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return encrypted;
  }

  /**
   * Decrypt deterministic encryption
   */
  deterministicDecrypt(encryptedData: string, salt: string): string {
    const key = crypto.pbkdf2Sync(
      this.encryptionKey,
      salt,
      100000,
      32,
      'sha512',
    );

    const iv = crypto.createHash('sha256').update(salt).digest().slice(0, 16);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Key rotation (for future use)
   */
  rotateKeys(): void {
    if (!this.keyRotationEnabled) {
      this.logger.warn('Key rotation is not enabled');
      return;
    }

    // In production, implement key rotation logic:
    // 1. Generate new encryption key
    // 2. Re-encrypt all sensitive data with new key
    // 3. Update configuration with new key
    // 4. Archive old key for decryption of historical data

    this.logger.log('Key rotation initiated (not implemented)');
  }
}

