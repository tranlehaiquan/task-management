"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { verifyEmailWithToken } from "~/server/actions/verify-email";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("No verification token provided");
      return;
    }

    const verifyEmail = async () => {
      try {
        const result = await verifyEmailWithToken(token);

        if (result.success) {
          setStatus("success");
          setMessage(result.message || "Email verified successfully!");
          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            router.push("/dashboard");
          }, 3000);
        } else {
          setStatus("error");
          setMessage(result.error || "Failed to verify email");
        }
      } catch (error) {
        setStatus("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        );
      }
    };

    void verifyEmail();
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Email Verification
          </h1>
        </div>

        <div className="rounded-lg bg-white p-8 shadow">
          {status === "loading" && (
            <div className="text-center">
              <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
              <p className="text-gray-600">Verifying your email...</p>
            </div>
          )}

          {status === "success" && (
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <svg
                  className="h-16 w-16 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Success!
              </h2>
              <p className="mb-6 text-gray-600">{message}</p>
              <p className="text-sm text-gray-500">
                Redirecting to dashboard in 3 seconds...
              </p>
              <Link
                href="/dashboard"
                className="mt-4 inline-block rounded-md bg-indigo-600 px-6 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
              >
                Go to Dashboard
              </Link>
            </div>
          )}

          {status === "error" && (
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <svg
                  className="h-16 w-16 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Verification Failed
              </h2>
              <p className="mb-6 text-gray-600">{message}</p>
              <div className="flex flex-col gap-2">
                <Link
                  href="/dashboard"
                  className="inline-block rounded-md bg-indigo-600 px-6 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                >
                  Go to Dashboard
                </Link>
                <Link
                  href="/auth/signin"
                  className="inline-block rounded-md bg-gray-100 px-6 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200"
                >
                  Sign In
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
