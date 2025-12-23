import request from "supertest";

import app from "../../../src/app";
import { EStatusCode } from "../../../src/models/status_code";
import mockResponse from "../__mocks__/open-api.json";

describe("/docs", () => {
  describe("GET:", () => {
    test("should return 301 OK", async () => {
      const response = await request(app).get("/docs");

      expect(response.statusCode).toEqual(EStatusCode.MOVED_PERMANENTLY);
    });
  });
});

describe("/docs.json", () => {
  test("should return 200 OK", async () => {
    const response = await request(app).get("/docs.json");

    expect(response.body).toEqual(mockResponse);
    expect(response.statusCode).toEqual(EStatusCode.OK);
  });
});
