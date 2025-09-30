import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import type { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { MailService } from '@task-mgmt/mail';
import type { EmailJob } from '@task-mgmt/queue';
import { EmailTemplates } from './templates/email.templates';

@Processor('email')
export class EmailConsumer extends WorkerHost {
  private readonly logger = new Logger(EmailConsumer.name);
  constructor(private readonly mailService: MailService) {
    super();
  }

  private renderTemplateOrThrow(
    template: NonNullable<EmailJob['template']>,
    data: NonNullable<EmailJob['templateData']>,
  ): { subject: string; text: string; html: string } {
    return EmailTemplates.renderTemplate(template, data);
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const emailData = job.data as EmailJob;

    try {
      this.logger.log(
        `Processing email job ${job.id}: ${emailData.jobType} to ${emailData.to}`,
      );

      let emailContent: { subject: string; text: string; html: string };

      // Handle template-based emails
      if (emailData.template && emailData.templateData) {
        emailContent = this.renderTemplateOrThrow(
          emailData.template,
          emailData.templateData,
        );
      } else {
        // Handle direct content emails (backward compatibility)
        if (!emailData.subject || !emailData.text || !emailData.html) {
          throw new Error(
            'Missing required email content: subject, text, html',
          );
        }
        emailContent = {
          subject: emailData.subject,
          text: emailData.text,
          html: emailData.html,
        };
      }

      await this.mailService.transporter.sendMail({
        to: emailData.to,
        subject: emailContent.subject,
        text: emailContent.text,
        html: emailContent.html,
      });

      this.logger.log(
        `Email sent successfully: ${emailData.jobType} to ${emailData.to}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send email: ${emailData.jobType} to ${emailData.to}`,
        error,
      );
      throw error;
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job): void {
    this.logger.log(`Job ${job.id} completed successfully`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: Error): void {
    this.logger.error(`Job ${job?.id} failed`, err?.stack);
  }

  @OnWorkerEvent('error')
  onError(err: Error): void {
    this.logger.error('Worker error', err?.stack);
  }
}
