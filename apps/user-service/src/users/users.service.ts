import { Injectable } from '@nestjs/common';
import {
  DatabaseService,
  users,
  emailVerificationTokens,
  // projects,
  // tasks,
  // timeEntries,
  // notifications,
  type NewUser,
  type User,
  EmailVerificationToken,
} from '@task-mgmt/database';
import { eq, and, ilike, type SQL } from 'drizzle-orm';
import { PasswordUtils } from '../utils/password.utils';
import { sanitizeUserData, sanitizeUsersData } from '../utils/user.utils';
import { randomString } from '../utils/crypto.utils';
import { CreateNewUserDto } from './dto/createNewUser.dto';
import { FindUserCriteria } from './dto/findUser.dto';

@Injectable()
export class UsersService {
  constructor(private readonly databaseService: DatabaseService) {}

  async createUser(
    userData: CreateNewUserDto,
  ): Promise<Omit<User, 'passwordHash'>> {
    const passwordHash = await PasswordUtils.hashPassword(userData.password);

    const [user] = await this.databaseService.db
      .insert(users)
      .values({ ...userData, passwordHash })
      .returning();
    return sanitizeUserData(user);
  }

  async getUserById(id: string): Promise<Omit<User, 'passwordHash'> | null> {
    // Instead of selecting all fields then sanitizing, select only needed fields
    const [user] = await this.databaseService.db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        avatarUrl: users.avatarUrl,
        isActive: users.isActive,
        isEmailVerified: users.isEmailVerified,
        lastLoginAt: users.lastLoginAt,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    
    return user || null;
  }

  async getUserByEmail(
    email: string,
  ): Promise<Omit<User, 'passwordHash'> | null> {
    const user = await this.findUserInternal({ email });
    return user ? sanitizeUserData(user) : null;
  }

  /**
   * Find a single user based on flexible criteria (internal method with full data)
   * @param criteria - The search criteria
   * @returns The first user that matches the criteria or null
   */
  private async findUserInternal(
    criteria: FindUserCriteria,
  ): Promise<User | null> {
    const whereConditions = this.buildWhereConditions(criteria);

    if (whereConditions.length === 0) {
      return null; // No criteria provided
    }

    const [user] = await this.databaseService.db
      .select()
      .from(users)
      .where(
        whereConditions.length === 1
          ? whereConditions[0]
          : and(...whereConditions),
      );

    return user || null;
  }

  /**
   * Find a single user based on flexible criteria (public method with sanitized data)
   * @param criteria - The search criteria
   * @returns The first user that matches the criteria or null
   */
  async findUser(
    criteria: FindUserCriteria,
  ): Promise<Omit<User, 'passwordHash'> | null> {
    const user = await this.findUserInternal(criteria);
    return user ? sanitizeUserData(user) : null;
  }

  /**
   * Find multiple users based on flexible criteria
   * @param criteria - The search criteria
   * @returns Array of users that match the criteria
   */
  async findUsers(
    criteria: FindUserCriteria,
  ): Promise<Omit<User, 'passwordHash'>[]> {
    const whereConditions = this.buildWhereConditions(criteria);

    if (whereConditions.length === 0) {
      return []; // No criteria provided
    }

    const userResults = await this.databaseService.db
      .select()
      .from(users)
      .where(
        whereConditions.length === 1
          ? whereConditions[0]
          : and(...whereConditions),
      );

    return sanitizeUsersData(userResults);
  }

  /**
   * Build where conditions for user queries based on criteria
   * @param criteria - The search criteria
   * @returns Array of drizzle where conditions
   */
  private buildWhereConditions(criteria: FindUserCriteria): SQL<unknown>[] {
    const conditions: SQL<unknown>[] = [];

    if (criteria.id) {
      conditions.push(eq(users.id, criteria.id));
    }

    if (criteria.email) {
      conditions.push(eq(users.email, criteria.email));
    }

    if (criteria.name) {
      // Use ilike for case-insensitive partial matching
      conditions.push(ilike(users.name, `%${criteria.name}%`));
    }

    if (criteria.isActive !== undefined) {
      conditions.push(eq(users.isActive, criteria.isActive));
    }

    if (criteria.isEmailVerified !== undefined) {
      conditions.push(eq(users.isEmailVerified, criteria.isEmailVerified));
    }

    return conditions;
  }

  async getAllUsers() {
    return await this.databaseService.db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        avatarUrl: users.avatarUrl,
        isActive: users.isActive,
        isEmailVerified: users.isEmailVerified,
        lastLoginAt: users.lastLoginAt,
      })
      .from(users);
  }

  async updateUser(
    id: string,
    updates: Partial<NewUser>,
  ): Promise<Omit<User, 'passwordHash'> | null> {
    const [user] = await this.databaseService.db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user ? sanitizeUserData(user) : null;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await this.databaseService.db
      .delete(users)
      .where(eq(users.id, id))
      .returning();
    return result.length > 0;
  }

  async findUserByEmailAndPassword(
    email: string,
    password: string,
  ): Promise<Omit<User, 'passwordHash'> | null> {
    const user = await this.findUserInternal({ email });
    if (!user) {
      return null;
    }

    const isPasswordValid = await PasswordUtils.comparePassword(
      password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      return null;
    }

    return sanitizeUserData(user);
  }

  async updateLastLoginAt(
    id: string,
  ): Promise<Omit<User, 'passwordHash'> | null> {
    const [user] = await this.databaseService.db
      .update(users)
      .set({ lastLoginAt: new Date(), updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user ? sanitizeUserData(user) : null;
  }

  /**
   * Create or update an email verification token for a user
   * @param userId - The user ID
   * @param email - The user's email
   * @param type - The type of token ('email_verification' or 'password_reset')
   * @returns The email verification token record
   */
  async createVerificationToken(
    userId: string,
    email: string,
    type: 'email_verification' | 'password_reset' = 'email_verification',
  ) {
    const token = randomString(32);
    const expiresAt =
      type === 'password_reset'
        ? new Date(Date.now() + 1000 * 60 * 60) // 1 hour
        : new Date(Date.now() + 1000 * 60 * 60 * 24 * 5); // 5 days

    // Check if there is an existing email verification token for this user
    const [existingEmailVerificationToken] = await this.databaseService.db
      .select()
      .from(emailVerificationTokens)
      .where(
        and(
          eq(emailVerificationTokens.userId, userId),
          eq(emailVerificationTokens.type, type),
        ),
      )
      .limit(1);

    let emailVerificationTokenRecord: EmailVerificationToken;
    await this.databaseService.db.transaction(async (tx) => {
      if (existingEmailVerificationToken) {
        await tx
          .delete(emailVerificationTokens)
          .where(
            eq(emailVerificationTokens.id, existingEmailVerificationToken.id),
          );
      }
      [emailVerificationTokenRecord] = await tx
        .insert(emailVerificationTokens)
        .values({
          userId,
          email,
          token,
          expiresAt,
          type,
        })
        .returning();
    });
    return emailVerificationTokenRecord!;
  }

  /**
   * Validate an email verification token and mark user as verified if valid
   * @param token - The verification token
   * @returns Object with validation result and user ID if valid
   */
  async validateEmailVerificationToken(
    token: string,
  ): Promise<{ 
    success: boolean; 
    error?: string; 
    userId?: string;
    shouldSendWelcomeEmail?: boolean;
  }> {
    // Find the token in the database
    const [emailVerificationToken] = await this.databaseService.db
      .select()
      .from(emailVerificationTokens)
      .where(eq(emailVerificationTokens.token, token))
      .limit(1);

    if (!emailVerificationToken) {
      return { success: false, error: 'Token not found' };
    }

    // Check if token has expired
    const now = new Date();
    if (emailVerificationToken.expiresAt < now) {
      return { success: false, error: 'Token has expired' };
    }

    const user = await this.getUserById(emailVerificationToken.userId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    if (user.isEmailVerified) {
      // Email already verified, clean up token
      await this.databaseService.db
        .delete(emailVerificationTokens)
        .where(eq(emailVerificationTokens.token, token));
      return { success: false, error: 'Email already verified' };
    }

    // Token is valid, mark user as verified
    await this.updateUser(emailVerificationToken.userId, {
      isEmailVerified: true,
    });

    // Clean up the verification token
    await this.databaseService.db
      .delete(emailVerificationTokens)
      .where(eq(emailVerificationTokens.token, token));

    return { 
      success: true, 
      userId: emailVerificationToken.userId,
      shouldSendWelcomeEmail: true,
    };
  }

  /**
   *  Validate a forgot password token
   * @param token - The forgot password token
   * @returns
   */
  async validateForgotPasswordToken(token: string): Promise<
    | {
        success: false;
        error?: string;
      }
    | {
        success: true;
        user: Omit<User, 'passwordHash'>;
      }
  > {
    const [forgotPasswordToken] = await this.databaseService.db
      .select()
      .from(emailVerificationTokens)
      .where(
        and(
          eq(emailVerificationTokens.token, token),
          eq(emailVerificationTokens.type, 'password_reset'),
        ),
      )
      .limit(1);

    if (!forgotPasswordToken) {
      return { success: false, error: 'Token not found' };
    }

    // Check if token has expired
    const now = new Date();
    if (forgotPasswordToken.expiresAt < now) {
      return { success: false, error: 'Token has expired' };
    }

    const user = await this.getUserById(forgotPasswordToken.userId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    return {
      success: true,
      user,
    };
  }

  async resetPassword({
    token,
    newPassword,
  }: {
    token: string;
    newPassword: string;
  }): Promise<{ success: boolean; error?: string }> {
    const validToken = await this.validateForgotPasswordToken(token);

    if (!validToken.success) {
      return {
        success: false,
        error: validToken.error,
      };
    }

    const user = validToken.user;
    const passwordHash = await PasswordUtils.hashPassword(newPassword);

    // Wrap both operations in a transaction
    try {
      await this.databaseService.db.transaction(async (tx) => {
        // Update user password
        await tx
          .update(users)
          .set({ passwordHash, updatedAt: new Date() })
          .where(eq(users.id, user.id));

        // Delete password reset tokens for this user (only password_reset type)
        await tx
          .delete(emailVerificationTokens)
          .where(
            and(
              eq(emailVerificationTokens.userId, user.id),
              eq(emailVerificationTokens.type, 'password_reset'),
            ),
          );
      });

      return {
        success: true,
      };
    } catch (error) {
      console.error('Error resetting password:', error);
      return {
        success: false,
        error: 'Failed to reset password',
      };
    }
  }

  async updatePassword(params: {
    userId: string;
    currentPassword: string;
    newPassword: string;
  }) {
    const { userId, currentPassword, newPassword } = params;
    const user = await this.findUserInternal({ id: userId });
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    const isPasswordValid = await PasswordUtils.comparePassword(
      currentPassword,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      return { success: false, error: 'Current password is incorrect' };
    }

    const newPasswordHash = await PasswordUtils.hashPassword(newPassword);

    try {
      await this.databaseService.db
        .update(users)
        .set({ passwordHash: newPasswordHash, updatedAt: new Date() })
        .where(eq(users.id, userId));

      return { success: true };
    } catch (error) {
      console.error('Error updating password:', error);
      return { success: false, error: 'Failed to update password' };
    }
  }

  async deleteAccount(params: { userId: string }): Promise<{ success: boolean; error?: string }> {
    const { userId } = params;
    
    try {
      // Use a transaction to ensure all deletions happen atomically
      const result = await this.databaseService.db.transaction(async (tx) => {
        // Step 1: Delete dependent records first (in order of dependencies)
        
        // Delete email verification tokens that reference the user
        await tx
          .delete(emailVerificationTokens)
          .where(eq(emailVerificationTokens.userId, userId));

        // Delete notifications sent to the user
        // await tx
        //   .delete(notifications)
        //   .where(eq(notifications.userId, userId));

        // // Delete time entries created by the user
        // await tx
        //   .delete(timeEntries)
        //   .where(eq(timeEntries.userId, userId));

        // // For tasks: 
        // // - Delete tasks created by the user
        // // - Set assignee_id to null for tasks assigned to the user (to preserve task data)
        // await tx
        //   .delete(tasks)
        //   .where(eq(tasks.createdById, userId));
        
        // await tx
        //   .update(tasks)
        //   .set({ assigneeId: null, updatedAt: new Date() })
        //   .where(eq(tasks.assigneeId, userId));

        // // Delete projects owned by the user
        // await tx
        //   .delete(projects)
        //   .where(eq(projects.ownerId, userId));

        // Step 2: Delete the user record and check if it was actually deleted
        const deletedUsers = await tx
          .delete(users)
          .where(eq(users.id, userId))
          .returning({ id: users.id });

        // Return whether the user was actually deleted
        return { deletedCount: deletedUsers.length };
      });

      // Check if the user was actually deleted
      if (result.deletedCount === 0) {
        return { 
          success: false, 
          error: 'User not found or could not be deleted' 
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting account:', error);
      
      // Surface the actual error message for better debugging
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Unknown error occurred during account deletion';
      
      return { 
        success: false, 
        error: `Failed to delete account: ${errorMessage}` 
      };
    }
  }
}
