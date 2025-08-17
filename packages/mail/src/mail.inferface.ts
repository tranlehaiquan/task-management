export const MAIL_CONFIG = Symbol('MAIL_CONFIG');

export type MailConfig = {
  host: string;
  port: number;
  user: string;
  pass: string;
};
