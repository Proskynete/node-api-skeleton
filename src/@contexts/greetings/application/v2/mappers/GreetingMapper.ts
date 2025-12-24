import { Greeting } from "@contexts/greetings/domain/entities/Greeting";
import { GreetingResponseDto } from "@contexts/greetings/application/v2/dtos/GreetingResponseDto";

/**
 * Maps Greeting entity to GreetingResponseDto v2
 * Enhanced version with timestamp and version information
 * Pure function - no side effects
 */
export const greetingToDto = (entity: Greeting): GreetingResponseDto => ({
  message: entity.message,
  timestamp: new Date().toISOString(),
  version: "2.0",
});

/**
 * Maps domain text to Greeting entity
 * Pure function - no side effects
 */
export const greetingToDomain = (message: string): Greeting =>
  Greeting.create(message);

/**
 * Maps array of Greeting entities to array of DTOs v2
 * Composition of greetingToDto
 */
export const greetingsToDtos = (entities: Greeting[]): GreetingResponseDto[] =>
  entities.map(greetingToDto);
