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
 * Pact Provider Tests - HTTP Inbound Adapters
 *
 * Valida que los controllers HTTP cumplan con los contratos establecidos.
 * Para documentación completa, ver: docs/guides/contract-testing-provider.md
 */
describe("Pact Provider - HTTP Inbound Adapter (Controllers)", () => {
  let app: FastifyInstance;
  const PORT = 5055;

  beforeAll(async () => {
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
      pactUrls: [
        path.resolve(__dirname, "../../pacts/webapp-greetingsapi.json"),
      ],
      stateHandlers: {
        "the API is healthy": async () => {
          return Promise.resolve();
        },
        "default greeting exists": async () => {
          return Promise.resolve();
        },
      },
      requestFilter: (req, res, next) => {
        next();
      },
      publishVerificationResult: process.env.CI === "true",
      providerVersion: process.env.GIT_COMMIT || "dev",
      providerVersionTags: process.env.GIT_BRANCH
        ? [process.env.GIT_BRANCH]
        : ["dev"],
    };

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

    const verifier = new Verifier(opts);
    await verifier.verifyProvider();
  }, 30000);
});
