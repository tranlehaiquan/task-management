import { Module } from '@nestjs/common';
import { DatabaseModule } from '@task-mgmt/database';
import { UsersController } from './users.controller';
import { ConfigModule } from '@nestjs/config';
import { UsersService } from './users.service';
import { MailModule } from '@task-mgmt/mail';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MailModule.forRoot({
      host: process.env.MAIL_HOST || 'smtp.ethereal.email',
      port: Number(process.env.MAIL_PORT || 587),
      user: process.env.MAIL_USER || 'dustin.bechtelar21@ethereal.email',
      pass: process.env.MAIL_PASS || 'aX8cue9qqNDsBNxyyv',
    }),
    DatabaseModule.register({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432', 10),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl:
        process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
