import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable shutdown hooks to ensure OnModuleDestroy lifecycle hooks run
  app.enableShutdownHooks(['SIGINT', 'SIGTERM', 'SIGQUIT']);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
