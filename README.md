<div id="top">
  <h1>Node API Skeleton <img src="https://cdn.iconscout.com/icon/free/png-256/typescript-1174965.png" width="25" height="25" /></h1>
</div>

<p>
Production-ready Node.js API skeleton built with <strong>Hexagonal Architecture</strong>, <strong>Fastify</strong>, <strong>TypeScript</strong>, <strong>DDD</strong>, and modern best practices. Perfect starting point for scalable, maintainable API projects.
</p>

## Status

[![Coverage Status](https://img.shields.io/coverallsCoverage/github/Proskynete/node-api-skeleton?logo=Coveralls)](https://coveralls.io/github/Proskynete/node-api-skeleton?branch=master) [![CI](https://img.shields.io/github/actions/workflow/status/Proskynete/node-api-skeleton/ci.yml?logo=GithubActions&logoColor=fff)](https://github.com/Proskynete/node-api-skeleton/actions/workflows/ci.yml) [![GitHub issues](https://img.shields.io/github/issues/Proskynete/node-api-skeleton)](https://github.com/Proskynete/node-api-skeleton/issues) [![GitHub forks](https://img.shields.io/github/forks/Proskynete/node-api-skeleton)](https://github.com/Proskynete/node-api-skeleton/network) [![GitHub stars](https://img.shields.io/github/stars/Proskynete/node-api-skeleton)](https://github.com/Proskynete/node-api-skeleton/stargazers) [![PRs welcome](https://img.shields.io/badge/PRs-welcome-green)](#CONTRIBUTING.md)

## 🎉 Architecture Status: PRODUCTION READY

> **Version 2.0** - Migration to Hexagonal Architecture + Fastify **COMPLETED**!

**All 8 migration stages completed** ✅

- ✅ **Stage 0**: SWC compiler, Fastify dependencies, path aliases
- ✅ **Stage 1**: Hexagonal folder structure, Zod validation, Fastify server
- ✅ **Stage 2**: Domain layer (entities, value objects, ports)
- ✅ **Stage 3**: Application layer (use cases, DTOs, mappers)
- ✅ **Stage 4**: Infrastructure layer (controllers, routes, repositories)
- ✅ **Stage 5**: Dependency Injection with Awilix
- ✅ **Stage 6**: Observability (Winston logging + Prometheus metrics)
- ✅ **Stage 7**: Testing (Vitest + k6 performance tests)
- ✅ **Stage 8**: Cleanup, documentation, Docker production setup

<details>
  <summary>📋 Table of Contents</summary>
  <ol>
    <li><a href="#highlights">Highlights</a></li>
    <li><a href="#features">Features</a></li>
    <li><a href="#architecture">Architecture</a></li>
    <li><a href="#folder-structure">Folder Structure</a></li>
    <li><a href="#quick-start">Quick Start</a></li>
    <li><a href="#docker">Docker</a></li>
    <li><a href="#api-endpoints">API Endpoints</a></li>
    <li><a href="#testing">Testing</a></li>
    <li><a href="#observability">Observability</a></li>
    <li><a href="#documentation">Documentation</a></li>
  </ol>
</details>

## ✨ Highlights

### 🏗️ Modern Architecture

- **Hexagonal Architecture** (Ports & Adapters) for clean separation of concerns
- **Onion Architecture** with dependency inversion
- **Screaming Architecture** - folder structure reflects business capabilities
- **DDD** (Domain-Driven Design) with entities, value objects, and aggregates
- **Vertical Slice** organization by bounded contexts

### ⚡ Performance

- **Fastify** - 2x faster than Express
- **SWC** - Ultra-fast TypeScript compiler (20x faster than tsc)
- **Build time**: ~56ms (was ~2-3s with tsc)
- **Production-ready** with Docker multi-stage builds

### 🧪 Testing & Quality

- **Vitest** - Lightning-fast unit & integration tests
- **k6** - Performance/load testing with thresholds
- **>80% coverage** - Comprehensive test suite
- **Type-safe** validation with Zod
- **ESLint + Prettier** - Code quality enforcement

### 📊 Observability

- **Winston** - Structured JSON logging
- **Prometheus** - Metrics collection (requests, latency, errors)
- **Grafana** - Metrics visualization
- **Health checks** - Liveness & readiness probes
- **OpenAPI** - Interactive API documentation

### 🐳 DevOps Ready

- **Docker** multi-stage builds (minimal Alpine images)
- **Docker Compose** stacks for dev & production
- **Non-root user** for security
- **Health checks** integrated
- **Prometheus + Grafana** stack included

## ⚙️ Features

### Core Stack

- ✅ [Fastify](https://fastify.dev/) - High-performance web framework
- ✅ [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- ✅ [SWC](https://swc.rs/) - Ultra-fast TypeScript compiler
- ✅ [Zod](https://zod.dev/) - Runtime schema validation
- ✅ [Awilix](https://github.com/jeffijoe/awilix) - Dependency injection

### Testing

- ✅ [Vitest](https://vitest.dev/) - Fast unit & integration tests
- ✅ [Supertest](https://github.com/ladjs/supertest) - HTTP endpoint testing
- ✅ [k6](https://k6.io/) - Load & performance testing
- ✅ [Pact](https://pact.io/) - Contract testing framework
- ✅ Coverage reports with v8

### Observability

- ✅ [Winston](https://github.com/winstonjs/winston) - Structured logging
- ✅ [Prometheus](https://prometheus.io/) - Metrics collection
- ✅ [prom-client](https://github.com/siimon/prom-client) - Prometheus client
- ✅ Health checks (liveness/readiness)
- ✅ [Swagger/OpenAPI](https://swagger.io/) - API documentation

### Security & Best Practices

- ✅ [@fastify/helmet](https://github.com/fastify/fastify-helmet) - Security headers
- ✅ [@fastify/cors](https://github.com/fastify/fastify-cors) - CORS support
- ✅ [@fastify/rate-limit](https://github.com/fastify/fastify-rate-limit) - Rate limiting
- ✅ Environment validation with Zod
- ✅ Docker non-root user
- ✅ Immutable domain entities
- ✅ ADRs (Architecture Decision Records)

### Development Tools

- ✅ [ESLint](https://eslint.org/) - Code linting
- ✅ [Prettier](https://prettier.io/) - Code formatting
- ✅ [Husky](https://typicode.github.io/husky/) - Git hooks
- ✅ [lint-staged](https://github.com/lint-staged/lint-staged) - Pre-commit checks
- ✅ [Nodemon](https://nodemon.io/) - Dev server auto-reload

## 🏗️ Architecture

### Hexagonal Architecture

The application follows **Hexagonal Architecture** (Ports & Adapters):

```
┌─────────────────────────────────────────┐
│  Infrastructure (Adapters)              │  ← Fastify, DB, External APIs
├─────────────────────────────────────────┤
│  Application (Use Cases)                │  ← Business orchestration
├─────────────────────────────────────────┤
│  Domain (Business Logic)                │  ← Pure business rules
└─────────────────────────────────────────┘
```

**Dependency Rule**: Dependencies point inward only

- Infrastructure → Application → Domain
- Domain has **zero** framework dependencies

### Vertical Slice by Contexts

Each bounded context is a complete vertical slice:

```
@contexts/greetings/
├── domain/            # Entities, Value Objects, Business Rules
├── application/       # Use Cases, DTOs, Mappers, Ports
└── infrastructure/    # Controllers, Routes, Repositories
```

**Benefits**:

- High cohesion - related code lives together
- Easy to navigate - no jumping between layers
- Scalable - add new contexts without touching existing ones
- Microservices-ready - easy to extract contexts

See [ARCHITECTURE.md](./docs/ARCHITECTURE.md) for complete documentation.

## 📁 Folder Structure

```
src/
├── @contexts/                 # Business Features (Bounded Contexts)
│   └── greetings/
│       ├── domain/            # Business Logic (framework-independent)
│       │   ├── entities/      # Greeting entity
│       │   ├── value-objects/ # Message value object
│       │   └── exceptions/    # Domain exceptions
│       ├── application/       # Use Cases & Orchestration
│       │   ├── v1/            # API version 1
│       │   │   ├── use-cases/ # GetGreetingUseCase
│       │   │   ├── dtos/      # Request/Response DTOs
│       │   │   ├── mappers/   # Domain ↔ DTO transformation
│       │   │   └── ports/     # Interfaces (inbound/outbound)
│       │   └── v2/            # API version 2 (enhanced)
│       └── infrastructure/    # Adapters (HTTP, DB, External)
│           ├── http/          # Controllers & Routes (v1, v2)
│           └── persistence/   # Repository implementations
│
├── @shared/                   # Cross-Cutting Concerns
│   ├── domain/                # Shared domain concepts
│   ├── infrastructure/
│   │   ├── config/            # Environment, DI container
│   │   ├── http/              # Fastify app, plugins
│   │   └── observability/     # Winston, Prometheus
│   ├── types/                 # Common types
│   ├── utils/                 # Pure utility functions
│   └── constants/             # HTTP status codes, etc.
│
├── @app/                      # Application Bootstrap
│   └── server/                # Fastify configuration
│
└── main.ts                    # Entry point
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 20
- npm >= 10
- Docker (optional, for containerized setup)
- k6 (optional, for performance tests)

### Installation

```bash
# Clone repository
git clone https://github.com/Proskynete/node-api-skeleton.git
cd node-api-skeleton

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

The API will be running at `http://localhost:3000`

### Available Scripts

```bash
# Development
npm run dev              # Start dev server with hot reload (SWC)
npm run build            # Build production bundle (SWC)
npm start                # Run production server

# Testing
npm run test             # Run all tests (Vitest)
npm run test:watch       # Run tests in watch mode
npm run test:ui          # Run tests with UI dashboard
npm run test:coverage    # Generate coverage report

# Performance Testing (k6)
npm run test:performance:v1    # Test v1 endpoint
npm run test:performance:v2    # Test v2 endpoint
npm run test:performance:load  # Full load test

# Code Quality
npm run lint             # Check linting
npm run lint:fix         # Fix linting issues
npm run format           # Format code with Prettier
npm run format:check     # Check formatting
```

## 🐳 Docker

### Quick Start with Docker Compose

```bash
# Start production stack (API + Prometheus + Grafana)
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down
```

### Development with Docker

```bash
# Start dev environment with hot reload
docker-compose -f docker-compose.dev.yml up -d
```

### Services

- **API**: http://localhost:3000
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001 (admin/admin)

See [DOCKER.md](./docs/DOCKER.md) for complete documentation.

## 📡 API Endpoints

### Health & Metrics

- **Liveness**: `GET /health/live` - Is the app running?
- **Readiness**: `GET /health/ready` - Can it serve traffic?
- **Metrics**: `GET /metrics` - Prometheus metrics
- **Docs**: `GET /docs` - Swagger UI

### Greetings API (v1)

- **Get Greeting**: `GET /api/v1/greetings`

### Greetings API (v2)

- **Get Greeting** (enhanced): `GET /api/v2/greetings`

**API Versioning**: Multiple versions coexist, sharing the same domain layer but with different use cases.

## 🧪 Testing

### Unit Tests

Test business logic in isolation:

```bash
npm run test
npm run test:watch
npm run test:coverage
```

**Coverage thresholds**: 80% for branches, functions, lines, statements

### Integration Tests

Test HTTP endpoints:

```typescript
describe("GET /api/v1/greetings", () => {
  it("should return greeting", async () => {
    const response = await request(app.server)
      .get("/api/v1/greetings")
      .expect(200);
    expect(response.body.message).toBe("Hello World!");
  });
});
```

### Performance Tests (k6)

Load testing with thresholds:

```bash
npm run test:performance:load
```

**Thresholds**:

- p95 < 500ms
- p99 < 1000ms
- Error rate < 1%
- Request rate > 50 req/s

See [test/performance/README.md](./test/performance/README.md)

## 📊 Observability

### Logging (Winston)

Structured JSON logging in production, pretty logs in development:

```typescript
logger.info("Processing request", {
  requestId: request.id,
  version: "v1",
});
```

### Metrics (Prometheus)

Available at `/metrics`:

- `http_request_duration_seconds` - Request latency
- `http_requests_total` - Total requests
- `http_requests_in_progress` - Active requests

### Health Checks

- **Liveness**: `/health/live` - Basic health check
- **Readiness**: `/health/ready` - Dependency health (memory, DB, etc.)

### OpenAPI Documentation

Interactive API docs at:

- **Swagger UI**: http://localhost:3000/docs

## 📚 Documentation

- **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - Complete architecture guide
- **[DOCKER.md](./docs/DOCKER.md)** - Docker setup and usage
- **[CLAUDE.md](./CLAUDE.md)** - Development guide for Claude Code
- **[specs/](./specs/)** - Migration plan and design decisions (historical)
- **[test/performance/README.md](./test/performance/README.md)** - k6 testing guide

## 🎯 Design Patterns

- **Dependency Injection** (Awilix)
- **Factory Pattern** (Entity creation)
- **Mapper Pattern** (Domain ↔ DTO)
- **Repository Pattern** (Data access)
- **Strategy Pattern** (API versioning)

## 🔒 Security

- Helmet security headers
- CORS configuration
- Input validation with Zod
- Non-root Docker user
- Environment variable validation

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with ❤️ using modern Node.js best practices
- Inspired by Clean Architecture, DDD, and Hexagonal Architecture principles

---

**Version**: 2.0.0
**Status**: Production Ready
**Architecture**: Hexagonal + Onion + Screaming
**Last Updated**: December 2024

<p align="right">(<a href="#top">⬆️ Back to top</a>)</p>
