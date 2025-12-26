import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  greetingToDto,
  greetingToDomain,
  greetingsToDtos,
} from "@contexts/greetings/application/v2/mappers/GreetingMapper";
import { Greeting } from "@contexts/greetings/domain/entities/Greeting";

describe("GreetingMapper v2", () => {
  describe("greetingToDto", () => {
    it("should map Greeting entity to DTO v2", () => {
      const greeting = Greeting.create("Hello World");

      const dto = greetingToDto(greeting);

      expect(dto).toHaveProperty("message");
      expect(dto).toHaveProperty("timestamp");
      expect(dto).toHaveProperty("version");
    });

    it("should include message string in DTO", () => {
      const greeting = Greeting.create("Test message");

      const dto = greetingToDto(greeting);

      expect(dto.message).toBe("Test message");
      expect(dto.message).toBe(greeting.message);
    });

    it("should include timestamp in ISO format", () => {
      const greeting = Greeting.create("Test");

      const dto = greetingToDto(greeting);

      expect(typeof dto.timestamp).toBe("string");
      const date = new Date(dto.timestamp);
      expect(date).toBeInstanceOf(Date);
      expect(isNaN(date.getTime())).toBe(false);
    });

    it("should include version 2.0", () => {
      const greeting = Greeting.create("Test");

      const dto = greetingToDto(greeting);

      expect(dto.version).toBe("2.0");
    });

    it("should generate current timestamp", () => {
      const before = new Date().getTime();
      const greeting = Greeting.create("Test");

      const dto = greetingToDto(greeting);
      const timestamp = new Date(dto.timestamp).getTime();
      const after = new Date().getTime();

      expect(timestamp).toBeGreaterThanOrEqual(before);
      expect(timestamp).toBeLessThanOrEqual(after);
    });

    it("should be a pure function (no side effects)", () => {
      const greeting = Greeting.create("Original");
      const originalMessage = greeting.message;

      greetingToDto(greeting);

      expect(greeting.message).toBe(originalMessage);
    });

    it("should handle different message lengths", () => {
      const shortGreeting = Greeting.create("Hi");
      const longGreeting = Greeting.create("A".repeat(200));

      const shortDto = greetingToDto(shortGreeting);
      const longDto = greetingToDto(longGreeting);

      expect(shortDto.message).toBe("Hi");
      expect(longDto.message).toBe("A".repeat(200));
    });

    it("should create new timestamp on each call", () => {
      const greeting = Greeting.create("Test");

      const dto1 = greetingToDto(greeting);
      // Small delay to ensure different timestamps
      vi.useFakeTimers();
      vi.advanceTimersByTime(1);
      const dto2 = greetingToDto(greeting);
      vi.useRealTimers();

      expect(dto1.timestamp).not.toBe(dto2.timestamp);
    });

    it("should handle special characters in message", () => {
      const greeting = Greeting.create('Hello "World" & <Friends>!');

      const dto = greetingToDto(greeting);

      expect(dto.message).toBe('Hello "World" & <Friends>!');
    });

    it("should return DTO with correct structure", () => {
      const greeting = Greeting.create("Test");

      const dto = greetingToDto(greeting);

      expect(Object.keys(dto)).toEqual(["message", "timestamp", "version"]);
    });
  });

  describe("greetingToDomain", () => {
    it("should create Greeting entity from string", () => {
      const message = "Hello Domain";

      const greeting = greetingToDomain(message);

      expect(greeting).toBeInstanceOf(Greeting);
      expect(greeting.message).toBe(message);
    });

    it("should be a pure function", () => {
      const message = "Test";

      const greeting1 = greetingToDomain(message);
      const greeting2 = greetingToDomain(message);

      // Different instances
      expect(greeting1).not.toBe(greeting2);
      // Same value
      expect(greeting1.message).toBe(greeting2.message);
    });

    it("should create valid Greeting with Message VO", () => {
      const message = "Valid greeting";

      const greeting = greetingToDomain(message);

      expect(greeting.message).toBeDefined();
      expect(greeting.message).toBe(message);
    });

    it("should handle different message lengths", () => {
      const short = greetingToDomain("Hi");
      const long = greetingToDomain("A".repeat(200));

      expect(short.message).toBe("Hi");
      expect(long.message).toBe("A".repeat(200));
    });

    it("should create greeting with createdAt timestamp", () => {
      const greeting = greetingToDomain("Test");

      expect(greeting.createdAt).toBeInstanceOf(Date);
    });

    it("should handle special characters", () => {
      const special = 'Special "chars" & <tags>';

      const greeting = greetingToDomain(special);

      expect(greeting.message).toBe(special);
    });

    it("should throw for invalid messages", () => {
      const tooLong = "A".repeat(201); // Over max length

      expect(() => greetingToDomain(tooLong)).toThrow();
    });

    it("should throw for empty messages", () => {
      expect(() => greetingToDomain("")).toThrow();
    });
  });

  describe("greetingsToDtos", () => {
    it("should map array of Greeting entities to DTOs", () => {
      const greetings = [
        Greeting.create("First"),
        Greeting.create("Second"),
        Greeting.create("Third"),
      ];

      const dtos = greetingsToDtos(greetings);

      expect(dtos).toHaveLength(3);
      expect(dtos[0].message).toBe("First");
      expect(dtos[1].message).toBe("Second");
      expect(dtos[2].message).toBe("Third");
    });

    it("should preserve order of greetings", () => {
      const greetings = [
        Greeting.create("A"),
        Greeting.create("B"),
        Greeting.create("C"),
      ];

      const dtos = greetingsToDtos(greetings);

      expect(dtos.map((d) => d.message)).toEqual(["A", "B", "C"]);
    });

    it("should handle empty array", () => {
      const dtos = greetingsToDtos([]);

      expect(dtos).toEqual([]);
      expect(dtos).toHaveLength(0);
    });

    it("should handle single greeting", () => {
      const greetings = [Greeting.create("Single")];

      const dtos = greetingsToDtos(greetings);

      expect(dtos).toHaveLength(1);
      expect(dtos[0].message).toBe("Single");
    });

    it("should create DTOs with version 2.0", () => {
      const greetings = [Greeting.create("Test1"), Greeting.create("Test2")];

      const dtos = greetingsToDtos(greetings);

      expect(dtos.every((dto) => dto.version === "2.0")).toBe(true);
    });

    it("should create DTOs with timestamps", () => {
      const greetings = [Greeting.create("Test1"), Greeting.create("Test2")];

      const dtos = greetingsToDtos(greetings);

      dtos.forEach((dto) => {
        expect(typeof dto.timestamp).toBe("string");
        const date = new Date(dto.timestamp);
        expect(isNaN(date.getTime())).toBe(false);
      });
    });

    it("should be a pure function (no side effects)", () => {
      const greetings = [Greeting.create("Original")];
      const original = greetings[0].message;

      greetingsToDtos(greetings);

      expect(greetings[0].message).toBe(original);
    });

    it("should handle large arrays", () => {
      const greetings = Array.from({ length: 100 }, (_, i) =>
        Greeting.create(`Greeting ${i}`)
      );

      const dtos = greetingsToDtos(greetings);

      expect(dtos).toHaveLength(100);
      expect(dtos[0].message).toBe("Greeting 0");
      expect(dtos[99].message).toBe("Greeting 99");
    });

    it("should use greetingToDto for each element", () => {
      const greetings = [Greeting.create("Test")];

      const dtos = greetingsToDtos(greetings);
      const manualDto = greetingToDto(greetings[0]);

      expect(dtos[0].message).toEqual(manualDto.message);
      expect(dtos[0].version).toBe(manualDto.version);
    });
  });

  describe("mapper composition", () => {
    it("should allow round-trip conversion", () => {
      const originalMessage = "Round trip test";

      const greeting = greetingToDomain(originalMessage);
      const dto = greetingToDto(greeting);

      expect(dto.message).toBe(originalMessage);
    });

    it("should work with multiple conversions", () => {
      const messages = ["First", "Second", "Third"];

      const greetings = messages.map(greetingToDomain);
      const dtos = greetingsToDtos(greetings);

      expect(dtos.map((d) => d.message)).toEqual(messages);
    });
  });
});
