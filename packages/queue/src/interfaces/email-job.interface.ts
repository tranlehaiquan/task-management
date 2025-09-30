export interface EmailJob {
  to: string;
  subject?: string;
  text?: string;
  html?: string;
  template?:
    | 'verification'
    | 'password-reset'
    | 'welcome'
    | 'welcome-invite'
    | 'project-invite';
  templateData?: {
    frontendUrl?: string;
    token?: string;
    userName?: string;
    password?: string;

    projectName?: string;
    projectRole?: string;
  };
  priority?: number;
  delay?: number;
  attempts?: number;
  userId?: string;
  jobType:
    | 'verification'
    | 'welcome'
    | 'password-reset'
    | 'notification'
    | 'welcome-invite'
    | 'project-invite';
}

export interface QueueJobOptions {
  priority?: number;
  delay?: number;
  attempts?: number;
  removeOnComplete?: boolean | number;
  removeOnFail?: boolean | number;
}

export interface EmailJobResult {
  success: boolean;
  jobId?: string;
  error?: string;
}
