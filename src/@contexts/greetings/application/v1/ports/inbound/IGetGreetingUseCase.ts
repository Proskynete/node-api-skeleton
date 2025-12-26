import { GreetingResponseDto } from "@contexts/greetings/application/v1/dtos/GreetingResponseDto";
import { DomainException } from "@shared/domain/exceptions/DomainException";
import { Result } from "@shared/types/result";

export interface IGetGreetingUseCase {
  execute(): Promise<Result<GreetingResponseDto, DomainException>>;
}
