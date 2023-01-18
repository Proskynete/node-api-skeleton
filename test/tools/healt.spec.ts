import request from "supertest";

import app from "../../src/app";

describe("/health", () => {
  describe("GET:", () => {
    it("should return 200 OK", async () => {
      const response = await request(app).get("/health");
      expect(response.statusCode).toEqual(200);
    });
  });
});
