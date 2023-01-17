import request from "supertest";

import app from "../src/app";
import { config } from "../src/config";
import mockResponse from "./__mocks__/hello.response.json";

request.agent(app.listen());

describe("GET /", () => {
  it("should return 200 OK", async () => {
    const response = await request(app).get(`${config.base_url}/hello`);

    expect(response.body).toEqual(mockResponse);
    expect(response.statusCode).toEqual(200);
  });
});
