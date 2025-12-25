import { buildApp } from "@app/server/app";
import { FastifyInstance } from "fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

/**
 * E2E Tests - Health Checks
 * Tests complete health check workflows for production monitoring
 */

interface HealthResponse {
  status: string;
  timestamp: string;
}

interface HealthCheck {
  name: string;
  status: string;
  responseTime: number;
  message?: string;
}

interface ReadinessResponse {
  status: string;
  checks: HealthCheck[];
  timestamp: string;
}

describe("E2E - Health Checks Workflow", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("Liveness Probe Workflow", () => {
    it("should complete a full liveness check workflow", async () => {
      // Simulate Kubernetes liveness probe
      const response = await app.inject({
        method: "GET",
        url: "/health/live",
      });

      // Step 1: Verify response status
      expect(response.statusCode).toBe(200);

      // Step 2: Verify response structure
      const body = response.json<HealthResponse>();
      expect(body).toHaveProperty("status");
      expect(body).toHaveProperty("timestamp");

      // Step 3: Verify response values
      expect(body.status).toBe("alive");
      expect(typeof body.timestamp).toBe("string");

      // Step 4: Verify timestamp is recent (within last 5 seconds)
      const timestamp = new Date(body.timestamp);
      const now = new Date();
      const diffMs = now.getTime() - timestamp.getTime();
      expect(diffMs).toBeLessThan(5000);
    });

    it("should respond quickly to liveness probes", async () => {
      const start = Date.now();

      const response = await app.inject({
        method: "GET",
        url: "/health/live",
      });

      const duration = Date.now() - start;

      expect(response.statusCode).toBe(200);
      // Liveness checks should be very fast (< 100ms)
      expect(duration).toBeLessThan(100);
    });

    it("should handle multiple concurrent liveness checks", async () => {
      const requests = Array.from({ length: 10 }, () =>
        app.inject({
          method: "GET",
          url: "/health/live",
        })
      );

      const responses = await Promise.all(requests);

      responses.forEach((response) => {
        expect(response.statusCode).toBe(200);
        const body = response.json<HealthResponse>();
        expect(body.status).toBe("alive");
      });
    });
  });

  describe("Readiness Probe Workflow", () => {
    it("should complete a full readiness check workflow", async () => {
      // Simulate Kubernetes readiness probe
      const response = await app.inject({
        method: "GET",
        url: "/health/ready",
      });

      // Step 1: Verify response status
      expect(response.statusCode).toBe(200);

      // Step 2: Verify response structure
      const body = response.json<ReadinessResponse>();
      expect(body).toHaveProperty("status");
      expect(body).toHaveProperty("checks");
      expect(body).toHaveProperty("timestamp");

      // Step 3: Verify checks array
      expect(Array.isArray(body.checks)).toBe(true);
      expect(body.checks.length).toBeGreaterThan(0);

      // Step 4: Verify each check structure
      body.checks.forEach((check) => {
        expect(check).toHaveProperty("name");
        expect(check).toHaveProperty("status");
        expect(check).toHaveProperty("responseTime");
        expect(typeof check.name).toBe("string");
        expect(["healthy", "unhealthy"]).toContain(check.status);
        expect(typeof check.responseTime).toBe("number");
      });

      // Step 5: Verify overall status
      expect(body.status).toBe("ready");

      // Step 6: Verify all checks are healthy
      const allHealthy = body.checks.every((c) => c.status === "healthy");
      expect(allHealthy).toBe(true);
    });

    it("should include memory check in readiness", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/health/ready",
      });

      expect(response.statusCode).toBe(200);

      const body = response.json<ReadinessResponse>();
      const memoryCheck = body.checks.find((c) => c.name === "memory");

      expect(memoryCheck).toBeDefined();
      expect(memoryCheck?.status).toBe("healthy");
      expect(memoryCheck?.message).toContain("Heap used:");
    });

    it("should handle multiple concurrent readiness checks", async () => {
      const requests = Array.from({ length: 5 }, () =>
        app.inject({
          method: "GET",
          url: "/health/ready",
        })
      );

      const responses = await Promise.all(requests);

      responses.forEach((response) => {
        expect(response.statusCode).toBe(200);
        const body = response.json<ReadinessResponse>();
        expect(body.status).toBe("ready");
        expect(body.checks.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Legacy Health Endpoint Workflow", () => {
    it("should support legacy /health endpoint", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/health",
      });

      expect(response.statusCode).toBe(200);

      const body = response.json<HealthResponse>();
      expect(body).toHaveProperty("status");
      expect(body.status).toBe("ok");
      expect(body).toHaveProperty("timestamp");
    });
  });

  describe("Production Monitoring Workflow", () => {
    it("should simulate a complete monitoring workflow", async () => {
      // Step 1: Check if app is alive
      const livenessResponse = await app.inject({
        method: "GET",
        url: "/health/live",
      });
      expect(livenessResponse.statusCode).toBe(200);

      // Step 2: Check if app is ready to serve traffic
      const readinessResponse = await app.inject({
        method: "GET",
        url: "/health/ready",
      });
      expect(readinessResponse.statusCode).toBe(200);

      // Step 3: Verify app can serve actual requests
      const apiResponse = await app.inject({
        method: "GET",
        url: "/api/v1/greetings",
      });
      expect(apiResponse.statusCode).toBe(200);

      // Step 4: All checks passed - app is healthy and operational
      const livenessBody = livenessResponse.json<HealthResponse>();
      const readinessBody = readinessResponse.json<ReadinessResponse>();

      expect(livenessBody.status).toBe("alive");
      expect(readinessBody.status).toBe("ready");
    });
  });

  describe("Health Check Response Times", () => {
    it("should respond to health checks within acceptable time", async () => {
      const start = Date.now();

      await app.inject({
        method: "GET",
        url: "/health/live",
      });

      const liveDuration = Date.now() - start;

      const readyStart = Date.now();

      await app.inject({
        method: "GET",
        url: "/health/ready",
      });

      const readyDuration = Date.now() - readyStart;

      // Liveness should be very fast (< 50ms)
      expect(liveDuration).toBeLessThan(50);

      // Readiness can be slightly slower but still fast (< 200ms)
      expect(readyDuration).toBeLessThan(200);
    });
  });

  describe("Kubernetes-style Health Check Workflow", () => {
    it("should simulate Kubernetes probe sequence", async () => {
      // Kubernetes typically checks liveness first, then readiness

      // Initial liveness check on startup
      const liveness1 = await app.inject({
        method: "GET",
        url: "/health/live",
      });
      expect(liveness1.statusCode).toBe(200);

      // Readiness check before routing traffic
      const readiness1 = await app.inject({
        method: "GET",
        url: "/health/ready",
      });
      expect(readiness1.statusCode).toBe(200);

      // Periodic liveness checks (every 10s)
      const liveness2 = await app.inject({
        method: "GET",
        url: "/health/live",
      });
      expect(liveness2.statusCode).toBe(200);

      // Periodic readiness checks (every 5s)
      const readiness2 = await app.inject({
        method: "GET",
        url: "/health/ready",
      });
      expect(readiness2.statusCode).toBe(200);

      // All probes should succeed
      const livenessBody1 = liveness1.json<HealthResponse>();
      const livenessBody2 = liveness2.json<HealthResponse>();
      const readinessBody1 = readiness1.json<ReadinessResponse>();
      const readinessBody2 = readiness2.json<ReadinessResponse>();

      expect(livenessBody1.status).toBe("alive");
      expect(livenessBody2.status).toBe("alive");
      expect(readinessBody1.status).toBe("ready");
      expect(readinessBody2.status).toBe("ready");
    });
  });
});
