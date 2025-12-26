import { GreetingResponseDto } from "@contexts/greetings/application/v1/dtos/GreetingResponseDto";
import { greetingToDto } from "@contexts/greetings/application/v1/mappers/GreetingMapper";
import { IGetGreetingUseCase } from "@contexts/greetings/application/v1/ports/inbound/IGetGreetingUseCase";
import { IGreetingRepository } from "@contexts/greetings/application/v1/ports/outbound/IGreetingRepository";
import { GreetingFetchException } from "@contexts/greetings/domain/exceptions/GreetingFetchException";
import { DomainException } from "@shared/domain/exceptions/DomainException";
import { ILogger } from "@shared/infrastructure/observability/ILogger";
import { fail, ok, Result } from "@shared/types/result";

/**
 * Use Case: Get Greeting
 * Implements business logic for retrieving a greeting message
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
      this.logger.debug("GetGreetingUseCase: Fetching greeting");

      const greeting = await this.repository.getGreeting();

      this.logger.info("GetGreetingUseCase: Greeting fetched successfully");

      // Use pure function mapper to convert entity to DTO
      const dto = greetingToDto(greeting);
      return ok(dto);
    } catch (error) {
      this.logger.error(
        "GetGreetingUseCase: Failed to fetch greeting",
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
