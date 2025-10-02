# Error Handling Documentation

## Overview

The authentication system properly handles errors according to NextAuth.js best practices, where the `authorize` function returns `null` for failed authentication attempts.

## How It Works

### NextAuth Credentials Provider

According to [NextAuth.js documentation](https://next-auth.js.org/configuration/providers/credentials#options), the `authorize` function should:

- **Return user object** on successful authentication
- **Return `null`** on failed authentication
- **Not throw errors** for authentication failures

When `authorize` returns `null`, NextAuth automatically returns a `"CredentialsSignin"` error.

### Implementation

**File**: `src/server/auth/config.ts`

```typescript
async authorize(credentials) {
  // Validate credentials exist
  if (!credentials?.email || !credentials?.password) {
    return null  // Returns null instead of throwing error
  }

  try {
    const response = await apiClient.login(
      credentials.email as string,
      credentials.password as string,
    )

    if (!response.token || !response.user) {
      return null  // Invalid credentials
    }

    // Return user with access token
    return {
      ...response.user,
      accessToken: response.token,
    }
  } catch (error) {
    console.error('Login error:', error)
    return null  // Any error returns null
  }
}
```

## Error Messages

### NextAuth Error Codes

When `authorize` returns `null`, NextAuth returns:
- Error code: `"CredentialsSignin"`
- This is the standard error for invalid credentials

### Client-Side Error Handling

**File**: `src/app/auth/signin/page.tsx`

The sign-in page handles various error scenarios:

```typescript
if (result?.error) {
  const errorMessage = result.error
  
  if (errorMessage === 'CredentialsSignin') {
    // Default NextAuth error when authorize returns null
    setError('Invalid email or password. Please check your credentials and try again.')
  } else if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
    // Network/connection errors
    setError('Unable to connect to the server. Please check your connection and try again.')
  } else if (errorMessage.includes('Configuration')) {
    // Configuration errors
    setError('Authentication service error. Please try again later.')
  } else {
    // Generic fallback
    setError(errorMessage || 'Sign in failed. Please try again.')
  }
}
```

## Error Scenarios

### 1. Invalid Email or Password

**Trigger**: User enters wrong credentials
**Backend Response**: 400 Bad Request from API Gateway
**Flow**:
1. `apiClient.login()` throws error
2. `authorize` catches error and returns `null`
3. NextAuth returns `"CredentialsSignin"`
4. UI displays: "Invalid email or password. Please check your credentials and try again."

### 2. Missing Credentials

**Trigger**: Email or password is empty (should be caught by client validation)
**Flow**:
1. `authorize` checks credentials
2. Returns `null` if missing
3. NextAuth returns `"CredentialsSignin"`
4. UI displays: "Invalid email or password..."

### 3. Network Error

**Trigger**: API Gateway is not running or network issue
**Flow**:
1. `apiClient.login()` throws fetch error
2. `authorize` catches error and returns `null`
3. NextAuth returns `"CredentialsSignin"`
4. UI checks error message for "fetch" or "network"
5. UI displays: "Unable to connect to the server..."

### 4. Server Error

**Trigger**: API Gateway returns 500
**Flow**:
1. `apiClient.login()` throws error
2. `authorize` returns `null`
3. NextAuth returns `"CredentialsSignin"`
4. UI displays: "Invalid email or password..." (generic message for security)

## Client-Side Validation

Before calling the API, client-side validation catches:

1. **Empty fields**: "Please enter both email and password"
2. **Invalid email format**: "Please enter a valid email address"
3. **Form cleared on input**: Error message clears when user types

## Security Considerations

### Why Return Null Instead of Detailed Errors?

1. **Security**: Prevents user enumeration attacks
   - Don't reveal if email exists in database
   - Generic "invalid credentials" message

2. **Consistency**: Same error for all auth failures
   - Wrong password
   - Non-existent user
   - Account locked/disabled

3. **Best Practice**: Follows NextAuth.js conventions
   - Standard error handling pattern
   - Compatible with built-in features

### What Gets Logged?

- **Server-side**: Full error details in console
  ```typescript
  console.error('Login error:', error)
  ```
- **Client-side**: Generic messages only
- **Never expose**: Database errors, internal state

## Error Display UI

### Visual Design

Errors are displayed with:
- ❌ Red background (`bg-red-50`)
- 🚨 Error icon (SVG)
- Bold header: "Sign in failed"
- Detailed message below

### User Experience

1. **Clear on input**: Error disappears when user types
2. **Loading state**: Button disabled with "Signing in..." text
3. **Focus preservation**: User stays on form to retry
4. **Helpful messages**: Actionable guidance when possible

## Testing Error Handling

### 1. Test Invalid Credentials

```bash
# Sign in with wrong password
Email: test@example.com
Password: WrongPassword123!

Expected: "Invalid email or password. Please check your credentials and try again."
```

### 2. Test Network Error

```bash
# Stop API Gateway
# Try to sign in

Expected: "Invalid email or password..." (caught as CredentialsSignin)
```

### 3. Test Empty Fields

```bash
# Leave fields empty and submit

Expected: Client validation catches it: "Please enter both email and password"
```

### 4. Test Invalid Email Format

```bash
Email: notanemail
Password: Test123!

Expected: "Please enter a valid email address"
```

## API Gateway Error Responses

The API Gateway returns these errors (all result in `null` from authorize):

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Invalid email or password"
}
```

### 409 Conflict (Signup)
```json
{
  "statusCode": 409,
  "message": "User already exists"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

All of these are handled gracefully by returning `null` and showing generic messages to the user.

## Signup Error Handling

Similar pattern in `src/app/auth/signup/page.tsx`:

- Validates password requirements client-side
- Catches "User already exists" error
- Provides helpful guidance for password requirements
- Auto-signs in after successful registration

## Summary

✅ **Correct Implementation**:
- `authorize` returns `null` for all failures
- NextAuth handles error codes automatically
- UI provides user-friendly messages
- Security is maintained with generic messages

❌ **Avoid**:
- Throwing errors from `authorize` for auth failures
- Exposing detailed error messages to users
- Different messages that reveal user existence
- Skipping client-side validation

## References

- [NextAuth.js Credentials Provider](https://next-auth.js.org/configuration/providers/credentials)
- [NextAuth.js Error Handling](https://next-auth.js.org/configuration/pages#error-codes)
- [OWASP Authentication Guidelines](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
