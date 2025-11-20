import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import { SignJWT, jwtDecrypt, importJWK, KeyLike } from 'jose';

export interface TokenBindingInfo {
  deviceFingerprint: string;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class TokenSecurityService {
  private readonly logger = new Logger(TokenSecurityService.name);
  private privateKey: crypto.KeyObject | null = null;
  private publicKey: crypto.KeyObject | null = null;
  private encryptionKey: Uint8Array | null = null;
  private readonly useRS256: boolean;
  private readonly useJWE: boolean;

  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {
    this.useRS256 = this.configService.get<boolean>('JWT_USE_RS256', false);
    this.useJWE = this.configService.get<boolean>('JWT_USE_JWE', false);

    // Initialize RSA keys if RS256 is enabled
    if (this.useRS256) {
      this.initializeRSAKeys();
    }

    // Initialize encryption key if JWE is enabled
    if (this.useJWE) {
      this.initializeEncryptionKey();
    }
  }

  /**
   * Generate RSA key pair for RS256 signing
   */
  private initializeRSAKeys(): void {
    try {
      // Try to load keys from environment
      const privateKeyPem = this.configService.get<string>('JWT_PRIVATE_KEY');
      const publicKeyPem = this.configService.get<string>('JWT_PUBLIC_KEY');

      if (privateKeyPem && publicKeyPem) {
        this.privateKey = crypto.createPrivateKey(privateKeyPem);
        this.publicKey = crypto.createPublicKey(publicKeyPem);
        this.logger.log('RSA keys loaded from environment');
      } else {
        // Generate new key pair (for development only)
        const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
          modulusLength: 2048,
          publicKeyEncoding: { type: 'spki', format: 'pem' },
          privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
        });

        this.privateKey = crypto.createPrivateKey(privateKey);
        this.publicKey = crypto.createPublicKey(publicKey);

        this.logger.warn(
          'RSA keys generated (development mode). Set JWT_PRIVATE_KEY and JWT_PUBLIC_KEY in production!',
        );
        this.logger.warn(`Public Key: ${publicKey.substring(0, 50)}...`);
      }
    } catch (error) {
      this.logger.error(`Failed to initialize RSA keys: ${error.message}`);
      this.logger.warn('Falling back to HS256');
    }
  }

  /**
   * Initialize encryption key for JWE
   */
  private initializeEncryptionKey(): void {
    const keyString = this.configService.get<string>('JWE_ENCRYPTION_KEY');
    if (keyString) {
      this.encryptionKey = new Uint8Array(Buffer.from(keyString, 'hex'));
    } else {
      // Generate key (for development only)
      this.encryptionKey = crypto.randomBytes(32);
      this.logger.warn(
        'JWE encryption key generated (development mode). Set JWE_ENCRYPTION_KEY in production!',
      );
    }
  }

  /**
   * Sign JWT token with RS256 or HS256
   */
  async signToken(payload: any, options?: any): Promise<string> {
    if (this.useRS256 && this.privateKey) {
      // Use RS256 (asymmetric)
      return jwt.sign(payload, this.privateKey, {
        algorithm: 'RS256',
        expiresIn: options?.expiresIn || '15m',
        ...options,
      });
    } else {
      // Use HS256 (symmetric) - fallback
      return this.jwtService.sign(payload, options);
    }
  }

  /**
   * Verify JWT token with RS256 or HS256
   */
  async verifyToken(token: string): Promise<any> {
    if (this.useRS256 && this.publicKey) {
      // Use RS256 (asymmetric)
      return jwt.verify(token, this.publicKey, {
        algorithms: ['RS256'],
      });
    } else {
      // Use HS256 (symmetric) - fallback
      const secret = this.configService.get<string>('JWT_SECRET');
      return jwt.verify(token, secret, {
        algorithms: ['HS256'],
      });
    }
  }

  /**
   * Encrypt JWT payload with JWE (if enabled)
   */
  async encryptToken(payload: any, options?: any): Promise<string> {
    if (!this.useJWE || !this.encryptionKey) {
      // JWE not enabled, return regular JWT
      return this.signToken(payload, options);
    }

    try {
      // Create JWE token
      const jwe = await new SignJWT(payload)
        .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
        .setIssuedAt()
        .setExpirationTime(options?.expiresIn || '15m')
        .encrypt(this.encryptionKey);

      return jwe;
    } catch (error) {
      this.logger.error(`JWE encryption failed: ${error.message}`);
      // Fallback to regular JWT
      return this.signToken(payload, options);
    }
  }

  /**
   * Decrypt JWE token
   */
  async decryptToken(token: string): Promise<any> {
    if (!this.useJWE || !this.encryptionKey) {
      // JWE not enabled, verify as regular JWT
      return this.verifyToken(token);
    }

    try {
      const { payload } = await jwtDecrypt(token, this.encryptionKey);
      return payload;
    } catch (error) {
      // If decryption fails, try regular JWT verification
      return this.verifyToken(token);
    }
  }

  /**
   * Add token binding to payload
   */
  addTokenBinding(payload: any, bindingInfo: TokenBindingInfo): any {
    return {
      ...payload,
      binding: {
        fingerprint: this.hashFingerprint(bindingInfo.deviceFingerprint),
        ip: bindingInfo.ipAddress ? this.hashFingerprint(bindingInfo.ipAddress) : undefined,
      },
    };
  }

  /**
   * Verify token binding
   */
  verifyTokenBinding(payload: any, bindingInfo: TokenBindingInfo): boolean {
    if (!payload.binding) {
      // No binding info in token (backward compatibility)
      return true;
    }

    const tokenFingerprint = payload.binding.fingerprint;
    const currentFingerprint = this.hashFingerprint(bindingInfo.deviceFingerprint);

    if (tokenFingerprint !== currentFingerprint) {
      this.logger.warn('Token binding mismatch - device fingerprint changed');
      return false;
    }

    // Optional: Verify IP address (can be too strict for mobile users)
    if (payload.binding.ip && bindingInfo.ipAddress) {
      const tokenIp = payload.binding.ip;
      const currentIp = this.hashFingerprint(bindingInfo.ipAddress);
      if (tokenIp !== currentIp) {
        this.logger.warn('Token binding mismatch - IP address changed');
        // Don't fail on IP mismatch (users can change networks)
        // return false;
      }
    }

    return true;
  }

  /**
   * Hash fingerprint for storage in token
   */
  private hashFingerprint(fingerprint: string): string {
    return crypto.createHash('sha256').update(fingerprint).digest('hex').substring(0, 16);
  }

  /**
   * Get public key for JWT verification (for microservices)
   */
  getPublicKey(): string | null {
    if (!this.publicKey) {
      return null;
    }

    return this.publicKey.export({ type: 'spki', format: 'pem' }) as string;
  }
}

