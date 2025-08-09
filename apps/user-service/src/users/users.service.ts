import { Injectable } from '@nestjs/common';
import {
  DatabaseService,
  users,
  type NewUser,
  type User,
} from '@task-mgmt/database';
import { eq, and, ilike, type SQL } from 'drizzle-orm';
import { PasswordUtils } from '../utils/password.utils';
import { sanitizeUserData, sanitizeUsersData } from '../utils/user.utils';
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
    const user = await this.findUserInternal({ id });
    return user ? sanitizeUserData(user) : null;
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
}
