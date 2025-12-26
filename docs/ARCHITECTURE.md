# Architecture Documentation

## Overview

This project implements a **Hexagonal Architecture** (also known as Ports and Adapters) combined with **Onion Architecture** and **Screaming Architecture** principles. The architecture is designed to create highly maintainable, testable, and scalable applications with clear separation of concerns.

## Architecture Principles

### 1. Hexagonal Architecture (Ports and Adapters)

The application is organized in concentric layers where dependencies point inward:

```
┌─────────────────────────────────────────┐
│        Infrastructure Layer             │  ← Frameworks, DB, HTTP
├─────────────────────────────────────────┤
│        Application Layer                │  ← Use Cases, DTOs, Mappers
├─────────────────────────────────────────┤
│        Domain Layer                     │  ← Business Logic (Core)
└─────────────────────────────────────────┘
```

**Key Principles:**

- **Domain independence**: Business logic doesn't depend on frameworks or infrastructure
- **Testability**: Core business logic can be tested without external dependencies
- **Flexibility**: Easy to swap implementations (database, framework, etc.)
- **Ports**: Interfaces that define contracts
- **Adapters**: Implementations of ports

### 2. Screaming Architecture

The folder structure "screams" what the application does, not which framework it uses:

```
src/
├── @contexts/         # Business contexts (what the app does)
│   └── greetings/     # ← Screams "this handles greetings!"
└── @shared/           # Cross-cutting concerns
```

Instead of organizing by technical layers (`controllers/`, `services/`, `repositories/`), we organize by **business capabilities** (contexts).

### 3. Vertical Slice Architecture

Each context is a complete vertical slice containing all layers:

```
@contexts/greetings/
├── domain/            # Business rules
├── application/       # Use cases
└── infrastructure/    # HTTP, persistence
```

**Benefits:**

- **High cohesion**: Related code stays together
- **Easy navigation**: Everything about greetings is in one place
- **Scalability**: Add new contexts without touching existing ones
- **Team ownership**: A team can own a complete context

## Folder Structure

### Complete Directory Tree

```
src/
├── @contexts/                     # Bounded Contexts (Business Features)
│   └── greetings/                 # Greetings Context
│       ├── domain/                # Domain Layer (Business Logic)
│       │   ├── entities/          # Entities (Greeting)
│       │   ├── value-objects/     # Value Objects (Message)
│       │   └── exceptions/        # Domain Exceptions
│       ├── application/           # Application Layer (Use Cases)
│       │   ├── v1/                # Version 1 API
│       │   │   ├── use-cases/     # Use Case Implementations
│       │   │   ├── dtos/          # Data Transfer Objects
│       │   │   ├── mappers/       # Domain ↔ DTO Mappers
│       │   │   └── ports/
│       │   │       ├── inbound/   # Use Case Interfaces
│       │   │       └── outbound/  # Repository Interfaces
│       │   └── v2/                # Version 2 API (same structure)
│       └── infrastructure/        # Infrastructure Layer (Adapters)
│           ├── http/              # HTTP Adapters (Controllers, Routes)
│           │   ├── v1/
│           │   │   ├── controllers/
│           │   │   └── routes/
│           │   └── v2/
│           └── persistence/       # Database Adapters (Repositories)
│
├── @shared/                       # Cross-Cutting Concerns
│   ├── domain/                    # Shared Domain Concepts
│   │   └── exceptions/            # Base DomainException
│   ├── infrastructure/
│   │   ├── config/                # Environment, DI Container
│   │   ├── http/                  # Fastify app, plugins
│   │   └── observability/         # Logger, Metrics
│   ├── types/                     # Common Types (Result, etc.)
│   ├── utils/                     # Utility Functions
│   └── constants/                 # HTTP Status, etc.
│
├── @app/                          # Application Bootstrap
│   └── server/                    # Server configuration
│       ├── app.ts                 # Fastify app builder
│       ├── health.ts              # Health checks
│       ├── hooks/                 # Fastify hooks
│       ├── middlewares/           # Error handlers
│       ├── plugins/               # CORS, Helmet
│       └── loaders/               # Route auto-loader
│
└── main.ts                        # Application Entry Point
```

### Layer Descriptions

#### Domain Layer (`@contexts/*/domain/`)

The **core** of the application. Contains pure business logic with zero framework dependencies.

**Components:**

- **Entities**: Business objects with identity (e.g., `Greeting`)
- **Value Objects**: Immutable objects representing values (e.g., `Message`)
- **Exceptions**: Domain-specific errors (e.g., `InvalidGreetingException`)
- **Business Rules**: Pure functions or methods that enforce business constraints

**Rules:**

- ✅ No dependencies on infrastructure
- ✅ No dependencies on frameworks
- ✅ Immutable by default (`readonly`)
- ✅ Pure business logic
- ❌ No HTTP, database, or external service knowledge

**Example:**

```typescript
// Greeting Entity
export class Greeting {
  private constructor(
    public readonly message: Message,
    public readonly timestamp: Date
  ) {}

  static create(message: Message): Greeting {
    return new Greeting(message, new Date());
  }
}
```

#### Application Layer (`@contexts/*/application/`)

Orchestrates business logic through **Use Cases**. Defines **ports** (interfaces) for communication.

**Components:**

- **Use Cases**: Application-specific business rules (e.g., `GetGreetingUseCase`)
- **DTOs**: Data structures for input/output
- **Mappers**: Convert between Domain and DTOs
- **Ports**:
  - **Inbound**: Use case interfaces (what the app can do)
  - **Outbound**: Repository/logger interfaces (what the app needs)

**Rules:**

- ✅ Depends on Domain layer
- ✅ Defines interfaces (ports)
- ✅ Orchestrates domain entities
- ❌ No direct framework dependencies
- ❌ No HTTP/database details

**Example:**

```typescript
// Use Case
export class GetGreetingUseCase implements IGetGreetingUseCase {
  constructor(private readonly logger: ILogger) {}

  async execute(request: GreetingRequestDto): Promise<GreetingResponseDto> {
    const message = Message.create(request.name);
    const greeting = Greeting.create(message);
    return GreetingMapper.toResponseDto(greeting);
  }
}
```

#### Infrastructure Layer (`@contexts/*/infrastructure/`)

**Adapters** that implement ports defined in the application layer.

**Components:**

- **HTTP Adapters**: Controllers, routes, Fastify-specific code
- **Persistence Adapters**: Repository implementations (in-memory, SQL, NoSQL)
- **External Services**: Third-party API clients

**Rules:**

- ✅ Implements application layer ports
- ✅ Framework-specific code lives here
- ✅ Database queries, HTTP handling
- ❌ No business logic

**Example:**

```typescript
// Controller (HTTP Adapter)
export class GreetingController {
  static async getGreeting(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const useCase =
      container.resolve<IGetGreetingUseCase>("GetGreetingUseCase");
    const result = await useCase.execute({});
    return reply.status(200).send(result);
  }
}
```

## Dependency Flow

```
Infrastructure → Application → Domain
     ↑              ↑            ↑
  Depends on    Depends on   Independent
```

**The Dependency Rule**: Source code dependencies must point **inward only**.

- **Domain** has no dependencies
- **Application** depends on Domain
- **Infrastructure** depends on Application and Domain

## API Versioning

The architecture supports multiple API versions simultaneously:

```
@contexts/greetings/
├── application/
│   ├── v1/          # Version 1 logic
│   └── v2/          # Version 2 logic
└── infrastructure/
    └── http/
        ├── v1/      # Version 1 endpoints
        └── v2/      # Version 2 endpoints
```

**Routes:**

- `/api/v1/greetings` → v1 controller → v1 use case
- `/api/v2/greetings` → v2 controller → v2 use case

Both versions can coexist and share domain entities.

## Design Patterns

### 1. Dependency Injection (DI)

Uses `awilix` for automatic dependency injection:

```typescript
// container.ts
container.register({
  logger: asClass(WinstonLogger).singleton(),
  greetingRepository: asClass(InMemoryGreetingRepository).singleton(),
  getGreetingUseCase: asClass(GetGreetingUseCase).singleton(),
});
```

### 2. Factory Pattern

Static factory methods for entity creation:

```typescript
class Message {
  static create(value: string): Message {
    // Validation
    return new Message(value);
  }
}
```

### 3. Mapper Pattern

Pure functions to transform data:

```typescript
export const GreetingMapper = {
  toResponseDto(greeting: Greeting): GreetingResponseDto {
    return { message: greeting.message.value };
  },
};
```

### 4. Repository Pattern

Abstracts data access:

```typescript
// Port (interface)
export interface IGreetingRepository {
  save(greeting: Greeting): Promise<void>;
  findById(id: string): Promise<Greeting | null>;
}

// Adapter (implementation)
export class InMemoryGreetingRepository implements IGreetingRepository {
  private greetings: Map<string, Greeting> = new Map();

  async save(greeting: Greeting): Promise<void> {
    this.greetings.set(greeting.id, greeting);
  }
}
```

## Hybrid Approach: OOP + FP

This architecture uses a **pragmatic hybrid** of Object-Oriented and Functional Programming:

| Concept       | Implementation    | Why                       |
| ------------- | ----------------- | ------------------------- |
| Entities      | Immutable Classes | Encapsulation + methods   |
| Value Objects | Immutable Classes | Validation + equality     |
| DTOs          | Types/Interfaces  | Data only, no behavior    |
| Mappers       | Pure Functions    | Stateless transformations |
| Use Cases     | Classes           | Natural DI, testability   |
| Repositories  | Classes           | State management          |
| Utilities     | Pure Functions    | No side effects           |

**Core Principles:**

- ✅ Immutability by default (`readonly`)
- ✅ Pure functions for transformations
- ✅ Composition over inheritance
- ✅ Strict type safety (TypeScript + Zod)

## Technology Stack

### Core Framework

- **Fastify**: High-performance web framework
- **TypeScript**: Type-safe JavaScript
- **SWC**: Ultra-fast TypeScript compiler

### Domain & Validation

- **Zod**: Runtime schema validation
- **Class-based entities**: Encapsulation

### Infrastructure

- **Winston**: Structured logging
- **Prom-client**: Prometheus metrics
- **Awilix**: Dependency injection

### Testing

- **Vitest**: Unit and integration tests
- **Supertest**: HTTP endpoint testing
- **k6**: Load and performance testing

### DevOps

- **Docker**: Multi-stage production builds
- **Docker Compose**: Local development stack
- **Prometheus**: Metrics collection
- **Grafana**: Metrics visualization

## Request Flow Example

Let's trace a request to `/api/v1/greetings`:

```
1. HTTP Request
   ↓
2. Fastify Router (infrastructure/http/v1/routes/greeting.routes.ts)
   ↓
3. Controller (infrastructure/http/v1/controllers/GreetingController.ts)
   ↓
4. Use Case (application/v1/use-cases/GetGreetingUseCase.ts)
   ↓
5. Domain Entity (domain/entities/Greeting.ts)
   ↓
6. Mapper (application/v1/mappers/GreetingMapper.ts)
   ↓
7. DTO Response (application/v1/dtos/GreetingResponseDto.ts)
   ↓
8. HTTP Response
```

**Step-by-step:**

1. Request hits Fastify
2. Route matches and calls controller
3. Controller resolves use case from DI container
4. Use case creates domain entity
5. Entity validates business rules
6. Mapper converts entity to DTO
7. DTO is returned to controller
8. Controller sends HTTP response

## Testing Strategy

The project implements a comprehensive testing strategy covering all architectural layers:

```
Unit Tests        → Domain & Application Layers
Integration Tests → Infrastructure Layer (HTTP)
Contract Tests    → Infrastructure Layer (Adapters)
E2E Tests         → Full application flow
Performance Tests → Load and stress testing
```

### Unit Tests (Domain & Application)

Test business logic in isolation using **Vitest**:

```typescript
// Domain test
describe("Message Value Object", () => {
  it("should create valid message", () => {
    const message = Message.create("Hello");
    expect(message.value).toBe("Hello");
  });
});

// Application test
describe("GetGreetingUseCase", () => {
  it("should return greeting", async () => {
    const useCase = new GetGreetingUseCase(mockLogger);
    const result = await useCase.execute({});
    expect(result.message).toBeDefined();
  });
});
```

**Run:**
```bash
npm run test:unit
```

### Integration Tests (Infrastructure)

Test HTTP endpoints using **Vitest + Supertest**:

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

**Run:**
```bash
npm run test:integration
npm run test:e2e
```

### Contract Tests (Pact)

Validate infrastructure adapters according to Hexagonal Architecture principles using **Pact Foundation**:

**Provider Tests** - Validate HTTP Inbound Adapters (Controllers):
```typescript
describe("Pact Provider - HTTP Inbound Adapter", () => {
  it("should verify controllers fulfill consumer contracts", async () => {
    const verifier = new Verifier({
      provider: "GreetingsAPI",
      providerBaseUrl: "http://localhost:5055",
      pactUrls: ["pacts/webapp-greetingsapi.json"],
    });
    await verifier.verifyProvider();
  });
});
```

**Consumer Tests** - Validate HTTP Outbound Adapters (API Clients):
- Reference documentation available in `docs/guides/contract-testing-consumer.md`
- Only applicable when consuming external HTTP APIs

**What Contract Tests Validate:**
- ✅ HTTP Inbound Adapters (controllers, routes)
- ✅ HTTP Outbound Adapters (API clients, if they exist)
- ❌ Business logic (use unit tests)
- ❌ Use cases (use integration tests)

**Run:**
```bash
npm run test:contract
```

**Documentation:**
- [Provider Tests Guide](./guides/contract-testing-provider.md)
- [Consumer Tests Guide](./guides/contract-testing-consumer.md)
- [Contract Testing README](../test/contract/README.md)

### Performance Tests (k6)

Load and stress testing using **k6**:

```javascript
// Simple load test
export default function () {
  const response = http.get("http://localhost:3000/api/v1/greetings");
  check(response, {
    "status is 200": (r) => r.status === 200,
    "response time < 500ms": (r) => r.timings.duration < 500,
  });
}

export const options = {
  stages: [
    { duration: "30s", target: 20 },  // Ramp up
    { duration: "1m", target: 50 },   // Stay at 50 users
    { duration: "30s", target: 100 }, // Peak load
    { duration: "30s", target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<500", "p(99)<1000"],
    http_req_failed: ["rate<0.01"],
  },
};
```

**Automated Test Runner:**

The project includes an automated performance test runner that discovers and executes all `*.k6.js` files:

```bash
# Automatically runs all performance tests
npm run test:performance

# Or run individual tests
npm run test:performance:v1
npm run test:performance:v2
npm run test:performance:load
```

**Features:**
- 🔍 Auto-discovers all k6 test files
- 📊 Runs tests sequentially with detailed output
- ✨ Colored console output
- 📈 Summary report with pass/fail status
- ❌ Exits with error code on failures

**Adding New Tests:**
Simply create a new `*.k6.js` file in `test/performance/` - no need to update package.json.

**Documentation:**
- [Performance Testing README](../test/performance/README.md)
- [Test Runner Script](../scripts/README.md)

### Test Hierarchy

| Test Type | Layer | Tool | What to Test |
|-----------|-------|------|--------------|
| **Unit** | Domain + Application | Vitest | Entities, Value Objects, Use Cases |
| **Integration** | Infrastructure | Vitest + Supertest | HTTP endpoints, repositories |
| **Contract** | Infrastructure | Pact | HTTP adapters (inbound/outbound) |
| **E2E** | Full Stack | Vitest + Supertest | Complete user flows |
| **Performance** | Full Stack | k6 | Load, stress, spike testing |

## Observability

### Logging

Structured logging with Winston:

```typescript
logger.info("Processing greeting request", {
  requestId: request.id,
  version: "v1",
});
```

### Metrics

Prometheus metrics:

- `http_request_duration_seconds`: Request latency
- `http_requests_total`: Request count
- `http_requests_in_progress`: Active requests

### Health Checks

- **Liveness**: `/health/live` - Is the app running?
- **Readiness**: `/health/ready` - Can the app serve traffic?

## Adding New Features

### Creating a New Context

1. Create context folder:

```
src/@contexts/users/
├── domain/
├── application/
└── infrastructure/
```

2. Define domain entities
3. Create use cases
4. Implement HTTP controllers
5. Register routes

### Adding a New Endpoint to Existing Context

1. Create use case in `application/vX/use-cases/`
2. Define DTOs in `application/vX/dtos/`
3. Create controller in `infrastructure/http/vX/controllers/`
4. Register route in `infrastructure/http/vX/routes/`

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

### DON'T ❌

- Put business logic in controllers
- Import infrastructure in domain
- Skip validation
- Mutate entities after creation
- Use framework-specific code in use cases
- Hardcode dependencies
- Skip error handling
- Expose domain entities directly via HTTP

## Migration from Express

This project was migrated from Express to Fastify with Hexagonal Architecture:

**Before:**

```
src/
├── controllers/
├── routes/
├── services/
└── models/
```

**After:**

```
src/
├── @contexts/
│   └── greetings/
│       ├── domain/
│       ├── application/
│       └── infrastructure/
└── @shared/
```

**Benefits:**

- 40% faster build times (SWC vs tsc)
- 2x better performance (Fastify vs Express)
- Better testability (hexagonal architecture)
- Type-safe validation (Zod)
- Production-ready observability (Winston + Prometheus)

## Resources

### Architecture Patterns

- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- [Screaming Architecture](https://blog.cleancoder.com/uncle-bob/2011/09/30/Screaming-Architecture.html)

### Documentation

- [Fastify](https://fastify.dev/)
- [Vitest](https://vitest.dev/)
- [Zod](https://zod.dev/)
- [Winston](https://github.com/winstonjs/winston)
- [k6](https://k6.io/docs/)

---

**Last Updated**: December 2024
**Architecture Version**: 2.0.0
**Status**: Production Ready
