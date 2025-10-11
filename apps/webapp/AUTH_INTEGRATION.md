# API Gateway Authentication Integration

This document describes the integration between the Next.js webapp and the API Gateway authentication system.

## Overview

The webapp uses NextAuth.js v5 with a Credentials provider to authenticate users against the API Gateway backend.

## Architecture

```
User → Next.js Webapp → NextAuth.js → API Client → API Gateway → User/Token Services
```

### Components

1. **NextAuth Configuration** (`src/server/auth/config.ts`)
   - Credentials provider configured to call API Gateway login endpoint
   - JWT session strategy (no database required)
   - Custom callbacks to store user data and access token in session

2. **API Client** (`src/lib/api-client.ts`)
   - Wrapper around API Gateway REST endpoints
   - Handles login, register, profile, email verification, password reset
   - Type-safe interfaces matching API Gateway DTOs

3. **Auth Pages**
   - Sign In: `/auth/signin`
   - Sign Up: `/auth/signup`
   - Protected: `/dashboard`, `/profile`

## Environment Variables

```bash
# .env
AUTH_SECRET="your-nextauth-secret"
API_GATEWAY_URL="http://localhost:3000"
```

## Authentication Flow

### Sign Up

1. User fills registration form at `/auth/signup`
2. Form submits to `apiClient.register()` → `POST /api/auth/register`
3. API Gateway creates user and returns JWT token
4. Webapp automatically signs in user using NextAuth
5. Redirect to `/dashboard`

### Sign In

1. User fills login form at `/auth/signin`
2. NextAuth Credentials provider calls `apiClient.login()` → `POST /api/auth/login`
3. API Gateway validates credentials and returns JWT token + user data
4. NextAuth stores user data and token in JWT session
5. Redirect to `/dashboard`

### Protected Routes

Protected routes use `auth()` from `next-auth` to check session:

```typescript
import { auth } from '~/server/auth'
import { redirect } from 'next/navigation'

export default async function ProtectedPage() {
  const session = await auth()

  if (!session) {
    redirect('/auth/signin')
  }

  // Access user data: session.user
  // Access API token: session.accessToken
}
```

### Sign Out

```typescript
import { signOut } from '~/server/auth'

// Server action
await signOut({ redirectTo: '/auth/signin' })
```

## Session Structure

```typescript
interface Session {
  user: {
    id: string
    email: string
    name: string
    avatarUrl: string | null
    isActive: boolean
    isEmailVerified: boolean
  }
  accessToken?: string // JWT token from API Gateway
}
```

## API Client Methods

### Authentication

- `login(email, password)` - Login user
- `register(email, password, name)` - Register new user
- `getCurrentUser(token)` - Get current user by token

### Email Verification

- `sendVerificationEmail(token)` - Request verification email
- `verifyEmailToken(verificationToken)` - Verify email with token

### Password Management

- `forgotPassword(email)` - Request password reset
- `validateForgotPasswordToken(token)` - Validate reset token
- `resetPassword(token, password)` - Reset password with token
- `changePassword(token, oldPassword, newPassword)` - Change password (authenticated)

## Making Authenticated API Calls

To call API Gateway endpoints from server components:

```typescript
import { auth } from '~/server/auth'
import { apiClient } from '~/lib/api-client'

export default async function MyPage() {
  const session = await auth()

  if (!session?.accessToken) {
    redirect('/auth/signin')
  }

  // Use the token to call protected endpoints
  const user = await apiClient.getCurrentUser(session.accessToken)

  // Or use fetch directly
  const response = await fetch('http://localhost:3000/api/users/profile', {
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  })
}
```

## Client Components

For client components, use NextAuth's `useSession` hook:

```typescript
'use client'
import { useSession } from 'next-auth/react'

export default function MyComponent() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (status === 'unauthenticated') {
    return <div>Please sign in</div>
  }

  return <div>Hello, {session?.user.name}</div>
}
```

## Development

### Prerequisites

1. Start API Gateway and services:

   ```bash
   # From monorepo root
   docker compose up -d
   cd apps/api-gateway && pnpm run dev
   cd apps/user-service && pnpm run dev
   cd apps/token-service && pnpm run dev
   ```

2. Start webapp:

   ```bash
   cd apps/webapp
   pnpm run dev
   ```

3. Visit http://localhost:3001

### Testing Authentication

1. **Register**: Go to http://localhost:3001/auth/signup
2. **Sign In**: Go to http://localhost:3001/auth/signin
3. **Dashboard**: Protected route at http://localhost:3001/dashboard
4. **Profile**: Protected route at http://localhost:3001/profile

### API Gateway Swagger

View all available endpoints at: http://localhost:3000/api/docs

## Security Notes

- JWT tokens are stored in NextAuth session (HTTP-only cookie)
- Access tokens are passed to API Gateway in Authorization header
- CORS is handled by API Gateway
- Password validation enforced by API Gateway (8+ chars, uppercase, lowercase, number, special char)
- Email verification available but not required for login

## Future Enhancements

- [ ] Add email verification UI flow
- [ ] Add forgot password UI flow
- [ ] Add change password UI
- [ ] Implement refresh token rotation
- [ ] Add OAuth providers (GitHub, Google, etc.)
- [ ] Add user profile editing
- [ ] Add avatar upload
