import { IDomainEvent } from "@shared/domain/events/IDomainEvent";
import { IDomainEventHandler } from "@shared/domain/events/IDomainEventHandler";

/**
 * Domain Event Publisher Interface
 * Publishes domain events to registered handlers
 */
export interface IDomainEventPublisher {
  /**
   * Publish a domain event to all registered handlers
   * @param event The domain event to publish
   */
  publish(event: IDomainEvent): Promise<void>;

  /**
   * Publish multiple domain events
   * @param events The domain events to publish
   */
  publishAll(events: IDomainEvent[]): Promise<void>;

  /**
   * Register an event handler
   * @param handler The handler to register
   */
  subscribe(handler: IDomainEventHandler): void;

  /**
   * Unregister an event handler
   * @param handler The handler to unregister
   */
  unsubscribe(handler: IDomainEventHandler): void;

  /**
   * Clear all registered handlers
   */
  clearHandlers(): void;
}
