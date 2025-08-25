# User Service

Complete user management microservice for the Task Management system, built with NestJS.

## Features

- **User CRUD Operations**: Create, read, update, delete users
- **Authentication**: Password hashing and verification
- **Email Verification**: Secure token-based email verification system
- **Password Reset**: Complete forgot password flow with email integration
- **Security**: bcrypt password hashing, secure token generation
- **TCP Microservice**: Communicates via NestJS microservice patterns
- **Database Integration**: PostgreSQL with Drizzle ORM
- **Email Service**: SMTP integration with nodemailer
- **Type Safety**: Full TypeScript support with shared types

## Database Schema

The service manages these database tables:

### Users Table
```sql
CREATE TABLE "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" varchar(255) UNIQUE NOT NULL,
  "password_hash" varchar(255) NOT NULL,
  "name" varchar(255) NOT NULL,
  "avatar_url" varchar(500),
  "is_active" boolean DEFAULT true NOT NULL,
  "is_email_verified" boolean DEFAULT false NOT NULL,
  "last_login_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
```

### Email Verification Tokens Table
```sql
CREATE TABLE "email_verification_tokens" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "email" varchar(255) NOT NULL,
  "token" varchar(255) UNIQUE NOT NULL,
  "type" varchar(50) DEFAULT 'email_verification' NOT NULL,
  "expires_at" timestamp NOT NULL,
  "used_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL
);
```

## Microservice API

This service operates as a TCP microservice and communicates via message patterns.

### Message Patterns

#### User CRUD Operations

##### `user.create`
Creates a new user with hashed password.

**Input:**
```typescript
{
  email: string;
  password: string;
  name: string;
}
```

**Output:**
```typescript
{
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
```

##### `user.findById`
Find user by ID (password hash excluded for security).

**Input:** `string` (user ID)

**Output:** `User | null`

##### `user.findAll`
Get all users (password hashes excluded).

**Input:** `{}` (empty object)

**Output:** `User[]`

##### `user.findUserByEmail`
Find user by email address.

**Input:** `string` (email)

**Output:** `User | null`

#### Authentication Operations

##### `user.findUserByEmailAndPassword`
Authenticate user with email and password.

**Input:**
```typescript
{
  email: string;
  password: string;
}
```

**Output:** `User | null`

##### `user.updateLastLoginAt`
Update user's last login timestamp.

**Input:** `string` (user ID)

**Output:** `User | null`

#### Email Verification Operations

##### `user.sendVerifyEmailUser`
Send email verification link to user.

**Input:**
```typescript
{
  userId: string;
}
```

**Output:**
```typescript
{
  success: boolean;
  error?: string;
}
```

**Email Content:**
- Subject: "Verify your email"
- Contains link: `{FRONTEND_URL}/verify-email/{token}`
- Token expires in 24 hours

##### `user.validateEmailVerificationToken`
Verify email using verification token.

**Input:**
```typescript
{
  token: string;
}
```

**Output:**
```typescript
{
  success: boolean;
  error?: string;
  userId?: string;
}
```

#### Password Reset Operations

##### `user.forgotPassword`
Send password reset email to user.

**Input:**
```typescript
{
  email: string;
}
```

**Output:**
```typescript
{
  success: boolean;
  error?: string;
}
```

**Email Content:**
- Subject: "Reset your password"
- Contains link: `{FRONTEND_URL}/reset-password/{token}`
- Token expires in 30 minutes

##### `user.validateForgotPasswordToken`
Validate password reset token.

**Input:**
```typescript
{
  token: string;
}
```

**Output:**
```typescript
{
  success: boolean;
  error?: string;
}
```

##### `user.reset-password`
Reset user password using token.

**Input:**
```typescript
{
  token: string;
  newPassword: string;
}
```

**Output:**
```typescript
{
  success: boolean;
  error?: string;
}
```

## Configuration

### Environment Variables

```bash
# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/task_management

# Email Configuration (SMTP)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-app-password

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:3000

# Service Configuration
USER_SERVICE_PORT=3001

# Development
NODE_ENV=development
```

### Email Service Setup

For Gmail SMTP:
1. Enable 2-factor authentication on your Google account
2. Generate an App Password (Security → App passwords)
3. Use the App Password as `MAIL_PASS`

For other SMTP providers, update `MAIL_HOST` and `MAIL_PORT` accordingly.

## Development

### Installation

```bash
npm install
```

### Database Setup

```bash
# Ensure PostgreSQL is running and database exists
createdb task_management

# Run migrations
cd ../../packages/database
npm run migrate
```

### Running the service

```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

### Running with environment variables

```bash
USER_SERVICE_PORT=3001 \
DATABASE_URL=postgresql://postgres:password@localhost:5432/task_management \
MAIL_HOST=smtp.gmail.com \
MAIL_PORT=587 \
MAIL_USER=your-email@gmail.com \
MAIL_PASS=your-app-password \
FRONTEND_URL=http://localhost:3000 \
npm run start:dev
```

## Security Features

### Password Security
- **bcrypt Hashing**: Passwords are hashed using bcrypt with salt rounds
- **No Plain Text**: Passwords are never stored in plain text
- **Sanitized Responses**: Password hashes are excluded from API responses

### Token Security
- **Secure Generation**: Cryptographically secure random tokens
- **Time-Limited**: Email verification tokens expire in 24 hours, reset tokens in 30 minutes
- **Single Use**: Tokens are marked as used after successful verification
- **Database Storage**: Tokens are stored securely in the database

### Email Security
- **Generic Responses**: Forgot password doesn't reveal if email exists
- **Rate Limiting Ready**: Designed to work with rate limiting middleware
- **Secure Links**: Email links include frontend URL with secure tokens

## Integration Examples

### From API Gateway

```typescript
import { ClientProxy } from '@nestjs/microservices';

// Create user
const user = await firstValueFrom(
  this.userService.send('user.create', {
    email: 'user@example.com',
    password: 'securePassword123',
    name: 'John Doe'
  })
);

// Authenticate user
const authenticatedUser = await firstValueFrom(
  this.userService.send('user.findUserByEmailAndPassword', {
    email: 'user@example.com',
    password: 'securePassword123'
  })
);

// Send verification email
const result = await firstValueFrom(
  this.userService.send('user.sendVerifyEmailUser', {
    userId: user.id
  })
);
```

### From Other Services

```typescript
// Validate user exists
const validation = await firstValueFrom(
  this.userService.send('user.validate', userId)
);

if (validation.exists) {
  // User exists, proceed with operation
} else {
  throw new NotFoundException('User not found');
}
```

## Error Handling

The service provides comprehensive error handling:

- **Validation Errors**: Invalid input data
- **Database Errors**: Connection issues, constraint violations
- **Email Errors**: SMTP failures, invalid configurations
- **Token Errors**: Expired, invalid, or already used tokens
- **Authentication Errors**: Invalid credentials

All errors are properly logged and return structured error responses.

## Email Templates

### Email Verification
```html
<p>Please verify your email by clicking the link below:</p>
<a href="{FRONTEND_URL}/verify-email/{token}">
  {FRONTEND_URL}/verify-email/{token}
</a>
```

### Password Reset
```html
<p>Please reset your password by clicking the link below:</p>
<a href="{FRONTEND_URL}/reset-password/{token}">
  {FRONTEND_URL}/reset-password/{token}
</a>
```

## Testing

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```

## Service Dependencies

This service depends on:

- **Database Package**: `@task-mgmt/database` for schema and types
- **Mail Package**: `@task-mgmt/mail` for email functionality
- **PostgreSQL**: Database for data persistence
- **SMTP Server**: For sending emails

## Service Communication

This service communicates with:

- **API Gateway**: Provides user management and authentication
- **Auth Service**: Receives user data for token generation
- **Database**: Stores user data and verification tokens
- **Email Server**: Sends verification and reset emails

**Communication Pattern:**
```
API Gateway → User Service → Database
User Service → Mail Service → SMTP Server
```

## Production Deployment

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["node", "dist/main.js"]
```

### Environment Variables for Production

```bash
USER_SERVICE_PORT=3001
DATABASE_URL=postgresql://user:password@db:5432/task_management
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USER=apikey
MAIL_PASS=your-sendgrid-api-key
FRONTEND_URL=https://yourdomain.com
NODE_ENV=production
```

## Monitoring

The service provides monitoring capabilities:

- **Health Checks**: Database connection verification
- **Logging**: Comprehensive logging for all operations
- **Error Tracking**: Detailed error logs with stack traces
- **Performance**: Optimized database queries and email operations

## Architecture

```
┌─────────────────┐    TCP Messages    ┌─────────────────┐
│   API Gateway   │ ←→ (Message Patterns) │  User Service   │
└─────────────────┘                     └─────────┬───────┘
                                                  │
                                                  ▼
┌─────────────────┐    SQL Queries     ┌─────────────────┐
│   PostgreSQL    │ ←──────────────── │  Database ORM   │
│   Database      │                    │   (Drizzle)     │
└─────────────────┘                    └─────────────────┘
                                                  │
                                                  ▼
┌─────────────────┐    SMTP Protocol   ┌─────────────────┐
│   SMTP Server   │ ←──────────────── │  Mail Service   │
│   (Gmail, etc)  │                    │  (Nodemailer)   │
└─────────────────┘                    └─────────────────┘
```

## Troubleshooting

### Common Issues

**Database Connection Errors:**
- Verify `DATABASE_URL` is correct
- Ensure PostgreSQL is running
- Check database exists and migrations are applied

**Email Not Sending:**
- Verify SMTP credentials are correct
- Check firewall settings for SMTP port
- Ensure `FRONTEND_URL` is accessible

**Token Verification Failing:**
- Check token hasn't expired
- Verify token wasn't already used
- Ensure database connection is working

**Authentication Issues:**
- Verify passwords are being hashed correctly
- Check user exists and is active
- Ensure email verification status if required