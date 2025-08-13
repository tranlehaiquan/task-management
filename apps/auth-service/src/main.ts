import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { PORTS } from '@task-mgmt/shared-config';

async function bootstrap() {
  const logger = new Logger('AuthService');
  const port = process.env.PORT ?? PORTS.AUTH_SERVICE;
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',
        port: Number(port),
      },
    },
  );

  // Enable shutdown hooks to ensure OnModuleDestroy lifecycle hooks run
  app.enableShutdownHooks(['SIGINT', 'SIGTERM', 'SIGQUIT']);

  logger.log(`Running on port ${port}`);
  await app.listen();
}
void bootstrap();
