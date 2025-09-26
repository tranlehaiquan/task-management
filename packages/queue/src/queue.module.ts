import { DynamicModule, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QueueService } from './queue.service';
import { QueueMonitorService } from './monitor/queue-monitor.service';

interface QueueModuleOptions {
  redis?: {
    host?: string;
    port?: number;
  };
}

// export const QUEUE_CONFIG = Symbol('QUEUE_CONFIG');

@Module({})
export class QueueModule {
  static forRoot(options?: QueueModuleOptions): DynamicModule {
    return {
      module: QueueModule,
      imports: [
        BullModule.forRoot({
          connection: {
            host: options?.redis?.host || process.env.REDIS_HOST || 'localhost',
            port: options?.redis?.port || parseInt(process.env.REDIS_PORT || '6379'),
          },
        }),
        BullModule.registerQueue({
          name: 'email',
        }),
        BullModule.registerQueue({
          name: 'stressTest',
        }),
      ],
      providers: [
        QueueService, 
        QueueMonitorService
      ],
      exports: [QueueService, QueueMonitorService],
      global: true,
    };
  }
}
