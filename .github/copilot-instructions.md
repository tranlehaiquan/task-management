# Task Management System - AI Agent Guide

## Architecture Overview

This is a **microservices monorepo** using **pnpm workspaces + Turbo** with NestJS services. The system follows a **TCP-based microservice communication pattern** with a central API Gateway.

### Service Architecture Pattern

- **API Gateway** (`apps/api-gateway`, port 3000): HTTP REST entry point with Swagger docs at `/api/docs`
- **Microservices** (ports 3001-3006): TCP-based NestJS microservices using `@nestjs/microservices`
  - User Service (3001), Token Service (3002), Project Service (3003), Task Service (3004), Time Tracking (3005), Notification (3006)
- **Background Workers**: Email Worker processes BullMQ jobs from Redis
- **Shared Packages**: Database (Drizzle ORM), Queue (BullMQ), Mail, Types, Config, Utils

### Critical Communication Pattern

**API Gateway → Microservices**: Uses `ClientProxy` with TCP transport and message patterns

```typescript
// In API Gateway: apps/api-gateway/src/app.module.ts
ClientsModule.register([
  {
    name: 'USER_SERVICE',
    transport: Transport.TCP,
    options: { host: '127.0.0.1', port: PORTS.USER_SERVICE },
  },
]);

// In Controllers: send messages to services
this.userService.send('user.findById', userId);
```

**Microservices**: Listen via `@MessagePattern` decorators

```typescript
// In User Service: apps/user-service/src/users/users.controller.ts
@MessagePattern('user.findById')
async findUserByIdMessage(id: string): Promise<SanitizedUser | null> {
  return this.usersService.getUserById(id);
}
```

## Development Workflows

### Running Services Locally

**Start infrastructure** (Docker Compose includes: PostgreSQL, Redis, Mailpit SMTP, Email Worker):

```bash
docker compose up -d
```

**Start individual services** (use pnpm from workspace root):

```bash
# API Gateway (must run first)
cd apps/api-gateway && pnpm run dev

# Start microservices (in separate terminals)
cd apps/user-service && pnpm run dev
cd apps/token-service && pnpm run dev
cd apps/project-service && pnpm run dev
```

**Run all services** (Turbo parallel mode):

```bash
pnpm dev
```

**Database operations** (from workspace root):

```bash
pnpm db:push              # Push schema changes to DB
cd packages/database
pnpm run db:generate      # Generate migrations
pnpm run db:studio        # Open Drizzle Studio
```

### Testing & API Documentation

- **Swagger UI**: http://localhost:3000/api/docs (comprehensive API testing interface)
- **Mailpit UI**: http://localhost:8025 (view sent emails during development)
- See `test-integration.md` for complete testing flows with curl examples

### Build & Format

```bash
pnpm build    # Turbo builds all packages in dependency order
pnpm lint     # Lint all packages
pnpm format   # Format code with Prettier
```

## Code Conventions & Patterns

### Authentication Flow

1. **Login/Register** → API Gateway `/api/auth` → User Service validates → Token Service generates JWT
2. **Protected Routes** → `@UseGuards(AuthGuard)` → Validates JWT via Token Service → Fetches fresh user data from User Service → Attaches `CurrentUser` to `request.user`
3. **Current User Access** → Use `@CurrentUser()` decorator (defined in `apps/api-gateway/src/decorators/user.decorator.ts`)

```typescript
// Example protected endpoint
@UseGuards(AuthGuard)
@Get('profile')
getProfile(@CurrentUser() user: CurrentUser) {
  return user; // Full user object from database
}
```

**Key Security Pattern**: JWT contains minimal payload (`id`, `iat`, `exp`). Full user data is fetched fresh on every request via `AuthGuard` to ensure current state.

### Email System

- **Queue-based**: Services add jobs to Redis via `@task-mgmt/queue` package
- **Email Worker**: Separate Docker container processes BullMQ jobs, sends via SMTP
- **Templates**: Located in `packages/mail/src/templates/` (welcome, verification, password reset)

Example: Email verification flow documented in `docs/flowcharts.md` with Mermaid diagrams.

### Database Schema & Drizzle ORM

- **Schema location**: `packages/database/src/schema/` (separate files per entity)
- **Usage in services**: Import from `@task-mgmt/database`
  ```typescript
  import { db, users, type User, type NewUser } from '@task-mgmt/database';
  ```
- **Query pattern**: Use Drizzle ORM methods (`.select()`, `.insert()`, `.update()`, `.delete()`)
- **Migrations**: Generated in `packages/database/migrations/`, config in `drizzle.config.ts`

### Shared Packages Pattern

**DO**: Import from workspace packages using `@task-mgmt/*` aliases

```typescript
import { PORTS } from '@task-mgmt/shared-config';
import type { CurrentUser } from '@task-mgmt/shared-types';
import { db, users } from '@task-mgmt/database';
```

**Build dependency**: Shared packages must be built before dependent services. Turbo handles this via `dependsOn: ["^build"]` in `turbo.json`.

### Service Port Configuration

Defined in `packages/shared-config/src/index.ts`:

- API_GATEWAY: 3000
- USER_SERVICE: 3001
- TOKEN_SERVICE: 3002
- PROJECT_SERVICE: 3003
- (Task, Time Tracking, Notification services follow)

Override via environment variables: `USER_SERVICE_PORT=3001 pnpm dev`

### DTO & Validation Pattern

- Use `class-validator` decorators in DTOs (located in `*/dto/` directories)
- API Gateway enables global `ValidationPipe` with `transform: true, whitelist: true`
- Swagger decorators (`@ApiProperty`, `@ApiResponse`) for auto-generated docs

### Error Handling

- API Gateway catches errors from microservices
- Services return structured responses: `{ success: boolean, data?: T, error?: string }`
- Use NestJS HTTP exceptions in Gateway: `throw new UnauthorizedException('message')`

## Current Development Status

**Phase 1 (Complete)**: Core infrastructure, auth system, user management, email verification, password reset
**Phase 2 (In Progress)**: Project management, task service, enhanced API Gateway features

See `ROADMAP.md` for detailed feature tracking and `readme.md` for architecture diagrams.

## Key Files Reference

- **Architecture**: `readme.md` (Mermaid diagram), `docs/flowcharts.md` (email, auth flows)
- **Service startup**: `apps/*/src/main.ts` (bootstrap config)
- **API Gateway routing**: `apps/api-gateway/src/app.module.ts` (ClientsModule registration)
- **Auth guard logic**: `apps/api-gateway/src/guards/auth.guards.ts`
- **Database schema**: `packages/database/src/schema/*.ts`
- **Service ports**: `packages/shared-config/src/index.ts`
- **Type definitions**: `packages/shared-types/src/auth.types.ts`

## Project-Specific Notes

- **pnpm version**: Uses 10.17.1 (specified in `packageManager` field)
- **Node.js**: Requires 18+ (ESM-based imports)
- **No HTTP in microservices**: User/Token/Project services are TCP-only (no Express server)
- **Shutdown hooks**: All services use `app.enableShutdownHooks(['SIGINT', 'SIGTERM', 'SIGQUIT'])` for graceful shutdown
- **Frontend URL**: Required env var `FRONTEND_URL` for email verification links (validation in `users.controller.ts`)
