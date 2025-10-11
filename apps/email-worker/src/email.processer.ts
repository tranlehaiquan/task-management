import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import type { Job } from 'bullmq';
import { Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailService } from '@task-mgmt/mail';
import type { EmailJob } from '@task-mgmt/queue';
import { EmailTemplates } from './templates/email.templates';

interface EmailContent {
  subject: string;
  text: string;
  html: string;
}

@Processor('email')
export class EmailConsumer extends WorkerHost {
  private readonly logger = new Logger(EmailConsumer.name);
  private readonly frontendUrl: string;

  constructor(
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {
    super();
    this.frontendUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:4000',
    );
    this.logger.log(
      `Email worker initialized with FRONTEND_URL: ${this.frontendUrl}`,
    );
  }

  /**
   * Validates and extracts email data from the job
   */
  private validateEmailJob(job: Job): EmailJob {
    const emailData = job.data as EmailJob;

    if (!emailData?.to) {
      throw new BadRequestException('Missing required field: to');
    }

    if (!emailData?.jobType) {
      throw new BadRequestException('Missing required field: jobType');
    }

    return emailData;
  }

  /**
   * Resolves email content from either template or direct content
   */
  private resolveEmailContent(emailData: EmailJob): EmailContent {
    // Template-based email (preferred approach)
    if (emailData.template && emailData.templateData) {
      try {
        // Inject frontendUrl from environment into template data
        const templateDataWithUrl = {
          ...emailData.templateData,
          frontendUrl: this.frontendUrl,
        };

        return EmailTemplates.renderTemplate(
          emailData.template,
          templateDataWithUrl,
        );
      } catch (error) {
        this.logger.error(
          `Failed to render template '${emailData.template}'`,
          error,
        );
        throw error;
      }
    }

    // Direct content email (backward compatibility)
    if (emailData.subject && emailData.text && emailData.html) {
      return {
        subject: emailData.subject,
        text: emailData.text,
        html: emailData.html,
      };
    }

    throw new BadRequestException(
      'Email must include either (template + templateData) or (subject + text + html)',
    );
  }

  /**
   * Sends the email using the mail service
   */
  private async sendEmail(to: string, content: EmailContent): Promise<void> {
    await this.mailService.transporter.sendMail({
      to,
      subject: content.subject,
      text: content.text,
      html: content.html,
    });
  }

  async process(job: Job<EmailJob>): Promise<void> {
    const startTime = Date.now();

    try {
      // Validate job data
      const emailData = this.validateEmailJob(job);

      this.logger.log(
        `Processing email job ${job.id}: ${emailData.jobType} to ${emailData.to}`,
      );

      // Resolve email content
      const emailContent = this.resolveEmailContent(emailData);

      // Send email
      await this.sendEmail(emailData.to, emailContent);

      const duration = Date.now() - startTime;
      this.logger.log(
        `Email sent successfully: ${emailData.jobType} to ${emailData.to} (${duration}ms)`,
      );
    } catch (error) {
      const emailData = job.data;
      const duration = Date.now() - startTime;

      this.logger.error(
        `Failed to send email (job: ${job.id}, type: ${emailData?.jobType}, to: ${emailData?.to}, duration: ${duration}ms)`,
        error instanceof Error ? error.stack : error,
      );

      // Re-throw to let BullMQ handle retries
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
