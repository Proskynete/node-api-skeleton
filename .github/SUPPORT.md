# Support

Thank you for using Node API Skeleton! This document provides guidance on how to get help and support.

## Getting Help

### Documentation

Before asking for help, please check our comprehensive documentation:

- **[README.md](../README.md)** - Project overview, quick start, and features
- **[ARCHITECTURE.md](../docs/ARCHITECTURE.md)** - Complete architecture guide (Hexagonal + DDD)
- **[DOCKER.md](../docs/DOCKER.md)** - Docker setup and deployment
- **[GITHUB_ACTIONS.md](../docs/GITHUB_ACTIONS.md)** - CI/CD pipeline and workflows
- **[CONTRIBUTING.md](../CONTRIBUTING.md)** - Contribution guidelines
- **[CLAUDE.md](../CLAUDE.md)** - Development guide for AI assistants

### Guides

- **[Database Integration](../docs/guides/database-integration.md)** - How to integrate databases (Prisma, TypeORM, etc.)
- **[Contract Testing - Provider](../docs/guides/contract-testing-provider.md)** - Pact provider tests
- **[Contract Testing - Consumer](../docs/guides/contract-testing-consumer.md)** - Pact consumer tests
- **[Performance Testing](../test/performance/README.md)** - k6 load testing guide

### Architecture Decision Records (ADRs)

- **[ADR Index](../docs/adr/README.md)** - Complete list of architectural decisions
- **[ADR-0001](../docs/adr/0001-use-hexagonal-architecture.md)** - Why Hexagonal Architecture
- **[ADR-0002](../docs/adr/0002-use-fastify-instead-of-express.md)** - Why Fastify
- **[ADR-0007](../docs/adr/0007-vertical-slice-by-contexts.md)** - Why Vertical Slices

## Questions and Discussions

### GitHub Discussions

For questions, ideas, and general discussions:

**[Open a Discussion](https://github.com/Proskynete/node-api-skeleton/discussions)**

**Categories**:

- **Q&A** - Ask questions about usage, architecture, or implementation
- **Ideas** - Share ideas for new features or improvements
- **Show and tell** - Share what you've built with this skeleton
- **General** - Everything else

### Common Questions

<details>
<summary>How do I add a new endpoint?</summary>

1. Create use case in `src/@contexts/your-context/application/v1/use-cases/`
2. Define DTOs in `application/v1/dtos/`
3. Create mapper in `application/v1/mappers/`
4. Implement controller in `infrastructure/http/v1/controllers/`
5. Register route in `infrastructure/http/v1/routes/`
6. Write tests (unit + integration)

See [CONTRIBUTING.md](../CONTRIBUTING.md#adding-new-endpoint) for details.

</details>

<details>
<summary>How do I integrate a database?</summary>

Check our comprehensive [Database Integration Guide](../docs/guides/database-integration.md).

The project is pre-configured with Prisma v7 support for PostgreSQL and MongoDB.

</details>

<details>
<summary>Why is my build failing?</summary>

1. Check Node.js version: `node --version` (requires >= 24)
2. Clean install: `rm -rf node_modules package-lock.json && npm install`
3. Run linter: `npm run lint:fix`
4. Run tests: `npm test`
5. Check CI logs on GitHub Actions
</details>

<details>
<summary>How do I run performance tests?</summary>

```bash
# Install k6 first: https://k6.io/docs/getting-started/installation/

# Test v1 endpoint
npm run test:performance:v1

# Test v2 endpoint
npm run test:performance:v2

# Full load test
npm run test:performance:load
```

See [Performance Testing Guide](../test/performance/README.md).

</details>

<details>
<summary>How do I version my API?</summary>

The skeleton supports multiple API versions coexisting:

```
/api/v1/resource  → v1 controller → v1 use case
/api/v2/resource  → v2 controller → v2 use case
```

Both versions share the same domain layer. See the `greetings` context for a complete example.

</details>

## Bug Reports

If you've found a bug, please report it on GitHub Issues.

### Before Reporting

1. **Search existing issues** - Your bug may already be reported
2. **Check latest version** - The bug may be fixed in a newer version
3. **Verify it's a bug** - Not a configuration or usage issue

### Creating a Bug Report

**[Report a Bug](https://github.com/Proskynete/node-api-skeleton/issues/new?template=bug_report.md)**

Please include:

- Clear, descriptive title
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment (Node.js version, OS, etc.)
- Error messages and stack traces
- Minimal reproduction repository (if possible)

## Feature Requests

Have an idea for a new feature?

**[Request a Feature](https://github.com/Proskynete/node-api-skeleton/issues/new?template=feature_request.md)**

Please include:

- Clear description of the feature
- Use case and motivation
- Proposed implementation (optional)
- Alternatives considered
- How it aligns with Hexagonal Architecture principles

## Security Vulnerabilities

**DO NOT** report security vulnerabilities through public GitHub issues.

Please review our [Security Policy](../SECURITY.md) for responsible disclosure procedures.

## Contributing

Want to contribute code?

1. Read [CONTRIBUTING.md](../CONTRIBUTING.md)
2. Fork the repository
3. Create a feature branch
4. Make your changes following our coding standards
5. Write tests (coverage >= 80%)
6. Submit a pull request

See [Pull Request Template](PULL_REQUEST_TEMPLATE.md) for required information.

## Community

### Resources

- **GitHub Repository**: https://github.com/Proskynete/node-api-skeleton
- **Issue Tracker**: https://github.com/Proskynete/node-api-skeleton/issues
- **Discussions**: https://github.com/Proskynete/node-api-skeleton/discussions

### Related Projects

- [Fastify](https://fastify.dev/) - Web framework
- [Vitest](https://vitest.dev/) - Testing framework
- [Zod](https://zod.dev/) - Schema validation
- [Winston](https://github.com/winstonjs/winston) - Logging
- [k6](https://k6.io/) - Performance testing

## Response Time

This is an open-source project maintained by volunteers. Response times may vary:

- **Critical bugs**: 1-3 business days
- **Feature requests**: 1-2 weeks
- **Questions**: 2-5 business days
- **Pull requests**: 3-7 business days

## License

This project is licensed under the MIT License. See [LICENSE](../LICENSE) for details.

---

**Thank you for using Node API Skeleton!**

If you find this project helpful, please consider:

- Starring the repository on GitHub
- Sharing it with your team
- Contributing improvements
- Sponsoring the maintainers

<p align="center">
  <a href="https://github.com/Proskynete/node-api-skeleton">⬆️ Back to Repository</a>
</p>
