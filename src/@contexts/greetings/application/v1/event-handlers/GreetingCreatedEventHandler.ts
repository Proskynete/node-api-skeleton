import { GreetingCreatedEvent } from "@contexts/greetings/domain/events/GreetingCreatedEvent";
import { IDomainEventHandler } from "@shared/domain/events/IDomainEventHandler";
import { ILogger } from "@shared/infrastructure/observability/ILogger";

/**
 * Greeting Created Event Handler
 * Example handler that reacts to GreetingCreatedEvent
 * In a real application, this could:
 * - Send notifications
 * - Update read models
 * - Trigger workflows
 * - Publish to message broker
 */
export class GreetingCreatedEventHandler implements IDomainEventHandler<GreetingCreatedEvent> {
  readonly eventName = GreetingCreatedEvent.EVENT_NAME;

  constructor(private readonly logger: ILogger) {}

  async handle(event: GreetingCreatedEvent): Promise<void> {
    this.logger.info("Handling GreetingCreatedEvent", {
      eventId: event.eventId,
      message: event.message,
      createdAt: event.createdAt,
    });

    // Example: Log the greeting creation
    // In production, you might:
    // - Send an email notification (async)
    // - Update analytics (async)
    // - Trigger a webhook (async)
    // - Publish to external message broker (async)

    this.logger.info(`New greeting created: "${event.message}"`);

    // For now, this is a simple example that just logs
    // In a real app, you would await async operations here
    return Promise.resolve();
  }
}
