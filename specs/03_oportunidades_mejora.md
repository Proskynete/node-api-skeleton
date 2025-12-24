# 03 - Oportunidades de Mejora

## Fecha de Creación
2025-12-23

## Última Actualización
2025-12-23 - Decisiones tecnológicas confirmadas

## Objetivo
Identificar áreas de mejora en el proyecto más allá de la arquitectura hexagonal y carpetas versionadas, con el fin de crear un skeleton robusto y production-ready.

## ⚡ Decisiones Tecnológicas Confirmadas

Las siguientes tecnologías han sido seleccionadas para el proyecto:

### Stack Core
- **Framework HTTP**: Fastify (migración desde Express)
  - Razón: Performance ~2-3x superior, TypeScript first-class, validación built-in
- **Compilador**: SWC (reemplazo de tsc)
  - Razón: ~20x más rápido, compatibilidad completa con TypeScript
- **Validación**: Zod
  - Razón: Type-safety, inferencia de tipos automática, integración perfecta con TS

### Testing
- **Tests Unitarios**: Vitest (reemplazo de Jest)
  - Razón: Más rápido, API compatible con Jest, watch mode instantáneo, ESM nativo
- **Tests Integración/E2E**: Supertest + Vitest
  - Razón: Compatibilidad con Fastify, sintaxis familiar
- **Tests Performance**: k6
  - Razón: Estándar de industria, scripting en JavaScript, métricas detalladas

### Observabilidad
- **Logger**: Winston
  - Razón: Maduro, flexible, múltiples transportes, structured logging
- **Métricas**: prom-client (Prometheus)
  - Razón: Estándar de facto para métricas, integración con Grafana

### Arquitectura
- **Hexagonal + Onion + Screaming Architecture**
- **Carpetas con prefijo @**: `@core`, `@application`, `@infrastructure`, `@shared`
- **Organización por features**, no por capas técnicas

---

## Categorías de Mejora

### 1. Validación y Seguridad

#### 1.1 Validación de DTOs en Runtime

**Problema Actual**:
- TypeScript solo valida en compile-time
- No hay validación de requests en runtime
- Posibles errores si clientes envían datos incorrectos

**Solución Propuesta**: Integrar biblioteca de validación

**Opciones**:
| Biblioteca | Pros | Contras |
|-----------|------|---------|
| **Zod** | TypeScript-first, inferencia de tipos, popular | Curva de aprendizaje |
| **class-validator** | Decorators, integra con class-transformer | Menos type-safe |
| **Joi** | Maduro, muy usado | No infiere tipos TS automáticamente |
| **Yup** | Similar a Joi, buena con Formik | Menos features TS |

**Recomendación**: **Zod** (TypeScript-first, mantiene type-safety)

**Implementación**:
```typescript
// src/application/v1/validators/schemas/HelloSchema.ts
import { z } from 'zod';

export const HelloRequestSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  language: z.enum(['en', 'es', 'fr']).default('en')
});

export type HelloRequest = z.infer<typeof HelloRequestSchema>;
```

```typescript
// src/infrastructure/adapters/primary/http/shared/middlewares/validation.ts
import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      res.status(400).json({
        error: 'Validation Error',
        details: error.errors
      });
    }
  };
};
```

**Beneficios**:
- Previene errores en runtime
- Documentación viva de contratos
- Type-safety end-to-end
- Mensajes de error claros

---

#### 1.2 Manejo Robusto de Errores

**Problema Actual**:
- Catch genérico en controllers
- No hay jerarquía de errores de dominio
- Respuestas de error inconsistentes

**Solución Propuesta**: Sistema de errores tipados

**Implementación**:

```typescript
// src/core/domain/exceptions/DomainException.ts
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

// src/core/domain/exceptions/ValidationException.ts
export class ValidationException extends DomainException {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
  }
}

// src/core/domain/exceptions/NotFoundException.ts
export class NotFoundException extends DomainException {
  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`, 'NOT_FOUND', 404);
  }
}
```

```typescript
// src/infrastructure/adapters/primary/http/shared/middlewares/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { DomainException } from '../../../../../core/domain/exceptions/DomainException';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);

  if (error instanceof DomainException) {
    return res.status(error.statusCode).json({
      error: error.name,
      message: error.message,
      code: error.code,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }

  // Error no controlado
  res.status(500).json({
    error: 'InternalServerError',
    message: 'An unexpected error occurred',
    ...(process.env.NODE_ENV === 'development' && {
      details: error.message,
      stack: error.stack
    })
  });
};
```

**Beneficios**:
- Errores tipados y consistentes
- Fácil debugging
- Respuestas estandarizadas
- No expone detalles internos en producción

---

#### 1.3 Rate Limiting y Throttling

**Problema Actual**:
- Sin protección contra abuso
- Vulnerable a DDoS básico
- No hay límites por cliente

**Solución Propuesta**: Implementar rate limiting

```typescript
// src/infrastructure/adapters/primary/http/shared/middlewares/rateLimit.ts
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { Redis } from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379')
});

export const apiLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:'
  }),
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por ventana
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too Many Requests',
    message: 'Rate limit exceeded. Please try again later.'
  }
});

// Para endpoints específicos
export const strictLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 5, // 5 requests por minuto
  skipSuccessfulRequests: true
});
```

**Uso**:
```typescript
// En app.ts
app.use('/api', apiLimiter);
app.use('/api/v1/auth/login', strictLimiter);
```

---

#### 1.4 Autenticación y Autorización

**Problema Actual**:
- Sin autenticación
- Endpoints completamente públicos

**Solución Propuesta**: JWT + RBAC (Role-Based Access Control)

```typescript
// src/core/domain/entities/User.ts
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest'
}

export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly role: UserRole
  ) {}
}

// src/infrastructure/adapters/primary/http/shared/middlewares/auth.ts
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
};
```

**Uso**:
```typescript
router.get('/admin', authenticate, authorize(UserRole.ADMIN), handler);
```

---

### 2. Observabilidad y Monitoreo

#### 2.1 Logger Estructurado

**Problema Actual**:
- Solo `console.log` y Morgan para HTTP
- No hay correlación de logs
- Difícil buscar en producción

**Solución Propuesta**: Winston o Pino

```typescript
// src/infrastructure/adapters/secondary/logger/WinstonLogger.ts
import winston from 'winston';
import { ILogger } from '../../../../core/ports/outbound/ILogger';

export class WinstonLogger implements ILogger {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: 'node-api-skeleton' },
      transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
        ...(process.env.NODE_ENV !== 'production'
          ? [new winston.transports.Console({
              format: winston.format.simple()
            })]
          : [])
      ]
    });
  }

  info(message: string, meta?: object): void {
    this.logger.info(message, meta);
  }

  error(message: string, error?: Error, meta?: object): void {
    this.logger.error(message, { error, ...meta });
  }

  warn(message: string, meta?: object): void {
    this.logger.warn(message, meta);
  }

  debug(message: string, meta?: object): void {
    this.logger.debug(message, meta);
  }
}
```

**Request ID para correlación**:
```typescript
// src/infrastructure/adapters/primary/http/shared/middlewares/requestId.ts
import { v4 as uuidv4 } from 'uuid';
import { Request, Response, NextFunction } from 'express';

export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const requestId = req.headers['x-request-id'] as string || uuidv4();
  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
};
```

---

#### 2.2 Health Checks Avanzados

**Problema Actual**:
- Health check básico solo retorna 200
- No verifica dependencias (DB, Redis, etc.)

**Solución Propuesta**: Health checks con dependencias

```typescript
// src/infrastructure/adapters/primary/http/shared/health/HealthController.ts
export class HealthController {
  constructor(
    private readonly dependencies: HealthCheck[]
  ) {}

  async checkLiveness(req: Request, res: Response): Promise<void> {
    // Liveness: ¿está vivo el proceso?
    res.status(200).json({ status: 'alive' });
  }

  async checkReadiness(req: Request, res: Response): Promise<void> {
    // Readiness: ¿puede recibir tráfico?
    const checks = await Promise.all(
      this.dependencies.map(dep => dep.check())
    );

    const allHealthy = checks.every(c => c.healthy);
    const status = allHealthy ? 200 : 503;

    res.status(status).json({
      status: allHealthy ? 'ready' : 'not ready',
      checks: checks.map(c => ({
        name: c.name,
        healthy: c.healthy,
        message: c.message,
        responseTime: c.responseTime
      }))
    });
  }
}

// Implementación para DB
export class DatabaseHealthCheck implements HealthCheck {
  async check(): Promise<HealthCheckResult> {
    const start = Date.now();
    try {
      await this.database.ping();
      return {
        name: 'database',
        healthy: true,
        message: 'Database is reachable',
        responseTime: Date.now() - start
      };
    } catch (error) {
      return {
        name: 'database',
        healthy: false,
        message: error.message,
        responseTime: Date.now() - start
      };
    }
  }
}
```

**Rutas**:
```typescript
app.get('/health/live', healthController.checkLiveness);
app.get('/health/ready', healthController.checkReadiness);
```

---

#### 2.3 Métricas con Prometheus

**Solución Propuesta**: Exportar métricas para Prometheus

```typescript
// src/infrastructure/adapters/primary/http/shared/metrics/prometheus.ts
import promClient from 'prom-client';

const register = new promClient.Registry();

// Métricas por defecto (CPU, memoria, etc.)
promClient.collectDefaultMetrics({ register });

// Métricas custom
export const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code', 'version'],
  registers: [register]
});

export const httpRequestTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code', 'version'],
  registers: [register]
});

// Middleware para recolectar métricas
export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path;
    const version = req.baseUrl.split('/')[2] || 'unknown'; // /api/v1/...

    httpRequestDuration.observe(
      { method: req.method, route, status_code: res.statusCode, version },
      duration
    );

    httpRequestTotal.inc({
      method: req.method,
      route,
      status_code: res.statusCode,
      version
    });
  });

  next();
};

// Endpoint de métricas
app.get('/metrics', async (req, res) => {
  res.setHeader('Content-Type', register.contentType);
  res.send(await register.metrics());
});
```

---

### 3. Persistencia y Base de Datos

#### 3.1 Implementar Repositorios Reales

**Problema Actual**:
- Solo InMemoryRepository
- Sin persistencia real

**Solución Propuesta**: Agregar adaptadores de DB

**Opciones**:
- **TypeORM**: ORM completo, migraciones
- **Prisma**: Type-safe, excelente DX
- **Knex**: Query builder, más control
- **Raw SQL**: Máximo control, más trabajo

**Recomendación**: **Prisma** (mejor DX para TypeScript)

```typescript
// src/infrastructure/adapters/secondary/repositories/PrismaHelloRepository.ts
import { PrismaClient } from '@prisma/client';
import { IHelloRepository } from '../../../../core/ports/outbound/IHelloRepository';
import { Hello } from '../../../../core/domain/entities/Hello';

export class PrismaHelloRepository implements IHelloRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getHello(): Promise<Hello> {
    const record = await this.prisma.hello.findFirst();
    return new Hello(record?.message || 'Hello World!');
  }

  async save(hello: Hello): Promise<void> {
    await this.prisma.hello.create({
      data: { message: hello.message }
    });
  }
}
```

---

#### 3.2 Migraciones y Seeds

**Problema Actual**:
- Sin estrategia de migraciones
- Sin datos de prueba

**Solución Propuesta**:
```bash
# Prisma migrations
npx prisma migrate dev --name init
npx prisma migrate deploy

# Seeds
npx prisma db seed
```

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.hello.create({
    data: { message: 'Hello from seed!' }
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

---

### 4. Testing Mejorado

#### 4.1 Testing de Integración

**Problema Actual**:
- Solo tests unitarios básicos
- Sin tests de integración end-to-end

**Solución Propuesta**:
```typescript
// test/integration/v1/hello.spec.ts
import request from 'supertest';
import app from '../../../src/infrastructure/adapters/primary/http/express/app';

describe('GET /api/v1/hello', () => {
  it('should return hello message', async () => {
    const response = await request(app)
      .get('/api/v1/hello')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe('Hello World!');
  });

  it('should include request id header', async () => {
    const response = await request(app)
      .get('/api/v1/hello');

    expect(response.headers).toHaveProperty('x-request-id');
  });
});
```

---

#### 4.2 Tests de Contrato (Contract Testing)

**Solución Propuesta**: Usar Pact o OpenAPI validation

```typescript
// test/contract/openapi.spec.ts
import request from 'supertest';
import { OpenApiValidator } from 'express-openapi-validator';

describe('OpenAPI Contract', () => {
  it('responses should match OpenAPI spec', async () => {
    const validator = new OpenApiValidator({
      apiSpec: './docs/openapi.yaml'
    });

    const response = await request(app).get('/api/v1/hello');

    // Valida que la respuesta cumpla el schema OpenAPI
    expect(() => validator.validate(response)).not.toThrow();
  });
});
```

---

#### 4.3 Tests de Carga

**Solución Propuesta**: k6 para load testing

```javascript
// test/load/hello.k6.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Ramp up
    { duration: '1m', target: 100 }, // Stay at 100 users
    { duration: '30s', target: 0 }  // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% requests < 500ms
    http_req_failed: ['rate<0.01']    // <1% failure rate
  }
};

export default function () {
  const res = http.get('http://localhost:3000/api/v1/hello');

  check(res, {
    'status is 200': (r) => r.status === 200,
    'has message': (r) => r.json('message') !== undefined
  });

  sleep(1);
}
```

```bash
npm run test:load
```

---

### 5. DevOps y CI/CD

#### 5.1 Docker Compose para Desarrollo

**Problema Actual**:
- Dockerfile básico
- Sin orquestación de servicios

**Solución Propuesta**:
```yaml
# docker-compose.yml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://user:pass@db:5432/apidb
      - REDIS_HOST=redis
    depends_on:
      - db
      - redis
    volumes:
      - ./src:/app/src
      - ./test:/app/test

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=apidb
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

---

#### 5.2 GitHub Actions Mejorado

**Problema Actual**:
- Workflows separados
- No hay caching optimizado

**Solución Propuesta**:
```yaml
# .github/workflows/ci.yml
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run tests
        run: npm run test:coverage
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test

      - name: Upload coverage
        uses: coverallsapp/github-action@v2
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}

      - name: Build
        run: npm run build

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

      - name: Run npm audit
        run: npm audit --audit-level=high
```

---

### 6. Configuración y Ambiente

#### 6.1 Configuración por Ambiente

**Problema Actual**:
- Solo .env básico
- Sin validación de variables requeridas

**Solución Propuesta**:
```typescript
// src/infrastructure/config/environment.ts
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).pipe(z.number().positive()),
  DATABASE_URL: z.string().url(),
  REDIS_HOST: z.string(),
  REDIS_PORT: z.string().transform(Number),
  JWT_SECRET: z.string().min(32),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'),
  RATE_LIMIT_MAX: z.string().transform(Number).default('100')
});

export type Environment = z.infer<typeof envSchema>;

export const loadEnvironment = (): Environment => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    console.error('❌ Invalid environment variables:', error.errors);
    process.exit(1);
  }
};

export const env = loadEnvironment();
```

---

### 7. Documentación

#### 7.1 Documentación de Arquitectura (ADRs)

**Solución Propuesta**: Architecture Decision Records

```markdown
# ADR-001: Arquitectura Hexagonal

## Estado
Aceptado

## Contexto
Necesitamos una arquitectura que permita...

## Decisión
Implementar arquitectura hexagonal porque...

## Consecuencias
### Positivas
- Mayor testabilidad
- Independencia del framework

### Negativas
- Mayor complejidad inicial
- Más archivos
```

---

#### 7.2 Generación Automática de Docs

**Solución Propuesta**: TypeDoc para documentación de código

```bash
npm install --save-dev typedoc

npx typedoc --out docs src
```

---

### 8. Performance

#### 8.1 Caching

**Solución Propuesta**: Redis para caching

```typescript
// src/infrastructure/adapters/secondary/cache/RedisCache.ts
import { Redis } from 'ioredis';
import { ICache } from '../../../../core/ports/outbound/ICache';

export class RedisCache implements ICache {
  constructor(private readonly redis: Redis) {}

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(key);
    return value ? JSON.parse(value) : null;
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    if (ttl) {
      await this.redis.setex(key, ttl, serialized);
    } else {
      await this.redis.set(key, serialized);
    }
  }

  async delete(key: string): Promise<void> {
    await this.redis.del(key);
  }
}
```

---

#### 8.2 Compresión de Respuestas

```typescript
import compression from 'compression';

app.use(compression({
  level: 6,
  threshold: 1024, // Solo comprimir > 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));
```

---

## Resumen de Prioridades

### Alta Prioridad (Must Have)
1. ✅ Validación con Zod
2. ✅ Manejo de errores tipado
3. ✅ Logger estructurado (Winston/Pino)
4. ✅ Health checks avanzados
5. ✅ Variables de ambiente validadas

### Media Prioridad (Should Have)
1. ✅ Rate limiting
2. ✅ Autenticación JWT
3. ✅ Métricas Prometheus
4. ✅ Tests de integración
5. ✅ Docker Compose

### Baja Prioridad (Nice to Have)
1. ⭕ Tests de carga (k6)
2. ⭕ Caching con Redis
3. ⭕ Tests de contrato
4. ⭕ ADRs
5. ⭕ TypeDoc

---

## Checklist de Implementación

### Seguridad
- [ ] Implementar Zod para validación
- [ ] Sistema de errores tipados
- [ ] Rate limiting con Redis
- [ ] Autenticación JWT
- [ ] Autorización RBAC
- [ ] Helmet configurado correctamente
- [ ] CORS configurado según ambiente

### Observabilidad
- [ ] Winston/Pino logger
- [ ] Request ID middleware
- [ ] Health checks (liveness/readiness)
- [ ] Métricas Prometheus
- [ ] APM (opcional: New Relic, DataDog)

### Persistencia
- [ ] Prisma setup
- [ ] Migraciones
- [ ] Seeds
- [ ] Repositorio real implementado

### Testing
- [ ] Tests de integración
- [ ] Tests de contrato
- [ ] Tests de carga (k6)
- [ ] Coverage > 80%

### DevOps
- [ ] Docker Compose
- [ ] CI/CD mejorado
- [ ] Snyk security scan
- [ ] Ambiente variables validadas

### Documentación
- [ ] ADRs
- [ ] OpenAPI completo
- [ ] README actualizado
- [ ] CLAUDE.md actualizado
