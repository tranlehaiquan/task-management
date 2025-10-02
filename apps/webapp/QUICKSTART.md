# Quick Start Guide - Authentication Integration

## Prerequisites

- Docker & Docker Compose installed
- Node.js 18+ installed
- pnpm 10.17.1 installed

## Step 1: Start Backend Services

```bash
# From the monorepo root
cd /Users/quantranlehai/GitHub/task-management

# Start infrastructure (PostgreSQL, Redis, Mailpit, Email Worker)
docker compose up -d

# Start API Gateway (in a new terminal)
cd apps/api-gateway
pnpm run dev
# Should run on http://localhost:3000

# Start User Service (in a new terminal)
cd apps/user-service
pnpm run dev
# Should run on port 3001 (TCP microservice)

# Start Token Service (in a new terminal)
cd apps/token-service
pnpm run dev
# Should run on port 3002 (TCP microservice)
```

## Step 2: Start Webapp

```bash
# From the monorepo root
cd apps/webapp

# Install dependencies (if not already done)
pnpm install

# Start development server
pnpm run dev
# Should run on http://localhost:3001
```

## Step 3: Test Authentication

### 1. Register a New User

1. Open browser to http://localhost:3001
2. Click "Sign Up"
3. Fill in the form:
   - Name: Test User
   - Email: test@example.com
   - Password: Test123! (must have uppercase, lowercase, number, special char)
   - Confirm Password: Test123!
4. Click "Create account"
5. You should be redirected to the dashboard

### 2. View Dashboard

After registration, you should see:

- Welcome message with your name
- User profile card with your details
- Session information
- Quick action buttons

### 3. View Profile

1. Click "View Full Profile" or navigate to http://localhost:3001/profile
2. You should see:
   - Your profile information
   - Account status
   - Email verification status
   - Sign out button

### 4. Sign Out and Sign In

1. On the profile page, click "Sign Out"
2. You'll be redirected to the sign-in page
3. Enter your credentials:
   - Email: test@example.com
   - Password: Test123!
4. Click "Sign in"
5. You should be redirected back to the dashboard

## Verify Backend Integration

### Check API Gateway Swagger

Open http://localhost:3000/api/docs to see all available endpoints.

### Check JWT Token

1. After signing in, open browser DevTools → Application → Cookies
2. Look for cookies with names starting with `authjs.session-token`
3. This contains your encrypted session with the JWT token

### Test API Calls

You can test the API directly using curl:

```bash
# Register a user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test2@example.com",
    "password": "Test123!",
    "name": "Test User 2"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test2@example.com",
    "password": "Test123!"
  }'

# Copy the token from the response, then test protected endpoint
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Troubleshooting

### Webapp won't start

- Check if port 3001 is already in use
- Verify environment variables in `.env` file
- Run `pnpm install` to ensure dependencies are installed

### Can't connect to API Gateway

- Verify API Gateway is running on port 3000
- Check `API_GATEWAY_URL` in webapp `.env` file
- Ensure Docker containers are running: `docker ps`

### Authentication fails

- Verify User Service is running
- Verify Token Service is running
- Check API Gateway logs for errors
- Ensure PostgreSQL is running: `docker ps | grep postgres`

### Database errors

- Run migrations: `cd packages/database && pnpm run db:push`
- Check PostgreSQL connection in `packages/database/.env`
- Restart PostgreSQL: `docker compose restart postgres`

## Useful URLs

- **Webapp**: http://localhost:3001
- **API Gateway**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/api/docs
- **Mailpit (Email Testing)**: http://localhost:8025
- **Drizzle Studio**: Run `pnpm db:studio` from `packages/database`

## Next Steps

Now that authentication is working, you can:

1. Explore the API Gateway endpoints in Swagger
2. Test email verification (emails go to Mailpit)
3. Implement password reset flow
4. Add more protected pages
5. Integrate with Project Service and Task Service
6. Build out the dashboard with real features

## Architecture Diagram

```
Browser (http://localhost:3001)
    ↓
Next.js Webapp + NextAuth.js
    ↓
API Client (~/lib/api-client.ts)
    ↓
API Gateway (http://localhost:3000)
    ↓
┌───────────────┬──────────────┐
↓               ↓              ↓
User Service   Token Service  ...
(TCP 3001)     (TCP 3002)
    ↓               ↓
    └───────────────┘
            ↓
    PostgreSQL (Docker)
```

## Support

For more details, see:

- `AUTH_INTEGRATION.md` - Complete authentication guide
- `INTEGRATION_SUMMARY.md` - Summary of changes
- `test-integration.md` - API testing examples
- `readme.md` - Project architecture overview
