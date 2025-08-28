# Task Management System

- User Management Service: Teams, roles, permissions
- Project Service: Project CRUD, workspace management
- Task Service: Task lifecycle, assignments, dependencies
- Time Tracking Service: Work logs, reporting
- File Storage Service: Document management, version control

A modern, scalable task management platform built with microservices architecture using NestJS, pnpm workspaces, and Turbo for optimal development experience.

## 🎯 Current Status

**Foundation Phase Complete ✅** - The core infrastructure is fully implemented and ready for development:

- 🏗️ **Monorepo Structure**: Complete pnpm + Turbo setup with 7 microservices
- 🛡️ **Authentication System**: JWT-based auth service with full user authentication flow
- 🗄️ **Database Layer**: PostgreSQL with Drizzle ORM, implemented schema for users, projects, tasks, time_entries, notifications
- 🌐 **API Gateway**: HTTP REST API with comprehensive Swagger docs, microservice routing, authentication guards
- 🔗 **Service Communication**: TCP-based microservice messaging with full auth and user services
- 📝 **Type Safety**: Full TypeScript support with shared types across services
- 🧪 **Testing Ready**: Jest scaffolding and e2e test setup for all services
- ✉️ **Email Service**: Email verification and password reset functionality with SMTP integration
- 🔐 **User Management**: Complete user CRUD, authentication, email verification, password reset

**Current Working Features**:

- ✅ User registration and login with JWT tokens
- ✅ Email verification system
- ✅ Password reset flow with secure tokens
- ✅ Protected API endpoints with authentication guards
- ✅ Comprehensive API documentation with Swagger
- ✅ User management operations (CRUD)

## 🏗️ Architecture

This project follows a microservices architecture pattern with the following core services:

- **API Gateway** - Single entry point, routing, authentication
- **User Management Service** - Authentication, user profiles, teams, roles
- **Project Service** - Project CRUD, workspaces, permissions
- **Task Service** - Task lifecycle, assignments, dependencies
- **Time Tracking Service** - Work logging, reports, analytics
- **Notification Service** - Real-time notifications, email alerts
- **Web Client** - React frontend application

### System Architecture Flow

```mermaid
graph TB
    subgraph "External"
        Client[📱 Client Applications]
        Web[🌐 Web Browser]
    end

    subgraph "API Gateway Layer"
        Gateway[🚪 API Gateway<br/>Port: 3000<br/>HTTP REST API]
    end

    subgraph "Microservices Layer"
        UserSvc[👤 User Service<br/>Port: 3001<br/>TCP Microservice ✅]
        AuthSvc[🔐 Auth Service<br/>Port: 3002<br/>TCP Microservice ✅]
        ProjectSvc[📊 Project Service<br/>Port: 3003<br/>TCP Microservice 🚧]
        TaskSvc[✅ Task Service<br/>Port: 3004<br/>TCP Microservice 🚧]
        TimeSvc[⏱️ Time Tracking Service<br/>Port: 3005<br/>TCP Microservice 🚧]
        NotifSvc[🔔 Notification Service<br/>Port: 3006<br/>TCP Microservice 🚧]
    end

    subgraph "Data Layer"
        DB[(🗄️ PostgreSQL<br/>Database)]
        Redis[(⚡ Redis<br/>Cache/Sessions)]
    end

    subgraph "Shared Packages"
        Database[📦 Database Package<br/>Schema & Migrations]
        Config[⚙️ Shared Config<br/>Ports & Settings]
        Utils[🛠️ Shared Utils<br/>Common Functions]
    end

    %% Client connections
    Client -->|HTTP/HTTPS| Gateway
    Web -->|HTTP/HTTPS| Gateway

    %% API Gateway to Services (TCP)
    Gateway -.->|TCP Messages| UserSvc
    Gateway -.->|TCP Messages| AuthSvc
    Gateway -.->|TCP Messages| ProjectSvc
    Gateway -.->|TCP Messages| TaskSvc
    Gateway -.->|TCP Messages| TimeSvc
    Gateway -.->|TCP Messages| NotifSvc

    %% Services to Database
    UserSvc -->|SQL Queries| DB
    AuthSvc -->|SQL Queries| DB
    ProjectSvc -->|SQL Queries| DB
    TaskSvc -->|SQL Queries| DB
    TimeSvc -->|SQL Queries| DB
    NotifSvc -->|SQL Queries| DB

    %% Services to Redis
    AuthSvc -->|Sessions/Tokens| Redis
    NotifSvc -->|Real-time Data| Redis
    Gateway -->|Rate Limiting| Redis

    %% Shared Dependencies
    Gateway -.->|Import| Config
    Gateway -.->|Import| Utils
    UserSvc -.->|Import| Database
    UserSvc -.->|Import| Config
    AuthSvc -.->|Import| Database
    AuthSvc -.->|Import| Config
    ProjectSvc -.->|Import| Database
    TaskSvc -.->|Import| Database
    TimeSvc -.->|Import| Database
    NotifSvc -.->|Import| Database

    %% Styling
    classDef client fill:#e1f5fe
    classDef gateway fill:#f3e5f5
    classDef service fill:#e8f5e8
    classDef data fill:#fff3e0
    classDef shared fill:#fce4ec

    class Client,Web client
    class Gateway gateway
    class UserSvc,AuthSvc,ProjectSvc,TaskSvc,TimeSvc,NotifSvc service
    class DB,Redis data
    class Database,Config,Utils shared
```

### Communication Patterns

- **HTTP REST API**: Client applications communicate with the API Gateway using standard HTTP/HTTPS
- **TCP Microservices**: API Gateway communicates with backend services using NestJS TCP transport
- **Message Patterns**: Services use pattern-based messaging (e.g., `user.create`, `auth.login`)
- **Database Access**: Each service has direct access to PostgreSQL for data persistence
- **Shared Packages**: Common functionality is shared through workspace packages

## 🛠️ Tech Stack

### Backend

- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Cache/Message Broker**: Redis (planned)
- **Authentication**: JWT tokens
- **API Documentation**: Swagger/OpenAPI
- **Communication**: TCP-based microservices

### Frontend

- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand/Redux Toolkit

### DevOps & Tools

- **Monorepo**: pnpm workspaces + Turbo
- **Containerization**: Docker & Docker Compose
- **Testing**: Jest + Supertest
- **Linting**: ESLint + Prettier

## 📁 Project Structure

```
task-management/
├── apps/                          # Runnable applications
│   ├── api-gateway/              # Main API gateway ✅ (HTTP REST API with Swagger)
│   ├── token-service/            # Token service ✅ (JWT token management)
│   ├── user-service/             # User management ✅ (CRUD, auth, email verification)
│   ├── project-service/          # Project management (scaffolded)
│   ├── task-service/             # Task management (scaffolded)
│   ├── time-tracking-service/    # Time tracking (scaffolded)
│   ├── notification-service/     # Notifications (scaffolded)
│   └── web-client/               # React frontend (planned)
│
├── packages/                      # Shared packages
│   ├── database/                 # Drizzle ORM + PostgreSQL schemas ✅ (users, email tokens)
│   ├── mail/                     # Email service ✅ (SMTP with nodemailer)
│   ├── shared-types/             # TypeScript interfaces ✅ (auth types)
│   ├── shared-config/            # Configuration utilities ✅ (service ports)
│   ├── shared-utils/             # Common utilities (scaffolded)
│   └── shared-package/           # Additional utilities (scaffolded)
│
├── docker-compose.yml            # Development environment (planned)
├── turbo.json                    # Turbo configuration ✅
└── pnpm-workspace.yaml          # Workspace configuration ✅
```

## 🚀 Quick Start

### Prerequisites

- Node.js (>= 18.0.0)
- pnpm (>= 8.0.0)
- Docker & Docker Compose
- PostgreSQL and Redis (or use Docker)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd task-management-system
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development environment**

   ```bash
   # Start databases
   docker-compose up postgres redis -d

   # Run database migrations
   pnpm run migrate

   # Start all services in development mode
   pnpm dev
   ```

### Development URLs

- **API Gateway**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api/docs
- **User Service**: TCP microservice on port 3001
- **Auth Service**: TCP microservice on port 3002
- **Web Client**: Not yet implemented

### Available API Endpoints

The API Gateway currently provides these working endpoints:

**Authentication:**

- `POST /api/auth/register` - User registration with email, password, and name
- `POST /api/auth/login` - User login with email and password (returns JWT token)
- `GET /api/auth/me` - Get current authenticated user information (protected)
- `POST /api/auth/verify-email` - Send email verification link (protected)
- `POST /api/auth/verify-email-token` - Verify email with token
- `POST /api/auth/forgot-password` - Request password reset via email
- `GET /api/auth/validate-forgot-password-token` - Validate password reset token
- `POST /api/auth/reset-password` - Reset password using token

**User Management:**

- `GET /api/users` - Get all users (protected, requires JWT)
- `GET /api/users/:id` - Get user by ID (protected, requires JWT)

**Features:**

- 🔒 JWT-based authentication with Bearer token support
- 📧 Email verification system with secure tokens
- 🔑 Password reset flow with time-limited tokens
- 🛡️ Protected endpoints with authentication guards
- ✅ Comprehensive input validation and error handling
- 📚 Full Swagger/OpenAPI documentation with examples

All endpoints include comprehensive Swagger documentation with examples, validation rules, and interactive testing capabilities.

## 📜 Available Scripts

### Root Level Commands

```bash
# Development
pnpm dev              # Start all services in watch mode
pnpm build            # Build all packages and services
pnpm test             # Run tests across all packages
pnpm lint             # Lint all packages

# Utilities
pnpm clean            # Clean all build artifacts
pnpm setup            # Initial project setup
pnpm migrate          # Run database migrations
```

### Service-Specific Commands

```bash
# Run specific service
pnpm --filter @task-mgmt/user-service dev
pnpm --filter @task-mgmt/web-client dev

# Build specific service
pnpm --filter @task-mgmt/api-gateway build

# Test specific service
pnpm --filter @task-mgmt/task-service test
```

## 🔧 Development Workflow

### Working with Services

1. **Adding a new service**

   ```bash
   pnpm turbo gen workspace --type app --name new-service
   ```

2. **Adding a new shared package**

   ```bash
   pnpm turbo gen workspace --type package --name shared-package
   ```

3. **Installing dependencies**

   ```bash
   # Add to specific service
   pnpm --filter @task-mgmt/user-service add @nestjs/jwt

   # Add to root (affects all workspaces)
   pnpm add -D typescript
   ```

### Database Management

```bash
# Generate new migration
pnpm --filter @task-mgmt/user-service run migration:generate

# Run migrations
pnpm run migrate

# Seed development data
pnpm run seed
```

## 🐳 Docker Support

### Development with Docker

```bash
# Start all services with Docker
docker-compose up

# Start specific services
docker-compose up postgres redis api-gateway
```

### Production Deployment

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests for specific service
pnpm --filter @task-mgmt/user-service test

# Run tests with coverage
pnpm test:coverage

# Run e2e tests
pnpm test:e2e
```

### Testing Strategy

- **Unit Tests**: Individual service logic testing
- **Integration Tests**: Service-to-service communication
- **E2E Tests**: Full user workflow testing
- **Load Tests**: Performance and scalability testing

## 📊 Monitoring & Observability

### Development

- **Logs**: Structured logging with Winston
- **Health Checks**: `/health` endpoint on each service
- **Metrics**: Basic performance metrics

### Production (Planned)

- **Monitoring**: Prometheus + Grafana
- **Tracing**: OpenTelemetry
- **Error Tracking**: Sentry
- **Uptime Monitoring**: Custom dashboard

## 🔐 Security

- **Authentication**: JWT-based authentication
- **Authorization**: Role-based access control (RBAC)
- **API Security**: Rate limiting, CORS, helmet
- **Data Validation**: Class-validator with DTOs
- **Password Security**: bcrypt hashing

## 🚦 API Documentation

The API Gateway exposes comprehensive Swagger documentation:

- **API Gateway**: http://localhost:3000/api/docs

Individual microservices communicate via TCP and don't expose HTTP endpoints directly. All API documentation is centralized through the API Gateway.

## 🛣️ Roadmap

For detailed development roadmap and future plans, see **[ROADMAP.md](./ROADMAP.md)**.

### Current Status: Phase 2 - Core Business Features 🚧

**Recently Completed (Phase 1)**:

- ✅ Complete microservices architecture with TCP communication
- ✅ JWT authentication system with email verification
- ✅ User management with password reset functionality
- ✅ API Gateway with comprehensive Swagger documentation
- ✅ Database schema design for all core entities
- ✅ Shared utilities for password hashing and email templates

**Currently Working On (Phase 2)**:

- 🚧 Project Service implementation
- 🚧 Task Service with full lifecycle management
- 🚧 Docker Compose development environment
- 🚧 Enhanced API Gateway integration

**Next Up (Phase 3)**:

- 📋 React frontend application
- 📋 Time tracking service
- 📋 Real-time notifications

See the [full roadmap](./ROADMAP.md) for detailed feature breakdown and timelines.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the established coding standards
- Write tests for new features
- Update documentation as needed
- Use conventional commit messages
- Ensure all services pass health checks

## 📝 Environment Variables

### Required Environment Variables

```bash
# Database (Drizzle ORM)
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/task_management
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=task_management
DB_SSL=false

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters

# Email Service (SMTP)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-app-password

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:3000

# Services (TCP Microservices)
API_GATEWAY_PORT=3000
USER_SERVICE_PORT=3001
AUTH_SERVICE_PORT=3002
PROJECT_SERVICE_PORT=3003
TASK_SERVICE_PORT=3004
TIME_TRACKING_SERVICE_PORT=3005
NOTIFICATION_SERVICE_PORT=3006

# Development
NODE_ENV=development
```

See `.env.example` for complete configuration options.

## 🐛 Troubleshooting

### Common Issues

**Services won't start**

- Ensure PostgreSQL and Redis are running
- Check if ports are already in use
- Verify environment variables are set

**Database connection errors**

- Verify DATABASE_URL is correct
- Ensure database exists and is accessible
- Check firewall settings

**pnpm workspace issues**

- Run `pnpm install` from root directory
- Clear node_modules and reinstall if needed
- Check pnpm-workspace.yaml configuration

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Lead Developer**: [Your Name]
- **Frontend**: React/TypeScript specialist
- **Backend**: NestJS/Node.js microservices
- **Goal**: Full-stack development mastery

---

**Happy Coding! 🚀**

For questions or support, please open an issue or contact the development team.

```mermaid
erDiagram
    %% USER SERVICE DATABASE
    users {
        uuid id PK
        varchar email UK
        varchar password_hash
        varchar name
        varchar avatar_url
        boolean is_active
        boolean is_email_verified
        timestamp last_login_at
        timestamp created_at
        timestamp updated_at
    }

    teams {
        uuid id PK
        varchar name
        text description
        varchar slug UK
        varchar avatar_url
        jsonb settings
        boolean is_active
        uuid created_by FK
        timestamp created_at
        timestamp updated_at
    }

    roles {
        uuid id PK
        varchar name
        text description
        role_scope scope
        jsonb permissions
        boolean is_system_role
        timestamp created_at
        timestamp updated_at
    }

    team_memberships {
        uuid id PK
        uuid user_id FK
        uuid team_id FK
        uuid role_id FK
        boolean is_active
        timestamp joined_at
        timestamp created_at
        timestamp updated_at
    }

    user_sessions {
        uuid id PK
        uuid user_id FK
        varchar session_token UK
        varchar refresh_token UK
        jsonb device_info
        inet ip_address
        text user_agent
        boolean is_active
        timestamp expires_at
        timestamp created_at
        timestamp last_used_at
    }

    user_preferences {
        uuid id PK
        uuid user_id FK
        jsonb preferences
        timestamp created_at
        timestamp updated_at
    }

    %% PROJECT SERVICE DATABASE
    projects {
        uuid id PK
        varchar name
        text description
        varchar status
        uuid created_by FK "Reference to users.id"
        varchar created_by_name "Denormalized"
        uuid team_id FK "Reference to teams.id"
        varchar team_name "Denormalized"
        boolean is_public
        varchar color
        timestamp start_date
        timestamp end_date
        timestamp created_at
        timestamp updated_at
    }

    project_members {
        uuid id PK
        uuid project_id FK
        uuid user_id FK "Reference to users.id"
        varchar user_name "Denormalized"
        varchar role
        boolean is_active
        timestamp joined_at
        timestamp created_at
        timestamp updated_at
    }

    %% TASK SERVICE DATABASE
    tasks {
        uuid id PK
        varchar title
        text description
        varchar status
        varchar priority
        uuid project_id FK "Reference to projects.id"
        varchar project_name "Denormalized"
        uuid assigned_to FK "Reference to users.id"
        varchar assigned_to_name "Denormalized"
        uuid created_by FK "Reference to users.id"
        varchar created_by_name "Denormalized"
        uuid parent_task_id FK "Self-reference for subtasks"
        timestamp due_date
        timestamp completed_at
        timestamp created_at
        timestamp updated_at
    }

    task_dependencies {
        uuid id PK
        uuid task_id FK
        uuid depends_on_task_id FK
        varchar dependency_type
        timestamp created_at
    }

    task_comments {
        uuid id PK
        uuid task_id FK
        uuid user_id FK "Reference to users.id"
        varchar user_name "Denormalized"
        text content
        timestamp created_at
        timestamp updated_at
    }

    task_attachments {
        uuid id PK
        uuid task_id FK
        varchar filename
        varchar file_url
        varchar file_type
        bigint file_size
        uuid uploaded_by FK "Reference to users.id"
        timestamp created_at
    }

    %% TIME TRACKING SERVICE DATABASE
    time_entries {
        uuid id PK
        uuid user_id FK "Reference to users.id"
        varchar user_name "Denormalized"
        uuid project_id FK "Reference to projects.id"
        varchar project_name "Denormalized"
        uuid task_id FK "Reference to tasks.id"
        varchar task_title "Denormalized"
        text description
        timestamp start_time
        timestamp end_time
        integer duration_minutes
        boolean is_billable
        timestamp created_at
        timestamp updated_at
    }

    %% NOTIFICATION SERVICE DATABASE
    notifications {
        uuid id PK
        uuid user_id FK "Reference to users.id"
        varchar type
        varchar title
        text message
        jsonb data
        boolean is_read
        timestamp read_at
        timestamp created_at
    }

    notification_preferences {
        uuid id PK
        uuid user_id FK "Reference to users.id"
        varchar notification_type
        boolean email_enabled
        boolean push_enabled
        boolean in_app_enabled
        timestamp created_at
        timestamp updated_at
    }

    %% USER SERVICE RELATIONSHIPS
    users ||--o{ teams : "creates"
    users ||--o{ team_memberships : "belongs_to"
    users ||--|| user_preferences : "has"
    users ||--o{ user_sessions : "has_sessions"

    teams ||--o{ team_memberships : "contains"
    roles ||--o{ team_memberships : "defines"

    team_memberships }o--|| users : "user"
    team_memberships }o--|| teams : "team"
    team_memberships }o--|| roles : "role"

    %% CROSS-SERVICE RELATIONSHIPS (Logical, not FK)
    users ||--o{ projects : "creates (via service call)"
    teams ||--o{ projects : "owns (via service call)"
    users ||--o{ project_members : "member_of (via service call)"
    projects ||--o{ project_members : "has_members"

    projects ||--o{ tasks : "contains (via service call)"
    users ||--o{ tasks : "assigned_to (via service call)"
    users ||--o{ tasks : "created_by (via service call)"
    tasks ||--o{ tasks : "subtasks"
    tasks ||--o{ task_dependencies : "has_dependencies"
    tasks ||--o{ task_comments : "has_comments"
    tasks ||--o{ task_attachments : "has_attachments"
    users ||--o{ task_comments : "writes (via service call)"

    users ||--o{ time_entries : "logs_time (via service call)"
    projects ||--o{ time_entries : "time_logged (via service call)"
    tasks ||--o{ time_entries : "time_logged (via service call)"

    users ||--o{ notifications : "receives (via service call)"
    users ||--o{ notification_preferences : "has_preferences (via service call)"
```
