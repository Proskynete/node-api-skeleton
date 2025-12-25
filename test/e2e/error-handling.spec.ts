import { buildApp } from "@app/server/app";
import { FastifyInstance } from "fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

/**
 * E2E Tests - Error Handling
 * Tests complete error handling workflows and edge cases
 */

interface ErrorResponse {
  error: string;
  message: string;
  requestId?: string;
  code?: string;
}

describe("E2E - Error Handling Workflow", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("404 Not Found Workflow", () => {
    it("should handle non-existent routes gracefully", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/v1/nonexistent",
      });

      expect(response.statusCode).toBe(404);

      const body = response.json<ErrorResponse>();
      expect(body).toHaveProperty("message");
      expect(body).toHaveProperty("error");
    });

    it("should handle non-existent API versions", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/v99/greetings",
      });

      expect(response.statusCode).toBe(404);
    });

    it("should handle completely invalid paths", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/this/does/not/exist/at/all",
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe("405 Method Not Allowed Workflow", () => {
    it("should handle POST on GET-only endpoints", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/greetings",
      });

      expect([404, 405]).toContain(response.statusCode);
    });

    it("should handle PUT on GET-only endpoints", async () => {
      const response = await app.inject({
        method: "PUT",
        url: "/api/v2/greetings",
      });

      expect([404, 405]).toContain(response.statusCode);
    });

    it("should handle DELETE on GET-only endpoints", async () => {
      const response = await app.inject({
        method: "DELETE",
        url: "/health/live",
      });

      expect([404, 405]).toContain(response.statusCode);
    });
  });

  describe("Malformed Request Workflow", () => {
    it("should handle requests with invalid headers", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/v1/greetings",
        headers: {
          "content-type": "invalid/type",
        },
      });

      // Should still work as GET doesn't require specific content-type
      expect(response.statusCode).toBe(200);
    });

    it("should handle requests with unusual but valid paths", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/v1/greetings/",
      });

      // Trailing slash might return 404 or redirect
      expect([200, 404]).toContain(response.statusCode);
    });
  });

  describe("Error Recovery Workflow", () => {
    it("should recover from errors and continue serving requests", async () => {
      // Make a request that causes an error
      const errorResponse = await app.inject({
        method: "GET",
        url: "/api/v1/nonexistent",
      });
      expect(errorResponse.statusCode).toBe(404);

      // Verify app still works after error
      const successResponse1 = await app.inject({
        method: "GET",
        url: "/api/v1/greetings",
      });
      expect(successResponse1.statusCode).toBe(200);

      // Make another error
      const errorResponse2 = await app.inject({
        method: "POST",
        url: "/api/v1/greetings",
      });
      expect([404, 405]).toContain(errorResponse2.statusCode);

      // Verify app still works
      const successResponse2 = await app.inject({
        method: "GET",
        url: "/api/v2/greetings",
      });
      expect(successResponse2.statusCode).toBe(200);
    });

    it("should handle rapid error scenarios", async () => {
      // Simulate rapid invalid requests
      const errorRequests = Array.from({ length: 10 }, (_, i) =>
        app.inject({
          method: "GET",
          url: `/api/v1/error${i}`,
        })
      );

      const errorResponses = await Promise.all(errorRequests);

      // All should return errors
      errorResponses.forEach((response) => {
        expect(response.statusCode).toBe(404);
      });

      // Verify app still works normally
      const successResponse = await app.inject({
        method: "GET",
        url: "/api/v1/greetings",
      });
      expect(successResponse.statusCode).toBe(200);
    });
  });

  describe("Edge Case Workflows", () => {
    it("should handle empty path segments", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api//greetings",
      });

      expect([200, 404]).toContain(response.statusCode);
    });

    it("should handle very long URLs", async () => {
      const longPath = "/api/v1/" + "a".repeat(1000);
      const response = await app.inject({
        method: "GET",
        url: longPath,
      });

      expect([404, 414]).toContain(response.statusCode);
    });

    it("should handle special characters in URLs", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/v1/greetings?test=<script>alert('xss')</script>",
      });

      // URL encoding should prevent XSS
      expect([200, 400, 404]).toContain(response.statusCode);
    });
  });

  describe("Concurrent Error Handling", () => {
    it("should handle mixed valid and invalid requests concurrently", async () => {
      const requests = [
        app.inject({ method: "GET", url: "/api/v1/greetings" }), // valid
        app.inject({ method: "GET", url: "/api/v1/invalid" }), // invalid
        app.inject({ method: "GET", url: "/api/v2/greetings" }), // valid
        app.inject({ method: "POST", url: "/api/v1/greetings" }), // invalid method
        app.inject({ method: "GET", url: "/health/live" }), // valid
        app.inject({ method: "GET", url: "/api/v99/test" }), // invalid version
      ];

      const responses = await Promise.all(requests);

      // Verify valid requests succeeded
      expect(responses[0].statusCode).toBe(200);
      expect(responses[2].statusCode).toBe(200);
      expect(responses[4].statusCode).toBe(200);

      // Verify invalid requests failed appropriately
      expect(responses[1].statusCode).toBe(404);
      expect([404, 405]).toContain(responses[3].statusCode);
      expect(responses[5].statusCode).toBe(404);
    });
  });

  describe("Error Response Consistency", () => {
    it("should return consistent error format", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/v1/nonexistent",
      });

      expect(response.statusCode).toBe(404);

      const body = response.json<ErrorResponse>();

      // Verify error response structure
      expect(body).toHaveProperty("message");
      expect(body).toHaveProperty("error");
      expect(typeof body.message).toBe("string");
      expect(typeof body.error).toBe("string");
    });
  });

  describe("Health Check Error Scenarios", () => {
    it("should maintain health checks even during errors", async () => {
      // Generate some errors
      await app.inject({ method: "GET", url: "/invalid/path" });
      await app.inject({ method: "POST", url: "/api/v1/greetings" });

      // Health checks should still work
      const livenessResponse = await app.inject({
        method: "GET",
        url: "/health/live",
      });
      expect(livenessResponse.statusCode).toBe(200);

      const readinessResponse = await app.inject({
        method: "GET",
        url: "/health/ready",
      });
      expect(readinessResponse.statusCode).toBe(200);
    });
  });

  describe("Graceful Degradation", () => {
    it("should demonstrate graceful degradation workflow", async () => {
      // Simulate various error conditions
      const scenarios = [
        { method: "GET" as const, url: "/api/v1/nonexistent" },
        { method: "POST" as const, url: "/api/v1/greetings" },
        { method: "GET" as const, url: "/api/v99/test" },
      ];

      // All should fail gracefully
      for (const scenario of scenarios) {
        const response = await app.inject(scenario);
        expect([400, 404, 405]).toContain(response.statusCode);
      }

      // Core functionality should still work
      const v1Response = await app.inject({
        method: "GET",
        url: "/api/v1/greetings",
      });
      expect(v1Response.statusCode).toBe(200);

      const v2Response = await app.inject({
        method: "GET",
        url: "/api/v2/greetings",
      });
      expect(v2Response.statusCode).toBe(200);

      const healthResponse = await app.inject({
        method: "GET",
        url: "/health/live",
      });
      expect(healthResponse.statusCode).toBe(200);
    });
  });

  describe("Production Error Scenarios", () => {
    it("should simulate production error handling workflow", async () => {
      // Scenario: Production receives various types of bad requests

      // Invalid API version from old client
      const oldClientResponse = await app.inject({
        method: "GET",
        url: "/api/v0/greetings",
      });
      expect(oldClientResponse.statusCode).toBe(404);

      // Typo in URL
      const typoResponse = await app.inject({
        method: "GET",
        url: "/api/v1/greeetings", // typo
      });
      expect(typoResponse.statusCode).toBe(404);

      // Wrong HTTP method
      const wrongMethodResponse = await app.inject({
        method: "DELETE",
        url: "/api/v1/greetings",
      });
      expect([404, 405]).toContain(wrongMethodResponse.statusCode);

      // Despite all errors, valid requests still work
      const validResponse = await app.inject({
        method: "GET",
        url: "/api/v1/greetings",
      });
      expect(validResponse.statusCode).toBe(200);

      // Health checks confirm system is stable
      const healthResponse = await app.inject({
        method: "GET",
        url: "/health/ready",
      });
      expect(healthResponse.statusCode).toBe(200);
    });
  });
});
