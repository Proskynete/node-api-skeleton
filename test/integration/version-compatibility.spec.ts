import { buildApp } from "@app/server/app";
import {
  V1GreetingResponse,
  V2GreetingResponse,
} from "@shared/types/http-responses";
import { FastifyInstance } from "fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

describe("Version Compatibility", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("v1 should return only message", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/greetings",
    });

    const body = response.json<V1GreetingResponse>();
    expect(response.statusCode).toBe(200);
    expect(body).toHaveProperty("message");
    expect(body).not.toHaveProperty("timestamp");
    expect(body).not.toHaveProperty("version");
  });

  it("v2 should return message, timestamp and version", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/v2/greetings",
    });

    const body = response.json<V2GreetingResponse>();
    expect(response.statusCode).toBe(200);
    expect(body).toHaveProperty("message");
    expect(body).toHaveProperty("timestamp");
    expect(body).toHaveProperty("version", "2.0");
  });

  it("both versions should work simultaneously", async () => {
    const [v1Response, v2Response] = await Promise.all([
      app.inject({ method: "GET", url: "/api/v1/greetings" }),
      app.inject({ method: "GET", url: "/api/v2/greetings" }),
    ]);

    expect(v1Response.statusCode).toBe(200);
    expect(v2Response.statusCode).toBe(200);
  });

  it("both versions should return same message content", async () => {
    const [v1Response, v2Response] = await Promise.all([
      app.inject({ method: "GET", url: "/api/v1/greetings" }),
      app.inject({ method: "GET", url: "/api/v2/greetings" }),
    ]);

    const v1Body = v1Response.json<V1GreetingResponse>();
    const v2Body = v2Response.json<V2GreetingResponse>();

    expect(v1Body.message).toBe(v2Body.message);
  });

  it("v1 response should be subset of v2 response", async () => {
    const [v1Response, v2Response] = await Promise.all([
      app.inject({ method: "GET", url: "/api/v1/greetings" }),
      app.inject({ method: "GET", url: "/api/v2/greetings" }),
    ]);

    const v1Body = v1Response.json<V1GreetingResponse>();
    const v2Body = v2Response.json<V2GreetingResponse>();

    // v2 should have all v1 properties plus extras
    expect(v2Body).toMatchObject(v1Body);
    expect(Object.keys(v2Body).length).toBeGreaterThan(
      Object.keys(v1Body).length
    );
  });

  it("both versions should return correct content-type", async () => {
    const [v1Response, v2Response] = await Promise.all([
      app.inject({ method: "GET", url: "/api/v1/greetings" }),
      app.inject({ method: "GET", url: "/api/v2/greetings" }),
    ]);

    expect(v1Response.headers["content-type"]).toContain("application/json");
    expect(v2Response.headers["content-type"]).toContain("application/json");
  });
});
