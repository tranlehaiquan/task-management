import { DynamicModule, Module } from "@nestjs/common";
import { MailService } from "./mail.service";
import { MAIL_CONFIG, MailConfig } from "./mail.inferface";

const defaultConfig = {
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: "dustin.bechtelar21@ethereal.email",
    pass: "aX8cue9qqNDsBNxyyv",
  },
};

@Module({
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {
  static forRoot(config: MailConfig): DynamicModule {
    return {
      module: MailModule,
      providers: [
        { provide: MAIL_CONFIG, useValue: config || defaultConfig },
        MailService,
      ],
      exports: [MailService],
    };
  }
}
