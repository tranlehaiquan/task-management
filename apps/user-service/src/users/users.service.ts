import { Injectable } from '@nestjs/common';
import {
  DatabaseService,
  users,
  type NewUser,
  type User,
} from '@task-mgmt/database';
import { eq } from 'drizzle-orm';

@Injectable()
export class UsersService {
  constructor(private readonly databaseService: DatabaseService) {}

  async createUser(userData: NewUser): Promise<User> {
    const [user] = await this.databaseService.db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async getUserById(id: string): Promise<User | null> {
    const [user] = await this.databaseService.db
      .select()
      .from(users)
      .where(eq(users.id, id));
    return user || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const [user] = await this.databaseService.db
      .select()
      .from(users)
      .where(eq(users.email, email));
    return user || null;
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
  ): Promise<User | null> {
    const [user] = await this.databaseService.db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || null;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await this.databaseService.db
      .delete(users)
      .where(eq(users.id, id))
      .returning();
    return result.length > 0;
  }
}
