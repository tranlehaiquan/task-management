export interface EmailTemplate {
  subject: string;
  text: string;
  html: string;
}

export class EmailTemplates {
  /**
   * Email verification template
   * @param frontendUrl - The frontend base URL
   * @param token - The verification token
   * @param userName - The user's name for personalization
   */
  static verificationEmail(
    frontendUrl: string,
    token: string,
    userName?: string,
  ): EmailTemplate {
    const verificationUrl = `${frontendUrl}/verify-email/${token}`;
    const greeting = userName ? `Hi ${userName},` : 'Hello,';

    return {
      subject: 'Verify your email address',
      text: `${greeting}

Thank you for signing up! Please verify your email address by clicking the link below:

${verificationUrl}

If you can't click the link, copy and paste it into your browser.

This verification link will expire in 24 hours for security reasons.

If you didn't create an account, please ignore this email.

Best regards,
The Task Management Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0; font-size: 28px;">Task Management</h1>
          </div>
          
          <div style="background-color: #f8fafc; padding: 30px; border-radius: 8px; border: 1px solid #e2e8f0;">
            <h2 style="color: #1e293b; margin-top: 0; font-size: 24px;">Verify Your Email Address</h2>
            
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              ${greeting}
            </p>
            
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
              Thank you for signing up! Please verify your email address to complete your account setup.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
                Verify Email Address
              </a>
            </div>
            
            <p style="font-size: 14px; color: #64748b; margin-bottom: 20px;">
              If the button doesn't work, copy and paste this link into your browser:
            </p>
            <p style="word-break: break-all; font-size: 14px; color: #64748b; background-color: #f1f5f9; padding: 10px; border-radius: 4px;">
              ${verificationUrl}
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
              <p style="font-size: 14px; color: #64748b; margin-bottom: 10px;">
                ⏰ This verification link will expire in <strong>24 hours</strong> for security reasons.
              </p>
              <p style="font-size: 14px; color: #64748b; margin: 0;">
                If you didn't create an account, please ignore this email.
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; font-size: 14px; color: #64748b;">
            <p>Best regards,<br>The Task Management Team</p>
          </div>
        </div>
      `,
    };
  }

  /**
   * Password reset template
   * @param frontendUrl - The frontend base URL
   * @param token - The password reset token
   * @param userName - The user's name for personalization
   */
  static passwordResetEmail(
    frontendUrl: string,
    token: string,
    userName?: string,
  ): EmailTemplate {
    const resetUrl = `${frontendUrl}/reset-password/${token}`;
    const greeting = userName ? `Hi ${userName},` : 'Hello,';

    return {
      subject: 'Reset your password',
      text: `${greeting}

We received a request to reset your password for your Task Management account.

Click the link below to reset your password:

${resetUrl}

If you can't click the link, copy and paste it into your browser.

This password reset link will expire in 1 hour for security reasons.

If you didn't request a password reset, please ignore this email. Your password will remain unchanged.

Best regards,
The Task Management Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0; font-size: 28px;">Task Management</h1>
          </div>
          
          <div style="background-color: #fef2f2; padding: 30px; border-radius: 8px; border: 1px solid #fecaca;">
            <h2 style="color: #dc2626; margin-top: 0; font-size: 24px;">🔐 Password Reset Request</h2>
            
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              ${greeting}
            </p>
            
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
              We received a request to reset your password for your Task Management account.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #dc2626; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
                Reset Password
              </a>
            </div>
            
            <p style="font-size: 14px; color: #7f1d1d; margin-bottom: 20px;">
              If the button doesn't work, copy and paste this link into your browser:
            </p>
            <p style="word-break: break-all; font-size: 14px; color: #7f1d1d; background-color: #fee2e2; padding: 10px; border-radius: 4px;">
              ${resetUrl}
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #fecaca;">
              <p style="font-size: 14px; color: #7f1d1d; margin-bottom: 10px;">
                ⏰ This password reset link will expire in <strong>1 hour</strong> for security reasons.
              </p>
              <p style="font-size: 14px; color: #7f1d1d; margin: 0;">
                If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; font-size: 14px; color: #64748b;">
            <p>Best regards,<br>The Task Management Team</p>
          </div>
        </div>
      `,
    };
  }

  /**
   * Welcome email template (optional - for after email verification)
   * @param frontendUrl - The frontend base URL
   * @param userName - The user's name
   */
  static welcomeEmail(frontendUrl: string, userName: string): EmailTemplate {
    return {
      subject: 'Welcome to Task Management! 🎉',
      text: `Hi ${userName},

Welcome to Task Management! 🎉

Your email has been successfully verified and your account is now active.

You can now start using all the features:
- Create and manage projects
- Track tasks and deadlines
- Monitor time spent on activities
- Collaborate with team members

Get started: ${frontendUrl}/dashboard

If you have any questions, feel free to reach out to our support team.

Best regards,
The Task Management Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0; font-size: 28px;">Task Management</h1>
          </div>
          
          <div style="background-color: #f0fdf4; padding: 30px; border-radius: 8px; border: 1px solid #bbf7d0;">
            <h2 style="color: #15803d; margin-top: 0; font-size: 24px;">🎉 Welcome to Task Management!</h2>
            
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Hi ${userName},
            </p>
            
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
              Welcome to Task Management! Your email has been successfully verified and your account is now active.
            </p>
            
            <div style="background-color: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <h3 style="color: #1e293b; margin-top: 0;">✨ You can now:</h3>
              <ul style="color: #475569; line-height: 1.8; margin: 10px 0; padding-left: 20px;">
                <li>Create and manage projects</li>
                <li>Track tasks and deadlines</li>
                <li>Monitor time spent on activities</li>
                <li>Collaborate with team members</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${frontendUrl}/dashboard" 
                 style="background-color: #15803d; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
                Get Started
              </a>
            </div>
            
            <p style="font-size: 14px; color: #16a34a; margin: 0;">
              If you have any questions, feel free to reach out to our support team.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; font-size: 14px; color: #64748b;">
            <p>Best regards,<br>The Task Management Team</p>
          </div>
        </div>
      `,
    };
  }
}
