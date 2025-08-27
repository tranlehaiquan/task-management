import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { UsersService } from './users.service';
import type { NewUser, User } from '@task-mgmt/database';
import { CreateNewUserDto } from './dto/createNewUser.dto';
import type { FindUserCriteria } from './dto/findUser.dto';
import { MailService } from '@task-mgmt/mail';
import { EmailTemplates } from '../templates/email.templates';

// Type for user data without passwordHash
type SanitizedUser = Omit<User, 'passwordHash'>;

@Controller()
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
  ) {}

  getFrontEndUrl(): string {
    const frontendUrl = process.env.FRONTEND_URL;
    if (!frontendUrl) {
      throw new Error('FRONTEND_URL environment variable is not configured');
    }
    return frontendUrl.replace(/\/$/, '');
  }

  // Message patterns for microservice communication
  @MessagePattern('user.create')
  async createUserMessage(userData: CreateNewUserDto): Promise<SanitizedUser> {
    return this.usersService.createUser(userData);
  }

  @MessagePattern('user.findById')
  async findUserByIdMessage(id: string): Promise<SanitizedUser | null> {
    return this.usersService.getUserById(id);
  }

  @MessagePattern('user.findAll')
  async findAllUsersMessage() {
    return this.usersService.getAllUsers();
  }

  @MessagePattern('user.findUserByEmail')
  async findUserByEmailMessage(email: string): Promise<SanitizedUser | null> {
    return this.usersService.findUser({ email });
  }

  @MessagePattern('user.findUser')
  async findUserMessage(
    criteria: FindUserCriteria,
  ): Promise<SanitizedUser | null> {
    return this.usersService.findUser(criteria);
  }

  @MessagePattern('user.findUsers')
  async findUsersMessage(criteria: FindUserCriteria): Promise<SanitizedUser[]> {
    return this.usersService.findUsers(criteria);
  }

  @MessagePattern('user.update')
  async updateUserMessage(data: {
    id: string;
    updates: Partial<NewUser>;
  }): Promise<SanitizedUser | null> {
    return this.usersService.updateUser(data.id, data.updates);
  }

  @MessagePattern('user.delete')
  async deleteUserMessage(id: string): Promise<{ success: boolean }> {
    const success = await this.usersService.deleteUser(id);
    return { success };
  }

  @MessagePattern('user.validate')
  async validateUserMessage(
    id: string,
  ): Promise<{ exists: boolean; user?: SanitizedUser }> {
    const user = await this.usersService.getUserById(id);
    return {
      exists: !!user,
      user: user || undefined,
    };
  }

  @MessagePattern('user.findUserByEmailAndPassword')
  async findUserByEmailAndPasswordMessage(data: {
    email: string;
    password: string;
  }): Promise<SanitizedUser | null> {
    return this.usersService.findUserByEmailAndPassword(
      data.email,
      data.password,
    );
  }

  @MessagePattern('user.updateLastLoginAt')
  async updateLastLoginAtMessage(id: string): Promise<SanitizedUser | null> {
    return this.usersService.updateLastLoginAt(id);
  }

  @MessagePattern('user.sendVerifyEmailUser')
  async verifyEmailUserMessage({ userId }: { userId: string }): Promise<{
    success: boolean;
    error?: string;
  }> {
    const user = await this.usersService.getUserById(userId);
    if (!user) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    if (user.isEmailVerified) {
      return {
        success: false,
        error: 'Email already verified',
      };
    }

    if (!user.email) {
      return {
        success: false,
        error: 'User email not found',
      };
    }

    // Create email verification token using service
    const emailVerificationTokenRecord =
      await this.usersService.createVerificationToken(userId, user.email);

    try {
      // Use the email template
      const emailContent = EmailTemplates.verificationEmail(
        this.getFrontEndUrl(),
        emailVerificationTokenRecord.token,
        user.name,
      );

      await this.mailService.transporter.sendMail({
        to: user.email,
        subject: emailContent.subject,
        text: emailContent.text,
        html: emailContent.html,
      });

      return { success: true };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        error: `Failed to send verification email`,
      };
    }
  }

  @MessagePattern('user.validateEmailVerificationToken')
  async validateEmailVerificationTokenMessage({
    token,
  }: {
    token: string;
  }): Promise<{
    success: boolean;
    error?: string;
    userId?: string;
    shouldSendWelcomeEmail?: boolean;
  }> {
    const result = await this.usersService.validateEmailVerificationToken(token);
    
    // Automatically send welcome email if email verification was successful
    if (result.success && result.shouldSendWelcomeEmail && result.userId) {
      try {
        await this.sendWelcomeEmail({ userId: result.userId });
        console.log(`Welcome email sent to user: ${result.userId}`);
      } catch (error) {
        console.error(`Failed to send welcome email to user ${result.userId}:`, error);
        // Don't fail the verification process if welcome email fails
      }
    }
    
    return result;
  }

  @MessagePattern('user.forgotPassword')
  async forgotPassword({ email }: { email: string }) {
    const user = await this.usersService.findUser({ email });

    if (!user || !user.isActive) {
      return {
        success: false,
      };
    }

    const passwordResetTokenRecord =
      await this.usersService.createVerificationToken(
        user.id,
        user.email,
        'password_reset',
      );

    try {
      // Use the email template
      const emailContent = EmailTemplates.passwordResetEmail(
        this.getFrontEndUrl(),
        passwordResetTokenRecord.token,
        user.name,
      );

      await this.mailService.transporter.sendMail({
        to: user.email,
        subject: emailContent.subject,
        text: emailContent.text,
        html: emailContent.html,
      });
    } catch (error) {
      console.log(error);
      return {
        success: false,
        error: `Failed to send password reset email`,
      };
    }

    return {
      success: true,
    };
  }

  @MessagePattern('user.validateForgotPasswordToken')
  async validateForgotPasswordToken(payload: { token: string }) {
    const { token } = payload;
    return this.usersService.validateForgotPasswordToken(token);
  }

  @MessagePattern('user.reset-password')
  async resetPassword(params: { token: string; newPassword: string }) {
    return this.usersService.resetPassword(params);
  }

  @MessagePattern('user.update-password')
  async updatePassword(params: {
    userId: string;
    currentPassword: string;
    newPassword: string;
  }) {
    return this.usersService.updatePassword(params);
  }

  @MessagePattern('user.delete-account')
  async deleteAccount(params: { userId: string }) {
    return this.usersService.deleteAccount(params);
  }

  @MessagePattern('user.sendWelcomeEmail')
  async sendWelcomeEmail({ userId }: { userId: string }): Promise<{
    success: boolean;
    error?: string;
  }> {
    const user = await this.usersService.getUserById(userId);
    if (!user) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    if (!user.isEmailVerified) {
      return {
        success: false,
        error: 'User email not verified',
      };
    }

    try {
      // Use the welcome email template
      const emailContent = EmailTemplates.welcomeEmail(
        this.getFrontEndUrl(),
        user.name,
      );

      await this.mailService.transporter.sendMail({
        to: user.email,
        subject: emailContent.subject,
        text: emailContent.text,
        html: emailContent.html,
      });

      return { success: true };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        error: `Failed to send welcome email`,
      };
    }
  }
}
