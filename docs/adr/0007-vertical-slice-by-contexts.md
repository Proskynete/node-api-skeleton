# ADR-0007: Organize Code by Bounded Contexts (Vertical Slices)

## Status

Accepted

## Context

Traditional layered architecture organizes code by technical concerns (controllers/, services/, models/), which can lead to:
- Scattered related code across many directories
- Difficulty finding all code related to a feature
- Tight coupling between unrelated features
- Merge conflicts when multiple teams work on different features

We needed a code organization strategy that would:
- Keep related code together
- Support team autonomy
- Scale to multiple features and teams
- Align with Domain-Driven Design principles

## Decision

We will organize code by **Bounded Contexts** using a **Vertical Slice Architecture** approach.

### Structure

```
src/@contexts/
├── greetings/              # Greetings Bounded Context
│   ├── domain/             # Business logic
│   │   ├── entities/
│   │   ├── value-objects/
│   │   └── exceptions/
│   ├── application/        # Use cases
│   │   ├── v1/
│   │   │   ├── use-cases/
│   │   │   ├── dtos/
│   │   │   ├── mappers/
│   │   │   └── ports/
│   │   └── v2/
│   └── infrastructure/     # Adapters
│       ├── http/
│       │   ├── v1/
│       │   │   ├── controllers/
│       │   │   └── routes/
│       │   └── v2/
│       └── persistence/
│
├── users/                  # Future: Users Context
│   ├── domain/
│   ├── application/
│   └── infrastructure/
│
└── orders/                 # Future: Orders Context
    ├── domain/
    ├── application/
    └── infrastructure/
```

### Naming Convention

- `@contexts/` prefix indicates bounded contexts
- Each context is self-contained
- Contexts can have multiple API versions (v1, v2, etc.)

## Consequences

### Positive

- **High cohesion**: All code for a feature lives together
- **Low coupling**: Contexts are independent and loosely coupled
- **Easy navigation**: Find everything about a feature in one place
- **Team autonomy**: Different teams can own different contexts
- **Microservices-ready**: Easy to extract a context into its own service
- **Clear boundaries**: Domain boundaries are explicit in folder structure
- **Screaming Architecture**: Project structure reveals what the system does

### Negative

- **Duplication**: Some code might be duplicated across contexts (shared kernel can help)
- **Larger folders**: Context folders can grow large with many features
- **Learning curve**: Developers need to understand bounded context concept

### Neutral

- **Shared code**: Use `@shared/` for truly cross-cutting concerns
- **Path aliases**: TypeScript path aliases make imports clean

## Alternatives Considered

### Alternative 1: Technical Layers (Traditional)

```
src/
├── controllers/
├── services/
├── models/
└── repositories/
```

- **Pros**: Familiar, simple to understand
- **Cons**: Features scattered across layers, tight coupling
- **Why rejected**: Doesn't scale well, hard to maintain

### Alternative 2: Feature-based (Flat)

```
src/features/
├── greetings/
├── users/
└── orders/
```

- **Pros**: Features grouped together
- **Cons**: No clear architecture within features, no layer separation
- **Why rejected**: Lacks architectural guidance within features

### Alternative 3: Domain-Driven Design Modules

```
src/modules/
└── greetings/
    ├── domain/
    ├── application/
    └── infrastructure/
```

- **Pros**: Similar to our approach
- **Cons**: "Modules" is less clear than "Contexts"
- **Why similar**: This is essentially what we're doing, different naming

## Principles

1. **Context Independence**: Each context should be independently deployable
2. **Shared Kernel**: Minimal shared code in `@shared/`
3. **Explicit Dependencies**: Contexts communicate through well-defined interfaces
4. **Version Support**: Multiple API versions can coexist (v1, v2, v3)

## References

- [Domain-Driven Design by Eric Evans](https://www.domainlanguage.com/ddd/)
- [Bounded Context by Martin Fowler](https://martinfowler.com/bliki/BoundedContext.html)
- [Vertical Slice Architecture by Jimmy Bogard](https://jimmybogard.com/vertical-slice-architecture/)
- [Screaming Architecture by Uncle Bob](https://blog.cleancoder.com/uncle-bob/2011/09/30/Screaming-Architecture.html)
