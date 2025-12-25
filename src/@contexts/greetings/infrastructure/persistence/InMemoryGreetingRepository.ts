import { IGreetingRepository } from "@contexts/greetings/application/v1/ports/outbound/IGreetingRepository";
import { Greeting } from "@contexts/greetings/domain/entities/Greeting";

/**
 * In-Memory Greeting Repository
 * Implements IGreetingRepository for testing and development
 * Stores greetings in memory (volatile storage)
 */
export class InMemoryGreetingRepository implements IGreetingRepository {
  private greetings: Greeting[] = [];

  async getGreeting(): Promise<Greeting> {
    if (this.greetings.length > 0) {
      return Promise.resolve(this.greetings[this.greetings.length - 1]);
    }
    return Promise.resolve(Greeting.create("Hello World!"));
  }

  async save(greeting: Greeting): Promise<void> {
    this.greetings.push(greeting);
    return Promise.resolve();
  }
}
