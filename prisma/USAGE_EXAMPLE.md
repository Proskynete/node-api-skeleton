# Prisma 7 Usage Example

This guide shows how to use Prisma 7 with this project's Hexagonal Architecture.

## Quick Start

### 1. Choose Your Database

```bash
# For PostgreSQL
export DATABASE_URL_POSTGRESQL="postgresql://user:password@localhost:5432/mydb?schema=public"

# For MongoDB
export DATABASE_URL_MONGODB="mongodb://user:password@localhost:27017/mydb"
```

### 2. Add Models to Schema

**PostgreSQL Example** (`prisma/postgresql/schema.prisma`):

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  posts     Post[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Post {
  id        String   @id @default(uuid())
  title     String
  content   String?
  published Boolean  @default(false)
  author    User     @relation(fields: [authorId], references: [id])
  authorId  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### 3. Generate Client

```bash
npm run prisma:generate:pg
# or
npm run prisma:generate:mongo
```

### 4. Run Migrations (PostgreSQL only)

```bash
npm run prisma:migrate:pg
```

For MongoDB, use:
```bash
npm run prisma:push:mongo
```

## Integration with Hexagonal Architecture

### Step 1: Create Domain Entity

```typescript
// src/@contexts/users/domain/entities/User.ts
import { Email } from "@contexts/users/domain/value-objects/Email";

export class User {
  private constructor(
    public readonly id: string,
    public readonly email: Email,
    public readonly name: string | null,
    public readonly createdAt: Date
  ) {}

  static create(
    id: string,
    email: string,
    name: string | null,
    createdAt: Date
  ): User {
    return new User(id, Email.create(email), name, createdAt);
  }

  static fromPrimitives(data: {
    id: string;
    email: string;
    name: string | null;
    createdAt: Date;
  }): User {
    return User.create(data.id, data.email, data.name, data.createdAt);
  }

  toPrimitives() {
    return {
      id: this.id,
      email: this.email.value,
      name: this.name,
      createdAt: this.createdAt,
    };
  }
}
```

### Step 2: Define Repository Interface (Port)

```typescript
// src/@contexts/users/application/v1/ports/outbound/IUserRepository.ts
import { User } from "@contexts/users/domain/entities/User";

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<void>;
  delete(id: string): Promise<void>;
}
```

### Step 3: Implement Repository with Prisma 7

```typescript
// src/@contexts/users/infrastructure/persistence/PrismaUserRepository.ts
import { PrismaClient } from ".prisma/client-postgresql";
import { IUserRepository } from "@contexts/users/application/v1/ports/outbound/IUserRepository";
import { User } from "@contexts/users/domain/entities/User";

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!record) return null;

    return User.fromPrimitives({
      id: record.id,
      email: record.email,
      name: record.name,
      createdAt: record.createdAt,
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!record) return null;

    return User.fromPrimitives({
      id: record.id,
      email: record.email,
      name: record.name,
      createdAt: record.createdAt,
    });
  }

  async save(user: User): Promise<void> {
    const data = user.toPrimitives();

    await this.prisma.user.upsert({
      where: { id: data.id },
      update: {
        email: data.email,
        name: data.name,
      },
      create: {
        id: data.id,
        email: data.email,
        name: data.name,
        createdAt: data.createdAt,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }
}
```

### Step 4: Register in DI Container

```typescript
// src/@shared/infrastructure/config/dependency-injection/container.ts
import { PrismaClient } from ".prisma/client-postgresql";
import { env } from "@shared/infrastructure/config/environment";
import { PrismaUserRepository } from "@contexts/users/infrastructure/persistence/PrismaUserRepository";
import { IUserRepository } from "@contexts/users/application/v1/ports/outbound/IUserRepository";

// Register Prisma Client as singleton (Prisma 7 way)
container.registerSingleton<PrismaClient>(
  "prismaClient",
  () => new PrismaClient({
    datasources: {
      db: {
        url: env.DATABASE_URL_POSTGRESQL,
      },
    },
    log: env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
  })
);

// Register User Repository
container.register<IUserRepository>(
  "userRepository",
  () => new PrismaUserRepository(
    container.resolve<PrismaClient>("prismaClient")
  )
);
```

### Step 5: Use in Use Case

```typescript
// src/@contexts/users/application/v1/use-cases/GetUserUseCase.ts
import { IUserRepository } from "@contexts/users/application/v1/ports/outbound/IUserRepository";
import { Result, ok, fail } from "@shared/types/result";
import { DomainException } from "@shared/domain/exceptions/DomainException";
import { UserResponseDto } from "@contexts/users/application/v1/dtos/UserResponseDto";
import { ILogger } from "@shared/infrastructure/observability/ILogger";

export class GetUserUseCase {
  constructor(
    private readonly repository: IUserRepository,
    private readonly logger: ILogger
  ) {}

  async execute(userId: string): Promise<Result<UserResponseDto, DomainException>> {
    try {
      this.logger.debug(`GetUserUseCase: Fetching user ${userId}`);

      const user = await this.repository.findById(userId);

      if (!user) {
        return fail(
          new DomainException(
            `User with id ${userId} not found`,
            "USER_NOT_FOUND",
            404
          )
        );
      }

      this.logger.info(`GetUserUseCase: User ${userId} fetched successfully`);

      const primitives = user.toPrimitives();
      return ok({
        id: primitives.id,
        email: primitives.email,
        name: primitives.name,
        createdAt: primitives.createdAt.toISOString(),
      });
    } catch (error) {
      this.logger.error("GetUserUseCase: Failed to fetch user", error as Error);

      if (error instanceof DomainException) {
        return fail(error);
      }

      return fail(
        new DomainException(
          "Failed to fetch user",
          "USER_FETCH_ERROR",
          500
        )
      );
    }
  }
}
```

## Important Notes for Prisma 7

1. **No `url` in schema.prisma**: URLs are removed from schema files
2. **Pass URL to PrismaClient**: Must provide database URL in the `datasources` option when instantiating PrismaClient:
   ```typescript
   new PrismaClient({
     datasources: {
       db: {
         url: process.env.DATABASE_URL,
       },
     },
   })
   ```
3. **Separate clients**: PostgreSQL and MongoDB use different generated clients (`.prisma/client-postgresql` and `.prisma/client-mongodb`)
4. **Always disconnect**: Remember to call `prisma.$disconnect()` when your app shuts down

## Testing with Prisma

```typescript
// test/unit/@contexts/users/application/v1/use-cases/GetUserUseCase.spec.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetUserUseCase } from "@contexts/users/application/v1/use-cases/GetUserUseCase";
import { IUserRepository } from "@contexts/users/application/v1/ports/outbound/IUserRepository";
import { User } from "@contexts/users/domain/entities/User";
import { isSuccess, isFailure } from "@shared/types/result";

describe("GetUserUseCase", () => {
  let useCase: GetUserUseCase;
  let mockRepository: IUserRepository;
  let mockLogger: ILogger;

  beforeEach(() => {
    mockRepository = {
      findById: vi.fn(),
      findByEmail: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
    };

    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
    };

    useCase = new GetUserUseCase(mockRepository, mockLogger);
  });

  it("should return user when found", async () => {
    const user = User.create(
      "123",
      "test@example.com",
      "Test User",
      new Date()
    );

    vi.spyOn(mockRepository, "findById").mockResolvedValue(user);

    const result = await useCase.execute("123");

    expect(isSuccess(result)).toBe(true);
    if (isSuccess(result)) {
      expect(result.value.email).toBe("test@example.com");
    }
  });

  it("should return failure when user not found", async () => {
    vi.spyOn(mockRepository, "findById").mockResolvedValue(null);

    const result = await useCase.execute("999");

    expect(isFailure(result)).toBe(true);
    if (isFailure(result)) {
      expect(result.error.code).toBe("USER_NOT_FOUND");
    }
  });
});
```

## Resources

- [Prisma 7 Documentation](https://www.prisma.io/docs)
- [Prisma 7 Migration Guide](https://www.prisma.io/docs/guides/upgrade-guides/upgrading-versions/upgrading-to-prisma-7)
- [Hexagonal Architecture Guide](../ARCHITECTURE.md)
