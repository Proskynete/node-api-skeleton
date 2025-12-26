import { GreetingCreatedEventHandler } from "@contexts/greetings/application/v1/event-handlers/GreetingCreatedEventHandler";
import { IGreetingRepository } from "@contexts/greetings/application/v1/ports/outbound/IGreetingRepository";
import { GetGreetingUseCase as GetGreetingUseCaseV1 } from "@contexts/greetings/application/v1/use-cases/GetGreetingUseCase";
import { GetGreetingUseCase as GetGreetingUseCaseV2 } from "@contexts/greetings/application/v2/use-cases/GetGreetingUseCase";
import { GreetingController as GreetingControllerV1 } from "@contexts/greetings/infrastructure/http/v1/controllers/GreetingController";
import { GreetingController as GreetingControllerV2 } from "@contexts/greetings/infrastructure/http/v2/controllers/GreetingController";
import { InMemoryGreetingRepository } from "@contexts/greetings/infrastructure/persistence/InMemoryGreetingRepository";
import { IDomainEventPublisher } from "@shared/domain/events/IDomainEventPublisher";
import { env } from "@shared/infrastructure/config/environment";
import { InMemoryDomainEventPublisher } from "@shared/infrastructure/events/InMemoryDomainEventPublisher";
import { ILogger } from "@shared/infrastructure/observability/ILogger";
import { WinstonLogger } from "@shared/infrastructure/observability/WinstonLogger";

/**
 * Dependency Injection Container
 * Manages service instantiation and lifecycle
 * Supports singleton and transient scopes
 */
class Container {
  private services = new Map<
    string,
    { factory: () => unknown; singleton: boolean }
  >();
  private singletons = new Map<string, unknown>();

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
      return this.singletons.get(name) as T;
    }

    return service.factory() as T;
  }
}

export const container = new Container();

// Register shared services (singletons)
container.registerSingleton<ILogger>(
  "logger",
  () => new WinstonLogger(env.LOG_LEVEL)
);

// Register domain event publisher (singleton)
container.registerSingleton<IDomainEventPublisher>(
  "domainEventPublisher",
  () => new InMemoryDomainEventPublisher(container.resolve<ILogger>("logger"))
);

// Register event handlers
const registerEventHandlers = (): void => {
  const eventPublisher = container.resolve<IDomainEventPublisher>(
    "domainEventPublisher"
  );
  const logger = container.resolve<ILogger>("logger");

  // Register GreetingCreatedEventHandler
  const greetingCreatedHandler = new GreetingCreatedEventHandler(logger);
  eventPublisher.subscribe(greetingCreatedHandler);

  // Add more event handlers here as they are created
};

// Initialize event handlers
registerEventHandlers();

// Register greetings context services (shared repository)
container.register<IGreetingRepository>(
  "greetingRepository",
  () => new InMemoryGreetingRepository()
);

// V1 services
container.register(
  "getGreetingUseCaseV1",
  () =>
    new GetGreetingUseCaseV1(
      container.resolve<IGreetingRepository>("greetingRepository"),
      container.resolve<ILogger>("logger")
    )
);

container.register(
  "greetingController",
  () =>
    new GreetingControllerV1(
      container.resolve("getGreetingUseCaseV1"),
      container.resolve<ILogger>("logger")
    )
);

// V2 services
container.register(
  "getGreetingUseCaseV2",
  () =>
    new GetGreetingUseCaseV2(
      container.resolve<IGreetingRepository>("greetingRepository"),
      container.resolve<ILogger>("logger")
    )
);

container.register(
  "greetingControllerV2",
  () =>
    new GreetingControllerV2(
      container.resolve("getGreetingUseCaseV2"),
      container.resolve<ILogger>("logger")
    )
);
