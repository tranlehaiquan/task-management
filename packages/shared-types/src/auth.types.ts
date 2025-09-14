/**
 * JWT payload structure for user authentication
 * Contains only essential identifiers and standard JWT claims
 *
 * Note: Keeps JWT minimal for performance and security
 * Full user profile data should be fetched separately via CurrentUser
 */
export type UserJWTPayload = {
  /** User unique identifier */
  id: string;
  /** JWT issued at timestamp (seconds since epoch) */
  iat: number;
  /** JWT expiration timestamp (seconds since epoch) */
  exp: number;
};

/**
 * User role types for system-level permissions
 */
export type UserRole = 'user' | 'admin' | 'super_admin';

/**
 * Current authenticated user information with complete profile data
 * Used in request.user for authenticated routes (excludes sensitive data)
 *
 * Note: Contains full user profile - fetched fresh from database on each request
 * to ensure data is current and not stale like JWT payload would be
 */
export type CurrentUser = {
  /** User unique identifier */
  id: string;
  /** User email address */
  email: string;
  /** User display name */
  name: string;
  /** User system role for permissions */
  role: UserRole;
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
