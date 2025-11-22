import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { QuotasService } from './quotas.service';
import { ResourceType } from '@prisma/client';

export const QUOTA_REQUIRED_KEY = 'quotaRequired';

/**
 * Decorator to mark endpoints that require quota checking
 * @param resourceType Resource type to check quota for
 * @param quantity Quantity to consume (default: 1)
 */
export const QuotaRequired = (resourceType: ResourceType, quantity: number = 1) => {
  return SetMetadata(QUOTA_REQUIRED_KEY, { resourceType, quantity });
};

@Injectable()
export class QuotaEnforcementGuard implements CanActivate {
  constructor(
    private quotasService: QuotasService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get quota requirement from metadata
    const quotaRequired = this.reflector.get<{ resourceType: ResourceType; quantity: number }>(
      QUOTA_REQUIRED_KEY,
      context.getHandler(),
    );

    // If no quota requirement, allow request
    if (!quotaRequired) {
      return true;
    }

    // Get request and user
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const tenantId = user?.tenantId || request.headers['x-tenant-id'];

    if (!tenantId) {
      throw new HttpException('Tenant ID required for quota checking', HttpStatus.BAD_REQUEST);
    }

    // Check quota
    const { resourceType, quantity } = quotaRequired;
    const check = await this.quotasService.checkQuota(tenantId, resourceType, BigInt(quantity));

    if (!check.allowed) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: `Quota exceeded for ${resourceType}. Limit: ${check.quota?.limit || 'unknown'}`,
          error: 'Quota Exceeded',
          quota: {
            resourceType,
            limit: check.quota?.limit?.toString() || '0',
            remaining: check.remaining.toString(),
          },
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Store quota info in request for later consumption
    request.quotaInfo = {
      resourceType,
      quantity: BigInt(quantity),
      quota: check.quota,
      remaining: check.remaining,
    };

    return true;
  }
}

