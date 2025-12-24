import { GreetingResponseDto } from "@contexts/greetings/application/v2/dtos/GreetingResponseDto";

/**
 * Get Greeting Use Case Interface (v2)
 * Inbound port for retrieving greeting with enhanced metadata
 */
export interface IGetGreetingUseCase {
  execute(): Promise<GreetingResponseDto>;
}
