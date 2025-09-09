import { DynamicModule, Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { QueueMonitorService } from './monitor/queue-monitor.service';

interface QueueModuleOptions {
  redis?: {
    host?: string;
    port?: number;
  };
}

export const QUEUE_CONFIG = Symbol('QUEUE_CONFIG');

@Module({})
export class QueueModule {
  static forRoot(options?: QueueModuleOptions): DynamicModule {
    return {
      module: QueueModule,
      providers: [
        {
          provide: QUEUE_CONFIG,
          useValue: options || {},
        },
        QueueService, 
        QueueMonitorService
      ],
      exports: [QueueService, QueueMonitorService],
      global: true,
    };
  }
}
