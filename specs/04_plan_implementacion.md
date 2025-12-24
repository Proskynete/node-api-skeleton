# 04 - Plan de Implementación por Etapas

## Fecha de Creación

2025-12-23

## Última Actualización

2025-12-23 - Actualizado para Fastify, SWC, Vitest y Screaming Architecture

## Objetivo

Definir un plan de implementación incremental, ejecutable y medible para migrar el proyecto a arquitectura Hexagonal + Onion + Screaming con Fastify, SWC y Vitest.

## Stack Tecnológico Confirmado

- **Framework HTTP**: Fastify
- **Compilador**: SWC
- **Tests Unitarios**: Vitest
- **Tests Integración/E2E**: Supertest + Vitest
- **Tests Performance**: k6
- **Validación**: Zod
- **Logger**: Winston
- **Métricas**: prom-client

## 🎯 Enfoque del Proyecto: Híbrido Pragmático (OOP + FP + DDD)

Este proyecto está diseñado con un enfoque **híbrido y pragmático**:

### Paradigma: Lo Mejor de Ambos Mundos

- ✅ **OOP para estructura**: Entidades, Value Objects, Use Cases como clases inmutables
- ✅ **FP para transformaciones**: DTOs como types, Mappers y Utils como funciones puras
- ✅ **Datos inmutables** por defecto (readonly)
- ✅ **Funciones puras** en lógica de negocio
- ✅ **Composición** sobre herencia
- ✅ **Type safety** estricto

### Decisiones de Diseño

| Concepto | Implementación | Razón |
|----------|---------------|-------|
| Entidades | Clases inmutables | Encapsulación + métodos de negocio |
| Value Objects | Clases inmutables | Validación + equality |
| DTOs | Types/Interfaces | Sin lógica, solo datos |
| Mappers | Funciones puras | Transformación sin estado |
| Use Cases | Clases | DI natural, testing fácil |
| Repositories | Clases | Gestión de estado |
| Utilities | Funciones puras | Helpers sin estado |

### Por Qué Híbrido?

1. **Pragmatismo**: La herramienta correcta para cada trabajo
2. **Familiaridad**: Fácil para cualquier dev TypeScript
3. **Ecosistema**: Compatible con Fastify, Prisma, Winston (clases)
4. **Testabilidad**: DI facilita mocking
5. **DDD**: Sigue patrones establecidos

**Nota**: Ver `specs/05_enfoque_hibrido_pragmatico.md` para ejemplos completos del enfoque híbrido.

## Principios del Plan

### 1. Incremental

- Cada etapa entrega valor
- No bloquea desarrollo actual
- Permite testing continuo

### 2. Medible

- Objetivos claros por etapa
- Criterios de aceptación definidos
- Métricas de progreso

### 3. Reversible

- Cambios pueden rollback si es necesario
- Coexistencia de código viejo y nuevo durante migración
- Feature flags cuando sea pertinente

## Visión General

```
Etapa 0: Preparación y Setup (2-3 días)
    ↓
Etapa 1: Fundamentos (Fastify + SWC + Vitest) (3-5 días)
    ↓
Etapa 2: Core/Dominio (Screaming Architecture) (4-5 días)
    ↓
Etapa 3: Capa de Aplicación v1 (4-5 días)
    ↓
Etapa 4: Infraestructura HTTP con Fastify v1 (5-6 días)
    ↓
Etapa 5: Versionado v2 (3-4 días)
    ↓
Etapa 6: Observabilidad (Winston + Prometheus) (4-5 días)
    ↓
Etapa 7: Mejoras Opcionales (5-10 días)
    ↓
Etapa 8: Cleanup y Documentación (2-3 días)
```

**Total Estimado**: 32-50 días (calendario, no esfuerzo)

---

## Etapa 0: Preparación y Setup

### Objetivos

- Configurar ambiente de trabajo
- Instalar nuevas dependencias
- Configurar Fastify, SWC y Vitest
- Establecer baseline

### Tareas

#### 0.1 Backup y Baseline

```bash
# Crear rama de migración
git checkout -b feat/hexagonal-fastify-migration

# Guardar estado actual
npm run test:coverage
# Guardar reporte de coverage para comparar después
```

#### 0.2 Instalar Dependencias

**Production Dependencies**:

```bash
npm install fastify @fastify/cors @fastify/helmet @fastify/swagger @fastify/swagger-ui
npm install zod winston prom-client
npm install dotenv
```

**Development Dependencies**:

```bash
npm install -D @swc/core @swc/cli @swc-node/register
npm install -D vitest @vitest/coverage-v8 @vitest/ui
npm install -D supertest @types/supertest
npm install -D @types/node
npm install -D nodemon
```

**Desinstalar (opcional, al final)**:

```bash
# npm uninstall jest ts-jest @types/jest express @types/express morgan @types/morgan
# Lo haremos al final para no romper nada durante la migración
```

#### 0.3 Configurar SWC

**Archivo**: `.swcrc`

```json
{
  "jsc": {
    "parser": {
      "syntax": "typescript",
      "decorators": true,
      "dynamicImport": true
    },
    "target": "es2022",
    "transform": {
      "decoratorMetadata": false
    },
    "keepClassNames": true,
    "baseUrl": "./src",
    "paths": {
      "@core/*": ["@core/*"],
      "@application/*": ["@application/*"],
      "@infrastructure/*": ["@infrastructure/*"],
      "@shared/*": ["@shared/*"]
    }
  },
  "module": {
    "type": "commonjs"
  },
  "minify": false,
  "sourceMaps": true
}
```

#### 0.4 Configurar Vitest

**Archivo**: `vitest.config.ts`

```typescript
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      exclude: [
        "node_modules/",
        "dist/",
        "src/main.ts",
        "src/@infrastructure/config/",
        "**/*.spec.ts",
        "**/*.test.ts",
      ],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
    include: ["test/**/*.spec.ts"],
    exclude: ["node_modules", "dist"],
  },
  resolve: {
    alias: {
      "@core": path.resolve(__dirname, "./src/@core"),
      "@application": path.resolve(__dirname, "./src/@application"),
      "@infrastructure": path.resolve(__dirname, "./src/@infrastructure"),
      "@shared": path.resolve(__dirname, "./src/@shared"),
    },
  },
});
```

#### 0.5 Actualizar package.json Scripts

```json
{
  "scripts": {
    "dev": "nodemon --exec node --loader @swc-node/register/esm src/main.ts",
    "build": "swc src -d dist --copy-files",
    "start": "node dist/main.js",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui",
    "lint": "eslint --ignore-path .gitignore . --ext .ts",
    "lint:fix": "npm run lint -- --fix"
  }
}
```

#### 0.6 Actualizar tsconfig.json

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "target": "es2022",
    "types": ["node", "vitest/globals"],
    "strict": true,
    "moduleResolution": "node",
    "outDir": "dist",
    "resolveJsonModule": true,
    "baseUrl": "./src",
    "paths": {
      "@core/*": ["@core/*"],
      "@application/*": ["@application/*"],
      "@infrastructure/*": ["@infrastructure/*"],
      "@shared/*": ["@shared/*"]
    }
  },
  "include": ["src/**/*", "test/**/*"]
}
```

### Criterios de Aceptación

- ✅ Dependencias instaladas correctamente
- ✅ SWC configurado (build funciona)
- ✅ Vitest configurado (tests básicos corren)
- ✅ Alias de paths funcionando
- ✅ Scripts de npm actualizados

### Duración Estimada

2-3 días

---

## Etapa 1: Fundamentos (Estructura Base)

### Objetivos

- Crear estructura de carpetas con Screaming Architecture
- Configurar validación de ambiente con Zod
- Migrar utilidades compartidas
- Setup básico de Fastify

### Tareas

#### 1.1 Crear Estructura de Carpetas

```bash
# Core (Dominio)
mkdir -p src/@core/domain/greetings/{entities,value-objects,services,exceptions}
mkdir -p src/@core/domain/shared/{exceptions,value-objects}
mkdir -p src/@core/ports/inbound/greetings
mkdir -p src/@core/ports/outbound/{greetings,shared}

# Application (Casos de uso)
mkdir -p src/@application/v1/greetings/{use-cases,dtos,mappers,validators}
mkdir -p src/@application/v1/shared/{dtos,mappers}
mkdir -p src/@application/v2/greetings/{use-cases,dtos,mappers,validators}
mkdir -p src/@application/shared/interfaces

# Infrastructure
mkdir -p src/@infrastructure/http/v1/greetings/{controllers,routes}
mkdir -p src/@infrastructure/http/v2/greetings/{controllers,routes}
mkdir -p src/@infrastructure/http/shared/{plugins,middlewares,hooks}
mkdir -p src/@infrastructure/persistence/greetings
mkdir -p src/@infrastructure/external-services
mkdir -p src/@infrastructure/observability/{logger,metrics}
mkdir -p src/@infrastructure/config/dependency-injection

# Shared
mkdir -p src/@shared/{types,utils,constants}

# Tests (misma estructura)
mkdir -p test/unit/@core/domain/greetings
mkdir -p test/unit/@application/v1/greetings
mkdir -p test/integration/v1
mkdir -p test/integration/v2
mkdir -p test/e2e
mkdir -p test/performance
```

#### 1.2 Configuración de Ambiente con Zod

**Archivo**: `src/@infrastructure/config/environment.ts`

```typescript
import { z } from "zod";
import "dotenv/config";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z
    .string()
    .transform(Number)
    .pipe(z.number().positive())
    .default("3000"),
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
  // Agregar más según necesidad
});

export type Environment = z.infer<typeof envSchema>;

function loadEnvironment(): Environment {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Invalid environment variables:");
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join(".")}: ${err.message}`);
      });
    }
    process.exit(1);
  }
}

export const env = loadEnvironment();
```

#### 1.3 Migrar Utilidades Compartidas

**Archivo**: `src/@shared/constants/status-codes.ts`

```typescript
export enum StatusCode {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}
```

**Archivo**: `src/@shared/types/Result.ts`

```typescript
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

export const success = <T>(data: T): Result<T, never> => ({
  success: true,
  data,
});

export const failure = <E>(error: E): Result<never, E> => ({
  success: false,
  error,
});
```

**Archivo**: `src/@shared/types/Either.ts`

```typescript
export type Either<L, R> = Left<L> | Right<R>;

class Left<L> {
  readonly value: L;
  constructor(value: L) {
    this.value = value;
  }
  isLeft(): this is Left<L> {
    return true;
  }
  isRight(): this is Right<never> {
    return false;
  }
}

class Right<R> {
  readonly value: R;
  constructor(value: R) {
    this.value = value;
  }
  isLeft(): this is Left<never> {
    return false;
  }
  isRight(): this is Right<R> {
    return true;
  }
}

export const left = <L>(l: L): Either<L, never> => new Left(l);
export const right = <R>(r: R): Either<never, R> => new Right(r);
```

#### 1.4 Setup Básico de Fastify

**Archivo**: `src/@infrastructure/http/server.ts`

```typescript
import Fastify, { FastifyInstance } from "fastify";
import { env } from "../config/environment";

export async function buildServer(): Promise<FastifyInstance> {
  const fastify = Fastify({
    logger: {
      level: env.LOG_LEVEL,
      transport:
        env.NODE_ENV === "development"
          ? {
              target: "pino-pretty",
              options: {
                colorize: true,
              },
            }
          : undefined,
    },
    requestIdLogLabel: "requestId",
    disableRequestLogging: false,
  });

  // Health check básico
  fastify.get("/health", async () => ({
    status: "ok",
    timestamp: new Date().toISOString(),
  }));

  return fastify;
}
```

**Archivo**: `src/main.ts`

```typescript
import { buildServer } from "./@infrastructure/http/server";
import { env } from "./@infrastructure/config/environment";

async function bootstrap() {
  try {
    const server = await buildServer();

    await server.listen({
      port: env.PORT,
      host: "0.0.0.0",
    });

    console.log(`🚀 Server running at http://localhost:${env.PORT}`);
  } catch (error) {
    console.error("❌ Error starting server:", error);
    process.exit(1);
  }
}

bootstrap();
```

### Criterios de Aceptación

- ✅ Estructura de carpetas creada
- ✅ Variables de ambiente validadas con Zod
- ✅ Fastify arranca en `npm run dev`
- ✅ `/health` responde correctamente
- ✅ Hot reload funciona con nodemon

### Duración Estimada

3-5 días

---

## Etapa 2: Core/Dominio (Screaming Architecture)

### Objetivos

- Crear entidades de dominio puras
- Implementar value objects
- Definir excepciones de dominio
- Definir puertos (interfaces)
- Tests unitarios del dominio

### Tareas

#### 2.1 Excepciones de Dominio

**Archivo**: `src/@core/domain/shared/exceptions/DomainException.ts`

```typescript
export abstract class DomainException extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
```

**Archivo**: `src/@core/domain/greetings/exceptions/InvalidGreetingException.ts`

```typescript
import { DomainException } from "../../shared/exceptions/DomainException";

export class InvalidGreetingException extends DomainException {
  constructor(message: string) {
    super(message, "INVALID_GREETING", 400);
  }
}
```

#### 2.2 Value Objects

**Archivo**: `src/@core/domain/greetings/value-objects/Message.ts`

```typescript
import { InvalidGreetingException } from "../exceptions/InvalidGreetingException";

export class Message {
  private readonly MIN_LENGTH = 1;
  private readonly MAX_LENGTH = 200;

  private constructor(private readonly _value: string) {
    this.validate();
  }

  static create(value: string): Message {
    return new Message(value);
  }

  private validate(): void {
    if (!this._value || this._value.trim().length < this.MIN_LENGTH) {
      throw new InvalidGreetingException("Message cannot be empty");
    }
    if (this._value.length > this.MAX_LENGTH) {
      throw new InvalidGreetingException(
        `Message too long (max ${this.MAX_LENGTH} characters)`
      );
    }
  }

  get value(): string {
    return this._value;
  }

  equals(other: Message): boolean {
    return this._value === other._value;
  }
}
```

#### 2.3 Entidades

**Archivo**: `src/@core/domain/greetings/entities/Greeting.ts`

```typescript
import { Message } from "../value-objects/Message";

export class Greeting {
  private constructor(
    private readonly _message: Message,
    private readonly _createdAt: Date
  ) {}

  static create(text: string): Greeting {
    const message = Message.create(text);
    return new Greeting(message, new Date());
  }

  static reconstitute(text: string, createdAt: Date): Greeting {
    const message = Message.create(text);
    return new Greeting(message, createdAt);
  }

  get message(): string {
    return this._message.value;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  toJSON() {
    return {
      message: this.message,
      createdAt: this.createdAt,
    };
  }
}
```

#### 2.4 Puertos (Interfaces)

**Archivo**: `src/@core/ports/inbound/greetings/IGetGreetingUseCase.ts`

```typescript
import { GreetingResponseDto } from "../../../../@application/v1/greetings/dtos/GreetingResponseDto";

export interface IGetGreetingUseCase {
  execute(): Promise<GreetingResponseDto>;
}
```

**Archivo**: `src/@core/ports/outbound/greetings/IGreetingRepository.ts`

```typescript
import { Greeting } from "../../../domain/greetings/entities/Greeting";

export interface IGreetingRepository {
  getGreeting(): Promise<Greeting>;
  save(greeting: Greeting): Promise<void>;
}
```

**Archivo**: `src/@core/ports/outbound/shared/ILogger.ts`

```typescript
export interface ILogger {
  info(message: string, meta?: object): void;
  error(message: string, error?: Error, meta?: object): void;
  warn(message: string, meta?: object): void;
  debug(message: string, meta?: object): void;
}
```

#### 2.5 Tests Unitarios del Dominio (Vitest)

**Archivo**: `test/unit/@core/domain/greetings/entities/Greeting.spec.ts`

```typescript
import { describe, it, expect } from "vitest";
import { Greeting } from "../../../../../../src/@core/domain/greetings/entities/Greeting";
import { InvalidGreetingException } from "../../../../../../src/@core/domain/greetings/exceptions/InvalidGreetingException";

describe("Greeting Entity", () => {
  describe("create", () => {
    it("should create a valid greeting", () => {
      const greeting = Greeting.create("Hello World");

      expect(greeting.message).toBe("Hello World");
      expect(greeting.createdAt).toBeInstanceOf(Date);
    });

    it("should throw error for empty message", () => {
      expect(() => Greeting.create("")).toThrow(InvalidGreetingException);
      expect(() => Greeting.create("  ")).toThrow(InvalidGreetingException);
    });

    it("should throw error for too long message", () => {
      const longMessage = "a".repeat(201);
      expect(() => Greeting.create(longMessage)).toThrow(
        InvalidGreetingException
      );
    });
  });

  describe("reconstitute", () => {
    it("should reconstitute a greeting with specific date", () => {
      const date = new Date("2025-01-01");
      const greeting = Greeting.reconstitute("Hello", date);

      expect(greeting.message).toBe("Hello");
      expect(greeting.createdAt).toEqual(date);
    });
  });

  describe("toJSON", () => {
    it("should serialize to JSON", () => {
      const greeting = Greeting.create("Hello");
      const json = greeting.toJSON();

      expect(json).toHaveProperty("message", "Hello");
      expect(json).toHaveProperty("createdAt");
    });
  });
});
```

**Archivo**: `test/unit/@core/domain/greetings/value-objects/Message.spec.ts`

```typescript
import { describe, it, expect } from "vitest";
import { Message } from "../../../../../../src/@core/domain/greetings/value-objects/Message";
import { InvalidGreetingException } from "../../../../../../src/@core/domain/greetings/exceptions/InvalidGreetingException";

describe("Message Value Object", () => {
  describe("create", () => {
    it("should create a valid message", () => {
      const message = Message.create("Hello");
      expect(message.value).toBe("Hello");
    });

    it("should throw for empty string", () => {
      expect(() => Message.create("")).toThrow(InvalidGreetingException);
    });

    it("should throw for whitespace only", () => {
      expect(() => Message.create("   ")).toThrow(InvalidGreetingException);
    });

    it("should throw for too long message", () => {
      const longText = "a".repeat(201);
      expect(() => Message.create(longText)).toThrow(InvalidGreetingException);
    });

    it("should accept message at max length", () => {
      const maxText = "a".repeat(200);
      const message = Message.create(maxText);
      expect(message.value).toBe(maxText);
    });
  });

  describe("equals", () => {
    it("should return true for same value", () => {
      const msg1 = Message.create("Hello");
      const msg2 = Message.create("Hello");
      expect(msg1.equals(msg2)).toBe(true);
    });

    it("should return false for different values", () => {
      const msg1 = Message.create("Hello");
      const msg2 = Message.create("World");
      expect(msg1.equals(msg2)).toBe(false);
    });
  });
});
```

### Criterios de Aceptación

- ✅ Entidad Greeting implementada
- ✅ Value Object Message implementado
- ✅ Excepciones de dominio creadas
- ✅ Puertos definidos
- ✅ Tests unitarios con Vitest pasando
- ✅ Coverage del dominio > 90%
- ✅ Lógica de negocio sin dependencias externas

### Duración Estimada

4-5 días

---

## Etapa 3: Capa de Aplicación v1

### Objetivos

- Crear DTOs con Zod
- Implementar mappers
- Implementar casos de uso
- Tests de casos de uso

### Tareas

#### 3.1 DTOs con Zod

**Archivo**: `src/@application/v1/greetings/dtos/GreetingResponseDto.ts`

```typescript
import { z } from "zod";

export const GreetingResponseSchema = z.object({
  message: z.string().min(1),
});

export type GreetingResponseDto = z.infer<typeof GreetingResponseSchema>;
```

**Archivo**: `src/@application/v1/greetings/dtos/GreetingRequestDto.ts`

```typescript
import { z } from "zod";

export const GreetingRequestSchema = z.object({
  customMessage: z.string().min(1).max(200).optional(),
});

export type GreetingRequestDto = z.infer<typeof GreetingRequestSchema>;
```

#### 3.2 Mappers (Funciones Puras)

**Archivo**: `src/@application/v1/greetings/mappers/GreetingMapper.ts`

```typescript
import { Greeting } from "../../../../@core/domain/greetings/entities/Greeting";
import { GreetingResponseDto } from "../dtos/GreetingResponseDto";

// Mappers como funciones puras (no clases)
export const greetingToDto = (entity: Greeting): GreetingResponseDto => ({
  message: entity.message,
});

export const greetingToDomain = (message: string): Greeting =>
  Greeting.create(message);

// Composición: mapear arrays
export const greetingsToDto = (entities: Greeting[]): GreetingResponseDto[] =>
  entities.map(greetingToDto);
```

#### 3.3 Use Cases (Clases con DI)

**Archivo**: `src/@application/v1/greetings/use-cases/GetGreetingUseCase.ts`

```typescript
import { IGetGreetingUseCase } from "../../../../@core/ports/inbound/greetings/IGetGreetingUseCase";
import { IGreetingRepository } from "../../../../@core/ports/outbound/greetings/IGreetingRepository";
import { ILogger } from "../../../../@core/ports/outbound/shared/ILogger";
import { GreetingResponseDto } from "../dtos/GreetingResponseDto";
import { greetingToDto } from "../mappers/GreetingMapper";

export class GetGreetingUseCase implements IGetGreetingUseCase {
  constructor(
    private readonly repository: IGreetingRepository,
    private readonly logger: ILogger
  ) {}

  async execute(): Promise<GreetingResponseDto> {
    this.logger.debug("GetGreetingUseCase: Fetching greeting");

    const greeting = await this.repository.getGreeting();

    this.logger.info("GetGreetingUseCase: Greeting fetched successfully");

    // Uso de función pura para mapear
    return greetingToDto(greeting);
  }
}
```

#### 3.4 Tests de Use Cases (con mocks)

**Archivo**: `test/unit/@application/v1/greetings/use-cases/GetGreetingUseCase.spec.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetGreetingUseCase } from "../../../../../../../src/@application/v1/greetings/use-cases/GetGreetingUseCase";
import { IGreetingRepository } from "../../../../../../../src/@core/ports/outbound/greetings/IGreetingRepository";
import { ILogger } from "../../../../../../../src/@core/ports/outbound/shared/ILogger";
import { Greeting } from "../../../../../../../src/@core/domain/greetings/entities/Greeting";

describe("GetGreetingUseCase", () => {
  let useCase: GetGreetingUseCase;
  let mockRepository: IGreetingRepository;
  let mockLogger: ILogger;

  beforeEach(() => {
    mockRepository = {
      getGreeting: vi.fn(),
      save: vi.fn(),
    };

    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
    };

    useCase = new GetGreetingUseCase(mockRepository, mockLogger);
  });

  it("should return greeting from repository", async () => {
    const greeting = Greeting.create("Test Greeting");
    vi.mocked(mockRepository.getGreeting).mockResolvedValue(greeting);

    const result = await useCase.execute();

    expect(result).toEqual({ message: "Test Greeting" });
    expect(mockRepository.getGreeting).toHaveBeenCalledTimes(1);
    expect(mockLogger.debug).toHaveBeenCalled();
    expect(mockLogger.info).toHaveBeenCalled();
  });

  it("should propagate repository errors", async () => {
    const error = new Error("Repository error");
    vi.mocked(mockRepository.getGreeting).mockRejectedValue(error);

    await expect(useCase.execute()).rejects.toThrow("Repository error");
  });
});
```

### Criterios de Aceptación

- ✅ DTOs creados con validación Zod
- ✅ Mappers implementados y testeados
- ✅ Casos de uso implementados
- ✅ Tests de aplicación con mocks
- ✅ Coverage > 85%

### Duración Estimada

4-5 días

---

## Etapa 4: Infraestructura HTTP con Fastify v1

### Objetivos

- Implementar repositorios
- Configurar Winston logger
- Crear controllers para Fastify
- Configurar routes con Fastify
- Error handler para Fastify
- Inyección de dependencias
- Tests de integración

### Tareas

#### 4.1 Winston Logger

**Archivo**: `src/@infrastructure/observability/logger/WinstonLogger.ts`

```typescript
import winston from "winston";
import { ILogger } from "../../../@core/ports/outbound/shared/ILogger";

export class WinstonLogger implements ILogger {
  private logger: winston.Logger;

  constructor(level: string = "info") {
    this.logger = winston.createLogger({
      level,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(({ level, message, timestamp, ...meta }) => {
              return `${timestamp} [${level}]: ${message} ${
                Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ""
              }`;
            })
          ),
        }),
      ],
    });
  }

  info(message: string, meta?: object): void {
    this.logger.info(message, meta);
  }

  error(message: string, error?: Error, meta?: object): void {
    this.logger.error(message, {
      error: error?.message,
      stack: error?.stack,
      ...meta,
    });
  }

  warn(message: string, meta?: object): void {
    this.logger.warn(message, meta);
  }

  debug(message: string, meta?: object): void {
    this.logger.debug(message, meta);
  }
}
```

#### 4.2 Repositorio InMemory

**Archivo**: `src/@infrastructure/persistence/greetings/InMemoryGreetingRepository.ts`

```typescript
import { Greeting } from "../../../@core/domain/greetings/entities/Greeting";
import { IGreetingRepository } from "../../../@core/ports/outbound/greetings/IGreetingRepository";

export class InMemoryGreetingRepository implements IGreetingRepository {
  private greetings: Greeting[] = [];

  async getGreeting(): Promise<Greeting> {
    if (this.greetings.length > 0) {
      return this.greetings[this.greetings.length - 1];
    }
    return Greeting.create("Hello World!");
  }

  async save(greeting: Greeting): Promise<void> {
    this.greetings.push(greeting);
  }
}
```

#### 4.3 Dependency Injection Container

**Archivo**: `src/@infrastructure/config/dependency-injection/container.ts`

```typescript
import { GetGreetingUseCase } from "../../../@application/v1/greetings/use-cases/GetGreetingUseCase";
import { InMemoryGreetingRepository } from "../../persistence/greetings/InMemoryGreetingRepository";
import { GreetingController } from "../../http/v1/greetings/controllers/GreetingController";
import { WinstonLogger } from "../../observability/logger/WinstonLogger";
import { ILogger } from "../../../@core/ports/outbound/shared/ILogger";
import { IGreetingRepository } from "../../../@core/ports/outbound/greetings/IGreetingRepository";
import { env } from "../environment";

class Container {
  private services: Map<string, any> = new Map();
  private singletons: Map<string, any> = new Map();

  registerSingleton<T>(name: string, factory: () => T): void {
    this.services.set(name, { factory, singleton: true });
  }

  register<T>(name: string, factory: () => T): void {
    this.services.set(name, { factory, singleton: false });
  }

  resolve<T>(name: string): T {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service ${name} not registered in container`);
    }

    if (service.singleton) {
      if (!this.singletons.has(name)) {
        this.singletons.set(name, service.factory());
      }
      return this.singletons.get(name);
    }

    return service.factory();
  }
}

export const container = new Container();

// Register services
container.registerSingleton<ILogger>(
  "logger",
  () => new WinstonLogger(env.LOG_LEVEL)
);

container.register<IGreetingRepository>(
  "greetingRepository",
  () => new InMemoryGreetingRepository()
);

container.register(
  "getGreetingUseCase",
  () =>
    new GetGreetingUseCase(
      container.resolve<IGreetingRepository>("greetingRepository"),
      container.resolve<ILogger>("logger")
    )
);

container.register(
  "greetingController",
  () =>
    new GreetingController(
      container.resolve("getGreetingUseCase"),
      container.resolve<ILogger>("logger")
    )
);
```

#### 4.4 Controller para Fastify

**Archivo**: `src/@infrastructure/http/v1/greetings/controllers/GreetingController.ts`

```typescript
import { FastifyRequest, FastifyReply } from "fastify";
import { IGetGreetingUseCase } from "../../../../../@core/ports/inbound/greetings/IGetGreetingUseCase";
import { ILogger } from "../../../../../@core/ports/outbound/shared/ILogger";

export class GreetingController {
  constructor(
    private readonly getGreetingUseCase: IGetGreetingUseCase,
    private readonly logger: ILogger
  ) {}

  async handle(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    this.logger.info("GET /greetings request received", {
      requestId: request.id,
    });

    const result = await this.getGreetingUseCase.execute();

    return reply.status(200).send(result);
  }
}
```

#### 4.5 Routes con Fastify

**Archivo**: `src/@infrastructure/http/v1/greetings/routes/greeting.routes.ts`

```typescript
import { FastifyInstance } from "fastify";
import { container } from "../../../../config/dependency-injection/container";
import { GreetingController } from "../controllers/GreetingController";

export async function greetingRoutes(fastify: FastifyInstance) {
  const controller =
    container.resolve<GreetingController>("greetingController");

  fastify.get("/greetings", {
    schema: {
      description: "Get greeting message",
      tags: ["Greetings"],
      response: {
        200: {
          type: "object",
          properties: {
            message: { type: "string" },
          },
          required: ["message"],
        },
      },
    },
    handler: controller.handle.bind(controller),
  });
}
```

#### 4.6 Plugins y Middlewares

**Archivo**: `src/@infrastructure/http/shared/plugins/cors.ts`

```typescript
import fp from "fastify-plugin";
import cors from "@fastify/cors";

export default fp(async (fastify) => {
  await fastify.register(cors, {
    origin: true,
    credentials: true,
  });
});
```

**Archivo**: `src/@infrastructure/http/shared/plugins/helmet.ts`

```typescript
import fp from "fastify-plugin";
import helmet from "@fastify/helmet";

export default fp(async (fastify) => {
  await fastify.register(helmet, {
    contentSecurityPolicy: false, // Para permitir Swagger UI
  });
});
```

**Archivo**: `src/@infrastructure/http/shared/middlewares/errorHandler.ts`

```typescript
import { FastifyError, FastifyRequest, FastifyReply } from "fastify";
import { DomainException } from "../../../../@core/domain/shared/exceptions/DomainException";
import { ZodError } from "zod";

export async function errorHandler(
  error: FastifyError | Error,
  request: FastifyRequest,
  reply: FastifyReply
) {
  request.log.error(error);

  // Errores de dominio
  if (error instanceof DomainException) {
    return reply.status(error.statusCode).send({
      error: error.name,
      message: error.message,
      code: error.code,
      requestId: request.id,
    });
  }

  // Errores de validación Zod
  if (error instanceof ZodError) {
    return reply.status(400).send({
      error: "ValidationError",
      message: "Request validation failed",
      details: error.errors,
      requestId: request.id,
    });
  }

  // Errores de Fastify
  if ("statusCode" in error) {
    return reply.status(error.statusCode || 500).send({
      error: error.name,
      message: error.message,
      requestId: request.id,
    });
  }

  // Errores no manejados
  return reply.status(500).send({
    error: "InternalServerError",
    message:
      process.env.NODE_ENV === "production"
        ? "An unexpected error occurred"
        : error.message,
    requestId: request.id,
  });
}
```

#### 4.7 Server Actualizado

**Archivo**: `src/@infrastructure/http/server.ts`

```typescript
import Fastify, { FastifyInstance } from "fastify";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { env } from "../config/environment";
import { errorHandler } from "./shared/middlewares/errorHandler";
import corsPlugin from "./shared/plugins/cors";
import helmetPlugin from "./shared/plugins/helmet";
import { greetingRoutes as v1GreetingRoutes } from "./v1/greetings/routes/greeting.routes";

export async function buildServer(): Promise<FastifyInstance> {
  const fastify = Fastify({
    logger: {
      level: env.LOG_LEVEL,
      transport:
        env.NODE_ENV === "development"
          ? {
              target: "pino-pretty",
              options: {
                colorize: true,
                translateTime: "HH:MM:ss Z",
                ignore: "pid,hostname",
              },
            }
          : undefined,
    },
    requestIdLogLabel: "requestId",
    disableRequestLogging: false,
  });

  // Plugins
  await fastify.register(corsPlugin);
  await fastify.register(helmetPlugin);

  // Swagger
  await fastify.register(swagger, {
    openapi: {
      info: {
        title: "Node API Skeleton",
        description:
          "API with Hexagonal + Onion + Screaming Architecture using Fastify",
        version: "1.0.0",
      },
      servers: [
        {
          url: `http://localhost:${env.PORT}`,
          description: "Development",
        },
      ],
      tags: [{ name: "Greetings", description: "Greeting endpoints" }],
    },
  });

  await fastify.register(swaggerUi, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "list",
      deepLinking: false,
    },
    staticCSP: true,
  });

  // Health checks
  fastify.get(
    "/health",
    {
      schema: {
        description: "Health check endpoint",
        tags: ["Health"],
        response: {
          200: {
            type: "object",
            properties: {
              status: { type: "string" },
              timestamp: { type: "string" },
            },
          },
        },
      },
    },
    async () => ({
      status: "ok",
      timestamp: new Date().toISOString(),
    })
  );

  // V1 Routes
  await fastify.register(v1GreetingRoutes, { prefix: "/api/v1" });

  // Error handler (debe ser el último)
  fastify.setErrorHandler(errorHandler);

  return fastify;
}
```

#### 4.8 Tests de Integración con Vitest

**Archivo**: `test/integration/v1/greetings.spec.ts`

```typescript
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { FastifyInstance } from "fastify";
import { buildServer } from "../../../src/@infrastructure/http/server";

describe("GET /api/v1/greetings", () => {
  let server: FastifyInstance;

  beforeAll(async () => {
    server = await buildServer();
    await server.ready();
  });

  afterAll(async () => {
    await server.close();
  });

  it("should return a greeting message", async () => {
    const response = await server.inject({
      method: "GET",
      url: "/api/v1/greetings",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toHaveProperty("message");
    expect(response.json().message).toBe("Hello World!");
  });

  it("should include request id in headers", async () => {
    const response = await server.inject({
      method: "GET",
      url: "/api/v1/greetings",
    });

    expect(response.headers).toHaveProperty("request-id");
  });

  it("should have proper content-type", async () => {
    const response = await server.inject({
      method: "GET",
      url: "/api/v1/greetings",
    });

    expect(response.headers["content-type"]).toContain("application/json");
  });
});
```

### Criterios de Aceptación

- ✅ Winston logger funcionando
- ✅ Repositorio InMemory implementado
- ✅ DI container configurado
- ✅ Controllers de Fastify implementados
- ✅ Routes registradas correctamente
- ✅ Error handler captura excepciones
- ✅ `/api/v1/greetings` funciona end-to-end
- ✅ Swagger docs en `/docs`
- ✅ Tests de integración pasando

### Duración Estimada

5-6 días

---

## Etapa 5: Versionado v2

### Objetivos

- Implementar segunda versión de API
- Carpetas versionadas completas
- Coexistencia de v1 y v2
- Swagger multi-versión

### Tareas

#### 5.1 Configuración de Versiones

**Archivo**: `src/@infrastructure/config/versions.ts`

```typescript
export enum ApiVersion {
  V1 = "v1",
  V2 = "v2",
}

export interface VersionConfig {
  version: ApiVersion;
  basePath: string;
  isDeprecated: boolean;
  deprecationDate?: Date;
  sunsetDate?: Date;
  description: string;
}

export const API_VERSIONS: Record<ApiVersion, VersionConfig> = {
  [ApiVersion.V1]: {
    version: ApiVersion.V1,
    basePath: "/api/v1",
    isDeprecated: false,
    description: "Initial API version",
  },
  [ApiVersion.V2]: {
    version: ApiVersion.V2,
    basePath: "/api/v2",
    isDeprecated: false,
    description: "Second version with enhanced features (includes timestamp)",
  },
};

export const DEFAULT_VERSION = ApiVersion.V1;
export const LATEST_VERSION = ApiVersion.V2;
```

#### 5.2 Aplicación v2 (con timestamp)

**Archivo**: `src/@application/v2/greetings/dtos/GreetingResponseDto.ts`

```typescript
import { z } from "zod";

export const GreetingResponseSchema = z.object({
  message: z.string().min(1),
  timestamp: z.string().datetime(),
  version: z.string(),
});

export type GreetingResponseDto = z.infer<typeof GreetingResponseSchema>;
```

**Archivo**: `src/@application/v2/greetings/mappers/GreetingMapper.ts`

```typescript
import { Greeting } from "../../../../@core/domain/greetings/entities/Greeting";
import { GreetingResponseDto } from "../dtos/GreetingResponseDto";

// Mappers como funciones puras
export const greetingToDto = (entity: Greeting): GreetingResponseDto => ({
  message: entity.message,
  timestamp: new Date().toISOString(),
  version: "2.0",
});

export const greetingsToDto = (entities: Greeting[]): GreetingResponseDto[] =>
  entities.map(greetingToDto);
```

**Archivo**: `src/@application/v2/greetings/use-cases/GetGreetingUseCase.ts`

```typescript
// Similar a v1 pero usando el mapper de v2
import { IGetGreetingUseCase } from "../../../../@core/ports/inbound/greetings/IGetGreetingUseCase";
import { IGreetingRepository } from "../../../../@core/ports/outbound/greetings/IGreetingRepository";
import { ILogger } from "../../../../@core/ports/outbound/shared/ILogger";
import { GreetingResponseDto } from "../dtos/GreetingResponseDto";
import { greetingToDto } from "../mappers/GreetingMapper";

export class GetGreetingUseCase implements IGetGreetingUseCase {
  constructor(
    private readonly repository: IGreetingRepository,
    private readonly logger: ILogger
  ) {}

  async execute(): Promise<GreetingResponseDto> {
    this.logger.debug("GetGreetingUseCase V2: Fetching greeting");
    const greeting = await this.repository.getGreeting();
    this.logger.info("GetGreetingUseCase V2: Greeting fetched successfully");
    // Uso de función pura
    return greetingToDto(greeting);
  }
}
```

#### 5.3 Infraestructura v2

Replicar estructura de v1 pero en `src/@infrastructure/http/v2/greetings/`

#### 5.4 Actualizar DI Container para v2

Agregar resolvers para servicios v2

#### 5.5 Actualizar Server con ambas versiones

```typescript
// En server.ts
await fastify.register(v1GreetingRoutes, { prefix: "/api/v1" });
await fastify.register(v2GreetingRoutes, { prefix: "/api/v2" });
```

#### 5.6 Tests de compatibilidad

**Archivo**: `test/integration/version-compatibility.spec.ts`

```typescript
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { FastifyInstance } from "fastify";
import { buildServer } from "../../src/@infrastructure/http/server";

describe("Version Compatibility", () => {
  let server: FastifyInstance;

  beforeAll(async () => {
    server = await buildServer();
  });

  afterAll(async () => {
    await server.close();
  });

  it("v1 should return only message", async () => {
    const response = await server.inject({
      method: "GET",
      url: "/api/v1/greetings",
    });

    const body = response.json();
    expect(response.statusCode).toBe(200);
    expect(body).toHaveProperty("message");
    expect(body).not.toHaveProperty("timestamp");
    expect(body).not.toHaveProperty("version");
  });

  it("v2 should return message, timestamp and version", async () => {
    const response = await server.inject({
      method: "GET",
      url: "/api/v2/greetings",
    });

    const body = response.json();
    expect(response.statusCode).toBe(200);
    expect(body).toHaveProperty("message");
    expect(body).toHaveProperty("timestamp");
    expect(body).toHaveProperty("version", "2.0");
  });

  it("both versions should work simultaneously", async () => {
    const [v1Response, v2Response] = await Promise.all([
      server.inject({ method: "GET", url: "/api/v1/greetings" }),
      server.inject({ method: "GET", url: "/api/v2/greetings" }),
    ]);

    expect(v1Response.statusCode).toBe(200);
    expect(v2Response.statusCode).toBe(200);
  });
});
```

### Criterios de Aceptación

- ✅ `/api/v1/greetings` y `/api/v2/greetings` funcionan
- ✅ Respuestas diferentes según versión
- ✅ Tests de compatibilidad pasando
- ✅ Ambas versiones en Swagger

### Duración Estimada

3-4 días

---

## Etapa 6: Observabilidad (Winston + Prometheus)

### Objetivos

- Configurar Winston completo
- Implementar métricas Prometheus
- Health checks avanzados
- Request ID tracking

### Tareas

#### 6.1 Winston Configuración Avanzada

Ya implementado en etapa 4, verificar funcionamiento

#### 6.2 Métricas Prometheus

**Archivo**: `src/@infrastructure/observability/metrics/PrometheusMetrics.ts`

```typescript
import { Registry, Counter, Histogram, Gauge } from "prom-client";

class PrometheusMetrics {
  public readonly register: Registry;
  public readonly httpRequestDuration: Histogram;
  public readonly httpRequestTotal: Counter;
  public readonly httpRequestsInProgress: Gauge;

  constructor() {
    this.register = new Registry();

    this.httpRequestDuration = new Histogram({
      name: "http_request_duration_seconds",
      help: "Duration of HTTP requests in seconds",
      labelNames: ["method", "route", "status_code", "version"],
      registers: [this.register],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
    });

    this.httpRequestTotal = new Counter({
      name: "http_requests_total",
      help: "Total number of HTTP requests",
      labelNames: ["method", "route", "status_code", "version"],
      registers: [this.register],
    });

    this.httpRequestsInProgress = new Gauge({
      name: "http_requests_in_progress",
      help: "Number of HTTP requests currently in progress",
      labelNames: ["method", "route"],
      registers: [this.register],
    });
  }
}

export const metrics = new PrometheusMetrics();
```

**Archivo**: `src/@infrastructure/http/shared/hooks/onRequest.ts`

```typescript
import { FastifyRequest } from "fastify";
import { metrics } from "../../../observability/metrics/PrometheusMetrics";

export function onRequestHook(
  request: FastifyRequest,
  _reply: any,
  done: () => void
) {
  const route = request.routeOptions.url || "unknown";
  metrics.httpRequestsInProgress.inc({ method: request.method, route });
  done();
}
```

**Archivo**: `src/@infrastructure/http/shared/hooks/onResponse.ts`

```typescript
import { FastifyRequest, FastifyReply } from "fastify";
import { metrics } from "../../../observability/metrics/PrometheusMetrics";

export function onResponseHook(
  request: FastifyRequest,
  reply: FastifyReply,
  done: () => void
) {
  const route = request.routeOptions.url || "unknown";
  const version = route.split("/")[2] || "unknown"; // /api/v1/... -> v1
  const duration = reply.elapsedTime / 1000; // ms to seconds

  metrics.httpRequestDuration.observe(
    {
      method: request.method,
      route,
      status_code: reply.statusCode,
      version,
    },
    duration
  );

  metrics.httpRequestTotal.inc({
    method: request.method,
    route,
    status_code: reply.statusCode,
    version,
  });

  metrics.httpRequestsInProgress.dec({ method: request.method, route });

  done();
}
```

Actualizar server.ts para registrar hooks:

```typescript
fastify.addHook("onRequest", onRequestHook);
fastify.addHook("onResponse", onResponseHook);

// Endpoint de métricas
fastify.get("/metrics", async () => {
  return metrics.register.metrics();
});
```

#### 6.3 Health Checks Avanzados

**Archivo**: `src/@infrastructure/http/shared/health/HealthController.ts`

```typescript
import { FastifyRequest, FastifyReply } from "fastify";

interface HealthCheck {
  name: string;
  status: "healthy" | "unhealthy";
  responseTime: number;
  message?: string;
}

export class HealthController {
  async liveness(_request: FastifyRequest, reply: FastifyReply) {
    return reply.status(200).send({
      status: "alive",
      timestamp: new Date().toISOString(),
    });
  }

  async readiness(_request: FastifyRequest, reply: FastifyReply) {
    const checks: HealthCheck[] = [];
    const startTime = Date.now();

    // Check 1: Memory usage
    const memUsage = process.memoryUsage();
    const memCheck: HealthCheck = {
      name: "memory",
      status:
        memUsage.heapUsed < memUsage.heapTotal * 0.9 ? "healthy" : "unhealthy",
      responseTime: Date.now() - startTime,
      message: `Heap used: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
    };
    checks.push(memCheck);

    // Agregar más checks según necesidad (DB, Redis, etc.)

    const allHealthy = checks.every((c) => c.status === "healthy");
    const statusCode = allHealthy ? 200 : 503;

    return reply.status(statusCode).send({
      status: allHealthy ? "ready" : "not ready",
      checks,
      timestamp: new Date().toISOString(),
    });
  }
}
```

Actualizar server.ts:

```typescript
const healthController = new HealthController();

fastify.get("/health/live", healthController.liveness.bind(healthController));
fastify.get("/health/ready", healthController.readiness.bind(healthController));
```

### Criterios de Aceptación

- ✅ Winston logging completo
- ✅ Métricas en `/metrics`
- ✅ Health checks en `/health/live` y `/health/ready`
- ✅ Request tracking funcionando

### Duración Estimada

4-5 días

---

## Etapa 7: Mejoras Opcionales

### Objetivos

Implementar según prioridad y tiempo disponible:

### Opciones

#### 7.1 Rate Limiting

- Plugin `@fastify/rate-limit`
- Configuración por endpoint
- Tests

#### 7.2 Autenticación JWT

- Plugin `@fastify/jwt`
- Decorators para rutas protegidas
- Tests

#### 7.3 Base de Datos (Prisma)

- Setup Prisma
- Migraciones
- `PrismaGreetingRepository`

#### 7.4 Tests de Performance con k6

**Archivo**: `test/performance/greetings.k6.js`

```javascript
import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "30s", target: 50 },
    { duration: "1m", target: 100 },
    { duration: "30s", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<500"],
    http_req_failed: ["rate<0.01"],
  },
};

export default function () {
  const res = http.get("http://localhost:3000/api/v1/greetings");

  check(res, {
    "status is 200": (r) => r.status === 200,
    "has message": (r) => r.json("message") !== undefined,
  });

  sleep(0.5);
}
```

```json
// package.json
{
  "scripts": {
    "test:performance": "k6 run test/performance/greetings.k6.js"
  }
}
```

#### 7.5 Docker Compose

**Archivo**: `docker-compose.yml`

```yaml
version: "3.8"

services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - PORT=3000
      - LOG_LEVEL=debug
    volumes:
      - ./src:/app/src
      - ./test:/app/test
    command: npm run dev

  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
```

### Criterios de Aceptación

- ✅ Features implementadas según prioridad
- ✅ Tests pasando
- ✅ Documentación actualizada

### Duración Estimada

5-10 días (según scope)

---

## Etapa 8: Cleanup y Documentación

### Objetivos

- Eliminar código legacy
- Actualizar documentación
- Preparar para release

### Tareas

#### 8.1 Cleanup

```bash
# Eliminar archivos viejos de Express
rm -rf src/routes src/controllers src/services src/models
rm -f src/app.ts src/server.ts src/config.ts

# Eliminar tests viejos de Jest (si ya migraste todos)
rm -f jest.config.ts
rm -rf test/__mocks__

# Desinstalar dependencias viejas
npm uninstall jest ts-jest @types/jest express @types/express morgan @types/morgan
npm uninstall ts-node-dev  # Ya usamos SWC
```

#### 8.2 Actualizar CLAUDE.md

Actualizar con:

- Nueva estructura de carpetas
- Cómo agregar nuevos features
- Cómo agregar nueva versión de API
- Patrones de DI
- Comandos de testing

#### 8.3 Actualizar README.md

- Stack tecnológico actualizado
- Comandos actualizados
- Arquitectura explicada

#### 8.4 Crear ARCHITECTURE.md

Documento detallado de decisiones arquitectónicas

#### 8.5 Scripts Finales

```json
{
  "scripts": {
    "dev": "nodemon --exec node --loader @swc-node/register/esm src/main.ts",
    "build": "swc src -d dist --copy-files",
    "start": "node dist/main.js",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui",
    "test:integration": "vitest run --config vitest.integration.config.ts",
    "test:performance": "k6 run test/performance/greetings.k6.js",
    "lint": "eslint . --ext .ts",
    "lint:fix": "npm run lint -- --fix"
  }
}
```

#### 8.6 CI/CD Actualizado

Actualizar GitHub Actions para usar Vitest en lugar de Jest

### Criterios de Aceptación

- ✅ Sin código legacy
- ✅ Documentación completa
- ✅ CI/CD pasando
- ✅ Coverage > 80%
- ✅ Build exitoso con SWC

### Duración Estimada

2-3 días

---

## Estrategia de Testing Durante Migración

### Tests en Paralelo

- Mantener tests de Jest funcionando
- Agregar nuevos tests con Vitest
- Al final migrar todos a Vitest

### Comandos Temporales

```json
{
  "scripts": {
    "test:old": "jest",
    "test:new": "vitest run",
    "test:all": "npm run test:old && npm run test:new"
  }
}
```

---

## Métricas de Éxito

### Técnicas

- ✅ Coverage ≥ 80%
- ✅ Build time con SWC < 5s (vs ~30s con tsc)
- ✅ Test run time con Vitest < 50% del tiempo de Jest
- ✅ Dominio 100% sin dependencias externas
- ✅ 0 errores de linter

### Funcionales

- ✅ v1 y v2 funcionando simultáneamente
- ✅ Fastify respondiendo correctamente
- ✅ Métricas exportándose
- ✅ Logs estructurados funcionando

### Arquitectura

- ✅ Screaming Architecture implementada
- ✅ 100% de casos de uso testables sin Fastify
- ✅ Inyección de dependencias completa
- ✅ Error handling robusto

---

## Checklist de Inicio

- [ ] Leer documentos en `specs/`
- [ ] Aprobar plan con stakeholders
- [ ] Asignar recursos
- [ ] Crear rama de trabajo
- [ ] Ejecutar baseline de tests
- [ ] Instalar dependencias nuevas
- [ ] Configurar SWC y Vitest

---

## Próximos Pasos Inmediatos

1. **Revisar plan** completo
2. **Aprobar** tecnologías y estimaciones
3. **Priorizar** mejoras opcionales (Etapa 7)
4. **Iniciar Etapa 0** inmediatamente
5. **Establecer** check-ins semanales

---

**Última actualización**: 2025-12-23
**Versión**: 2.0 (Fastify + SWC + Vitest + Screaming)
**Estado**: Listo para ejecución
