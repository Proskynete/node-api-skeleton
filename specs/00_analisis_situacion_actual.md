# 00 - Análisis de la Situación Actual

## Fecha de Creación
2025-12-23

## Resumen Ejecutivo
Este documento analiza la arquitectura actual del proyecto Node API Skeleton para identificar los puntos de partida antes de migrar a arquitectura hexagonal y carpetas versionadas.

## Arquitectura Actual

### Estructura de Capas Actual
El proyecto sigue actualmente una arquitectura en capas (Layered Architecture):

```
Request → Routes → Controllers → Services → Models
```

**Características:**
- **Routes** (`src/routes/`): Define endpoints y documentación OpenAPI
- **Controllers** (`src/controllers/`): Maneja requests/responses HTTP
- **Services** (`src/services/`): Contiene lógica de negocio
- **Models** (`src/models/`): Define interfaces TypeScript

### Fortalezas Identificadas

1. **Separación de Responsabilidades**: Clara separación entre capas
2. **Carga Dinámica de Rutas**: Sistema automático de registro de rutas (`src/routes/index.ts`)
3. **Documentación OpenAPI**: Integración con Swagger usando JSDoc
4. **Testing**: Configuración de Jest con cobertura del 80%
5. **Buenas Prácticas**: ESLint, Prettier, Husky configurados

### Limitaciones Actuales

#### 1. Acoplamiento con Framework
- **Problema**: Los controllers y services están acoplados directamente a Express
- **Impacto**: Dificulta testing unitario y cambio de framework
- **Ejemplo**: `Request` y `Response` de Express en controllers

#### 2. Ausencia de Puertos y Adaptadores
- **Problema**: No hay abstracción entre lógica de negocio e infraestructura
- **Impacto**: Dificulta cambiar bases de datos, APIs externas, etc.
- **Ejemplo**: No hay interfaces para repositorios o servicios externos

#### 3. Sin Versionado de API
- **Problema**: Todo está bajo `/api/v1` pero sin estructura de carpetas versionada
- **Impacto**: Dificulta mantener múltiples versiones de la API
- **Evidencia**: Rutas en `src/config.ts` con base_url fijo

#### 4. Modelos Sin Validación
- **Problema**: Los modelos son solo interfaces TypeScript sin validación en runtime
- **Impacto**: Posibles errores en tiempo de ejecución
- **Ejemplo**: `src/models/business/hello.ts`

#### 5. Falta de Inyección de Dependencias
- **Problema**: Dependencias hardcodeadas en controllers y services
- **Impacto**: Dificulta testing y extensibilidad
- **Ejemplo**: `HelloController` importa directamente `HelloService`

#### 6. Manejo de Errores Genérico
- **Problema**: Catch genérico en controllers sin tipado de errores
- **Impacato**: Dificulta debugging y manejo específico de errores
- **Ejemplo**: `src/controllers/hello.ts:10-12`

## Estructura de Archivos Actual

```
src/
├── controllers/      # Capa de presentación
├── services/         # Capa de lógica de negocio
├── models/           # Definiciones de tipos
│   ├── business/     # Modelos de dominio
│   ├── config.ts
│   └── status_code.ts
├── routes/           # Definición de endpoints
├── tools/            # Utilidades (swagger, health)
├── utils/            # Funciones helper
├── app.ts            # Configuración Express
├── config.ts         # Configuración centralizada
└── server.ts         # Entry point
```

## Deuda Técnica Identificada

### Alta Prioridad
1. Falta de abstracción para repositorios/persistencia
2. Sin inyección de dependencias
3. Acoplamiento con Express en toda la aplicación

### Media Prioridad
1. Sin validación de DTOs en runtime
2. Manejo de errores poco robusto
3. Sin estrategia de versionado de API

### Baja Prioridad
1. Sin logger estructurado (solo Morgan para HTTP)
2. Configuración de entorno básica (.env simple)
3. Sin rate limiting o throttling

## Oportunidades para Arquitectura Hexagonal

### Dominio (Core)
- Entidades de negocio puras
- Casos de uso (use cases)
- Interfaces de puertos

### Aplicación
- DTOs para entrada/salida
- Mappers entre capas
- Casos de uso implementados

### Infraestructura
- Adaptadores HTTP (Express)
- Adaptadores de persistencia
- Adaptadores de servicios externos

### Presentación
- Controllers como adaptadores primarios
- Validación de entrada
- Transformación de respuestas

## Métricas Actuales

### Complejidad del Código
- **Total archivos TypeScript**: 13
- **Archivos de test**: 4
- **Cobertura de tests**: Configurado 80%
- **Dependencias externas en core**: Alta (Express en todo)

### Mantenibilidad
- **Facilidad de testing**: Media (requiere mocks de Express)
- **Facilidad de cambio**: Media-Baja (acoplamiento)
- **Extensibilidad**: Media (necesita modificar múltiples capas)

## Conclusiones

El proyecto tiene una base sólida con buenas prácticas de desarrollo, pero necesita evolucionar hacia arquitectura hexagonal para:

1. **Mejorar testabilidad**: Aislar lógica de negocio del framework
2. **Aumentar flexibilidad**: Facilitar cambios de infraestructura
3. **Escalar mantenibilidad**: Soportar múltiples versiones de API
4. **Reducir acoplamiento**: Separar dominio de detalles técnicos

La migración es viable y el proyecto es suficientemente pequeño para ser un buen candidato a refactorización completa.
