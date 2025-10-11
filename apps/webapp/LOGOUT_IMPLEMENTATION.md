# Logout Button Implementation

## Overview

A reusable logout button component has been added that properly clears NextAuth session cookies and redirects users to the sign-in page.

## Components

### LogoutButton Component

**Location**: `src/components/logout-button.tsx`

A client-side component that uses `next-auth/react` to handle sign out functionality.

**Features**:

- Clears all NextAuth session cookies
- Shows loading state during sign out
- Redirects to sign-in page after logout
- Supports multiple style variants (primary, danger, secondary)
- Customizable className prop
- Disabled state while processing

**Usage**:

```tsx
import { LogoutButton } from '~/components/logout-button'

// Default (danger variant - red button)
<LogoutButton />

// Custom variant
<LogoutButton variant="secondary" />

// Custom text
<LogoutButton>Log Out</LogoutButton>

// Custom styling
<LogoutButton className="px-6 py-3 text-lg" />
```

### SessionProvider Component

**Location**: `src/components/session-provider.tsx`

Wraps the entire application to provide NextAuth session context to client components.

**Implementation**:

```tsx
import { SessionProvider } from '~/components/session-provider'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
```

## Updated Pages

### Dashboard (`/dashboard`)

- Added header navigation bar with logout button
- Shows user email in header
- Links to home and profile pages
- Logout button in top right corner

### Profile (`/profile`)

- Added header navigation bar with logout button
- Replaced server action form with LogoutButton component
- Consistent navigation across protected pages

### Home (`/`)

- Added logout button for authenticated users
- Shows next to "Dashboard" and "Profile" buttons
- Uses secondary variant to match design

## How It Works

1. **User clicks logout button**
   - LogoutButton component sets loading state
   - Calls `signOut()` from next-auth/react

2. **NextAuth processes signout**
   - Clears all session cookies (authjs.session-token, etc.)
   - Clears JWT from HTTP-only cookies
   - Invalidates the session

3. **Redirect to sign-in**
   - User redirected to `/auth/signin`
   - Session is fully cleared
   - Protected routes will redirect to signin if accessed

## Cookie Clearing

The logout process clears these cookies:

- `authjs.session-token` (or similar NextAuth session cookie)
- `authjs.callback-url` (if present)
- `authjs.csrf-token` (if present)

All cookies are cleared automatically by NextAuth's `signOut()` function with proper security headers.

## Security Notes

- ✅ HTTP-only cookies are properly cleared
- ✅ No session data remains in browser
- ✅ Access tokens are invalidated
- ✅ Protected routes redirect after logout
- ✅ Loading state prevents double-clicks
- ✅ Error handling for failed logouts

## Testing

1. **Test logout from dashboard**:

   ```
   1. Sign in
   2. Go to /dashboard
   3. Click "Sign Out" in header
   4. Verify redirect to /auth/signin
   5. Try to access /dashboard - should redirect to signin
   ```

2. **Test logout from profile**:

   ```
   1. Sign in
   2. Go to /profile
   3. Click "Sign Out" button
   4. Verify redirect to /auth/signin
   5. Verify cookies are cleared (check DevTools)
   ```

3. **Test logout from home**:

   ```
   1. Sign in
   2. Go to / (home)
   3. Click "Sign Out" button
   4. Verify redirect to /auth/signin
   5. Home page should now show "Sign In" and "Sign Up"
   ```

4. **Verify cookies cleared**:
   ```
   1. Open DevTools → Application → Cookies
   2. Before logout: see authjs.session-token
   3. Click logout
   4. After logout: cookie should be removed
   ```

## Props Reference

### LogoutButton Props

| Prop      | Type                                 | Default    | Description            |
| --------- | ------------------------------------ | ---------- | ---------------------- |
| variant   | 'primary' \| 'danger' \| 'secondary' | 'danger'   | Button color style     |
| className | string                               | undefined  | Additional CSS classes |
| children  | ReactNode                            | 'Sign Out' | Button text content    |

### Variant Styles

- **primary**: Indigo background (brand color)
- **danger**: Red background (warning/logout action)
- **secondary**: Gray background (neutral action)

## File Changes Summary

✅ Created:

- `src/components/logout-button.tsx` - Reusable logout button
- `src/components/session-provider.tsx` - NextAuth session provider

✅ Modified:

- `src/app/layout.tsx` - Added SessionProvider wrapper
- `src/app/dashboard/page.tsx` - Added header with logout button
- `src/app/profile/page.tsx` - Added header, replaced form with LogoutButton
- `src/app/page.tsx` - Added logout button for authenticated users
