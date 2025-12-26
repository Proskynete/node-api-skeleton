# ADR-0001: Use Hexagonal Architecture

## Status

Accepted

## Context

We needed an architectural pattern that would:
- Keep business logic independent of frameworks and external dependencies
- Make the codebase testable and maintainable
- Support long-term evolution and feature additions
- Enable team members to work independently on different features
- Facilitate migration to different frameworks or databases in the future

Traditional layered architectures often lead to tight coupling between layers, making it difficult to change technologies or test business logic in isolation.

## Decision

We will use **Hexagonal Architecture** (also known as Ports and Adapters) combined with:
- **Onion Architecture** principles for dependency management
- **Screaming Architecture** for code organization
- **Vertical Slice** approach with bounded contexts

### Key Principles

1. **Domain Layer** (core):
   - Contains pure business logic
   - No framework dependencies
   - Entities and Value Objects
   - Domain exceptions

2. **Application Layer** (use cases):
   - Orchestrates business logic
   - Defines ports (interfaces) for inbound and outbound operations
   - Contains DTOs and mappers
   - Framework-agnostic

3. **Infrastructure Layer** (adapters):
   - Implements ports defined by application layer
   - Contains framework-specific code (Fastify, HTTP, persistence)
   - Adapters for external services

### Directory Structure

```
src/@contexts/
└── {context}/
    ├── domain/          # Business logic
    ├── application/     # Use cases & ports
    └── infrastructure/  # Adapters (HTTP, DB, etc.)
```

## Consequences

### Positive

- **Testability**: Business logic can be tested without frameworks or databases
- **Flexibility**: Easy to swap implementations (e.g., change from Express to Fastify)
- **Maintainability**: Clear separation of concerns
- **Team scalability**: Multiple teams can work on different contexts independently
- **Future-proof**: Technology migrations are isolated to infrastructure layer

### Negative

- **Initial complexity**: More boilerplate compared to simple layered architecture
- **Learning curve**: Team needs to understand hexagonal architecture principles
- **More files**: More interfaces and classes to maintain

### Neutral

- **Code navigation**: Takes time to learn the structure, but becomes intuitive
- **Development speed**: Initially slower, but faster for long-term changes

## Alternatives Considered

### Alternative 1: Traditional Layered Architecture

- **Pros**: Simpler, more familiar to most developers
- **Cons**: Tight coupling, harder to test, difficult to migrate technologies
- **Why rejected**: Doesn't meet our long-term maintainability goals

### Alternative 2: Clean Architecture

- **Pros**: Similar benefits to Hexagonal Architecture
- **Cons**: More layers and complexity than we need
- **Why not chosen**: Hexagonal provides enough structure without over-engineering

### Alternative 3: Feature-based folders (no architecture)

- **Pros**: Very simple to start
- **Cons**: No clear boundaries, business logic mixed with infrastructure
- **Why rejected**: Doesn't scale well, leads to technical debt

## References

- [Hexagonal Architecture by Alistair Cockburn](https://alistair.cockburn.us/hexagonal-architecture/)
- [The Onion Architecture by Jeffrey Palermo](https://jeffreypalermo.com/2008/07/the-onion-architecture-part-1/)
- [Screaming Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2011/09/30/Screaming-Architecture.html)
- [Domain-Driven Design by Eric Evans](https://www.domainlanguage.com/ddd/)
