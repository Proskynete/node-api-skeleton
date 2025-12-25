import { buildApp } from "@app/server/app";
import { FastifyInstance } from "fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

/**
 * E2E Tests - Observability
 * Tests complete observability workflows (metrics, documentation)
 */

describe("E2E - Observability Workflow", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("Prometheus Metrics Workflow", () => {
    it("should complete a full metrics collection workflow", async () => {
      // Step 1: Make some requests to generate metrics
      await app.inject({ method: "GET", url: "/api/v1/greetings" });
      await app.inject({ method: "GET", url: "/api/v2/greetings" });
      await app.inject({ method: "GET", url: "/health/live" });

      // Step 2: Fetch metrics
      const metricsResponse = await app.inject({
        method: "GET",
        url: "/metrics",
      });

      // Step 3: Verify response
      expect(metricsResponse.statusCode).toBe(200);
      expect(metricsResponse.headers["content-type"]).toContain("text/plain");

      // Step 4: Verify metrics content
      const metricsText = metricsResponse.body;
      expect(typeof metricsText).toBe("string");
      expect(metricsText.length).toBeGreaterThan(0);

      // Step 5: Verify key custom metrics are present
      expect(metricsText).toContain("http_request_duration_seconds");
      expect(metricsText).toContain("http_requests_total");
    });

    it("should track request counts in metrics", async () => {
      // Make initial metrics call to get baseline
      const initialResponse = await app.inject({
        method: "GET",
        url: "/metrics",
      });
      const initialMetrics = initialResponse.body;

      // Make several API requests
      await app.inject({ method: "GET", url: "/api/v1/greetings" });
      await app.inject({ method: "GET", url: "/api/v1/greetings" });
      await app.inject({ method: "GET", url: "/api/v2/greetings" });

      // Get updated metrics
      const updatedResponse = await app.inject({
        method: "GET",
        url: "/metrics",
      });
      const updatedMetrics = updatedResponse.body;

      // Verify metrics were updated
      expect(updatedMetrics).not.toBe(initialMetrics);
      expect(updatedMetrics).toContain("http_requests_total");
    });

    it("should expose HTTP metrics in Prometheus format", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/metrics",
      });

      const metrics = response.body;

      // Verify metrics are in Prometheus format
      expect(metrics).toContain("# HELP");
      expect(metrics).toContain("# TYPE");
      expect(metrics).toContain("http_request_duration_seconds");
      expect(metrics).toContain("http_requests_total");
    });
  });

  describe("OpenAPI Documentation Workflow", () => {
    it("should complete a full documentation access workflow", async () => {
      // Step 1: Access Swagger UI
      const swaggerResponse = await app.inject({
        method: "GET",
        url: "/docs",
      });

      // Step 2: Verify Swagger UI loads
      expect(swaggerResponse.statusCode).toBe(200);
      expect(swaggerResponse.headers["content-type"]).toContain("text/html");

      // Step 3: Verify it's the Swagger UI page
      const html = swaggerResponse.body;
      expect(html).toContain("swagger-ui");
    });

    it("should provide OpenAPI JSON specification", async () => {
      // Step 1: Request OpenAPI JSON
      const response = await app.inject({
        method: "GET",
        url: "/docs/json",
      });

      // Step 2: Verify response
      expect(response.statusCode).toBe(200);
      expect(response.headers["content-type"]).toContain("application/json");

      // Step 3: Parse and verify OpenAPI spec
      const spec = response.json<{
        openapi: string;
        info: { title: string; version: string };
        paths: Record<string, unknown>;
      }>();

      expect(spec).toHaveProperty("openapi");
      expect(spec).toHaveProperty("info");
      expect(spec).toHaveProperty("paths");

      // Step 4: Verify API info
      expect(spec.info.title).toBe("Node API Skeleton");
      expect(spec.info.version).toBe("2.0.0");

      // Step 5: Verify documented paths
      expect(spec.paths).toHaveProperty("/api/v1/greetings");
      expect(spec.paths).toHaveProperty("/api/v2/greetings");
      expect(spec.paths).toHaveProperty("/health/live");
      expect(spec.paths).toHaveProperty("/health/ready");
    });
  });

  describe("Complete Monitoring Workflow", () => {
    it("should simulate a production monitoring scenario", async () => {
      // Scenario: DevOps team sets up monitoring

      // Step 1: Configure Prometheus to scrape /metrics
      const metricsResponse = await app.inject({
        method: "GET",
        url: "/metrics",
      });
      expect(metricsResponse.statusCode).toBe(200);

      // Step 2: Set up health checks in load balancer
      const healthResponse = await app.inject({
        method: "GET",
        url: "/health/ready",
      });
      expect(healthResponse.statusCode).toBe(200);

      // Step 3: Generate some traffic
      await Promise.all([
        app.inject({ method: "GET", url: "/api/v1/greetings" }),
        app.inject({ method: "GET", url: "/api/v2/greetings" }),
        app.inject({ method: "GET", url: "/api/v1/greetings" }),
      ]);

      // Step 4: Prometheus scrapes metrics again
      const updatedMetricsResponse = await app.inject({
        method: "GET",
        url: "/metrics",
      });
      expect(updatedMetricsResponse.statusCode).toBe(200);

      // Step 5: Verify metrics show the requests
      const metrics = updatedMetricsResponse.body;
      expect(metrics).toContain("http_requests_total");

      // All monitoring endpoints working
      expect(metricsResponse.statusCode).toBe(200);
      expect(healthResponse.statusCode).toBe(200);
      expect(updatedMetricsResponse.statusCode).toBe(200);
    });
  });

  describe("Documentation Discovery Workflow", () => {
    it("should allow developers to discover API endpoints", async () => {
      // Step 1: Developer opens API docs
      const docsResponse = await app.inject({
        method: "GET",
        url: "/docs",
      });
      expect(docsResponse.statusCode).toBe(200);

      // Step 2: Developer fetches OpenAPI spec for tooling
      const specResponse = await app.inject({
        method: "GET",
        url: "/docs/json",
      });
      expect(specResponse.statusCode).toBe(200);

      const spec = specResponse.json<{
        paths: Record<string, unknown>;
        tags?: { name: string }[];
      }>();

      // Step 3: Verify all endpoints are documented
      expect(spec.paths).toHaveProperty("/api/v1/greetings");
      expect(spec.paths).toHaveProperty("/api/v2/greetings");
      expect(spec.paths).toHaveProperty("/health/live");
      expect(spec.paths).toHaveProperty("/health/ready");
      expect(spec.paths).toHaveProperty("/metrics");

      // Step 4: Verify tags for organization
      expect(spec.tags).toBeDefined();
      expect(Array.isArray(spec.tags)).toBe(true);
    });
  });

  describe("Metrics Scraping Reliability", () => {
    it("should handle concurrent metrics requests", async () => {
      // Simulate multiple Prometheus instances scraping
      const requests = Array.from({ length: 5 }, () =>
        app.inject({
          method: "GET",
          url: "/metrics",
        })
      );

      const responses = await Promise.all(requests);

      // All requests should succeed
      responses.forEach((response) => {
        expect(response.statusCode).toBe(200);
        expect(response.headers["content-type"]).toContain("text/plain");
        expect(response.body.length).toBeGreaterThan(0);
      });
    });

    it("should respond quickly to metrics requests", async () => {
      const start = Date.now();

      const response = await app.inject({
        method: "GET",
        url: "/metrics",
      });

      const duration = Date.now() - start;

      expect(response.statusCode).toBe(200);
      // Metrics endpoint should be fast (< 100ms)
      expect(duration).toBeLessThan(100);
    });
  });

  describe("End-to-End Observability Chain", () => {
    it("should trace a request through all observability layers", async () => {
      // Step 1: Make a request (generates logs)
      const apiResponse = await app.inject({
        method: "GET",
        url: "/api/v1/greetings",
      });
      expect(apiResponse.statusCode).toBe(200);

      // Step 2: Check that metrics were updated
      const metricsResponse = await app.inject({
        method: "GET",
        url: "/metrics",
      });
      expect(metricsResponse.statusCode).toBe(200);
      expect(metricsResponse.body).toContain("http_requests_total");

      // Step 3: Verify health checks still work
      const healthResponse = await app.inject({
        method: "GET",
        url: "/health/ready",
      });
      expect(healthResponse.statusCode).toBe(200);

      // Step 4: Verify documentation is still accessible
      const docsResponse = await app.inject({
        method: "GET",
        url: "/docs/json",
      });
      expect(docsResponse.statusCode).toBe(200);

      // Complete observability chain verified
      expect(apiResponse.statusCode).toBe(200);
      expect(metricsResponse.statusCode).toBe(200);
      expect(healthResponse.statusCode).toBe(200);
      expect(docsResponse.statusCode).toBe(200);
    });
  });
});
