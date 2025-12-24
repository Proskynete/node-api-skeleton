import { Greeting } from "@contexts/greetings/domain/entities/Greeting";

export interface IGreetingRepository {
  getGreeting(): Promise<Greeting>;
  save(greeting: Greeting): Promise<void>;
}
