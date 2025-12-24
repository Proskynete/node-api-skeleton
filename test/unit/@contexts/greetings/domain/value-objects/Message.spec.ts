import { InvalidGreetingException } from "@contexts/greetings/domain/exceptions/InvalidGreetingException";
import { Message } from "@contexts/greetings/domain/value-objects/Message";
import { describe, expect, it } from "vitest";

describe("Message Value Object", () => {
  describe("create", () => {
    it("should create a valid message", () => {
      const message = Message.create("Hello");
      expect(message.value).toBe("Hello");
    });

    it("should throw for empty string", () => {
      expect(() => Message.create("")).toThrow(InvalidGreetingException);
    });

    it("should throw for whitespace only", () => {
      expect(() => Message.create("   ")).toThrow(InvalidGreetingException);
    });

    it("should throw for too long message", () => {
      const longText = "a".repeat(201);
      expect(() => Message.create(longText)).toThrow(InvalidGreetingException);
    });

    it("should accept message at max length", () => {
      const maxText = "a".repeat(200);
      const message = Message.create(maxText);
      expect(message.value).toBe(maxText);
    });
  });

  describe("equals", () => {
    it("should return true for same value", () => {
      const msg1 = Message.create("Hello");
      const msg2 = Message.create("Hello");
      expect(msg1.equals(msg2)).toBe(true);
    });

    it("should return false for different values", () => {
      const msg1 = Message.create("Hello");
      const msg2 = Message.create("World");
      expect(msg1.equals(msg2)).toBe(false);
    });
  });
});
