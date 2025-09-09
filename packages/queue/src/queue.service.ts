import { Injectable, Logger, OnModuleInit, OnModuleDestroy, Inject } from '@nestjs/common';
import { Queue } from 'bullmq';
import { EmailJob, QueueJobOptions, EmailJobResult } from './interfaces/email-job.interface';
import { QUEUE_CONFIG } from './queue.module';

@Injectable()
export class QueueService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(QueueService.name);
  private emailQueue: Queue;

  constructor(@Inject(QUEUE_CONFIG) private readonly config: any) {}

  onModuleInit() {
    // Use config first, then fall back to environment variables
    const redisHost = this.config?.redis?.host || process.env.REDIS_HOST || 'localhost';
    const redisPort = this.config?.redis?.port || parseInt(process.env.REDIS_PORT || '6379');

    this.emailQueue = new Queue('email', {
      connection: {
        host: redisHost,
        port: redisPort,
      },
      defaultJobOptions: {
        removeOnComplete: 10,
        removeOnFail: 5,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    });

    this.logger.log('Email queue initialized');
  }

  async onModuleDestroy() {
    if (this.emailQueue) {
      await this.emailQueue.close();
      this.logger.log('Email queue closed');
    }
  }

  async addEmailJob(emailData: EmailJob, options?: QueueJobOptions): Promise<EmailJobResult> {
    try {
      const priority = options?.priority || this.getPriorityByJobType(emailData.jobType);
      
      const job = await this.emailQueue.add('send-email', emailData, {
        priority,
        delay: options?.delay,
        attempts: options?.attempts || 3,
        removeOnComplete: options?.removeOnComplete || 10,
        removeOnFail: options?.removeOnFail || 5,
      });

      this.logger.log(`Email job queued: ${job.id} for ${emailData.jobType}`);
      
      return {
        success: true,
        jobId: job.id,
      };
    } catch (error) {
      this.logger.error('Failed to queue email job:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  private getPriorityByJobType(jobType: EmailJob['jobType']): number {
    const priorities = {
      'verification': 1, // High priority
      'password-reset': 1, // High priority  
      'welcome': 2, // Medium priority
      'notification': 3, // Low priority
    };
    return priorities[jobType] || 3;
  }

  getEmailQueue(): Queue {
    return this.emailQueue;
  }
}
