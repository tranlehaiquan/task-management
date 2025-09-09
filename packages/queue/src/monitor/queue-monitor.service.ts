import { Injectable, Logger } from '@nestjs/common';
import type { Queue } from 'bullmq';

@Injectable()
export class QueueMonitorService {
  private readonly logger = new Logger(QueueMonitorService.name);

  async getQueueStats(queue: Queue) {
    const counts = await queue.getJobCounts();
    return {
      waiting: counts.waiting ?? 0,
      active: counts.active ?? 0,
      completed: counts.completed ?? 0,
      failed: counts.failed ?? 0,
    };
  }

  async logQueueStats(
    queue: Queue,
    queueName: string,
  ): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
  }> {
    const stats = await this.getQueueStats(queue);
    this.logger.log(`${queueName} Queue Stats: ${JSON.stringify(stats)}`);
    return stats;
  }
}
