# ADR-0006: Use Winston for Logging

## Status

Accepted

## Context

Production applications require structured logging for:
- Debugging issues
- Monitoring application health
- Security auditing
- Performance analysis
- Integration with log aggregation systems (ELK, Datadog, etc.)

Fastify includes Pino as its default logger, but we needed to evaluate if it met all our logging requirements, particularly:
- Structured JSON logging
- Multiple transports (console, file, external services)
- Log levels
- Performance
- Extensibility

## Decision

We will use **Winston** as the primary logging library, while still leveraging Pino for Fastify's internal logging in production.

### Strategy

- **Development**: Use Pino-pretty for human-readable logs
- **Production**: Use Winston for application logging
- **HTTP logs**: Keep Fastify's Pino for request/response logging

### Implementation

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});
```

## Consequences

### Positive

- **Flexible transports**: Easy to add file, database, or cloud logging
- **Structured logging**: JSON format for log aggregation systems
- **Production-proven**: Used by many enterprise applications
- **Rich ecosystem**: Many plugins and transports available
- **Custom formats**: Highly customizable log output
- **Error handling**: Built-in error transport handling

### Negative

- **Slightly slower**: Winston is slower than Pino
- **More configuration**: Requires more setup than Pino
- **Two loggers**: Need to manage both Winston and Pino

### Neutral

- **Bundle size**: Larger than Pino but acceptable for backend
- **Learning curve**: Familiar API, easy to learn

## Alternatives Considered

### Alternative 1: Pino (Fastify default)

- **Pros**: Fastest logger, Fastify native, minimal config
- **Cons**: Limited transports, less flexible
- **Why not fully adopted**: We use it for HTTP logs, but want more flexibility

### Alternative 2: Bunyan

- **Pros**: Structured logging, JSON output, similar to Pino
- **Cons**: Less active development, smaller ecosystem
- **Why rejected**: Less active than Winston, similar features

### Alternative 3: Log4js

- **Pros**: Mature, Java Log4j equivalent, multiple appenders
- **Cons**: Java-style API, less modern, verbose configuration
- **Why rejected**: Less idiomatic for Node.js projects

### Alternative 4: Console.log

- **Pros**: Zero dependencies, simple
- **Cons**: No structure, no levels, no transports
- **Why rejected**: Not suitable for production applications

## Hybrid Approach

We use both Winston and Pino strategically:

| Component | Logger | Reason |
|-----------|--------|---------|
| Application code | Winston | Flexibility, transports |
| HTTP requests | Pino (Fastify) | Performance, integration |
| Development | Pino-pretty | Readable output |

## References

- [Winston Official Docs](https://github.com/winstonjs/winston)
- [Pino Official Docs](https://getpino.io/)
- [Fastify Logging](https://fastify.dev/docs/latest/Reference/Logging/)
- [12-Factor App Logs](https://12factor.net/logs)
