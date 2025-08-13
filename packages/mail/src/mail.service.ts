import { Injectable, OnModuleInit } from "@nestjs/common";
import {} from "./mail.inferface";

@Injectable()
export class MailService implements OnModuleInit {
  async onModuleInit() {
    console.log("MailService initialized");
  }
}
