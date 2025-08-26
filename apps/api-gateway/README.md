# API Gateway

This is the API Gateway service for the Task Management system, built with NestJS.

## Features

- **Complete Authentication Flow**: User registration, login, email verification, password reset
- **JWT Token Management**: Secure Bearer token authentication with auth guards
- **User Management**: Protected user CRUD operations
- **Swagger Documentation**: Comprehensive interactive API documentation
- **Microservice Communication**: TCP-based communication with token-service and user-service
- **Input Validation**: Request validation using class-validator with detailed error responses
- **Error Handling**: Proper HTTP status codes and structured error responses
- **Email Integration**: Email verification and password reset workflows

## API Documentation

The API is fully documented with Swagger/OpenAPI. When the service is running, you can access the interactive documentation at:

```
http://localhost:3000/api/docs
```

### Authentication Endpoints

#### POST /api/auth/register
Register a new user account with email, password, and name.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response (201 Created):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "john@example.com",
    "name": "John Doe",
    "avatarUrl": null,
    "isActive": true,
    "isEmailVerified": false,
    "lastLoginAt": null,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

#### POST /api/auth/login
Authenticate a user with email and password, returns JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK):** Same as register endpoint

#### GET /api/auth/me
Get current authenticated user information (requires Bearer token).

**Headers:**
```
Authorization: Bearer your-jwt-token-here
```

**Response (200 OK):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "john@example.com",
  "name": "John Doe",
  "avatarUrl": null,
  "isActive": true,
  "isEmailVerified": false
}
```

#### POST /api/auth/verify-email
Send email verification link to the current user (requires Bearer token).

**Headers:**
```
Authorization: Bearer your-jwt-token-here
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Verification email sent"
}
```

#### POST /api/auth/verify-email-token
Verify user email using the token sent to their email address.

**Request Body:**
```json
{
  "token": "email-verification-token-from-email"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

#### POST /api/auth/forgot-password
Request password reset via email.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "If an account with that email exists, a password reset link has been sent."
}
```

#### GET /api/auth/validate-forgot-password-token
Validate password reset token.

**Query Parameters:**
- `token`: The password reset token from email

**Response (200 OK):**
```json
{
  "success": true
}
```

#### POST /api/auth/reset-password
Reset password using token from email.

**Request Body:**
```json
{
  "token": "password-reset-token-from-email",
  "newPassword": "newSecurePassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

### User Management Endpoints

#### GET /api/users
Get all users (requires Bearer token).

**Headers:**
```
Authorization: Bearer your-jwt-token-here
```

**Response (200 OK):**
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "john@example.com",
    "name": "John Doe",
    "avatarUrl": null,
    "isActive": true,
    "isEmailVerified": true,
    "lastLoginAt": "2024-01-01T00:00:00Z",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

#### GET /api/users/:id
Get user by ID (requires Bearer token).

**Headers:**
```
Authorization: Bearer your-jwt-token-here
```

**Parameters:**
- `id`: User UUID

**Response (200 OK):** Single user object (same format as above)

### Error Responses

All endpoints return structured error responses:

- **400 Bad Request**: Invalid input data or validation errors
- **401 Unauthorized**: Missing or invalid JWT token
- **404 Not Found**: Resource not found
- **409 Conflict**: Duplicate data (e.g., email already exists)
- **500 Internal Server Error**: Server error

**Error Response Format:**
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

## Development

### Installation

```bash
npm install
```

### Running the app

```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

### Test

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```

## Environment Variables

Make sure to configure the following environment variables:

```bash
# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters

# Services (TCP Microservices)
API_GATEWAY_PORT=3000
USER_SERVICE_PORT=3001
AUTH_SERVICE_PORT=3002

# Database (required by shared packages)
DATABASE_URL=postgresql://postgres:password@localhost:5432/task_management

# Email Service (for verification and password reset)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-app-password

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:3000

# Development
NODE_ENV=development
```

## Swagger Documentation Features

The API documentation includes:

- ✅ **Comprehensive endpoint descriptions**
- ✅ **Request/response schemas**
- ✅ **Error response documentation**
- ✅ **Example values for all fields**
- ✅ **Proper HTTP status codes**
- ✅ **Input validation rules**
- ✅ **Interactive testing interface**

## Microservice Communication

This gateway communicates with:

1. **Token Service** (Port 3002): 
   - JWT token generation (`token.generateToken`)
   - JWT token validation (`token.validateToken`)

2. **User Service** (Port 3001):
   - User CRUD operations (`user.create`, `user.findById`, `user.findAll`)
   - Authentication (`user.findUserByEmailAndPassword`)
   - Email verification (`user.sendVerifyEmailUser`, `user.validateEmailVerificationToken`)
   - Password reset (`user.forgotPassword`, `user.validateForgotPasswordToken`, `user.reset-password`)

**Message Patterns:**
- Authentication: `token.generateToken`, `token.validateToken`
- User Management: `user.create`, `user.findById`, `user.findAll`, `user.findUserByEmail`
- Email Verification: `user.sendVerifyEmailUser`, `user.validateEmailVerificationToken`
- Password Reset: `user.forgotPassword`, `user.validateForgotPasswordToken`, `user.reset-password`

All communication is handled via TCP microservices using NestJS ClientProxy with message patterns.
