# 01 - Arquitectura: Hexagonal + Onion + Screaming

## Fecha de Creación
2025-12-23

## Última Actualización
2025-12-23 - Integración de Fastify, Screaming Architecture y Onion Architecture

## Objetivo
Migrar el proyecto a una arquitectura que combine:
- **Hexagonal (Ports & Adapters)**: Separación clara entre dominio e infraestructura
- **Onion Architecture**: Dependencias apuntando hacia el centro (dominio)
- **Screaming Architecture**: Estructura que grita el propósito del negocio, no la tecnología

## Stack Tecnológico

### Framework y Runtime
- **Framework HTTP**: Fastify (migración desde Express)
- **Compilador**: SWC (reemplazo de TSC para mayor velocidad)
- **Runtime**: Node.js 18+

### Testing
- **Tests Unitarios**: Vitest (reemplazo de Jest)
- **Tests Integración/E2E**: Supertest + Vitest
- **Tests Performance**: k6

### Validación y Observabilidad
- **Validación**: Zod
- **Logger**: Winston
- **Métricas**: prom-client (Prometheus)

## Fundamentos de la Arquitectura

### Principios Combinados

#### 1. Hexagonal Architecture (Ports & Adapters)
- **Puertos**: Interfaces que definen contratos
- **Adaptadores**: Implementaciones concretas de infraestructura
- **Core**: Lógica de negocio pura sin dependencias externas

#### 2. Onion Architecture
- **Dependencias hacia adentro**: Las capas externas dependen de las internas, nunca al revés
- **Dominio en el centro**: El núcleo del negocio es completamente independiente
- **Capas concéntricas**: Domain → Application → Infrastructure

#### 3. Screaming Architecture
- **Nombres que gritan el negocio**: Las carpetas reflejan WHAT, no HOW
- **Organización por features**: No por capas técnicas
- **Claridad de propósito**: Un desarrollador nuevo entiende qué hace el sistema mirando la estructura

### Diagrama de Capas (Onion)

```
┌─────────────────────────────────────────────────────────┐
│                  INFRASTRUCTURE                          │
│  (Fastify, Database, External APIs, Winston)            │
│  ┌───────────────────────────────────────────────────┐  │
│  │              APPLICATION LAYER                     │  │
│  │   (Use Cases, DTOs, Mappers, Validators)          │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │          DOMAIN LAYER (CORE)                │  │  │
│  │  │                                             │  │  │
│  │  │   ┌─────────────┐  ┌──────────────┐       │  │  │
│  │  │   │  Entities   │  │ Value Objects│       │  │  │
│  │  │   └─────────────┘  └──────────────┘       │  │  │
│  │  │                                             │  │  │
│  │  │   ┌─────────────────────────────┐         │  │  │
│  │  │   │   Domain Services            │         │  │  │
│  │  │   │   Business Rules             │         │  │  │
│  │  │   └─────────────────────────────┘         │  │  │
│  │  │                                             │  │  │
│  │  │   ┌─────────────────────────────┐         │  │  │
│  │  │   │   Domain Exceptions          │         │  │  │
│  │  │   └─────────────────────────────┘         │  │  │
│  │  │                                             │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  │                                                     │  │
│  └───────────────────────────────────────────────────┘  │
│                                                           │
└─────────────────────────────────────────────────────────┘

Regla de Dependencia: → solo hacia adentro ←
Infrastructure → Application → Domain
```

## Nueva Estructura de Carpetas (Screaming Architecture)

### Propuesta: Organización por Features

```
src/
├── @core/                              # DOMINIO (independiente)
│   ├── domain/
│   │   ├── greetings/                  # Feature: Saludos
│   │   │   ├── entities/
│   │   │   │   └── Greeting.ts
│   │   │   ├── value-objects/
│   │   │   │   └── Message.ts
│   │   │   ├── services/
│   │   │   │   └── GreetingDomainService.ts
│   │   │   └── exceptions/
│   │   │       └── InvalidGreetingException.ts
│   │   │
│   │   └── shared/                     # Compartido entre features
│   │       ├── exceptions/
│   │       │   └── DomainException.ts
│   │       └── value-objects/
│   │           └── EntityId.ts
│   │
│   └── ports/                          # Contratos (interfaces)
│       ├── inbound/                    # Lo que el dominio expone
│       │   └── greetings/
│       │       └── IGetGreetingUseCase.ts
│       └── outbound/                   # Lo que el dominio necesita
│           ├── greetings/
│           │   └── IGreetingRepository.ts
│           └── shared/
│               └── ILogger.ts
│
├── @application/                       # CASOS DE USO
│   ├── v1/                             # Versión 1 de la API
│   │   ├── greetings/                  # Feature: Greetings
│   │   │   ├── use-cases/
│   │   │   │   └── GetGreetingUseCase.ts
│   │   │   ├── dtos/
│   │   │   │   ├── GreetingRequestDto.ts
│   │   │   │   └── GreetingResponseDto.ts
│   │   │   ├── mappers/
│   │   │   │   └── GreetingMapper.ts
│   │   │   └── validators/
│   │   │       └── GreetingValidator.ts
│   │   │
│   │   └── shared/                     # Compartido en v1
│   │       ├── dtos/
│   │       │   └── PaginationDto.ts
│   │       └── mappers/
│   │           └── BaseMapper.ts
│   │
│   ├── v2/                             # Versión 2 de la API
│   │   └── greetings/
│   │       └── ...                     # Similar a v1 pero con cambios
│   │
│   └── shared/                         # Compartido entre versiones
│       └── interfaces/
│           └── IUseCase.ts
│
├── @infrastructure/                    # DETALLES TÉCNICOS
│   ├── http/                           # Adaptador HTTP (Fastify)
│   │   ├── v1/
│   │   │   └── greetings/
│   │   │       ├── controllers/
│   │   │       │   └── GreetingController.ts
│   │   │       └── routes/
│   │   │           └── greeting.routes.ts
│   │   │
│   │   ├── v2/
│   │   │   └── greetings/
│   │   │       └── ...
│   │   │
│   │   ├── shared/
│   │   │   ├── plugins/                # Plugins de Fastify
│   │   │   │   ├── cors.ts
│   │   │   │   ├── helmet.ts
│   │   │   │   ├── swagger.ts
│   │   │   │   └── metrics.ts
│   │   │   ├── middlewares/
│   │   │   │   ├── errorHandler.ts
│   │   │   │   ├── requestId.ts
│   │   │   │   └── validation.ts
│   │   │   └── hooks/                  # Fastify hooks
│   │   │       ├── onRequest.ts
│   │   │       └── onResponse.ts
│   │   │
│   │   └── server.ts                   # Fastify app setup
│   │
│   ├── persistence/                    # Adaptadores de persistencia
│   │   └── greetings/
│   │       ├── InMemoryGreetingRepository.ts
│   │       └── PrismaGreetingRepository.ts
│   │
│   ├── external-services/              # APIs externas
│   │   └── ...
│   │
│   ├── observability/                  # Logging, métricas
│   │   ├── logger/
│   │   │   └── WinstonLogger.ts
│   │   └── metrics/
│   │       └── PrometheusMetrics.ts
│   │
│   └── config/                         # Configuración
│       ├── environment.ts
│       ├── versions.ts
│       └── dependency-injection/
│           ├── container.ts
│           ├── v1.module.ts
│           └── v2.module.ts
│
├── @shared/                            # Compartido globalmente
│   ├── types/
│   │   ├── Result.ts
│   │   └── Either.ts
│   ├── utils/
│   │   └── string-utils.ts
│   └── constants/
│       └── status-codes.ts
│
└── main.ts                             # Entry point
```

### Filosofía de Nombres

**❌ MAL** (nombres técnicos):
```
src/
  controllers/
  services/
  repositories/
```

**✅ BIEN** (nombres de negocio):
```
src/
  @core/domain/greetings/
  @core/domain/users/
  @core/domain/products/
```

Al ver la estructura, inmediatamente sabes que el sistema maneja: greetings, users, products.

## Migración de Express a Fastify

### ¿Por qué Fastify?

| Característica | Express | Fastify |
|---------------|---------|---------|
| **Performance** | Baseline | ~2-3x más rápido |
| **TypeScript** | Requiere @types | First-class support |
| **Validación** | Manual/middleware | Built-in JSON Schema |
| **Serialización** | JSON.stringify | Optimizada automáticamente |
| **Async/Await** | Requiere wrapping | Nativo |
| **Plugins** | Middleware | Sistema de plugins |
| **Hooks** | No | Sí (lifecycle hooks) |

### Comparación de Código

#### Express (antes)
```typescript
import express from 'express';
const app = express();

app.use(express.json());
app.use(cors());

app.get('/hello', async (req, res) => {
  try {
    const result = await service.execute();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

#### Fastify (después)
```typescript
import Fastify from 'fastify';
const fastify = Fastify({ logger: true });

await fastify.register(import('@fastify/cors'));

fastify.get('/hello', async (request, reply) => {
  const result = await service.execute();
  return result; // Auto-serializa y retorna 200
});

// Errores manejados automáticamente por error handler
```

## Plan de Migración

### Fase 1: Configuración del Core (Dominio)

#### 1.1 Crear Entidad de Dominio
**Archivo**: `src/@core/domain/greetings/entities/Greeting.ts`
```typescript
import { Message } from '../value-objects/Message';
import { InvalidGreetingException } from '../exceptions/InvalidGreetingException';

export class Greeting {
  private constructor(
    private readonly _message: Message,
    private readonly _createdAt: Date
  ) {}

  static create(text: string): Greeting {
    const message = Message.create(text);
    return new Greeting(message, new Date());
  }

  get message(): string {
    return this._message.value;
  }

  get createdAt(): Date {
    return this._createdAt;
  }
}
```

#### 1.2 Value Objects
**Archivo**: `src/@core/domain/greetings/value-objects/Message.ts`
```typescript
import { InvalidGreetingException } from '../exceptions/InvalidGreetingException';

export class Message {
  private constructor(private readonly _value: string) {
    this.validate();
  }

  static create(value: string): Message {
    return new Message(value);
  }

  private validate(): void {
    if (!this._value || this._value.trim().length === 0) {
      throw new InvalidGreetingException('Message cannot be empty');
    }
    if (this._value.length > 200) {
      throw new InvalidGreetingException('Message too long (max 200 characters)');
    }
  }

  get value(): string {
    return this._value;
  }
}
```

#### 1.3 Excepciones de Dominio
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
import { DomainException } from '../../shared/exceptions/DomainException';

export class InvalidGreetingException extends DomainException {
  constructor(message: string) {
    super(message, 'INVALID_GREETING', 400);
  }
}
```

#### 1.4 Puertos (Interfaces)
**Archivo**: `src/@core/ports/inbound/greetings/IGetGreetingUseCase.ts`
```typescript
import { GreetingResponseDto } from '../../../../@application/v1/greetings/dtos/GreetingResponseDto';

export interface IGetGreetingUseCase {
  execute(): Promise<GreetingResponseDto>;
}
```

**Archivo**: `src/@core/ports/outbound/greetings/IGreetingRepository.ts`
```typescript
import { Greeting } from '../../../domain/greetings/entities/Greeting';

export interface IGreetingRepository {
  getGreeting(): Promise<Greeting>;
  save(greeting: Greeting): Promise<void>;
}
```

### Fase 2: Capa de Aplicación

#### 2.1 DTOs con Zod
**Archivo**: `src/@application/v1/greetings/dtos/GreetingResponseDto.ts`
```typescript
import { z } from 'zod';

export const GreetingResponseSchema = z.object({
  message: z.string(),
  timestamp: z.date().optional()
});

export type GreetingResponseDto = z.infer<typeof GreetingResponseSchema>;
```

#### 2.2 Mappers (Funciones Puras)
**Archivo**: `src/@application/v1/greetings/mappers/GreetingMapper.ts`
```typescript
import { Greeting } from '../../../../@core/domain/greetings/entities/Greeting';
import { GreetingResponseDto } from '../dtos/GreetingResponseDto';

// Mappers como funciones puras (no clases)
export const greetingToDto = (entity: Greeting): GreetingResponseDto => ({
  message: entity.message
});

export const greetingToDomain = (message: string): Greeting =>
  Greeting.create(message);

// Composición: mapear arrays
export const greetingsToDto = (entities: Greeting[]): GreetingResponseDto[] =>
  entities.map(greetingToDto);
```

#### 2.3 Use Cases (Clases con DI)
**Archivo**: `src/@application/v1/greetings/use-cases/GetGreetingUseCase.ts`
```typescript
import { IGetGreetingUseCase } from '../../../../@core/ports/inbound/greetings/IGetGreetingUseCase';
import { IGreetingRepository } from '../../../../@core/ports/outbound/greetings/IGreetingRepository';
import { GreetingResponseDto } from '../dtos/GreetingResponseDto';
import { greetingToDto } from '../mappers/GreetingMapper';

export class GetGreetingUseCase implements IGetGreetingUseCase {
  constructor(private readonly repository: IGreetingRepository) {}

  async execute(): Promise<GreetingResponseDto> {
    const greeting = await this.repository.getGreeting();
    // Uso de función pura para mapear
    return greetingToDto(greeting);
  }
}
```

### Fase 3: Infraestructura con Fastify

#### 3.1 Repositorio
**Archivo**: `src/@infrastructure/persistence/greetings/InMemoryGreetingRepository.ts`
```typescript
import { Greeting } from '../../../@core/domain/greetings/entities/Greeting';
import { IGreetingRepository } from '../../../@core/ports/outbound/greetings/IGreetingRepository';

export class InMemoryGreetingRepository implements IGreetingRepository {
  private greetings: Map<string, Greeting> = new Map();

  async getGreeting(): Promise<Greeting> {
    return Greeting.create('Hello World!');
  }

  async save(greeting: Greeting): Promise<void> {
    this.greetings.set(greeting.message, greeting);
  }
}
```

#### 3.2 Logger con Winston
**Archivo**: `src/@infrastructure/observability/logger/WinstonLogger.ts`
```typescript
import winston from 'winston';
import { ILogger } from '../../../@core/ports/outbound/shared/ILogger';

export class WinstonLogger implements ILogger {
  private logger: winston.Logger;

  constructor(level: string = 'info') {
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
            winston.format.simple()
          )
        })
      ]
    });
  }

  info(message: string, meta?: object): void {
    this.logger.info(message, meta);
  }

  error(message: string, error?: Error, meta?: object): void {
    this.logger.error(message, { error: error?.message, stack: error?.stack, ...meta });
  }

  warn(message: string, meta?: object): void {
    this.logger.warn(message, meta);
  }

  debug(message: string, meta?: object): void {
    this.logger.debug(message, meta);
  }
}
```

#### 3.3 Controller con Fastify
**Archivo**: `src/@infrastructure/http/v1/greetings/controllers/GreetingController.ts`
```typescript
import { FastifyRequest, FastifyReply } from 'fastify';
import { IGetGreetingUseCase } from '../../../../../@core/ports/inbound/greetings/IGetGreetingUseCase';
import { ILogger } from '../../../../../@core/ports/outbound/shared/ILogger';

export class GreetingController {
  constructor(
    private readonly getGreetingUseCase: IGetGreetingUseCase,
    private readonly logger: ILogger
  ) {}

  async handle(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    this.logger.info('GET /greetings request received', {
      requestId: request.id
    });

    const result = await this.getGreetingUseCase.execute();

    // Fastify serializa automáticamente
    return reply.status(200).send(result);
  }
}
```

#### 3.4 Routes con Fastify
**Archivo**: `src/@infrastructure/http/v1/greetings/routes/greeting.routes.ts`
```typescript
import { FastifyInstance } from 'fastify';
import { GreetingController } from '../controllers/GreetingController';
import { container } from '../../../../config/dependency-injection/container';

export async function greetingRoutes(fastify: FastifyInstance) {
  const controller = container.resolve<GreetingController>('greetingController');

  fastify.get('/greetings', {
    schema: {
      tags: ['Greetings'],
      summary: 'Get greeting message',
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' }
          }
        }
      }
    },
    handler: controller.handle.bind(controller)
  });
}
```

#### 3.5 Fastify Server Setup
**Archivo**: `src/@infrastructure/http/server.ts`
```typescript
import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { errorHandler } from './shared/middlewares/errorHandler';
import { requestIdPlugin } from './shared/plugins/requestId';
import { greetingRoutes as v1GreetingRoutes } from './v1/greetings/routes/greeting.routes';
import { greetingRoutes as v2GreetingRoutes } from './v2/greetings/routes/greeting.routes';

export async function buildServer(): Promise<FastifyInstance> {
  const fastify = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info'
    },
    requestIdLogLabel: 'requestId',
    disableRequestLogging: false
  });

  // Plugins globales
  await fastify.register(cors, {
    origin: true
  });

  await fastify.register(helmet, {
    contentSecurityPolicy: false // Para Swagger UI
  });

  await fastify.register(requestIdPlugin);

  // Swagger
  await fastify.register(swagger, {
    openapi: {
      info: {
        title: 'Node API Skeleton',
        description: 'API with Hexagonal + Onion + Screaming Architecture',
        version: '1.0.0'
      },
      servers: [
        { url: 'http://localhost:3000', description: 'Development' }
      ]
    }
  });

  await fastify.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false
    }
  });

  // Health checks
  fastify.get('/health', async (request, reply) => {
    return { status: 'ok', timestamp: new Date() };
  });

  // V1 Routes
  await fastify.register(v1GreetingRoutes, { prefix: '/api/v1' });

  // V2 Routes
  await fastify.register(v2GreetingRoutes, { prefix: '/api/v2' });

  // Error handler
  fastify.setErrorHandler(errorHandler);

  return fastify;
}
```

#### 3.6 Error Handler para Fastify
**Archivo**: `src/@infrastructure/http/shared/middlewares/errorHandler.ts`
```typescript
import { FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { DomainException } from '../../../../@core/domain/shared/exceptions/DomainException';
import { ZodError } from 'zod';

export async function errorHandler(
  error: FastifyError | Error,
  request: FastifyRequest,
  reply: FastifyReply
) {
  // Errores de dominio
  if (error instanceof DomainException) {
    return reply.status(error.statusCode).send({
      error: error.name,
      message: error.message,
      code: error.code,
      requestId: request.id
    });
  }

  // Errores de validación Zod
  if (error instanceof ZodError) {
    return reply.status(400).send({
      error: 'ValidationError',
      message: 'Request validation failed',
      details: error.errors,
      requestId: request.id
    });
  }

  // Errores de Fastify
  if ('statusCode' in error) {
    return reply.status(error.statusCode || 500).send({
      error: error.name,
      message: error.message,
      requestId: request.id
    });
  }

  // Errores no manejados
  request.log.error(error);
  return reply.status(500).send({
    error: 'InternalServerError',
    message: 'An unexpected error occurred',
    requestId: request.id
  });
}
```

#### 3.7 Inyección de Dependencias
**Archivo**: `src/@infrastructure/config/dependency-injection/container.ts`
```typescript
import { GetGreetingUseCase } from '../../../@application/v1/greetings/use-cases/GetGreetingUseCase';
import { InMemoryGreetingRepository } from '../../persistence/greetings/InMemoryGreetingRepository';
import { GreetingController } from '../../http/v1/greetings/controllers/GreetingController';
import { WinstonLogger } from '../../observability/logger/WinstonLogger';
import { ILogger } from '../../../@core/ports/outbound/shared/ILogger';
import { IGreetingRepository } from '../../../@core/ports/outbound/greetings/IGreetingRepository';

class Container {
  private services: Map<string, any> = new Map();

  register<T>(name: string, factory: () => T): void {
    this.services.set(name, factory);
  }

  resolve<T>(name: string): T {
    const factory = this.services.get(name);
    if (!factory) {
      throw new Error(`Service ${name} not registered`);
    }
    return factory();
  }
}

export const container = new Container();

// Registrar servicios
container.register<ILogger>('logger', () => new WinstonLogger(process.env.LOG_LEVEL));

container.register<IGreetingRepository>('greetingRepository', () =>
  new InMemoryGreetingRepository()
);

container.register('getGreetingUseCase', () =>
  new GetGreetingUseCase(container.resolve<IGreetingRepository>('greetingRepository'))
);

container.register('greetingController', () =>
  new GreetingController(
    container.resolve('getGreetingUseCase'),
    container.resolve<ILogger>('logger')
  )
);
```

#### 3.8 Main Entry Point
**Archivo**: `src/main.ts`
```typescript
import { buildServer } from './@infrastructure/http/server';
import { env } from './@infrastructure/config/environment';

async function bootstrap() {
  try {
    const server = await buildServer();

    await server.listen({
      port: Number(env.PORT),
      host: '0.0.0.0'
    });

    console.log(`🚀 Server ready at http://localhost:${env.PORT}`);
    console.log(`📚 Docs at http://localhost:${env.PORT}/docs`);
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

bootstrap();
```

## Configuración de SWC

### ¿Por qué SWC?
- **20x más rápido** que TSC para compilación
- **Compatible** con TypeScript
- **Soporte** para decorators, JSX, etc.
- **Usado por**: Next.js, Vite, etc.

### Configuración
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
      "decoratorMetadata": true
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

**package.json scripts**:
```json
{
  "scripts": {
    "dev": "nodemon --exec node --loader @swc-node/register/esm src/main.ts",
    "build": "swc src -d dist --copy-files",
    "start": "node dist/main.js"
  }
}
```

## Configuración de Vitest

### ¿Por qué Vitest?
- **Más rápido** que Jest (usa Vite)
- **API compatible** con Jest
- **Better DX** con watch mode instantáneo
- **ESM native**
- **TypeScript first-class**

### Configuración
**Archivo**: `vitest.config.ts`
```typescript
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        'src/main.ts',
        'src/@infrastructure/config/',
        '**/*.spec.ts',
        '**/*.test.ts'
      ],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80
      }
    },
    include: ['test/**/*.spec.ts'],
    exclude: ['node_modules', 'dist']
  },
  resolve: {
    alias: {
      '@core': path.resolve(__dirname, './src/@core'),
      '@application': path.resolve(__dirname, './src/@application'),
      '@infrastructure': path.resolve(__dirname, './src/@infrastructure'),
      '@shared': path.resolve(__dirname, './src/@shared')
    }
  }
});
```

## Beneficios de la Arquitectura Combinada

### 1. Hexagonal: Testabilidad
```typescript
// Test del dominio SIN infraestructura
describe('Greeting Entity', () => {
  it('should create a valid greeting', () => {
    const greeting = Greeting.create('Hello');
    expect(greeting.message).toBe('Hello');
  });

  it('should throw error for empty message', () => {
    expect(() => Greeting.create('')).toThrow(InvalidGreetingException);
  });
});
```

### 2. Onion: Independencia
- Dominio NO conoce Fastify, Winston, ni ninguna infraestructura
- Puedes cambiar de Fastify a Express sin tocar el dominio
- Database, Logger, HTTP son detalles intercambiables

### 3. Screaming: Claridad
Al ver `src/@core/domain/greetings/`, inmediatamente sabes:
- El sistema maneja "greetings"
- Puedes encontrar todo relacionado a greetings en un lugar
- No necesitas buscar en controllers/, services/, etc.

## Próximos Pasos

1. Revisar y aprobar esta propuesta arquitectónica
2. Configurar Fastify y SWC
3. Crear estructura de carpetas
4. Migrar endpoint de ejemplo
5. Configurar Vitest
6. Documentar patrones y decisiones

---

**Notas Importantes**:
- Esta arquitectura es para proyectos que crecerán en complejidad
- Para MVPs pequeños puede ser over-engineering
- La curva de aprendizaje inicial es mayor
- ROI aumenta con el tiempo y tamaño del proyecto
