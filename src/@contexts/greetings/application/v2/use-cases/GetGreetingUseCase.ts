import { IGreetingRepository } from "@contexts/greetings/application/v1/ports/outbound/IGreetingRepository";
import { GreetingResponseDto } from "@contexts/greetings/application/v2/dtos/GreetingResponseDto";
import { greetingToDto } from "@contexts/greetings/application/v2/mappers/GreetingMapper";
import { IGetGreetingUseCase } from "@contexts/greetings/application/v2/ports/inbound/IGetGreetingUseCase";
import { ILogger } from "@shared/infrastructure/observability/ILogger";

/**
 * Use Case: Get Greeting (v2)
 * Enhanced version that includes timestamp and version metadata
 * Implements business logic for retrieving greeting with additional info
 * Follows hexagonal architecture with dependency injection
 */
export class GetGreetingUseCase implements IGetGreetingUseCase {
  constructor(
    private readonly repository: IGreetingRepository,
    private readonly logger: ILogger
  ) {}

  async execute(): Promise<GreetingResponseDto> {
    this.logger.debug("GetGreetingUseCase V2: Fetching greeting");

    const greeting = await this.repository.getGreeting();

    this.logger.info("GetGreetingUseCase V2: Greeting fetched successfully");

    // Use pure function mapper to convert entity to DTO v2
    return greetingToDto(greeting);
  }
}
