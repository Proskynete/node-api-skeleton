# ADR-0003: Use SWC for TypeScript Compilation

## Status

Accepted

## Context

TypeScript code needs to be compiled to JavaScript for execution. The official TypeScript compiler (tsc) is the standard choice, but compilation speed can become a bottleneck as the project grows.

We needed a compilation solution that would:
- Compile TypeScript quickly
- Support modern JavaScript features
- Work well with our development workflow
- Integrate with existing tools

## Decision

We will use **SWC (Speedy Web Compiler)** for TypeScript compilation instead of the official TypeScript compiler (tsc).

### Implementation

- **Development**: Use SWC with nodemon via @swc-node/register for hot-reload
- **Production builds**: Use @swc/cli for fast compilation
- **Type checking**: Keep tsc for type checking only (build:tsc script)

### Configuration

```json
{
  "scripts": {
    "dev": "nodemon --exec \"node -r @swc-node/register\" src/main.ts",
    "build": "swc src -d dist --copy-files --strip-leading-paths",
    "build:tsc": "tsc"
  }
}
```

## Consequences

### Positive

- **20x faster compilation**: SWC is written in Rust and extremely fast
- **Faster builds**: Production builds complete in seconds instead of minutes
- **Better DX**: Instant hot-reload in development
- **Same output**: Produces equivalent JavaScript to tsc
- **Growing adoption**: Used by major projects (Next.js, Deno, etc.)

### Negative

- **Type checking**: SWC doesn't type-check (must run tsc separately)
- **Decorator support**: Limited support for experimental decorators
- **Less mature**: Newer than tsc, potential edge cases

### Neutral

- **Two-step checking**: Need to run both SWC (build) and tsc (types) in CI
- **Configuration**: Requires both tsconfig.json and .swcrc

## Alternatives Considered

### Alternative 1: TypeScript Compiler (tsc)

- **Pros**: Official compiler, type checking included, most compatible
- **Cons**: Slow compilation, especially for large projects
- **Why rejected**: Development experience suffers with slow builds

### Alternative 2: esbuild

- **Pros**: Extremely fast (written in Go), popular
- **Cons**: No type checking, limited TypeScript support
- **Why rejected**: SWC has better TypeScript support

### Alternative 3: Babel

- **Pros**: Mature, extensive plugin ecosystem
- **Cons**: Slower than SWC, complex configuration
- **Why rejected**: SWC provides better performance with less configuration

## References

- [SWC Official Website](https://swc.rs/)
- [SWC vs tsc Performance](https://swc.rs/docs/benchmarks)
- [Next.js uses SWC](https://nextjs.org/docs/architecture/nextjs-compiler)
- [@swc-node/register](https://github.com/swc-project/swc-node)
