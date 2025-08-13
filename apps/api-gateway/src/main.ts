import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('ApiGateway');
  const port = process.env.API_GATEWAY_PORT ?? 3000;

  const app = await NestFactory.create(AppModule);

  // Enable shutdown hooks to ensure OnModuleDestroy lifecycle hooks run
  app.enableShutdownHooks();

  // Enable CORS if needed
  app.enableCors();

  // Enable validation globally
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Task Management System API')
    .setDescription('API Gateway for Task Management microservices')
    .setVersion('1.0')
    .addTag('users', 'User management operations')
    .addTag('projects', 'Project management operations')
    .addTag('tasks', 'Task management operations')
    .addTag('time-tracking', 'Time tracking operations')
    .addTag('notifications', 'Notification operations')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // This name here is important for matching up with @ApiBearerAuth() in your controller!
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(port);
  logger.log(`API Gateway running on port ${port}`);
  logger.log(
    `API Documentation available at http://localhost:${port}/api/docs`,
  );
}
void bootstrap();
