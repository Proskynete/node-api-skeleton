import { describe, it, expect, beforeEach, vi } from "vitest";
import { GreetingCreatedEventHandler } from "@contexts/greetings/application/v1/event-handlers/GreetingCreatedEventHandler";
import { GreetingCreatedEvent } from "@contexts/greetings/domain/events/GreetingCreatedEvent";
import { ILogger } from "@shared/infrastructure/observability/ILogger";

describe("GreetingCreatedEventHandler", () => {
  let handler: GreetingCreatedEventHandler;
  let mockLogger: ILogger;
  let loggerInfoSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    loggerInfoSpy = vi.fn();
    mockLogger = {
      info: loggerInfoSpy,
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
    } as unknown as ILogger;

    handler = new GreetingCreatedEventHandler(mockLogger);
  });

  describe("eventName", () => {
    it("should have correct event name", () => {
      expect(handler.eventName).toBe("GreetingCreated");
      expect(handler.eventName).toBe(GreetingCreatedEvent.EVENT_NAME);
    });
  });

  describe("handle", () => {
    it("should handle GreetingCreatedEvent successfully", async () => {
      const event = new GreetingCreatedEvent("greeting-123", {
        message: "Hello World",
        createdAt: new Date("2024-01-01"),
      });

      await handler.handle(event);

      expect(loggerInfoSpy).toHaveBeenCalled();
    });

    it("should log event details with structured data", async () => {
      const message = "Test Greeting";
      const createdAt = new Date("2024-01-01T10:00:00.000Z");
      const event = new GreetingCreatedEvent("greeting-456", {
        message,
        createdAt,
      });

      await handler.handle(event);

      expect(loggerInfoSpy).toHaveBeenCalledWith(
        "Handling GreetingCreatedEvent",
        {
          eventId: event.eventId,
          message,
          createdAt,
        }
      );
    });

    it("should log greeting message", async () => {
      const message = "Welcome!";
      const event = new GreetingCreatedEvent("greeting-789", {
        message,
        createdAt: new Date(),
      });

      await handler.handle(event);

      expect(loggerInfoSpy).toHaveBeenCalledWith(
        `New greeting created: "${message}"`
      );
    });

    it("should call logger twice (event handling + message)", async () => {
      const event = new GreetingCreatedEvent("greeting-123", {
        message: "Hello",
        createdAt: new Date(),
      });

      await handler.handle(event);

      expect(loggerInfoSpy).toHaveBeenCalledTimes(2);
    });

    it("should return resolved promise", async () => {
      const event = new GreetingCreatedEvent("greeting-123", {
        message: "Hello",
        createdAt: new Date(),
      });

      const result = await handler.handle(event);

      expect(result).toBeUndefined();
    });

    it("should handle multiple events sequentially", async () => {
      const event1 = new GreetingCreatedEvent("greeting-1", {
        message: "First",
        createdAt: new Date(),
      });
      const event2 = new GreetingCreatedEvent("greeting-2", {
        message: "Second",
        createdAt: new Date(),
      });

      await handler.handle(event1);
      await handler.handle(event2);

      expect(loggerInfoSpy).toHaveBeenCalledTimes(4); // 2 events × 2 logs each
    });

    it("should handle events with empty message", async () => {
      const event = new GreetingCreatedEvent("greeting-empty", {
        message: "",
        createdAt: new Date(),
      });

      await expect(handler.handle(event)).resolves.toBeUndefined();
      expect(loggerInfoSpy).toHaveBeenCalledWith(
        'New greeting created: ""'
      );
    });

    it("should handle events with long messages", async () => {
      const longMessage = "A".repeat(500);
      const event = new GreetingCreatedEvent("greeting-long", {
        message: longMessage,
        createdAt: new Date(),
      });

      await handler.handle(event);

      expect(loggerInfoSpy).toHaveBeenCalledWith(
        `New greeting created: "${longMessage}"`
      );
    });

    it("should handle events with special characters in message", async () => {
      const specialMessage = 'Hello "World" & <Friends>!';
      const event = new GreetingCreatedEvent("greeting-special", {
        message: specialMessage,
        createdAt: new Date(),
      });

      await handler.handle(event);

      expect(loggerInfoSpy).toHaveBeenCalledWith(
        `New greeting created: "${specialMessage}"`
      );
    });

    it("should pass event metadata to logger", async () => {
      const event = new GreetingCreatedEvent("greeting-metadata", {
        message: "Test",
        createdAt: new Date("2024-06-15T14:30:00.000Z"),
      });

      await handler.handle(event);

      const firstCall = loggerInfoSpy.mock.calls[0];
      expect(firstCall[1]).toHaveProperty("eventId");
      expect(firstCall[1]).toHaveProperty("message");
      expect(firstCall[1]).toHaveProperty("createdAt");
      expect(firstCall[1].eventId).toBe(event.eventId);
    });
  });

  describe("constructor", () => {
    it("should initialize with logger", () => {
      const newHandler = new GreetingCreatedEventHandler(mockLogger);

      expect(newHandler).toBeInstanceOf(GreetingCreatedEventHandler);
      expect(newHandler.eventName).toBe("GreetingCreated");
    });

    it("should store logger reference", async () => {
      const customLogger = {
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn(),
      } as unknown as ILogger;

      const customHandler = new GreetingCreatedEventHandler(customLogger);
      const event = new GreetingCreatedEvent("test", {
        message: "test",
        createdAt: new Date(),
      });

      await customHandler.handle(event);

      expect(customLogger.info).toHaveBeenCalled();
      expect(mockLogger.info).not.toHaveBeenCalled();
    });
  });
});
