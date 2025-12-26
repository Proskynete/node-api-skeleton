# ADR-0009: Use Hybrid Pragmatic Approach (OOP + FP)

## Status

Accepted

## Context

We needed to choose a programming paradigm for the project. The main options were:

1. **Pure Object-Oriented Programming (OOP)**: Traditional classes with state and methods
2. **Pure Functional Programming (FP)**: Functions, immutability, no classes
3. **Hybrid Approach**: Combination of OOP and FP principles

Considerations:
- TypeScript/Node.js ecosystem is primarily OOP-friendly
- Most libraries (Fastify, Prisma, Winston) use classes
- Domain-Driven Design traditionally uses OOP patterns
- Functional programming offers benefits like immutability and pure functions
- Team familiarity and learning curve
- Code maintainability and testability

## Decision

We will use a **Hybrid Pragmatic Approach** that combines the best of OOP and FP:

- **OOP for structure**: Entities, Value Objects, Use Cases, Repositories
- **FP for transformations**: DTOs, Mappers, Utilities
- **Immutability by default**: Use `readonly`, no setters
- **Pure functions** for data transformations
- **Composition over inheritance**
- **Type safety** with strict TypeScript

### Decision Matrix

| Concept | Implementation | Paradigm | Reason |
|---------|---------------|----------|---------|
| **Entities** | Immutable classes | OOP | Encapsulation + business methods |
| **Value Objects** | Immutable classes | OOP | Validation + equality |
| **DTOs** | Types/Interfaces | FP | Data only, no behavior |
| **Mappers** | Pure functions | FP | Stateless transformations |
| **Use Cases** | Classes | OOP | DI natural, testing easy |
| **Repositories** | Classes | OOP | State management |
| **Controllers** | Classes | OOP | DI, framework integration |
| **Utilities** | Pure functions | FP | Helpers without state |

### Core Principles

1. **Immutability**: All data structures use `readonly`
2. **No Setters**: Entities cannot be mutated after creation
3. **Factory Methods**: Use static factory methods for entity creation
4. **Pure Functions**: Data transformations are side-effect free
5. **Single Responsibility**: Each class/function has one reason to change
6. **Dependency Injection**: Constructor injection for dependencies

## Consequences

### Positive

- **Pragmatic**: Use the right tool for each job
- **Familiar**: Easy for TypeScript developers to understand
- **Ecosystem-friendly**: Compatible with popular libraries
- **Best of both worlds**: Encapsulation + immutability
- **DDD-aligned**: Follows Domain-Driven Design patterns
- **Testable**: Pure functions and DI make testing easy
- **Type-safe**: Strict TypeScript with no mutations

### Negative

- **Learning curve**: Developers need to know when to use OOP vs FP
- **Code review**: Need to ensure consistency across team
- **Not dogmatic**: Requires judgment calls on some decisions

### Neutral

- **Flexibility**: Team can choose the best approach for each situation
- **Evolution**: Patterns can evolve as we learn

## Examples

### Entities (OOP)

```typescript
export class Greeting {
  private constructor(
    private readonly _message: Message,
    private readonly _createdAt: Date
  ) {}

  static create(text: string): Greeting {
    const message = Message.create(text);
    return new Greeting(message, new Date());
  }

  get message(): string {
    return this._message.value;
  }

  // Pure business method
  isRecent(): boolean {
    const hours = (Date.now() - this._createdAt.getTime()) / (1000 * 60 * 60);
    return hours < 24;
  }
}
```

### DTOs (FP)

```typescript
import { z } from 'zod';

export const GreetingResponseSchema = z.object({
  message: z.string().min(1),
  timestamp: z.string().datetime().optional(),
});

export type GreetingResponseDto = z.infer<typeof GreetingResponseSchema>;
```

### Mappers (FP)

```typescript
// Pure functions
export const greetingToDto = (entity: Greeting): GreetingResponseDto => ({
  message: entity.message,
});

export const greetingsToDto = (entities: Greeting[]): GreetingResponseDto[] =>
  entities.map(greetingToDto);
```

### Use Cases (OOP)

```typescript
export class GetGreetingUseCase implements IGetGreetingUseCase {
  constructor(
    private readonly repository: IGreetingRepository,
    private readonly logger: ILogger
  ) {}

  async execute(): Promise<GreetingResponseDto> {
    const greeting = await this.repository.getGreeting();
    return greetingToDto(greeting); // Pure function
  }
}
```

## Rules of Thumb

### Use OOP (Classes) When

- Need encapsulation of state and behavior
- Implementing an interface for dependency injection
- Managing complex state lifecycle
- Integrating with OOP libraries (Fastify, Prisma, Winston)

### Use FP (Functions) When

- Transforming data without side effects
- Simple, stateless operations
- Composing multiple operations
- DTOs with no behavior

### Always

- Make data immutable (`readonly`)
- Avoid inheritance (use composition)
- Keep functions pure when possible
- Use type safety strictly

### Never

- Add setters to domain entities
- Mutate data after creation
- Use deep inheritance hierarchies
- Mix business logic with infrastructure

## Alternatives Considered

### Alternative 1: Pure OOP

```typescript
class Greeting {
  constructor(public message: string) {}

  setMessage(message: string) { // Mutable
    this.message = message;
  }
}
```

- **Pros**: Familiar to OOP developers, simple
- **Cons**: Mutable state, harder to reason about, side effects
- **Why rejected**: Immutability is crucial for predictability

### Alternative 2: Pure FP (No Classes)

```typescript
type Greeting = { message: string; createdAt: Date };
const createGreeting = (text: string): Greeting => ({ ... });
const getMessage = (g: Greeting): string => g.message;
```

- **Pros**: Predictable, composable, no hidden state
- **Cons**: Verbose, ecosystem mismatch, unfamiliar to many devs
- **Why rejected**: Poor integration with TypeScript/Node.js ecosystem

### Alternative 3: OOP with Decorators (NestJS style)

```typescript
@Injectable()
class GreetingService {
  @Inject() private repository: Repository;
}
```

- **Pros**: Powerful DI, enterprise patterns
- **Cons**: Relies on experimental decorators, magic, complex
- **Why rejected**: Too much magic, experimental features

## Migration Guide

When encountering code that needs refactoring:

1. **Is it data transformation?** → Use pure function
2. **Does it have state to manage?** → Use class
3. **Is it a DTO?** → Use type/interface
4. **Does it need DI?** → Use class
5. **Is it a utility?** → Use pure function

## References

- [Functional Programming in TypeScript](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes-func.html)
- [DDD with TypeScript](https://khalilstemmler.com/articles/typescript-domain-driven-design/)
- [Immutability in TypeScript](https://www.typescriptlang.org/docs/handbook/utility-types.html#readonlytype)
- [Composition vs Inheritance](https://en.wikipedia.org/wiki/Composition_over_inheritance)
