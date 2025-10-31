import { Injectable, Logger, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma.service';
import { randomBytes, createHash } from 'crypto';
import * as bcrypt from 'bcryptjs';

export interface CreateApiKeyDto {
  name: string;
  description?: string;
  scopes: string[];
  expiresAt?: Date;
  tenantId: string;
  userId: string;
}

export interface ApiKeyInfo {
  id: string;
  name: string;
  description?: string;
  scopes: string[];
  lastUsedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
}

@Injectable()
export class ApiKeyService {
  private readonly logger = new Logger(ApiKeyService.name);
  private readonly keyPrefix = 'lexiscan_';

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  /**
   * Create a new API key
   */
  async createApiKey(dto: CreateApiKeyDto): Promise<{ apiKey: string; info: ApiKeyInfo }> {
    const { name, description, scopes, expiresAt, tenantId, userId } = dto;

    // Generate API key
    const rawKey = this.generateApiKey();
    const hashedKey = await this.hashApiKey(rawKey);

    // Create API key record (you'll need to add ApiKey model to Prisma schema)
    // For now, we'll store it in a generic way
    // In production, add ApiKey model to schema:
    // model ApiKey {
    //   id          String   @id @default(cuid())
    //   tenantId    String
    //   userId      String
    //   name        String
    //   description String?
    //   keyHash     String   @unique
    //   scopes      String[] // Array of permission strings
    //   lastUsedAt  DateTime?
    //   expiresAt   DateTime?
    //   isActive    Boolean  @default(true)
    //   revokedAt   DateTime?
    //   createdAt   DateTime @default(now())
    //   updatedAt   DateTime @updatedAt
    // }

    // For now, store in a JSON field or separate table
    // This is a placeholder implementation
    const apiKeyInfo: ApiKeyInfo = {
      id: `key_${randomBytes(16).toString('hex')}`,
      name,
      description,
      scopes,
      expiresAt: expiresAt || undefined,
      createdAt: new Date(),
    };

    // TODO: Store in database
    this.logger.log(`API Key created for user ${userId} in tenant ${tenantId}: ${name}`);

    // In production, store in database:
    // await this.prisma.apiKey.create({
    //   data: {
    //     tenantId,
    //     userId,
    //     name,
    //     description,
    //     keyHash: hashedKey,
    //     scopes,
    //     expiresAt,
    //   },
    // });

    return {
      apiKey: `${this.keyPrefix}${rawKey}`, // Return plain key only once
      info: apiKeyInfo,
    };
  }

  /**
   * Verify API key
   */
  async verifyApiKey(apiKey: string): Promise<{ valid: boolean; userId?: string; tenantId?: string; scopes?: string[] }> {
    try {
      // Extract key from prefix
      if (!apiKey.startsWith(this.keyPrefix)) {
        return { valid: false };
      }

      const rawKey = apiKey.substring(this.keyPrefix.length);
      const hashedKey = await this.hashApiKey(rawKey);

      // TODO: Lookup in database
      // const apiKeyRecord = await this.prisma.apiKey.findUnique({
      //   where: { keyHash: hashedKey },
      //   include: { user: true, tenant: true },
      // });

      // if (!apiKeyRecord || !apiKeyRecord.isActive) {
      //   return { valid: false };
      // }

      // if (apiKeyRecord.revokedAt) {
      //   return { valid: false };
      // }

      // if (apiKeyRecord.expiresAt && apiKeyRecord.expiresAt < new Date()) {
      //   return { valid: false };
      // }

      // // Update last used
      // await this.prisma.apiKey.update({
      //   where: { id: apiKeyRecord.id },
      //   data: { lastUsedAt: new Date() },
      // });

      // return {
      //   valid: true,
      //   userId: apiKeyRecord.userId,
      //   tenantId: apiKeyRecord.tenantId,
      //   scopes: apiKeyRecord.scopes,
      // };

      // Placeholder
      return { valid: false };
    } catch (error) {
      this.logger.error(`API key verification failed: ${error.message}`);
      return { valid: false };
    }
  }

  /**
   * Get API keys for user
   */
  async getUserApiKeys(userId: string, tenantId: string): Promise<ApiKeyInfo[]> {
    // TODO: Fetch from database
    // return this.prisma.apiKey.findMany({
    //   where: {
    //     userId,
    //     tenantId,
    //     isActive: true,
    //     revokedAt: null,
    //   },
    //   select: {
    //     id: true,
    //     name: true,
    //     description: true,
    //     scopes: true,
    //     lastUsedAt: true,
    //     expiresAt: true,
    //     createdAt: true,
    //   },
    //   orderBy: { createdAt: 'desc' },
    // });

    return [];
  }

  /**
   * Revoke API key
   */
  async revokeApiKey(apiKeyId: string, userId: string, tenantId: string): Promise<void> {
    // TODO: Revoke in database
    // const apiKey = await this.prisma.apiKey.findFirst({
    //   where: {
    //     id: apiKeyId,
    //     userId,
    //     tenantId,
    //   },
    // });

    // if (!apiKey) {
    //   throw new NotFoundException('API key not found');
    // }

    // await this.prisma.apiKey.update({
    //   where: { id: apiKeyId },
    //   data: {
    //     isActive: false,
    //     revokedAt: new Date(),
    //   },
    // });

    this.logger.log(`API key revoked: ${apiKeyId}`);
  }

  /**
   * Check if API key has required scope
   */
  async hasScope(apiKey: string, requiredScope: string): Promise<boolean> {
    const verification = await this.verifyApiKey(apiKey);
    if (!verification.valid || !verification.scopes) {
      return false;
    }

    // Check exact match or wildcard
    return verification.scopes.includes(requiredScope) || verification.scopes.includes('*');
  }

  /**
   * Generate API key
   */
  private generateApiKey(): string {
    // Generate secure random key
    return randomBytes(32).toString('hex');
  }

  /**
   * Hash API key for storage
   */
  private async hashApiKey(key: string): Promise<string> {
    return createHash('sha256').update(key).digest('hex');
  }
}
