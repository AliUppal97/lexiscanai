import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CustomerPlaybook } from '@prisma/client';

@Injectable()
export class CustomerPlaybookService {
  private readonly logger = new Logger(CustomerPlaybookService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Create playbook
   */
  async createPlaybook(tenantId: string | null, dto: any): Promise<CustomerPlaybook> {
    const playbook = await this.prisma.customerPlaybook.create({
      data: {
        name: dto.name,
        description: dto.description,
        triggers: dto.triggers || {},
        actions: dto.actions || [],
        enabled: dto.enabled !== undefined ? dto.enabled : true,
        tenantId,
      },
    });

    return playbook;
  }

  /**
   * Execute playbook
   */
  async executePlaybook(playbookId: string, tenantId: string): Promise<void> {
    const playbook = await this.prisma.customerPlaybook.findFirst({
      where: {
        id: playbookId,
        OR: [{ tenantId }, { tenantId: null }], // Global or tenant-specific
        enabled: true,
      },
    });

    if (!playbook) {
      throw new Error(`Playbook ${playbookId} not found or disabled`);
    }

    // Execute actions
    const actions = playbook.actions as any[];
    for (const action of actions) {
      await this.executeAction(action, tenantId);
    }

    this.logger.log(`Executed playbook ${playbookId} for tenant ${tenantId}`);
  }

  /**
   * Trigger playbook based on conditions
   */
  async triggerPlaybook(tenantId: string, trigger: string): Promise<void> {
    const playbooks = await this.prisma.customerPlaybook.findMany({
      where: {
        OR: [{ tenantId }, { tenantId: null }],
        enabled: true,
      },
    });

    for (const playbook of playbooks) {
      const triggers = playbook.triggers as any;
      if (this.matchesTrigger(triggers, trigger)) {
        await this.executePlaybook(playbook.id, tenantId);
      }
    }
  }

  /**
   * Check if trigger matches
   */
  private matchesTrigger(triggers: any, trigger: string): boolean {
    if (triggers.type === trigger) {
      return true;
    }
    if (Array.isArray(triggers.types) && triggers.types.includes(trigger)) {
      return true;
    }
    return false;
  }

  /**
   * Execute playbook action
   */
  private async executeAction(action: any, tenantId: string): Promise<void> {
    switch (action.type) {
      case 'sendEmail':
        // TODO: Send email
        this.logger.debug(`Sending email to tenant ${tenantId}`);
        break;
      case 'createTask':
        // TODO: Create task for CS team
        this.logger.debug(`Creating task for tenant ${tenantId}`);
        break;
      case 'notify':
        // TODO: Send notification
        this.logger.debug(`Notifying about tenant ${tenantId}`);
        break;
      default:
        this.logger.warn(`Unknown action type: ${action.type}`);
    }
  }
}

