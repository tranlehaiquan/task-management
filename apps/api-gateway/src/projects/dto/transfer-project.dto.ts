import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class TransferProjectDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The ID of the user to transfer the project to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  toUserId: string;
}
