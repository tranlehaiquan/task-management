import { IsUUID, IsNotEmpty } from 'class-validator';

export class TransferProjectDto {
  @IsNotEmpty()
  @IsUUID('4')
  id: string;

  @IsNotEmpty()
  @IsUUID('4')
  toUserId: string;
}
