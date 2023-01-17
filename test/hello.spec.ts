import request from "supertest";
import { config } from "../src/config";
import app from "../src/server";
import mockResponse from "./__mocks__/hello.response.json"

describe("GET /", () => {
  it("should return 200 OK", async () => {
    const response = await request(app).get(`${config.base_url}/hello`);

    expect(response.body).toEqual(mockResponse);
    expect(response.statusCode).toEqual(200);
  });
});