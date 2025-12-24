import { InvalidGreetingException } from "../exceptions/InvalidGreetingException";

export class Message {
  private readonly MIN_LENGTH = 1;
  private readonly MAX_LENGTH = 200;

  private constructor(private readonly _value: string) {
    this.validate();
  }

  static create(value: string): Message {
    return new Message(value);
  }

  private validate(): void {
    if (!this._value || this._value.trim().length < this.MIN_LENGTH) {
      throw new InvalidGreetingException("Message cannot be empty");
    }
    if (this._value.length > this.MAX_LENGTH) {
      throw new InvalidGreetingException(
        `Message too long (max ${this.MAX_LENGTH} characters)`
      );
    }
  }

  get value(): string {
    return this._value;
  }

  equals(other: Message): boolean {
    return this._value === other._value;
  }
}
