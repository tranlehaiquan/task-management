import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Email worker doesn't need HTTP server, just runs the worker
  await app.init();
  console.log('Email worker is running...');
  
  // Keep the process alive
  process.on('SIGINT', async () => {
    console.log('Shutting down email worker...');
    await app.close();
    process.exit(0);
  });
}

bootstrap();
