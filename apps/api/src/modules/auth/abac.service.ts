import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CacheService } from '../../services/cache.service';

export interface AbacPolicyCondition {
  attribute: string; // e.g., "user.tenantId", "resource.status", "time.hour"
  operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'greater_than' | 'less_than' | 'contains' | 'starts_with' | 'ends_with';
  value: any;
}

export interface AbacPolicy {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  resource: string;
  action: string;
  conditions: AbacPolicyCondition[];
  priority: number;
  isActive: boolean;
}

export interface AbacContext {
  user: {
    id: string;
    tenantId: string;
    email: string;
    roles: string[];
    permissions: string[];
    attributes?: Record<string, any>; // Custom user attributes
  };
  resource?: {
    id?: string;
    tenantId?: string;
    type: string;
    attributes?: Record<string, any>; // Resource-specific attributes
  };
  action: string;
  environment?: {
    ipAddress?: string;
    userAgent?: string;
    time?: Date;
    location?: string;
  };
}

@Injectable()
export class AbacService {
  private readonly logger = new Logger(AbacService.name);
  private readonly cachePrefix = 'abac:policy:';
  private readonly cacheTtl = 300; // 5 minutes

  constructor(
    private prisma: PrismaService,
    private cacheService: CacheService,
  ) {}

  /**
   * Create ABAC policy
   */
  async createPolicy(
    tenantId: string,
    name: string,
    resource: string,
    action: string,
    conditions: AbacPolicyCondition[],
    description?: string,
    priority?: number,
  ): Promise<AbacPolicy> {
    // Validate tenant
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId, isActive: true, isDeleted: false },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // Validate conditions
    this.validateConditions(conditions);

    // Create policy
    const policy = await this.prisma.abacPolicy.create({
      data: {
        tenantId,
        name,
        description,
        resource,
        action,
        conditions: conditions as any,
        priority: priority || 100,
        isActive: true,
      },
    });

    // Invalidate cache
    await this.invalidatePolicyCache(tenantId, resource, action);

    this.logger.log(`ABAC policy created: ${policy.id} (tenant: ${tenantId})`);

    return this.mapToPolicy(policy);
  }

  /**
   * Update ABAC policy
   */
  async updatePolicy(
    policyId: string,
    tenantId: string,
    updates: {
      name?: string;
      description?: string;
      conditions?: AbacPolicyCondition[];
      priority?: number;
      isActive?: boolean;
    },
  ): Promise<AbacPolicy> {
    const policy = await this.prisma.abacPolicy.findFirst({
      where: {
        id: policyId,
        tenantId,
      },
    });

    if (!policy) {
      throw new NotFoundException('Policy not found');
    }

    // Validate conditions if provided
    if (updates.conditions) {
      this.validateConditions(updates.conditions);
    }

    // Update policy
    const updated = await this.prisma.abacPolicy.update({
      where: { id: policyId },
      data: {
        name: updates.name,
        description: updates.description,
        conditions: updates.conditions as any,
        priority: updates.priority,
        isActive: updates.isActive,
      },
    });

    // Invalidate cache
    await this.invalidatePolicyCache(tenantId, policy.resource, policy.action);

    this.logger.log(`ABAC policy updated: ${policyId}`);

    return this.mapToPolicy(updated);
  }

  /**
   * Delete ABAC policy
   */
  async deletePolicy(policyId: string, tenantId: string): Promise<void> {
    const policy = await this.prisma.abacPolicy.findFirst({
      where: {
        id: policyId,
        tenantId,
      },
    });

    if (!policy) {
      throw new NotFoundException('Policy not found');
    }

    await this.prisma.abacPolicy.delete({
      where: { id: policyId },
    });

    // Invalidate cache
    await this.invalidatePolicyCache(tenantId, policy.resource, policy.action);

    this.logger.log(`ABAC policy deleted: ${policyId}`);
  }

  /**
   * List ABAC policies for tenant
   */
  async listPolicies(
    tenantId: string,
    resource?: string,
    action?: string,
  ): Promise<AbacPolicy[]> {
    const policies = await this.prisma.abacPolicy.findMany({
      where: {
        tenantId,
        isActive: true,
        ...(resource && { resource }),
        ...(action && { action }),
      },
      orderBy: [
        { priority: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return policies.map((p) => this.mapToPolicy(p));
  }

  /**
   * Evaluate ABAC policies and determine if access is allowed
   */
  async evaluateAccess(context: AbacContext): Promise<{ allowed: boolean; reason?: string; matchedPolicy?: string }> {
    const { user, resource, action } = context;

    if (!resource) {
      return { allowed: false, reason: 'Resource context required' };
    }

    // Get policies from cache or database
    const policies = await this.getPolicies(user.tenantId, resource.type, action);

    if (policies.length === 0) {
      // No ABAC policies, fall back to RBAC
      return { allowed: true, reason: 'No ABAC policies found, using RBAC' };
    }

    // Evaluate policies in priority order
    for (const policy of policies) {
      const result = this.evaluatePolicy(policy, context);

      if (result.matched) {
        // Policy matched - return result
        return {
          allowed: result.allowed,
          reason: result.reason,
          matchedPolicy: policy.id,
        };
      }
    }

    // No policy matched - deny by default (secure by default)
    return {
      allowed: false,
      reason: 'No matching ABAC policy found, access denied',
    };
  }

  /**
   * Evaluate a single policy
   */
  private evaluatePolicy(
    policy: AbacPolicy,
    context: AbacContext,
  ): { matched: boolean; allowed: boolean; reason?: string } {
    const { user, resource, action, environment } = context;

    // Check if policy matches resource and action
    if (policy.resource !== resource.type || policy.action !== action) {
      return { matched: false, allowed: false };
    }

    // Evaluate all conditions
    let allConditionsMet = true;

    for (const condition of policy.conditions) {
      const conditionMet = this.evaluateCondition(condition, context);

      if (!conditionMet) {
        allConditionsMet = false;
        break;
      }
    }

    if (allConditionsMet) {
      return {
        matched: true,
        allowed: true,
        reason: `Policy "${policy.name}" matched`,
      };
    }

    return { matched: false, allowed: false };
  }

  /**
   * Evaluate a single condition
   */
  private evaluateCondition(
    condition: AbacPolicyCondition,
    context: AbacContext,
  ): boolean {
    const { user, resource, environment } = context;

    // Resolve attribute value
    const attributeValue = this.resolveAttribute(condition.attribute, context);

    // Evaluate based on operator
    switch (condition.operator) {
      case 'equals':
        return attributeValue === condition.value;

      case 'not_equals':
        return attributeValue !== condition.value;

      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(attributeValue);

      case 'not_in':
        return Array.isArray(condition.value) && !condition.value.includes(attributeValue);

      case 'greater_than':
        return Number(attributeValue) > Number(condition.value);

      case 'less_than':
        return Number(attributeValue) < Number(condition.value);

      case 'contains':
        return String(attributeValue).includes(String(condition.value));

      case 'starts_with':
        return String(attributeValue).startsWith(String(condition.value));

      case 'ends_with':
        return String(attributeValue).endsWith(String(condition.value));

      default:
        this.logger.warn(`Unknown operator: ${condition.operator}`);
        return false;
    }
  }

  /**
   * Resolve attribute value from context
   */
  private resolveAttribute(attribute: string, context: AbacContext): any {
    const { user, resource, environment } = context;

    // Parse attribute path (e.g., "user.tenantId", "resource.status")
    const parts = attribute.split('.');

    if (parts.length < 2) {
      return null;
    }

    const [entity, ...path] = parts;

    switch (entity) {
      case 'user':
        return this.getNestedValue(user, path.join('.'));

      case 'resource':
        return resource ? this.getNestedValue(resource, path.join('.')) : null;

      case 'time':
        return this.getTimeAttribute(path.join('.'), environment?.time || new Date());

      case 'environment':
        return environment ? this.getNestedValue(environment, path.join('.')) : null;

      default:
        return null;
    }
  }

  /**
   * Get nested value from object
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, prop) => {
      return current && current[prop] !== undefined ? current[prop] : null;
    }, obj);
  }

  /**
   * Get time attribute
   */
  private getTimeAttribute(attribute: string, time: Date): any {
    switch (attribute) {
      case 'hour':
        return time.getHours();
      case 'day':
        return time.getDay();
      case 'month':
        return time.getMonth();
      case 'year':
        return time.getFullYear();
      case 'timestamp':
        return time.getTime();
      default:
        return null;
    }
  }

  /**
   * Get policies from cache or database
   */
  private async getPolicies(
    tenantId: string,
    resource: string,
    action: string,
  ): Promise<AbacPolicy[]> {
    const cacheKey = `${this.cachePrefix}${tenantId}:${resource}:${action}`;

    // Try cache first
    const cached = await this.cacheService.get<AbacPolicy[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Get from database
    const policies = await this.prisma.abacPolicy.findMany({
      where: {
        tenantId,
        resource,
        action,
        isActive: true,
      },
      orderBy: { priority: 'asc' },
    });

    const mapped = policies.map((p) => this.mapToPolicy(p));

    // Cache for 5 minutes
    await this.cacheService.set(cacheKey, mapped, this.cacheTtl);

    return mapped;
  }

  /**
   * Invalidate policy cache
   */
  private async invalidatePolicyCache(
    tenantId: string,
    resource: string,
    action: string,
  ): Promise<void> {
    const cacheKey = `${this.cachePrefix}${tenantId}:${resource}:${action}`;
    await this.cacheService.delete(cacheKey);
  }

  /**
   * Validate conditions
   */
  private validateConditions(conditions: AbacPolicyCondition[]): void {
    if (!Array.isArray(conditions) || conditions.length === 0) {
      throw new BadRequestException('At least one condition is required');
    }

    for (const condition of conditions) {
      if (!condition.attribute) {
        throw new BadRequestException('Condition attribute is required');
      }

      if (!condition.operator) {
        throw new BadRequestException('Condition operator is required');
      }

      const validOperators = [
        'equals',
        'not_equals',
        'in',
        'not_in',
        'greater_than',
        'less_than',
        'contains',
        'starts_with',
        'ends_with',
      ];

      if (!validOperators.includes(condition.operator)) {
        throw new BadRequestException(`Invalid operator: ${condition.operator}`);
      }

      if (condition.value === undefined || condition.value === null) {
        throw new BadRequestException('Condition value is required');
      }
    }
  }

  /**
   * Map database model to policy
   */
  private mapToPolicy(policy: any): AbacPolicy {
    return {
      id: policy.id,
      tenantId: policy.tenantId,
      name: policy.name,
      description: policy.description || undefined,
      resource: policy.resource,
      action: policy.action,
      conditions: policy.conditions as AbacPolicyCondition[],
      priority: policy.priority,
      isActive: policy.isActive,
    };
  }
}

