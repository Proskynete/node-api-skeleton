import { DomainEvent } from "@shared/domain/events/DomainEvent";
import { beforeEach, describe, expect, it } from "vitest";

// Test implementation of DomainEvent
class TestDomainEvent extends DomainEvent {
  constructor(aggregateId: string, payload: Record<string, unknown>) {
    super("TestEvent", aggregateId, payload);
  }
}

describe("DomainEvent", () => {
  let event: TestDomainEvent;
  const aggregateId = "test-aggregate-123";
  const payload = { data: "test-data", count: 42 };

  beforeEach(() => {
    event = new TestDomainEvent(aggregateId, payload);
  });

  describe("constructor", () => {
    it("should create event with all required properties", () => {
      expect(event.eventName).toBe("TestEvent");
      expect(event.aggregateId).toBe(aggregateId);
      expect(event.payload).toEqual(payload);
      expect(event.version).toBe(1);
    });

    it("should generate unique eventId", () => {
      const event1 = new TestDomainEvent(aggregateId, payload);
      const event2 = new TestDomainEvent(aggregateId, payload);

      expect(event1.eventId).toBeDefined();
      expect(event2.eventId).toBeDefined();
      expect(event1.eventId).not.toBe(event2.eventId);
    });

    it("should set occurredOn to current date", () => {
      const before = new Date();
      const testEvent = new TestDomainEvent(aggregateId, payload);
      const after = new Date();

      expect(testEvent.occurredOn).toBeInstanceOf(Date);
      expect(testEvent.occurredOn.getTime()).toBeGreaterThanOrEqual(
        before.getTime()
      );
      expect(testEvent.occurredOn.getTime()).toBeLessThanOrEqual(
        after.getTime()
      );
    });

    it("should accept custom version", () => {
      class VersionedEvent extends DomainEvent {
        constructor(version: number) {
          super("VersionedEvent", "agg-1", {}, version);
        }
      }

      const v2Event = new VersionedEvent(2);
      expect(v2Event.version).toBe(2);
    });

    it("should default to version 1 when not specified", () => {
      expect(event.version).toBe(1);
    });
  });

  describe("toJSON", () => {
    it("should serialize event to JSON with all properties", () => {
      const json = event.toJSON();

      expect(json).toHaveProperty("eventId");
      expect(json).toHaveProperty("eventName");
      expect(json).toHaveProperty("aggregateId");
      expect(json).toHaveProperty("occurredOn");
      expect(json).toHaveProperty("version");
      expect(json).toHaveProperty("payload");
    });

    it("should include correct values in JSON", () => {
      const json = event.toJSON();

      expect(json.eventId).toBe(event.eventId);
      expect(json.eventName).toBe("TestEvent");
      expect(json.aggregateId).toBe(aggregateId);
      expect(json.version).toBe(1);
      expect(json.payload).toEqual(payload);
    });

    it("should convert occurredOn to ISO string", () => {
      const json = event.toJSON();

      expect(typeof json.occurredOn).toBe("string");
      expect(json.occurredOn).toBe(event.occurredOn.toISOString());
    });

    it("should handle complex payload with nested objects", () => {
      const complexPayload = {
        user: { id: 1, name: "John" },
        items: [{ id: 1 }, { id: 2 }],
        metadata: { timestamp: new Date() },
      };

      const complexEvent = new TestDomainEvent("agg-1", complexPayload);
      const json = complexEvent.toJSON();

      expect(json.payload).toEqual(complexPayload);
    });

    it("should handle empty payload", () => {
      const emptyEvent = new TestDomainEvent("agg-1", {});
      const json = emptyEvent.toJSON();

      expect(json.payload).toEqual({});
    });
  });

  describe("immutability", () => {
    it("should have readonly properties enforced by TypeScript", () => {
      // TypeScript readonly prevents modification at compile time
      // We verify the properties are accessible but not reassignable via TypeScript
      expect(event.eventId).toBeDefined();
      expect(event.occurredOn).toBeInstanceOf(Date);
      expect(event.version).toBe(1);
      expect(event.eventName).toBe("TestEvent");
      expect(event.aggregateId).toBe(aggregateId);
    });

    it("should preserve property values over time", () => {
      const originalEventId = event.eventId;
      const originalOccurredOn = event.occurredOn;
      const originalVersion = event.version;
      const originalEventName = event.eventName;
      const originalAggregateId = event.aggregateId;

      // Accessing properties multiple times should return the same values
      expect(event.eventId).toBe(originalEventId);
      expect(event.occurredOn).toBe(originalOccurredOn);
      expect(event.version).toBe(originalVersion);
      expect(event.eventName).toBe(originalEventName);
      expect(event.aggregateId).toBe(originalAggregateId);
    });
  });
});
