import { DynamicModule, Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MAIL_CONFIG, MailConfig } from './mail.inferface';

@Module({
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {
  static forRoot(config: MailConfig): DynamicModule {
    if (!config) {
      throw new Error(
        'Mail configuration is required and cannot be null or undefined',
      );
    }

    return {
      module: MailModule,
      providers: [{ provide: MAIL_CONFIG, useValue: config }],
      exports: [MailService],
    };
  }
}
