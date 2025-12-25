import { buildApp } from "@app/server/app";
import { FastifyInstance } from "fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

/**
 * E2E Tests - API Workflow
 * Tests complete user workflows through the API
 */

interface V1GreetingResponse {
  message: string;
}

interface V2GreetingResponse {
  message: string;
  timestamp: string;
  version: string;
}

describe("E2E - API Workflow", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("Complete API v1 Workflow", () => {
    it("should complete a full v1 greeting request workflow", async () => {
      // Step 1: Make request to v1 endpoint
      const response = await app.inject({
        method: "GET",
        url: "/api/v1/greetings",
      });

      // Step 2: Verify response structure
      expect(response.statusCode).toBe(200);
      expect(response.headers["content-type"]).toContain("application/json");

      // Step 3: Verify response data
      const body = response.json<V1GreetingResponse>();
      expect(body).toHaveProperty("message");
      expect(typeof body.message).toBe("string");
      expect(body.message).toBe("Hello World!");

      // Step 4: Verify response doesn't have extra fields
      expect(body).not.toHaveProperty("timestamp");
      expect(body).not.toHaveProperty("version");
    });

    it("should handle multiple concurrent v1 requests", async () => {
      const requests = Array.from({ length: 5 }, () =>
        app.inject({
          method: "GET",
          url: "/api/v1/greetings",
        })
      );

      const responses = await Promise.all(requests);

      responses.forEach((response) => {
        expect(response.statusCode).toBe(200);
        const body = response.json<V1GreetingResponse>();
        expect(body.message).toBe("Hello World!");
      });
    });
  });

  describe("Complete API v2 Workflow", () => {
    it("should complete a full v2 greeting request workflow", async () => {
      // Step 1: Make request to v2 endpoint
      const response = await app.inject({
        method: "GET",
        url: "/api/v2/greetings",
      });

      // Step 2: Verify response structure
      expect(response.statusCode).toBe(200);
      expect(response.headers["content-type"]).toContain("application/json");

      // Step 3: Verify response data
      const body = response.json<V2GreetingResponse>();
      expect(body).toHaveProperty("message");
      expect(body).toHaveProperty("timestamp");
      expect(body).toHaveProperty("version");

      // Step 4: Verify data types and values
      expect(typeof body.message).toBe("string");
      expect(body.message).toBe("Hello World!");
      expect(typeof body.timestamp).toBe("string");
      expect(body.version).toBe("2.0");

      // Step 5: Verify timestamp is valid ISO format
      expect(() => new Date(body.timestamp)).not.toThrow();
      const timestamp = new Date(body.timestamp);
      expect(timestamp.getTime()).toBeLessThanOrEqual(Date.now());
    });

    it("should handle multiple concurrent v2 requests", async () => {
      const requests = Array.from({ length: 5 }, () =>
        app.inject({
          method: "GET",
          url: "/api/v2/greetings",
        })
      );

      const responses = await Promise.all(requests);

      responses.forEach((response) => {
        expect(response.statusCode).toBe(200);
        const body = response.json<V2GreetingResponse>();
        expect(body.message).toBe("Hello World!");
        expect(body.version).toBe("2.0");
        expect(body).toHaveProperty("timestamp");
      });
    });
  });

  describe("Cross-version Workflow", () => {
    it("should handle requests alternating between v1 and v2", async () => {
      // Simulate a client using both versions
      const v1Response1 = await app.inject({
        method: "GET",
        url: "/api/v1/greetings",
      });

      const v2Response1 = await app.inject({
        method: "GET",
        url: "/api/v2/greetings",
      });

      const v1Response2 = await app.inject({
        method: "GET",
        url: "/api/v1/greetings",
      });

      const v2Response2 = await app.inject({
        method: "GET",
        url: "/api/v2/greetings",
      });

      // Verify all responses are valid
      expect(v1Response1.statusCode).toBe(200);
      expect(v2Response1.statusCode).toBe(200);
      expect(v1Response2.statusCode).toBe(200);
      expect(v2Response2.statusCode).toBe(200);

      // Verify v1 responses have same structure
      const v1Body1 = v1Response1.json<V1GreetingResponse>();
      const v1Body2 = v1Response2.json<V1GreetingResponse>();
      expect(v1Body1).toEqual(v1Body2);

      // Verify v2 responses have enhanced structure
      const v2Body1 = v2Response1.json<V2GreetingResponse>();
      const v2Body2 = v2Response2.json<V2GreetingResponse>();
      expect(v2Body1.message).toBe(v2Body2.message);
      expect(v2Body1.version).toBe(v2Body2.version);
    });
  });

  describe("API Evolution Workflow", () => {
    it("should demonstrate backward compatibility", async () => {
      // Old client using v1
      const v1Response = await app.inject({
        method: "GET",
        url: "/api/v1/greetings",
      });

      // New client using v2
      const v2Response = await app.inject({
        method: "GET",
        url: "/api/v2/greetings",
      });

      // Both should work
      expect(v1Response.statusCode).toBe(200);
      expect(v2Response.statusCode).toBe(200);

      // Both should return the same core message
      const v1Body = v1Response.json<V1GreetingResponse>();
      const v2Body = v2Response.json<V2GreetingResponse>();
      expect(v1Body.message).toBe(v2Body.message);

      // v2 should have additional fields
      expect(Object.keys(v2Body).length).toBeGreaterThan(
        Object.keys(v1Body).length
      );
    });
  });

  describe("Non-existent Routes", () => {
    it("should return 404 for non-existent routes", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/v1/nonexistent",
      });

      expect(response.statusCode).toBe(404);
    });

    it("should return 404 for non-existent API version", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/v3/greetings",
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe("HTTP Methods", () => {
    it("should only accept GET for greeting endpoints", async () => {
      const methods = ["POST", "PUT", "DELETE", "PATCH"];

      for (const method of methods) {
        const response = await app.inject({
          method,
          url: "/api/v1/greetings",
        });

        expect(response.statusCode).toBe(404);
      }
    });
  });
});
