## Summary

<!-- 2-3 sentences: WHAT changed and WHY. Focus on business value and impact. -->

## 🔄 Type of Change

<!-- Check all that apply -->

- [ ] ✨ New feature (non-breaking change which adds functionality)
- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📝 Documentation update
- [ ] ♻️ Code refactoring (no functional changes)
- [ ] ⚡ Performance improvement
- [ ] ✅ Test update
- [ ] 🔧 Configuration change
- [ ] 📦 Dependencies update
- [ ] 🏗️ Architecture change

## 🏛️ Architecture Impact

<!-- REQUIRED for features, refactors, and architecture changes -->

### Affected Contexts

<!-- Which bounded contexts are modified? -->

- [ ] `@contexts/greetings`
- [ ] `@contexts/[other]`
- [ ] `@shared` (cross-cutting concerns)
- [ ] `@app` (application bootstrap)
- [ ] None - only tests/docs

### Affected Layers

<!-- Which layers of Hexagonal Architecture are modified? -->

- [ ] Domain (entities, value objects, business logic)
- [ ] Application (use cases, DTOs, ports)
- [ ] Infrastructure (controllers, repositories, adapters)

### Architectural Decisions

<!-- Does this PR introduce new patterns, ports, or adapters? -->

- New ports/interfaces: <!-- e.g., IUserRepository -->
- New adapters: <!-- e.g., PrismaUserRepository -->
- ADR created/updated: <!-- Link to ADR if applicable -->

## 🔀 API Changes

<!-- REQUIRED for API modifications -->

### Breaking Changes

- [ ] This PR contains breaking changes
- [ ] Affected API versions: <!-- v1, v2, etc. -->
- [ ] Migration guide provided below

**Breaking Changes Details**:

<!-- If checked above, describe the breaking changes and migration path -->

**Before**:

```json
// Example request/response
```

**After**:

```json
// Example request/response
```

**Migration Guide**:

<!-- Steps for API consumers to update their code -->

### Non-Breaking Changes

<!-- Describe backward-compatible API additions/enhancements -->

## 🧪 Testing Strategy

<!-- REQUIRED - Check all test types that were executed -->

### Test Coverage

- [ ] **Unit Tests** (`npm run test:unit`) - Domain and application logic
- [ ] **Integration Tests** (`npm run test:integration`) - HTTP endpoints
- [ ] **E2E Tests** (`npm run test:e2e`) - Full user flows
- [ ] **Contract Tests** (`npm run test:contract`) - API contracts (Pact)
- [ ] **Performance Tests** (`npm run test:performance`) - k6 load tests

### Coverage Report

<!-- Screenshot of npm run test:coverage showing overall coverage % -->

**Overall Coverage**: <!-- e.g., 85% -->

### Performance Test Results

<!-- REQUIRED for features, performance improvements, and critical fixes -->
<!-- Run: npm run test:performance -->

**p95 Latency**: <!-- e.g., 245ms -->
**p99 Latency**: <!-- e.g., 450ms -->
**Throughput**: <!-- e.g., 120 req/s -->
**Pass/Fail**: <!-- ✅ All thresholds passed -->

## 📦 Dependencies

<!-- Only fill if updating dependencies -->

<details>
<summary>Click to expand dependency changes</summary>

### Production Dependencies

| Package | Previous | New | Type | Breaking? |
| ------- | -------- | --- | ---- | --------- |
|         |          |     |      |           |

### Development Dependencies

| Package | Previous | New | Type |
| ------- | -------- | --- | ---- |
|         |          |     |      |

### GitHub Actions

| Action | Previous | New |
| ------ | -------- | --- |
|        |          |     |

**Dependency Review**:

<!-- Why are these dependencies being updated? Security? Features? -->

</details>

## 📊 Evidence

### Before & After

<!-- Visual proof of the change (screenshots, logs, metrics) -->

**Before**:

<!-- Screenshot, log output, or description of previous behavior -->

**After**:

<!-- Screenshot, log output, or description of new behavior -->

### Sequence Diagram (Optional)

<!-- Only required for new endpoints or complex data flows -->
<!-- Use Mermaid, PlantUML, or screenshot -->

## 🔒 Security Considerations

<!-- REQUIRED for auth/authz changes, input validation, or security fixes -->

- [ ] No security impact
- [ ] Input validation added/updated
- [ ] Authentication/authorization logic changed
- [ ] Sensitive data handling modified
- [ ] Rate limiting affected
- [ ] OWASP Top 10 considerations reviewed

**Security Details**:

<!-- If any checkboxes above are checked, provide details -->

## 📈 Observability

<!-- REQUIRED for features and bug fixes -->

### Logging

- [ ] No new logs
- [ ] New logs added (using Winston logger)

**Log Details**:

<!-- What events are being logged? At what level (debug/info/warn/error)? -->

### Metrics

- [ ] No new metrics
- [ ] New Prometheus metrics exposed

**Metrics Details**:

<!-- What metrics are added? Example: http_request_duration_seconds{endpoint="/api/v2/users"} -->

### Monitoring

**Post-Deployment Metrics to Watch**:

<!-- What Grafana dashboards or Prometheus queries should be monitored? -->

## 🚀 Deployment Considerations

### Database Migrations

- [ ] No database changes
- [ ] Schema changes (run: `npm run prisma:migrate:pg`)
- [ ] Seed data changes
- [ ] Requires manual migration steps (documented below)

**Migration Steps**:

<!-- If manual steps required, document them here -->

### Feature Flags

- [ ] No feature flags needed
- [ ] Feature flag required: <!-- flag name -->

### Rollback Plan

<!-- For high-risk changes, document how to rollback -->

- [ ] Low risk - standard rollback (revert commit)
- [ ] Medium/High risk - rollback steps documented below

**Rollback Steps**:

<!-- If medium/high risk, document rollback procedure -->

## 🧑‍💻 Testing Instructions

<!-- How should reviewers test this PR locally? -->

**Prerequisites**:

<!-- Any setup required? Environment variables? Database state? -->

**Steps to Test**:

1.
2.
3.

**Expected Behavior**:

<!-- What should reviewers see/verify? -->

## 🔗 Related Issues

<!-- Link related issues, PRs, or ADRs -->

Closes #
Related to #
Blocked by #
ADR: <!-- Link to docs/adr/XXXX-*.md if applicable -->

## 👥 Reviewer Guidance

<!-- Who should review this? What should they focus on? -->

**Reviewers Needed**:

- [ ] Backend expert (domain logic, use cases)
- [ ] Infrastructure expert (Docker, observability)
- [ ] Security expert (if security impact)
- [ ] Performance expert (if performance critical)

**Focus Areas**:

<!-- What should reviewers pay special attention to? -->

## 📝 Additional Notes

<!-- Any additional context, concerns, or discussion points -->

---

## ✅ PR Checklist

<!-- ALL items must be checked before requesting review -->

### Code Quality

- [ ] Code follows project conventions (Hexagonal Architecture, DDD patterns)
- [ ] TypeScript strict mode passes with no errors
- [ ] ESLint passes (`npm run lint`)
- [ ] Prettier formatting applied (`npm run format`)
- [ ] No console.log (use Winston logger instead)

### Testing

- [ ] All relevant test types executed (unit, integration, e2e)
- [ ] Test coverage maintained or improved (`npm run test:coverage` ≥80%)
- [ ] Coverage screenshot included in PR description
- [ ] Performance tests pass (if applicable)
- [ ] Contract tests pass (if API changes)

### Documentation

- [ ] Code is self-documenting with clear naming
- [ ] Complex logic has inline comments
- [ ] README.md updated (if user-facing changes)
- [ ] CLAUDE.md updated (if architecture changes)
- [ ] ADR created (if architectural decision)
- [ ] API documentation updated (if endpoint changes)

### CI/CD

- [ ] All GitHub Actions workflows pass
- [ ] No new CI warnings or errors introduced
- [ ] Docker build succeeds (`docker-compose build`)

### Review

- [ ] Self-reviewed the code
- [ ] Tested locally in development environment
- [ ] No debugging code or TODOs left in (or tracked as issues)
- [ ] PR title follows Conventional Commits format
- [ ] PR size is reasonable (prefer <500 lines)

### Security & Observability

- [ ] No sensitive data exposed (secrets, API keys, PII)
- [ ] Input validation in place for user inputs
- [ ] Appropriate logs added for debugging
- [ ] Metrics added for monitoring (if applicable)

---

<!--
🎯 Quick Checklist Reference:
- Summary written (WHAT + WHY)
- Architecture impact documented
- All tests pass + coverage ≥80%
- Evidence provided (before/after)
- CI/CD green
- Self-reviewed
-->
