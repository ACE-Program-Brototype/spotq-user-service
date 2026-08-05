# SpotQ User Service

The **SpotQ User Service** is a production-ready microservice responsible for user management and authentication-related workflows within the SpotQ platform.

Built with **TypeScript**, **Express 5**, and **Clean Architecture**, the service emphasizes scalability, maintainability, observability, and secure infrastructure practices.

---

# Technology Stack

### Runtime & Framework
- Node.js (v22+)
- Express 5
- TypeScript

### Database
- PostgreSQL
- Prisma ORM 7
- `@prisma/adapter-pg`

### Queue Processing
- BullMQ
- Redis
- ioredis

### Caching
- Redis

### Secret Management
- Infisical CLI

### Logging
- Pino
- AsyncLocalStorage-based request context

### Monitoring
- Prometheus (`prom-client`)

### Testing
- Jest

### Code Quality
- Biome
- Commitlint
- Husky
- Commitizen

### Package Manager
- pnpm

### Containerization
- Docker
- Docker Compose

### CI
- GitHub Actions

---

# Project Architecture

The project follows **Clean Architecture**.

```text
src/
├── application/
├── domain/
├── infrastructure/
├── modules/
├── interfaces/
├── shared/
└── app.ts
└── server.ts
```

### Domain
Contains business entities and interfaces.

### Application
Implements use cases and application services.

### Infrastructure
Contains implementations for:

- Prisma
- Redis
- BullMQ
- Logger
- Metrics
- Environment configuration

### Interfaces

Contains:

- Express routes
- Controllers
- Middlewares
- Request validation

### Modules

Contains feature-specific modules.

---

# Features

## Health Check

```
GET /health
```

Returns the health status of:

- Application
- PostgreSQL
- Redis
- BullMQ Redis Connection

Example:

```json
{
  "status": "UP",
  "timestamp": "2026-08-04T10:30:00Z",
  "checks": {
    "application": "UP",
    "database": "UP",
    "redis": "UP",
    "bullmq": "UP"
  }
}
```

---

## Prometheus Metrics

```
GET /metrics
```

Exposes Prometheus metrics including:

- Default Node.js metrics
- HTTP request counter
- HTTP request latency
- PostgreSQL status
- Redis status
- BullMQ Redis status

---

## Structured Logging

Pino provides structured JSON logs.

Every request automatically includes:

- requestId
- correlationId

Errors include structured stack traces.

---

## BullMQ

The service includes BullMQ infrastructure for asynchronous job processing.

Features include:

- Shared Redis connection
- Queue factory service
- Production-ready retry strategy
- TLS-aware Redis configuration

---

## Database

Prisma ORM manages PostgreSQL access.

Features:

- Prisma Client
- Driver Adapter (`@prisma/adapter-pg`)
- Type-safe queries
- Migrations

---

## Secret Management

Secrets are injected securely using Infisical.

Development:

```bash
pnpm dev
```

Infisical:

```bash
infisical run -- pnpm dev
```

---

# Getting Started

## Prerequisites

Install:

- Node.js 22+
- pnpm
- Docker (optional)
- Redis
- PostgreSQL
- Infisical CLI (optional)

---

## Install Dependencies

```bash
pnpm install
```

---

## Generate Prisma Client

```bash
pnpm prisma:generate
```

---

## Run Migrations

```bash
pnpm prisma:migrate
```

---

## Start Development Server

```bash
pnpm dev
```

or

```bash
infisical run -- pnpm dev
```

---

# Docker

## Build

```bash
docker build -t spotq-user-service .
```

## Run

```bash
docker compose up --build
```

The Docker environment includes:

- User Service
- Redis

---

# Testing

Run unit tests:

```bash
pnpm test
```

---

# Linting

Check:

```bash
pnpm lint
```

Fix:

```bash
pnpm lint:fix
```

Format:

```bash
pnpm format
```

---

# Commit Convention

This project follows the Conventional Commits specification.

Examples:

```text
feat: add user registration endpoint

fix: resolve Redis connection issue

chore: update Docker configuration
```

Commit messages can be created using:

```bash
pnpm commit
```

Commit messages are validated using **Commitlint**.

---

# CI

GitHub Actions automatically performs:

- Dependency installation
- Prisma Client generation
- Linting
- Type checking
- Unit tests
- Docker image build

on every push and pull request to:

- development
- staging
- main

---

# Environment Variables

Example:

```env
PORT=3001

DATABASE_URL=

REDIS_URL=

INFISICAL_TOKEN=
```

---

# Future Enhancements

- Authentication
- User profile management
- Email notifications
- Background job workers
- Queue monitoring
- OpenAPI/Swagger documentation
- Integration tests
- Performance testing with k6

---

# License

ISC