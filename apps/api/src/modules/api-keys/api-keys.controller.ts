import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth.guard';
import { TenantId, UserId } from '../auth/auth.service';
import { ApiKeysService } from './api-keys.service';
import { CreateApiKeyDto, UpdateApiKeyDto } from './dto';

@Controller('api-keys')
@UseGuards(JwtAuthGuard)
export class ApiKeysController {
  constructor(private apiKeysService: ApiKeysService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createApiKey(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Body() dto: CreateApiKeyDto,
  ) {
    return this.apiKeysService.create(tenantId, userId, dto);
  }

  @Get()
  async listApiKeys(@TenantId() tenantId: string, @Request() req) {
    // Admin can see all keys, users can only see their own
    const userId = req.user.role === 'admin' ? undefined : req.user.userId;
    return this.apiKeysService.findAll(tenantId, userId);
  }

  @Get(':keyId')
  async getApiKey(@TenantId() tenantId: string, @Param('keyId') keyId: string) {
    return this.apiKeysService.findOne(keyId, tenantId);
  }

  @Put(':keyId')
  async updateApiKey(
    @TenantId() tenantId: string,
    @Param('keyId') keyId: string,
    @Body() dto: UpdateApiKeyDto,
  ) {
    return this.apiKeysService.update(keyId, tenantId, dto);
  }

  @Delete(':keyId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteApiKey(@TenantId() tenantId: string, @Param('keyId') keyId: string) {
    return this.apiKeysService.delete(keyId, tenantId);
  }

  @Post(':keyId/revoke')
  async revokeApiKey(@TenantId() tenantId: string, @Param('keyId') keyId: string) {
    await this.apiKeysService.revoke(keyId, tenantId);
    return { message: 'API key revoked successfully' };
  }

  @Post(':keyId/rotate')
  async rotateApiKey(@TenantId() tenantId: string, @Param('keyId') keyId: string) {
    return this.apiKeysService.rotateKey(keyId, tenantId);
  }
}

