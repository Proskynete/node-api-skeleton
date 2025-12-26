import { DomainEvent } from "@shared/domain/events/DomainEvent";

/**
 * Greeting Created Event
 * Raised when a new greeting is created
 */
export class GreetingCreatedEvent extends DomainEvent {
  static readonly EVENT_NAME = "GreetingCreated";

  constructor(
    aggregateId: string,
    payload: {
      message: string;
      createdAt: Date;
    }
  ) {
    super(GreetingCreatedEvent.EVENT_NAME, aggregateId, payload);
  }

  /**
   * Get greeting message from payload
   */
  get message(): string {
    return this.payload.message as string;
  }

  /**
   * Get created date from payload
   */
  get createdAt(): Date {
    return this.payload.createdAt as Date;
  }
}
