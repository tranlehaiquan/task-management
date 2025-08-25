# @task-mgmt/database

Shared database package for the task management system using Drizzle ORM.

## Features

- 🔥 **Drizzle ORM** - Type-safe SQL with excellent TypeScript support
- 🐘 **PostgreSQL** - Production-ready database
- 🏗️ **Schema Management** - Organized schema definitions
- 🔄 **Migrations** - Database versioning and migration management
- 🎯 **Type Safety** - Full TypeScript support with inferred types

## Setup

### 1. Environment Variables

Create a `.env` file in your service or root directory:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=task_management
NODE_ENV=development
```

### 2. Database Operations

```bash
# Generate migrations from schema changes
pnpm db:generate

# Run migrations
pnpm db:migrate

# Push schema directly to database (for development)
pnpm db:push

# Open Drizzle Studio (visual database browser)
pnpm db:studio
```

## Usage in Services

### Import the database and types

```typescript
import { db, users, projects, tasks, type User, type NewUser } from '@task-mgmt/database';
import { eq, and, or } from 'drizzle-orm';
```

### Basic CRUD Operations

```typescript
// Create a user
const newUser = await db.insert(users).values({
  email: 'user@example.com',
  username: 'johndoe',
  passwordHash: 'hashed_password',
  firstName: 'John',
  lastName: 'Doe'
}).returning();

// Get user by ID
const user = await db.select().from(users).where(eq(users.id, userId));

// Update user
const updatedUser = await db
  .update(users)
  .set({ firstName: 'Jane' })
  .where(eq(users.id, userId))
  .returning();

// Delete user
await db.delete(users).where(eq(users.id, userId));
```

### Complex Queries

```typescript
// Get user with their projects
const userWithProjects = await db
  .select()
  .from(users)
  .leftJoin(projects, eq(users.id, projects.ownerId))
  .where(eq(users.id, userId));

// Get tasks with assignee and project info
const tasksWithDetails = await db
  .select({
    task: tasks,
    assignee: users,
    project: projects
  })
  .from(tasks)
  .leftJoin(users, eq(tasks.assigneeId, users.id))
  .leftJoin(projects, eq(tasks.projectId, projects.id))
  .where(eq(tasks.status, 'in_progress'));
```

## Schema

The database currently includes the following implemented tables:

### ✅ **Implemented Tables:**
- **users** - User accounts and profiles with authentication
- **email_verification_tokens** - Email verification and password reset tokens

### 🚧 **Planned Tables (Schema Defined):**
- **projects** - Project management
- **tasks** - Task tracking with status and priority
- **time_entries** - Time tracking for tasks
- **notifications** - User notifications

### Current Database Schema

#### Users Table
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

#### Email Verification Tokens Table
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

## Types

All schemas export TypeScript types:

```typescript
// Currently available types
import type { 
  User, 
  NewUser, 
  EmailVerificationToken, 
  NewEmailVerificationToken 
} from '@task-mgmt/database';

// Planned types (schema defined but not implemented)
import type { 
  Task, 
  NewTask, 
  Project, 
  NewProject,
  TimeEntry,
  NewTimeEntry,
  Notification,
  NewNotification
} from '@task-mgmt/database';
```

### Working Examples

```typescript
// Create a new user
const newUser: NewUser = {
  email: 'user@example.com',
  passwordHash: 'hashed_password',
  name: 'John Doe'
};

const user = await db.insert(users).values(newUser).returning();

// Create email verification token
const token: NewEmailVerificationToken = {
  userId: user.id,
  email: user.email,
  token: 'secure-random-token',
  type: 'email_verification',
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
};

const verificationToken = await db.insert(emailVerificationTokens)
  .values(token)
  .returning();
```