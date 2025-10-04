# Form Validation with React Hook Form and Zod

This document describes the implementation of form validation using `react-hook-form` and `zod` in the webapp.

## Overview

We use a combination of:

- **React Hook Form**: For form state management and validation
- **Zod**: For schema-based validation
- **@hookform/resolvers**: To integrate Zod with React Hook Form

## Installation

```bash
pnpm add react-hook-form zod @hookform/resolvers
```

## Validation Schemas

All validation schemas are centralized in `src/lib/validations/auth.ts`:

### Password Schema

```typescript
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(/\d/, 'Password must contain at least one number')
```

**Requirements:**

- Minimum 8 characters
- At least one number

### Sign Up Schema

```typescript
export const signUpSchema = z
  .object({
    name: z.string().min(1, 'Please enter your name').trim(),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address'),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
```

**Features:**

- Type-safe form data with `SignUpFormData` type
- Custom refinement for password confirmation
- Automatic trimming of name field

### Sign In Schema

```typescript
export const signInSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})
```

## Usage in Components

### Basic Setup

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signUpSchema, type SignUpFormData } from '@/lib/validations/auth'

export default function SignUpPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    mode: 'onBlur', // Validate on blur
  })

  const onSubmit = async (data: SignUpFormData) => {
    // Form data is already validated and type-safe
    console.log(data)
  }
}
```

### Form Input Registration

```tsx
;<input
  id="email"
  type="email"
  autoComplete="email"
  {...register('email', {
    onChange: () => setError(''), // Clear server errors
  })}
  className={`... ${errors.email ? 'ring-red-500' : 'ring-gray-300'}`}
  placeholder="Email address"
/>
{
  errors.email && (
    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
  )
}
```

### Form Submission

```tsx
<form onSubmit={handleSubmit(onSubmit)}>{/* form fields */}</form>
```

## Benefits

### Type Safety

- Full TypeScript support with inferred types
- Autocomplete for form fields
- Compile-time error checking

### Validation

- Client-side validation before submission
- Consistent validation rules across frontend and backend
- Custom error messages per field

### Developer Experience

- Less boilerplate code compared to manual validation
- Centralized validation logic
- Easy to test and maintain

### User Experience

- Real-time validation feedback
- Clear, specific error messages
- Visual indicators for invalid fields (red border)
- Validation on blur (not on every keystroke)

## Validation Modes

React Hook Form supports different validation modes:

- `onSubmit` (default): Validate on form submission
- `onBlur`: Validate when input loses focus (we use this)
- `onChange`: Validate on every keystroke
- `onTouched`: Validate on first blur, then on change
- `all`: Validate on both blur and change

We chose `onBlur` for better UX - users aren't interrupted while typing, but get immediate feedback when they move to the next field.

## Error Handling

### Client-Side Validation Errors

Automatically displayed via `errors` object from `formState`.

### Server-Side Errors

Handled separately with a `useState` hook:

```tsx
const [error, setError] = useState('')

// Clear server error when user starts typing
{...register('email', {
  onChange: () => setError(''),
})}
```

## Path Aliases

The project uses `@/*` path alias for cleaner imports:

```typescript
import { signUpSchema } from '@/lib/validations/auth'
```

Configured in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "~/*": ["./src/*"],
      "@/*": ["./src/*"]
    }
  }
}
```

## Files Modified

1. **`src/lib/validations/auth.ts`** - Validation schemas (new file)
2. **`src/app/auth/signin/page.tsx`** - Sign in form with React Hook Form
3. **`src/app/auth/signup/page.tsx`** - Sign up form with React Hook Form
4. **`tsconfig.json`** - Added `@/*` path alias
5. **`package.json`** - Added dependencies

## Backend Consistency

The backend password validation has been updated to match the frontend:

**Location:** `packages/shared-utils/src/validation/password.validators.ts`

```typescript
export function IsPasswordStrong(validationOptions?: ValidationOptions) {
  return IsStrongPassword(
    {
      requireUppercase: false,
      requireLowercase: false,
      requireNumbers: true,
      requireSpecialChars: false,
    },
    validationOptions,
  )
}
```

This ensures frontend and backend have consistent validation rules:

- Minimum 8 characters
- Maximum 100 characters
- At least one number

## Testing

To test the validation:

1. **Sign Up Page** (`/auth/signup`):
   - Try submitting with empty fields → See required field errors
   - Enter short password (< 8 chars) → See length error
   - Enter password without number → See number requirement error
   - Enter mismatched passwords → See confirmation error
   - Enter invalid email → See email format error

2. **Sign In Page** (`/auth/signin`):
   - Try submitting with empty fields → See required field errors
   - Enter invalid email format → See email format error

All validation happens before the form is submitted to the server, providing instant feedback to users.

## Future Enhancements

Potential improvements:

- Add password strength indicator
- Add debounced email availability check
- Add custom validation for specific business rules
- Add internationalization (i18n) for error messages
- Add accessibility improvements (ARIA labels)

## References

- [React Hook Form Documentation](https://react-hook-form.com/)
- [Zod Documentation](https://zod.dev/)
- [@hookform/resolvers](https://github.com/react-hook-form/resolvers)
