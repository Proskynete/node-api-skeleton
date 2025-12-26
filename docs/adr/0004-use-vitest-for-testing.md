# ADR-0004: Use Vitest for Testing

## Status

Accepted

## Context

The project originally used Jest for testing. While Jest is the most popular testing framework for JavaScript/TypeScript, we needed to evaluate if it was the best fit for a modern project using:

- TypeScript with SWC
- ES modules
- Fast feedback loops
- Modern JavaScript features

Jest requires additional configuration for TypeScript and ESM, and can be slow with large test suites.

## Decision

We will use **Vitest** as the testing framework instead of Jest.

### Key Features

- **Vite-powered**: Blazing fast test execution
- **Jest-compatible API**: Easy migration from Jest
- **Native ESM**: First-class ES modules support
- **TypeScript**: No additional configuration needed
- **Watch mode**: Intelligent test re-running
- **UI**: Built-in test UI (@vitest/ui)
- **Coverage**: Built-in coverage with v8

### Implementation

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage"
  }
}
```

## Consequences

### Positive

- **5-10x faster**: Test execution is significantly faster than Jest
- **No config**: Works out of the box with TypeScript and ESM
- **Better DX**: Fast watch mode with instant feedback
- **Jest compatible**: Same API, easy migration
- **Modern tooling**: Integrates well with Vite ecosystem
- **Built-in features**: UI, coverage, benchmarking included

### Negative

- **Newer**: Smaller community compared to Jest
- **Some Jest features missing**: Some advanced Jest features not yet implemented
- **Ecosystem**: Some Jest plugins may not work

### Neutral

- **API similarity**: Developers familiar with Jest will feel at home
- **Migration**: Easy to migrate back to Jest if needed

## Alternatives Considered

### Alternative 1: Jest

- **Pros**: Most popular, huge ecosystem, extensive documentation
- **Cons**: Slow, complex ESM/TS setup, slower watch mode
- **Why rejected**: Performance and configuration overhead

### Alternative 2: AVA

- **Pros**: Fast, minimal, concurrent test execution
- **Cons**: Different API, smaller ecosystem
- **Why rejected**: API differences require more learning

### Alternative 3: Node's built-in test runner

- **Pros**: No dependencies, native Node.js feature
- **Cons**: Limited features, no watch mode UI
- **Why rejected**: Too minimal for our needs

## References

- [Vitest Official Website](https://vitest.dev/)
- [Vitest vs Jest](https://vitest.dev/guide/comparisons.html#jest)
- [Why Vitest](https://vitest.dev/guide/why.html)
- [Vitest Features](https://vitest.dev/guide/features.html)
