# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Domain events infrastructure with pub/sub pattern
  - `IDomainEvent`, `IDomainEventHandler`, and `IDomainEventPublisher` interfaces
  - `InMemoryDomainEventPublisher` implementation
  - `GreetingCreatedEvent` and `GreetingCreatedEventHandler` as examples
  - Support for multiple handlers per event type
- Result type for explicit error handling
  - Railway Oriented Programming pattern in use cases
  - `GreetingFetchException` for repository errors
  - Type-safe error handling throughout application layer
- Environment-based CORS and CSP configuration
  - CORS with restricted origins in production
  - `ALLOWED_ORIGINS` environment variable with Zod validation
  - CSP (Content Security Policy) enabled only in production
- Zod schemas to Fastify routes for OpenAPI documentation
  - `ErrorResponseSchema` for consistent error responses
  - Automatic OpenAPI/Swagger documentation generation
  - Schemas for 200, 400, and 500 status codes
- Prisma v7 configuration with dual database support
  - Schemas for PostgreSQL and MongoDB
  - Comprehensive usage examples and migration guide
  - npm scripts for Prisma operations
- Performance testing enhancements
  - File filter parameter to performance test runner
  - Automated performance test runner script

### Changed

- Updated error handling to use `issues` instead of `errors` (Zod v4)
- Improved CORS configuration for production security

### Documentation

- Added ADR-0008: Path-based API versioning strategy
- Added ADR-0009: Hybrid pragmatic approach (OOP + FP)
- Added ADR-0010: Observability stack (Winston + Prometheus + Grafana)
- Added ADR-0011: k6 for performance testing
- Updated CLAUDE.md with Prisma v7 integration guide
- Updated README.md with latest features and architecture
- Enhanced testing strategy documentation
- Documented domain events, Result type, and Zod schemas

### Removed

- Historical planning documents from specs/ directory
- Obsolete integration test placeholders

## [2.0.0] - 2024-12-26

### Added

- Hexagonal Architecture with Clean Architecture principles
- Fastify web framework (2x faster than Express)
- SWC compiler (40% faster builds than tsc)
- Vitest testing framework with coverage
- k6 performance testing with thresholds
- Zod runtime validation for environment and DTOs
- Winston structured logging
- Prometheus metrics with Grafana dashboards
- Domain-Driven Design patterns (Entities, Value Objects, Aggregates)
- Dependency injection with Awilix
- Health checks (liveness and readiness)
- Rate limiting with configurable thresholds
- Docker multi-stage builds
- OpenAPI/Swagger documentation
- API versioning (v1 and v2)
- Contract testing with Pact

### Changed

- Migrated from Express to Fastify
- Migrated from Jest to Vitest
- Migrated from tsc to SWC
- Reorganized architecture from layered to hexagonal

### Documentation

- Complete architecture documentation
- ADRs for all major decisions
- Testing strategy guide
- Docker setup guide
- Performance testing guide
- Contract testing guide

[unreleased]: https://github.com/yourusername/node-api-skeleton/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/yourusername/node-api-skeleton/releases/tag/v2.0.0
