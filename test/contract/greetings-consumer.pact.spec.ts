/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/await-thenable */

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
 */
describe("Pact Consumer - Greetings API Client", () => {
  const provider = new Pact({
    consumer: "WebApp",
    provider: "GreetingsAPI",
    port: 5056, // Mock server port
    log: path.resolve(process.cwd(), "logs", "pact.log"),
    dir: path.resolve(process.cwd(), "pacts"),
    logLevel: "info",
  });

  beforeAll(async () => {
    await provider.setup();
  });

  afterAll(async () => {
    await provider.finalize();
  });

  describe("GET /api/v1/greetings", () => {
    beforeAll(async () => {
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
      // This would be the actual client code that consumes the API
      const response = await fetch(
        `${provider.mockService.baseUrl}/api/v1/greetings`
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty("message");
      expect(data.message).toBe("Hello World!");

      await provider.verify();
    });
  });

  describe("GET /api/v2/greetings", () => {
    beforeAll(async () => {
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
      const response = await fetch(
        `${provider.mockService.baseUrl}/api/v2/greetings`
      );
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
