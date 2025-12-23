import request from "supertest";

import app from "../../src/app";
import { config } from "../../src/config";
import { EStatusCode } from "../../src/models/status_code";
import mockResponse from "../__mocks__/hello.response.json";

describe(`${config.base_url}/hello`, () => {
  const url = `${config.base_url}/hello`;

  describe("GET: ", () => {
    test("should return 200 OK", async () => {
      const response = await request(app).get(url);
      expect(response.body).toEqual(mockResponse);
      expect(response.statusCode).toEqual(EStatusCode.OK);
    });

    test("should return 500 internal server error", async () => {
      await request(app)
        .get(url)
        .catch((error) => {
          expect(error).toBeDefined();
          expect(error.status).toEqual(EStatusCode.INTERNAL_SERVER_ERROR);
        });
    });
  });
});
