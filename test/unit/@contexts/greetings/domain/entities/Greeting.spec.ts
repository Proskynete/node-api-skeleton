import { describe, expect, it } from "vitest";

import { Greeting } from "@contexts/greetings/domain/entities/Greeting";
import { InvalidGreetingException } from "@contexts/greetings/domain/exceptions/InvalidGreetingException";

describe("Greeting Entity", () => {
  describe("create", () => {
    it("should create a valid greeting", () => {
      const greeting = Greeting.create("Hello World");

      expect(greeting.message).toBe("Hello World");
      expect(greeting.createdAt).toBeInstanceOf(Date);
    });

    it("should throw error for empty message", () => {
      expect(() => Greeting.create("")).toThrow(InvalidGreetingException);
      expect(() => Greeting.create("  ")).toThrow(InvalidGreetingException);
    });

    it("should throw error for too long message", () => {
      const longMessage = "a".repeat(201);
      expect(() => Greeting.create(longMessage)).toThrow(
        InvalidGreetingException
      );
    });
  });

  describe("reconstitute", () => {
    it("should reconstitute a greeting with specific date", () => {
      const date = new Date("2025-01-01");
      const greeting = Greeting.reconstitute("Hello", date);

      expect(greeting.message).toBe("Hello");
      expect(greeting.createdAt).toEqual(date);
    });
  });

  describe("toJSON", () => {
    it("should serialize to JSON", () => {
      const greeting = Greeting.create("Hello");
      const json = greeting.toJSON();

      expect(json).toHaveProperty("message", "Hello");
      expect(json).toHaveProperty("createdAt");
    });
  });
});
