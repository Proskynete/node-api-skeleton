# Contract Testing with Pact

This directory contains contract tests using [Pact](https://pact.io/), focused on validating **Infrastructure Adapters** according to Hexagonal Architecture.

## 📚 Complete Documentation

For detailed guides on contract testing in this project, see:

- **[Provider Tests Guide](../../docs/guides/contract-testing-provider.md)** - HTTP inbound adapter validation (controllers) ✅ ACTIVE
- **[Consumer Tests Guide](../../docs/guides/contract-testing-consumer.md)** - HTTP outbound adapter validation (clients) ⚠️ REFERENCE

## Hexagonal Architecture and Contract Testing

In **Hexagonal Architecture (Ports and Adapters)**, contract tests specifically validate **adapters** that handle external communication, NOT business logic.

```
┌────────────────────────────────────────────────────────────┐
│              HEXAGONAL ARCHITECTURE                         │
├────────────────────────────────────────────────────────────┤
│                                                              │
│  INBOUND ADAPTERS (Input) ← Provider Tests ✅              │
│  ├─ HTTP Controllers (Fastify)                             │
│  │  └─ infrastructure/http/v*/controllers/                 │
│  │                                                          │
│  APPLICATION CORE (Ports + Domain)                         │
│  ├─ Use Cases (application/)                               │
│  ├─ Domain (entities, value objects)                       │
│  └─ Repository Ports (interfaces)                          │
│  │                                                          │
│  OUTBOUND ADAPTERS (Output) ← Consumer Tests ⚠️            │
│  ├─ InMemoryGreetingRepository (NO Pact needed)            │
│  └─ [External HTTP Clients] (NOT implemented)              │
│                                                              │
└────────────────────────────────────────────────────────────┘
```

## Tests in This Directory

### `greetings-provider.pact.spec.ts` ✅ ACTIVE

**Purpose**: Validates the **HTTP Inbound adapter** (controllers that expose our API).

**Components tested**:

- `@contexts/greetings/infrastructure/http/v1/controllers/GreetingController.ts`
- `@contexts/greetings/infrastructure/http/v2/controllers/GreetingController.ts`

**Run**:

```bash
npm run test:contract
```

## Key Principles

### ✅ WHAT to Test with Pact

1. **Provider Tests**: HTTP **Inbound** Adapters (Controllers/Routes)
   - Validate that our endpoints comply with contracts
   - Test: `infrastructure/http/controllers`

2. **Consumer Tests**: HTTP **Outbound** Adapters (HTTP Clients)
   - Validate that our HTTP clients comply with contracts
   - Test: `infrastructure/clients` or `infrastructure/adapters/http`

### ❌ WHAT NOT to Test with Pact

- ❌ Use cases (application layer)
- ❌ Domain entities (domain layer)
- ❌ In-memory repositories
- ❌ Communication between internal layers
- ❌ Business logic

## Useful Commands

```bash
# Run contract tests
npm run test:contract

# Run all tests (includes contract)
npm run test:all

# Publish pacts to Pact Broker (in CI/CD)
npx pact-broker publish pacts \
  --broker-base-url=$PACT_BROKER_URL \
  --broker-token=$PACT_BROKER_TOKEN \
  --consumer-app-version=$GIT_COMMIT
```

## When to Use Each Type

### Provider Tests (Our Current Case)

**Use when**:

- ✅ We expose HTTP endpoints (REST, GraphQL)
- ✅ Other systems/teams consume our API
- ✅ We need to guarantee contracts with consumers

### Consumer Tests (Future)

**Use when**:

- ✅ We consume external HTTP APIs
- ✅ We implement HTTP clients as adapters
- ✅ We need to ensure we comply with external provider contracts

**Note**: This project currently has NO HTTP outbound adapters, so no consumer tests are implemented.

## CI/CD Integration

```yaml
# GitHub Actions Example
- name: Verify Provider Contracts
  env:
    CI: true
    GIT_COMMIT: ${{ github.sha }}
    GIT_BRANCH: ${{ github.ref_name }}
  run: npm run test:contract
```

## Resources

- [Pact Documentation](https://docs.pact.io/)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [Pact JS](https://github.com/pact-foundation/pact-js)
- [Contract Testing Best Practices](https://docs.pact.io/getting_started/testing_contracts)

## Summary: What to Test in Each Layer

| Layer                              | What to Test                                | Test Type                    |
| ---------------------------------- | ------------------------------------------- | ---------------------------- |
| **Domain**                         | Entities, Value Objects, Business rules     | Unit Tests                   |
| **Application**                    | Use cases, Orchestration                    | Unit/Integration Tests       |
| **Infrastructure (HTTP Inbound)**  | Controllers, Routes                         | **Provider Tests** (Pact) ✅ |
| **Infrastructure (HTTP Outbound)** | HTTP Clients, API Adapters                  | **Consumer Tests** (Pact) ⚠️ |
| **Infrastructure (Persistence)**   | Repositories, Databases                     | Integration Tests            |

---

**Current Project Status**:

- ✅ Provider Tests: Implemented and active
- ⚠️ Consumer Tests: Not implemented (no HTTP outbound adapters)

**Version**: 2.1.0
**Last Updated**: December 2024
