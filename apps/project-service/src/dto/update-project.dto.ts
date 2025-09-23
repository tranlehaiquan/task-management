import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateProjectDto {
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @Transform(({ value }): string | null | undefined =>
    value === undefined ? undefined : value,
  )
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsString()
  slug?: string;
}
