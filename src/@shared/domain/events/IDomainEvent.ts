/**
 * Domain Event Interface
 * Base interface for all domain events
 * Events are immutable records of something that happened in the domain
 */
export interface IDomainEvent {
  /**
   * Unique identifier for this event instance
   */
  readonly eventId: string;

  /**
   * Name of the event (e.g., "GreetingCreated")
   */
  readonly eventName: string;

  /**
   * When the event occurred
   */
  readonly occurredOn: Date;

  /**
   * Aggregate ID related to this event
   */
  readonly aggregateId: string;

  /**
   * Version of the event schema (for evolution)
   */
  readonly version: number;

  /**
   * Event payload/data
   */
  readonly payload: Record<string, unknown>;
}
