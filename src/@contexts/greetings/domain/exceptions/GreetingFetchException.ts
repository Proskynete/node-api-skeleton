import { DomainException } from "@shared/domain/exceptions/DomainException";

export class GreetingFetchException extends DomainException {
  constructor(message = "Failed to fetch greeting") {
    super(message, "GREETING_FETCH_ERROR", 500);
  }
}
