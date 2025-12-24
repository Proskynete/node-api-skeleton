import { beforeEach, describe, expect, it } from "vitest";

import { Greeting } from "@contexts/greetings/domain/entities/Greeting";
import {
  greetingToDto,
  greetingToDomain,
  greetingsToDtos,
} from "@contexts/greetings/application/v1/mappers/GreetingMapper";

describe("GreetingMapper", () => {
  describe("greetingToDto", () => {
    it("should map Greeting entity to DTO", () => {
      const greeting = Greeting.create("Hello World");

      const dto = greetingToDto(greeting);

      expect(dto).toEqual({
        message: "Hello World",
      });
    });

    it("should be a pure function (same input = same output)", () => {
      const greeting = Greeting.create("Test");

      const dto1 = greetingToDto(greeting);
      const dto2 = greetingToDto(greeting);

      expect(dto1).toEqual(dto2);
    });
  });

  describe("greetingToDomain", () => {
    it("should create Greeting entity from text", () => {
      const greeting = greetingToDomain("Hello");

      expect(greeting).toBeInstanceOf(Greeting);
      expect(greeting.message).toBe("Hello");
    });

    it("should preserve message value", () => {
      const text = "Test Message";
      const greeting = greetingToDomain(text);

      expect(greeting.message).toBe(text);
    });
  });

  describe("greetingsToDtos", () => {
    it("should map array of entities to array of DTOs", () => {
      const greetings = [
        Greeting.create("First"),
        Greeting.create("Second"),
        Greeting.create("Third"),
      ];

      const dtos = greetingsToDtos(greetings);

      expect(dtos).toHaveLength(3);
      expect(dtos[0]).toEqual({ message: "First" });
      expect(dtos[1]).toEqual({ message: "Second" });
      expect(dtos[2]).toEqual({ message: "Third" });
    });

    it("should return empty array for empty input", () => {
      const dtos = greetingsToDtos([]);

      expect(dtos).toEqual([]);
    });
  });
});
