import { Greeting } from "../../../domain/greetings/entities/Greeting";

export interface IGreetingRepository {
  getGreeting(): Promise<Greeting>;
  save(greeting: Greeting): Promise<void>;
}
