# Prisma 7 Migration Guide

This document explains the key changes in Prisma 7 and how to use it correctly in this project.

## What Changed in Prisma 7?

### ❌ OLD Way (Prisma 6 and earlier)

```prisma
// schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")  // ❌ No longer supported
}
```

```typescript
// Usage
const prisma = new PrismaClient(); // URL automatically read from .env
```

### ✅ NEW Way (Prisma 7)

```prisma
// schema.prisma
datasource db {
  provider = "postgresql"  // ✅ Just the provider, no URL
}
```

```typescript
// Usage - Pass URL explicitly
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_POSTGRESQL,
    },
  },
});
```

## Why This Change?

Prisma 7 separates **schema definition** from **runtime configuration**:

- **Schema file** (`schema.prisma`): Defines your data model and provider
- **Runtime configuration**: Database URL passed when creating PrismaClient

This allows:
- 🔄 Easier multi-database support
- 🔒 Better security (URLs not in committed files)
- 🚀 More flexible deployment options

## Common Patterns in This Project

### Pattern 1: Direct Usage (Simple Scripts)

```typescript
import { PrismaClient } from ".prisma/client-postgresql";
import "dotenv/config";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_POSTGRESQL,
    },
  },
  log: ["query", "error", "warn"],
});

async function main() {
  const users = await prisma.user.findMany();
  console.log(users);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### Pattern 2: Dependency Injection (Recommended)

This is the pattern used in this project's Hexagonal Architecture:

```typescript
// src/@shared/infrastructure/config/dependency-injection/container.ts
import { PrismaClient } from ".prisma/client-postgresql";
import { env } from "@shared/infrastructure/config/environment";

// 1. Register PrismaClient as singleton
container.registerSingleton<PrismaClient>(
  "prismaClient",
  () => new PrismaClient({
    datasources: {
      db: {
        url: env.DATABASE_URL_POSTGRESQL,  // ✅ Pass URL here
      },
    },
    log: env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
  })
);

// 2. Register repository that uses PrismaClient
container.register<IUserRepository>(
  "userRepository",
  () => new PrismaUserRepository(
    container.resolve<PrismaClient>("prismaClient")
  )
);
```

### Pattern 3: Testing

```typescript
import { PrismaClient } from ".prisma/client-postgresql";
import { beforeAll, afterAll, beforeEach } from "vitest";

let prisma: PrismaClient;

beforeAll(async () => {
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL_TEST_POSTGRESQL,  // Use test database
      },
    },
  });
});

beforeEach(async () => {
  // Clean database before each test
  await prisma.user.deleteMany();
  await prisma.post.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});
```

## Switching Between Databases

This project supports both PostgreSQL and MongoDB with separate clients:

### PostgreSQL

```typescript
import { PrismaClient } from ".prisma/client-postgresql";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_POSTGRESQL,
    },
  },
});
```

### MongoDB

```typescript
import { PrismaClient } from ".prisma/client-mongodb";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_MONGODB,
    },
  },
});
```

## Best Practices

### ✅ DO

1. **Pass URL in constructor**:
   ```typescript
   new PrismaClient({
     datasources: { db: { url: process.env.DATABASE_URL } }
   })
   ```

2. **Use environment variables**:
   ```typescript
   url: env.DATABASE_URL_POSTGRESQL  // From validated config
   ```

3. **Always disconnect**:
   ```typescript
   await prisma.$disconnect();
   ```

4. **Use singleton pattern** (one instance per database):
   ```typescript
   container.registerSingleton("prismaClient", () => new PrismaClient(...))
   ```

### ❌ DON'T

1. **Don't put `url` in schema.prisma**:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")  // ❌ Will cause error
   }
   ```

2. **Don't create multiple instances**:
   ```typescript
   // ❌ Bad - creates new connection each time
   function getUser() {
     const prisma = new PrismaClient({ ... });
     return prisma.user.findMany();
   }
   ```

3. **Don't forget to disconnect**:
   ```typescript
   // ❌ Bad - connection leak
   const prisma = new PrismaClient({ ... });
   await prisma.user.findMany();
   // Missing: await prisma.$disconnect();
   ```

## Troubleshooting

### Error: "The datasource property `url` is no longer supported"

**Solution**: Remove `url = env("...")` from your `schema.prisma` file.

### Error: "Module '@prisma/client' has no exported member 'defineConfig'"

**Solution**: There's no `defineConfig` in Prisma 7. Pass configuration directly to PrismaClient constructor.

### Error: "PrismaClient is unable to connect to the database"

**Solution**: Make sure you're passing the database URL:
```typescript
new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_POSTGRESQL,
    },
  },
})
```

## Migration Checklist

- [x] Remove `url = env("...")` from `schema.prisma` files
- [x] Update PrismaClient instantiation to pass URL in constructor
- [x] Update DI container to use new pattern
- [x] Test database connections
- [x] Update documentation

## Resources

- [Prisma 7 Release Notes](https://github.com/prisma/prisma/releases)
- [Prisma 7 Upgrade Guide](https://www.prisma.io/docs/guides/upgrade-guides/upgrading-versions/upgrading-to-prisma-7)
- [This Project's Prisma README](./README.md)
- [Usage Examples](./USAGE_EXAMPLE.md)
