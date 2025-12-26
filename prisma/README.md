# Prisma Database Configuration

This project supports **both PostgreSQL and MongoDB** databases using Prisma ORM v7.

## Directory Structure

```
prisma/
├── postgresql/
│   └── schema.prisma      # PostgreSQL schema definition
├── mongodb/
│   └── schema.prisma      # MongoDB schema definition
└── README.md              # This file
```

## ⚠️ Important: Prisma 7 Changes

**Prisma 7 no longer supports `url` in `schema.prisma` files.** Database URLs are now passed directly to the `PrismaClient` constructor.

## Environment Variables

Add the appropriate database URL to your `.env` file:

```bash
# For PostgreSQL
DATABASE_URL_POSTGRESQL="postgresql://user:password@localhost:5432/dbname?schema=public"

# For MongoDB
DATABASE_URL_MONGODB="mongodb://user:password@localhost:27017/dbname"
```

## Usage

### PostgreSQL

**1. Generate Prisma Client**
```bash
npx prisma generate --schema=./prisma/postgresql/schema.prisma
```

**2. Create and Run Migrations**
```bash
# Create a new migration
npx prisma migrate dev --name init --schema=./prisma/postgresql/schema.prisma

# Apply migrations in production
npx prisma migrate deploy --schema=./prisma/postgresql/schema.prisma
```

**3. Open Prisma Studio**
```bash
npx prisma studio --schema=./prisma/postgresql/schema.prisma
```

**4. Using in Code (Prisma 7)**

In Prisma 7, you pass the database URL directly to the PrismaClient constructor:

```typescript
import { PrismaClient } from ".prisma/client-postgresql";

// Create client with database URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_POSTGRESQL,
    },
  },
});

// Example usage
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

### MongoDB

**1. Generate Prisma Client**
```bash
npx prisma generate --schema=./prisma/mongodb/schema.prisma
```

**2. Push Schema to Database**
```bash
# MongoDB doesn't use migrations, instead use db push
npx prisma db push --schema=./prisma/mongodb/schema.prisma
```

**3. Open Prisma Studio**
```bash
npx prisma studio --schema=./prisma/mongodb/schema.prisma
```

**4. Using in Code (Prisma 7)**

In Prisma 7, you pass the database URL directly to the PrismaClient constructor:

```typescript
import { PrismaClient } from ".prisma/client-mongodb";

// Create client with database URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_MONGODB,
    },
  },
});

// Example usage
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

## Adding Models

### PostgreSQL Example

Edit `prisma/postgresql/schema.prisma`:

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

### MongoDB Example

Edit `prisma/mongodb/schema.prisma`:

```prisma
model User {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  email     String   @unique
  name      String?
  posts     Post[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Post {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  title     String
  content   String?
  published Boolean  @default(false)
  author    User     @relation(fields: [authorId], references: [id])
  authorId  String   @db.ObjectId
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## NPM Scripts (Recommended)

Add these scripts to your `package.json` for easier usage:

```json
{
  "scripts": {
    "prisma:generate:pg": "prisma generate --schema=./prisma/postgresql/schema.prisma",
    "prisma:generate:mongo": "prisma generate --schema=./prisma/mongodb/schema.prisma",
    "prisma:migrate:pg": "prisma migrate dev --schema=./prisma/postgresql/schema.prisma",
    "prisma:push:mongo": "prisma db push --schema=./prisma/mongodb/schema.prisma",
    "prisma:studio:pg": "prisma studio --schema=./prisma/postgresql/schema.prisma",
    "prisma:studio:mongo": "prisma studio --schema=./prisma/mongodb/schema.prisma"
  }
}
```

## Integration with Hexagonal Architecture

Create repository implementations using Prisma:

```typescript
// src/@contexts/users/infrastructure/persistence/PrismaUserRepository.ts
import { PrismaClient } from ".prisma/client-postgresql"; // or client-mongodb
import { IUserRepository } from "@contexts/users/application/ports/outbound/IUserRepository";
import { User } from "@contexts/users/domain/entities/User";

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    const userData = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!userData) return null;

    // Map Prisma model to Domain entity
    return User.create(userData);
  }
}
```

**Example: Register in DI Container**

```typescript
// src/@shared/infrastructure/config/dependency-injection/container.ts
import { PrismaClient } from ".prisma/client-postgresql";
import { env } from "@shared/infrastructure/config/environment";

// Register Prisma Client (singleton) - Prisma 7 way
container.registerSingleton<PrismaClient>(
  "prismaClient",
  () => new PrismaClient({
    datasources: {
      db: {
        url: env.DATABASE_URL_POSTGRESQL,
      },
    },
    log: env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  })
);

// Register repository
container.register<IUserRepository>(
  "userRepository",
  () => new PrismaUserRepository(
    container.resolve<PrismaClient>("prismaClient")
  )
);
```

## Notes

- **PostgreSQL** uses migrations for schema changes
- **MongoDB** uses `db push` to sync schema (no migration files)
- Each database has its own generated client in `node_modules/.prisma/`
- You can use both databases in the same project if needed
- Always run `prisma generate` after modifying the schema

## Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Provider](https://www.prisma.io/docs/concepts/database-connectors/postgresql)
- [MongoDB Provider](https://www.prisma.io/docs/concepts/database-connectors/mongodb)
