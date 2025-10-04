"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sendVerificationEmail } from "~/server/actions/verify-email";

interface VerifyEmailButtonProps {
  variant?: "primary" | "warning";
  className?: string;
  fullWidth?: boolean;
}

export function VerifyEmailButton({
  variant = "warning",
  className = "",
  fullWidth = false,
}: VerifyEmailButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const router = useRouter();

  const handleVerifyEmail = async () => {
    try {
      setIsLoading(true);
      setMessage(null);

      const result = await sendVerificationEmail();

      if (result.success) {
        setMessage({
          type: "success",
          text: "Verification email sent! Please check your inbox.",
        });
        // Refresh the page to update session data after a short delay
        setTimeout(() => {
          router.refresh();
        }, 2000);
      } else {
        setMessage({
          type: "error",
          text: result.error || "Failed to send verification email",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const baseClasses = `rounded-md px-4 py-2 text-center text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${fullWidth ? "w-full" : ""}`;

  const variantClasses = {
    primary:
      "bg-indigo-600 text-white hover:bg-indigo-500 disabled:hover:bg-indigo-600",
    warning:
      "bg-yellow-600 text-white hover:bg-yellow-500 disabled:hover:bg-yellow-600",
  };

  return (
    <div className={className}>
      <button
        onClick={handleVerifyEmail}
        disabled={isLoading}
        className={`${baseClasses} ${variantClasses[variant]}`}
      >
        {isLoading ? "Sending..." : "Verify Email"}
      </button>
      {message && (
        <div
          className={`mt-2 rounded-md px-3 py-2 text-sm ${
            message.type === "success"
              ? "border border-green-200 bg-green-50 text-green-800"
              : "border border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
