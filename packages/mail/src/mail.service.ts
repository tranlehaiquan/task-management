import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import nodemailer from "nodemailer";
import { MAIL_CONFIG, MailConfig } from "./mail.inferface";

@Injectable()
export class MailService implements OnModuleInit {
  public transporter: nodemailer.Transporter;

  constructor(@Inject(MAIL_CONFIG) private readonly mailConfig: MailConfig) {
    console.log(this.mailConfig);
    this.transporter = nodemailer.createTransport({
      host: this.mailConfig.host || "smtp.ethereal.email",
      port: this.mailConfig.port || 587,
      auth: {
        user: this.mailConfig.user || "dustin.bechtelar21@ethereal.email",
        pass: this.mailConfig.pass || "aX8cue9qqNDsBNxyyv",
      },
    });
  }

  async onModuleInit() {
    try {
      await this.transporter.verify();
      console.log("Mail transporter verified successfully");
    } catch (error) {
      console.error("Mail transporter verification failed:", error);
      throw error;
    }
  }
}
