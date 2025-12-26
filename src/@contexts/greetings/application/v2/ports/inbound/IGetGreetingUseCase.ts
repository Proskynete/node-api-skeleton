import { GreetingResponseDto } from "@contexts/greetings/application/v2/dtos/GreetingResponseDto";
import { DomainException } from "@shared/domain/exceptions/DomainException";
import { Result } from "@shared/types/result";

/**
 * Get Greeting Use Case Interface (v2)
 * Inbound port for retrieving greeting with enhanced metadata
 */
export interface IGetGreetingUseCase {
  execute(): Promise<Result<GreetingResponseDto, DomainException>>;
}
