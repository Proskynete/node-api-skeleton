import request from "supertest";

import app from "../../src/app";
import { EStatusCode } from "../../src/models/status_code";

describe("/health", () => {
  describe("GET:", () => {
    test("should return 200 OK", async () => {
      const response = await request(app).get("/health");
      expect(response.statusCode).toEqual(EStatusCode.OK);
    });
  });
});
