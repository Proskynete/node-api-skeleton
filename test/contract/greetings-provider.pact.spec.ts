/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable no-console */
/* eslint-disable vitest/expect-expect */

import { buildApp } from "@app/server/app";
import { Verifier, VerifierOptions } from "@pact-foundation/pact";
import { FastifyInstance } from "fastify";
import path from "path";
import { afterAll, beforeAll, describe, it } from "vitest";

/**
 * Pact Provider Verification Tests - HTTP Inbound Adapter
 *
 * ARQUITECTURA HEXAGONAL:
 * Estos tests validan el ADAPTADOR HTTP INBOUND (infrastructure layer)
 * que expone nuestra API a consumidores externos.
 *
 * COMPONENTES PROBADOS:
 * - @contexts/greetings/infrastructure/http/v1/controllers/GreetingController.ts
 * - @contexts/greetings/infrastructure/http/v2/controllers/GreetingController.ts
 * - @contexts/greetings/infrastructure/http/v*\/routes/greeting.routes.ts
 *
 * QUE VALIDA:
 * - Los endpoints HTTP cumplen con los contratos establecidos por consumidores
 * - El adaptador HTTP Inbound transforma correctamente las respuestas
 * - Los controllers retornan los DTOs esperados
 *
 * QUE NO VALIDA:
 * - Logica de negocio (domain layer)
 * - Casos de uso (application layer)
 * - Repositorios (infrastructure/persistence)
 *
 * FLUJO:
 * 1. Consumidor externo define contrato (pact file)
 * 2. Este test verifica que nuestro adaptador HTTP cumple ese contrato
 * 3. Valida endpoints: /api/v1/greetings, /api/v2/greetings
 *
 * En produccion:
 * - Consumidor publica pact al Pact Broker
 * - Provider (nosotros) descarga y verifica contratos
 * - Resultados se publican de vuelta al Broker
 */
describe("Pact Provider - HTTP Inbound Adapter (Controllers)", () => {
  let app: FastifyInstance;
  const PORT = 5055; // Different port to avoid conflicts

  beforeAll(async () => {
    // Levanta el adaptador HTTP inbound completo (Fastify + Controllers)
    app = await buildApp();
    await app.listen({ port: PORT });
  });

  afterAll(async () => {
    await app.close();
  });

  it("should verify HTTP inbound adapter fulfills consumer contracts", async () => {
    const opts: VerifierOptions = {
      provider: "GreetingsAPI",
      providerBaseUrl: `http://localhost:${PORT}`,

      // En producción, se obtienen pacts del Pact Broker:
      // pactBrokerUrl: 'https://your-pact-broker.com',
      // pactBrokerToken: process.env.PACT_BROKER_TOKEN,

      // Para este ejemplo, usamos archivos pact locales
      // (Estos serían generados por los tests del consumidor)
      pactUrls: [
        path.resolve(__dirname, "../../pacts/webapp-greetingsapi.json"),
      ],

      // State handlers: Preparan el sistema para escenarios específicos
      // En Arquitectura Hexagonal, esto puede implicar:
      // - Configurar repositorios con datos de prueba
      // - Establecer estado de servicios externos
      // - Preparar autenticación/autorización
      stateHandlers: {
        "the API is healthy": async () => {
          // Setup: Asegurar que la API está en estado saludable
          // En este caso, solo necesitamos que el app esté corriendo
          return Promise.resolve();
        },
        "default greeting exists": async () => {
          // Setup: Asegurar que existe un greeting por defecto
          // Nuestro InMemoryGreetingRepository siempre tiene datos
          // En producción, esto podría sembrar una base de datos
          return Promise.resolve();
        },
      },

      // Request filters: Permiten añadir headers, autenticación, etc.
      // Útil para agregar tokens, API keys, headers personalizados
      requestFilter: (req, res, next) => {
        // Ejemplo: Agregar headers de autenticación
        // req.headers['Authorization'] = 'Bearer test-token';
        // req.headers['X-API-Key'] = 'test-api-key';
        next();
      },

      // Publicar resultados de verificación (en CI/CD)
      publishVerificationResult: process.env.CI === "true",
      providerVersion: process.env.GIT_COMMIT || "dev",
      providerVersionTags: process.env.GIT_BRANCH
        ? [process.env.GIT_BRANCH]
        : ["dev"],
    };

    // NOTA: Este test se omite si el archivo pact no existe
    // Esto es comportamiento esperado para el skeleton/template
    // En producción, el pact vendría del Pact Broker
    const pactFile = path.resolve(
      __dirname,
      "../../pacts/webapp-greetingsapi.json"
    );
    const fs = await import("fs");
    if (!fs.existsSync(pactFile)) {
      console.log("⚠️  Pact file not found. Skipping provider verification.");
      console.log(
        "   This is expected for the skeleton. Consumer pacts would be published to Pact Broker."
      );
      console.log(
        "   This test validates the HTTP Inbound Adapter (infrastructure/http/controllers)."
      );
      return;
    }

    // Ejecuta la verificación del contrato
    // Esto hace requests HTTP reales al adaptador y verifica las respuestas
    const verifier = new Verifier(opts);
    await verifier.verifyProvider();
  }, 30000); // Increased timeout for verification
});
