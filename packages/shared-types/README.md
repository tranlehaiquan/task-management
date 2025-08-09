# @task-mgmt/shared-types

Shared TypeScript type definitions used across all microservices in the task management monorepo.

## Usage

```typescript
import { UserJWTPayload, CurrentUser } from '@task-mgmt/shared-types';
```

## Available Types

- `UserJWTPayload` - JWT token payload structure for user authentication (includes JWT claims)
- `CurrentUser` - Sanitized user data for request.user in authenticated routes (excludes JWT claims)