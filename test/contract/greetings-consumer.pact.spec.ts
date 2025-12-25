/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/await-thenable */
/* eslint-disable vitest/no-disabled-tests */

import { Pact } from "@pact-foundation/pact";
import path from "path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

/**
 * Pact Consumer Tests
 *
 * These tests define the contract from a consumer's perspective.
 * The consumer specifies what it expects from the provider (our API).
 *
 * When these tests run, they generate a pact file that describes
 * the expected interactions. This file is then used by the provider
 * to verify it meets the contract.
 *
 * NOTE: This is an example to demonstrate Pact usage.
 * In a real scenario, this would live in the consumer's codebase.
 * These tests are skipped by default as they require Pact Broker setup.
 */
describe.skip("Pact Consumer - Greetings API Client", () => {
  const MOCK_SERVER_PORT = 5056;
  const provider = new Pact({
    consumer: "WebApp",
    provider: "GreetingsAPI",
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
        "⚠️  Pact mock server setup failed. Skipping consumer tests."
      );
      // eslint-disable-next-line no-console
      console.log(
        "   This is expected for the skeleton. These are example tests."
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

  describe("GET /api/v1/greetings", () => {
    beforeAll(async () => {
      if (!mockServerReady) return;

      await provider.addInteraction({
        state: "default greeting exists",
        uponReceiving: "a request for greeting v1",
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

    it("should return a greeting message", async () => {
      if (!mockServerReady) {
        // eslint-disable-next-line no-console
        console.log("   Skipping test - mock server not ready");
        return;
      }

      // This would be the actual client code that consumes the API
      const response = await fetch(`${mockServerBaseUrl}/api/v1/greetings`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty("message");
      expect(data.message).toBe("Hello World!");

      await provider.verify();
    });
  });

  describe("GET /api/v2/greetings", () => {
    beforeAll(async () => {
      if (!mockServerReady) return;

      await provider.addInteraction({
        state: "default greeting exists",
        uponReceiving: "a request for greeting v2",
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

    it("should return greeting with timestamp and version", async () => {
      if (!mockServerReady) {
        // eslint-disable-next-line no-console
        console.log("   Skipping test - mock server not ready");
        return;
      }

      const response = await fetch(`${mockServerBaseUrl}/api/v2/greetings`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty("message");
      expect(data).toHaveProperty("timestamp");
      expect(data).toHaveProperty("version");
      expect(data.version).toBe("2.0");

      await provider.verify();
    });
  });
});
