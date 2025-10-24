import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiKeysService } from './api-keys.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private apiKeysService: ApiKeysService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // Get API key from header
    const apiKey = request.headers['x-api-key'] || request.headers['authorization']?.replace('Bearer ', '');

    if (!apiKey) {
      throw new UnauthorizedException('API key is required');
    }

    // Validate key
    const validation = await this.apiKeysService.validateKey(apiKey);

    if (!validation.valid) {
      throw new UnauthorizedException('Invalid API key');
    }

    // Attach tenant and user info to request
    request.tenantId = validation.tenantId;
    request.userId = validation.userId;
    request.apiKeyScopes = validation.scopes;

    return true;
  }
}

