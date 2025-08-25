# Auth Service

JWT token generation and validation microservice for the Task Management system, built with NestJS.

## Features

- **JWT Token Generation**: Create secure JWT tokens from user data
- **JWT Token Validation**: Verify and decode JWT tokens
- **TCP Microservice**: Communicates via NestJS microservice patterns
- **Type Safety**: Full TypeScript support with shared types
- **Security**: Configurable JWT secret and expiration

## Microservice API

This service operates as a TCP microservice and communicates via message patterns.

### Message Patterns

#### `auth.generateToken`
Generates a JWT token from user data.

**Input:**
```typescript
{
  id: string;
  email: string;
  name: string;
}
```

**Output:**
```typescript
string // JWT token
```

**Example:**
```typescript
// Input
{
  id: "123e4567-e89b-12d3-a456-426614174000",
  email: "john@example.com",
  name: "John Doe"
}

// Output
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyM2U0NTY3LWU4OWItMTJkMy1hNDU2LTQyNjYxNDE3NDAwMCIsImVtYWlsIjoiam9obkBleGFtcGxlLmNvbSIsIm5hbWUiOiJKb2huIERvZSIsImlhdCI6MTcwNDA2NzIwMCwiZXhwIjoxNzA0MDcwODAwfQ.signature"
```

#### `auth.validateToken`
Validates and decodes a JWT token.

**Input:**
```typescript
string // JWT token
```

**Output:**
```typescript
{
  id: string;
  email: string;
  name: string;
  iat: number;
  exp: number;
} | null
```

**Example:**
```typescript
// Input
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

// Output (valid token)
{
  id: "123e4567-e89b-12d3-a456-426614174000",
  email: "john@example.com",
  name: "John Doe",
  iat: 1704067200,
  exp: 1704070800
}

// Output (invalid token)
null
```

## Configuration

### Environment Variables

```bash
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters

# Service Configuration
AUTH_SERVICE_PORT=3002

# Development
NODE_ENV=development
```

### JWT Token Settings

- **Algorithm**: HS256
- **Expiration**: 1 hour (3600 seconds)
- **Secret**: Configurable via `JWT_SECRET` environment variable

## Development

### Installation

```bash
npm install
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
JWT_SECRET=your-secret-key AUTH_SERVICE_PORT=3002 npm run start:dev
```

## Integration

### From API Gateway

```typescript
import { ClientProxy } from '@nestjs/microservices';

// Generate token
const token = await firstValueFrom(
  this.authService.send<string>('auth.generateToken', {
    id: user.id,
    email: user.email,
    name: user.name
  })
);

// Validate token
const payload = await firstValueFrom(
  this.authService.send<object | null>('auth.validateToken', token)
);
```

### From Other Services

```typescript
import { ClientProxy } from '@nestjs/microservices';

// Check if token is valid
const isValid = await firstValueFrom(
  this.authService.send<object | null>('auth.validateToken', token)
);

if (isValid) {
  // Token is valid, proceed with request
  console.log('User:', isValid.email);
} else {
  // Token is invalid
  throw new UnauthorizedException('Invalid token');
}
```

## Security Features

- **Secret Key**: Uses configurable JWT secret for signing
- **Expiration**: Tokens automatically expire after 1 hour
- **Algorithm**: Uses HS256 algorithm for signing
- **Validation**: Comprehensive token validation with error handling

## Service Communication

This service communicates with:

- **API Gateway**: Provides tokens for authentication endpoints
- **Other Services**: Validates tokens for protected operations

**Communication Pattern:**
```
API Gateway → Auth Service (auth.generateToken) → JWT Token
Other Services → Auth Service (auth.validateToken) → Validation Result
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

## Production Deployment

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3002
CMD ["node", "dist/main.js"]
```

### Environment Variables for Production

```bash
JWT_SECRET=strong-random-secret-for-production
AUTH_SERVICE_PORT=3002
NODE_ENV=production
```

## Monitoring

The service provides basic health monitoring:

- **Startup Logs**: Service initialization and port binding
- **Error Handling**: Comprehensive error logging for token operations
- **Performance**: Lightweight token operations with minimal latency

## Architecture

```
┌─────────────────┐    TCP Messages    ┌─────────────────┐
│   API Gateway   │ ←→ (Message Patterns) │  Auth Service   │
└─────────────────┘                     └─────────────────┘
        ↑                                        ↑
   HTTP Requests                          JWT Operations
        ↓                                        ↓
  ┌─────────────┐                       ┌─────────────┐
  │   Clients   │                       │ JWT Tokens  │
  └─────────────┘                       └─────────────┘
```