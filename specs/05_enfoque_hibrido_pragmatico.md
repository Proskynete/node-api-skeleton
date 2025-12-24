# 05 - Enfoque Híbrido Pragmático (OOP + FP)

## Fecha de Creación
2025-12-23

## Última Actualización
2025-12-23 - Cambiado de full funcional a híbrido pragmático

## Objetivo
Definir un enfoque **híbrido y pragmático** que combine lo mejor de OOP y FP:
- **OOP**: Para estructura, encapsulación y DI
- **FP**: Para inmutabilidad, pureza y composición
- **DDD**: Principios de Domain-Driven Design
- **Pragmatismo**: Lo que funciona mejor en cada capa

## ¿Por Qué Híbrido?

### Problemas del Full Funcional en TypeScript/Node.js

❌ **Ecosistema es OOP-friendly**
```typescript
// Fastify, Prisma, Winston... todos usan clases
const prisma = new PrismaClient()
const logger = winston.createLogger()
```

❌ **Curva de aprendizaje** alta para equipos
❌ **Más verboso** (necesitas funciones getter para cada propiedad)
❌ **DDD** tradicionalmente usa OOP
❌ **Menos ejemplos** y recursos en la comunidad

### Ventajas del Híbrido

✅ **Pragmático**: Usa la herramienta correcta para cada trabajo
✅ **Familiar**: Cualquier dev TypeScript lo entiende
✅ **Ecosystem-friendly**: Compatible con librerías populares
✅ **Best of both**: Encapsulación + Inmutabilidad
✅ **DDD-aligned**: Sigue patrones establecidos

## Filosofía del Proyecto

### Principios Core (Aplicables Siempre)

```typescript
1. INMUTABILIDAD: readonly, no setters, spread operators
2. PUREZA: Funciones puras en lógica de negocio
3. COMPOSICIÓN: Sobre herencia
4. TYPE SAFETY: TypeScript estricto
5. SINGLE RESPONSIBILITY: Una razón para cambiar
```

### ¿Cuándo Usar OOP vs FP?

| Concepto | Usar | Por Qué |
|----------|------|---------|
| **Entidades** | Clases inmutables | Encapsulación, métodos de negocio |
| **Value Objects** | Clases inmutables | Validación, equality |
| **DTOs** | Types/Interfaces | Sin lógica, solo datos |
| **Mappers** | Funciones puras | Transformación sin estado |
| **Use Cases** | Clases | DI natural, testing fácil |
| **Repositories** | Clases | Gestión de estado privado |
| **Controllers** | Clases | DI, Fastify-friendly |
| **Services** | Clases | Stateful cuando necesario |
| **Utilities** | Funciones puras | Helpers sin estado |
| **Validators** | Funciones (Zod) | Composición, type inference |

## Implementación por Capas

### 1. DOMINIO (@core) - Semi-OOP con Principios FP

#### Entidades como Clases INMUTABLES

```typescript
// src/@core/domain/greetings/entities/Greeting.ts
import { Message } from '../value-objects/Message';

export class Greeting {
  // Constructor privado: solo crear via factory
  private constructor(
    private readonly _message: Message,
    private readonly _createdAt: Date
  ) {}

  // Factory method estático
  static create(text: string): Greeting {
    const message = Message.create(text);
    return new Greeting(message, new Date());
  }

  // Reconstitute para cargar desde DB
  static reconstitute(text: string, createdAt: Date): Greeting {
    const message = Message.create(text);
    return new Greeting(message, createdAt);
  }

  // Getters (readonly)
  get message(): string {
    return this._message.value;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  // Métodos de negocio (funciones puras)
  isRecent(): boolean {
    const hoursSinceCreation =
      (Date.now() - this._createdAt.getTime()) / (1000 * 60 * 60);
    return hoursSinceCreation < 24;
  }

  canEdit(): boolean {
    return this.isRecent();
  }

  // Serialización
  toJSON() {
    return {
      message: this.message,
      createdAt: this._createdAt
    };
  }
}
```

**Características**:
- ✅ Encapsulación (`private`)
- ✅ Inmutabilidad (`readonly`)
- ✅ Sin setters
- ✅ Factory methods
- ✅ Métodos de negocio puros

#### Value Objects como Clases con Validación

```typescript
// src/@core/domain/greetings/value-objects/Message.ts
import { InvalidGreetingException } from '../exceptions/InvalidGreetingException';

export class Message {
  private static readonly MIN_LENGTH = 1;
  private static readonly MAX_LENGTH = 200;

  private constructor(private readonly _value: string) {
    this.validate();
  }

  static create(value: string): Message {
    return new Message(value);
  }

  get value(): string {
    return this._value;
  }

  // Value Object equality
  equals(other: Message): boolean {
    if (!(other instanceof Message)) return false;
    return this._value === other._value;
  }

  private validate(): void {
    if (!this._value || this._value.trim().length < Message.MIN_LENGTH) {
      throw InvalidGreetingException('Message cannot be empty');
    }

    if (this._value.length > Message.MAX_LENGTH) {
      throw InvalidGreetingException(
        `Message too long (max ${Message.MAX_LENGTH} characters)`
      );
    }
  }
}
```

#### Excepciones como Clases

```typescript
// src/@core/domain/shared/exceptions/DomainException.ts
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

// src/@core/domain/greetings/exceptions/InvalidGreetingException.ts
import { DomainException } from '../../shared/exceptions/DomainException';

export class InvalidGreetingException extends DomainException {
  constructor(message: string) {
    super(message, 'INVALID_GREETING', 400);
  }
}

// Helper factory para crear excepciones
export const InvalidGreetingException = (message: string) =>
  new InvalidGreetingException(message);
```

#### Servicios de Dominio (cuando necesario)

```typescript
// src/@core/domain/greetings/services/GreetingDomainService.ts
import { Greeting } from '../entities/Greeting';

export class GreetingDomainService {
  formatGreeting(greeting: Greeting, language: 'en' | 'es'): string {
    const prefix = language === 'es' ? 'Hola' : 'Hello';
    return `${prefix}: ${greeting.message}`;
  }

  mergeGreetings(greetings: Greeting[]): Greeting {
    const messages = greetings.map(g => g.message).join(', ');
    return Greeting.create(messages);
  }

  isGreetingDuplicate(greeting: Greeting, existing: Greeting[]): boolean {
    return existing.some(g => g.message === greeting.message);
  }
}
```

### 2. PUERTOS (@core/ports) - Interfaces

```typescript
// src/@core/ports/outbound/greetings/IGreetingRepository.ts
import { Greeting } from '../../../domain/greetings/entities/Greeting';

export interface IGreetingRepository {
  getGreeting(): Promise<Greeting>;
  save(greeting: Greeting): Promise<void>;
  findById(id: string): Promise<Greeting | null>;
}

// src/@core/ports/outbound/shared/ILogger.ts
export interface ILogger {
  info(message: string, meta?: object): void;
  error(message: string, error?: Error, meta?: object): void;
  warn(message: string, meta?: object): void;
  debug(message: string, meta?: object): void;
}

// src/@core/ports/inbound/greetings/IGetGreetingUseCase.ts
import { GreetingResponseDto } from '../../../../@application/v1/greetings/dtos/GreetingResponseDto';

export interface IGetGreetingUseCase {
  execute(): Promise<GreetingResponseDto>;
}
```

### 3. APPLICATION - Use Cases (Clases) + DTOs (Types) + Mappers (Funciones)

#### DTOs como Types/Interfaces (NO Clases)

```typescript
// src/@application/v1/greetings/dtos/GreetingResponseDto.ts
import { z } from 'zod';

// Schema Zod para validación
export const GreetingResponseSchema = z.object({
  message: z.string().min(1)
});

// Type inferido del schema
export type GreetingResponseDto = z.infer<typeof GreetingResponseSchema>;

// src/@application/v1/greetings/dtos/GreetingRequestDto.ts
export const GreetingRequestSchema = z.object({
  customMessage: z.string().min(1).max(200).optional()
});

export type GreetingRequestDto = z.infer<typeof GreetingRequestSchema>;
```

#### Mappers como Funciones Puras

```typescript
// src/@application/v1/greetings/mappers/GreetingMapper.ts
import { Greeting } from '../../../../@core/domain/greetings/entities/Greeting';
import { GreetingResponseDto } from '../dtos/GreetingResponseDto';

export const greetingToDto = (entity: Greeting): GreetingResponseDto => ({
  message: entity.message
});

export const greetingToDtoWithTimestamp = (entity: Greeting): GreetingResponseDto => ({
  message: entity.message,
  timestamp: entity.createdAt
});

// Composición de mappers
export const greetingsToDto = (entities: Greeting[]): GreetingResponseDto[] =>
  entities.map(greetingToDto);
```

#### Use Cases como Clases (DI Friendly)

```typescript
// src/@application/v1/greetings/use-cases/GetGreetingUseCase.ts
import { IGetGreetingUseCase } from '../../../../@core/ports/inbound/greetings/IGetGreetingUseCase';
import { IGreetingRepository } from '../../../../@core/ports/outbound/greetings/IGreetingRepository';
import { ILogger } from '../../../../@core/ports/outbound/shared/ILogger';
import { GreetingResponseDto } from '../dtos/GreetingResponseDto';
import { greetingToDto } from '../mappers/GreetingMapper';

export class GetGreetingUseCase implements IGetGreetingUseCase {
  constructor(
    private readonly repository: IGreetingRepository,
    private readonly logger: ILogger
  ) {}

  async execute(): Promise<GreetingResponseDto> {
    this.logger.debug('GetGreetingUseCase: Fetching greeting');

    const greeting = await this.repository.getGreeting();

    this.logger.info('GetGreetingUseCase: Greeting fetched successfully');

    return greetingToDto(greeting); // Función pura para mapear
  }
}
```

**Por qué clases para Use Cases?**
- ✅ Dependency Injection natural con constructor
- ✅ Testing fácil (mock de dependencias)
- ✅ Interfaz clara (implementa IGetGreetingUseCase)
- ✅ Estado privado si se necesita (cache, etc.)

### 4. INFRASTRUCTURE - Clases Pragmáticas

#### Repositorios como Clases

```typescript
// src/@infrastructure/persistence/greetings/InMemoryGreetingRepository.ts
import { Greeting } from '../../../@core/domain/greetings/entities/Greeting';
import { IGreetingRepository } from '../../../@core/ports/outbound/greetings/IGreetingRepository';

export class InMemoryGreetingRepository implements IGreetingRepository {
  private greetings: Greeting[] = [];

  async getGreeting(): Promise<Greeting> {
    if (this.greetings.length > 0) {
      return this.greetings[this.greetings.length - 1];
    }
    return Greeting.create('Hello World!');
  }

  async save(greeting: Greeting): Promise<void> {
    // Inmutable: crear nuevo array
    this.greetings = [...this.greetings, greeting];
  }

  async findById(id: string): Promise<Greeting | null> {
    return this.greetings.find(g => g.message === id) ?? null;
  }
}
```

#### Logger como Clase

```typescript
// src/@infrastructure/observability/logger/WinstonLogger.ts
import winston from 'winston';
import { ILogger } from '../../../@core/ports/outbound/shared/ILogger';

export class WinstonLogger implements ILogger {
  private readonly logger: winston.Logger;

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
    this.logger.error(message, {
      error: error?.message,
      stack: error?.stack,
      ...meta
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

#### Controllers como Clases

```typescript
// src/@infrastructure/http/v1/greetings/controllers/GreetingController.ts
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

    return reply.status(200).send(result);
  }
}
```

### 5. DEPENDENCY INJECTION - Container Simple con Clases

```typescript
// src/@infrastructure/config/dependency-injection/container.ts
import { GetGreetingUseCase } from '../../../@application/v1/greetings/use-cases/GetGreetingUseCase';
import { InMemoryGreetingRepository } from '../../persistence/greetings/InMemoryGreetingRepository';
import { GreetingController } from '../../http/v1/greetings/controllers/GreetingController';
import { WinstonLogger } from '../../observability/logger/WinstonLogger';
import { ILogger } from '../../../@core/ports/outbound/shared/ILogger';
import { IGreetingRepository } from '../../../@core/ports/outbound/greetings/IGreetingRepository';
import { env } from '../environment';

export class Container {
  private static instance: Container;

  // Singletons
  private readonly logger: ILogger;

  private constructor() {
    this.logger = new WinstonLogger(env.LOG_LEVEL);
  }

  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  // Factories (nuevas instancias)
  createGreetingRepository(): IGreetingRepository {
    return new InMemoryGreetingRepository();
  }

  createGetGreetingUseCase(): GetGreetingUseCase {
    return new GetGreetingUseCase(
      this.createGreetingRepository(),
      this.logger
    );
  }

  createGreetingController(): GreetingController {
    return new GreetingController(
      this.createGetGreetingUseCase(),
      this.logger
    );
  }

  getLogger(): ILogger {
    return this.logger;
  }
}

// Export singleton getter
export const getContainer = (): Container => Container.getInstance();
```

**Por qué clase para Container?**
- ✅ Singleton pattern natural
- ✅ Estado privado (singletons)
- ✅ Lazy initialization
- ✅ Type-safe

### 6. UTILITIES - Funciones Puras

```typescript
// src/@shared/utils/string-utils.ts
export const trim = (str: string): string => str.trim();

export const toLowerCase = (str: string): string => str.toLowerCase();

export const capitalize = (str: string): string =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

// Composición
export const normalizeText = (text: string): string =>
  capitalize(toLowerCase(trim(text)));

// src/@shared/utils/functional.ts
export const pipe = <T>(...fns: Array<(arg: T) => T>) =>
  (value: T): T => fns.reduce((acc, fn) => fn(acc), value);

export const compose = <T>(...fns: Array<(arg: T) => T>) =>
  (value: T): T => fns.reduceRight((acc, fn) => fn(acc), value);

// Uso
const processMessage = pipe(
  trim,
  toLowerCase,
  capitalize
);
```

## Patrones Híbridos Avanzados

### Result Type (Funcional)

```typescript
// src/@shared/types/Result.ts
export type Success<T> = {
  readonly success: true;
  readonly data: T;
};

export type Failure<E> = {
  readonly success: false;
  readonly error: E;
};

export type Result<T, E = Error> = Success<T> | Failure<E>;

export const success = <T>(data: T): Success<T> => ({
  success: true,
  data
});

export const failure = <E>(error: E): Failure<E> => ({
  success: false,
  error
});

export const isSuccess = <T, E>(result: Result<T, E>): result is Success<T> =>
  result.success === true;

export const isFailure = <T, E>(result: Result<T, E>): result is Failure<E> =>
  result.success === false;
```

**Uso en Use Case**:
```typescript
import { Result, success, failure, isSuccess } from '@shared/types/Result';
import { DomainException } from '@core/domain/shared/exceptions/DomainException';

export class GetGreetingUseCase {
  async execute(): Promise<Result<GreetingResponseDto, DomainException>> {
    try {
      const greeting = await this.repository.getGreeting();
      return success(greetingToDto(greeting));
    } catch (error) {
      if (error instanceof DomainException) {
        return failure(error);
      }
      throw error; // Re-throw unexpected errors
    }
  }
}
```

## Testing

### Tests de Dominio (Clases Inmutables)

```typescript
// test/unit/@core/domain/greetings/entities/Greeting.spec.ts
import { describe, it, expect } from 'vitest';
import { Greeting } from '../../../../../../src/@core/domain/greetings/entities/Greeting';
import { InvalidGreetingException } from '../../../../../../src/@core/domain/greetings/exceptions/InvalidGreetingException';

describe('Greeting Entity', () => {
  describe('create', () => {
    it('should create a valid greeting', () => {
      const greeting = Greeting.create('Hello World');

      expect(greeting.message).toBe('Hello World');
      expect(greeting.createdAt).toBeInstanceOf(Date);
    });

    it('should throw error for empty message', () => {
      expect(() => Greeting.create('')).toThrow(InvalidGreetingException);
    });

    it('should be immutable', () => {
      const greeting = Greeting.create('Hello');

      // No hay forma de cambiar el mensaje
      // @ts-expect-error - readonly
      greeting.message = 'Changed'; // Error de TypeScript
    });
  });

  describe('business logic', () => {
    it('should identify recent greetings', () => {
      const greeting = Greeting.create('Hello');
      expect(greeting.isRecent()).toBe(true);
    });

    it('should allow editing recent greetings', () => {
      const greeting = Greeting.create('Hello');
      expect(greeting.canEdit()).toBe(true);
    });
  });
});
```

### Tests de Use Cases (Mocks con Clases)

```typescript
// test/unit/@application/v1/greetings/use-cases/GetGreetingUseCase.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetGreetingUseCase } from '../../../../../../../src/@application/v1/greetings/use-cases/GetGreetingUseCase';
import { IGreetingRepository } from '../../../../../../../src/@core/ports/outbound/greetings/IGreetingRepository';
import { ILogger } from '../../../../../../../src/@core/ports/outbound/shared/ILogger';
import { Greeting } from '../../../../../../../src/@core/domain/greetings/entities/Greeting';

describe('GetGreetingUseCase', () => {
  let useCase: GetGreetingUseCase;
  let mockRepository: IGreetingRepository;
  let mockLogger: ILogger;

  beforeEach(() => {
    mockRepository = {
      getGreeting: vi.fn(),
      save: vi.fn(),
      findById: vi.fn()
    };

    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn()
    };

    useCase = new GetGreetingUseCase(mockRepository, mockLogger);
  });

  it('should return greeting from repository', async () => {
    const greeting = Greeting.create('Test Greeting');
    vi.mocked(mockRepository.getGreeting).mockResolvedValue(greeting);

    const result = await useCase.execute();

    expect(result).toEqual({ message: 'Test Greeting' });
    expect(mockRepository.getGreeting).toHaveBeenCalledTimes(1);
    expect(mockLogger.debug).toHaveBeenCalled();
  });
});
```

## Reglas de Oro del Enfoque Híbrido

### ✅ SIEMPRE

1. **Inmutabilidad**: Usa `readonly`, `const`, spread operators
2. **No herencia profunda**: Composición sobre herencia
3. **Funciones puras** para transformaciones de datos
4. **DTOs como types**, nunca clases
5. **Validación funcional** con Zod
6. **Mappers como funciones puras**
7. **Utilities como funciones puras**

### ❌ EVITAR

1. **Setters** en entidades del dominio
2. **Estado mutable** en dominio
3. **Herencia** más de 1 nivel
4. **Clases para DTOs**
5. **Lógica de negocio** en infraestructura
6. **Estado global** mutable

### 🎯 DECIDIR CASO POR CASO

- **Servicios de aplicación**: Clases (si tienen estado) o funciones (si son stateless)
- **Helpers**: Funciones puras
- **Factories**: Funciones o métodos estáticos en clases

## Comparación: OOP vs FP vs Híbrido

### Ejemplo: Greeting

**Full OOP (Mutable - ❌ MAL)**:
```typescript
class Greeting {
  constructor(public message: string) {}

  setMessage(message: string) { // ❌ Mutable
    this.message = message;
  }
}
```

**Full FP (Verboso)**:
```typescript
type Greeting = { message: string; createdAt: Date };
const createGreeting = (text: string): Greeting => ({ ... });
const getGreetingMessage = (g: Greeting): string => g.message;
const setGreetingMessage = (g: Greeting, m: string): Greeting => ({ ...g, message: m });
```

**Híbrido (✅ IDEAL)**:
```typescript
class Greeting {
  private constructor(
    private readonly _message: Message,
    private readonly _createdAt: Date
  ) {}

  static create(text: string): Greeting { ... }

  get message(): string { return this._message.value; }
  get createdAt(): Date { return this._createdAt; }

  isRecent(): boolean { /* función pura */ }
}
```

## Conclusión

Este enfoque híbrido proporciona:

✅ **Pragmatismo**: La herramienta correcta para cada trabajo
✅ **Familiaridad**: Fácil para cualquier dev TypeScript
✅ **Ecosistema**: Compatible con Fastify, Prisma, etc.
✅ **Inmutabilidad**: Datos protegidos contra cambios
✅ **Testabilidad**: DI facilita testing
✅ **Claridad**: Código predecible y mantenible
✅ **DDD**: Sigue patrones establecidos
✅ **Escalabilidad**: Fácil agregar features

**No es dogmático sobre OOP o FP. Es pragmático sobre resolver problemas reales.**

---

**Regla Final**: Si tienes duda entre OOP o FP, pregunta:
- ¿Tiene estado que gestionar? → Clase
- ¿Es transformación pura de datos? → Función
- ¿Necesita encapsulación? → Clase
- ¿Es un DTO sin lógica? → Type/Interface
