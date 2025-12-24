# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Node API Skeleton is a TypeScript Express API template with best practices, testing infrastructure, and OpenAPI documentation. It's designed as a starting point for new API projects.

## 🚨 Migration to Hexagonal Architecture - IN PROGRESS

**IMPORTANT**: This project is actively migrating to modern architecture. The migration plan is in `specs/` folder.

- **Target Architecture**: Hexagonal + Onion + Screaming Architecture
- **Target Stack**: Fastify, SWC, Vitest, Zod, Winston
- **Approach**: Hybrid Pragmatic (OOP + FP)
- **Status**: 🚧 **Stage 2 COMPLETED** (Domain Layer with Entities & Ports)

### ✅ Completed Stages:
- **Stage 0**: Setup (SWC, Fastify deps, path aliases) ✓
- **Stage 1**: Foundation (folder structure, Zod config, Fastify server) ✓
- **Stage 2**: Domain layer (exceptions, value objects, entities, ports, unit tests) ✓

### 📁 New Architecture (Vertical Slice by Contexts) ✅
```
src/
├── @contexts/                # Bounded Contexts (vertical slices)
│   └── greetings/            # Greetings context ✅
│       ├── domain/           # Domain layer
│       │   ├── entities/     # Greeting entity
│       │   ├── value-objects/# Message VO
│       │   └── exceptions/   # InvalidGreetingException
│       ├── application/      # Application layer (🔜 Stage 3)
│       │   ├── ports/
│       │   │   ├── inbound/  # IGetGreetingUseCase
│       │   │   └── outbound/ # IGreetingRepository
│       │   ├── use-cases/
│       │   ├── dtos/
│       │   └── mappers/
│       └── infrastructure/   # Infrastructure layer
│           ├── http/         # Controllers, routes
│           └── persistence/  # Repositories
│
└── @shared/                  # Cross-cutting concerns ✅
    ├── domain/
    │   └── exceptions/       # DomainException base class
    ├── infrastructure/
    │   ├── config/           # Environment validation (Zod)
    │   ├── http/             # Fastify app, plugins
    │   └── observability/    # ILogger interface
    ├── types/                # Result, common types
    ├── utils/                # Pure functions
    └── constants/            # HTTP status, etc.
```

### 🏗️ Domain Layer (Stage 2)

The domain layer follows DDD principles with immutable entities and value objects:

**Exceptions**:
- `DomainException` (abstract base): Custom error with code and HTTP status
- `InvalidGreetingException`: Validation errors for greeting messages

**Value Objects**:
- `Message`: Immutable value object with validation (1-200 chars)
  - Uses static factory method `Message.create()`
  - Implements `equals()` for value comparison

**Entities**:
- `Greeting`: Immutable entity encapsulating Message
  - `Greeting.create()`: New instance with current timestamp
  - `Greeting.reconstitute()`: Rebuild from persistence
  - Private constructor ensures controlled creation

**Ports (Interfaces)**:
- **Inbound**: `IGetGreetingUseCase` - Application layer contract
- **Outbound**: `IGreetingRepository`, `ILogger` - Infrastructure contracts

**Tests**: Unit tests in `test/unit/@contexts/greetings/domain/` with >90% coverage

### 🎯 Vertical Slice Architecture (Contexts)

The codebase now uses **Vertical Slice Architecture** where each bounded context contains all layers:

**Benefits**:
- **High cohesion**: All greetings code in `@contexts/greetings/`
- **Easy navigation**: No jumping between @core, @application, @infrastructure
- **Scalability**: Add new contexts without affecting existing ones
- **Team ownership**: Each team can own a complete context
- **Microservices-ready**: Easy to extract a context to its own service

**Path Aliases**:
- `@contexts/*` - Bounded contexts (greetings, users, orders, etc.)
- `@shared/*` - Cross-cutting concerns (config, logger, types, utils)

### 🔄 Coexistence Period
During migration, **both architectures coexist**:
- **Legacy Express**: `src/app.ts`, `src/server.ts`, `src/routes/`, `src/controllers/`
- **New Fastify**: `src/main.ts`, `src/@shared/infrastructure/http/app.ts`

**Commands**:
- `npm run dev` - Fastify server (new) with SWC
- `npm run dev:express` - Express server (legacy)

See `specs/README.md` for complete migration roadmap.

## Development Commands

```bash
# Install dependencies
npm install

# Development server (auto-reload on changes)
npm run dev

# Build production bundle
npm run build

# Run production server
npm start

# Linting
npm run lint          # Check for issues
npm run lint:fix      # Auto-fix issues

# Testing
npm run test          # Run all tests
npm run test:coverage # Run with coverage report
npm run test:coveralls # Run coverage and send to Coveralls

# Run a single test file
npm run test -- test/unit/controllers/hello.spec.ts
```

## Architecture

### Request Flow

The application follows a layered architecture:

1. **Routes** (`src/routes/*.ts`) - Define endpoints and OpenAPI documentation
2. **Controllers** (`src/controllers/*.ts`) - Handle HTTP requests/responses
3. **Services** (`src/services/*.ts`) - Contain business logic
4. **Models** (`src/models/*.ts`) - Define TypeScript interfaces and types

Example flow for `/api/v1/hello`:
- Route (`src/routes/hello.ts`) defines endpoint and OpenAPI spec
- Controller (`src/controllers/hello.ts`) handles request, calls service, formats response
- Service (`src/services/hello.ts`) contains business logic
- Model (`src/models/business/hello.ts`) defines response type

### Dynamic Route Loading

Routes are loaded dynamically in `src/routes/index.ts`:
- Scans the `src/routes/` directory
- Imports all route files (except `index.ts`)
- Auto-registers routes using filename as path (e.g., `hello.ts` → `/api/v1/hello`)

To add a new endpoint:
1. Create `src/routes/[name].ts` exporting a `router`
2. Create corresponding controller in `src/controllers/[name].ts`
3. Create service in `src/services/[name].ts`
4. Define models in `src/models/business/[name].ts`

### Application Bootstrap

- `src/server.ts` - Entry point that starts the HTTP server
- `src/app.ts` - Express app configuration with middleware stack:
  - CORS, Helmet (security), Morgan (logging)
  - Health check endpoint at `/health`
  - Swagger UI at `/docs` (OpenAPI spec at `/docs.json`)
  - All API routes prefixed with `/api/v1` (configurable in `src/config.ts`)

### Configuration

Environment variables are loaded via `dotenv` in `src/app.ts`. Configuration is centralized in `src/config.ts`:
- `PORT` - Server port (default: 3000)
- `base_url` - API prefix (default: `/api/v1`)

Setup: Copy `.env.example` to `.env` and configure values.

## Testing

Tests use Jest with Supertest and are located in `test/unit/` mirroring the `src/` structure:
- Tests must match pattern `**/test/**/*.spec.(ts|js)`
- Coverage thresholds: 80% for branches, functions, lines, statements
- Test server runs on port 5054 (set via `cross-env PORT=5054`)
- Coverage excludes `src/server.ts` and `src/config.ts`

## OpenAPI Documentation

OpenAPI specs are defined using JSDoc comments in route files (see `src/routes/hello.ts` for example).

Swagger configuration in `src/tools/swagger.ts`:
- Scans `./src/routes/*.ts` and `./src/models/*.ts` for `@openapi` tags
- Serves UI at `/docs`
- Serves raw JSON at `/docs.json`

## Git Hooks

Pre-commit hook runs `lint-staged` which:
- Runs `npm run lint:fix` on staged `.ts`, `.tsx`, `.js`, `.jsx` files
- Auto-stages fixed files

Configuration in `.lintstagedrc`.

## Docker

Build and run:
```bash
docker build -t node-api-skeleton .
docker run -p 3000:3000 node-api-skeleton
```

## Utilities

- `src/utils/remove_extensions.ts` - Helper for dynamic route loading
- `src/tools/health.ts` - Health check endpoint handler
- `src/tools/swagger.ts` - OpenAPI/Swagger configuration

## TypeScript Configuration

- Target: ES6
- Module: CommonJS
- Strict mode enabled
- Output directory: `dist/`
- Includes `src/**/*` and `test/**/*`

---

## 📁 Migration Specifications (specs/)

The `specs/` folder contains a detailed 8-stage migration plan to modernize this API skeleton:

### Key Documents

1. **`specs/00_analisis_situacion_actual.md`** - Analysis of current architecture
2. **`specs/01_arquitectura_hexagonal.md`** - Hexagonal + Onion + Screaming Architecture design
3. **`specs/02_carpetas_versionadas.md`** - API versioning strategy (v1, v2, etc.)
4. **`specs/03_oportunidades_mejora.md`** - Improvement opportunities (validation, observability, etc.)
5. **`specs/04_plan_implementacion.md`** - 8-stage implementation plan (~32-50 days)
6. **`specs/05_enfoque_hibrido_pragmatico.md`** - Hybrid OOP + FP coding approach
7. **`specs/README.md`** - Index and executive summary

### Planned Tech Stack

- **Framework**: Fastify (replacing Express)
- **Compiler**: SWC (20x faster than tsc)
- **Testing**: Vitest (unit), Supertest (integration), k6 (performance)
- **Validation**: Zod (schema validation)
- **Logging**: Winston (structured logging)
- **Metrics**: Prometheus (prom-client)

### Hybrid Pragmatic Approach

The migration follows a **hybrid OOP + FP** philosophy:

| Concept | Implementation | Why |
|---------|---------------|-----|
| **Entities** | Immutable classes | Encapsulation + business methods |
| **Value Objects** | Immutable classes | Validation + equality |
| **DTOs** | Types/Interfaces | No logic, data only |
| **Mappers** | Pure functions | Transformation without state |
| **Use Cases** | Classes | Natural DI, easy testing |
| **Repositories** | Classes | State management |
| **Utilities** | Pure functions | Stateless helpers |

**Core Principles**:
- ✅ Immutability by default (`readonly`)
- ✅ Pure functions for business logic
- ✅ Composition over inheritance
- ✅ Strict type safety
- ✅ DDD (Domain-Driven Design)
- ✅ Dependency Injection

### Future Folder Structure

```
src/
├── @core/              # Domain layer (independent)
│   ├── domain/
│   │   └── greetings/  # Feature: Greetings (Screaming Architecture)
│   │       ├── entities/
│   │       ├── value-objects/
│   │       ├── services/
│   │       └── exceptions/
│   └── ports/
│       ├── inbound/    # Use case interfaces
│       └── outbound/   # Repository, Logger interfaces
├── @application/       # Use cases + DTOs
│   ├── v1/greetings/
│   │   ├── use-cases/
│   │   ├── dtos/
│   │   └── mappers/
│   └── v2/greetings/
└── @infrastructure/    # HTTP, DB, External services
    ├── http/
    │   ├── v1/
    │   └── v2/
    ├── persistence/
    └── observability/
```

**When working on this project**:
- Current code uses Express + Jest (legacy)
- Future code will use Fastify + Vitest (planned)
- Follow hybrid approach: classes for structure, functions for transformations
- Reference `specs/05_enfoque_hibrido_pragmatico.md` for code patterns

---

**For questions or clarifications about the migration plan, consult the specs folder first.**
