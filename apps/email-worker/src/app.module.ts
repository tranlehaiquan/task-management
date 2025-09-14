import { Module } from '@nestjs/common';
import { MailModule } from '@task-mgmt/mail';
import { BullModule } from '@nestjs/bullmq';
import { EmailConsumer } from './email.processer';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),
    MailModule.forRoot({
      host: process.env.MAIL_HOST ?? 'mailpit',
      port: parseInt(process.env.MAIL_PORT ?? '1025', 10),
      user: process.env.MAIL_USER ?? '',
      pass: process.env.MAIL_PASS ?? '',
    }),
    BullModule.registerQueue({
      name: 'email',
    }),
  ],
  providers: [EmailConsumer],
})
export class AppModule {}
