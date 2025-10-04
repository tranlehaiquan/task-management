"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from "@/lib/validations/auth";
import { validateResetToken, resetPassword } from "../actions";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onBlur",
  });

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError("Invalid or missing reset token");
        setIsValidating(false);
        return;
      }

      try {
        const result = await validateResetToken(token);

        if (result.success) {
          setIsValidToken(true);
        } else {
          setError(result.error ?? "Invalid or expired reset token");
        }
      } catch (err) {
        console.error("Token validation error:", err);
        setError("Invalid or expired reset token");
      } finally {
        setIsValidating(false);
      }
    };

    void validateToken();
  }, [token]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setError("Invalid reset token");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const result = await resetPassword(token, data.password);

      if (result.success) {
        setSuccess(true);
        // Redirect to sign in after 3 seconds
        setTimeout(() => {
          router.push("/auth/signin");
        }, 3000);
      } else {
        setError(result.error ?? "Failed to reset password. Please try again.");
      }
    } catch (err) {
      console.error("Reset password error:", err);
      setError("Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-center text-2xl font-bold">
            Create new password
          </CardTitle>
          <CardDescription className="text-center">
            Enter your new password below
          </CardDescription>
        </CardHeader>

        {isValidating ? (
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Loader2 className="text-primary mb-4 size-8 animate-spin" />
            <p className="text-muted-foreground text-sm">
              Validating reset token...
            </p>
          </CardContent>
        ) : !isValidToken ? (
          <>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertTitle>Invalid Token</AlertTitle>
                <AlertDescription>
                  {error ??
                    "This password reset link is invalid or has expired. Please request a new one."}
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter>
              <Link href="/auth/forgot-password" className="w-full">
                <Button type="button" className="w-full">
                  Request new reset link
                </Button>
              </Link>
            </CardFooter>
          </>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="mb-4 space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="size-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-200 bg-green-50 text-green-800">
                  <CheckCircle2 className="size-4" />
                  <AlertTitle>Password reset successful!</AlertTitle>
                  <AlertDescription>
                    Your password has been reset. Redirecting to sign in...
                  </AlertDescription>
                </Alert>
              )}

              {!success && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="password">New Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter new password"
                      autoComplete="new-password"
                      {...register("password", {
                        onChange: () => setError(""),
                      })}
                      aria-invalid={errors.password ? "true" : "false"}
                    />
                    {errors.password && (
                      <p className="text-destructive text-sm">
                        {errors.password.message}
                      </p>
                    )}
                    <p className="text-muted-foreground text-xs">
                      Password must be at least 8 characters and contain at
                      least one number
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm new password"
                      autoComplete="new-password"
                      {...register("confirmPassword", {
                        onChange: () => setError(""),
                      })}
                      aria-invalid={errors.confirmPassword ? "true" : "false"}
                    />
                    {errors.confirmPassword && (
                      <p className="text-destructive text-sm">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                </>
              )}
            </CardContent>

            {!success && (
              <CardFooter className="flex flex-col space-y-4">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || !isValidToken}
                >
                  {isLoading ? "Resetting password..." : "Reset password"}
                </Button>

                <Link
                  href="/auth/signin"
                  className="text-muted-foreground text-center text-sm hover:underline"
                >
                  Back to sign in
                </Link>
              </CardFooter>
            )}
          </form>
        )}
      </Card>
    </div>
  );
}
