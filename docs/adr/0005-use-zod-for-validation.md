# ADR-0005: Use Zod for Runtime Validation

## Status

Accepted

## Context

TypeScript provides compile-time type safety, but it doesn't validate data at runtime. We need runtime validation for:

- Environment variables
- HTTP request payloads
- External API responses
- Configuration files
- Any data from untrusted sources

We needed a validation library that would:
- Provide runtime type safety
- Integrate well with TypeScript
- Have good error messages
- Be performant
- Support complex validation scenarios

## Decision

We will use **Zod** for runtime validation and schema definition.

### Use Cases

1. **Environment Variables**: Validate configuration at startup
2. **HTTP Requests**: Validate request bodies, query parameters
3. **DTOs**: Define and validate data transfer objects
4. **External Data**: Validate responses from external APIs

### Implementation Example

```typescript
import { z } from 'zod';

// Schema definition
const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']),
});

// Type inference
type Environment = z.infer<typeof envSchema>;

// Validation
const env = envSchema.parse(process.env);
```

## Consequences

### Positive

- **Type inference**: Automatically generates TypeScript types from schemas
- **Runtime safety**: Catches invalid data at runtime
- **Great DX**: Excellent error messages for debugging
- **TypeScript-first**: Designed specifically for TypeScript
- **Composable**: Easy to build complex schemas from simpler ones
- **Zero dependencies**: Small bundle size
- **Transformation**: Can transform data while validating (coerce, default, etc.)

### Negative

- **Runtime overhead**: Validation has a small performance cost
- **Learning curve**: New API to learn for validation
- **Bundle size**: Adds to client-side bundle (not relevant for backend)

### Neutral

- **Alternative to JSON Schema**: Different approach from JSON Schema
- **Fastify integration**: Works with @fastify/type-provider-zod

## Alternatives Considered

### Alternative 1: JSON Schema + Ajv

- **Pros**: Standard format, very fast, Fastify's default
- **Cons**: Verbose schemas, no TypeScript type inference
- **Why rejected**: Poor TypeScript integration, verbose syntax

### Alternative 2: Joi

- **Pros**: Mature, extensive features, popular
- **Cons**: Designed for JavaScript, poor TypeScript inference
- **Why rejected**: Not TypeScript-first, larger bundle

### Alternative 3: Yup

- **Pros**: Similar API to Zod, popular in React ecosystem
- **Cons**: Slower than Zod, larger bundle, JavaScript-first
- **Why rejected**: Zod is faster and more TypeScript-friendly

### Alternative 4: class-validator

- **Pros**: Decorator-based, works with class-transformer
- **Cons**: Requires classes, decorator metadata, experimental features
- **Why rejected**: Too coupled to classes, experimental decorators

## References

- [Zod Official Website](https://zod.dev/)
- [Zod GitHub](https://github.com/colinhacks/zod)
- [Fastify Type Provider Zod](https://github.com/turkerdev/fastify-type-provider-zod)
- [Zod vs Alternatives](https://github.com/colinhacks/zod#comparison)
