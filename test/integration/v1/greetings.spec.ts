import { buildApp } from "@app/server/app";
import { FastifyInstance } from "fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

interface V1Response {
  message: string;
}

describe("GET /api/v1/greetings", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should return a greeting message", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/greetings",
    });

    const body = response.json<V1Response>();
    expect(response.statusCode).toBe(200);
    expect(body).toHaveProperty("message");
    expect(body.message).toBe("Hello World!");
  });

  it("should have proper content-type", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/greetings",
    });

    expect(response.headers["content-type"]).toContain("application/json");
  });

  it("should return valid JSON structure", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/greetings",
    });

    const body = response.json<V1Response>();
    expect(body).toHaveProperty("message");
    expect(typeof body.message).toBe("string");
    expect(body.message.length).toBeGreaterThan(0);
  });
});
