import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { UsersService } from './users.service';
import type { NewUser, User } from '@task-mgmt/database';
import { CreateNewUserDto } from './dto/createNewUser.dto';
import type { FindUserCriteria } from './dto/findUser.dto';

// Type for user data without passwordHash
type SanitizedUser = Omit<User, 'passwordHash'>;

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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
}
