# 02 - Plan de Implementación de Carpetas Versionadas

## Fecha de Creación
2025-12-23

## Objetivo
Implementar una estrategia de versionado de API mediante carpetas que permita mantener múltiples versiones de la API simultáneamente, facilitando la evolución gradual y retrocompatibilidad.

## Problema Actual

### Estado Actual
- Base URL fija: `/api/v1` configurada en `src/config.ts`
- Sin estructura de carpetas por versión
- Cambios en la API afectan a todos los clientes
- No hay estrategia para deprecar endpoints

### Limitaciones
1. Imposible mantener v1 y v2 simultáneamente con diferente lógica
2. Breaking changes requieren coordinación con todos los clientes
3. No hay forma de migrar gradualmente clientes a nuevas versiones
4. Testing de múltiples versiones es complejo

## Estrategias de Versionado de APIs

### Comparación de Estrategias

| Estrategia | Pros | Contras | Uso Recomendado |
|------------|------|---------|-----------------|
| **URL Path** (`/v1/`, `/v2/`) | Clara, fácil de cachear, explícita | Puede duplicar código | APIs públicas, múltiples versiones activas |
| **Query Param** (`?version=1`) | No cambia URL base | Menos visible, dificulta caching | APIs internas, versionado ligero |
| **Header** (`Accept: application/vnd.api.v1+json`) | RESTful puro, URLs limpias | Menos descubrible, complejo | APIs enterprise, clientes sofisticados |
| **Content Negotiation** | Estándar HTTP | Requiere cliente HTTP avanzado | Servicios B2B |

### Decisión: URL Path Versioning
**Razón**: Es la más común, clara y fácil de implementar para un skeleton/template.

## Propuesta de Estructura Versionada

### Estructura de Carpetas con Hexagonal + Versionado

```
src/
├── core/                                    # DOMINIO (compartido entre versiones)
│   ├── domain/
│   │   ├── entities/
│   │   ├── value-objects/
│   │   └── exceptions/
│   ├── use-cases/                           # Casos de uso compartidos
│   │   └── hello/
│   └── ports/
│       ├── inbound/
│       └── outbound/
│
├── application/                             # APLICACIÓN
│   ├── v1/                                  # VERSIÓN 1
│   │   ├── dtos/
│   │   │   ├── request/
│   │   │   └── response/
│   │   │       └── HelloResponseDto.ts     # v1: { message: string }
│   │   ├── mappers/
│   │   │   └── HelloMapper.ts
│   │   ├── services/
│   │   │   └── HelloService.ts
│   │   └── validators/
│   │
│   ├── v2/                                  # VERSIÓN 2
│   │   ├── dtos/
│   │   │   ├── request/
│   │   │   └── response/
│   │   │       └── HelloResponseDto.ts     # v2: { message: string, timestamp: Date }
│   │   ├── mappers/
│   │   │   └── HelloMapper.ts
│   │   ├── services/
│   │   │   └── HelloService.ts
│   │   └── validators/
│   │
│   └── shared/                              # Compartido entre versiones
│       └── BaseMapper.ts
│
├── infrastructure/
│   ├── adapters/
│   │   ├── primary/
│   │   │   └── http/
│   │   │       ├── v1/                      # Endpoints v1
│   │   │       │   ├── controllers/
│   │   │       │   │   └── HelloController.ts
│   │   │       │   └── routes/
│   │   │       │       ├── index.ts
│   │   │       │       └── hello.routes.ts
│   │   │       │
│   │   │       ├── v2/                      # Endpoints v2
│   │   │       │   ├── controllers/
│   │   │       │   │   └── HelloController.ts
│   │   │       │   └── routes/
│   │   │       │       ├── index.ts
│   │   │       │       └── hello.routes.ts
│   │   │       │
│   │   │       ├── shared/                  # Middlewares compartidos
│   │   │       │   ├── middlewares/
│   │   │       │   │   ├── errorHandler.ts
│   │   │       │   │   ├── validation.ts
│   │   │       │   │   └── deprecation.ts
│   │   │       │   └── utils/
│   │   │       │
│   │   │       └── express/
│   │   │           └── app.ts
│   │   │
│   │   └── secondary/                       # Compartido entre versiones
│   │       └── repositories/
│   │
│   └── config/
│       ├── versions.ts                      # Configuración de versiones
│       └── dependency-injection/
│           ├── v1.container.ts
│           └── v2.container.ts
│
└── server.ts
```

## Implementación Detallada

### 1. Configuración de Versiones

**Archivo**: `src/infrastructure/config/versions.ts`
```typescript
export enum ApiVersion {
  V1 = 'v1',
  V2 = 'v2'
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
    basePath: '/api/v1',
    isDeprecated: false,
    description: 'Initial API version'
  },
  [ApiVersion.V2]: {
    version: ApiVersion.V2,
    basePath: '/api/v2',
    isDeprecated: false,
    description: 'Second version with enhanced features'
  }
};

export const DEFAULT_VERSION = ApiVersion.V1;
export const LATEST_VERSION = ApiVersion.V2;
```

### 2. Router Principal con Versiones

**Archivo**: `src/infrastructure/adapters/primary/http/express/app.ts`
```typescript
import express, { Express } from 'express';
import { API_VERSIONS, ApiVersion } from '../../../../config/versions';
import { createV1Router } from '../v1/routes';
import { createV2Router } from '../v2/routes';
import { deprecationMiddleware } from '../shared/middlewares/deprecation';

const app: Express = express();

// Middlewares globales
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check (sin versión)
app.get('/health', (req, res) => res.status(200).send());

// Registrar versiones
const v1Config = API_VERSIONS[ApiVersion.V1];
const v2Config = API_VERSIONS[ApiVersion.V2];

// V1 Routes
app.use(
  v1Config.basePath,
  deprecationMiddleware(v1Config),
  createV1Router()
);

// V2 Routes
app.use(
  v2Config.basePath,
  deprecationMiddleware(v2Config),
  createV2Router()
);

// Redirect raíz a última versión
app.get('/', (req, res) => {
  res.redirect(v2Config.basePath);
});

export default app;
```

### 3. Middleware de Deprecación

**Archivo**: `src/infrastructure/adapters/primary/http/shared/middlewares/deprecation.ts`
```typescript
import { Request, Response, NextFunction } from 'express';
import { VersionConfig } from '../../../../../config/versions';

export const deprecationMiddleware = (versionConfig: VersionConfig) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (versionConfig.isDeprecated) {
      res.setHeader('Deprecation', 'true');

      if (versionConfig.deprecationDate) {
        res.setHeader(
          'Sunset',
          versionConfig.deprecationDate.toUTCString()
        );
      }

      res.setHeader(
        'Link',
        `</api/${versionConfig.version}/deprecated>; rel="deprecation"`
      );

      // Log para monitoreo
      console.warn(
        `Deprecated API version ${versionConfig.version} accessed: ${req.method} ${req.path}`
      );
    }

    next();
  };
};
```

### 4. DTOs por Versión

**V1**: `src/application/v1/dtos/response/HelloResponseDto.ts`
```typescript
export interface HelloResponseDto {
  message: string;
}
```

**V2**: `src/application/v2/dtos/response/HelloResponseDto.ts`
```typescript
export interface HelloResponseDto {
  message: string;
  timestamp: Date;
  version: string;
}
```

### 5. Mappers por Versión

**V1**: `src/application/v1/mappers/HelloMapper.ts`
```typescript
import { Hello } from '../../../core/domain/entities/Hello';
import { HelloResponseDto } from '../dtos/response/HelloResponseDto';

export class HelloMapper {
  static toDto(entity: Hello): HelloResponseDto {
    return {
      message: entity.message
    };
  }
}
```

**V2**: `src/application/v2/mappers/HelloMapper.ts`
```typescript
import { Hello } from '../../../core/domain/entities/Hello';
import { HelloResponseDto } from '../dtos/response/HelloResponseDto';

export class HelloMapper {
  static toDto(entity: Hello): HelloResponseDto {
    return {
      message: entity.message,
      timestamp: new Date(),
      version: '2.0'
    };
  }
}
```

### 6. Contenedores de DI por Versión

**V1**: `src/infrastructure/config/dependency-injection/v1.container.ts`
```typescript
import { HelloService } from '../../../application/v1/services/HelloService';
import { InMemoryHelloRepository } from '../../adapters/secondary/repositories/InMemoryHelloRepository';
import { HelloController } from '../../adapters/primary/http/v1/controllers/HelloController';

export class V1Container {
  private static instance: V1Container;

  static getInstance(): V1Container {
    if (!V1Container.instance) {
      V1Container.instance = new V1Container();
    }
    return V1Container.instance;
  }

  createHelloController() {
    const repository = new InMemoryHelloRepository();
    const service = new HelloService(repository);
    return new HelloController(service);
  }
}
```

**V2**: Similar con las dependencias de v2

### 7. Rutas Dinámicas por Versión

**V1**: `src/infrastructure/adapters/primary/http/v1/routes/index.ts`
```typescript
import { Router } from 'express';
import { readdirSync } from 'fs';
import { removeExtensions } from '../../../../../../shared/utils/remove_extensions';

const router = Router();
const PATH_ROUTES = __dirname;

const loadRoutes = (file: string): void => {
  const name = removeExtensions(file);
  if (name !== 'index') {
    import(`./${file}`).then((routeModule) => {
      router.use(`/${name}`, routeModule.router);
    });
  }
};

readdirSync(PATH_ROUTES).filter((file) => loadRoutes(file));

export const createV1Router = () => router;
```

## Estrategia de Migración de Versiones

### Ciclo de Vida de una Versión

```
Nueva → Actual → Deprecated → Sunset → Removed
  │       │          │          │         │
  │       │          │          │         └─ Eliminar código
  │       │          │          └─ Dejar de funcionar (fecha límite)
  │       │          └─ Marcar como obsoleta (headers)
  │       └─ Versión en producción activa
  └─ Versión en desarrollo/beta
```

### Ejemplo de Proceso de Deprecación

#### Fase 1: Anuncio (3-6 meses antes)
```typescript
// v1 sigue funcionando normal
API_VERSIONS[ApiVersion.V1] = {
  version: ApiVersion.V1,
  basePath: '/api/v1',
  isDeprecated: false,  // Aún no deprecated
  description: 'Initial API version (will be deprecated on 2026-06-01)'
};
```

#### Fase 2: Deprecación (3 meses)
```typescript
API_VERSIONS[ApiVersion.V1] = {
  version: ApiVersion.V1,
  basePath: '/api/v1',
  isDeprecated: true,
  deprecationDate: new Date('2026-06-01'),
  sunsetDate: new Date('2026-09-01'),
  description: 'Deprecated - migrate to v2'
};

// Headers en respuesta:
// Deprecation: true
// Sunset: Mon, 01 Sep 2026 00:00:00 GMT
```

#### Fase 3: Sunset (dejar de funcionar)
```typescript
// Middleware que rechaza requests
app.use('/api/v1', (req, res) => {
  res.status(410).json({
    error: 'Gone',
    message: 'API v1 has been sunset. Please use /api/v2',
    sunsetDate: '2026-09-01'
  });
});
```

#### Fase 4: Eliminación
```bash
# Eliminar carpetas v1
rm -rf src/application/v1
rm -rf src/infrastructure/adapters/primary/http/v1
```

## Documentación OpenAPI por Versión

### Swagger Multi-Versión

**Archivo**: `src/infrastructure/adapters/primary/http/shared/swagger/index.ts`
```typescript
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import { version } from '../../../../../../package.json';
import { API_VERSIONS, ApiVersion } from '../../../../config/versions';

const createSwaggerSpec = (apiVersion: ApiVersion) => {
  const versionConfig = API_VERSIONS[apiVersion];

  return swaggerJsdoc({
    definition: {
      openapi: '3.0.0',
      info: {
        title: `Node API Skeleton - ${apiVersion.toUpperCase()}`,
        description: versionConfig.description,
        version: version,
        ...(versionConfig.isDeprecated && {
          'x-deprecated': true,
          'x-sunset-date': versionConfig.sunsetDate
        })
      },
      servers: [
        {
          url: versionConfig.basePath,
          description: `${apiVersion.toUpperCase()} API`
        }
      ]
    },
    apis: [
      `./src/infrastructure/adapters/primary/http/${apiVersion}/routes/*.ts`,
      `./src/application/${apiVersion}/dtos/**/*.ts`
    ]
  });
};

export const setupSwagger = (app: Express): void => {
  // V1 Docs
  const v1Spec = createSwaggerSpec(ApiVersion.V1);
  app.use('/docs/v1', swaggerUi.serve);
  app.get('/docs/v1', swaggerUi.setup(v1Spec));
  app.get('/docs/v1.json', (_, res) => res.json(v1Spec));

  // V2 Docs
  const v2Spec = createSwaggerSpec(ApiVersion.V2);
  app.use('/docs/v2', swaggerUi.serve);
  app.get('/docs/v2', swaggerUi.setup(v2Spec));
  app.get('/docs/v2.json', (_, res) => res.json(v2Spec));

  // Redirect /docs a última versión
  app.get('/docs', (_, res) => res.redirect('/docs/v2'));
};
```

## Testing de Múltiples Versiones

### Estructura de Tests

```
test/
├── unit/
│   ├── v1/
│   │   ├── controllers/
│   │   ├── services/
│   │   └── mappers/
│   ├── v2/
│   │   ├── controllers/
│   │   ├── services/
│   │   └── mappers/
│   └── shared/
│       └── domain/
│
└── integration/
    ├── v1/
    │   └── hello.spec.ts
    └── v2/
        └── hello.spec.ts
```

### Ejemplo Test de Compatibilidad

```typescript
// test/integration/version-compatibility.spec.ts
describe('Version Compatibility', () => {
  it('v1 should return only message', async () => {
    const response = await request(app).get('/api/v1/hello');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');
    expect(response.body).not.toHaveProperty('timestamp');
  });

  it('v2 should return message and timestamp', async () => {
    const response = await request(app).get('/api/v2/hello');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('version');
  });

  it('deprecated version should include deprecation headers', async () => {
    // Cuando v1 esté deprecated
    const response = await request(app).get('/api/v1/hello');

    expect(response.headers).toHaveProperty('deprecation');
    expect(response.headers.deprecation).toBe('true');
  });
});
```

## Beneficios del Versionado por Carpetas

### 1. Aislamiento
- Cambios en v2 no afectan v1
- Diferentes DTOs, validaciones, lógica por versión
- Testing independiente

### 2. Claridad
- Estructura de carpetas refleja versiones de API
- Fácil identificar qué código pertenece a qué versión
- Onboarding más rápido para nuevos desarrolladores

### 3. Mantenibilidad
- Deprecar versiones eliminando carpetas
- Evolucionar APIs sin romper clientes existentes
- Migración gradual de clientes

### 4. Flexibilidad
- Diferentes estrategias por versión (REST en v1, GraphQL en v2)
- Diferentes validadores, autenticación, etc.
- A/B testing entre versiones

## Mejores Prácticas

### 1. Versionado Semántico
- Cambios breaking → Nueva versión mayor (v1 → v2)
- Nuevas features retrocompatibles → Misma versión
- Bug fixes → Misma versión

### 2. Comunicación
- Documentar cambios en CHANGELOG por versión
- Notificar a clientes con anticipación
- Headers de deprecación claros

### 3. Monitoreo
- Logs de uso por versión
- Métricas de adopción de nuevas versiones
- Alertas cuando versiones deprecadas siguen con tráfico alto

### 4. Límite de Versiones Activas
- Máximo 2-3 versiones activas simultáneamente
- Plan de sunset claro desde el inicio
- No mantener versiones antiguas indefinidamente

## Checklist de Implementación

- [ ] Crear estructura de carpetas versionadas
- [ ] Implementar configuración de versiones
- [ ] Crear middleware de deprecación
- [ ] Migrar v1 a nueva estructura
- [ ] Implementar v2 con cambios
- [ ] Configurar Swagger multi-versión
- [ ] Crear tests de compatibilidad
- [ ] Documentar proceso de versionado
- [ ] Configurar monitoreo por versión
- [ ] Actualizar CLAUDE.md con nueva estructura
