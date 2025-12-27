# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.2.0] - 2024-12-27

### Changed

- **Dependency Updates** - Consolidated 10 Dependabot updates
  - **Production Dependencies**:
    - `dotenv`: 16.6.1 → 17.2.3 (major version bump)
  - **Development Dependencies**:
    - `@types/supertest`: 2.0.16 → 6.0.3 (major version bump)
    - `husky`: 8.0.3 → 9.1.7 (major version bump)
    - `eslint-config-prettier`: 9.1.2 → 10.1.8 (major version bump)
    - `@types/ioredis`: 4.28.10 → 5.0.0 (major version bump)
    - `cross-env`: 7.0.3 → 10.1.0 (major version bump)
  - **GitHub Actions**:
    - `actions/checkout`: v4 → v6
    - `actions/stale`: v9 → v10
    - `amannn/action-semantic-pull-request`: v5 → v6
    - `actions/setup-python`: v5 → v6

### Security

- Updated dependencies to latest versions with security fixes
- All tests passing with updated dependencies (165 unit + 28 integration)

## [2.1.0] - 2024-12-26

### Added

- **GitHub Actions CI/CD Pipeline** - Complete modular workflow automation
  - Core workflows: CI (multi-OS testing), Lint, Dependency Review
  - Security: Automated dependency vulnerability scanning with dependency-review-action
  - Code quality: YAML linting, typo detection workflows
  - PR automation: Title linting (Conventional Commits), size labeling (xs/s/m/l/xl)
  - Monitoring: Docker image size comparison workflow
  - Maintenance: Stale issues/PRs management, TODO-to-issue converter
- **Dependabot Configuration** - Daily automated dependency updates
  - npm package updates with conventional commit messages
  - GitHub Actions updates with auto-labeling
- **Custom Reusable Actions** - `.github/actions/setup-node`
  - DRY principle for Node.js setup across workflows
  - Centralized version management (Node.js 24.x)
- **GitHub Repository Templates**
  - 44 organized labels (bug, feature, priority, size, workflow status)
  - Pull request template with comprehensive checklist
  - Issue templates for bug reports and feature requests
  - CODEOWNERS for automatic code review assignments
- **Configuration Files**
  - `.yamllint.yml` for YAML validation rules
  - `.github/labels.yml` for labels-as-code
  - `.github/dependabot.yml` for dependency automation

### Changed

- **Optimized Core Workflows**
  - Removed Coveralls integration (unused)
  - Fixed Node.js version check in CI workflow (20.x → 24.x)
  - Refactored ci.yml and lint.yml to use custom reusable action
- **Badge Updates**
  - Replaced Coveralls badge with CI and Lint status badges

### Removed

- Duplicate `test.yml` workflow (consolidated into `ci.yml`)
- Coveralls coverage reporting integration
- Temporary MERGE_REQUEST.md documentation

### Documentation

- **New**: GITHUB_ACTIONS.md - Complete CI/CD pipeline documentation
  - Detailed explanation of all 10 workflows
  - Configuration guides and best practices
  - Troubleshooting section
- **Updated**: README.md with CI/CD section and new badges
- **Updated**: CLAUDE.md with GitHub Actions automation details

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

[unreleased]: https://github.com/Proskynete/node-api-skeleton/compare/v2.2.0...HEAD
[2.2.0]: https://github.com/Proskynete/node-api-skeleton/compare/v2.1.0...v2.2.0
[2.1.0]: https://github.com/Proskynete/node-api-skeleton/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/Proskynete/node-api-skeleton/releases/tag/v2.0.0
