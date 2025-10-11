"use server";

import { apiClient } from "~/lib/api-client";

export interface RegisterResult {
  success: boolean;
  error?: string;
}

export interface ForgotPasswordResult {
  success: boolean;
  error?: string;
}

export interface ValidateTokenResult {
  success: boolean;
  error?: string;
}

export interface ResetPasswordResult {
  success: boolean;
  error?: string;
}

/**
 * Server action to register a new user
 * This runs on the server, so it can access server-side environment variables
 */
export async function registerUser(
  email: string,
  password: string,
  name: string,
): Promise<RegisterResult> {
  try {
    await apiClient.register(email, password, name);
    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Registration failed" };
  }
}

/**
 * Server action to request a password reset email
 */
export async function forgotPassword(
  email: string,
): Promise<ForgotPasswordResult> {
  try {
    await apiClient.forgotPassword(email);
    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to send password reset email" };
  }
}

/**
 * Server action to validate a password reset token
 */
export async function validateResetToken(
  token: string,
): Promise<ValidateTokenResult> {
  try {
    await apiClient.validateForgotPasswordToken(token);
    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Invalid or expired reset token" };
  }
}

/**
 * Server action to reset password with token
 */
export async function resetPassword(
  token: string,
  password: string,
): Promise<ResetPasswordResult> {
  try {
    console.log(token, password);
    await apiClient.resetPassword(token, password);
    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to reset password" };
  }
}
