import { DomainException } from "../../shared/exceptions/DomainException";

export class InvalidGreetingException extends DomainException {
  constructor(message: string) {
    super(message, "INVALID_GREETING", 400);
  }
}
