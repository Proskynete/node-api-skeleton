import { IDomainEvent } from "@shared/domain/events/IDomainEvent";
import { IDomainEventHandler } from "@shared/domain/events/IDomainEventHandler";
import { IDomainEventPublisher } from "@shared/domain/events/IDomainEventPublisher";
import { ILogger } from "@shared/infrastructure/observability/ILogger";

/**
 * In-Memory Domain Event Publisher
 * Synchronous event publishing for single-process applications
 * For distributed systems, use message broker implementation (RabbitMQ, Kafka, etc.)
 */
export class InMemoryDomainEventPublisher implements IDomainEventPublisher {
  private handlers = new Map<string, IDomainEventHandler[]>();

  constructor(private readonly logger: ILogger) {}

  async publish(event: IDomainEvent): Promise<void> {
    this.logger.debug(`Publishing domain event: ${event.eventName}`, {
      eventId: event.eventId,
      aggregateId: event.aggregateId,
    });

    const eventHandlers = this.handlers.get(event.eventName) ?? [];

    if (eventHandlers.length === 0) {
      this.logger.warn(`No handlers registered for event: ${event.eventName}`);
      return;
    }

    // Execute all handlers for this event type
    const promises = eventHandlers.map(async (handler) => {
      try {
        await handler.handle(event);
        this.logger.debug(`Handler executed for event: ${event.eventName}`, {
          handler: handler.constructor.name,
        });
      } catch (error) {
        // Log error but don't fail the entire event publishing
        this.logger.error(
          `Error in event handler for ${event.eventName}`,
          error as Error,
          {
            handler: handler.constructor.name,
            eventId: event.eventId,
          }
        );
      }
    });

    await Promise.all(promises);

    this.logger.info(
      `Domain event published successfully: ${event.eventName}`,
      {
        eventId: event.eventId,
        handlersExecuted: eventHandlers.length,
      }
    );
  }

  async publishAll(events: IDomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.publish(event);
    }
  }

  subscribe(handler: IDomainEventHandler): void {
    const eventName = handler.eventName;

    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, []);
    }

    const existingHandlers = this.handlers.get(eventName)!;
    existingHandlers.push(handler);

    this.logger.info(`Event handler registered for: ${eventName}`, {
      handler: handler.constructor.name,
    });
  }

  unsubscribe(handler: IDomainEventHandler): void {
    const eventName = handler.eventName;
    const handlers = this.handlers.get(eventName);

    if (!handlers) {
      return;
    }

    const index = handlers.indexOf(handler);
    if (index !== -1) {
      handlers.splice(index, 1);
      this.logger.info(`Event handler unregistered for: ${eventName}`, {
        handler: handler.constructor.name,
      });
    }
  }

  clearHandlers(): void {
    this.handlers.clear();
    this.logger.info("All event handlers cleared");
  }

  /**
   * Get number of handlers for an event (useful for testing)
   */
  getHandlerCount(eventName: string): number {
    return this.handlers.get(eventName)?.length ?? 0;
  }
}
