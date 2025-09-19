import { Module, Global, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { PORTS } from '@task-mgmt/shared-config';
import { AuthModule } from './auth/auth.module';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { ProjectsModule } from './projects/projects.module';
import { TasksModule } from './tasks/tasks.module';

@Global()
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'USER_SERVICE',
        transport: Transport.TCP,
        options: {
          host: '127.0.0.1',
          port: Number(process.env.USER_SERVICE_PORT ?? PORTS.USER_SERVICE),
        },
      },
    ]),
    ClientsModule.register([
      {
        name: 'TOKEN_SERVICE',
        transport: Transport.TCP,
        options: {
          host: '127.0.0.1',
          port: Number(process.env.TOKEN_SERVICE_PORT ?? PORTS.TOKEN_SERVICE),
        },
      },
    ]),
    ClientsModule.register([
      {
        name: 'PROJECT_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.PROJECT_SERVICE_HOST ?? '127.0.0.1',
          port: Number(
            process.env.PROJECT_SERVICE_PORT ?? PORTS.PROJECT_SERVICE,
          ),
        },
      },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    UsersModule,
    AuthModule,
    ProjectsModule,
    TasksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [ClientsModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
