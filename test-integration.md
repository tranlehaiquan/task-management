# Testing Task Management System - Complete Integration Guide

## 🚀 How to Run the Complete System

### Prerequisites

1. **PostgreSQL Database** running on localhost:5432
2. **SMTP Server** access (Gmail recommended for testing)
3. **Node.js 18+** and **pnpm 8+**
4. **Environment Variables** configured

### 1. Database Setup

```bash
# Create PostgreSQL database
createdb task_management

# Run migrations
cd packages/database
pnpm run migrate
```

### 2. Start Auth Service (TCP Microservice)

```bash
cd apps/auth-service
AUTH_SERVICE_PORT=3002 JWT_SECRET=your-super-secret-jwt-key pnpm run start:dev
```

This starts the auth service as a TCP microservice on port 3002.

### 3. Start User Service (TCP Microservice)

```bash
cd apps/user-service
USER_SERVICE_PORT=3001 \
DATABASE_URL=postgresql://postgres:password@localhost:5432/task_management \
MAIL_HOST=smtp.gmail.com \
MAIL_PORT=587 \
MAIL_USER=your-email@gmail.com \
MAIL_PASS=your-app-password \
FRONTEND_URL=http://localhost:3000 \
pnpm run start:dev
```

This starts the user service as a TCP microservice on port 3001.

### 4. Start API Gateway

```bash
cd apps/api-gateway
API_GATEWAY_PORT=3000 \
USER_SERVICE_PORT=3001 \
AUTH_SERVICE_PORT=3002 \
JWT_SECRET=your-super-secret-jwt-key \
pnpm run start:dev
```

This starts the API Gateway on port 3000, which will communicate with both services.

## 📚 API Documentation

Once both services are running, you can access the **Swagger documentation** at:
**http://localhost:3000/api/docs**

The Swagger UI provides:

- ✅ **Interactive API testing**
- ✅ **Request/Response examples**
- ✅ **Data validation schemas**
- ✅ **Authentication support (JWT ready)**
- ✅ **Complete API documentation**

## 🧪 Complete Testing Guide

### Using Swagger UI (Recommended)

1. Open http://localhost:3000/api/docs
2. Explore all available endpoints (Authentication + User Management)
3. Click "Try it out" on any endpoint
4. Fill in the example data and execute
5. Test protected endpoints using the "Authorize" button with JWT token

### Step-by-Step Testing Flow

#### 1. User Registration

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "securePassword123",
    "name": "Test User"
  }'
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "email": "test@example.com",
    "name": "Test User",
    "isEmailVerified": false
  }
}
```

#### 2. User Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "securePassword123"
  }'
```

#### 3. Get Current User (Protected)

```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

#### 4. Send Email Verification (Protected)

```bash
curl -X POST http://localhost:3000/api/auth/verify-email \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

#### 5. Verify Email with Token

```bash
curl -X POST http://localhost:3000/api/auth/verify-email-token \
  -H "Content-Type: application/json" \
  -d '{
    "token": "TOKEN_FROM_EMAIL"
  }'
```

#### 6. Password Reset Flow

**Request Password Reset:**
```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

**Validate Reset Token:**
```bash
curl -X GET "http://localhost:3000/api/auth/validate-forgot-password-token?token=TOKEN_FROM_EMAIL"
```

**Reset Password:**
```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "TOKEN_FROM_EMAIL",
    "newPassword": "newSecurePassword123"
  }'
```

#### 7. User Management (Protected)

**Get All Users:**
```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

**Get User by ID:**
```bash
curl -X GET http://localhost:3000/api/users/USER_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## 🎯 What's Working

✅ **Complete Authentication System** - Registration, login, JWT tokens  
✅ **Email Verification** - Secure token-based email verification  
✅ **Password Reset** - Complete forgot password flow with email  
✅ **API Gateway** - Single entry point with comprehensive routing  
✅ **Auth Service** - JWT token generation and validation microservice  
✅ **User Service** - Complete user management microservice  
✅ **TCP Communication** - Message-based microservice communication  
✅ **Database Integration** - PostgreSQL with Drizzle ORM  
✅ **Email Service** - SMTP integration with nodemailer  
✅ **Type Safety** - Full TypeScript support across all services  
✅ **Error Handling** - Structured error responses with proper HTTP codes  
✅ **Input Validation** - Class-validator with detailed error messages  
✅ **Security** - Password hashing, JWT tokens, secure token handling  
✅ **Swagger Documentation** - Interactive API testing with auth support  
✅ **Protected Endpoints** - JWT-based authentication guards

## 🔄 Service Communication Flow

```
Client Request → API Gateway → TCP Message → User Service → Database
      ↓              ↓             ↓             ↓           ↓
   HTTP REST    → Proxy Layer → Message Queue → Business Logic → Data
```

## 🛠️ Message Patterns Available

### Auth Service (Port 3002)
- `auth.generateToken` - Generate JWT token from user data
- `auth.validateToken` - Validate and decode JWT token

### User Service (Port 3001)
- `user.create` - Create a new user with hashed password
- `user.findById` - Find user by ID (sanitized, no password)
- `user.findAll` - Get all users (sanitized, no passwords)
- `user.findUserByEmail` - Find user by email address
- `user.findUserByEmailAndPassword` - Authenticate user login
- `user.updateLastLoginAt` - Update user's last login timestamp
- `user.sendVerifyEmailUser` - Send email verification link
- `user.validateEmailVerificationToken` - Verify email with token
- `user.forgotPassword` - Send password reset email
- `user.validateForgotPasswordToken` - Validate password reset token
- `user.reset-password` - Reset user password with token

## 🔧 Complete Environment Variables

### Required for API Gateway
```bash
API_GATEWAY_PORT=3000
USER_SERVICE_PORT=3001
AUTH_SERVICE_PORT=3002
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters
```

### Required for Auth Service
```bash
AUTH_SERVICE_PORT=3002
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters
```

### Required for User Service
```bash
USER_SERVICE_PORT=3001
DATABASE_URL=postgresql://postgres:password@localhost:5432/task_management
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-app-password
FRONTEND_URL=http://localhost:3000
```

### Gmail SMTP Setup
For testing with Gmail:
1. Enable 2-factor authentication on your Google account
2. Generate an App Password (not your regular password)
3. Use the App Password as `MAIL_PASS`

## 🎉 What's Next

The authentication and user management foundation is complete! Next development phases:

### Phase 2: Core Business Features
1. **Project Service** - CRUD operations, ownership, team management
2. **Task Service** - Task lifecycle, assignments, dependencies
3. **Time Tracking Service** - Work logging, timer functionality
4. **Notification Service** - Real-time notifications, activity feeds

### Phase 3: Frontend & Advanced Features
1. **React Frontend** - Modern web client with auth integration
2. **Real-time Features** - WebSocket integration for live updates
3. **File Attachments** - Document management for tasks/projects
4. **Advanced Search** - Full-text search across projects and tasks

### Phase 4: Production Ready
1. **Docker Compose** - Complete development environment
2. **CI/CD Pipeline** - Automated testing and deployment
3. **Monitoring** - Health checks, logging, metrics
4. **Performance** - Caching, optimization, load testing

The microservice architecture is now proven and ready for rapid feature development! 🚀
