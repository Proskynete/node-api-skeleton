# Contributing to Node API Skeleton

Thank you for your interest in contributing to Node API Skeleton! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Commit Message Convention](#commit-message-convention)
- [Architecture Guidelines](#architecture-guidelines)

## Code of Conduct

This project and everyone participating in it is governed by our commitment to fostering an open and welcoming environment. Be respectful, professional, and constructive in all interactions.

## Getting Started

### Prerequisites

- Node.js >= 24
- npm >= 10
- Git
- Docker (optional, for testing containerized setup)
- k6 (optional, for performance testing)

### Setup Development Environment

1. Fork the repository on GitHub
2. Clone your fork locally:

   ```bash
   git clone https://github.com/YOUR_USERNAME/node-api-skeleton.git
   cd node-api-skeleton
   ```

3. Add upstream remote:

   ```bash
   git remote add upstream https://github.com/Proskynete/node-api-skeleton.git
   ```

4. Install dependencies:

   ```bash
   npm install
   ```

5. Copy environment file:

   ```bash
   cp .env.example .env
   ```

6. Run tests to ensure everything works:
   ```bash
   npm test
   ```

## Development Workflow

1. **Create a feature branch** from `main`:

   ```bash
   git checkout -b feat/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

2. **Make your changes** following our [coding standards](#coding-standards)

3. **Write/update tests** for your changes

4. **Run tests** to ensure everything passes:

   ```bash
   npm test
   npm run test:coverage
   ```

5. **Run linting**:

   ```bash
   npm run lint
   npm run format:check
   ```

6. **Commit your changes** using [conventional commits](#commit-message-convention):

   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```

7. **Push to your fork**:

   ```bash
   git push origin feat/your-feature-name
   ```

8. **Open a Pull Request** on GitHub

## Pull Request Process

### Before Submitting

- [ ] All tests pass (`npm test`)
- [ ] Code coverage meets threshold (80%+)
- [ ] Lint checks pass (`npm run lint`)
- [ ] Code is formatted (`npm run format`)
- [ ] Documentation is updated (if needed)
- [ ] CHANGELOG.md is updated (if needed)

### PR Template

When opening a PR, use the provided pull request template. Fill out all sections:

- **Summary**: What and why
- **Type of Change**: Feature, fix, refactor, etc.
- **Architecture Impact**: Affected layers and contexts
- **Testing Strategy**: Unit, integration, e2e, performance
- **Breaking Changes**: Migration guide if applicable

### Review Process

1. Automated checks must pass:
   - CI workflow (tests on Ubuntu, macOS, Windows)
   - Lint workflow (ESLint + Prettier)
   - Dependency review (security vulnerabilities)
   - PR title lint (conventional commits)

2. At least one maintainer review required

3. All review comments must be addressed

4. PR will be merged using squash merge strategy

## Coding Standards

### TypeScript Style

- **Strict mode**: All TypeScript strict checks enabled
- **Type safety**: Prefer explicit types over `any`
- **Immutability**: Use `readonly` where possible
- **Pure functions**: Avoid side effects in business logic

### Code Organization

Follow **Hexagonal Architecture** principles:

```
src/@contexts/your-context/
├── domain/            # Pure business logic
│   ├── entities/      # Business entities (immutable)
│   ├── value-objects/ # Value objects with validation
│   └── exceptions/    # Domain exceptions
├── application/       # Use cases and orchestration
│   └── v1/
│       ├── use-cases/ # Business workflows
│       ├── dtos/      # Data transfer objects
│       ├── mappers/   # Domain ↔ DTO transformations
│       └── ports/     # Interfaces (inbound/outbound)
└── infrastructure/    # External adapters
    ├── http/          # Controllers and routes
    └── persistence/   # Repository implementations
```

### Naming Conventions

- **Files**: kebab-case (`greeting.entity.ts`)
- **Classes**: PascalCase (`GreetingEntity`)
- **Interfaces**: PascalCase with `I` prefix (`IGreetingRepository`)
- **Functions**: camelCase (`getGreeting()`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRIES`)
- **Types**: PascalCase (`GreetingResponseDto`)

### ESLint Rules

The project uses ESLint with TypeScript support. Key rules:

- No `console.log` (use Winston logger)
- No unused variables
- No explicit `any` types
- Prefer arrow functions for callbacks
- Max line length: 100 characters

### Formatting

Code is auto-formatted with Prettier on commit. Configuration:

- Print width: 80
- Tab width: 2
- Single quotes
- Trailing commas: all
- Semicolons: always

## Testing Guidelines

### Test Coverage Requirements

Minimum coverage thresholds:

- **Statements**: 80%
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%

### Test Types

1. **Unit Tests** (`test/unit/`)
   - Test business logic in isolation
   - Mock external dependencies
   - Focus on domain and application layers

   ```typescript
   describe("Greeting Entity", () => {
     it("should create valid greeting", () => {
       const greeting = Greeting.create("Hello");
       expect(greeting.message).toBe("Hello");
     });
   });
   ```

2. **Integration Tests** (`test/integration/`)
   - Test HTTP endpoints
   - Test infrastructure components
   - Use Supertest for API testing

   ```typescript
   describe("GET /api/v1/greetings", () => {
     it("should return 200", async () => {
       await request(app.server).get("/api/v1/greetings").expect(200);
     });
   });
   ```

3. **E2E Tests** (`test/e2e/`)
   - Test complete user workflows
   - Test with real dependencies (when possible)

4. **Performance Tests** (`test/performance/`)
   - k6 load testing scripts
   - Define performance thresholds
   - Document performance requirements

5. **Contract Tests** (`test/contract/`)
   - Pact consumer/provider tests
   - Ensure API compatibility

### Test Best Practices

- **AAA Pattern**: Arrange, Act, Assert
- **Descriptive names**: Test names should clearly describe what is being tested
- **One assertion per test**: Keep tests focused
- **Test edge cases**: Empty inputs, null values, boundary conditions
- **Mock external dependencies**: Use Vitest mocks for external services
- **Clean up**: Restore state after each test

## Commit Message Convention

We follow **Conventional Commits** with emojis:

### Format

```
<emoji> <type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

- `✨ feat`: New feature
- `🐛 fix`: Bug fix
- `📝 docs`: Documentation changes
- `💄 style`: Code style (formatting, missing semicolons, etc.)
- `♻️ refactor`: Code refactoring
- `⚡️ perf`: Performance improvements
- `✅ test`: Adding or updating tests
- `🔧 chore`: Maintenance tasks
- `🚀 ci`: CI/CD changes
- `🗑️ revert`: Revert previous commit

### Examples

```bash
# Simple commit
✨ feat: add user authentication

# With scope
🐛 fix(api): correct token validation logic

# With body
♻️ refactor(server): extract plugins to separate files

- Created rate-limit.plugin.ts
- Created swagger.plugin.ts
- Reduced app.ts from 145 to 57 lines

# Breaking change
✨ feat(auth)!: require authentication for all endpoints

BREAKING CHANGE: All endpoints now require JWT token
```

### Scope

Common scopes:

- `api`: API endpoints
- `auth`: Authentication
- `db`: Database
- `ci`: CI/CD
- `deps`: Dependencies
- `docs`: Documentation

## Architecture Guidelines

### Hexagonal Architecture Principles

1. **Dependency Rule**: Dependencies point inward
   - Infrastructure → Application → Domain
   - Domain has zero framework dependencies

2. **Ports & Adapters**
   - Define ports (interfaces) in application layer
   - Implement adapters in infrastructure layer

3. **Vertical Slices**
   - Organize by bounded contexts (business features)
   - Each context contains all layers

### Domain-Driven Design

1. **Entities**: Objects with identity that change over time
2. **Value Objects**: Immutable objects compared by value
3. **Aggregates**: Cluster of entities with a root
4. **Domain Events**: Things that happened in the domain
5. **Repositories**: Abstract data access

### Adding New Features

#### Creating a New Context

1. Create context folder structure:

   ```bash
   mkdir -p src/@contexts/users/{domain,application,infrastructure}
   ```

2. Implement domain layer (entities, value objects)
3. Define application ports (interfaces)
4. Create use cases
5. Implement infrastructure adapters
6. Register in DI container
7. Add tests for all layers
8. Update documentation

#### Adding New Endpoint

1. Define use case in `application/vX/use-cases/`
2. Create DTOs in `application/vX/dtos/`
3. Create mapper in `application/vX/mappers/`
4. Implement controller in `infrastructure/http/vX/controllers/`
5. Register route in `infrastructure/http/vX/routes/`
6. Write tests (unit + integration)
7. Update OpenAPI documentation

### Documentation

When adding new features, update:

- [ ] `CLAUDE.md` - Development guidelines
- [ ] `CHANGELOG.md` - User-facing changes
- [ ] `README.md` - If public API changes
- [ ] ADRs - If architectural decision made
- [ ] Code comments - For complex logic
- [ ] JSDoc - For public APIs

### Architecture Decision Records (ADRs)

For significant architectural changes:

1. Copy template: `cp docs/adr/template.md docs/adr/0XXX-title.md`
2. Fill out sections:
   - Context and problem
   - Decision
   - Consequences
   - Alternatives considered
3. Submit with PR
4. Update ADR index

## Questions?

- Check existing issues and discussions
- Read documentation in `docs/`
- Open a new issue with your question

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Node API Skeleton! 🎉
