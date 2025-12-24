# Especificaciones de Migración - Node API Skeleton

## Índice de Documentos

Este directorio contiene la planificación completa para migrar el proyecto Node API Skeleton a arquitectura hexagonal con carpetas versionadas y mejoras adicionales.

---

## 📋 Documentos del Plan

### [00 - Análisis de la Situación Actual](./00_analisis_situacion_actual.md)
**Propósito**: Análisis detallado del estado actual del proyecto

**Contenido**:
- Arquitectura actual (layered architecture)
- Fortalezas identificadas
- Limitaciones y deuda técnica
- Oportunidades para arquitectura hexagonal
- Métricas actuales

**Lectura recomendada**: Primero

---

### [01 - Arquitectura Hexagonal](./01_arquitectura_hexagonal.md)
**Propósito**: Plan de migración a arquitectura hexagonal (Ports & Adapters)

**Contenido**:
- Fundamentos de arquitectura hexagonal
- Nueva estructura de carpetas propuesta
- Capas: Dominio, Aplicación, Infraestructura
- Plan de migración por fases
- Ejemplos de código
- Beneficios esperados

**Lectura recomendada**: Segundo

---

### [02 - Carpetas Versionadas](./02_carpetas_versionadas.md)
**Propósito**: Estrategia de versionado de API mediante carpetas

**Contenido**:
- Comparación de estrategias de versionado
- Estructura de carpetas versionadas (v1, v2, ...)
- Implementación de middleware de deprecación
- Ciclo de vida de versiones
- Documentación OpenAPI multi-versión
- Testing de múltiples versiones
- Mejores prácticas

**Lectura recomendada**: Tercero

---

### [03 - Oportunidades de Mejora](./03_oportunidades_mejora.md)
**Propósito**: Identificación de mejoras más allá de arquitectura

**Contenido**:
- Validación y seguridad (Zod, errores tipados, rate limiting, JWT)
- Observabilidad (logger estructurado, health checks, métricas Prometheus)
- Persistencia (Prisma, migraciones, repositorios)
- Testing mejorado (integración, contrato, carga)
- DevOps (Docker Compose, CI/CD)
- Performance (caching, compresión)
- Documentación (ADRs, TypeDoc)

**Categorías de prioridad**:
- 🔴 Alta prioridad (Must Have)
- 🟡 Media prioridad (Should Have)
- 🟢 Baja prioridad (Nice to Have)

**Lectura recomendada**: Cuarto

---

### [04 - Plan de Implementación](./04_plan_implementacion.md)
**Propósito**: Roadmap ejecutable por etapas

**Contenido**:
- 8 etapas incrementales con tareas específicas
- Estimaciones de tiempo
- Criterios de aceptación por etapa
- Estrategia de testing durante migración
- Métricas de éxito
- Gestión de riesgos
- Checklist de inicio
- **Enfoque híbrido pragmático** (OOP + FP)

**Etapas**:
0. Preparación y Setup (Fastify, SWC, Vitest) (2-3 días)
1. Fundamentos (Estructura base + Screaming Arch) (3-5 días)
2. Core/Dominio (Entidades, Value Objects, Puertos) (4-5 días)
3. Capa de Aplicación v1 (DTOs con Zod, Mappers, Use Cases) (4-5 días)
4. Infraestructura HTTP con Fastify v1 (5-6 días)
5. Versionado v2 (3-4 días)
6. Observabilidad (Winston + Prometheus) (4-5 días)
7. Mejoras Opcionales (5-10 días)
8. Cleanup y Documentación (2-3 días)

**Total estimado**: 32-50 días calendario

**Lectura recomendada**: Quinto (plan de acción)

---

### [05 - Enfoque Híbrido Pragmático](./05_enfoque_hibrido_pragmatico.md)
**Propósito**: Guía del enfoque híbrido OOP + FP

**Contenido**:
- Por qué híbrido sobre funcional puro
- Entidades y Value Objects como clases inmutables
- DTOs como types (sin clases)
- Mappers como funciones puras
- Use Cases como clases (DI-friendly)
- Repositories como clases
- Utilities como funciones puras
- Result type para manejo de errores
- Testing con mocks y funciones puras
- DDD con enfoque híbrido

**Filosofía**:
- **Pragmatismo**: La herramienta correcta para cada trabajo
- **OOP para estructura**: Entidades, Use Cases, Repositories
- **FP para transformaciones**: Mappers, Utils, DTOs
- **Inmutabilidad**: readonly, sin setters
- **Composición sobre herencia**
- **Type safety estricto**

**Lectura recomendada**: Fundamental para entender el estilo de código

---

### [06 - Vertical Slice Architecture](./06_vertical_slice_architecture.md)
**Propósito**: Guía de estructura por contextos (Vertical Slice)

**Contenido**:
- Estructura propuesta por Bounded Contexts
- Comparación con estructura horizontal (layers)
- Ventajas de Vertical Slice Architecture
- Alta cohesión por dominio de negocio
- Escalabilidad y aislamiento de contextos
- Guía de migración paso a paso
- Actualización de path aliases
- Testing por contexto

**Filosofía**:
- **Organización por dominio**: `@contexts/greetings/`, `@contexts/users/`
- **Alta cohesión**: Todo lo relacionado con un contexto en un solo lugar
- **Bounded Contexts (DDD)**: Cada contexto es independiente
- **Microservicios-ready**: Fácil extraer contextos a servicios separados
- **Team ownership**: Cada equipo puede ser dueño de un contexto completo

**Lectura recomendada**: Complemento a documentos 01 y 05

**Estado**: ✅ Implementado en el proyecto

---

## ⚡ Stack Tecnológico

### Decisiones Confirmadas
- **Framework HTTP**: Fastify (migración desde Express)
- **Compilador**: SWC (20x más rápido que tsc)
- **Tests Unitarios**: Vitest (reemplazo de Jest)
- **Tests Integración**: Supertest + Vitest
- **Tests Performance**: k6
- **Validación**: Zod
- **Logger**: Winston
- **Arquitectura**: Hexagonal + Onion + Screaming Architecture

## 🎯 Resumen Ejecutivo

### Objetivo General
Transformar el proyecto Node API Skeleton de una arquitectura en capas tradicional a una arquitectura moderna que combine:
- **Hexagonal (Ports & Adapters)**: Separación entre dominio e infraestructura
- **Onion Architecture**: Dependencias apuntando hacia el centro
- **Screaming Architecture**: Estructura que refleja el dominio del negocio

Con Fastify, SWC y Vitest para mejor performance y DX.

### Beneficios Esperados

#### 1. Arquitectura
- ✅ Independencia del framework (Express)
- ✅ Lógica de negocio aislada y testeable
- ✅ Facilidad para cambiar infraestructura
- ✅ Mejor organización del código

#### 2. Versionado
- ✅ Soporte para múltiples versiones simultáneas
- ✅ Migración gradual de clientes
- ✅ Estrategia clara de deprecación
- ✅ Breaking changes sin romper clientes existentes

#### 3. Calidad
- ✅ Mayor cobertura de tests
- ✅ Tests más rápidos y aislados
- ✅ Mejor manejo de errores
- ✅ Validación robusta de datos

#### 4. Observabilidad
- ✅ Logger estructurado
- ✅ Métricas exportables (Prometheus)
- ✅ Health checks avanzados
- ✅ Trazabilidad con request IDs

#### 5. Seguridad
- ✅ Validación en runtime (Zod)
- ✅ Rate limiting
- ✅ Autenticación JWT (opcional)
- ✅ Manejo robusto de errores

---

## 📊 Diagrama de Arquitectura Propuesta

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENTES                             │
│              (Web, Mobile, APIs, CLI)                    │
└────────────────────┬────────────────────────────────────┘
                     │
    ┌────────────────▼─────────────────────────────┐
    │  ADAPTADORES PRIMARIOS (Fastify HTTP)        │
    │  ┌────────┐  ┌────────┐                      │
    │  │   v1   │  │   v2   │  Screaming Arch:    │
    │  │ /api/  │  │ /api/  │  Organizado por     │
    │  │  v1/   │  │  v2/   │  features, no       │
    │  │greet.. │  │greet.. │  por capas          │
    │  └───┬────┘  └───┬────┘                      │
    └──────┼───────────┼───────────────────────────┘
           │           │
    ┌──────▼───────────▼───────────────┐
    │  @APPLICATION (Casos de Uso)      │
    │  ┌────────────┐  ┌────────────┐  │
    │  │     v1     │  │     v2     │  │
    │  │  greetings/│  │  greetings/│  │
    │  │  - DTOs    │  │  - DTOs    │  │
    │  │  - Mappers │  │  - Mappers │  │
    │  │  - UseCases│  │  - UseCases│  │
    │  └─────┬──────┘  └─────┬──────┘  │
    └────────┼─────────────┼────────────┘
             │ Zod         │
    ┌────────▼─────────────▼────────────┐
    │  @CORE (Dominio - Independiente)  │
    │  ┌──────────────────────────────┐ │
    │  │  domain/greetings/           │ │
    │  │   - entities/Greeting        │ │
    │  │   - value-objects/Message    │ │
    │  │   - exceptions/              │ │
    │  └──────────────────────────────┘ │
    │  ┌──────────────────────────────┐ │
    │  │  ports/                      │ │
    │  │   - inbound/  (interfaces)   │ │
    │  │   - outbound/ (interfaces)   │ │
    │  └──────────────────────────────┘ │
    └──────────────┬────────────────────┘
                   │ Winston
    ┌──────────────▼────────────────────┐
    │  @INFRASTRUCTURE (Detalles)       │
    │  ┌──────────┐ ┌───────┐ ┌──────┐ │
    │  │persistence│ │observ.│ │http/ │ │
    │  │/greetings/│ │logger │ │v1/v2 │ │
    │  │InMemory   │ │Winston│ │      │ │
    │  │Repo       │ │Metrics│ │      │ │
    │  └──────────┘ └───────┘ └──────┘ │
    └───────────────────────────────────┘

Regla de Dependencia: → solo hacia adentro ←
Infrastructure → Application → Domain
```

---

## 🚀 Cómo Usar Este Plan

### Para Desarrolladores

1. **Lee en orden**: 00 → 01 → 02 → 03 → 04
2. **Enfócate en 04**: El plan de implementación es tu guía paso a paso
3. **Consulta ejemplos**: Todos los docs incluyen código de ejemplo
4. **Checkea criterios**: Cada etapa tiene criterios de aceptación claros

### Para Product Owners / Managers

1. **Lee el resumen ejecutivo** (este documento)
2. **Revisa estimaciones** en documento 04
3. **Prioriza mejoras opcionales** en documento 03
4. **Aprueba el plan** antes de comenzar

### Para Arquitectos

1. **Analiza documento 01** (arquitectura hexagonal)
2. **Valida documento 02** (estrategia de versionado)
3. **Revisa decisiones técnicas** en todos los documentos
4. **Propón ADRs** para decisiones importantes

---

## ✅ Checklist Pre-Implementación

Antes de empezar la implementación, asegúrate de:

- [ ] Todos los stakeholders han leído los documentos relevantes
- [ ] El plan ha sido revisado y aprobado
- [ ] Las estimaciones de tiempo son realistas para el equipo
- [ ] Se han asignado recursos/personas
- [ ] Se ha creado la rama de trabajo
- [ ] Baseline de tests y coverage documentado
- [ ] Ambiente de desarrollo configurado
- [ ] Reuniones de seguimiento agendadas

---

## 📈 Métricas de Éxito

Al finalizar la implementación:

### Técnicas
- Coverage de tests ≥ 80%
- Dominio sin dependencias externas
- Build time < 30 segundos
- 0 errores de linter
- 0 vulnerabilidades críticas

### Funcionales
- Múltiples versiones de API funcionando simultáneamente
- Health checks reportando estado real
- Métricas exportándose correctamente
- Swagger docs completos para todas las versiones

### Arquitectura
- 100% de casos de uso testables sin framework
- Separación clara de responsabilidades
- Inyección de dependencias implementada
- Error handling robusto y tipado

---

## 🔄 Proceso de Actualización

Este plan es un documento vivo. Si encuentras que necesita actualizaciones:

1. Crea un issue describiendo el cambio necesario
2. Propón los cambios en una PR
3. Actualiza la fecha de última modificación
4. Mantén el historial de cambios

---

## 📞 Contacto y Soporte

Para preguntas sobre este plan:
- Consulta primero los documentos detallados
- Crea un issue en el repositorio
- Contacta al arquitecto del proyecto

---

## 📅 Historial de Cambios

| Fecha | Versión | Cambios |
|-------|---------|---------|
| 2025-12-23 | 1.0 | Creación inicial del plan completo |
| 2025-12-23 | 2.0 | Actualización con Fastify, SWC, Vitest y Screaming Architecture |
| 2025-12-23 | 3.0 | Enfoque funcional opinionado + DDD (solo funciones, no clases) |
| 2025-12-23 | 4.0 | **Cambio a enfoque híbrido pragmático** (OOP + FP) |
| 2025-12-24 | 5.0 | Agregar documento 06 - Vertical Slice Architecture (implementado) |

---

**Última actualización**: 2025-12-24
**Versión**: 5.0 (Vertical Slice + Híbrido Pragmático + DDD + Fastify + SWC + Vitest + Hexagonal + Onion)
**Estado**: ✅ Stage 4 completado - Vertical Slice implementado
**Próximo paso**: Stage 5 - Versionado v2
