import { ApiProperty } from '@nestjs/swagger';

export class DeleteAccountResponse {
  @ApiProperty({
    description: 'Indicates whether the account deletion was successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Success message for account deletion',
    example: 'Account deleted successfully',
  })
  message: string;
}
