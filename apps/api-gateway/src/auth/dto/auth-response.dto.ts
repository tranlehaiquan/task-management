import { ApiProperty } from '@nestjs/swagger';
import { type User } from '@task-mgmt/database';

export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT authentication token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  token: string;

  @ApiProperty({
    description: 'User information',
    type: 'object',
    properties: {
      id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
      email: { type: 'string', example: 'john@example.com' },
      name: { type: 'string', example: 'John Doe' },
      avatarUrl: { type: 'string', example: 'https://example.com/avatar.jpg' },
      isActive: { type: 'boolean', example: true },
      isEmailVerified: { type: 'boolean', example: false },
      lastLoginAt: {
        type: 'string',
        format: 'date-time',
        example: '2024-01-01T00:00:00Z',
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        example: '2024-01-01T00:00:00Z',
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        example: '2024-01-01T00:00:00Z',
      },
    },
  })
  user: User;
}

export class ErrorResponseDto {
  @ApiProperty({
    description: 'Error message',
    example: 'Invalid email or password',
  })
  message: string;

  @ApiProperty({
    description: 'HTTP status code',
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Error type',
    example: 'Bad Request',
  })
  error: string;
}

export class ConflictErrorResponseDto {
  @ApiProperty({
    description: 'Error message',
    example: 'User already exists',
  })
  message: string;

  @ApiProperty({
    description: 'HTTP status code',
    example: 409,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Error type',
    example: 'Conflict',
  })
  error: string;
}
