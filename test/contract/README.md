# Contract Testing with Pact

This directory contains contract tests using [Pact](https://pact.io/), a consumer-driven contract testing framework.

## What is Contract Testing?

Contract testing ensures that APIs meet the expectations of their consumers. Instead of testing every integration end-to-end, contract tests verify that:

1. **Consumer** defines what it expects from the provider
2. **Provider** verifies it can fulfill those expectations

## Benefits

- **Fast**: No need for full integration environments
- **Reliable**: Tests don't flake due to network issues
- **Early detection**: Catch breaking changes before deployment
- **Documentation**: Contracts serve as executable documentation
- **Microservices-friendly**: Essential for distributed systems

## File Structure

```
test/contract/
├── README.md                          # This file
├── greetings-consumer.pact.spec.ts    # Consumer test (example)
└── greetings-provider.pact.spec.ts    # Provider verification
```

## How It Works

### 1. Consumer Test (Consumer's Codebase)

The consumer defines expected interactions and generates a pact file:

```typescript
// In consumer's codebase
await provider.addInteraction({
  state: "default greeting exists",
  uponReceiving: "a request for greeting",
  withRequest: {
    method: "GET",
    path: "/api/v1/greetings",
  },
  willRespondWith: {
    status: 200,
    body: { message: "Hello World!" },
  },
});
```

This generates `pacts/consumer-provider.json`.

### 2. Provider Verification (This Codebase)

The provider verifies it can satisfy the contract:

```typescript
const verifier = new Verifier({
  provider: "GreetingsAPI",
  providerBaseUrl: "http://localhost:3000",
  pactUrls: ["./pacts/consumer-provider.json"],
});

await verifier.verifyProvider();
```

## Running Tests

### Consumer Tests (Example Only)

```bash
# These tests create pact files
npm run test -- test/contract/greetings-consumer.pact.spec.ts
```

Generated pacts will be in `pacts/` directory.

### Provider Verification

```bash
# Verify our API against consumer contracts
npm run test -- test/contract/greetings-provider.pact.spec.ts
```

**Note**: Provider tests will skip if no pact files exist (expected for skeleton).

## Workflow

### Local Development

1. Consumer team writes consumer test
2. Consumer test generates pact file
3. Consumer shares pact file with provider (via Pact Broker or git)
4. Provider runs verification tests
5. Provider confirms contract is satisfied

### CI/CD Integration

```yaml
# Example CI workflow
jobs:
  consumer:
    - run: npm run test:contract:consumer
    - run: npx pact-broker publish pacts --broker-base-url=$PACT_BROKER_URL

  provider:
    - run: npm start & # Start provider
    - run: npm run test:contract:provider
```

## Pact Broker (Production)

In production, use a [Pact Broker](https://docs.pact.io/pact_broker) to:
- Store and version pact files
- Track verification results
- Prevent breaking deployments
- Enable "can-i-deploy" checks

### Setup

```typescript
const opts = {
  provider: "GreetingsAPI",
  pactBrokerUrl: "https://your-pact-broker.com",
  pactBrokerToken: process.env.PACT_BROKER_TOKEN,
  publishVerificationResult: true,
  providerVersion: process.env.GIT_COMMIT,
};
```

## Provider States

Provider states prepare the system for specific test scenarios:

```typescript
stateHandlers: {
  "default greeting exists": async () => {
    // Setup: Seed database, mock services, etc.
    await database.seed({ greeting: "Hello World!" });
  },
  "user is authenticated": async () => {
    // Setup: Create test user, generate token
    await createTestUser();
  },
}
```

## Best Practices

### For Consumers

1. **Test real client code**: Don't just test fetch calls
2. **Be specific**: Define exact expectations, not loose schemas
3. **Use provider states**: Prepare provider for different scenarios
4. **Keep it simple**: One interaction per test

### For Providers

1. **Implement state handlers**: Support all consumer states
2. **Run in CI**: Verify on every commit
3. **Version your API**: Tag provider versions in Pact Broker
4. **Use can-i-deploy**: Check before deploying to production

### General

1. **Don't test implementation**: Test contract, not internals
2. **Share pacts**: Use Pact Broker or version control
3. **Fail fast**: Block deployment if contracts fail
4. **Document states**: Clearly describe what each state means

## Example Scenarios

### Scenario 1: API Version Upgrade

1. Consumer creates pact for v2 endpoint
2. Provider implements v2
3. Provider verifies both v1 and v2 contracts
4. Safe to deploy v2 alongside v1

### Scenario 2: Breaking Change Detection

1. Provider changes response format
2. Provider verification fails against existing pacts
3. Team is notified before deployment
4. Either fix provider or coordinate with consumers

## Limitations

Contract testing doesn't replace:
- **End-to-end tests**: Complex multi-service flows
- **Load testing**: Performance characteristics
- **Security testing**: Authentication, authorization
- **Business logic testing**: Complex domain rules

## Resources

- [Pact Documentation](https://docs.pact.io/)
- [Pact JS](https://github.com/pact-foundation/pact-js)
- [Contract Testing vs Integration Testing](https://pact.io/blog/2019/03/27/contract-testing-vs-integration-testing/)
- [Pact Nirvana](https://docs.pact.io/pact_nirvana)

## Notes for This Skeleton

The contract tests in this skeleton are **examples** to demonstrate Pact usage:

- `greetings-consumer.pact.spec.ts`: Shows how a consumer would write tests (normally in consumer's repo)
- `greetings-provider.pact.spec.ts`: Shows how provider verifies contracts

In a real project:
1. Consumer tests live in consumer repositories
2. Pact files are published to Pact Broker
3. Provider retrieves and verifies pacts from Broker
4. Results are published back to Broker
