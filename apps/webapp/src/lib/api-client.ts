/**
 * API Client for communicating with the API Gateway
 */

import { env } from '~/env'

export interface User {
  id: string
  email: string
  name: string
  avatarUrl: string | null
  isActive: boolean
  isEmailVerified: boolean
  lastLoginAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface LoginResponse {
  token: string
  user: User
}

export interface RegisterResponse {
  token: string
  user: User
}

export interface ApiError {
  message: string
  statusCode: number
  error?: string
}

class ApiClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = env.API_GATEWAY_URL
  }

  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${this.baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const error = (await response.json()) as ApiError
      throw new Error(error.message || 'Login failed')
    }

    return response.json() as Promise<LoginResponse>
  }

  /**
   * Register a new user
   */
  async register(
    email: string,
    password: string,
    name: string,
  ): Promise<RegisterResponse> {
    const response = await fetch(`${this.baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name }),
    })

    if (!response.ok) {
      const error = (await response.json()) as ApiError
      throw new Error(error.message || 'Registration failed')
    }

    return response.json() as Promise<RegisterResponse>
  }

  /**
   * Get current user information by JWT token
   */
  async getCurrentUser(token: string): Promise<User> {
    const response = await fetch(`${this.baseUrl}/api/auth/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = (await response.json()) as ApiError
      throw new Error(error.message || 'Failed to get user')
    }

    return response.json() as Promise<User>
  }

  /**
   * Send email verification
   */
  async sendVerificationEmail(token: string): Promise<{ success: boolean }> {
    const response = await fetch(`${this.baseUrl}/api/auth/verify-email`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = (await response.json()) as ApiError
      throw new Error(error.message || 'Failed to send verification email')
    }

    return response.json() as Promise<{ success: boolean }>
  }

  /**
   * Verify email with token
   */
  async verifyEmailToken(
    verificationToken: string,
  ): Promise<{ success: boolean; message: string }> {
    const response = await fetch(
      `${this.baseUrl}/api/auth/verify-email-token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: verificationToken }),
      },
    )

    if (!response.ok) {
      const error = (await response.json()) as ApiError
      throw new Error(error.message || 'Email verification failed')
    }

    return response.json() as Promise<{ success: boolean; message: string }>
  }

  /**
   * Request password reset
   */
  async forgotPassword(email: string): Promise<{ success: boolean }> {
    const response = await fetch(`${this.baseUrl}/api/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })

    if (!response.ok) {
      const error = (await response.json()) as ApiError
      throw new Error(error.message || 'Failed to send password reset email')
    }

    return response.json() as Promise<{ success: boolean }>
  }

  /**
   * Validate password reset token
   */
  async validateForgotPasswordToken(
    token: string,
  ): Promise<{ success: boolean }> {
    const response = await fetch(
      `${this.baseUrl}/api/auth/validate-forgot-password-token?token=${encodeURIComponent(token)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

    if (!response.ok) {
      const error = (await response.json()) as ApiError
      throw new Error(error.message || 'Invalid or expired token')
    }

    return response.json() as Promise<{ success: boolean }>
  }

  /**
   * Reset password with token
   */
  async resetPassword(
    token: string,
    password: string,
  ): Promise<{ success: boolean }> {
    const response = await fetch(`${this.baseUrl}/api/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, password }),
    })

    if (!response.ok) {
      const error = (await response.json()) as ApiError
      throw new Error(error.message || 'Password reset failed')
    }

    return response.json() as Promise<{ success: boolean }>
  }

  /**
   * Change password (authenticated)
   */
  async changePassword(
    token: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<{ success: boolean }> {
    const response = await fetch(`${this.baseUrl}/api/auth/change-password`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ oldPassword, newPassword }),
    })

    if (!response.ok) {
      const error = (await response.json()) as ApiError
      throw new Error(error.message || 'Password change failed')
    }

    return response.json() as Promise<{ success: boolean }>
  }
}

export const apiClient = new ApiClient()
