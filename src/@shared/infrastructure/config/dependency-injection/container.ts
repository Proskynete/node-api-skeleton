import { GetGreetingUseCase } from "@contexts/greetings/application/v1/use-cases/GetGreetingUseCase";
import { InMemoryGreetingRepository } from "@contexts/greetings/infrastructure/persistence/InMemoryGreetingRepository";
import { GreetingController } from "@contexts/greetings/infrastructure/http/v1/controllers/GreetingController";
import { WinstonLogger } from "@shared/infrastructure/observability/WinstonLogger";
import { ILogger } from "@shared/infrastructure/observability/ILogger";
import { IGreetingRepository } from "@contexts/greetings/application/v1/ports/outbound/IGreetingRepository";
import { env } from "@shared/infrastructure/config/environment";

/**
 * Dependency Injection Container
 * Manages service instantiation and lifecycle
 * Supports singleton and transient scopes
 */
class Container {
  private services: Map<string, { factory: () => any; singleton: boolean }> =
    new Map();
  private singletons: Map<string, any> = new Map();

  /**
   * Register a singleton service (single instance shared across app)
   */
  registerSingleton<T>(name: string, factory: () => T): void {
    this.services.set(name, { factory, singleton: true });
  }

  /**
   * Register a transient service (new instance on each resolution)
   */
  register<T>(name: string, factory: () => T): void {
    this.services.set(name, { factory, singleton: false });
  }

  /**
   * Resolve a service by name
   */
  resolve<T>(name: string): T {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service ${name} not registered in container`);
    }

    if (service.singleton) {
      if (!this.singletons.has(name)) {
        this.singletons.set(name, service.factory());
      }
      return this.singletons.get(name);
    }

    return service.factory();
  }
}

export const container = new Container();

// Register shared services (singletons)
container.registerSingleton<ILogger>(
  "logger",
  () => new WinstonLogger(env.LOG_LEVEL)
);

// Register greetings context services
container.register<IGreetingRepository>(
  "greetingRepository",
  () => new InMemoryGreetingRepository()
);

container.register(
  "getGreetingUseCase",
  () =>
    new GetGreetingUseCase(
      container.resolve<IGreetingRepository>("greetingRepository"),
      container.resolve<ILogger>("logger")
    )
);

container.register(
  "greetingController",
  () =>
    new GreetingController(
      container.resolve("getGreetingUseCase"),
      container.resolve<ILogger>("logger")
    )
);
