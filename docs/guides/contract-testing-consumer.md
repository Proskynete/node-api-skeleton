# Pact Consumer Tests - Reference Guide for HTTP Outbound Adapters

> **⚠️ IMPORTANT**: This project does NOT have HTTP outbound adapters currently.
> This guide is reference documentation for future implementations.

## Hexagonal Architecture: Consumer Tests

Consumer tests validate **HTTP OUTBOUND ADAPTERS** (infrastructure layer) that **CONSUME** external APIs.

### Components to Test (if they existed)

- `@contexts/{context}/infrastructure/clients/ExternalApiClient.ts`
- `@contexts/{context}/infrastructure/adapters/http/WeatherApiAdapter.ts`
- Any adapter that consumes external HTTP services

### ✅ What It Would Validate

- HTTP outbound adapter complies with external API contract
- HTTP client correctly maps external responses to domain entities
- Adapter correctly handles different provider states

### ❌ What It Does NOT Validate

- Business logic (domain layer)
- Use cases (application layer)
- Inbound adapters (that's for provider tests)
- In-memory repositories (not external HTTP services)

## Current Project State

- ❌ We do NOT have HTTP outbound adapters
- ✅ We only have InMemoryGreetingRepository (not an external HTTP service)
- 📝 This documentation is for reference only

## When to Implement Consumer Tests

Implement consumer tests when you add adapters that consume:

- Client for external weather service
- Client for external OAuth authentication
- Client for payment services (Stripe, PayPal, etc.)
- Client for notification services (SendGrid, Twilio, etc.)
- Client for any external API your system consumes

## Workflow with Consumer Tests

1. Our HTTP client defines expectations from external API (consumer test)
2. Pact file is generated with the contract
3. Published to Pact Broker
4. External provider verifies it meets the contract
5. Both parties have guarantee that contract is fulfilled

## Conceptual Example: WeatherApiClient

If we had an HTTP outbound adapter to consume a weather API:

### 1. Define the Port (Application Layer)

```typescript
// src/@contexts/weather/application/ports/outbound/IWeatherService.ts
export interface IWeatherService {
  getWeather(city: string): Promise<Weather>;
}
```

### 2. Implement the Adapter (Infrastructure Layer)

```typescript
// src/@contexts/weather/infrastructure/clients/WeatherApiClient.ts
import { IWeatherService } from "@contexts/weather/application/ports/outbound/IWeatherService";
import { Weather } from "@contexts/weather/domain/entities/Weather";

export class WeatherApiClient implements IWeatherService {
  constructor(
    private readonly baseUrl: string,
    private readonly httpClient: HttpClient
  ) {}

  async getWeather(city: string): Promise<Weather> {
    // HTTP Outbound Adapter - consumes external API
    const response = await this.httpClient.get(
      `${this.baseUrl}/weather?city=${city}`
    );

    // Maps from external format to domain entity
    return WeatherMapper.toDomain(response.data);
  }
}
```

### 3. Create the Mapper

```typescript
// src/@contexts/weather/infrastructure/clients/WeatherMapper.ts
export const WeatherMapper = {
  toDomain(externalData: ExternalWeatherDto): Weather {
    return Weather.create({
      temperature: Temperature.create(externalData.temperature),
      humidity: Humidity.create(externalData.humidity),
      condition: WeatherCondition.create(externalData.condition),
    });
  }
};
```

### 4. Create the Consumer Test

```typescript
// test/contract/weather-consumer.pact.spec.ts
import { Pact } from "@pact-foundation/pact";
import { WeatherApiClient } from "@contexts/weather/infrastructure/clients/WeatherApiClient";
import path from "path";

describe("Pact Consumer - WeatherApiClient Adapter", () => {
  const provider = new Pact({
    consumer: "GreetingsAPI",
    provider: "WeatherAPI",
    port: 5057,
    dir: path.resolve(process.cwd(), "pacts"),
  });

  beforeAll(async () => await provider.setup());
  afterAll(async () => await provider.finalize());

  it("should get weather data from external API", async () => {
    // Define expected contract from external API
    await provider.addInteraction({
      state: "weather data exists for Madrid",
      uponReceiving: "a request for Madrid weather",
      withRequest: {
        method: "GET",
        path: "/weather",
        query: { city: "Madrid" }
      },
      willRespondWith: {
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: {
          temperature: 25,
          humidity: 60,
          condition: "sunny"
        }
      }
    });

    // Test HTTP outbound adapter
    const client = new WeatherApiClient(
      provider.mockService.baseUrl,
      httpClient
    );
    const weather = await client.getWeather("Madrid");

    // Validations: verify adapter maps correctly
    expect(weather).toBeInstanceOf(Weather);
    expect(weather.temperature.value).toBe(25);
    expect(weather.condition.value).toBe("sunny");

    // Verify contract
    await provider.verify();
  });
});
```

## Test Examples for Different Endpoints

### Example: Test for v1 Endpoint

If we had a client consuming `/api/v1/greetings` from an external service:

```typescript
describe("GET /api/v1/greetings - Outbound Adapter", () => {
  beforeAll(async () => {
    await provider.addInteraction({
      state: "default greeting exists",
      uponReceiving: "a request for greeting v1 from external service",
      withRequest: {
        method: "GET",
        path: "/api/v1/greetings",
      },
      willRespondWith: {
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: { message: "Hello World!" }
      }
    });
  });

  it("should consume external API and map to domain entity", async () => {
    // Use HTTP outbound adapter
    const client = new ExternalGreetingApiClient(mockServerBaseUrl);
    const greeting = await client.getGreeting();

    // Validate adapter maps to domain entity
    expect(greeting).toBeInstanceOf(Greeting);
    expect(greeting.message.value).toBe("Hello World!");

    await provider.verify();
  });
});
```

### Example: Test for v2 Endpoint with Additional Fields

```typescript
describe("GET /api/v2/greetings - Enhanced Outbound Adapter", () => {
  beforeAll(async () => {
    await provider.addInteraction({
      state: "default greeting exists",
      uponReceiving: "a request for greeting v2",
      withRequest: {
        method: "GET",
        path: "/api/v2/greetings",
      },
      willRespondWith: {
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: {
          message: "Hello World!",
          timestamp: "2024-01-01T00:00:00.000Z",
          version: "2.0"
        }
      }
    });
  });

  it("should consume enhanced API with additional fields", async () => {
    const client = new ExternalGreetingApiClient(mockServerBaseUrl);
    const greeting = await client.getEnhancedGreeting();

    // Validate complete mapping to domain
    expect(greeting.message.value).toBe("Hello World!");
    expect(greeting.timestamp).toBeInstanceOf(Date);
    expect(greeting.version).toBe("2.0");

    await provider.verify();
  });
});
```

## Implementation Notes

### 1. Adapter Location

```
src/@contexts/{context}/infrastructure/clients/
src/@contexts/{context}/infrastructure/adapters/http/
```

### 2. Adapter Structure

- Constructor receives baseUrl and httpClient
- Methods make HTTP requests to external API
- ALWAYS maps responses to domain entities
- Implements an interface (port) from application layer

### 3. Mappers

- Converts external DTOs to domain entities
- Validates external data before creating entities
- Handles missing or invalid data cases

### 4. Dependency Injection

```typescript
container.register({
  externalApiClient: asClass(ExternalApiClient).singleton(),
});
```

### 5. Provider States

- Defines states that provider must support
- Examples: "user exists", "product available", "authenticated"
- Provider configures its system according to these states

### 6. Run Tests

```bash
npm run test:contract
```

### 7. Publish Pacts

```bash
npx pact-broker publish pacts \
  --broker-base-url=$PACT_BROKER_URL \
  --broker-token=$PACT_BROKER_TOKEN \
  --consumer-app-version=$GIT_COMMIT
```

## Best Practices

### ✅ DO

- Test complete adapter, not just fetch/axios
- Map external responses to domain entities
- Use provider states for different scenarios
- Validate contract with provider.verify()
- Publish pacts to Pact Broker
- Version your contracts

### ❌ DON'T

- DO NOT test business logic here
- DO NOT test use cases
- DO NOT expose external DTOs to rest of system
- DO NOT skip domain mapping
- DO NOT write tests without provider.verify()

## Resources

- [Pact Documentation](https://docs.pact.io/)
- [Pact JS](https://github.com/pact-foundation/pact-js)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [Consumer-Driven Contracts](https://martinfowler.com/articles/consumerDrivenContracts.html)

## To Activate These Tests

1. Create HTTP outbound adapter in `infrastructure/clients/`
2. Implement mapper to convert external DTOs to domain
3. Create specific test file: `test/contract/{name}-consumer.pact.spec.ts`
4. Copy examples above and adapt to your case
5. Run: `npm run test:contract`
6. Publish pacts to Pact Broker
7. Coordinate with provider team for verification

---

**Last Updated**: December 2024
**Status**: Reference documentation (no HTTP outbound adapters implemented)
