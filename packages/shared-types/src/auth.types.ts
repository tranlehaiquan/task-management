/**
 * JWT payload structure for user authentication
 * Contains user profile information and standard JWT claims
 */
export type UserJWTPayload = {
  /** User unique identifier */
  id: string;
  /** User email address */
  email: string;
  /** User display name */
  name: string;
  /** User avatar URL (nullable) */
  avatarUrl: string | null;
  /** Whether the user account is active */
  isActive: boolean;
  /** Whether the user's email has been verified */
  isEmailVerified: boolean;
  /** Timestamp of user's last login (nullable) */
  lastLoginAt: Date | null;
  /** User account creation timestamp */
  createdAt: Date;
  /** User account last update timestamp */
  updatedAt: Date;
  /** JWT issued at timestamp (seconds since epoch) */
  iat: number;
  /** JWT expiration timestamp (seconds since epoch) */
  exp: number;
};