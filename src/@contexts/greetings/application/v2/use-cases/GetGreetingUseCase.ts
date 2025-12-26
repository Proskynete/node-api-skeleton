import { IGreetingRepository } from "@contexts/greetings/application/v1/ports/outbound/IGreetingRepository";
import { GreetingResponseDto } from "@contexts/greetings/application/v2/dtos/GreetingResponseDto";
import { greetingToDto } from "@contexts/greetings/application/v2/mappers/GreetingMapper";
import { IGetGreetingUseCase } from "@contexts/greetings/application/v2/ports/inbound/IGetGreetingUseCase";
import { GreetingFetchException } from "@contexts/greetings/domain/exceptions/GreetingFetchException";
import { DomainException } from "@shared/domain/exceptions/DomainException";
import { ILogger } from "@shared/infrastructure/observability/ILogger";
import { fail, ok, Result } from "@shared/types/result";

/**
 * Use Case: Get Greeting (v2)
 * Enhanced version that includes timestamp and version metadata
 * Implements business logic for retrieving greeting with additional info
 * Follows hexagonal architecture with dependency injection
 * Uses Result type for explicit error handling
 */
export class GetGreetingUseCase implements IGetGreetingUseCase {
  constructor(
    private readonly repository: IGreetingRepository,
    private readonly logger: ILogger
  ) {}

  async execute(): Promise<Result<GreetingResponseDto, DomainException>> {
    try {
      this.logger.debug("GetGreetingUseCase V2: Fetching greeting");

      const greeting = await this.repository.getGreeting();

      this.logger.info("GetGreetingUseCase V2: Greeting fetched successfully");

      // Use pure function mapper to convert entity to DTO v2
      const dto = greetingToDto(greeting);
      return ok(dto);
    } catch (error) {
      this.logger.error(
        "GetGreetingUseCase V2: Failed to fetch greeting",
        error as Error
      );

      if (error instanceof DomainException) {
        return fail(error);
      }

      // Wrap unexpected errors
      return fail(new GreetingFetchException());
    }
  }
}
