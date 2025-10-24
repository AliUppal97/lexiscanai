import { Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { EncryptionService } from '../../services/encryption.service';
import { CreateApiKeyDto, UpdateApiKeyDto } from './dto';

@Injectable()
export class ApiKeysService {
  private readonly logger = new Logger(ApiKeysService.name);

  constructor(
    private prisma: PrismaService,
    private encryptionService: EncryptionService,
  ) {}

  async create(tenantId: string, userId: string, dto: CreateApiKeyDto): Promise<{ key: string; apiKey: any }> {
    // Generate API key
    const key = this.encryptionService.generateAPIKey('lxs');
    const keyHash = this.encryptionService.hash(key);

    // In production:
    // const apiKey = await this.prisma.apiKey.create({
    //   data: {
    //     name: dto.name,
    //     description: dto.description,
    //     keyHash,
    //     tenantId,
    //     userId,
    //     scopes: dto.scopes,
    //     expiresAt: dto.expiresAt,
    //     lastUsedAt: null,
    //   },
    // });

    this.logger.log(`API key created: ${dto.name} for tenant ${tenantId}`);

    return {
      key, // Return plain key only once
      apiKey: {
        id: 'key_mock_id',
        name: dto.name,
        prefix: key.substring(0, 10) + '...',
        createdAt: new Date(),
      },
    };
  }

  async findAll(tenantId: string, userId?: string): Promise<any[]> {
    // In production:
    // return await this.prisma.apiKey.findMany({
    //   where: {
    //     tenantId,
    //     ...(userId && { userId }),
    //     isActive: true,
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

  async findOne(keyId: string, tenantId: string): Promise<any> {
    // In production:
    // const apiKey = await this.prisma.apiKey.findFirst({
    //   where: { id: keyId, tenantId },
    //   select: {
    //     id: true,
    //     name: true,
    //     description: true,
    //     scopes: true,
    //     lastUsedAt: true,
    //     expiresAt: true,
    //     createdAt: true,
    //     isActive: true,
    //   },
    // });
    //
    // if (!apiKey) throw new NotFoundException('API key not found');

    return { id: keyId, name: 'Mock API Key' };
  }

  async update(keyId: string, tenantId: string, dto: UpdateApiKeyDto): Promise<any> {
    // In production:
    // return await this.prisma.apiKey.update({
    //   where: { id: keyId, tenantId },
    //   data: dto,
    // });

    this.logger.log(`API key updated: ${keyId}`);
    return { id: keyId, ...dto };
  }

  async delete(keyId: string, tenantId: string): Promise<void> {
    // In production:
    // await this.prisma.apiKey.delete({
    //   where: { id: keyId, tenantId },
    // });

    this.logger.log(`API key deleted: ${keyId}`);
  }

  async validateKey(key: string): Promise<{ valid: boolean; tenantId?: string; userId?: string; scopes?: string[] }> {
    const keyHash = this.encryptionService.hash(key);

    // In production:
    // const apiKey = await this.prisma.apiKey.findFirst({
    //   where: {
    //     keyHash,
    //     isActive: true,
    //     OR: [
    //       { expiresAt: null },
    //       { expiresAt: { gt: new Date() } },
    //     ],
    //   },
    // });
    //
    // if (!apiKey) {
    //   return { valid: false };
    // }
    //
    // // Update last used
    // await this.prisma.apiKey.update({
    //   where: { id: apiKey.id },
    //   data: { lastUsedAt: new Date() },
    // });
    //
    // return {
    //   valid: true,
    //   tenantId: apiKey.tenantId,
    //   userId: apiKey.userId,
    //   scopes: apiKey.scopes,
    // };

    return { valid: false }; // Mock
  }

  async revoke(keyId: string, tenantId: string): Promise<void> {
    // In production:
    // await this.prisma.apiKey.update({
    //   where: { id: keyId, tenantId },
    //   data: { isActive: false },
    // });

    this.logger.log(`API key revoked: ${keyId}`);
  }

  async rotateKey(keyId: string, tenantId: string): Promise<{ key: string; apiKey: any }> {
    // Get existing key
    const existingKey = await this.findOne(keyId, tenantId);

    // Create new key with same properties
    const newKey = await this.create(tenantId, existingKey.userId, {
      name: existingKey.name,
      description: existingKey.description,
      scopes: existingKey.scopes,
      expiresAt: existingKey.expiresAt,
    });

    // Revoke old key
    await this.revoke(keyId, tenantId);

    this.logger.log(`API key rotated: ${keyId}`);

    return newKey;
  }
}

