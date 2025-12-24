import { IGetGreetingUseCase } from "@contexts/greetings/application/v1/ports/inbound/IGetGreetingUseCase";
import { IGreetingRepository } from "@contexts/greetings/application/v1/ports/outbound/IGreetingRepository";
import { ILogger } from "@shared/infrastructure/observability/ILogger";
import { GreetingResponseDto } from "@contexts/greetings/application/v1/dtos/GreetingResponseDto";
import { greetingToDto } from "@contexts/greetings/application/v1/mappers/GreetingMapper";

/**
 * Use Case: Get Greeting
 * Implements business logic for retrieving a greeting message
 * Follows hexagonal architecture with dependency injection
 */
export class GetGreetingUseCase implements IGetGreetingUseCase {
  constructor(
    private readonly repository: IGreetingRepository,
    private readonly logger: ILogger
  ) {}

  async execute(): Promise<GreetingResponseDto> {
    this.logger.debug("GetGreetingUseCase: Fetching greeting");

    const greeting = await this.repository.getGreeting();

    this.logger.info("GetGreetingUseCase: Greeting fetched successfully");

    // Use pure function mapper to convert entity to DTO
    return greetingToDto(greeting);
  }
}
