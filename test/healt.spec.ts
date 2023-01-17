import request from "supertest";

import app from "../src/server";

describe("GET /health", () => {
  it("should return 200 OK", async () => {
    const response = await request(app).get("/health");
    expect(response.statusCode).toEqual(200);
  });
});
