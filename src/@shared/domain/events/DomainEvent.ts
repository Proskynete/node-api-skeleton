import { IDomainEvent } from "@shared/domain/events/IDomainEvent";
import { randomUUID } from "crypto";

/**
 * Base Domain Event Class
 * Provides common functionality for all domain events
 */
export abstract class DomainEvent implements IDomainEvent {
  public readonly eventId: string;
  public readonly occurredOn: Date;
  public readonly version: number;

  constructor(
    public readonly eventName: string,
    public readonly aggregateId: string,
    public readonly payload: Record<string, unknown>,
    version = 1
  ) {
    this.eventId = randomUUID();
    this.occurredOn = new Date();
    this.version = version;
  }

  /**
   * Serialize event to JSON for persistence or messaging
   */
  toJSON(): Record<string, unknown> {
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
