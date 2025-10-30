import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { JsonObject } from '@lexiscan/shared-types';

export interface WebhookPayload {
  event: string;
  tenantId: string;
  data: any;
  timestamp?: Date;
  metadata?: Record<string, any>;
}

export interface WebhookEndpoint {
  id: string;
  tenantId: string;
  url: string;
  events: string[];
  secret: string;
  active: boolean;
  headers?: Record<string, string>;
}

export interface WebhookAttempt {
  id: string;
  endpointId: string;
  event: string;
  payload: any;
  response?: {
    status: number;
    body: any;
  };
  success: boolean;
  attempt: number;
  error?: string;
  timestamp: Date;
}

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);
  private readonly maxAttempts: number;
  private readonly timeout: number;

  constructor(private configService: ConfigService) {
    this.maxAttempts = this.configService.get<number>('WEBHOOK_MAX_ATTEMPTS', 5);
    this.timeout = this.configService.get<number>('WEBHOOK_TIMEOUT', 10000);
  }

  /**
   * Send a webhook to a single endpoint
   */
  async send(
    endpoint: WebhookEndpoint,
    payload: WebhookPayload,
    attempt: number = 1,
  ): Promise<WebhookAttempt> {
    const webhookAttempt: WebhookAttempt = {
      id: this.generateId(),
      endpointId: endpoint.id,
      event: payload.event,
      payload: payload.data,
      success: false,
      attempt,
      timestamp: new Date(),
    };

    if (!endpoint.active) {
      webhookAttempt.error = 'Endpoint is disabled';
      this.logger.warn(`Webhook endpoint disabled: ${endpoint.url}`);
      return webhookAttempt;
    }

    // Check if endpoint is subscribed to this event
    if (!endpoint.events.includes(payload.event) && !endpoint.events.includes('*')) {
      webhookAttempt.error = 'Endpoint not subscribed to this event';
      this.logger.warn(`Endpoint ${endpoint.url} not subscribed to event: ${payload.event}`);
      return webhookAttempt;
    }

    try {
      const webhookPayload = {
        id: webhookAttempt.id,
        event: payload.event,
        data: payload.data,
        timestamp: payload.timestamp || new Date(),
        metadata: payload.metadata,
      };

      // Generate signature
      const signature = this.generateSignature(webhookPayload, endpoint.secret);

      // Prepare headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'User-Agent': 'LexiScan-Webhook/1.0',
        'X-Webhook-Signature': signature,
        'X-Webhook-ID': webhookAttempt.id,
        'X-Webhook-Event': payload.event,
        'X-Webhook-Timestamp': webhookPayload.timestamp.toISOString(),
        'X-Webhook-Attempt': attempt.toString(),
        ...endpoint.headers,
      };

      this.logger.log(`Sending webhook to ${endpoint.url} (attempt ${attempt}/${this.maxAttempts})`);

      // Send webhook
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(endpoint.url, {
        method: 'POST',
        headers,
        body: JSON.stringify(webhookPayload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      let responseBody: any;
      try {
        responseBody = await response.json();
      } catch {
        responseBody = await response.text();
      }

      webhookAttempt.response = {
        status: response.status,
        body: responseBody,
      };

      // Success if status is 2xx
      if (response.status >= 200 && response.status < 300) {
        webhookAttempt.success = true;
        this.logger.log(
          `Webhook sent successfully to ${endpoint.url}: ${response.status}`,
        );
      } else {
        webhookAttempt.error = `HTTP ${response.status}: ${JSON.stringify(responseBody)}`;
        this.logger.error(
          `Webhook failed with status ${response.status}: ${endpoint.url}`,
        );
      }
    } catch (error: any) {
      webhookAttempt.error = error.message;
      this.logger.error(`Webhook error: ${error.message}`);

      // Retry if not max attempts
      if (attempt < this.maxAttempts) {
        const backoffDelay = this.calculateBackoff(attempt);
        this.logger.log(`Retrying webhook in ${backoffDelay}ms...`);
        await this.delay(backoffDelay);
        return this.send(endpoint, payload, attempt + 1);
      }
    }

    // Store attempt in database (in production)
    // await this.prisma.webhookAttempt.create({ data: webhookAttempt });

    return webhookAttempt;
  }

  /**
   * Send webhook to multiple endpoints
   */
  async sendToMultiple(
    endpoints: WebhookEndpoint[],
    payload: WebhookPayload,
  ): Promise<WebhookAttempt[]> {
    const attempts = await Promise.all(
      endpoints.map((endpoint) => this.send(endpoint, payload)),
    );

    const successful = attempts.filter((a) => a.success).length;
    const failed = attempts.length - successful;

    this.logger.log(
      `Webhook sent to ${endpoints.length} endpoints: ${successful} succeeded, ${failed} failed`,
    );

    return attempts;
  }

  /**
   * Broadcast webhook to all endpoints subscribed to an event
   */
  async broadcast(tenantId: string, event: string, data: JsonObject): Promise<WebhookAttempt[]> {
    // In production, fetch all active endpoints for this tenant and event
    // const endpoints = await this.prisma.webhookEndpoint.findMany({
    //   where: {
    //     tenantId,
    //     active: true,
    //     OR: [
    //       { events: { has: event } },
    //       { events: { has: '*' } },
    //     ],
    //   },
    // });

    const endpoints: WebhookEndpoint[] = []; // Mock

    const payload: WebhookPayload = {
      event,
      tenantId,
      data,
      timestamp: new Date(),
    };

    if (endpoints.length === 0) {
      this.logger.warn(`No webhook endpoints found for event: ${event}`);
      return [];
    }

    return this.sendToMultiple(endpoints, payload);
  }

  /**
   * Verify webhook signature
   */
  verifySignature(payload: string, signature: string, secret: string): boolean {
    try {
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature),
      );
    } catch (error) {
      this.logger.error(`Signature verification failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Generate webhook signature
   */
  generateSignature(payload: JsonObject, secret: string): string {
    const payloadString = JSON.stringify(payload);
    return crypto.createHmac('sha256', secret).update(payloadString).digest('hex');
  }

  /**
   * Generate webhook secret
   */
  generateSecret(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Endpoint Management (Database operations - mock implementations)
   */

  async createEndpoint(
    tenantId: string,
    url: string,
    events: string[],
    headers?: Record<string, string>,
  ): Promise<WebhookEndpoint> {
    const endpoint: WebhookEndpoint = {
      id: this.generateId(),
      tenantId,
      url,
      events,
      secret: this.generateSecret(),
      active: true,
      headers,
    };

    // In production:
    // await this.prisma.webhookEndpoint.create({ data: endpoint });

    this.logger.log(`Webhook endpoint created: ${url}`);
    return endpoint;
  }

  async updateEndpoint(
    endpointId: string,
    updates: Partial<Pick<WebhookEndpoint, 'url' | 'events' | 'active' | 'headers'>>,
  ): Promise<WebhookEndpoint | null> {
    // In production:
    // return await this.prisma.webhookEndpoint.update({
    //   where: { id: endpointId },
    //   data: updates,
    // });

    this.logger.log(`Webhook endpoint updated: ${endpointId}`);
    return null;
  }

  async deleteEndpoint(endpointId: string): Promise<boolean> {
    // In production:
    // await this.prisma.webhookEndpoint.delete({ where: { id: endpointId } });

    this.logger.log(`Webhook endpoint deleted: ${endpointId}`);
    return true;
  }

  async getEndpoint(endpointId: string): Promise<WebhookEndpoint | null> {
    // In production:
    // return await this.prisma.webhookEndpoint.findUnique({
    //   where: { id: endpointId },
    // });

    return null;
  }

  async listEndpoints(tenantId: string): Promise<WebhookEndpoint[]> {
    // In production:
    // return await this.prisma.webhookEndpoint.findMany({
    //   where: { tenantId },
    //   orderBy: { createdAt: 'desc' },
    // });

    return [];
  }

  async testEndpoint(endpointId: string): Promise<WebhookAttempt> {
    // Get endpoint
    // const endpoint = await this.getEndpoint(endpointId);

    // Send test payload
    const testPayload: WebhookPayload = {
      event: 'test',
      tenantId: 'test-tenant',
      data: {
        message: 'This is a test webhook from LexiScan AI',
        timestamp: new Date(),
      },
    };

    // return await this.send(endpoint, testPayload);

    return {
      id: this.generateId(),
      endpointId,
      event: 'test',
      payload: testPayload.data,
      success: true,
      attempt: 1,
      timestamp: new Date(),
    };
  }

  /**
   * Get webhook attempt history
   */
  async getAttempts(
    endpointId: string,
    options?: {
      limit?: number;
      offset?: number;
      successOnly?: boolean;
    },
  ): Promise<{ attempts: WebhookAttempt[]; total: number }> {
    // In production:
    // const where: any = { endpointId };
    // if (options?.successOnly) {
    //   where.success = true;
    // }
    //
    // const [attempts, total] = await Promise.all([
    //   this.prisma.webhookAttempt.findMany({
    //     where,
    //     orderBy: { timestamp: 'desc' },
    //     skip: options?.offset || 0,
    //     take: options?.limit || 50,
    //   }),
    //   this.prisma.webhookAttempt.count({ where }),
    // ]);

    return {
      attempts: [],
      total: 0,
    };
  }

  /**
   * Retry a failed webhook
   */
  async retry(attemptId: string): Promise<WebhookAttempt> {
    // In production:
    // const attempt = await this.prisma.webhookAttempt.findUnique({
    //   where: { id: attemptId },
    //   include: { endpoint: true },
    // });
    //
    // if (!attempt) {
    //   throw new Error('Webhook attempt not found');
    // }
    //
    // const payload: WebhookPayload = {
    //   event: attempt.event,
    //   tenantId: attempt.endpoint.tenantId,
    //   data: attempt.payload,
    // };
    //
    // return await this.send(attempt.endpoint, payload);

    return {
      id: this.generateId(),
      endpointId: 'mock',
      event: 'retry',
      payload: {},
      success: true,
      attempt: 1,
      timestamp: new Date(),
    };
  }

  /**
   * Pre-built webhook events
   */

  async onDocumentProcessed(
    tenantId: string,
    documentId: string,
    documentTitle: string,
  ): Promise<void> {
    await this.broadcast(tenantId, 'document.processed', {
      documentId,
      title: documentTitle,
      status: 'completed',
    });
  }

  async onDocumentFailed(
    tenantId: string,
    documentId: string,
    error: string,
  ): Promise<void> {
    await this.broadcast(tenantId, 'document.failed', {
      documentId,
      error,
    });
  }

  async onInvoiceGenerated(
    tenantId: string,
    invoiceId: string,
    amount: number,
  ): Promise<void> {
    await this.broadcast(tenantId, 'invoice.generated', {
      invoiceId,
      amount,
    });
  }

  async onSubscriptionUpdated(
    tenantId: string,
    subscriptionId: string,
    status: string,
  ): Promise<void> {
    await this.broadcast(tenantId, 'subscription.updated', {
      subscriptionId,
      status,
    });
  }

  /**
   * Utility methods
   */

  private calculateBackoff(attempt: number): number {
    // Exponential backoff: 1s, 2s, 4s, 8s, 16s
    return Math.min(1000 * Math.pow(2, attempt - 1), 16000);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private generateId(): string {
    return `wh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

