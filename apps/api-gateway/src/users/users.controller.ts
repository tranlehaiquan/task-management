import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Inject,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import type { NewUser, User } from '@task-mgmt/database';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  UserResponseDto,
  UserValidationResponseDto,
  DeleteUserResponseDto,
} from './dto/user-response.dto';
import { AuthGuard } from 'src/guards/auth.guards';

@ApiTags('users')
@Controller('api/users')
@UseGuards(AuthGuard)
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(
    @Inject('USER_SERVICE') private readonly userService: ClientProxy,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({
    description: 'User data for creation',
    examples: {
      example1: {
        summary: 'Example user',
        value: {
          email: 'john.doe@example.com',
          name: 'John Doe',
          password: 'password123',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async createUser(@Body() userData: CreateUserDto): Promise<User> {
    try {
      return await firstValueFrom(
        this.userService.send<User, CreateUserDto>('user.create', userData),
      );
    } catch (error) {
      throw new HttpException(
        'Failed to create user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({
    name: 'id',
    description: 'User ID (UUID)',
    example: 'uuid-string',
  })
  @ApiResponse({
    status: 200,
    description: 'User found',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async getUserById(@Param('id') id: string): Promise<User | null> {
    try {
      return await firstValueFrom(
        this.userService.send<User | null, string>('user.findById', id),
      );
    } catch (error) {
      throw new HttpException(
        'Failed to fetch user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'List of all users',
    type: [UserResponseDto],
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async getAllUsers(): Promise<User[]> {
    try {
      return await firstValueFrom(
        this.userService.send<User[]>('user.findAll', {}),
      );
    } catch (error) {
      throw new HttpException(
        'Failed to fetch users',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiParam({
    name: 'id',
    description: 'User ID (UUID)',
    example: 'uuid-string',
  })
  @ApiBody({
    description: 'User update data',
    examples: {
      example1: {
        summary: 'Update name',
        value: {
          name: 'John Smith',
        },
      },
      example2: {
        summary: 'Update email',
        value: {
          email: 'john.smith@example.com',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async updateUser(
    @Param('id') id: string,
    @Body() updates: UpdateUserDto,
  ): Promise<User | null> {
    try {
      return await firstValueFrom(
        this.userService.send<
          User | null,
          { id: string; updates: Partial<NewUser> }
        >('user.update', { id, updates }),
      );
    } catch (error) {
      throw new HttpException(
        'Failed to update user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiParam({
    name: 'id',
    description: 'User ID (UUID)',
    example: 'uuid-string',
  })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully',
    type: DeleteUserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async deleteUser(@Param('id') id: string): Promise<{ success: boolean }> {
    try {
      return await firstValueFrom(
        this.userService.send<{ success: boolean }, string>('user.delete', id),
      );
    } catch (error) {
      throw new HttpException(
        'Failed to delete user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id/validate')
  @ApiOperation({ summary: 'Validate if user exists' })
  @ApiParam({
    name: 'id',
    description: 'User ID (UUID)',
    example: 'uuid-string',
  })
  @ApiResponse({
    status: 200,
    description: 'User validation result',
    type: UserValidationResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async validateUser(
    @Param('id') id: string,
  ): Promise<{ exists: boolean; user?: User }> {
    try {
      return await firstValueFrom(
        this.userService.send<{ exists: boolean; user?: User }, string>(
          'user.validate',
          id,
        ),
      );
    } catch (error) {
      throw new HttpException(
        'Failed to validate user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
