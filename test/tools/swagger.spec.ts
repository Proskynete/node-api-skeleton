import request from "supertest";

import app from "../../src/app";
import mockResponse from "../__mocks__/open-api.json";

describe("/docs", () => {
  describe("GET:", () => {
    it("should return 200 OK", async () => {
      const response = await request(app).get("/docs");

      expect(response.statusCode).toEqual(200);
    });
  });
});

describe("/docs.json", () => {
  it("should return 200 OK", async () => {
    const response = await request(app).get("/docs.json");

    expect(response.body).toEqual(mockResponse);
    expect(response.statusCode).toEqual(200);
  });
});
