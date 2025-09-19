import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateProjectDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'Project Name' })
  name: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Project Description' })
  description?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'project-name-slug' })
  slug?: string;
}
