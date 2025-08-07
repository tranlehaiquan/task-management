import { NewUser } from '@task-mgmt/database';

export class CreateNewUserDto implements Omit<NewUser, 'passwordHash'> {
  email: string;
  password: string;
  name: string;
  avatarUrl?: string;
  isActive?: boolean;
}
