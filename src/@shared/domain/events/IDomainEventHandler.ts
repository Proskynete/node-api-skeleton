import { IDomainEvent } from "@shared/domain/events/IDomainEvent";

/**
 * Domain Event Handler Interface
 * Handlers process domain events asynchronously
 */
export interface IDomainEventHandler<T extends IDomainEvent = IDomainEvent> {
  /**
   * Handle a domain event
   * @param event The domain event to handle
   */
  handle(event: T): Promise<void>;

  /**
   * Event name this handler is interested in
   */
  readonly eventName: string;
}
