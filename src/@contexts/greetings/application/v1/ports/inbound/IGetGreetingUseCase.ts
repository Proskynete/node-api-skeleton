import { GreetingResponseDto } from "@contexts/greetings/application/v1/dtos/GreetingResponseDto";

export interface IGetGreetingUseCase {
  execute(): Promise<GreetingResponseDto>;
}
