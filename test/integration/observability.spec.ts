import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { buildApp } from "@app/server/app";
import { FastifyInstance } from "fastify";

describe("Observability Endpoints", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("GET /health", () => {
    it("should return ok status (legacy endpoint)", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/health",
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body).toHaveProperty("status", "ok");
      expect(body).toHaveProperty("timestamp");
      expect(body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it("should have proper content-type", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/health",
      });

      expect(response.headers["content-type"]).toContain("application/json");
    });
  });

  describe("GET /health/live", () => {
    it("should return alive status", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/health/live",
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body).toHaveProperty("status", "alive");
      expect(body).toHaveProperty("timestamp");
      expect(body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it("should have proper content-type", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/health/live",
      });

      expect(response.headers["content-type"]).toContain("application/json");
    });
  });

  describe("GET /health/ready", () => {
    it("should return ready status with checks", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/health/ready",
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body).toHaveProperty("status", "ready");
      expect(body).toHaveProperty("checks");
      expect(body).toHaveProperty("timestamp");
      expect(Array.isArray(body.checks)).toBe(true);
      expect(body.checks.length).toBeGreaterThan(0);
    });

    it("should include memory check", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/health/ready",
      });

      const body = response.json();
      const memoryCheck = body.checks.find((c: any) => c.name === "memory");
      expect(memoryCheck).toBeDefined();
      expect(memoryCheck.status).toBe("healthy");
      expect(memoryCheck).toHaveProperty("responseTime");
      expect(memoryCheck).toHaveProperty("message");
      expect(memoryCheck.message).toContain("Heap used:");
    });

    it("should have proper content-type", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/health/ready",
      });

      expect(response.headers["content-type"]).toContain("application/json");
    });

    it("should return timestamp in ISO format", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/health/ready",
      });

      const body = response.json();
      expect(body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(() => new Date(body.timestamp)).not.toThrow();
    });
  });

  describe("GET /metrics", () => {
    it("should return Prometheus metrics", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/metrics",
      });

      expect(response.statusCode).toBe(200);
      expect(response.body).toContain("# HELP http_request_duration_seconds");
      expect(response.body).toContain("# TYPE http_request_duration_seconds histogram");
      expect(response.body).toContain("# HELP http_requests_total");
      expect(response.body).toContain("# TYPE http_requests_total counter");
    });

    it("should have proper content-type for Prometheus", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/metrics",
      });

      expect(response.headers["content-type"]).toContain("text/plain");
    });

    it("should track metrics for requests", async () => {
      // Make some requests
      await app.inject({ method: "GET", url: "/api/v1/greetings" });
      await app.inject({ method: "GET", url: "/api/v2/greetings" });

      const response = await app.inject({
        method: "GET",
        url: "/metrics",
      });

      expect(response.body).toContain("http_requests_total");
      expect(response.body).toContain("/api/v1/greetings");
      expect(response.body).toContain("/api/v2/greetings");
    });
  });
});
