# Propuesta: Estructura por Contextos (Vertical Slice)

## 🎯 Estructura Propuesta

```
src/
├── @contexts/                          # Bounded Contexts (dominios de negocio)
│   │
│   ├── greetings/                      # Contexto: Greetings
│   │   ├── domain/                     # Capa de dominio
│   │   │   ├── entities/
│   │   │   │   └── Greeting.ts
│   │   │   ├── value-objects/
│   │   │   │   └── Message.ts
│   │   │   ├── exceptions/
│   │   │   │   └── InvalidGreetingException.ts
│   │   │   └── services/               # Domain services (opcional)
│   │   │
│   │   ├── application/                # Capa de aplicación
│   │   │   ├── ports/
│   │   │   │   ├── inbound/
│   │   │   │   │   └── IGetGreetingUseCase.ts
│   │   │   │   └── outbound/
│   │   │   │       └── IGreetingRepository.ts
│   │   │   ├── use-cases/
│   │   │   │   ├── v1/
│   │   │   │   │   └── GetGreetingUseCase.ts
│   │   │   │   └── v2/
│   │   │   │       └── GetGreetingUseCase.ts
│   │   │   ├── dtos/
│   │   │   │   ├── v1/
│   │   │   │   └── v2/
│   │   │   └── mappers/
│   │   │       ├── v1/
│   │   │       └── v2/
│   │   │
│   │   └── infrastructure/             # Capa de infraestructura
│   │       ├── http/
│   │       │   ├── v1/
│   │       │   │   ├── controllers/
│   │       │   │   └── routes/
│   │       │   └── v2/
│   │       │       ├── controllers/
│   │       │       └── routes/
│   │       └── persistence/
│   │           └── InMemoryGreetingRepository.ts
│   │
│   ├── users/                          # Contexto: Users (ejemplo futuro)
│   │   ├── domain/
│   │   ├── application/
│   │   └── infrastructure/
│   │
│   └── orders/                         # Contexto: Orders (ejemplo futuro)
│       ├── domain/
│       ├── application/
│       └── infrastructure/
│
├── @shared/                            # Cross-cutting concerns
│   ├── domain/
│   │   ├── exceptions/
│   │   │   └── DomainException.ts      # Base exception
│   │   └── value-objects/              # Shared VOs (Email, Money, etc)
│   │
│   ├── infrastructure/
│   │   ├── config/
│   │   │   ├── environment.ts
│   │   │   └── dependency-injection/
│   │   ├── http/
│   │   │   ├── app.ts                  # Fastify setup
│   │   │   └── shared/
│   │   │       ├── plugins/
│   │   │       ├── middlewares/
│   │   │       └── hooks/
│   │   └── observability/
│   │       ├── logger/
│   │       │   ├── ILogger.ts          # Interface
│   │       │   └── WinstonLogger.ts
│   │       └── metrics/
│   │
│   ├── types/
│   │   └── Result.ts
│   ├── utils/
│   │   └── string.utils.ts
│   └── constants/
│       └── http-status.ts
│
└── main.ts                             # Entry point

test/
├── unit/
│   ├── @contexts/
│   │   ├── greetings/
│   │   │   ├── domain/
│   │   │   ├── application/
│   │   │   └── infrastructure/
│   │   └── users/
│   └── @shared/
├── integration/
│   ├── greetings/
│   └── users/
├── e2e/
└── performance/
```

## ✅ Ventajas

### 1. Alta Cohesión
- Todo lo relacionado con "greetings" está en `@contexts/greetings/`
- No necesitas saltar entre carpetas

### 2. Bounded Contexts Claros
```
@contexts/greetings/    → Contexto de Saludos
@contexts/users/        → Contexto de Usuarios
@contexts/orders/       → Contexto de Órdenes
```
Cada contexto es independiente y puede tener su propia lógica

### 3. Escalabilidad
- Agregar nuevo contexto: `mkdir @contexts/payments/`
- No afecta otros contextos
- Fácil de extraer a microservicio

### 4. Teams Independientes
```
Team A → @contexts/greetings/
Team B → @contexts/users/
Team C → @contexts/orders/
```
Cada team trabaja en su carpeta sin conflictos

### 5. Navegación Clara
```bash
# Todo greetings en un solo lugar
cd src/@contexts/greetings/
ls
# domain/  application/  infrastructure/
```

### 6. Versionado Flexible
```
application/
├── use-cases/
│   ├── v1/GetGreetingUseCase.ts
│   └── v2/GetGreetingUseCase.ts   # Diferente lógica
├── dtos/v1/
└── dtos/v2/
```

## 🔄 Migración desde Estructura Actual

### Paso 1: Crear nueva estructura
```bash
mkdir -p src/@contexts/greetings/{domain,application,infrastructure}
mkdir -p src/@contexts/greetings/domain/{entities,value-objects,exceptions}
mkdir -p src/@contexts/greetings/application/{ports,use-cases,dtos,mappers}
mkdir -p src/@contexts/greetings/application/ports/{inbound,outbound}
mkdir -p src/@contexts/greetings/infrastructure/{http,persistence}
```

### Paso 2: Mover archivos (con git mv para preservar historia)
```bash
# Domain
git mv src/@core/domain/greetings/entities/* src/@contexts/greetings/domain/entities/
git mv src/@core/domain/greetings/value-objects/* src/@contexts/greetings/domain/value-objects/
git mv src/@core/domain/greetings/exceptions/* src/@contexts/greetings/domain/exceptions/

# Ports
git mv src/@core/ports/inbound/greetings/* src/@contexts/greetings/application/ports/inbound/
git mv src/@core/ports/outbound/greetings/* src/@contexts/greetings/application/ports/outbound/

# Shared domain
mkdir -p src/@shared/domain/exceptions
git mv src/@core/domain/shared/exceptions/* src/@shared/domain/exceptions/

# Shared infrastructure
mkdir -p src/@shared/infrastructure/{config,http,observability}
git mv src/@infrastructure/config/* src/@shared/infrastructure/config/
git mv src/@infrastructure/http/shared/* src/@shared/infrastructure/http/
```

### Paso 3: Actualizar imports
Buscar y reemplazar en VSCode:
```
@core/domain/greetings/ → @contexts/greetings/domain/
@core/ports/inbound/greetings/ → @contexts/greetings/application/ports/inbound/
@core/ports/outbound/greetings/ → @contexts/greetings/application/ports/outbound/
@core/domain/shared/ → @shared/domain/
@infrastructure/config/ → @shared/infrastructure/config/
```

### Paso 4: Actualizar configs

**tsconfig.json**:
```json
{
  "compilerOptions": {
    "baseUrl": "./src",
    "paths": {
      "@contexts/*": ["@contexts/*"],
      "@shared/*": ["@shared/*"]
    }
  }
}
```

**vitest.config.ts**:
```typescript
resolve: {
  alias: {
    "@contexts": path.resolve(__dirname, "./src/@contexts"),
    "@shared": path.resolve(__dirname, "./src/@shared"),
  },
}
```

**.swcrc**:
```json
{
  "jsc": {
    "baseUrl": "./src",
    "paths": {
      "@contexts/*": ["@contexts/*"],
      "@shared/*": ["@shared/*"]
    }
  }
}
```

### Paso 5: Actualizar tests
```bash
mkdir -p test/unit/@contexts/greetings/{domain,application,infrastructure}
git mv test/unit/@core/domain/greetings/* test/unit/@contexts/greetings/domain/
```

### Paso 6: Verificar
```bash
npm run lint
npm test
npm run build
```

## 📊 Comparación

| Aspecto | Estructura Actual (Horizontal) | Estructura por Contextos (Vertical) |
|---------|-------------------------------|-------------------------------------|
| **Cohesión** | Baja (separado por capa) | Alta (todo junto por dominio) |
| **Navegación** | Saltar entre carpetas | Todo en un lugar |
| **Escalabilidad** | Moderada | Excelente |
| **DDD Alignment** | Bueno | Excelente |
| **Teams** | Difícil aislar | Fácil aislar |
| **Microservicios** | Complejo extraer | Fácil extraer |
| **Onboarding** | Buscar en 3 carpetas | Buscar en 1 carpeta |

## 🎯 Recomendación

**SÍ**, cambia a estructura por contextos si:
- ✅ Planeas escalar a múltiples dominios
- ✅ Trabajas/trabajarás en equipo
- ✅ Quieres flexibilidad para microservicios
- ✅ Prefieres alta cohesión
- ✅ Sigues DDD con bounded contexts

**NO**, mantén estructura actual si:
- ❌ Solo tienes 1-2 dominios muy simples
- ❌ Aplicación extremadamente pequeña
- ❌ No planeas crecer

## 💰 Costo/Beneficio

**Costo**: ~1 hora de refactoring
**Beneficio**: Escalabilidad y mantenibilidad a largo plazo

## 🚀 Próximos Pasos

1. Decidir si hacer el cambio ahora o continuar Stage 3
2. Si decides cambiar:
   - Crear rama `refactor/vertical-slice-architecture`
   - Ejecutar pasos 1-6
   - Crear PR con cambios
3. Si decides continuar:
   - Seguir con Stage 3
   - Refactorizar más adelante

## 📚 Referencias

- [Vertical Slice Architecture](https://www.jimmybogard.com/vertical-slice-architecture/)
- [Feature Folders](https://www.kamilgrzybek.com/design/feature-folders/)
- [DDD Bounded Contexts](https://martinfowler.com/bliki/BoundedContext.html)
