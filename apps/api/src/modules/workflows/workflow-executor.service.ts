import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { WorkflowExecutionStatus, WorkflowStepType } from '@prisma/client';

@Injectable()
export class WorkflowExecutorService {
  private readonly logger = new Logger(WorkflowExecutorService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Execute workflow step
   */
  async executeStep(step: any, context: any): Promise<any> {
    switch (step.stepType) {
      case WorkflowStepType.TRIGGER:
        return this.handleTrigger(step, context);
      case WorkflowStepType.ACTION:
        return this.handleAction(step, context);
      case WorkflowStepType.CONDITION:
        return this.handleCondition(step, context);
      default:
        throw new Error(`Unknown step type: ${step.stepType}`);
    }
  }

  /**
   * Handle trigger step
   */
  private async handleTrigger(step: any, context: any): Promise<any> {
    const triggerType = step.config.type;
    this.logger.debug(`Executing trigger: ${triggerType}`);

    // Handle different trigger types
    switch (triggerType) {
      case 'webhook':
        return { triggered: true, data: context.webhookData };
      case 'schedule':
        return { triggered: true, data: context.scheduleData };
      case 'event':
        return { triggered: true, data: context.eventData };
      case 'manual':
        return { triggered: true, data: context.input };
      default:
        return { triggered: false };
    }
  }

  /**
   * Handle action step
   */
  private async handleAction(step: any, context: any): Promise<any> {
    const actionType = step.config.type;
    this.logger.debug(`Executing action: ${actionType}`);

    // Handle different action types
    switch (actionType) {
      case 'sendEmail':
        return await this.sendEmail(step.config, context);
      case 'createDocument':
        return await this.createDocument(step.config, context);
      case 'updateRecord':
        return await this.updateRecord(step.config, context);
      case 'callAPI':
        return await this.callAPI(step.config, context);
      case 'notify':
        return await this.notify(step.config, context);
      default:
        throw new Error(`Unknown action type: ${actionType}`);
    }
  }

  /**
   * Handle condition step
   */
  private async handleCondition(step: any, context: any): Promise<{ result: boolean; nextStep?: string }> {
    const condition = step.config.condition;
    const result = this.evaluateCondition(condition, context);

    return {
      result,
      nextStep: result ? step.config.trueStep : step.config.falseStep,
    };
  }

  /**
   * Evaluate condition
   */
  private evaluateCondition(condition: any, context: any): boolean {
    // Simple condition evaluation - in production use a proper expression evaluator
    const { field, operator, value } = condition;
    const fieldValue = this.getNestedValue(context, field);

    switch (operator) {
      case 'equals':
        return fieldValue === value;
      case 'notEquals':
        return fieldValue !== value;
      case 'greaterThan':
        return fieldValue > value;
      case 'lessThan':
        return fieldValue < value;
      case 'contains':
        return String(fieldValue).includes(value);
      default:
        return false;
    }
  }

  /**
   * Get nested value from object
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Send email action
   */
  private async sendEmail(config: any, context: any): Promise<any> {
    // TODO: Integrate with email service
    this.logger.debug(`Sending email to ${config.to}`);
    return { success: true };
  }

  /**
   * Create document action
   */
  private async createDocument(config: any, context: any): Promise<any> {
    // TODO: Integrate with document service
    this.logger.debug(`Creating document: ${config.name}`);
    return { success: true, documentId: 'doc-123' };
  }

  /**
   * Update record action
   */
  private async updateRecord(config: any, context: any): Promise<any> {
    // TODO: Integrate with appropriate service
    this.logger.debug(`Updating record: ${config.table}`);
    return { success: true };
  }

  /**
   * Call API action
   */
  private async callAPI(config: any, context: any): Promise<any> {
    // TODO: Make HTTP request
    this.logger.debug(`Calling API: ${config.url}`);
    return { success: true };
  }

  /**
   * Notify action
   */
  private async notify(config: any, context: any): Promise<any> {
    // TODO: Integrate with notification service
    this.logger.debug(`Sending notification: ${config.type}`);
    return { success: true };
  }

  /**
   * Handle workflow error
   */
  async handleError(error: Error, executionId: string): Promise<void> {
    await this.prisma.workflowExecution.update({
      where: { id: executionId },
      data: {
        status: WorkflowExecutionStatus.FAILED,
        errorMessage: error.message,
        completedAt: new Date(),
      },
    });
  }
}

