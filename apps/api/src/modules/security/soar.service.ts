import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { SoarPlaybook } from '@prisma/client';

@Injectable()
export class SoarService {
  private readonly logger = new Logger(SoarService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Create SOAR playbook
   */
  async createPlaybook(tenantId: string, dto: any): Promise<SoarPlaybook> {
    const playbook = await this.prisma.soarPlaybook.create({
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
   * Execute playbook for incident
   */
  async executePlaybook(playbookId: string, incidentId: string): Promise<void> {
    const playbook = await this.prisma.soarPlaybook.findUnique({
      where: { id: playbookId },
    });

    if (!playbook || !playbook.enabled) {
      throw new Error(`Playbook ${playbookId} not found or disabled`);
    }

    const incident = await this.prisma.securityIncident.findUnique({
      where: { id: incidentId },
    });

    if (!incident) {
      throw new Error(`Incident ${incidentId} not found`);
    }

    // Execute actions
    const actions = playbook.actions as any[];
    for (const action of actions) {
      await this.executeAction(action, incident);
    }

    this.logger.log(`Executed playbook ${playbookId} for incident ${incidentId}`);
  }

  /**
   * Automate response to incident
   */
  async automateResponse(incidentId: string): Promise<void> {
    const incident = await this.prisma.securityIncident.findUnique({
      where: { id: incidentId },
      include: { tenant: true },
    });

    if (!incident) {
      return;
    }

    // Find matching playbooks
    const playbooks = await this.prisma.soarPlaybook.findMany({
      where: {
        tenantId: incident.tenantId,
        enabled: true,
      },
    });

    for (const playbook of playbooks) {
      const triggers = playbook.triggers as any;
      if (this.matchTriggers(triggers, incident)) {
        await this.executePlaybook(playbook.id, incidentId);
      }
    }
  }

  /**
   * Match triggers against incident
   */
  private matchTriggers(triggers: any, incident: any): boolean {
    if (triggers.type && triggers.type !== incident.type) {
      return false;
    }

    if (triggers.severity && triggers.severity !== incident.severity) {
      return false;
    }

    // Add more trigger matching logic
    return true;
  }

  /**
   * Execute SOAR action
   */
  private async executeAction(action: any, incident: any): Promise<void> {
    switch (action.type) {
      case 'notify':
        await this.notify(action, incident);
        break;
      case 'block':
        await this.block(action, incident);
        break;
      case 'quarantine':
        await this.quarantine(action, incident);
        break;
      case 'escalate':
        await this.escalate(action, incident);
        break;
      default:
        this.logger.warn(`Unknown action type: ${action.type}`);
    }
  }

  /**
   * Notify action
   */
  private async notify(action: any, incident: any): Promise<void> {
    const recipients = action.recipients || [];
    const message = action.message || `Security incident detected: ${incident.type}`;

    // Create notifications for recipients
    for (const recipient of recipients) {
      await this.prisma.notification.create({
        data: {
          userId: recipient,
          type: 'SECURITY_INCIDENT',
          title: 'Security Incident Alert',
          message,
          metadata: { incidentId: incident.id },
          tenantId: incident.tenantId,
        },
      });
    }

    this.logger.log(`Notified ${recipients.length} recipients about incident ${incident.id}`);
  }

  /**
   * Block action
   */
  private async block(action: any, incident: any): Promise<void> {
    const target = action.target; // Could be userId, IP address, etc.

    // Create security incident with block action
    await this.prisma.securityIncident.create({
      data: {
        type: 'UNAUTHORIZED_ACCESS',
        severity: 'HIGH',
        status: 'OPEN',
        details: {
          action: 'BLOCKED',
          target,
          incidentId: incident.id,
          reason: action.reason || 'Automated block from SOAR playbook',
        },
        tenantId: incident.tenantId,
      },
    });

    // In production, would integrate with firewall/WAF to actually block
    this.logger.warn(`Blocked ${target} for incident ${incident.id}`);
  }

  /**
   * Quarantine action
   */
  private async quarantine(action: any, incident: any): Promise<void> {
    const target = action.target; // Could be documentId, userId, etc.

    // Mark resource as quarantined
    if (action.resourceType === 'document') {
      // Update document status to quarantined
      await this.prisma.document.update({
        where: { id: target },
        data: {
          status: 'QUARANTINED',
        },
      });
    }

    // Create security incident
    await this.prisma.securityIncident.create({
      data: {
        type: 'DLP_VIOLATION',
        severity: 'HIGH',
        status: 'OPEN',
        details: {
          action: 'QUARANTINED',
          target,
          incidentId: incident.id,
        },
        tenantId: incident.tenantId,
      },
    });

    this.logger.warn(`Quarantined ${target} for incident ${incident.id}`);
  }

  /**
   * Escalate action
   */
  private async escalate(action: any, incident: any): Promise<void> {
    await this.prisma.securityIncident.update({
      where: { id: incident.id },
      data: {
        severity: action.severity || 'CRITICAL',
        status: 'INVESTIGATING',
      },
    });
  }
}

