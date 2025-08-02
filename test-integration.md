# Testing API Gateway with User Service Integration

## 🚀 How to Run the Services

### 1. Start User Service (TCP Microservice)

```bash
cd apps/user-service
USER_SERVICE_PORT=3001 pnpm run start:dev
```

This starts the user service as a TCP microservice on port 3001.

### 2. Start API Gateway

```bash
cd apps/api-gateway
API_GATEWAY_PORT=3000 USER_SERVICE_PORT=3001 pnpm run start:dev
```

This starts the API Gateway on port 3000, which will communicate with the user service.

## 📚 API Documentation

Once both services are running, you can access the **Swagger documentation** at:
**http://localhost:3000/api/docs**

The Swagger UI provides:

- ✅ **Interactive API testing**
- ✅ **Request/Response examples**
- ✅ **Data validation schemas**
- ✅ **Authentication support (JWT ready)**
- ✅ **Complete API documentation**

## 🧪 Test the Integration

### Using Swagger UI (Recommended)

1. Open http://localhost:3000/api/docs
2. Explore the Users endpoints
3. Click "Try it out" on any endpoint
4. Fill in the example data and execute

### Using cURL

#### Create a User

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "name": "John Doe",
    "passwordHash": "hashed_password_123"
  }'
```

#### Get All Users

```bash
curl http://localhost:3000/api/users
```

#### Get User by ID

```bash
curl http://localhost:3000/api/users/{user-id-from-creation}
```

#### Update User

```bash
curl -X PUT http://localhost:3000/api/users/{user-id} \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Smith"
  }'
```

#### Validate User

```bash
curl http://localhost:3000/api/users/{user-id}/validate
```

#### Delete User

```bash
curl -X DELETE http://localhost:3000/api/users/{user-id}
```

## 🎯 What's Working

✅ **API Gateway** acts as a single entry point  
✅ **User Service** runs as an independent microservice  
✅ **TCP Communication** between services using NestJS microservices  
✅ **Type Safety** with shared database types  
✅ **Error Handling** with proper HTTP status codes  
✅ **Message Patterns** for service-to-service communication  
✅ **Swagger Documentation** with interactive API testing  
✅ **Data Validation** with DTOs and class-validator  
✅ **Request/Response Examples** in Swagger UI

## 🔄 Service Communication Flow

```
Client Request → API Gateway → TCP Message → User Service → Database
      ↓              ↓             ↓             ↓           ↓
   HTTP REST    → Proxy Layer → Message Queue → Business Logic → Data
```

## 🛠️ Message Patterns Available

- `user.create` - Create a new user
- `user.findById` - Find user by ID
- `user.findAll` - Get all users
- `user.update` - Update user
- `user.delete` - Delete user
- `user.validate` - Validate if user exists

## 🔧 Environment Variables

- `API_GATEWAY_PORT` - Port for API Gateway (default: 3000)
- `USER_SERVICE_PORT` - Port for User Service TCP (default: 3001)

## 🎉 Next Steps

Now you can use this pattern to:

1. **Add more services** (project-service, task-service, etc.)
2. **Integrate them through the API Gateway** with Swagger docs
3. **Use the `user.validate` pattern** in other services
4. **Add authentication middleware** to the API Gateway
5. **Extend Swagger documentation** for new services
6. **Add API versioning** and rate limiting
7. **Implement JWT authentication** (already configured in Swagger)
