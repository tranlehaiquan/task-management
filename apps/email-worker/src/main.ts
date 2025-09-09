import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Email worker doesn't need HTTP server, just runs the worker
  app.enableShutdownHooks(['SIGINT', 'SIGTERM', 'SIGQUIT']);
  await app.init();
  new Logger('EmailWorker').log('Email worker is running...');
}

bootstrap().catch((err) => {
  // Use console as fallback in case Logger isn’t ready
  console.error('Email worker failed to start:', err);
  process.exit(1);
});
