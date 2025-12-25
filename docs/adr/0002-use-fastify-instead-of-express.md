# ADR-0002: Use Fastify instead of Express

## Status

Accepted

## Context

The project originally used Express.js as the web framework. However, we needed to evaluate whether Express was still the best choice for a modern, production-ready API skeleton, considering:

- Performance requirements
- TypeScript support
- Plugin ecosystem
- Validation and serialization
- Modern JavaScript features
- Developer experience

Express is mature and widely used but lacks native TypeScript support and has performance limitations compared to newer frameworks.

## Decision

We will use **Fastify** as the web framework instead of Express.

### Key Reasons

1. **Performance**: Fastify is ~2x faster than Express in benchmarks
2. **TypeScript First**: Native TypeScript support with excellent type inference
3. **Schema-based**: Built-in JSON Schema validation and serialization
4. **Plugin Architecture**: Encapsulated plugins with dependency injection
5. **Async/Await**: First-class async/await support
6. **OpenAPI**: Excellent Swagger/OpenAPI integration via @fastify/swagger

## Consequences

### Positive

- **Better performance**: Handles more requests per second with lower latency
- **Type safety**: Full TypeScript support catches errors at compile time
- **Validation**: Built-in request/response validation with JSON Schema or Zod
- **Modern codebase**: Uses latest JavaScript features
- **Rich ecosystem**: Growing plugin ecosystem for common needs
- **Production ready**: Used by major companies (Microsoft, Mercado Libre, etc.)

### Negative

- **Smaller community**: Less StackOverflow answers compared to Express
- **Learning curve**: Different patterns from Express (decorators, plugins, etc.)
- **Migration effort**: Existing Express knowledge doesn't transfer directly

### Neutral

- **Middleware compatibility**: Some Express middleware can be used via @fastify/express
- **Documentation**: Good documentation, though less extensive than Express

## Alternatives Considered

### Alternative 1: Keep Express

- **Pros**: Huge ecosystem, familiar to most developers, extensive documentation
- **Cons**: Slower performance, poor TypeScript support, callback-based
- **Why rejected**: Performance limitations and lack of modern features

### Alternative 2: NestJS

- **Pros**: Enterprise-ready, excellent TypeScript, dependency injection, modular
- **Cons**: Opinionated, heavy framework, adds complexity, learning curve
- **Why rejected**: Too opinionated for a skeleton/template project

### Alternative 3: Koa

- **Pros**: Modern, minimal, from Express creators
- **Cons**: Minimalist (requires many plugins), smaller ecosystem than Express
- **Why rejected**: Too minimal, similar performance to Express

### Alternative 4: Hono

- **Pros**: Ultra-fast, edge-ready, TypeScript-first
- **Cons**: Very new, smaller ecosystem
- **Why rejected**: Too new for a production skeleton

## References

- [Fastify Official Website](https://fastify.dev/)
- [Fastify Benchmarks](https://fastify.dev/benchmarks/)
- [Fastify vs Express](https://github.com/fastify/fastify/blob/main/docs/Guides/Migration-Guide-V4.md)
- [Why we moved from Express to Fastify](https://www.nearform.com/blog/why-we-moved-from-express-to-fastify/)
