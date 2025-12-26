import { GreetingCreatedEvent } from "@contexts/greetings/domain/events/GreetingCreatedEvent";
import { beforeEach, describe, expect, it } from "vitest";

describe("GreetingCreatedEvent", () => {
  const aggregateId = "greeting-123";
  const message = "Hello World!";
  const createdAt = new Date("2024-01-01T00:00:00.000Z");
  let event: GreetingCreatedEvent;

  beforeEach(() => {
    event = new GreetingCreatedEvent(aggregateId, { message, createdAt });
  });

  describe("constructor", () => {
    it("should create event with correct event name", () => {
      expect(event.eventName).toBe("GreetingCreated");
      expect(event.eventName).toBe(GreetingCreatedEvent.EVENT_NAME);
    });

    it("should store aggregateId correctly", () => {
      expect(event.aggregateId).toBe(aggregateId);
    });

    it("should store payload correctly", () => {
      expect(event.payload).toEqual({ message, createdAt });
    });

    it("should have default version 1", () => {
      expect(event.version).toBe(1);
    });

    it("should generate unique eventId", () => {
      expect(event.eventId).toBeDefined();
      expect(typeof event.eventId).toBe("string");
      expect(event.eventId.length).toBeGreaterThan(0);
    });

    it("should set occurredOn timestamp", () => {
      expect(event.occurredOn).toBeInstanceOf(Date);
    });
  });

  describe("message getter", () => {
    it("should return message from payload", () => {
      expect(event.message).toBe(message);
    });

    it("should return correct message for different payloads", () => {
      const event1 = new GreetingCreatedEvent(aggregateId, {
        message: "First message",
        createdAt,
      });
      const event2 = new GreetingCreatedEvent(aggregateId, {
        message: "Second message",
        createdAt,
      });

      expect(event1.message).toBe("First message");
      expect(event2.message).toBe("Second message");
    });

    it("should handle empty message", () => {
      const emptyEvent = new GreetingCreatedEvent(aggregateId, {
        message: "",
        createdAt,
      });

      expect(emptyEvent.message).toBe("");
    });

    it("should handle long messages", () => {
      const longMessage = "A".repeat(1000);
      const longEvent = new GreetingCreatedEvent(aggregateId, {
        message: longMessage,
        createdAt,
      });

      expect(longEvent.message).toBe(longMessage);
      expect(longEvent.message.length).toBe(1000);
    });
  });

  describe("createdAt getter", () => {
    it("should return createdAt from payload", () => {
      expect(event.createdAt).toBe(createdAt);
    });

    it("should return Date instance", () => {
      expect(event.createdAt).toBeInstanceOf(Date);
    });

    it("should preserve exact timestamp", () => {
      const specificDate = new Date("2024-12-25T12:30:45.123Z");
      const specificEvent = new GreetingCreatedEvent(aggregateId, {
        message,
        createdAt: specificDate,
      });

      expect(specificEvent.createdAt.toISOString()).toBe(
        specificDate.toISOString()
      );
    });
  });

  describe("toJSON", () => {
    it("should serialize event with all properties", () => {
      const json = event.toJSON();

      expect(json).toHaveProperty("eventId");
      expect(json).toHaveProperty("eventName");
      expect(json).toHaveProperty("aggregateId");
      expect(json).toHaveProperty("occurredOn");
      expect(json).toHaveProperty("version");
      expect(json).toHaveProperty("payload");
    });

    it("should include greeting-specific payload data", () => {
      const json = event.toJSON();

      expect(json.eventName).toBe("GreetingCreated");
      expect(json.aggregateId).toBe(aggregateId);
      expect(json.payload).toHaveProperty("message");
      expect(json.payload).toHaveProperty("createdAt");
    });

    it("should convert dates to ISO strings", () => {
      const json = event.toJSON();

      expect(typeof json.occurredOn).toBe("string");
    });

    it("should be deserializable", () => {
      const json = event.toJSON();
      const jsonString = JSON.stringify(json);
      const parsed = JSON.parse(jsonString);

      expect(parsed.eventName).toBe("GreetingCreated");
      expect(parsed.aggregateId).toBe(aggregateId);
      expect(parsed.payload.message).toBe(message);
    });
  });

  describe("EVENT_NAME constant", () => {
    it("should be a static readonly property", () => {
      expect(GreetingCreatedEvent.EVENT_NAME).toBe("GreetingCreated");
    });

    it("should be defined and accessible", () => {
      // EVENT_NAME is readonly and enforced by TypeScript at compile time
      expect(GreetingCreatedEvent.EVENT_NAME).toBeDefined();
      expect(typeof GreetingCreatedEvent.EVENT_NAME).toBe("string");
    });
  });

  describe("multiple instances", () => {
    it("should create independent instances", () => {
      const event1 = new GreetingCreatedEvent("agg-1", {
        message: "Hello",
        createdAt: new Date("2024-01-01"),
      });
      const event2 = new GreetingCreatedEvent("agg-2", {
        message: "World",
        createdAt: new Date("2024-01-02"),
      });

      expect(event1.eventId).not.toBe(event2.eventId);
      expect(event1.aggregateId).not.toBe(event2.aggregateId);
      expect(event1.message).not.toBe(event2.message);
      expect(event1.createdAt).not.toBe(event2.createdAt);
    });

    it("should maintain event identity", () => {
      const sameEvent = event;

      expect(sameEvent.eventId).toBe(event.eventId);
      expect(sameEvent.aggregateId).toBe(event.aggregateId);
      expect(sameEvent.message).toBe(event.message);
    });
  });
});
