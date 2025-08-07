# API Gateway

This is the API Gateway service for the Task Management system, built with NestJS.

## Features

- **Authentication**: User login and registration endpoints
- **Swagger Documentation**: Comprehensive API documentation
- **Microservice Communication**: Communicates with auth-service and user-service
- **Input Validation**: Request validation using class-validator
- **Error Handling**: Proper HTTP status codes and error responses

## API Documentation

The API is fully documented with Swagger/OpenAPI. When the service is running, you can access the interactive documentation at:

```
http://localhost:3000/api
```

### Authentication Endpoints

#### POST /api/auth/login

Authenticate a user with email and password.

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "john@example.com",
    "name": "John Doe",
    "avatarUrl": "https://example.com/avatar.jpg",
    "isActive": true,
    "isEmailVerified": false,
    "lastLoginAt": "2024-01-01T00:00:00Z",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

#### POST /api/auth/register

Register a new user account.

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:** Same as login endpoint

**Error Responses:**

- `400 Bad Request`: Invalid input data
- `409 Conflict`: User with this email already exists
- `500 Internal Server Error`: Server error

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

- `AUTH_SERVICE_URL`: URL for the auth microservice
- `USER_SERVICE_URL`: URL for the user microservice
- `JWT_SECRET`: Secret key for JWT token generation

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

1. **Auth Service**: Token generation and validation
2. **User Service**: User management operations

All communication is handled via TCP microservices using NestJS ClientProxy.
