# ADR-0008: Use Path-Based API Versioning Strategy

## Status

Accepted

## Context

APIs evolve over time, requiring breaking changes that could affect existing clients. We needed a versioning strategy that would allow us to:

- Support multiple API versions simultaneously
- Migrate clients gradually to new versions
- Deprecate old versions with clear timelines
- Maintain backward compatibility
- Clearly communicate version differences to API consumers

Different versioning strategies exist (URI path, query parameter, header, content negotiation), each with trade-offs around discoverability, caching, and developer experience.

## Decision

We will use **path-based API versioning** with the format `/api/v{version}/` for all endpoints.

### Implementation

- **Version Format**: `/api/v1/`, `/api/v2/`, etc.
- **Folder Structure**: Separate folders for each API version
- **Code Organization**: Each version has its own controllers, routes, DTOs, and use cases
- **Shared Domain**: All versions share the same domain layer (entities, value objects)

### Example Structure

```
src/@contexts/greetings/
├── domain/                  # Shared across all versions
├── application/
│   ├── v1/
│   │   ├── use-cases/
│   │   ├── dtos/
│   │   └── mappers/
│   └── v2/
│       ├── use-cases/
│       ├── dtos/
│       └── mappers/
└── infrastructure/
    └── http/
        ├── v1/
        │   ├── controllers/
        │   └── routes/
        └── v2/
            ├── controllers/
            └── routes/
```

### Deprecation Strategy

1. **Announcement**: Notify clients 3-6 months before deprecation
2. **Deprecation Headers**: Add `Deprecation: true` and `Sunset` headers
3. **Grace Period**: Minimum 3 months after deprecation announcement
4. **Sunset**: Stop serving requests, return HTTP 410 Gone
5. **Removal**: Delete code after confirmed zero usage

## Consequences

### Positive

- **Clear and explicit**: Version is visible in URL, easy to understand
- **Cacheable**: URL-based versioning works well with HTTP caching
- **Easy testing**: Can test different versions independently
- **Documentation**: Easy to generate separate docs per version
- **Browser-friendly**: Works in browsers without custom headers
- **Gradual migration**: Clients can migrate at their own pace
- **Isolated changes**: Breaking changes in v2 don't affect v1

### Negative

- **Code duplication**: Similar logic may exist across versions
- **Maintenance burden**: Need to maintain multiple versions
- **URL length**: Adds characters to every URL
- **More routes**: Increases number of registered routes

### Neutral

- **Multiple versions**: Limit to 2-3 active versions maximum
- **Shared domain**: All versions use same business logic

## Alternatives Considered

### Alternative 1: Query Parameter Versioning

```
/api/greetings?version=1
```

- **Pros**: Clean URLs, optional versioning
- **Cons**: Less visible, breaks HTTP caching, easy to forget
- **Why rejected**: Poor discoverability and caching issues

### Alternative 2: Header-Based Versioning

```
Accept: application/vnd.api.v1+json
```

- **Pros**: Clean URLs, RESTful purist approach
- **Cons**: Not browser-friendly, harder to test, requires custom headers
- **Why rejected**: Poor developer experience, not beginner-friendly

### Alternative 3: Content Negotiation

```
Accept: application/json; version=1
```

- **Pros**: Standards-based
- **Cons**: Complex, requires sophisticated HTTP clients
- **Why rejected**: Overly complex for our needs

### Alternative 4: Subdomain Versioning

```
v1.api.example.com/greetings
```

- **Pros**: Very clear separation
- **Cons**: Requires DNS configuration, SSL certificates per subdomain
- **Why rejected**: Infrastructure complexity

## Version Lifecycle

### New Version

```typescript
export const API_VERSIONS = {
  v1: {
    basePath: '/api/v1',
    isDeprecated: false,
    description: 'Initial API version',
  },
  v2: {
    basePath: '/api/v2',
    isDeprecated: false,
    description: 'Enhanced version with timestamps',
  },
};
```

### Deprecated Version

```typescript
v1: {
  basePath: '/api/v1',
  isDeprecated: true,
  deprecationDate: new Date('2026-06-01'),
  sunsetDate: new Date('2026-09-01'),
  description: 'Deprecated - migrate to v2',
}
```

Response includes:
```
Deprecation: true
Sunset: Mon, 01 Sep 2026 00:00:00 GMT
Link: </api/v1/deprecated>; rel="deprecation"
```

### Sunset Version

Returns HTTP 410 Gone:
```json
{
  "error": "Gone",
  "message": "API v1 has been sunset. Please use /api/v2",
  "sunsetDate": "2026-09-01"
}
```

## Best Practices

### Version When

- Breaking changes to request/response format
- Removing fields from responses
- Changing field types
- Modifying business logic significantly

### Don't Version For

- Adding optional fields
- Bug fixes
- Performance improvements
- Internal refactoring

### Documentation

- Maintain separate OpenAPI specs per version
- Document migration guides between versions
- Publish deprecation timelines publicly

## References

- [REST API Versioning](https://restfulapi.net/versioning/)
- [Semantic Versioning](https://semver.org/)
- [HTTP Deprecation Header](https://tools.ietf.org/id/draft-dalal-deprecation-header-00.html)
- [API Evolution Patterns](https://www.infoq.com/articles/API-Evolution-Patterns/)
