# Database and ORM Integration Guide

This guide explains how to integrate a database and ORM into the Node API Skeleton while maintaining the Hexagonal Architecture principles.

## Table of Contents

- [Architecture Principles](#architecture-principles)
- [Repository Pattern](#repository-pattern)
- [Prisma Integration](#prisma-integration)
- [TypeORM Integration](#typeorm-integration)
- [Sequelize Integration](#sequelize-integration)
- [MongoDB with Mongoose](#mongodb-with-mongoose)
- [Migration Strategy](#migration-strategy)
- [Best Practices](#best-practices)

## Architecture Principles

The skeleton follows **Hexagonal Architecture**, which means:

1. **Domain layer** is ORM-agnostic (no database dependencies)
2. **Application layer** defines repository interfaces (ports)
3. **Infrastructure layer** implements repositories with specific ORM

### Benefits

- ✅ Easy to switch ORMs without changing business logic
- ✅ Testable domain logic without database
- ✅ Clean separation of concerns
- ✅ Technology-independent core

## Repository Pattern

All database operations go through repository interfaces:

```typescript
// Application layer: Port (interface)
export interface IGreetingRepository {
  findById(id: string): Promise<Greeting | null>;
  save(greeting: Greeting): Promise<void>;
  findAll(): Promise<Greeting[]>;
}

// Infrastructure layer: Adapter (implementation)
export class PrismaGreetingRepository implements IGreetingRepository {
  // Implementation using Prisma
}
```

## Prisma Integration

[Prisma](https://www.prisma.io/) is a modern ORM with excellent TypeScript support.

### 1. Install Prisma

```bash
npm install prisma @prisma/client
npm install -D prisma
```

### 2. Initialize Prisma

```bash
npx prisma init
```

This creates:
- `prisma/schema.prisma` - Database schema
- `.env` - Database connection string

### 3. Define Schema

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Greeting {
  id        String   @id @default(uuid())
  message   String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### 4. Update Environment Variables

```typescript
// src/@shared/infrastructure/config/environment.ts
const envSchema = z.object({
  // ... existing vars
  DATABASE_URL: z.string().url(),
});
```

### 5. Create Prisma Repository

```typescript
// src/@contexts/greetings/infrastructure/persistence/PrismaGreetingRepository.ts
import { PrismaClient } from '@prisma/client';
import { Greeting } from '@contexts/greetings/domain/entities/Greeting';
import { Message } from '@contexts/greetings/domain/value-objects/Message';
import { IGreetingRepository } from '@contexts/greetings/application/v1/ports/outbound/IGreetingRepository';

export class PrismaGreetingRepository implements IGreetingRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Greeting | null> {
    const record = await this.prisma.greeting.findUnique({
      where: { id },
    });

    if (!record) return null;

    return Greeting.create(
      record.id,
      Message.create(record.message),
      record.createdAt
    );
  }

  async save(greeting: Greeting): Promise<void> {
    await this.prisma.greeting.upsert({
      where: { id: greeting.id },
      update: {
        message: greeting.message.value,
        updatedAt: new Date(),
      },
      create: {
        id: greeting.id,
        message: greeting.message.value,
        createdAt: greeting.timestamp,
      },
    });
  }

  async findAll(): Promise<Greeting[]> {
    const records = await this.prisma.greeting.findMany();

    return records.map(record =>
      Greeting.create(
        record.id,
        Message.create(record.message),
        record.createdAt
      )
    );
  }
}
```

### 6. Create Prisma Client Singleton

```typescript
// src/@shared/infrastructure/persistence/PrismaClientSingleton.ts
import { PrismaClient } from '@prisma/client';

class PrismaClientSingleton {
  private static instance: PrismaClient;

  private constructor() {}

  static getInstance(): PrismaClient {
    if (!PrismaClientSingleton.instance) {
      PrismaClientSingleton.instance = new PrismaClient({
        log: process.env.NODE_ENV === 'development'
          ? ['query', 'error', 'warn']
          : ['error'],
      });
    }
    return PrismaClientSingleton.instance;
  }

  static async disconnect(): Promise<void> {
    if (PrismaClientSingleton.instance) {
      await PrismaClientSingleton.instance.$disconnect();
    }
  }
}

export const prisma = PrismaClientSingleton.getInstance();
```

### 7. Run Migrations

```bash
# Create migration
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate

# Apply migrations in production
npx prisma migrate deploy
```

### 8. Update Use Case

Replace `InMemoryGreetingRepository` with `PrismaGreetingRepository` in your use cases or DI container.

## TypeORM Integration

[TypeORM](https://typeorm.io/) is a mature ORM for TypeScript.

### 1. Install TypeORM

```bash
npm install typeorm reflect-metadata pg
```

### 2. Create Entity

```typescript
// src/@contexts/greetings/infrastructure/persistence/typeorm/entities/GreetingEntity.ts
import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('greetings')
export class GreetingEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  message: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### 3. Create Repository

```typescript
// src/@contexts/greetings/infrastructure/persistence/TypeORMGreetingRepository.ts
import { Repository } from 'typeorm';
import { GreetingEntity } from './typeorm/entities/GreetingEntity';
import { Greeting } from '@contexts/greetings/domain/entities/Greeting';
import { Message } from '@contexts/greetings/domain/value-objects/Message';

export class TypeORMGreetingRepository implements IGreetingRepository {
  constructor(private readonly repository: Repository<GreetingEntity>) {}

  async findById(id: string): Promise<Greeting | null> {
    const entity = await this.repository.findOne({ where: { id } });
    if (!entity) return null;

    return Greeting.create(
      entity.id,
      Message.create(entity.message),
      entity.createdAt
    );
  }

  async save(greeting: Greeting): Promise<void> {
    await this.repository.save({
      id: greeting.id,
      message: greeting.message.value,
      createdAt: greeting.timestamp,
    });
  }
}
```

### 4. Configure Data Source

```typescript
// src/@shared/infrastructure/persistence/typeorm.config.ts
import { DataSource } from 'typeorm';
import { GreetingEntity } from '@contexts/greetings/infrastructure/persistence/typeorm/entities/GreetingEntity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [GreetingEntity],
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
});
```

## Sequelize Integration

[Sequelize](https://sequelize.org/) is a promise-based ORM.

### 1. Install Sequelize

```bash
npm install sequelize pg pg-hstore
npm install -D @types/sequelize
```

### 2. Create Model

```typescript
// src/@contexts/greetings/infrastructure/persistence/sequelize/models/GreetingModel.ts
import { DataTypes, Model, Sequelize } from 'sequelize';

export class GreetingModel extends Model {
  declare id: string;
  declare message: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

export function initGreetingModel(sequelize: Sequelize) {
  GreetingModel.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      message: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'greetings',
    }
  );
}
```

### 3. Create Repository

```typescript
// src/@contexts/greetings/infrastructure/persistence/SequelizeGreetingRepository.ts
export class SequelizeGreetingRepository implements IGreetingRepository {
  async findById(id: string): Promise<Greeting | null> {
    const model = await GreetingModel.findByPk(id);
    if (!model) return null;

    return Greeting.create(
      model.id,
      Message.create(model.message),
      model.createdAt
    );
  }

  async save(greeting: Greeting): Promise<void> {
    await GreetingModel.upsert({
      id: greeting.id,
      message: greeting.message.value,
    });
  }
}
```

## MongoDB with Mongoose

[Mongoose](https://mongoosejs.com/) is an ODM for MongoDB.

### 1. Install Mongoose

```bash
npm install mongoose
npm install -D @types/mongoose
```

### 2. Create Schema

```typescript
// src/@contexts/greetings/infrastructure/persistence/mongoose/schemas/GreetingSchema.ts
import { Schema, model } from 'mongoose';

const greetingSchema = new Schema({
  _id: { type: String, required: true },
  message: { type: String, required: true },
}, { timestamps: true });

export const GreetingModel = model('Greeting', greetingSchema);
```

### 3. Create Repository

```typescript
// src/@contexts/greetings/infrastructure/persistence/MongooseGreetingRepository.ts
export class MongooseGreetingRepository implements IGreetingRepository {
  async findById(id: string): Promise<Greeting | null> {
    const doc = await GreetingModel.findById(id);
    if (!doc) return null;

    return Greeting.create(
      doc._id,
      Message.create(doc.message),
      doc.createdAt
    );
  }

  async save(greeting: Greeting): Promise<void> {
    await GreetingModel.findByIdAndUpdate(
      greeting.id,
      { message: greeting.message.value },
      { upsert: true }
    );
  }
}
```

## Migration Strategy

### From In-Memory to Real Database

1. **Keep existing interface**: Don't change `IGreetingRepository`
2. **Create new implementation**: Add Prisma/TypeORM/etc repository
3. **Update dependency injection**: Switch implementation
4. **Run migrations**: Set up database schema
5. **Test thoroughly**: Ensure behavior matches

### Gradual Migration

```typescript
// You can even use both during migration!
export class HybridGreetingRepository implements IGreetingRepository {
  constructor(
    private readonly memory: InMemoryGreetingRepository,
    private readonly prisma: PrismaGreetingRepository
  ) {}

  async findById(id: string): Promise<Greeting | null> {
    // Try database first, fallback to memory
    return await this.prisma.findById(id)
      ?? await this.memory.findById(id);
  }

  async save(greeting: Greeting): Promise<void> {
    // Save to both
    await Promise.all([
      this.memory.save(greeting),
      this.prisma.save(greeting),
    ]);
  }
}
```

## Best Practices

### DO ✅

1. **Keep domain pure**: No ORM annotations in domain entities
2. **Map at boundaries**: Convert between domain and ORM models
3. **Use transactions**: Wrap multi-step operations
4. **Handle errors**: Convert ORM errors to domain exceptions
5. **Test with real DB**: Use test containers for integration tests

### DON'T ❌

1. **Don't expose ORM entities**: Always return domain entities
2. **Don't use ORM in domain**: Keep domain layer clean
3. **Don't skip mapping**: Always map between layers
4. **Don't ignore transactions**: Database integrity is crucial
5. **Don't test with mocks only**: Test against real database

### Example: Transaction Handling

```typescript
// src/@contexts/greetings/infrastructure/persistence/PrismaGreetingRepository.ts
export class PrismaGreetingRepository implements IGreetingRepository {
  async saveMultiple(greetings: Greeting[]): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      for (const greeting of greetings) {
        await tx.greeting.upsert({
          where: { id: greeting.id },
          update: { message: greeting.message.value },
          create: {
            id: greeting.id,
            message: greeting.message.value,
            createdAt: greeting.timestamp,
          },
        });
      }
    });
  }
}
```

### Example: Error Handling

```typescript
async findById(id: string): Promise<Greeting | null> {
  try {
    const record = await this.prisma.greeting.findUnique({
      where: { id },
    });

    if (!record) return null;

    return Greeting.create(
      record.id,
      Message.create(record.message),
      record.createdAt
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle specific Prisma errors
      throw new DatabaseException(`Failed to find greeting: ${error.message}`);
    }
    throw error;
  }
}
```

## Testing with Database

### Option 1: Test Containers

```typescript
import { GenericContainer } from 'testcontainers';

describe('PrismaGreetingRepository', () => {
  let container;
  let repository;

  beforeAll(async () => {
    container = await new GenericContainer('postgres:15')
      .withExposedPorts(5432)
      .withEnvironment({
        POSTGRES_USER: 'test',
        POSTGRES_PASSWORD: 'test',
        POSTGRES_DB: 'test',
      })
      .start();

    const url = `postgresql://test:test@localhost:${container.getMappedPort(5432)}/test`;
    // Initialize Prisma with test database
  });

  afterAll(async () => {
    await container.stop();
  });

  it('should save and retrieve greeting', async () => {
    // Test with real database
  });
});
```

### Option 2: Separate Test Database

```typescript
// Use environment-specific database
const DATABASE_URL = process.env.NODE_ENV === 'test'
  ? process.env.TEST_DATABASE_URL
  : process.env.DATABASE_URL;
```

## Summary

The key to database integration in Hexagonal Architecture:

1. **Define interfaces** in application layer
2. **Implement with specific ORM** in infrastructure layer
3. **Keep domain pure** - no database dependencies
4. **Map at boundaries** - convert between domain and persistence models
5. **Test properly** - use real databases for integration tests

This approach allows you to:
- Switch ORMs easily
- Test business logic without database
- Keep options open for future changes
- Maintain clean architecture

Choose the ORM that best fits your needs - the architecture supports any choice!
