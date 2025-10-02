'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signInSchema, type SignInFormData } from '@/lib/validations/auth'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'
import { AlertCircle } from 'lucide-react'

export default function SignInPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    mode: 'onBlur',
  })

  const onSubmit = async (data: SignInFormData) => {
    setError('')
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        // NextAuth returns "CredentialsSignin" when authorize returns null
        const errorMessage = result.error

        if (errorMessage === 'CredentialsSignin') {
          setError(
            'Invalid email or password. Please check your credentials and try again.',
          )
        } else if (errorMessage.includes('Invalid email or password')) {
          setError(
            'Invalid email or password. Please check your credentials and try again.',
          )
        } else if (
          errorMessage.includes('fetch') ||
          errorMessage.includes('network')
        ) {
          setError(
            'Unable to connect to the server. Please check your connection and try again.',
          )
        } else if (errorMessage.includes('Configuration')) {
          setError('Authentication service error. Please try again later.')
        } else {
          setError(errorMessage || 'Sign in failed. Please try again.')
        }
      } else if (result?.ok) {
        // Success - redirect to dashboard
        router.push('/dashboard')
        router.refresh()
      } else {
        setError('Sign in failed. Please try again.')
      }
    } catch (err) {
      console.error('Sign in error:', err)
      setError('An unexpected error occurred. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Sign in to your account
          </CardTitle>
          <CardDescription className="text-center">
            Enter your email and password to access your account
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4 mb-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertTitle>Sign in failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                autoComplete="email"
                {...register('email', {
                  onChange: () => setError(''),
                })}
                aria-invalid={errors.email ? 'true' : 'false'}
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                {...register('password', {
                  onChange: () => setError(''),
                })}
                aria-invalid={errors.password ? 'true' : 'false'}
              />
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link
                href="/auth/signup"
                className="font-medium text-primary hover:underline"
              >
                Create account
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
