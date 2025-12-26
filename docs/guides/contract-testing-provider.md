# Pact Provider Tests - Validation Guide for HTTP Inbound Adapters

> **✅ ACTIVE**: This type of test is implemented in the project.
> See: `test/contract/greetings-provider.pact.spec.ts`

## Hexagonal Architecture: Provider Tests

Provider tests validate the **HTTP INBOUND ADAPTER** (infrastructure layer) that exposes our API to external consumers.

### Components Tested

- `@contexts/greetings/infrastructure/http/v1/controllers/GreetingController.ts`
- `@contexts/greetings/infrastructure/http/v2/controllers/GreetingController.ts`
- `@contexts/greetings/infrastructure/http/v*/routes/greeting.routes.ts`

### ✅ What It Validates

- HTTP endpoints comply with contracts established by consumers
- HTTP Inbound adapter correctly transforms responses
- Controllers return expected DTOs

### ❌ What It Does NOT Validate

- Business logic (domain layer)
- Use cases (application layer)
- Repositories (infrastructure/persistence)

## Validation Flow

1. External consumer defines contract (pact file)
2. This test verifies our controllers fulfill that contract
3. Validates endpoints: `/api/v1/greetings`, `/api/v2/greetings`

## In Production

- Consumer publishes pact to Pact Broker
- Provider (us) downloads and verifies contracts
- Results are published back to Broker

## Reference Implementation

### Test Structure

```typescript
import { buildApp } from "@app/server/app";
import { Verifier, VerifierOptions } from "@pact-foundation/pact";
import { FastifyInstance } from "fastify";
import path from "path";
import { afterAll, beforeAll, describe, it } from "vitest";

describe("Pact Provider - HTTP Inbound Adapter (Controllers)", () => {
  let app: FastifyInstance;
  const PORT = 5055; // Different port to avoid conflicts

  beforeAll(async () => {
    // Starts complete HTTP inbound adapter (Fastify + Controllers)
    app = await buildApp();
    await app.listen({ port: PORT });
  });

  afterAll(async () => {
    await app.close();
  });

  it("should verify HTTP inbound adapter fulfills consumer contracts", async () => {
    const opts: VerifierOptions = {
      provider: "GreetingsAPI",
      providerBaseUrl: `http://localhost:${PORT}`,

      // In production, pacts are obtained from Pact Broker:
      // pactBrokerUrl: 'https://your-pact-broker.com',
      // pactBrokerToken: process.env.PACT_BROKER_TOKEN,

      // For this example, we use local pact files
      pactUrls: [
        path.resolve(__dirname, "../../pacts/webapp-greetingsapi.json"),
      ],

      stateHandlers: {
        "the API is healthy": async () => {
          return Promise.resolve();
        },
        "default greeting exists": async () => {
          return Promise.resolve();
        },
      },

      requestFilter: (req, res, next) => {
        // Example: Add authentication headers
        // req.headers['Authorization'] = 'Bearer test-token';
        next();
      },

      publishVerificationResult: process.env.CI === "true",
      providerVersion: process.env.GIT_COMMIT || "dev",
      providerVersionTags: process.env.GIT_BRANCH
        ? [process.env.GIT_BRANCH]
        : ["dev"],
    };

    const pactFile = path.resolve(
      __dirname,
      "../../pacts/webapp-greetingsapi.json"
    );
    const fs = await import("fs");
    if (!fs.existsSync(pactFile)) {
      console.log("⚠️  Pact file not found. Skipping provider verification.");
      return;
    }

    const verifier = new Verifier(opts);
    await verifier.verifyProvider();
  }, 30000);
});
```

## State Handlers

State handlers prepare the system for specific scenarios.

### Example: Basic State

```typescript
stateHandlers: {
  "default greeting exists": async () => {
    // Setup: Ensure default greeting exists
    // Our InMemoryRepository always has data
    // In production, this could seed a database
    return Promise.resolve();
  }
}
```

### Example: Data Preparation

```typescript
stateHandlers: {
  "user is authenticated": async () => {
    // Create test user and generate token
    await createTestUser();
    return Promise.resolve();
  },
  "product in stock": async () => {
    // Seed database with available product
    await seedProduct({ id: "123", stock: 10 });
    return Promise.resolve();
  }
}
```

## Request Filters

Allow adding headers, authentication, etc.

```typescript
requestFilter: (req, res, next) => {
  // Add authentication headers
  req.headers['Authorization'] = 'Bearer test-token';
  req.headers['X-API-Key'] = 'test-api-key';
  next();
}
```

## Verifier Configuration

### Main Options

- **provider**: Provider name (our API)
- **providerBaseUrl**: URL where provider runs during test
- **pactUrls**: Paths to pact files (local) or empty array if using broker
- **pactBrokerUrl**: Pact Broker URL (production)
- **pactBrokerToken**: Authentication token for Pact Broker
- **stateHandlers**: Functions to prepare specific states
- **requestFilter**: Middleware to modify requests before processing
- **publishVerificationResult**: Publish results to broker (true in CI)
- **providerVersion**: Provider version (git commit in CI)
- **providerVersionTags**: Version tags (branch name)

## CI/CD Integration

### Environment Variables

```bash
export CI=true
export GIT_COMMIT=$(git rev-parse HEAD)
export GIT_BRANCH=$(git branch --show-current)
export PACT_BROKER_URL=https://your-pact-broker.com
export PACT_BROKER_TOKEN=your-token
```

### GitHub Actions Example

```yaml
name: Contract Tests

jobs:
  provider-verification:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install

      - name: Verify Provider Contracts
        env:
          CI: true
          GIT_COMMIT: ${{ github.sha }}
          GIT_BRANCH: ${{ github.ref_name }}
          PACT_BROKER_URL: ${{ secrets.PACT_BROKER_URL }}
          PACT_BROKER_TOKEN: ${{ secrets.PACT_BROKER_TOKEN }}
        run: npm run test:contract

      - name: Publish Verification Results
        if: success()
        env:
          PACT_BROKER_URL: ${{ secrets.PACT_BROKER_URL }}
          PACT_BROKER_TOKEN: ${{ secrets.PACT_BROKER_TOKEN }}
        run: |
          npx pact-broker publish-verification-results \
            --provider=GreetingsAPI \
            --provider-version=${{ github.sha }}
```

## Handling Pact Files

### Local Development

Pact files are generated in `pacts/` and read locally:

```typescript
pactUrls: [
  path.resolve(__dirname, "../../pacts/webapp-greetingsapi.json"),
]
```

### Production with Pact Broker

In production, pacts are obtained from broker:

```typescript
pactBrokerUrl: process.env.PACT_BROKER_URL,
pactBrokerToken: process.env.PACT_BROKER_TOKEN,
// DO NOT use pactUrls when using broker
```

## Best Practices

### ✅ DO

- Be specific in contract expectations
- Implement all states that consumers need
- Run provider tests in CI/CD
- Version correctly with git commit hash
- Publish results to Pact Broker
- Use request filters for authentication if needed
- Document state handlers clearly

### ❌ DON'T

- DO NOT test business logic (use unit tests)
- DO NOT test use cases (use integration tests)
- DO NOT skip necessary state handlers
- DO NOT hardcode tokens or credentials
- DO NOT forget to close server in afterAll

## Troubleshooting

### Error: Pact file not found

**Problem**: Test cannot find pact file.

**Solution**: Verify that:
- Consumer has generated pact file
- Path in `pactUrls` is correct
- Or configure `pactBrokerUrl` instead of using local files

### Error: State handler not found

**Problem**: Consumer requires a state that's not implemented.

**Solution**: Add corresponding state handler:

```typescript
stateHandlers: {
  "state name": async () => {
    // Prepare system for this state
    return Promise.resolve();
  }
}
```

### Error: Request timeout

**Problem**: Server doesn't respond in time.

**Solution**:
- Increase test timeout (default: 30000ms)
- Verify server is running on correct port
- Check server logs for errors

## Resources

- [Pact Documentation](https://docs.pact.io/)
- [Pact JS](https://github.com/pact-foundation/pact-js)
- [Pact Provider Verification](https://docs.pact.io/implementation_guides/javascript/docs/provider)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)

## See Also

- [Contract Testing README](../../test/contract/README.md) - General contract testing documentation
- [Consumer Tests Guide](./contract-testing-consumer.md) - Guide for consumer tests (HTTP outbound)

---

**Last Updated**: December 2024
**Status**: ✅ Implemented and active
