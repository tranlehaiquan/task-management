import { Module } from '@nestjs/common';
import { EmailWorkerService } from './email-worker.service';
import { MailModule } from '@task-mgmt/mail';

@Module({
  imports: [
    MailModule.forRoot({
      host: process.env.MAIL_HOST || 'smtp.ethereal.email',
      port: parseInt(process.env.MAIL_PORT || '587'),
      user: process.env.MAIL_USER || 'dustin.bechtelar21@ethereal.email',
      pass: process.env.MAIL_PASS || 'aX8cue9qqNDsBNxyyv',
    }),
  ],
  providers: [EmailWorkerService],
})
export class AppModule {}
