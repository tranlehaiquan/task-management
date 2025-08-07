# Task Management System

A modern, scalable task management platform built with microservices architecture using NestJS, pnpm workspaces, and Turbo for optimal development experience.

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
        UserSvc[👤 User Service<br/>Port: 3001<br/>TCP Microservice]
        AuthSvc[🔐 Auth Service<br/>Port: 3002<br/>TCP Microservice]
        ProjectSvc[📊 Project Service<br/>Port: 3003<br/>TCP Microservice]
        TaskSvc[✅ Task Service<br/>Port: 3004<br/>TCP Microservice]
        TimeSvc[⏱️ Time Tracking Service<br/>Port: 3005<br/>TCP Microservice]
        NotifSvc[🔔 Notification Service<br/>Port: 3006<br/>TCP Microservice]
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
- **Database**: PostgreSQL with TypeORM
- **Cache/Message Broker**: Redis
- **Authentication**: JWT tokens
- **API Documentation**: Swagger/OpenAPI

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
task-management-system/
├── apps/                          # Runnable applications
│   ├── api-gateway/              # Main API gateway
│   ├── user-service/             # User management
│   ├── project-service/          # Project management
│   ├── task-service/             # Task management
│   ├── time-tracking-service/    # Time tracking
│   ├── notification-service/     # Notifications
│   └── web-client/               # React frontend
│
├── packages/                      # Shared packages
│   ├── shared-types/             # TypeScript interfaces
│   ├── shared-config/            # Configuration utilities
│   ├── shared-utils/             # Common utilities
│   ├── event-bus/                # Event handling system
│   └── database/                 # Database utilities
│
├── tools/                        # Development tools
│   ├── scripts/                  # Setup and utility scripts
│   └── docker/                   # Docker configurations
│
├── docker-compose.yml            # Development environment
├── turbo.json                    # Turbo configuration
└── pnpm-workspace.yaml          # Workspace configuration
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

- **Web Client**: http://localhost:3000
- **API Gateway**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api/docs

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

Each service exposes Swagger documentation:

- **API Gateway**: http://localhost:3001/api/docs
- **User Service**: http://localhost:3002/api/docs
- **Project Service**: http://localhost:3003/api/docs
- **Task Service**: http://localhost:3004/api/docs

## 🛣️ Roadmap

### Phase 1: Core Features (Current)

- [x] Project setup with pnpm + Turbo
- [ ] User authentication and management
- [ ] Basic project and task CRUD
- [ ] API Gateway with routing
- [ ] React frontend with basic UI

### Phase 2: Enhanced Features

- [ ] Real-time notifications
- [ ] Time tracking functionality
- [ ] Advanced task features (dependencies, subtasks)
- [ ] File attachments
- [ ] Team collaboration features

### Phase 3: Advanced Features

- [ ] Analytics and reporting
- [ ] Mobile app (React Native)
- [ ] Advanced search and filtering
- [ ] Workflow automation
- [ ] Third-party integrations

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
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/taskdb
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# Services
API_GATEWAY_PORT=3001
USER_SERVICE_PORT=3002
PROJECT_SERVICE_PORT=3003
TASK_SERVICE_PORT=3004
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

    password_reset_tokens {
        uuid id PK
        uuid user_id FK
        varchar token UK
        timestamp expires_at
        timestamp used_at
        timestamp created_at
    }

    email_verification_tokens {
        uuid id PK
        uuid user_id FK
        varchar token UK
        timestamp expires_at
        timestamp verified_at
        timestamp created_at
    }

    %% Relationships
    users ||--o{ teams : "creates"
    users ||--o{ team_memberships : "belongs to"
    users ||--|| user_preferences : "has"
    users ||--o{ user_sessions : "has"
    users ||--o{ password_reset_tokens : "requests"
    users ||--o{ email_verification_tokens : "verifies"

    teams ||--o{ team_memberships : "contains"
    roles ||--o{ team_memberships : "defines"

    team_memberships }o--|| users : "user"
    team_memberships }o--|| teams : "team"
    team_memberships }o--|| roles : "role"
```
