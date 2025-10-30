import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue, Worker, Job, QueueEvents } from 'bullmq';
import { Redis } from 'ioredis';

export interface QueueJob<T = any> {
  id?: string;
  data: T;
  opts?: {
    priority?: number;
    delay?: number;
    attempts?: number;
    backoff?: number | { type: string; delay: number };
    removeOnComplete?: boolean;
    removeOnFail?: boolean;
  };
}

export interface JobResult {
  jobId: string;
  status: 'added' | 'failed';
  error?: string;
}

@Injectable()
export class QueueService implements OnModuleDestroy {
  private readonly logger = new Logger(QueueService.name);
  private readonly queues: Map<string, Queue> = new Map();
  private readonly workers: Map<string, Worker> = new Map();
  private readonly queueEvents: Map<string, QueueEvents> = new Map();
  private enabled: boolean;
  private connection: Redis;

  constructor(private configService: ConfigService) {
    this.enabled = !!this.configService.get<string>('REDIS_HOST');

    if (this.enabled) {
      this.initializeConnection();
    } else {
      this.logger.warn('Redis is not configured. Queue service will be disabled.');
    }
  }

  private initializeConnection(): void {
    try {
      this.connection = new Redis({
        host: this.configService.get<string>('REDIS_HOST'),
        port: this.configService.get<number>('REDIS_PORT', 6379),
        password: this.configService.get<string>('REDIS_PASSWORD'),
        db: this.configService.get<number>('REDIS_QUEUE_DB', 1),
        maxRetriesPerRequest: null,
      });

      this.connection.on('connect', () => {
        this.logger.log('Queue service connected to Redis');
      });

      this.connection.on('error', (error) => {
        this.logger.error(`Queue Redis error: ${error.message}`);
      });
    } catch (error) {
      this.logger.error(`Failed to initialize queue connection: ${error.message}`);
      this.enabled = false;
    }
  }

  /**
   * Get or create a queue
   */
  getQueue(queueName: string): Queue {
    if (!this.enabled) {
      throw new Error('Queue service is not enabled');
    }

    if (!this.queues.has(queueName)) {
      const queue = new Queue(queueName, { connection: this.connection });

      this.queues.set(queueName, queue);
      this.logger.log(`Queue created: ${queueName}`);
    }

    return this.queues.get(queueName)!;
  }

  /**
   * Add a job to a queue
   */
  async addJob<T = any>(
    queueName: string,
    jobName: string,
    data: T,
    opts?: QueueJob['opts'],
  ): Promise<JobResult> {
    if (!this.enabled) {
      this.logger.warn(`Queue disabled. Job not added: ${queueName}/${jobName}`);
      return { jobId: 'disabled', status: 'failed', error: 'Queue service disabled' };
    }

    try {
      const queue = this.getQueue(queueName);

      const job = await queue.add(jobName, data, {
        priority: opts?.priority,
        delay: opts?.delay,
        attempts: opts?.attempts || 3,
        backoff: opts?.backoff || {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: opts?.removeOnComplete ?? true,
        removeOnFail: opts?.removeOnFail ?? false,
      });

      this.logger.log(`Job added to ${queueName}: ${job.id}`);

      return {
        jobId: job.id!,
        status: 'added',
      };
    } catch (error) {
      this.logger.error(`Failed to add job: ${error.message}`);
      return {
        jobId: 'error',
        status: 'failed',
        error: error.message,
      };
    }
  }

  /**
   * Add multiple jobs in bulk
   */
  async addBulkJobs<T = any>(
    queueName: string,
    jobs: Array<{ name: string; data: T; opts?: QueueJob['opts'] }>,
  ): Promise<JobResult[]> {
    if (!this.enabled) {
      return jobs.map(() => ({
        jobId: 'disabled',
        status: 'failed' as const,
        error: 'Queue service disabled',
      }));
    }

    try {
      const queue = this.getQueue(queueName);

      const bulkJobs = jobs.map((job) => ({
        name: job.name,
        data: job.data,
        opts: {
          priority: job.opts?.priority,
          delay: job.opts?.delay,
          attempts: job.opts?.attempts || 3,
          backoff: job.opts?.backoff || { type: 'exponential', delay: 1000 },
        },
      }));

      const addedJobs = await queue.addBulk(bulkJobs);

      this.logger.log(`${addedJobs.length} jobs added to ${queueName}`);

      return addedJobs.map((job) => ({
        jobId: job.id!,
        status: 'added' as const,
      }));
    } catch (error) {
      this.logger.error(`Failed to add bulk jobs: ${error.message}`);
      return jobs.map(() => ({
        jobId: 'error',
        status: 'failed' as const,
        error: error.message,
      }));
    }
  }

  /**
   * Create a worker to process jobs
   */
  createWorker<T = any>(
    queueName: string,
    processor: (job: Job<T>) => Promise<any>,
    options?: {
      concurrency?: number;
      limiter?: {
        max: number;
        duration: number;
      };
    },
  ): Worker {
    if (!this.enabled) {
      throw new Error('Queue service is not enabled');
    }

    const worker = new Worker(queueName, processor, {
      connection: this.connection,
      concurrency: options?.concurrency || 10,
      limiter: options?.limiter,
    });

    worker.on('completed', (job: Job) => {
      this.logger.log(`Job completed: ${job.id} in ${queueName}`);
    });

    worker.on('failed', (job: Job | null, error: Error) => {
      this.logger.error(`Job failed: ${job?.id} in ${queueName} - ${error.message}`);
    });

    worker.on('error', (error: Error) => {
      this.logger.error(`Worker error in ${queueName}: ${error.message}`);
    });

    this.workers.set(queueName, worker);
    this.logger.log(`Worker started for queue: ${queueName}`);

    return worker;
  }

  /**
   * Get job by ID
   */
  async getJob(queueName: string, jobId: string): Promise<Job | null> {
    if (!this.enabled) return null;

    try {
      const queue = this.getQueue(queueName);
      return await queue.getJob(jobId);
    } catch (error) {
      this.logger.error(`Failed to get job: ${error.message}`);
      return null;
    }
  }

  /**
   * Get job counts
   */
  async getJobCounts(queueName: string): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
  }> {
    if (!this.enabled) {
      return { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 };
    }

    try {
      const queue = this.getQueue(queueName);
      return await queue.getJobCounts();
    } catch (error) {
      this.logger.error(`Failed to get job counts: ${error.message}`);
      return { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 };
    }
  }

  /**
   * Get jobs by status
   */
  async getJobs(
    queueName: string,
    status: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed',
    start: number = 0,
    end: number = 10,
  ): Promise<Job[]> {
    if (!this.enabled) return [];

    try {
      const queue = this.getQueue(queueName);

      switch (status) {
        case 'waiting':
          return await queue.getWaiting(start, end);
        case 'active':
          return await queue.getActive(start, end);
        case 'completed':
          return await queue.getCompleted(start, end);
        case 'failed':
          return await queue.getFailed(start, end);
        case 'delayed':
          return await queue.getDelayed(start, end);
        default:
          return [];
      }
    } catch (error) {
      this.logger.error(`Failed to get jobs: ${error.message}`);
      return [];
    }
  }

  /**
   * Remove a job
   */
  async removeJob(queueName: string, jobId: string): Promise<boolean> {
    if (!this.enabled) return false;

    try {
      const job = await this.getJob(queueName, jobId);
      if (job) {
        await job.remove();
        this.logger.log(`Job removed: ${jobId} from ${queueName}`);
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error(`Failed to remove job: ${error.message}`);
      return false;
    }
  }

  /**
   * Retry a failed job
   */
  async retryJob(queueName: string, jobId: string): Promise<boolean> {
    if (!this.enabled) return false;

    try {
      const job = await this.getJob(queueName, jobId);
      if (job) {
        await job.retry();
        this.logger.log(`Job retried: ${jobId} in ${queueName}`);
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error(`Failed to retry job: ${error.message}`);
      return false;
    }
  }

  /**
   * Clean completed/failed jobs
   */
  async cleanQueue(
    queueName: string,
    grace: number = 3600000, // 1 hour
    status: 'completed' | 'failed' = 'completed',
  ): Promise<string[]> {
    if (!this.enabled) return [];

    try {
      const queue = this.getQueue(queueName);
      const jobs = await queue.clean(grace, 100, status);
      this.logger.log(`Cleaned ${jobs.length} ${status} jobs from ${queueName}`);
      return jobs;
    } catch (error) {
      this.logger.error(`Failed to clean queue: ${error.message}`);
      return [];
    }
  }

  /**
   * Pause queue
   */
  async pauseQueue(queueName: string): Promise<boolean> {
    if (!this.enabled) return false;

    try {
      const queue = this.getQueue(queueName);
      await queue.pause();
      this.logger.log(`Queue paused: ${queueName}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to pause queue: ${error.message}`);
      return false;
    }
  }

  /**
   * Resume queue
   */
  async resumeQueue(queueName: string): Promise<boolean> {
    if (!this.enabled) return false;

    try {
      const queue = this.getQueue(queueName);
      await queue.resume();
      this.logger.log(`Queue resumed: ${queueName}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to resume queue: ${error.message}`);
      return false;
    }
  }

  /**
   * Get queue status
   */
  async getQueueStatus(queueName: string): Promise<{
    isPaused: boolean;
    counts: ReturnType<typeof this.getJobCounts> extends Promise<infer T> ? T : never;
  } | null> {
    if (!this.enabled) return null;

    try {
      const queue = this.getQueue(queueName);
      const isPaused = await queue.isPaused();
      const counts = await this.getJobCounts(queueName);

      return {
        isPaused,
        counts,
      };
    } catch (error) {
      this.logger.error(`Failed to get queue status: ${error.message}`);
      return null;
    }
  }

  /**
   * Pre-configured queue methods for common tasks
   */

  // Document processing queue
  async addDocumentProcessingJob(documentId: string, tenantId: string): Promise<JobResult> {
    return this.addJob('document-processing', 'process-document', {
      documentId,
      tenantId,
    });
  }

  // Email queue
  async addEmailJob(
    to: string,
    subject: string,
    template: string,
    data: any,
  ): Promise<JobResult> {
    return this.addJob('email', 'send-email', {
      to,
      subject,
      template,
      data,
    });
  }

  // Notification queue
  async addNotificationJob(
    userId: string,
    type: string,
    message: string,
  ): Promise<JobResult> {
    return this.addJob('notifications', 'send-notification', {
      userId,
      type,
      message,
    });
  }

  // Analytics queue
  async addAnalyticsJob(event: string, userId: string, data: any): Promise<JobResult> {
    return this.addJob('analytics', 'track-event', {
      event,
      userId,
      data,
      timestamp: new Date(),
    });
  }

  // Webhook queue
  async addWebhookJob(url: string, payload: any, headers?: any): Promise<JobResult> {
    return this.addJob('webhooks', 'send-webhook', {
      url,
      payload,
      headers,
    }, {
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
  }

  /**
   * Cleanup on module destruction
   */
  async onModuleDestroy() {
    if (!this.enabled) return;

    this.logger.log('Closing queue service...');

    // Close all workers
    for (const [name, worker] of this.workers.entries()) {
      await worker.close();
      this.logger.log(`Worker closed: ${name}`);
    }

    // Close all queue events
    for (const [name, events] of this.queueEvents.entries()) {
      await events.close();
      this.logger.log(`Queue events closed: ${name}`);
    }

    // Close all queues
    for (const [name, queue] of this.queues.entries()) {
      await queue.close();
      this.logger.log(`Queue closed: ${name}`);
    }

    // Close connection
    if (this.connection) {
      await this.connection.quit();
      this.logger.log('Queue Redis connection closed');
    }
  }
}

