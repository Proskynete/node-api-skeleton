# Initial Setup Guide

This guide will help you customize the Node API Skeleton for your new project after using it as a template.

## Prerequisites

Before starting, ensure you have:

- Node.js >= 20
- npm >= 10
- Git configured with your credentials
- Your new repository created from this template

## Setup Checklist

Follow these steps in order to configure your new project:

### 1. Update Project Metadata

#### `package.json`

Update the following fields:

```json
{
  "name": "your-project-name",
  "version": "1.0.0",
  "description": "Your project description",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/YOUR_USERNAME/YOUR_REPO.git"
  },
  "keywords": ["your", "keywords"],
  "author": "Your Name <your.email@example.com>",
  "bugs": {
    "url": "https://github.com/YOUR_USERNAME/YOUR_REPO/issues"
  },
  "homepage": "https://github.com/YOUR_USERNAME/YOUR_REPO#readme"
}
```

**Keep the `license: "MIT"` field** unless you want a different license.

### 2. Update Documentation

#### `README.md`

Replace the entire content with your project-specific README. You can use this structure:

```markdown
# Your Project Name

Your project description

## Features

- List your features

## Quick Start

\`\`\`bash
npm install
npm run dev
\`\`\`

## Documentation

- Link to your docs

## License

MIT License - see [LICENSE](./LICENSE)
```

**Tip**: Keep the original README in a separate file (e.g., `README.skeleton.md`) for reference.

#### `LICENSE`

The skeleton uses the MIT License. If you want to keep it:

1. Open the `LICENSE` file
2. Update the year and copyright holder name
3. If you want a different license, replace the entire file

#### `CLAUDE.md`

Update this file with your project-specific instructions for Claude Code:

- Remove skeleton-specific information
- Add your project's architecture decisions
- Document your business domains
- Add custom commands and workflows

### 3. Configure Environment

#### `.env`

Create your environment file:

```bash
cp .env.example .env
```

Update the values:

```bash
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug

# Add your custom environment variables
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
API_KEY=your-api-key
```

#### `src/@shared/infrastructure/config/environment.ts`

Add validation for your new environment variables:

```typescript
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]),

  // Add your custom variables
  DATABASE_URL: z.string().url(),
  API_KEY: z.string().min(1),
});
```

### 4. Clean Up Demo Code

The skeleton includes a `greetings` context as an example. You have two options:

#### Option A: Remove the Demo Context (Start Fresh)

Remove the example code:

```bash
rm -rf src/@contexts/greetings
```

Then update:

- `src/@shared/infrastructure/http/loaders/route-loader.ts` - Remove greetings routes
- `src/@shared/infrastructure/di/container.ts` - Remove greetings DI registrations

#### Option B: Keep as Reference (Recommended for First Time)

Rename the context and use it as a reference:

```bash
mv src/@contexts/greetings src/@contexts/_example-greetings
```

This way you can refer to it while building your first context.

### 5. Create Your First Context

Create your first business context following the vertical slice architecture:

```bash
mkdir -p src/@contexts/your-context/{domain,application,infrastructure}
mkdir -p src/@contexts/your-context/domain/{entities,value-objects,exceptions,events}
mkdir -p src/@contexts/your-context/application/v1/{use-cases,dtos,mappers,ports}
mkdir -p src/@contexts/your-context/infrastructure/{http,persistence}
```

Follow the patterns from the greetings context or refer to [ARCHITECTURE.md](./ARCHITECTURE.md).

### 6. Update GitHub Configuration

#### `.github/workflows/`

Review and update GitHub Actions workflows:

- `ci.yml` - CI pipeline (keep as is)
- `lint.yml` - Linting (keep as is)
- `dependency-review.yml` - Security scanning (keep as is)
- Other workflows - Review and customize as needed

#### `.github/labels.yml`

Review the labels configuration and customize for your project.

#### `.github/CODEOWNERS` (Optional)

If you want to define code owners:

```bash
# Create CODEOWNERS file
touch .github/CODEOWNERS
```

Add your rules:

```
# Global owners
* @your-username

# Context owners
/src/@contexts/users/ @team-users
/src/@contexts/orders/ @team-orders
```

### 7. Update Community Files

#### `CODE_OF_CONDUCT.md`

Update the enforcement email:

```markdown
Instances of abusive, harassing, or otherwise unacceptable behavior may be
reported to the community leaders responsible for enforcement at
[YOUR_EMAIL@example.com].
```

#### `SECURITY.md`

Update the security policy with your contact information:

```markdown
### 2. Report privately

Send an email to **security@your-domain.com** with:
```

#### `.github/SUPPORT.md`

Update support channels:

- Community links (Discord, Slack, etc.)
- Email addresses
- Discussion forums

#### `.github/funding.yml`

Update or remove funding configuration:

```yaml
github: YOUR_USERNAME
custom: https://your-website.com/donate
buy_me_a_coffee: your_username
```

Or delete the file if you don't need sponsorship.

### 8. Database Setup (Optional)

If you need a database, follow the [Database Integration Guide](./guides/database-integration.md).

The skeleton is pre-configured with Prisma v7. To set it up:

1. Install Prisma CLI: `npm install -D prisma`
2. Initialize Prisma: `npx prisma init`
3. Configure your database in `.env`
4. Create your schema in `prisma/schema.prisma`
5. Run migrations: `npx prisma migrate dev`

### 9. Test Your Setup

Verify everything is working:

```bash
# Install dependencies
npm install

# Run linter
npm run lint

# Run tests
npm run test

# Build the project
npm run build

# Start development server
npm run dev
```

Visit `http://localhost:3000/health/live` to verify the server is running.

### 10. Initialize Git History

If you want a clean git history:

```bash
# Remove existing git history
rm -rf .git

# Initialize new repository
git init
git add .
git commit -m "🎉 chore: initialize project from node-api-skeleton"

# Add remote and push
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

**Warning**: This will lose the skeleton's git history. Only do this if you want a fresh start.

## Next Steps

### Development

1. **Define Your Domain**: Identify your bounded contexts and start with the most critical one
2. **Create Entities**: Define your domain entities and value objects
3. **Implement Use Cases**: Create your business logic in application layer
4. **Add Endpoints**: Implement HTTP controllers and routes
5. **Write Tests**: Maintain high test coverage (80%+ target)

### Documentation

1. **Update ADRs**: Start documenting your architectural decisions in `docs/adr/`
2. **API Documentation**: Update Swagger/OpenAPI specs as you add endpoints
3. **Keep README Updated**: Document your features, setup instructions, and deployment

### CI/CD

1. **Configure Secrets**: Add required secrets to GitHub repository settings
2. **Review Workflows**: Customize GitHub Actions for your deployment needs
3. **Set Up Environments**: Configure staging and production environments

### Deployment

1. **Choose Platform**: Decide on your deployment platform (AWS, GCP, Azure, Heroku, etc.)
2. **Configure Docker**: Review and customize `Dockerfile` and `docker-compose.yml`
3. **Set Up Monitoring**: Configure Prometheus, Grafana, or your preferred monitoring tools
4. **Configure Logging**: Set up centralized logging (CloudWatch, Datadog, etc.)

## Common Customizations

### Change Port

Update `.env`:

```bash
PORT=8080
```

### Add CORS Origins

Update `src/@app/server/plugins/cors.plugin.ts`:

```typescript
origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
```

### Customize Rate Limiting

Update `src/@app/server/plugins/rate-limit.plugin.ts`:

```typescript
max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
timeWindow: parseInt(process.env.RATE_LIMIT_TIME_WINDOW || '60000'),
```

### Add Health Check Dependencies

Update `src/@app/server/health.ts`:

```typescript
// Add database check
const dbHealthy = await checkDatabaseConnection();

// Add external service check
const apiHealthy = await checkExternalAPI();

return {
  status: dbHealthy && apiHealthy ? "healthy" : "unhealthy",
  dependencies: {
    database: dbHealthy ? "up" : "down",
    externalAPI: apiHealthy ? "up" : "down",
  },
};
```

## Troubleshooting

### Tests Failing

If tests fail after customization:

1. Update test mocks and fixtures
2. Review test configuration in `vitest.config.ts`
3. Check environment variables in tests

### Build Errors

If build fails:

1. Check TypeScript errors: `npm run build`
2. Verify path aliases in `tsconfig.json`
3. Ensure all imports are correct

### Docker Issues

If Docker containers fail:

1. Check `Dockerfile` for missing dependencies
2. Verify environment variables in `docker-compose.yml`
3. Review logs: `docker-compose logs -f`

## Getting Help

- **Documentation**: See [ARCHITECTURE.md](./ARCHITECTURE.md) for architecture details
- **Examples**: Refer to the `greetings` context for implementation patterns
- **Issues**: Check the [skeleton repository issues](https://github.com/Proskynete/node-api-skeleton/issues)
- **Community**: Join discussions in the skeleton repository

## Checklist Summary

Use this checklist to track your setup progress:

- [ ] Updated `package.json` metadata
- [ ] Customized `README.md`
- [ ] Updated `LICENSE` copyright
- [ ] Configured `.env` file
- [ ] Added environment variable validation
- [ ] Removed or renamed demo context
- [ ] Created first business context
- [ ] Updated GitHub workflows
- [ ] Customized community files (CODE_OF_CONDUCT, SECURITY, SUPPORT)
- [ ] Configured funding (or removed)
- [ ] Set up database (if needed)
- [ ] Ran tests successfully
- [ ] Initialized git history (if desired)
- [ ] Updated CLAUDE.md with project specifics

---

**Congratulations!** Your project is now ready for development. Happy coding! 🚀
