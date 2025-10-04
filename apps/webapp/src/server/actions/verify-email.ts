"use server";

import { auth } from "~/server/auth";
import { apiClient } from "~/lib/api-client";

/**
 * Server action to send verification email
 * This fetches the current session and uses the access token to call the API
 */
export async function sendVerificationEmail(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const session = await auth();

    if (!session || !session.accessToken) {
      return {
        success: false,
        error: "You must be logged in to verify your email",
      };
    }

    if (session.user.isEmailVerified) {
      return {
        success: false,
        error: "Your email is already verified",
      };
    }

    // Call the API to send verification email
    const result = await apiClient.sendVerificationEmail(session.accessToken);

    if (result.success) {
      return {
        success: true,
      };
    }

    return {
      success: false,
      error: "Failed to send verification email",
    };
  } catch (error) {
    console.error("Error sending verification email:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to send verification email",
    };
  }
}

/**
 * Server action to verify email with token
 * This is used when the user clicks the verification link in their email
 */
export async function verifyEmailWithToken(token: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    if (!token) {
      return {
        success: false,
        error: "Verification token is required",
      };
    }

    // Call the API to verify email with token
    const result = await apiClient.verifyEmailToken(token);

    if (result.success) {
      return {
        success: true,
        message: result.message || "Email verified successfully!",
      };
    }

    return {
      success: false,
      error: "Failed to verify email",
    };
  } catch (error) {
    console.error("Error verifying email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to verify email",
    };
  }
}
