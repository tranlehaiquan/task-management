import { Module } from '@nestjs/common';
import { MailModule } from '@task-mgmt/mail';
import { BullModule } from '@nestjs/bullmq';
import { EmailConsumer } from './email.processer';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),
    MailModule.forRoot({
      host: process.env.MAIL_HOST || 'smtp.ethereal.email',
      port: parseInt(process.env.MAIL_PORT || '587'),
      user: process.env.MAIL_USER || 'dustin.bechtelar21@ethereal.email',
      pass: process.env.MAIL_PASS || 'aX8cue9qqNDsBNxyyv',
    }),
    BullModule.registerQueue({
      name: 'email',
    }),
  ],
  providers: [EmailConsumer],
})
export class AppModule {}
