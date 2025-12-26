import { GreetingResponseDto } from "@contexts/greetings/application/v1/dtos/GreetingResponseDto";
import { Greeting } from "@contexts/greetings/domain/entities/Greeting";

/**
 * Maps Greeting entity to GreetingResponseDto
 * Pure function - no side effects
 */
export const greetingToDto = (entity: Greeting): GreetingResponseDto => ({
  message: entity.message,
});

/**
 * Maps domain text to Greeting entity
 * Pure function - no side effects
 */
export const greetingToDomain = (message: string): Greeting =>
  Greeting.create(message);

/**
 * Maps array of Greeting entities to array of DTOs
 * Composition of greetingToDto
 */
export const greetingsToDtos = (entities: Greeting[]): GreetingResponseDto[] =>
  entities.map(greetingToDto);
