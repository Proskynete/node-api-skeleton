# Contract Testing with Pact

Este directorio contiene tests de contrato usando [Pact](https://pact.io/), enfocados en validar los **Adaptadores de Infraestructura** según Arquitectura Hexagonal.

## 📚 Documentación Completa

Para guías detalladas sobre contract testing en este proyecto, ver:

- **[Provider Tests Guide](../../docs/guides/contract-testing-provider.md)** - Validación de adaptadores HTTP inbound (controllers) ✅ ACTIVO
- **[Consumer Tests Guide](../../docs/guides/contract-testing-consumer.md)** - Validación de adaptadores HTTP outbound (clients) ⚠️ REFERENCIA

## Arquitectura Hexagonal y Contract Testing

En **Arquitectura Hexagonal (Puertos y Adaptadores)**, los tests de contrato validan específicamente los **adaptadores** que manejan comunicación externa, NO la lógica de negocio.

```
┌────────────────────────────────────────────────────────────┐
│              HEXAGONAL ARCHITECTURE                         │
├────────────────────────────────────────────────────────────┤
│                                                              │
│  INBOUND ADAPTERS (Entrada) ← Provider Tests ✅            │
│  ├─ HTTP Controllers (Fastify)                             │
│  │  └─ infrastructure/http/v*/controllers/                 │
│  │                                                          │
│  APPLICATION CORE (Puertos + Dominio)                      │
│  ├─ Use Cases (application/)                               │
│  ├─ Domain (entities, value objects)                       │
│  └─ Repository Ports (interfaces)                          │
│  │                                                          │
│  OUTBOUND ADAPTERS (Salida) ← Consumer Tests ⚠️           │
│  ├─ InMemoryGreetingRepository (NO requiere Pact)          │
│  └─ [HTTP Clients externos] (NO implementado)              │
│                                                              │
└────────────────────────────────────────────────────────────┘
```

## Tests en Este Directorio

### `greetings-provider.pact.spec.ts` ✅ ACTIVO

**Propósito**: Valida el **adaptador HTTP Inbound** (controllers que exponen nuestra API).

**Componentes probados**:

- `@contexts/greetings/infrastructure/http/v1/controllers/GreetingController.ts`
- `@contexts/greetings/infrastructure/http/v2/controllers/GreetingController.ts`

**Ejecutar**:

```bash
npm run test:contract
```

## Principios Clave

### ✅ QUÉ Probar con Pact

1. **Provider Tests**: Adaptadores HTTP **Inbound** (Controllers/Routes)
   - Validan que nuestros endpoints cumplen contratos
   - Prueban: `infrastructure/http/controllers`

2. **Consumer Tests**: Adaptadores HTTP **Outbound** (HTTP Clients)
   - Validan que nuestros clientes HTTP cumplen contratos
   - Prueban: `infrastructure/clients` o `infrastructure/adapters/http`

### ❌ QUÉ NO Probar con Pact

- ❌ Casos de uso (application layer)
- ❌ Entidades de dominio (domain layer)
- ❌ Repositorios in-memory
- ❌ Comunicación entre capas internas
- ❌ Lógica de negocio

## Comandos Útiles

```bash
# Ejecutar tests de contrato
npm run test:contract

# Ejecutar todos los tests (incluye contract)
npm run test:all

# Publicar pacts al Pact Broker (en CI/CD)
npx pact-broker publish pacts \
  --broker-base-url=$PACT_BROKER_URL \
  --broker-token=$PACT_BROKER_TOKEN \
  --consumer-app-version=$GIT_COMMIT
```

## Cuándo Usar Cada Tipo

### Provider Tests (Nuestro Caso Actual)

**Usar cuando**:

- ✅ Exponemos endpoints HTTP (REST, GraphQL)
- ✅ Otros sistemas/equipos consumen nuestra API
- ✅ Necesitamos garantizar contratos con consumidores

### Consumer Tests (Futuro)

**Usar cuando**:

- ✅ Consumimos APIs HTTP externas
- ✅ Implementamos clientes HTTP como adaptadores
- ✅ Necesitamos garantizar que cumplimos contratos de providers externos

**Nota**: Este proyecto actualmente NO tiene adaptadores HTTP outbound, por lo que no hay consumer tests implementados.

## Integración con CI/CD

```yaml
# GitHub Actions Example
- name: Verify Provider Contracts
  env:
    CI: true
    GIT_COMMIT: ${{ github.sha }}
    GIT_BRANCH: ${{ github.ref_name }}
  run: npm run test:contract
```

## Recursos

- [Pact Documentation](https://docs.pact.io/)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [Pact JS](https://github.com/pact-foundation/pact-js)
- [Contract Testing Best Practices](https://docs.pact.io/getting_started/testing_contracts)

## Resumen: Qué Probar en Cada Capa

| Capa                               | Qué Probar                                  | Tipo de Test                 |
| ---------------------------------- | ------------------------------------------- | ---------------------------- |
| **Domain**                         | Entidades, Value Objects, Reglas de negocio | Unit Tests                   |
| **Application**                    | Casos de uso, Orquestación                  | Unit/Integration Tests       |
| **Infrastructure (HTTP Inbound)**  | Controllers, Routes                         | **Provider Tests** (Pact) ✅ |
| **Infrastructure (HTTP Outbound)** | HTTP Clients, API Adapters                  | **Consumer Tests** (Pact) ⚠️ |
| **Infrastructure (Persistence)**   | Repositories, Databases                     | Integration Tests            |

---

**Estado Actual del Proyecto**:

- ✅ Provider Tests: Implementados y activos
- ⚠️ Consumer Tests: No implementados (sin adaptadores HTTP outbound)

**Versión**: 2.0
**Última Actualización**: Diciembre 2024
