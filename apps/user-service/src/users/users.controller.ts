import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { UsersService } from './users.service';
import type { NewUser, User } from '@task-mgmt/database';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Message patterns for microservice communication
  @MessagePattern('user.create')
  async createUserMessage(userData: NewUser): Promise<User> {
    return this.usersService.createUser(userData);
  }

  @MessagePattern('user.findById')
  async findUserByIdMessage(id: string): Promise<User | null> {
    return this.usersService.getUserById(id);
  }

  @MessagePattern('user.findAll')
  async findAllUsersMessage() {
    return this.usersService.getAllUsers();
  }

  @MessagePattern('user.update')
  async updateUserMessage(data: {
    id: string;
    updates: Partial<NewUser>;
  }): Promise<User | null> {
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
  ): Promise<{ exists: boolean; user?: User }> {
    const user = await this.usersService.getUserById(id);
    return {
      exists: !!user,
      user: user || undefined,
    };
  }
}
