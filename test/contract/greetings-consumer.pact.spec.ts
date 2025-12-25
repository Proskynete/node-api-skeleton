/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/await-thenable */
/* eslint-disable vitest/no-disabled-tests */

import { Pact } from "@pact-foundation/pact";
import path from "path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

/**
 * Pact Consumer Tests - HTTP Outbound Adapter (EJEMPLO EDUCATIVO)
 *
 * ⚠️ IMPORTANTE: Este archivo es solo un EJEMPLO EDUCATIVO
 * Este proyecto NO tiene adaptadores HTTP outbound, por lo que estos tests están deshabilitados.
 *
 * ARQUITECTURA HEXAGONAL:
 * Los consumer tests validan ADAPTADORES HTTP OUTBOUND (infrastructure layer)
 * que CONSUMEN APIs externas.
 *
 * COMPONENTES QUE PROBARÍA (si existieran):
 * - @contexts/{context}/infrastructure/clients/ExternalApiClient.ts
 * - @contexts/{context}/infrastructure/adapters/http/WeatherApiAdapter.ts
 * - Cualquier adaptador que consuma servicios HTTP externos
 *
 * QUÉ VALIDARÍA:
 * ✅ El adaptador HTTP outbound cumple con el contrato de la API externa
 * ✅ El cliente HTTP mapea correctamente respuestas externas a entidades de dominio
 * ✅ El adaptador maneja correctamente los diferentes estados del provider
 *
 * QUÉ NO VALIDA:
 * ❌ Lógica de negocio (domain layer)
 * ❌ Casos de uso (application layer)
 * ❌ Adaptadores inbound (eso es para provider tests)
 * ❌ Repositorios in-memory (no son servicios externos)
 *
 * EJEMPLO CONCEPTUAL:
 * Si tuviéramos un WeatherApiClient que consume una API de clima externa:
 *
 * ```typescript
 * // src/@contexts/weather/infrastructure/clients/WeatherApiClient.ts
 * export class WeatherApiClient implements IWeatherService {
 *   async getWeather(city: string): Promise<Weather> {
 *     const response = await this.httpClient.get(`/weather/${city}`);
 *     return WeatherMapper.toDomain(response.data);
 *   }
 * }
 * ```
 *
 * El consumer test validaría que este cliente cumple con el contrato de la API externa.
 *
 * ESTADO ACTUAL:
 * - ❌ NO tenemos adaptadores HTTP outbound en este proyecto
 * - ✅ Solo tenemos InMemoryGreetingRepository (no es externo)
 * - ⚠️ Estos tests están deshabilitados (describe.skip)
 *
 * CUÁNDO ACTIVAR ESTOS TESTS:
 * Cuando agregues un adaptador que consuma una API externa, por ejemplo:
 * - Cliente para servicio de clima
 * - Cliente para autenticación OAuth externa
 * - Cliente para servicio de pagos
 * - Cliente para servicio de notificaciones
 *
 * FLUJO (si se activara):
 * 1. Nuestro cliente HTTP define expectativas de la API externa (este test)
 * 2. Se genera archivo pact con el contrato
 * 3. Se publica al Pact Broker
 * 4. El provider externo verifica que cumple el contrato
 */
describe.skip("Pact Consumer - HTTP Outbound Adapter (Educational Example)", () => {
  const MOCK_SERVER_PORT = 5056;
  const provider = new Pact({
    consumer: "GreetingsAPI", // Nosotros (el consumidor)
    provider: "ExternalGreetingsService", // API externa que consumiríamos
    port: MOCK_SERVER_PORT,
    dir: path.resolve(process.cwd(), "pacts"),
    logLevel: "info",
  });
  const mockServerBaseUrl = `http://localhost:${MOCK_SERVER_PORT}`;
  let mockServerReady = false;

  beforeAll(async () => {
    try {
      await provider.setup();
      mockServerReady = true;
    } catch {
      mockServerReady = false;
      // eslint-disable-next-line no-console
      console.log(
        "⚠️  Pact mock server setup failed. This is expected - it's an educational example."
      );
      // eslint-disable-next-line no-console
      console.log(
        "   Enable this test when you implement HTTP outbound adapters."
      );
    }
  });

  afterAll(async () => {
    try {
      await provider.finalize();
    } catch {
      // Silently ignore finalize errors
    }
  });

  /**
   * EJEMPLO: Test de adaptador HTTP outbound para endpoint v1
   *
   * En un escenario real, esto probaría:
   * - Un cliente HTTP que consume /api/v1/greetings de un servicio externo
   * - El adaptador mapea la respuesta externa a una entidad de dominio
   * - Se valida el contrato esperado de la API externa
   */
  describe("GET /api/v1/greetings - Outbound Adapter Example", () => {
    beforeAll(async () => {
      if (!mockServerReady) return;

      // Define el contrato esperado de la API externa
      await provider.addInteraction({
        state: "default greeting exists",
        uponReceiving: "a request for greeting v1 from external service",
        withRequest: {
          method: "GET",
          path: "/api/v1/greetings",
        },
        willRespondWith: {
          status: 200,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
          body: {
            message: "Hello World!",
          },
        },
      });
    });

    it("should consume external API and map to domain entity", async () => {
      if (!mockServerReady) {
        // eslint-disable-next-line no-console
        console.log("   Skipping - this is an educational example");
        return;
      }

      // EJEMPLO: Esto simularía el uso de un adaptador HTTP outbound
      // En producción, esto sería:
      // const client = new ExternalGreetingApiClient(mockServerBaseUrl);
      // const greeting = await client.getGreeting();
      // expect(greeting).toBeInstanceOf(Greeting);

      const response = await fetch(`${mockServerBaseUrl}/api/v1/greetings`);
      const data = await response.json();

      // Validaciones del contrato
      expect(response.status).toBe(200);
      expect(data).toHaveProperty("message");
      expect(data.message).toBe("Hello World!");

      // Verifica que el mock server recibió la request esperada
      await provider.verify();
    });
  });

  /**
   * EJEMPLO: Test de adaptador HTTP outbound para endpoint v2
   *
   * Muestra cómo probar un adaptador que consume una versión mejorada de la API
   */
  describe("GET /api/v2/greetings - Enhanced Outbound Adapter Example", () => {
    beforeAll(async () => {
      if (!mockServerReady) return;

      // Define contrato para API v2 con campos adicionales
      await provider.addInteraction({
        state: "default greeting exists",
        uponReceiving: "a request for greeting v2 from external service",
        withRequest: {
          method: "GET",
          path: "/api/v2/greetings",
        },
        willRespondWith: {
          status: 200,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
          body: {
            message: "Hello World!",
            timestamp: "2024-01-01T00:00:00.000Z",
            version: "2.0",
          },
        },
      });
    });

    it("should consume enhanced API with additional fields", async () => {
      if (!mockServerReady) {
        // eslint-disable-next-line no-console
        console.log("   Skipping - this is an educational example");
        return;
      }

      // EJEMPLO: Adaptador consumiendo API v2
      // const client = new ExternalGreetingApiClient(mockServerBaseUrl);
      // const greeting = await client.getEnhancedGreeting();

      const response = await fetch(`${mockServerBaseUrl}/api/v2/greetings`);
      const data = await response.json();

      // Validaciones del contrato v2
      expect(response.status).toBe(200);
      expect(data).toHaveProperty("message");
      expect(data).toHaveProperty("timestamp");
      expect(data).toHaveProperty("version");
      expect(data.version).toBe("2.0");

      // El adaptador debería mapear esto a una entidad de dominio:
      // expect(greeting.getMessage().value).toBe("Hello World!");
      // expect(greeting.getTimestamp()).toBeInstanceOf(Date);

      await provider.verify();
    });
  });

  /**
   * EJEMPLO CONCEPTUAL: Cómo sería un test real
   *
   * Si implementaras un adaptador real para consumir una API de clima:
   */
  describe("Weather API Client Example (Conceptual)", () => {
    it("would test the HTTP outbound adapter for weather service", () => {
      /*
       * Ejemplo de cómo probarías un adaptador HTTP outbound real:
       *
       * // 1. Setup del contrato
       * await provider.addInteraction({
       *   state: "weather data exists for Madrid",
       *   uponReceiving: "request for Madrid weather",
       *   withRequest: {
       *     method: "GET",
       *     path: "/weather",
       *     query: { city: "Madrid" }
       *   },
       *   willRespondWith: {
       *     status: 200,
       *     body: { temperature: 25, humidity: 60, condition: "sunny" }
       *   }
       * });
       *
       * // 2. Usar el adaptador HTTP outbound
       * const weatherClient = new WeatherApiClient(
       *   provider.mockService.baseUrl,
       *   httpClient
       * );
       * const weather = await weatherClient.getWeather("Madrid");
       *
       * // 3. Validar que el adaptador mapea correctamente a dominio
       * expect(weather).toBeInstanceOf(Weather);
       * expect(weather.temperature).toBe(25);
       * expect(weather.condition).toBe("sunny");
       *
       * // 4. Verificar el contrato
       * await provider.verify();
       *
       * Este test garantizaría que:
       * - El adaptador HTTP outbound cumple el contrato de la API externa
       * - El mapeo de respuesta externa → entidad de dominio funciona
       * - Los cambios en la API externa romperían el contrato
       */

      expect(true).toBe(true); // Placeholder para ejemplo conceptual
    });
  });
});

/**
 * NOTAS PARA IMPLEMENTACIÓN FUTURA:
 *
 * 1. UBICACIÓN DEL ADAPTADOR:
 *    src/@contexts/{context}/infrastructure/clients/
 *    src/@contexts/{context}/infrastructure/adapters/http/
 *
 * 2. ESTRUCTURA DEL ADAPTADOR:
 *    ```typescript
 *    export class ExternalApiClient implements IExternalService {
 *      constructor(
 *        private readonly baseUrl: string,
 *        private readonly httpClient: HttpClient
 *      ) {}
 *
 *      async fetchData(): Promise<DomainEntity> {
 *        const response = await this.httpClient.get(`${this.baseUrl}/endpoint`);
 *        return Mapper.toDomain(response.data);
 *      }
 *    }
 *    ```
 *
 * 3. MAPPERS:
 *    Siempre mapea respuestas externas a entidades de dominio:
 *    ```typescript
 *    export const ExternalApiMapper = {
 *      toDomain(externalData: ExternalDto): DomainEntity {
 *        return DomainEntity.create(
 *          externalData.id,
 *          ValueObject.create(externalData.value)
 *        );
 *      }
 *    };
 *    ```
 *
 * 4. DEPENDENCY INJECTION:
 *    Registra el adaptador en el contenedor:
 *    ```typescript
 *    container.register({
 *      externalApiClient: asClass(ExternalApiClient).singleton(),
 *    });
 *    ```
 *
 * 5. ACTIVAR TESTS:
 *    - Remueve el `.skip` del describe
 *    - Implementa el adaptador real
 *    - Actualiza los tests para usar tu adaptador
 *    - Publica pacts al Pact Broker
 */
