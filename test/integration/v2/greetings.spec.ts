import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { FastifyInstance } from "fastify";
import { buildApp } from "@app/server/app";

describe("GET /api/v2/greetings", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should return a greeting message with timestamp and version", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/v2/greetings",
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body).toHaveProperty("message");
    expect(body).toHaveProperty("timestamp");
    expect(body).toHaveProperty("version");
    expect(body.message).toBe("Hello World!");
    expect(body.version).toBe("2.0");
  });

  it("should return timestamp in ISO format", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/v2/greetings",
    });

    const body = response.json();
    expect(body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    expect(() => new Date(body.timestamp)).not.toThrow();
  });

  it("should have proper content-type", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/v2/greetings",
    });

    expect(response.headers["content-type"]).toContain("application/json");
  });

  it("should return valid JSON structure with all required fields", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/v2/greetings",
    });

    const body = response.json();
    expect(body).toHaveProperty("message");
    expect(body).toHaveProperty("timestamp");
    expect(body).toHaveProperty("version");
    expect(typeof body.message).toBe("string");
    expect(typeof body.timestamp).toBe("string");
    expect(typeof body.version).toBe("string");
    expect(body.message.length).toBeGreaterThan(0);
  });
});
