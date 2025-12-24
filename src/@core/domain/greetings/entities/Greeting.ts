import { Message } from "../value-objects/Message";

export class Greeting {
  private constructor(
    private readonly _message: Message,
    private readonly _createdAt: Date
  ) {}

  static create(text: string): Greeting {
    const message = Message.create(text);
    return new Greeting(message, new Date());
  }

  static reconstitute(text: string, createdAt: Date): Greeting {
    const message = Message.create(text);
    return new Greeting(message, createdAt);
  }

  get message(): string {
    return this._message.value;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  toJSON(): { message: string; createdAt: Date } {
    return {
      message: this.message,
      createdAt: this.createdAt,
    };
  }
}
