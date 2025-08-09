/**
 * JWT payload structure for user authentication
 * Contains user profile information and standard JWT claims
 *
 * Note: User timestamps use ISO 8601 strings for readability and JSON compatibility
 * JWT claims (iat, exp) remain as epoch seconds per JWT standard
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
  /** Timestamp of user's last login in ISO 8601 format (nullable) */
  lastLoginAt: string | null;
  /** User account creation timestamp in ISO 8601 format */
  createdAt: string;
  /** User account last update timestamp in ISO 8601 format */
  updatedAt: string;
  /** JWT issued at timestamp (seconds since epoch) */
  iat: number;
  /** JWT expiration timestamp (seconds since epoch) */
  exp: number;
};

/**
 * Current authenticated user information
 * Used in request.user for authenticated routes (excludes sensitive data)
 *
 * Note: All timestamps use ISO 8601 strings for readability and API consistency
 */
export type CurrentUser = {
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
  /** Timestamp of user's last login in ISO 8601 format (nullable) */
  lastLoginAt: string | null;
  /** User account creation timestamp in ISO 8601 format */
  createdAt: string;
  /** User account last update timestamp in ISO 8601 format */
  updatedAt: string;
};
