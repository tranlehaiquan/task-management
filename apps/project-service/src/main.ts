import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PORTS } from '@task-mgmt/shared-config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable shutdown hooks to ensure OnModuleDestroy lifecycle hooks run
  app.enableShutdownHooks(['SIGINT', 'SIGTERM', 'SIGQUIT']);
  await app.listen(PORTS.PROJECT_SERVICE);
}
void bootstrap();
