'use server'

import { apiClient } from '~/lib/api-client'

export interface RegisterResult {
  success: boolean
  error?: string
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
    await apiClient.register(email, password, name)
    return { success: true }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Registration failed' }
  }
}
