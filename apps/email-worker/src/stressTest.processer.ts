import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { QueueService } from '@task-mgmt/queue';
import { Job } from 'bullmq';

@Processor('stressTest')
export class StressTestConsumer extends WorkerHost {
  private readonly logger = new Logger(StressTestConsumer.name);

  constructor(private readonly queueService: QueueService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing stress test job ${job.id}`);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job): void {
    this.logger.log(`Job ${job.id} completed successfully`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: Error): void {
    this.logger.error(`Job ${job?.id} failed`, err?.stack);
  }
}
