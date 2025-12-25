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
 * Pact Provider Verification Tests
 *
 * These tests verify that our API (the provider) fulfills the contract
 * established with consumers.
 *
 * In a real scenario:
 * 1. Consumer publishes pact file to Pact Broker
 * 2. Provider retrieves and verifies against pact
 * 3. Results are published back to Pact Broker
 *
 * This example demonstrates local verification without a Pact Broker.
 */
describe("Pact Provider Verification - Greetings API", () => {
  let app: FastifyInstance;
  const PORT = 5055; // Different port to avoid conflicts

  beforeAll(async () => {
    app = await buildApp();
    await app.listen({ port: PORT });
  });

  afterAll(async () => {
    await app.close();
  });

  it("should validate the contract with consumer expectations", async () => {
    const opts: VerifierOptions = {
      provider: "GreetingsAPI",
      providerBaseUrl: `http://localhost:${PORT}`,

      // In production, you would fetch pacts from a Pact Broker:
      // pactBrokerUrl: 'https://your-pact-broker.com',
      // pactBrokerToken: process.env.PACT_BROKER_TOKEN,

      // For this example, we'll use local pact files
      // (These would be created by consumer tests)
      pactUrls: [
        path.resolve(__dirname, "../../pacts/consumer-greetingsapi.json"),
      ],

      // State handlers for provider states
      stateHandlers: {
        "the API is healthy": async () => {
          // Setup: Ensure the API is in a healthy state
          return Promise.resolve();
        },
        "default greeting exists": async () => {
          // Setup: Ensure default greeting data exists
          return Promise.resolve();
        },
      },

      // Request filters to add headers, auth, etc.
      requestFilter: (req, res, next) => {
        // Add any required headers
        // req.headers['Authorization'] = 'Bearer token';
        next();
      },

      // Publish verification results (in production)
      publishVerificationResult: process.env.CI === "true",
      providerVersion: process.env.GIT_COMMIT || "dev",
      providerVersionTags: process.env.GIT_BRANCH
        ? [process.env.GIT_BRANCH]
        : ["dev"],
    };

    // NOTE: This test will be skipped if pact file doesn't exist
    // This is expected behavior for the skeleton template
    const pactFile = path.resolve(
      __dirname,
      "../../pacts/consumer-greetingsapi.json"
    );
    const fs = await import("fs");
    if (!fs.existsSync(pactFile)) {
      console.log("⚠️  Pact file not found. Skipping provider verification.");
      console.log(
        "   This is expected for the skeleton. Create consumer pacts to run this test."
      );
      return;
    }

    const verifier = new Verifier(opts);
    await verifier.verifyProvider();
  }, 30000); // Increased timeout for verification
});
