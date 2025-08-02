import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { UsersController } from './users.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'USER_SERVICE',
        transport: Transport.TCP,
        options: {
          host: '0.0.0.0',
          port: Number(process.env.USER_SERVICE_PORT ?? 3001),
        },
      },
    ]),
  ],
  controllers: [UsersController],
})
export class UsersModule {}
