import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Worker } from 'bullmq';
import { MailService } from '@task-mgmt/mail';
import type { EmailJob } from '@task-mgmt/queue';

@Injectable()
export class EmailWorkerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EmailWorkerService.name);
  private worker: Worker;

  constructor(private readonly mailService: MailService) {}

  onModuleInit() {
    this.worker = new Worker(
      'email',
      async (job) => {
        const emailData: EmailJob = job.data;
        
        try {
          this.logger.log(`Processing email job ${job.id}: ${emailData.jobType} to ${emailData.to}`);

          await this.mailService.transporter.sendMail({
            to: emailData.to,
            subject: emailData.subject,
            text: emailData.text,
            html: emailData.html,
          });

          this.logger.log(`Email sent successfully: ${emailData.jobType} to ${emailData.to}`);
          return { success: true };
        } catch (error) {
          this.logger.error(`Failed to send email: ${emailData.jobType} to ${emailData.to}`, error);
          throw error;
        }
      },
      {
        connection: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
        },
        concurrency: 5, // Process 5 jobs concurrently
      }
    );

    this.worker.on('completed', (job) => {
      this.logger.log(`Job ${job.id} completed successfully`);
    });

    this.worker.on('failed', (job, err) => {
      this.logger.error(`Job ${job?.id} failed:`, err);
    });

    this.worker.on('error', (err) => {
      this.logger.error('Worker error:', err);
    });

    this.logger.log('Email worker started and ready to process jobs');
  }

  async onModuleDestroy() {
    if (this.worker) {
      this.logger.log('Shutting down email worker...');
      await this.worker.close();
      this.logger.log('Email worker stopped');
    }
  }
}
