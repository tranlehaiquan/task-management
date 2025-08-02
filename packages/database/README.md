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

The database includes the following tables:

- **users** - User accounts and profiles
- **projects** - Project management
- **tasks** - Task tracking with status and priority
- **time_entries** - Time tracking for tasks
- **notifications** - User notifications

## Types

All schemas export TypeScript types:

```typescript
import type { User, NewUser, Task, NewTask, Project, NewProject } from '@task-mgmt/database';
```