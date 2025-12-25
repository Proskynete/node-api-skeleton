# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Node API Skeleton is a **production-ready TypeScript API template** built with **Hexagonal Architecture**, **Fastify**, **Domain-Driven Design (DDD)**, and modern best practices. It's designed as a robust starting point for scalable API projects.

## ✅ Architecture Status: COMPLETED

**Migration from Express to Hexagonal Architecture + Fastify is COMPLETE**

- **Architecture**: Hexagonal + Onion + Screaming Architecture ✅
- **Stack**: Fastify, SWC, Vitest, Zod, Winston, Prometheus ✅
- **Approach**: Hybrid Pragmatic (OOP + FP) ✅
- **Status**: 🎉 **PRODUCTION READY** (All 8 stages completed)

## Development Commands

```bash
# Install dependencies
npm install

# Development server (auto-reload on changes with SWC)
npm run dev

# Build production bundle (using SWC - ultra fast!)
npm run build

# Run production server
npm start

# Linting
npm run lint          # Check for issues
npm run lint:fix      # Auto-fix issues

# Formatting
npm run format        # Format code
npm run format:check  # Check formatting

# Testing
npm run test                # Run all tests (Vitest)
npm run test:watch          # Run tests in watch mode
npm run test:ui             # Run tests with UI
npm run test:coverage       # Run with coverage report

# Performance Testing (k6)
npm run test:performance:v1    # Test v1 endpoint
npm run test:performance:v2    # Test v2 endpoint
npm run test:performance:load  # Full load test

# Docker
docker-compose up -d           # Start production stack
docker-compose -f docker-compose.dev.yml up -d  # Start dev stack
docker-compose down            # Stop services
```

## Architecture

### 📁 Folder Structure (Vertical Slice by Contexts)

```
src/
├── @contexts/                 # Bounded Contexts (Business Features)
│   └── greetings/             # Greetings Context ✅
│       ├── domain/            # Domain Layer (Business Logic)
│       │   ├── entities/      # Greeting entity
│       │   ├── value-objects/ # Message VO
│       │   └── exceptions/    # InvalidGreetingException
│       ├── application/       # Application Layer (Use Cases)
│       │   ├── v1/            # Version 1 API
│       │   │   ├── use-cases/ # GetGreetingUseCase
│       │   │   ├── dtos/      # Request/Response DTOs
│       │   │   ├── mappers/   # Domain ↔ DTO transformation
│       │   │   └── ports/
│       │   │       ├── inbound/  # IGetGreetingUseCase
│       │   │       └── outbound/ # IGreetingRepository
│       │   └── v2/            # Version 2 API (enhanced)
│       └── infrastructure/    # Infrastructure Layer (Adapters)
│           ├── http/          # HTTP Adapters
│           │   ├── v1/        # v1 controllers & routes
│           │   └── v2/        # v2 controllers & routes
│           └── persistence/   # Repository implementations
│
├── @shared/                   # Cross-Cutting Concerns
│   ├── domain/
│   │   └── exceptions/        # DomainException base class
│   ├── infrastructure/
│   │   ├── config/            # Environment (Zod), DI Container (Awilix)
│   │   ├── http/              # Fastify app, plugins
│   │   └── observability/     # Winston logger, Prometheus metrics
│   ├── types/                 # Result, common types
│   ├── utils/                 # Pure utility functions
│   └── constants/             # HTTP status, etc.
│
├── @app/                      # Application Bootstrap
│   └── server/                # Server configuration
│       ├── app.ts             # Fastify app builder
│       ├── health.ts          # Health checks (liveness/readiness)
│       ├── hooks/             # onRequest, onResponse (metrics)
│       ├── middlewares/       # Error handler
│       ├── plugins/           # CORS, Helmet
│       └── loaders/           # Auto-load routes
│
└── main.ts                    # Application Entry Point
```

### 🎯 Vertical Slice Architecture (Contexts)

Each **bounded context** is a complete vertical slice containing all layers:

```
@contexts/greetings/
├── domain/            # Business rules (framework-independent)
├── application/       # Use cases & orchestration
└── infrastructure/    # HTTP, persistence, external services
```

**Benefits**:

- **High cohesion**: All greetings code lives together
- **Easy navigation**: No jumping between layers
- **Scalability**: Add new contexts without touching existing ones
- **Team ownership**: Teams can own complete contexts
- **Microservices-ready**: Easy to extract a context into its own service

**Path Aliases**:

- `@contexts/*` - Bounded contexts (greetings, users, orders, etc.)
- `@shared/*` - Cross-cutting concerns (config, logger, types, utils)
- `@app/*` - Application bootstrap

### 🏗️ Hexagonal Architecture (Layers)

The application follows **Hexagonal Architecture** with clear dependency rules:

```
┌─────────────────────────────────────────┐
│  Infrastructure (Adapters)              │  ← HTTP, DB, External APIs
├─────────────────────────────────────────┤
│  Application (Use Cases)                │  ← Orchestration, DTOs
├─────────────────────────────────────────┤
│  Domain (Business Logic)                │  ← Pure business rules
└─────────────────────────────────────────┘
```

**Dependency Rule**: Dependencies always point **inward**:

- Infrastructure → Application → Domain
- Domain has **zero** framework dependencies

**Key Components**:

1. **Domain Layer** (`domain/`)
   - Entities: `Greeting` (immutable, business methods)
   - Value Objects: `Message` (validation, equality)
   - Exceptions: `InvalidGreetingException`
   - Pure business logic, no framework dependencies

2. **Application Layer** (`application/`)
   - Use Cases: `GetGreetingUseCase` (orchestrate business logic)
   - DTOs: `GreetingRequestDto`, `GreetingResponseDto`
   - Mappers: `GreetingMapper` (pure functions)
   - Ports: Interfaces for inbound (use cases) & outbound (repositories)

3. **Infrastructure Layer** (`infrastructure/`)
   - Controllers: Fastify route handlers
   - Routes: HTTP endpoint definitions
   - Repositories: `InMemoryGreetingRepository`
   - Framework-specific code

### Request Flow

HTTP Request → Router → Controller → Use Case → Domain Entity → Mapper → DTO → HTTP Response

**Example** (`/api/v1/greetings`):

1. Fastify routes to `GreetingController.getGreeting()`
2. Controller resolves `IGetGreetingUseCase` from DI container
3. Use case creates `Greeting` domain entity
4. `Message` value object validates business rules
5. `GreetingMapper` converts entity to DTO
6. Controller sends HTTP response

### API Versioning

Multiple API versions coexist:

```
/api/v1/greetings  → v1 controller → v1 use case
/api/v2/greetings  → v2 controller → v2 use case (enhanced)
```

Both versions share the same **domain layer** but have different use cases and DTOs.

## Technology Stack

### Core Framework

- **Fastify** (v5.6): High-performance web framework (2x faster than Express)
- **TypeScript** (v5.9): Type-safe JavaScript
- **SWC** (v1.15): Ultra-fast TypeScript compiler (20x faster than tsc)

### Domain & Validation

- **Zod** (v4.2): Runtime schema validation for environment and DTOs
- **DDD Patterns**: Entities, Value Objects, Aggregates

### Infrastructure

- **Winston** (v3.19): Structured JSON logging
- **Prom-client** (v15.1): Prometheus metrics (requests, latency, errors)
- **Awilix**: Dependency injection container
- **@fastify/swagger**: OpenAPI documentation
- **@fastify/swagger-ui**: Interactive API docs

### Testing

- **Vitest** (v4.0): Lightning-fast unit and integration tests
- **Supertest** (v7.1): HTTP endpoint testing
- **k6**: Load and performance testing (p95, p99 latencies)
- **@vitest/ui**: Test UI dashboard
- **@vitest/coverage-v8**: Code coverage

### DevOps & Observability

- **Docker**: Multi-stage production builds
- **Docker Compose**: Local dev stack (API + Prometheus + Grafana)
- **Prometheus**: Time-series metrics collection
- **Grafana**: Metrics visualization dashboards
- **Health Checks**: Liveness & readiness probes

### Development Tools

- **ESLint** (v9): Code linting
- **Prettier** (v3): Code formatting
- **Husky** (v8): Git hooks
- **lint-staged**: Pre-commit checks
- **nodemon**: Dev server auto-reload
- **pino-pretty**: Pretty logs in development

## Configuration

### Environment Variables

Environment configuration is validated with **Zod** at startup:

```typescript
// src/@shared/infrastructure/config/environment.ts
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]),
});
```

**Variables**:

- `NODE_ENV`: Environment (development/production/test)
- `PORT`: Server port (default: 3000)
- `LOG_LEVEL`: Logging level (debug/info/warn/error)

Copy `.env.example` to `.env` and configure.

## Testing

### Unit Tests (Domain & Application)

Test business logic in isolation:

```bash
npm run test
npm run test:watch
npm run test:ui
npm run test:coverage
```

**Location**: `test/unit/@contexts/greetings/`

**Coverage Thresholds**: 80% for branches, functions, lines, statements

**Example**:

```typescript
describe("Message Value Object", () => {
  it("should create valid message", () => {
    const message = Message.create("Hello");
    expect(message.value).toBe("Hello");
  });
});
```

### Integration Tests (Infrastructure)

Test HTTP endpoints and integrations:

```typescript
describe("GET /api/v1/greetings", () => {
  it("should return 200 and greeting", async () => {
    const response = await request(app.server)
      .get("/api/v1/greetings")
      .expect(200);
    expect(response.body.message).toBe("Hello World!");
  });
});
```

### Performance Tests (k6)

Load testing with specific thresholds:

```bash
npm run test:performance:v1     # Test v1 endpoint (20→50→100 users)
npm run test:performance:v2     # Test v2 endpoint
npm run test:performance:load   # Full load test (50→100→150 users)
```

**Thresholds**:

- p95 < 500ms
- p99 < 1000ms
- Error rate < 1%
- Request rate > 50 req/s

## Observability

### Logging (Winston)

Structured JSON logging in production, pretty logs in development:

```typescript
logger.info("Processing greeting request", {
  requestId: request.id,
  version: "v1",
});
```

**Log Levels**: debug, info, warn, error

### Metrics (Prometheus)

Available at `/metrics`:

- `http_request_duration_seconds`: Request latency (histogram)
- `http_requests_total`: Total request count
- `http_requests_in_progress`: Active requests

### Health Checks

- **Liveness**: `/health/live` - Is the app running?
- **Readiness**: `/health/ready` - Can the app serve traffic? (checks memory, dependencies)

### OpenAPI Documentation

Interactive API docs available at:

- **Swagger UI**: `http://localhost:3000/docs`
- **OpenAPI JSON**: `http://localhost:3000/docs/json`

## Docker

### Production

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down
```

**Services**:

- API: `http://localhost:3000`
- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3001` (admin/admin)

### Development

```bash
# Start dev environment with hot reload
docker-compose -f docker-compose.dev.yml up -d
```

See `docs/DOCKER.md` for complete documentation.

## Design Patterns

### 1. Dependency Injection (Awilix)

```typescript
container.register({
  logger: asClass(WinstonLogger).singleton(),
  greetingRepository: asClass(InMemoryGreetingRepository).singleton(),
  getGreetingUseCase: asClass(GetGreetingUseCase).singleton(),
});
```

### 2. Factory Pattern

```typescript
class Message {
  static create(value: string): Message {
    if (value.length < 1 || value.length > 200) {
      throw new InvalidGreetingException("Invalid message length");
    }
    return new Message(value);
  }
}
```

### 3. Mapper Pattern (Pure Functions)

```typescript
export const GreetingMapper = {
  toResponseDto(greeting: Greeting): GreetingResponseDto {
    return {
      message: greeting.message.value,
      timestamp: greeting.timestamp.toISOString(),
    };
  },
};
```

### 4. Repository Pattern

```typescript
interface IGreetingRepository {
  save(greeting: Greeting): Promise<void>;
  findById(id: string): Promise<Greeting | null>;
}

class InMemoryGreetingRepository implements IGreetingRepository {
  // Implementation
}
```

## Hybrid Approach: OOP + FP

This architecture uses a **pragmatic hybrid** of Object-Oriented and Functional Programming:

| Concept           | Implementation    | Why                              |
| ----------------- | ----------------- | -------------------------------- |
| **Entities**      | Immutable classes | Encapsulation + business methods |
| **Value Objects** | Immutable classes | Validation + equality            |
| **DTOs**          | Types/Interfaces  | Data only, no behavior           |
| **Mappers**       | Pure functions    | Stateless transformations        |
| **Use Cases**     | Classes           | Natural DI, testability          |
| **Repositories**  | Classes           | State management                 |
| **Utilities**     | Pure functions    | No side effects                  |

**Core Principles**:

- ✅ Immutability by default (`readonly`)
- ✅ Pure functions for transformations
- ✅ Composition over inheritance
- ✅ Strict type safety (TypeScript + Zod)
- ✅ DDD (Domain-Driven Design)
- ✅ Dependency Injection

## Adding New Features

### Creating a New Context

1. Create context folder:

```bash
mkdir -p src/@contexts/users/{domain,application,infrastructure}
```

2. Define domain entities and value objects
3. Create use cases and ports
4. Implement HTTP controllers and routes
5. Register in DI container

### Adding a New Endpoint to Existing Context

1. Create use case in `application/vX/use-cases/`
2. Define DTOs in `application/vX/dtos/`
3. Create mapper in `application/vX/mappers/`
4. Create controller in `infrastructure/http/vX/controllers/`
5. Register route in `infrastructure/http/vX/routes/`

Example:

```typescript
// 1. Use Case
export class CreateGreetingUseCase implements ICreateGreetingUseCase {
  async execute(
    request: CreateGreetingRequestDto
  ): Promise<GreetingResponseDto> {
    // Orchestrate domain logic
  }
}

// 2. Controller
export class GreetingController {
  static async createGreeting(request: FastifyRequest, reply: FastifyReply) {
    const useCase = container.resolve<ICreateGreetingUseCase>(
      "CreateGreetingUseCase"
    );
    const result = await useCase.execute(request.body);
    return reply.status(201).send(result);
  }
}

// 3. Route
app.post("/api/v1/greetings", GreetingController.createGreeting);
```

## Best Practices

### DO ✅

- Keep domain layer pure (no dependencies)
- Use dependency injection
- Write unit tests for business logic
- Use value objects for validation
- Make entities immutable
- Use factory methods for entity creation
- Define clear port interfaces
- Version your APIs
- Use DTOs for HTTP boundaries
- Log with structured context
- Monitor with Prometheus metrics

### DON'T ❌

- Put business logic in controllers
- Import infrastructure in domain
- Skip validation
- Mutate entities after creation
- Use framework-specific code in use cases
- Hardcode dependencies
- Skip error handling
- Expose domain entities directly via HTTP
- Use console.log (use logger instead)

## Git Hooks

Pre-commit hook automatically runs:

- `lint-staged`: Formats and lints staged files
- ESLint with auto-fix
- Prettier formatting

Configuration in `.lintstagedrc`.

## Migration History

This project was **successfully migrated** from Express to Hexagonal Architecture + Fastify:

**Before (v0.x)**:

- Framework: Express
- Architecture: Traditional layered (controllers, services, models)
- Compiler: TypeScript (tsc)
- Testing: Jest
- No observability

**After (v2.0)**:

- Framework: Fastify (2x performance improvement)
- Architecture: Hexagonal + DDD
- Compiler: SWC (40% faster builds)
- Testing: Vitest + k6
- Full observability (Winston + Prometheus + Grafana)
- Docker production-ready setup

**Benefits**:

- ✅ 40% faster build times
- ✅ 2x better runtime performance
- ✅ Better testability and maintainability
- ✅ Type-safe validation (Zod)
- ✅ Production-ready observability
- ✅ Docker multi-stage builds

## Documentation

- **docs/ARCHITECTURE.md**: Complete architecture documentation
- **docs/DOCKER.md**: Docker setup and usage guide
- **specs/**: Migration plan and design decisions (historical reference)
- **test/performance/README.md**: k6 performance testing guide

## Resources

### Architecture Patterns

- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- [Screaming Architecture](https://blog.cleancoder.com/uncle-bob/2011/09/30/Screaming-Architecture.html)

### Technology Documentation

- [Fastify](https://fastify.dev/)
- [Vitest](https://vitest.dev/)
- [Zod](https://zod.dev/)
- [Winston](https://github.com/winstonjs/winston)
- [Prometheus](https://prometheus.io/docs/)
- [k6](https://k6.io/docs/)

---

**Version**: 2.0.0 - Production Ready
**Architecture**: Hexagonal + Onion + Screaming
**Last Updated**: December 2024
