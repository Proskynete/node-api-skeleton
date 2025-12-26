# GitHub Actions - CI/CD Pipeline

This document describes the complete GitHub Actions workflow automation for the Node API Skeleton project.

---

## Table of Contents

- [Overview](#overview)
- [Workflow Architecture](#workflow-architecture)
- [Core Workflows](#core-workflows)
- [Code Quality Workflows](#code-quality-workflows)
- [PR Automation Workflows](#pr-automation-workflows)
- [Monitoring Workflows](#monitoring-workflows)
- [Dependency Management](#dependency-management)
- [Custom Reusable Actions](#custom-reusable-actions)
- [Configuration Files](#configuration-files)
- [Best Practices](#best-practices)

---

## Overview

The project uses a **modular GitHub Actions architecture** following the **Single Responsibility Principle**. Each workflow has one clear purpose, enabling:

- **Parallel execution** for faster feedback
- **Granular failure visibility** - know exactly what failed
- **Selective triggering** - workflows only run when needed
- **Easy maintenance** - small, focused, understandable files

### Workflow Summary

| Category | Workflows | Purpose |
|----------|-----------|---------|
| **Core CI/CD** | 3 | Build, test, lint, security |
| **Code Quality** | 2 | YAML validation, spell checking |
| **PR Automation** | 2 | Size labeling, title validation |
| **Monitoring** | 1 | Docker image size tracking |
| **Maintenance** | 2 | Stale items, TODO conversion |
| **Total** | **10** | Complete automation suite |

---

## Workflow Architecture

### Design Philosophy

**Separation of Concerns**: Each workflow handles ONE specific aspect of CI/CD:

```
┌─────────────────────────────────────────┐
│  Pull Request Event                     │
└─────────────────┬───────────────────────┘
                  │
    ┌─────────────┼─────────────┬─────────────┐
    │             │             │             │
    ▼             ▼             ▼             ▼
┌────────┐  ┌──────────┐  ┌─────────┐  ┌─────────┐
│ CI     │  │ Lint     │  │ Dep     │  │ PR      │
│ Build  │  │ ESLint   │  │ Review  │  │ Title   │
│ Test   │  │ Prettier │  │ Security│  │ Lint    │
└────────┘  └──────────┘  └─────────┘  └─────────┘
     │           │             │             │
     └───────────┴─────────────┴─────────────┘
                  │
            ✅ All checks pass
                  │
            Ready to merge
```

### Benefits

- ✅ **Fast feedback** - Parallel execution instead of sequential
- ✅ **Clear failures** - "Lint PR Title failed" vs digging through monolithic logs
- ✅ **Efficient** - Only run workflows for changed file types
- ✅ **Scalable** - Add new workflows without modifying existing ones

---

## Core Workflows

### 1. Continuous Integration (`ci.yml`)

**Purpose**: Build, test, and validate code across multiple platforms

**Triggers**:
- Push to `main`, `feat/**` branches
- Pull requests to `main`

**Strategy**: Matrix testing across 3 operating systems

```yaml
matrix:
  os: [ubuntu-latest, macos-latest, windows-latest]
  node-version: [24.x]
```

**Jobs**:
1. **Checkout** - Clone repository
2. **Setup Node.js** - Uses custom reusable action
3. **Build** - Compile TypeScript with SWC
4. **Test** - Run all tests (unit + integration + e2e)
5. **Coverage** - Generate coverage report (Ubuntu only)

**Coverage Thresholds**: 80% for branches, functions, lines, statements

**Location**: `.github/workflows/ci.yml`

---

### 2. Lint & Format (`lint.yml`)

**Purpose**: Enforce code quality standards

**Triggers**:
- Push to `main`, `feat/**` branches
- Pull requests to `main`

**Jobs**:
1. **ESLint** - Check code linting (`npm run lint`)
2. **Prettier** - Verify code formatting (`npm run format:check`)

**Configuration**:
- ESLint: `eslint.config.js`
- Prettier: `.prettierrc`
- Pre-commit hooks: `.lintstagedrc`

**Location**: `.github/workflows/lint.yml`

---

### 3. Dependency Review (`dependency-review.yml`)

**Purpose**: Security scanning for vulnerable dependencies

**Triggers**:
- Pull request events (opened, synchronize, reopened)

**Features**:
- ✅ Scans PR changes for known vulnerabilities
- ✅ Blocks PRs with high/critical severity issues
- ✅ Posts summary comment directly in PR
- ✅ Checks licensing compliance

**Example Output**:
```
🛡️ Dependency Review Summary
✅ No vulnerabilities found
📦 2 dependencies added
🔄 1 dependency updated
```

**Location**: `.github/workflows/dependency-review.yml`

---

## Code Quality Workflows

### 4. YAML Linting (`lint-yaml.yml`)

**Purpose**: Validate YAML syntax across all configuration files

**Triggers**:
- Push events affecting `*.yml`, `*.yaml`, `.github/workflows/**`

**Tool**: [yamllint](https://github.com/adrienverge/yamllint)

**Validated Files**:
- GitHub workflow files
- Docker Compose files
- Configuration files (`.yamllint.yml`, `dependabot.yml`)

**Configuration**: `.yamllint.yml`
```yaml
rules:
  line-length:
    max: 120
  indentation:
    spaces: 2
```

**Location**: `.github/workflows/lint-yaml.yml`

---

### 5. Typo Detection (`typos.yml`)

**Purpose**: Catch spelling mistakes in code and documentation

**Triggers**:
- Push to `main`, `feat/**` branches
- Pull requests to `main`

**Tool**: [crate-ci/typos](https://github.com/crate-ci/typos)

**Scanned Paths**:
- `./src` - Source code
- `./docs` - Documentation
- `./test` - Test files
- `README.md`, `CLAUDE.md`

**Location**: `.github/workflows/typos.yml`

---

## PR Automation Workflows

### 6. PR Title Linting (`lint-pr-title.yml`)

**Purpose**: Enforce Conventional Commits format for PR titles

**Triggers**:
- Pull request events (opened, edited, synchronize, reopened)

**Format**: `type(scope): description`

**Valid Types**:
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Code style (formatting, missing semicolons)
- `refactor` - Code refactoring
- `test` - Adding/updating tests
- `chore` - Maintenance tasks
- `perf` - Performance improvements
- `ci` - CI/CD changes

**Examples**:
```
✅ feat(api): add user authentication endpoint
✅ fix(docker): resolve memory leak in container
✅ docs(readme): update installation instructions
❌ Added new feature (missing type/scope)
❌ fix: bug (too vague)
```

**Error Handling**:
- Posts sticky comment with error details
- Links to Conventional Commits specification
- Auto-deletes comment when fixed

**Location**: `.github/workflows/lint-pr-title.yml`

---

### 7. PR Size Labeler (`pr-size-labeler.yml`)

**Purpose**: Auto-label PRs by lines changed, encourage smaller PRs

**Triggers**:
- Pull request events (opened, synchronize, reopened)

**Size Categories**:

| Label | Lines Changed | Emoji |
|-------|---------------|-------|
| `🤩 size/xs` | 0-10 | Extra Small |
| `🥳 size/s` | 11-100 | Small |
| `😎 size/m` | 101-500 | Medium |
| `😖 size/l` | 501-1000 | Large |
| `🤯 size/xl` | 1001+ | Extra Large |

**Features**:
- ⚠️ Warning posted when PR > 1000 lines
- Ignores lock files and documentation from count
- Removes old size label when PR is updated

**Ignored Files**:
```
package-lock.json
*.lock
docs/*
CHANGELOG.md
```

**Location**: `.github/workflows/pr-size-labeler.yml`

---

## Monitoring Workflows

### 8. Docker Image Size (`docker-size.yml`)

**Purpose**: Track Docker image size changes in PRs

**Triggers**:
- Pull requests to `main` branch

**Process**:
1. **Build base** - Builds image from target branch
2. **Build PR** - Builds image from PR branch
3. **Compare** - Posts size comparison comment

**Example Output**:
```
🐳 Docker Image Size Comparison

| Branch | Size |
|--------|------|
| Base (main) | 245 MB |
| PR (feat/add-auth) | 312 MB |

---
💡 Tip: Keep image size small using multi-stage builds and .dockerignore
```

**Benefits**:
- Catch image bloat early
- Visibility into optimization opportunities
- Encourages multi-stage build practices

**Location**: `.github/workflows/docker-size.yml`

---

## Dependency Management

### Dependabot Configuration (`dependabot.yml`)

**Purpose**: Automated dependency updates

**Update Schedule**: Daily

**Monitored Ecosystems**:

#### 1. NPM Dependencies
```yaml
package-ecosystem: "npm"
schedule:
  interval: "daily"
commit-message:
  prefix: "fix"              # Production deps
  prefix-development: "chore" # Dev deps
labels:
  - "📦 Dependencies"
```

#### 2. GitHub Actions
```yaml
package-ecosystem: "github-actions"
schedule:
  interval: "daily"
labels:
  - "📦 Dependencies"
  - "🚀 CI/CD"
```

**Features**:
- ✅ Automatic PR creation for updates
- ✅ Grouped by ecosystem
- ✅ Conventional commit messages
- ✅ Semantic versioning strategy
- ✅ Auto-labeling for easy filtering

**Location**: `.github/dependabot.yml`

---

### 9. Stale Issues/PRs (`stale-issues-and-prs.yml`)

**Purpose**: Manage inactive issues and pull requests

**Schedule**: Daily at 1:30 AM UTC

**Configuration**:
- **Stale after**: 30 days of inactivity
- **Close after**: 5 additional days
- **Exempt labels**: `pinned`, `security`, `work-in-progress`

**Messages**:
```
Stale message (day 30):
"This issue is stale because it has been open 30 days with no activity.
Remove the stale label or comment, or this will be closed in 5 days."

Close message (day 35):
"This issue was closed because it has been inactive for 5 days since
being marked as stale."
```

**Location**: `.github/workflows/stale-issues-and-prs.yml`

---

### 10. TODO to Issue (`todo-to-issue.yml`)

**Purpose**: Convert code TODOs to GitHub issues automatically

**Triggers**:
- Push to `main` branch
- Manual trigger (workflow_dispatch)

**Supported Identifiers**:
- `// TODO:` → Label: `todo`
- `// FIXME:` → Label: `bug`
- `// HACK:` → Label: `tech-debt`

**Example**:
```typescript
// TODO: Add authentication middleware
export const greetingRoutes = () => {
  // ...
}
```

**Generated Issue**:
```markdown
## ✅ Codebase TODO

**File**: src/@contexts/greetings/infrastructure/http/v1/routes/greeting.routes.ts
**Line**: 12

### Description
Add authentication middleware

### Code Snippet
```typescript
export const greetingRoutes = () => {
  // ...
}
```

---
*This issue was automatically created from a TODO comment in the code.*
```

**Features**:
- ✅ Auto-assigns to committer
- ✅ Links to exact file and line number
- ✅ Includes code snippet for context
- ✅ Prevents duplicates

**Ignored Paths**:
```
.github/workflows/todo-to-issue.yml
node_modules/**
dist/**
build/**
coverage/**
```

**Location**: `.github/workflows/todo-to-issue.yml`

---

## Custom Reusable Actions

### Setup Node.js (`setup-node/action.yml`)

**Purpose**: DRY principle - centralize Node.js setup across all workflows

**Location**: `.github/actions/setup-node/action.yml`

**Steps**:
1. Setup Node.js 24.x with npm caching
2. Install dependencies (`npm ci`)
3. Verify installation (log versions)

**Benefits**:
- ✅ Change Node version once, applies everywhere
- ✅ Consistent caching strategy
- ✅ Faster workflow authoring
- ✅ Version in one place

**Usage in workflows**:
```yaml
steps:
  - uses: actions/checkout@v4
  - uses: ./.github/actions/setup-node
  - run: npm run build
  - run: npm run test
```

**Used by**: `ci.yml`, `lint.yml`

---

## Configuration Files

### Labels Configuration (`labels.yml`)

**Purpose**: Define all repository labels as code

**Categories**:

1. **Bug & Issue Types** (5 labels)
   - 🐛 bug, ✨ enhancement, 📝 documentation, 🚀 performance, 🔒 security

2. **Priority Levels** (4 labels)
   - 🔥 priority: critical, ⚡ priority: high, ➡️ priority: medium, ⬇️ priority: low

3. **Workflow Status** (6 labels)
   - 🚧 work-in-progress, 👀 needs review, 🔄 needs changes, ✅ ready to merge, ⏸️ on hold, stale

4. **Dependencies & DevOps** (3 labels)
   - 📦 Dependencies, 🚀 CI/CD, 🐳 docker

5. **PR Size** (5 labels)
   - 🤩 size/xs, 🥳 size/s, 😎 size/m, 😖 size/l, 🤯 size/xl

6. **Architecture & Code Quality** (5 labels)
   - ♻️ refactor, 🧪 test, 🏗️ architecture, 🎨 style, 🔧 config

7. **Conventional Commit Types** (3 labels)
   - feat, fix, chore

8. **Special Labels** (8 labels)
   - pinned, good first issue, help wanted, question, duplicate, invalid, wontfix, todo, tech-debt

**Total**: 44 labels

**Location**: `.github/labels.yml`

**Sync Tool**: [micnncim/action-label-syncer](https://github.com/micnncim/action-label-syncer) (optional)

---

### YAML Lint Configuration (`.yamllint.yml`)

**Purpose**: Configure YAML validation rules

**Key Rules**:
```yaml
line-length:
  max: 120
  level: warning
indentation:
  spaces: 2
truthy:
  allowed-values: ['true', 'false', 'on', 'off']
document-start: disable
```

**Ignored Paths**:
```
node_modules/
.git/
dist/
build/
coverage/
```

**Location**: `.yamllint.yml`

---

## Best Practices

### 1. Workflow Naming Convention

Use emojis + clear descriptive names:
```yaml
name: "🐢 Continuous Integration"  # CI
name: "🔦 Lint"                    # Code quality
name: "🛡️ Dependency Review"       # Security
name: "📝 Lint PR Title"           # PR automation
```

### 2. Trigger Strategy

**Be specific** - only run when needed:
```yaml
# Run lint only on code changes
on:
  push:
    paths:
      - 'src/**'
      - 'test/**'

# Run YAML lint only on YAML changes
on:
  push:
    paths:
      - '**.yml'
      - '**.yaml'
```

### 3. Caching Strategy

Use Node.js caching via custom action:
```yaml
- uses: ./.github/actions/setup-node
  # ✅ Automatic npm caching included
```

### 4. Security

**Minimal Permissions**: Only grant what's needed
```yaml
permissions:
  contents: read
  pull-requests: write
```

**Use Secrets**: Never hardcode tokens
```yaml
env:
  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### 5. Error Handling

**Sticky Comments**: Reuse same comment instead of spam
```yaml
- uses: marocchino/sticky-pull-request-comment@v2
  with:
    header: pr-title-lint-error  # Unique identifier
    message: |
      Error details...
```

**Delete on Success**:
```yaml
- if: success()
  uses: marocchino/sticky-pull-request-comment@v2
  with:
    header: pr-title-lint-error
    delete: true
```

### 6. Matrix Testing

**Test across platforms** when needed:
```yaml
strategy:
  matrix:
    os: [ubuntu-latest, macos-latest, windows-latest]
```

**Conditional Steps**:
```yaml
- if: matrix.os == 'ubuntu-latest'
  run: npm run test:coverage
```

### 7. Manual Triggers

**Allow manual workflow execution**:
```yaml
on:
  schedule:
    - cron: "30 1 * * *"
  workflow_dispatch:  # ✅ Adds "Run workflow" button in GitHub UI
```

---

## Workflow Status Monitoring

### GitHub Actions Dashboard

View all workflows: https://github.com/Proskynete/node-api-skeleton/actions

### Status Checks

Required status checks for PR merging:
- ✅ Continuous Integration (build + test on all platforms)
- ✅ Lint & Format Check
- ✅ Dependency Review
- ✅ Lint PR Title

### Badges

Add to README.md:
```markdown
[![CI](https://img.shields.io/github/actions/workflow/status/Proskynete/node-api-skeleton/ci.yml?logo=GithubActions&logoColor=fff&label=CI)](https://github.com/Proskynete/node-api-skeleton/actions/workflows/ci.yml)

[![Lint](https://img.shields.io/github/actions/workflow/status/Proskynete/node-api-skeleton/lint.yml?logo=ESLint&logoColor=fff&label=Lint)](https://github.com/Proskynete/node-api-skeleton/actions/workflows/lint.yml)
```

---

## Troubleshooting

### Common Issues

#### 1. Workflow not triggering

**Check**:
- File is in `.github/workflows/` directory
- YAML syntax is valid (use `yamllint`)
- Trigger conditions match (branch names, paths)

#### 2. Custom action not found

**Error**: `Unable to resolve action ./.github/actions/setup-node`

**Fix**:
```yaml
steps:
  - uses: actions/checkout@v4  # ✅ Must checkout FIRST
  - uses: ./.github/actions/setup-node
```

#### 3. Permission denied

**Error**: `Resource not accessible by integration`

**Fix**: Add permissions to workflow
```yaml
permissions:
  contents: read
  pull-requests: write
```

#### 4. Matrix builds failing on Windows

**Issue**: Path separators differ

**Fix**: Use cross-platform tools
```yaml
- run: npm run build  # ✅ Works on all platforms
# vs
- run: ./scripts/build.sh  # ❌ Unix only
```

---

## Maintenance

### Adding New Workflows

1. Create file in `.github/workflows/`
2. Follow naming convention: `name-with-dashes.yml`
3. Add emoji + descriptive name
4. Use custom action for Node.js setup
5. Add minimal permissions
6. Test with manual trigger first

### Updating Node.js Version

**Single source of truth**: `.github/actions/setup-node/action.yml`

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '24.x'  # ✅ Change here only
```

All workflows automatically inherit the new version.

### Monitoring Costs

**GitHub Actions minutes**:
- Free tier: 2,000 minutes/month (public repos)
- Private repos: Varies by plan

**Optimization**:
- Use `paths` filters to skip unnecessary runs
- Cache dependencies with custom action
- Use conditional steps (`if:`) for expensive operations

---

## Resources

### GitHub Actions Documentation
- [Workflow Syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
- [Events that trigger workflows](https://docs.github.com/en/actions/reference/events-that-trigger-workflows)
- [Expressions](https://docs.github.com/en/actions/reference/context-and-expression-syntax-for-github-actions)

### Tools Used
- [yamllint](https://github.com/adrienverge/yamllint)
- [crate-ci/typos](https://github.com/crate-ci/typos)
- [amannn/action-semantic-pull-request](https://github.com/amannn/action-semantic-pull-request)
- [codelytv/pr-size-labeler](https://github.com/codelytv/pr-size-labeler)
- [actions/dependency-review-action](https://github.com/actions/dependency-review-action)
- [actions/stale](https://github.com/actions/stale)
- [alstr/todo-to-issue-action](https://github.com/alstr/todo-to-issue-action)

### Related Documentation
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)

---

**Last Updated**: December 2024
**Version**: 2.1.0
**Workflows**: 10 active workflows
