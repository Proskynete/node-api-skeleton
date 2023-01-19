import { HelloService } from "../../src/services/hello";
import mockResponse from "../__mocks__/hello.response.json";

describe("HelloService", () => {
  test("should return 'Hello World!'", async () => {
    const result = await HelloService();
    expect(result).toEqual(mockResponse);
  });
});
