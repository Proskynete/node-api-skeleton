# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records (ADRs) for the Node API Skeleton project.

## What are ADRs?

Architecture Decision Records document important architectural decisions made in the project, including:
- The context and problem being addressed
- The decision made
- The consequences of that decision

## ADR Format

Each ADR follows a consistent format:
1. **Title**: Short noun phrase
2. **Status**: Proposed, Accepted, Deprecated, Superseded
3. **Context**: The issue motivating this decision
4. **Decision**: The change being proposed or made
5. **Consequences**: The results of applying this decision

## Index

### Architecture & Design

- [ADR-0001](0001-use-hexagonal-architecture.md) - Use Hexagonal Architecture
- [ADR-0007](0007-vertical-slice-by-contexts.md) - Organize code by bounded contexts
- [ADR-0009](0009-use-hybrid-pragmatic-approach.md) - Use Hybrid Pragmatic Approach (OOP + FP)

### Framework & Tooling

- [ADR-0002](0002-use-fastify-instead-of-express.md) - Use Fastify instead of Express
- [ADR-0003](0003-use-swc-for-compilation.md) - Use SWC for TypeScript compilation
- [ADR-0004](0004-use-vitest-for-testing.md) - Use Vitest for testing
- [ADR-0005](0005-use-zod-for-validation.md) - Use Zod for validation

### Observability & Operations

- [ADR-0006](0006-use-winston-for-logging.md) - Use Winston for logging
- [ADR-0010](0010-use-observability-stack.md) - Use Winston and Prometheus for observability
- [ADR-0011](0011-use-k6-for-performance-testing.md) - Use k6 for performance testing

### API Design

- [ADR-0008](0008-use-path-based-api-versioning.md) - Use path-based API versioning strategy

## Creating New ADRs

1. Copy `template.md` to a new file with the next number
2. Fill in the sections
3. Submit for review
4. Update this README with the new ADR

## Template

See [template.md](template.md) for the ADR template.
