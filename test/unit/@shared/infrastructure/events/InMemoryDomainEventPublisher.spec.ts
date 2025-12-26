import { describe, it, expect, beforeEach, vi } from "vitest";
import { InMemoryDomainEventPublisher } from "@shared/infrastructure/events/InMemoryDomainEventPublisher";
import { IDomainEvent } from "@shared/domain/events/IDomainEvent";
import { IDomainEventHandler } from "@shared/domain/events/IDomainEventHandler";
import { ILogger } from "@shared/infrastructure/observability/ILogger";

// Mock Event for testing
class MockDomainEvent implements IDomainEvent {
  readonly eventId = "test-event-id";
  readonly eventName = "MockEvent";
  readonly aggregateId = "test-aggregate";
  readonly occurredOn = new Date();
  readonly version = 1;
  readonly payload = { data: "test" };

  toJSON() {
    return {
      eventId: this.eventId,
      eventName: this.eventName,
      aggregateId: this.aggregateId,
      occurredOn: this.occurredOn.toISOString(),
      version: this.version,
      payload: this.payload,
    };
  }
}

// Mock Handler for testing
class MockEventHandler implements IDomainEventHandler<MockDomainEvent> {
  readonly eventName = "MockEvent";
  handleFn = vi.fn();

  async handle(event: MockDomainEvent): Promise<void> {
    this.handleFn(event);
  }
}

// Failing Handler for error testing
class FailingEventHandler implements IDomainEventHandler<MockDomainEvent> {
  readonly eventName = "MockEvent";

  async handle(_event: MockDomainEvent): Promise<void> {
    throw new Error("Handler failed");
  }
}

describe("InMemoryDomainEventPublisher", () => {
  let publisher: InMemoryDomainEventPublisher;
  let mockLogger: ILogger;
  let loggerDebugSpy: ReturnType<typeof vi.fn>;
  let loggerInfoSpy: ReturnType<typeof vi.fn>;
  let loggerWarnSpy: ReturnType<typeof vi.fn>;
  let loggerErrorSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    loggerDebugSpy = vi.fn();
    loggerInfoSpy = vi.fn();
    loggerWarnSpy = vi.fn();
    loggerErrorSpy = vi.fn();

    mockLogger = {
      debug: loggerDebugSpy,
      info: loggerInfoSpy,
      warn: loggerWarnSpy,
      error: loggerErrorSpy,
    } as unknown as ILogger;

    publisher = new InMemoryDomainEventPublisher(mockLogger);
  });

  describe("subscribe", () => {
    it("should register handler for event", () => {
      const handler = new MockEventHandler();

      publisher.subscribe(handler);

      expect(publisher.getHandlerCount("MockEvent")).toBe(1);
    });

    it("should log handler registration", () => {
      const handler = new MockEventHandler();

      publisher.subscribe(handler);

      expect(loggerInfoSpy).toHaveBeenCalledWith(
        "Event handler registered for: MockEvent",
        { handler: "MockEventHandler" }
      );
    });

    it("should allow multiple handlers for same event", () => {
      const handler1 = new MockEventHandler();
      const handler2 = new MockEventHandler();

      publisher.subscribe(handler1);
      publisher.subscribe(handler2);

      expect(publisher.getHandlerCount("MockEvent")).toBe(2);
    });

    it("should create handler array if event type is new", () => {
      const handler = new MockEventHandler();

      expect(publisher.getHandlerCount("MockEvent")).toBe(0);
      publisher.subscribe(handler);
      expect(publisher.getHandlerCount("MockEvent")).toBe(1);
    });
  });

  describe("unsubscribe", () => {
    it("should remove handler from event", () => {
      const handler = new MockEventHandler();

      publisher.subscribe(handler);
      expect(publisher.getHandlerCount("MockEvent")).toBe(1);

      publisher.unsubscribe(handler);
      expect(publisher.getHandlerCount("MockEvent")).toBe(0);
    });

    it("should log handler unregistration", () => {
      const handler = new MockEventHandler();

      publisher.subscribe(handler);
      loggerInfoSpy.mockClear();

      publisher.unsubscribe(handler);

      expect(loggerInfoSpy).toHaveBeenCalledWith(
        "Event handler unregistered for: MockEvent",
        { handler: "MockEventHandler" }
      );
    });

    it("should do nothing if handler not found", () => {
      const handler = new MockEventHandler();

      publisher.unsubscribe(handler);

      expect(publisher.getHandlerCount("MockEvent")).toBe(0);
    });

    it("should only remove specific handler instance", () => {
      const handler1 = new MockEventHandler();
      const handler2 = new MockEventHandler();

      publisher.subscribe(handler1);
      publisher.subscribe(handler2);

      publisher.unsubscribe(handler1);

      expect(publisher.getHandlerCount("MockEvent")).toBe(1);
    });

    it("should handle unsubscribing non-existent event type", () => {
      const handler = new MockEventHandler();

      expect(() => {
        publisher.unsubscribe(handler);
      }).not.toThrow();
    });
  });

  describe("publish", () => {
    it("should publish event to registered handlers", async () => {
      const handler = new MockEventHandler();
      const event = new MockDomainEvent();

      publisher.subscribe(handler);
      await publisher.publish(event);

      expect(handler.handleFn).toHaveBeenCalledWith(event);
      expect(handler.handleFn).toHaveBeenCalledTimes(1);
    });

    it("should log event publishing", async () => {
      const event = new MockDomainEvent();
      const handler = new MockEventHandler();

      publisher.subscribe(handler);
      await publisher.publish(event);

      expect(loggerDebugSpy).toHaveBeenCalledWith(
        "Publishing domain event: MockEvent",
        {
          eventId: event.eventId,
          aggregateId: event.aggregateId,
        }
      );
    });

    it("should warn when no handlers registered", async () => {
      const event = new MockDomainEvent();

      await publisher.publish(event);

      expect(loggerWarnSpy).toHaveBeenCalledWith(
        "No handlers registered for event: MockEvent"
      );
    });

    it("should execute all registered handlers", async () => {
      const handler1 = new MockEventHandler();
      const handler2 = new MockEventHandler();
      const event = new MockDomainEvent();

      publisher.subscribe(handler1);
      publisher.subscribe(handler2);

      await publisher.publish(event);

      expect(handler1.handleFn).toHaveBeenCalledTimes(1);
      expect(handler2.handleFn).toHaveBeenCalledTimes(1);
    });

    it("should log after successful handler execution", async () => {
      const handler = new MockEventHandler();
      const event = new MockDomainEvent();

      publisher.subscribe(handler);
      await publisher.publish(event);

      expect(loggerDebugSpy).toHaveBeenCalledWith(
        "Handler executed for event: MockEvent",
        { handler: "MockEventHandler" }
      );
    });

    it("should log success after all handlers complete", async () => {
      const handler = new MockEventHandler();
      const event = new MockDomainEvent();

      publisher.subscribe(handler);
      await publisher.publish(event);

      expect(loggerInfoSpy).toHaveBeenCalledWith(
        "Domain event published successfully: MockEvent",
        {
          eventId: event.eventId,
          handlersExecuted: 1,
        }
      );
    });

    it("should handle errors in handlers gracefully", async () => {
      const failingHandler = new FailingEventHandler();
      const event = new MockDomainEvent();

      publisher.subscribe(failingHandler);
      await publisher.publish(event);

      expect(loggerErrorSpy).toHaveBeenCalled();
    });

    it("should log error details when handler fails", async () => {
      const failingHandler = new FailingEventHandler();
      const event = new MockDomainEvent();

      publisher.subscribe(failingHandler);
      await publisher.publish(event);

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        "Error in event handler for MockEvent",
        expect.any(Error),
        {
          handler: "FailingEventHandler",
          eventId: event.eventId,
        }
      );
    });

    it("should continue executing other handlers if one fails", async () => {
      const failingHandler = new FailingEventHandler();
      const successHandler = new MockEventHandler();
      const event = new MockDomainEvent();

      publisher.subscribe(failingHandler);
      publisher.subscribe(successHandler);

      await publisher.publish(event);

      expect(successHandler.handleFn).toHaveBeenCalledTimes(1);
      expect(loggerErrorSpy).toHaveBeenCalled();
    });

    it("should execute handlers concurrently", async () => {
      const handler1 = new MockEventHandler();
      const handler2 = new MockEventHandler();
      const event = new MockDomainEvent();

      let handler1Started = false;
      let handler2Started = false;
      const startTimes: number[] = [];

      handler1.handleFn.mockImplementation(async () => {
        handler1Started = true;
        startTimes.push(1);
        await new Promise((resolve) => setTimeout(resolve, 10));
      });

      handler2.handleFn.mockImplementation(async () => {
        handler2Started = true;
        startTimes.push(2);
        await new Promise((resolve) => setTimeout(resolve, 5));
      });

      publisher.subscribe(handler1);
      publisher.subscribe(handler2);

      await publisher.publish(event);

      // Both handlers should have been called
      expect(handler1Started).toBe(true);
      expect(handler2Started).toBe(true);
      expect(handler1.handleFn).toHaveBeenCalledTimes(1);
      expect(handler2.handleFn).toHaveBeenCalledTimes(1);
    });
  });

  describe("publishAll", () => {
    it("should publish multiple events", async () => {
      const handler = new MockEventHandler();
      const event1 = new MockDomainEvent();
      const event2 = new MockDomainEvent();

      publisher.subscribe(handler);
      await publisher.publishAll([event1, event2]);

      expect(handler.handleFn).toHaveBeenCalledTimes(2);
    });

    it("should publish events in order", async () => {
      const handler = new MockEventHandler();
      const events = [
        new MockDomainEvent(),
        new MockDomainEvent(),
        new MockDomainEvent(),
      ];

      const processedEvents: MockDomainEvent[] = [];
      handler.handleFn.mockImplementation((event: MockDomainEvent) => {
        processedEvents.push(event);
      });

      publisher.subscribe(handler);
      await publisher.publishAll(events);

      expect(processedEvents).toEqual(events);
    });

    it("should handle empty event array", async () => {
      await expect(publisher.publishAll([])).resolves.toBeUndefined();
    });

    it("should continue publishing if one event handler fails", async () => {
      const failingHandler = new FailingEventHandler();
      const successHandler = new MockEventHandler();
      const events = [new MockDomainEvent(), new MockDomainEvent()];

      publisher.subscribe(failingHandler);
      publisher.subscribe(successHandler);

      await publisher.publishAll(events);

      expect(successHandler.handleFn).toHaveBeenCalledTimes(2);
      expect(loggerErrorSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe("clearHandlers", () => {
    it("should remove all handlers", () => {
      const handler1 = new MockEventHandler();
      const handler2 = new MockEventHandler();

      publisher.subscribe(handler1);
      publisher.subscribe(handler2);

      publisher.clearHandlers();

      expect(publisher.getHandlerCount("MockEvent")).toBe(0);
    });

    it("should log when clearing handlers", () => {
      const handler = new MockEventHandler();

      publisher.subscribe(handler);
      publisher.clearHandlers();

      expect(loggerInfoSpy).toHaveBeenCalledWith(
        "All event handlers cleared"
      );
    });

    it("should allow re-subscribing after clearing", () => {
      const handler = new MockEventHandler();

      publisher.subscribe(handler);
      publisher.clearHandlers();
      publisher.subscribe(handler);

      expect(publisher.getHandlerCount("MockEvent")).toBe(1);
    });
  });

  describe("getHandlerCount", () => {
    it("should return 0 for unregistered event", () => {
      expect(publisher.getHandlerCount("NonExistentEvent")).toBe(0);
    });

    it("should return correct count after subscribing", () => {
      const handler1 = new MockEventHandler();
      const handler2 = new MockEventHandler();

      publisher.subscribe(handler1);
      expect(publisher.getHandlerCount("MockEvent")).toBe(1);

      publisher.subscribe(handler2);
      expect(publisher.getHandlerCount("MockEvent")).toBe(2);
    });

    it("should return correct count after unsubscribing", () => {
      const handler = new MockEventHandler();

      publisher.subscribe(handler);
      expect(publisher.getHandlerCount("MockEvent")).toBe(1);

      publisher.unsubscribe(handler);
      expect(publisher.getHandlerCount("MockEvent")).toBe(0);
    });
  });
});
