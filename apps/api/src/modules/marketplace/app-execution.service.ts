import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { MarketplaceApp } from '@prisma/client';

@Injectable()
export class AppExecutionService {
  private readonly logger = new Logger(AppExecutionService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Execute app
   */
  async executeApp(appId: string, input: any): Promise<any> {
    const app = await this.prisma.marketplaceApp.findUnique({
      where: { id: appId },
    });

    if (!app) {
      throw new Error(`App ${appId} not found`);
    }

    // Validate app
    await this.validateApp(appId);

    // Execute based on app type
    switch (app.appType) {
      case 'AI_MODEL':
        return await this.executeAIModel(app, input);
      case 'INTEGRATION':
        return await this.executeIntegration(app, input);
      case 'WORKFLOW':
        return await this.executeWorkflow(app, input);
      default:
        throw new Error(`Unknown app type: ${app.appType}`);
    }
  }

  /**
   * Validate app
   */
  async validateApp(appId: string): Promise<void> {
    // Check if app is published
    const app = await this.prisma.marketplaceApp.findUnique({
      where: { id: appId },
    });

    if (!app || app.status !== 'PUBLISHED') {
      throw new Error(`App ${appId} is not available`);
    }
  }

  /**
   * Execute AI model app
   */
  private async executeAIModel(app: MarketplaceApp, input: any): Promise<any> {
    this.logger.debug(`Executing AI model app: ${app.name}`);
    
    const config = app.config as any;
    const modelId = config.modelId;
    
    if (!modelId) {
      throw new Error(`AI model app ${app.id} missing modelId in config`);
    }

    // Call AI model inference service
    // In production, would inject ModelInferenceService
    const axios = require('axios');
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
    
    try {
      const response = await axios.post(
        `${baseUrl}/api/v1/ai-models/${modelId}/predict`,
        { input },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        },
      );

      return {
        success: true,
        result: response.data,
        appId: app.id,
        appName: app.name,
      };
    } catch (error) {
      this.logger.error(`Failed to execute AI model app ${app.id}: ${error.message}`);
      throw new Error(`AI model execution failed: ${error.message}`);
    }
  }

  /**
   * Execute integration app
   */
  private async executeIntegration(app: MarketplaceApp, input: any): Promise<any> {
    this.logger.debug(`Executing integration app: ${app.name}`);
    
    const config = app.config as any;
    const endpoint = config.endpoint;
    const method = config.method || 'POST';
    
    if (!endpoint) {
      throw new Error(`Integration app ${app.id} missing endpoint in config`);
    }

    // Execute integration via HTTP call
    const axios = require('axios');
    
    try {
      const response = await axios({
        method,
        url: endpoint,
        data: input,
        headers: {
          'Content-Type': 'application/json',
          ...(config.headers || {}),
        },
        timeout: config.timeout || 30000,
      });

      return {
        success: true,
        result: response.data,
        appId: app.id,
        appName: app.name,
        statusCode: response.status,
      };
    } catch (error) {
      this.logger.error(`Failed to execute integration app ${app.id}: ${error.message}`);
      throw new Error(`Integration execution failed: ${error.message}`);
    }
  }

  /**
   * Execute workflow app
   */
  private async executeWorkflow(app: MarketplaceApp, input: any): Promise<any> {
    this.logger.debug(`Executing workflow app: ${app.name}`);
    
    const config = app.config as any;
    const workflowId = config.workflowId;
    
    if (!workflowId) {
      throw new Error(`Workflow app ${app.id} missing workflowId in config`);
    }

    // Execute workflow via workflow service
    // In production, would inject WorkflowEngineService
    const axios = require('axios');
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
    
    try {
      const response = await axios.post(
        `${baseUrl}/api/v1/workflows/${workflowId}/execute`,
        { input },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 60000, // Workflows may take longer
        },
      );

      return {
        success: true,
        result: response.data,
        appId: app.id,
        appName: app.name,
        executionId: response.data.id,
      };
    } catch (error) {
      this.logger.error(`Failed to execute workflow app ${app.id}: ${error.message}`);
      throw new Error(`Workflow execution failed: ${error.message}`);
    }
  }

  /**
   * Sandbox execution (for security)
   */
  async sandboxExecution(code: string, timeout: number = 30000): Promise<any> {
    // In production, would use Docker containers or VMs for sandboxing
    // For now, validate code and execute in isolated context

    // Validate code safety
    const validation = await this.validateCode(code);
    if (!validation.valid) {
      throw new Error(`Code validation failed: ${validation.errors.join(', ')}`);
    }

    // Execute in sandbox (simplified - would use Docker/VM in production)
    try {
      const result = await this.executeInSandbox(code, timeout);
      return result;
    } catch (error) {
      this.logger.error(`Sandbox execution failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Validate code for security
   */
  private async validateCode(code: string): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Check for dangerous patterns
    const dangerousPatterns = [
      'require(',
      'import(',
      'eval(',
      'Function(',
      'process.',
      'global.',
      'fs.',
      'child_process',
      'exec(',
      'spawn(',
    ];

    for (const pattern of dangerousPatterns) {
      if (code.includes(pattern)) {
        errors.push(`Dangerous pattern detected: ${pattern}`);
      }
    }

    // Check code length (prevent DoS)
    if (code.length > 100000) {
      errors.push('Code exceeds maximum length (100KB)');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Execute code in sandbox using VM2 for Node.js sandboxing
   */
  private async executeInSandbox(code: string, timeout: number): Promise<any> {
    // In production, would use Docker containers or VMs for complete isolation
    // For Node.js, use VM2 library for sandboxing
    const { VM } = require('vm2');

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Execution timeout'));
      }, timeout);

      try {
        // Create isolated VM with restricted access
        const vm = new VM({
          timeout: timeout,
          sandbox: {
            // Provide safe APIs only
            console: {
              log: (...args: any[]) => this.logger.debug(`[Sandbox] ${args.join(' ')}`),
              error: (...args: any[]) => this.logger.error(`[Sandbox] ${args.join(' ')}`),
            },
            // Add safe utility functions
            Math: Math,
            Date: Date,
            JSON: JSON,
            Array: Array,
            Object: Object,
            String: String,
            Number: Number,
            Boolean: Boolean,
          },
        });

        // Execute code in sandbox
        const result = vm.run(code);

        clearTimeout(timer);
        resolve({
          result: 'Sandbox execution completed',
          output: result,
          executedAt: new Date().toISOString(),
        });
      } catch (error) {
        clearTimeout(timer);
        this.logger.error(`Sandbox execution error: ${error.message}`);
        reject(new Error(`Sandbox execution failed: ${error.message}`));
      }
    });
  }

  /**
   * Validate app before execution
   */
  async validateApp(appId: string): Promise<{ valid: boolean; errors: string[] }> {
    const app = await this.prisma.marketplaceApp.findUnique({
      where: { id: appId },
    });

    if (!app) {
      return { valid: false, errors: ['App not found'] };
    }

    const errors: string[] = [];

    // Check app status
    if (app.status !== 'PUBLISHED') {
      errors.push(`App is not published (status: ${app.status})`);
    }

    // Validate app config
    const config = app.config as any;
    if (!config.code && !config.endpoint) {
      errors.push('App must have either code or endpoint configured');
    }

    // Security scan (would use actual security scanner in production)
    if (config.code) {
      const codeValidation = await this.validateCode(config.code);
      if (!codeValidation.valid) {
        errors.push(...codeValidation.errors);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

