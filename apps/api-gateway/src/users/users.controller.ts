import {
  Controller,
  Get,
  Param,
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
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import type { User } from '@task-mgmt/database';
import { UserResponseDto } from './dto/user-response.dto';
import { AuthGuard } from 'src/guards/auth.guards';

@ApiTags('users')
@Controller('api/users')
@UseGuards(AuthGuard)
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(
    @Inject('USER_SERVICE') private readonly userService: ClientProxy,
  ) {}

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
    } catch {
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
    } catch {
      throw new HttpException(
        'Failed to fetch users',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
