import { randomBytes } from 'crypto';

/**
 * Generates a cryptographically secure random string
 * @param length - The length of the random bytes to generate (default: 32)
 * @returns A hex-encoded random string
 */
export function randomString(length: number = 32): string {
  return randomBytes(length).toString('hex');
}

/**
 * Generates a random token suitable for email verification, password reset, etc.
 * @returns A 32-byte hex-encoded token (64 characters)
 */
export function generateSecureToken(): string {
  return randomString(32);
}

/**
 * Generates a shorter random ID suitable for temporary identifiers
 * @returns A 16-byte hex-encoded string (32 characters)
 */
export function generateShortId(): string {
  return randomString(16);
}
