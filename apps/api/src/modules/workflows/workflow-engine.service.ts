import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { Workflow, WorkflowStatus, WorkflowExecutionStatus } from '@prisma/client';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';

@Injectable()
export class WorkflowEngineService {
  private readonly logger = new Logger(WorkflowEngineService.name);

  constructor(
    private prisma: PrismaService,
    @InjectQueue('workflows') private workflowQueue: Queue,
  ) {}

  /**
   * Create workflow
   */
  async createWorkflow(tenantId: string, userId: string, dto: any): Promise<Workflow> {
    // Validate workflow definition
    this.validateWorkflow(dto.definition);

    const workflow = await this.prisma.workflow.create({
      data: {
        name: dto.name,
        description: dto.description,
        definition: dto.definition,
        status: WorkflowStatus.ACTIVE,
        tenantId,
        createdBy: userId,
      },
    });

    // Create workflow steps
    if (dto.definition.steps) {
      await this.createWorkflowSteps(workflow.id, dto.definition.steps);
    }

    return workflow;
  }

  /**
   * Update workflow
   */
  async updateWorkflow(id: string, tenantId: string, dto: any): Promise<Workflow> {
    const workflow = await this.getWorkflow(id, tenantId);

    if (dto.definition) {
      this.validateWorkflow(dto.definition);
    }

    const updated = await this.prisma.workflow.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        definition: dto.definition,
      },
    });

    return updated;
  }

  /**
   * Delete workflow
   */
  async deleteWorkflow(id: string, tenantId: string): Promise<void> {
    await this.getWorkflow(id, tenantId);
    await this.prisma.workflow.update({
      where: { id },
      data: { status: WorkflowStatus.ARCHIVED },
    });
  }

  /**
   * Execute workflow
   */
  async executeWorkflow(id: string, tenantId: string, input?: any): Promise<any> {
    const workflow = await this.getWorkflow(id, tenantId);

    // Create execution record
    const execution = await this.prisma.workflowExecution.create({
      data: {
        workflowId: id,
        status: WorkflowExecutionStatus.RUNNING,
      },
    });

    // Queue workflow execution
    await this.workflowQueue.add('execute', {
      executionId: execution.id,
      workflowId: id,
      tenantId,
      input: input || {},
    });

    return execution;
  }

  /**
   * Pause workflow
   */
  async pauseWorkflow(id: string, tenantId: string): Promise<Workflow> {
    const workflow = await this.getWorkflow(id, tenantId);
    return this.prisma.workflow.update({
      where: { id },
      data: { status: WorkflowStatus.PAUSED },
    });
  }

  /**
   * Resume workflow
   */
  async resumeWorkflow(id: string, tenantId: string): Promise<Workflow> {
    const workflow = await this.getWorkflow(id, tenantId);
    return this.prisma.workflow.update({
      where: { id },
      data: { status: WorkflowStatus.ACTIVE },
    });
  }

  /**
   * Validate workflow definition
   */
  private validateWorkflow(definition: any): void {
    if (!definition.steps || !Array.isArray(definition.steps)) {
      throw new Error('Workflow must have steps array');
    }

    // Validate at least one trigger step
    const hasTrigger = definition.steps.some((step: any) => step.type === 'TRIGGER');
    if (!hasTrigger) {
      throw new Error('Workflow must have at least one trigger step');
    }
  }

  /**
   * Create workflow steps
   */
  private async createWorkflowSteps(workflowId: string, steps: any[]): Promise<void> {
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      await this.prisma.workflowStep.create({
        data: {
          workflowId,
          stepType: step.type,
          config: step.config || {},
          order: i,
          nextStepId: steps[i + 1]?.id || null,
        },
      });
    }
  }

  /**
   * Get workflow by ID
   */
  private async getWorkflow(id: string, tenantId: string): Promise<Workflow> {
    const workflow = await this.prisma.workflow.findFirst({
      where: { id, tenantId },
    });

    if (!workflow) {
      throw new NotFoundException(`Workflow ${id} not found`);
    }

    return workflow;
  }
}

