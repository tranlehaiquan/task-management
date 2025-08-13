import { Injectable, OnModuleInit } from "@nestjs/common";
import { MailConfig } from "./mail.inferface";
import nodemailer from "nodemailer";

@Injectable()
export class MailService implements OnModuleInit {
  private transporter: nodemailer.Transporter;

  constructor(private readonly mailConfig: MailConfig) {
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
    this.transporter.verify((error, success) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Server is ready to take our messages");
      }
    });
  }
}
