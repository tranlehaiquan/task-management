import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import type { NewUser, User } from '@task-mgmt/database';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(@Body() userData: NewUser): Promise<User> {
    return this.usersService.createUser(userData);
  }

  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<User | null> {
    return this.usersService.getUserById(id);
  }

  @Get()
  async getAllUsers(): Promise<User[]> {
    return this.usersService.getAllUsers();
  }

  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() updates: Partial<NewUser>,
  ): Promise<User | null> {
    return this.usersService.updateUser(id, updates);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string): Promise<{ success: boolean }> {
    const success = await this.usersService.deleteUser(id);
    return { success };
  }
}