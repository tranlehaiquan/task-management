# Server Actions Pattern for API Gateway Integration

## Problem

When using API Gateway integration in a Next.js app, you cannot call the API client directly from client components because:

1. **Environment Variables**: `env.API_GATEWAY_URL` is a server-side environment variable
2. **Security**: API keys and sensitive configs shouldn't be exposed to the client
3. **CORS**: Direct client-to-API-Gateway calls may hit CORS issues

## Solution: Server Actions

Use Next.js Server Actions to create a server-side bridge between client components and the API Gateway.

## Architecture

```
Client Component (Browser)
    ↓ calls server action
Server Action (Next.js Server)
    ↓ calls API client
API Client
    ↓ HTTP request
API Gateway (Port 3000)
    ↓ TCP messages
Microservices (User, Token, etc.)
```

## Implementation

### 1. Create Server Actions File

**File**: `src/app/auth/actions.ts`

```typescript
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
```

**Key Points**:

- ✅ `'use server'` directive at the top
- ✅ Runs on the server (can access `env.API_GATEWAY_URL`)
- ✅ Returns serializable data (no complex objects)
- ✅ Proper error handling

### 2. Use Server Action in Client Component

**File**: `src/app/auth/signup/page.tsx`

```typescript
'use client'

import { signIn } from 'next-auth/react'
import { registerUser } from '../actions'

export default function SignUpPage() {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Call server action (runs on server)
    const result = await registerUser(email, password, name)

    if (!result.success) {
      setError(result.error || 'Registration failed')
      return
    }

    // Auto sign-in after successful registration
    const signInResult = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (signInResult?.ok) {
      router.push('/dashboard')
    }
  }
}
```

## Why This Pattern?

### ❌ Don't Do This (Direct API Call from Client)

```typescript
'use client'
import { apiClient } from '~/lib/api-client'

export default function SignUpPage() {
  const handleSubmit = async () => {
    // ❌ ERROR: Tries to access server-side env variable
    await apiClient.register(email, password, name)
  }
}
```

**Error**: "Attempted to access a server-side environment variable on the client"

### ✅ Do This (Server Action)

```typescript
'use client'
import { registerUser } from '../actions'

export default function SignUpPage() {
  const handleSubmit = async () => {
    // ✅ CORRECT: Calls server action
    const result = await registerUser(email, password, name)
  }
}
```

## Authentication Flow

### Sign Up Flow

1. **User fills form** → Client component
2. **Validate input** → Client-side
3. **Call `registerUser()`** → Server action
4. **API Gateway registration** → Server-side API call
5. **Auto sign-in** → NextAuth (client-side)
6. **Redirect to dashboard** → Client-side

### Sign In Flow

Sign-in is different - it uses NextAuth's built-in Credentials provider:

1. **User fills form** → Client component
2. **Call `signIn('credentials')`** → NextAuth client
3. **NextAuth calls `authorize()`** → Server-side (auth config)
4. **`authorize()` calls API Gateway** → Server-side API call
5. **JWT session created** → NextAuth
6. **Redirect to dashboard** → Client-side

## Benefits

### Security

- ✅ API Gateway URL stays server-side
- ✅ No exposure of backend endpoints to client
- ✅ Environment variables protected

### Architecture

- ✅ Clear separation of concerns
- ✅ Type-safe server actions
- ✅ Proper error handling
- ✅ Can add middleware/logging easily

### Developer Experience

- ✅ Simple to use from client components
- ✅ TypeScript support
- ✅ Automatic serialization
- ✅ React Server Components compatible

## When to Use Server Actions

Use server actions for:

- ✅ Registration (non-auth API calls)
- ✅ Password reset requests
- ✅ Email verification
- ✅ Profile updates (with session token)
- ✅ Any API Gateway call from client components

Use NextAuth for:

- ✅ Sign in (handled by Credentials provider)
- ✅ Sign out (handled by NextAuth)
- ✅ Session management (handled by NextAuth)

## Additional Server Actions

You can create more server actions for other features:

### Email Verification

```typescript
'use server'

export async function sendVerificationEmail(
  token: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await apiClient.sendVerificationEmail(token)
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    }
  }
}
```

### Password Reset

```typescript
'use server'

export async function requestPasswordReset(
  email: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await apiClient.forgotPassword(email)
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to send reset email',
    }
  }
}
```

## Error Handling

Server actions should:

1. **Catch all errors** - Don't let errors bubble up unhandled
2. **Return structured results** - `{ success: boolean, error?: string }`
3. **Log on server** - Use `console.error()` for debugging
4. **Return safe messages** - Don't expose internal errors to client

```typescript
'use server'

export async function myAction(): Promise<Result> {
  try {
    const response = await apiClient.someMethod()
    return { success: true, data: response }
  } catch (error) {
    // Log full error on server
    console.error('Action failed:', error)

    // Return safe message to client
    return {
      success: false,
      error: 'Operation failed. Please try again.',
    }
  }
}
```

## Testing Server Actions

```typescript
// In your component test
import { registerUser } from '../actions'

jest.mock('../actions', () => ({
  registerUser: jest.fn(),
}))

test('handles registration error', async () => {
  ;(registerUser as jest.Mock).mockResolvedValue({
    success: false,
    error: 'Email already exists',
  })

  // Test your component
})
```

## Summary

| Feature        | Method               | Why                                      |
| -------------- | -------------------- | ---------------------------------------- |
| Sign Up        | Server Action        | Access server env vars, call API Gateway |
| Sign In        | NextAuth Credentials | Built-in auth flow, JWT sessions         |
| Sign Out       | NextAuth `signOut()` | Proper cookie clearing                   |
| Password Reset | Server Action        | Call API Gateway from client             |
| Email Verify   | Server Action        | Call API Gateway from client             |
| Profile Update | Server Action        | Call API Gateway with session token      |

## File Structure

```
src/
├── app/
│   └── auth/
│       ├── actions.ts          # ⭐ Server actions
│       ├── signin/
│       │   └── page.tsx        # Uses NextAuth signIn()
│       └── signup/
│           └── page.tsx        # Uses server actions
├── lib/
│   └── api-client.ts           # API Gateway client (server-only)
└── server/
    └── auth/
        └── config.ts           # NextAuth config (uses api-client)
```

## Key Takeaways

1. **Never import `apiClient` in 'use client' components** ❌
2. **Always use server actions for API Gateway calls from client** ✅
3. **Sign-in uses NextAuth's Credentials provider** ✅
4. **Server actions return serializable data** ✅
5. **Environment variables stay server-side** ✅

This pattern keeps your app secure, maintainable, and follows Next.js best practices! 🚀
