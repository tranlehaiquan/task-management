import type { User } from '@task-mgmt/database';

/**
 * Excludes sensitive user data by removing the passwordHash field
 * @param user - The user object to sanitize
 * @returns The user object without passwordHash
 */
export function sanitizeUserData(user: User): Omit<User, 'passwordHash'> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash: _, ...sanitizedUser } = user;
  return sanitizedUser;
}

/**
 * Excludes sensitive user data in an array of users
 * @param users - Array of user objects to sanitize
 * @returns Array of user objects without passwordHash
 */
export function sanitizeUsersData(users: User[]): Omit<User, 'passwordHash'>[] {
  return users.map(sanitizeUserData);
}
