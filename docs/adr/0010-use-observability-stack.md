# ADR-0010: Use Winston and Prometheus for Observability

## Status

Accepted

## Context

Production applications require comprehensive observability to:

- Debug issues in production
- Monitor application health and performance
- Track SLAs and SLOs
- Detect anomalies and incidents
- Provide audit trails
- Integrate with monitoring platforms (Grafana, Datadog, etc.)

We needed an observability solution that would provide:
- Structured logging
- Metrics collection
- Health check endpoints
- Request tracing
- Low performance overhead

## Decision

We will implement a comprehensive observability stack consisting of:

### 1. Winston for Application Logging

- **Structured JSON logging** in production
- **Pretty logging** in development (via pino-pretty for Fastify logs)
- **Multiple transports**: Console, file, external services
- **Log levels**: error, warn, info, debug

### 2. Prometheus (prom-client) for Metrics

- **HTTP request metrics**: Duration, count, status codes
- **Custom metrics**: Business-specific measurements
- **Standard metrics**: CPU, memory, event loop lag
- **Exposition endpoint**: `/metrics` for Prometheus scraping

### 3. Health Checks

- **Liveness probe**: `/health/live` - Is the app running?
- **Readiness probe**: `/health/ready` - Can the app serve traffic?
- **Dependency checks**: Database, Redis, external services

### 4. Request Tracing

- **Request ID**: Unique ID per request for log correlation
- **Response headers**: Include request ID in response
- **Log correlation**: All logs include request ID

## Consequences

### Positive

- **Production visibility**: Can debug issues without accessing logs directly
- **Performance monitoring**: Track application performance over time
- **Alerting**: Can set up alerts based on metrics
- **Standards-based**: Prometheus is industry standard
- **Kubernetes-ready**: Health checks work with K8s probes
- **Debugging**: Request IDs enable tracing requests through logs

### Negative

- **Performance overhead**: Metrics collection has small CPU/memory cost
- **Storage**: Logs and metrics consume disk space
- **Complexity**: More moving parts to maintain
- **Configuration**: Need to configure transports and metrics

### Neutral

- **Learning curve**: Team needs to understand observability concepts
- **Tooling**: Requires Prometheus and Grafana for full visibility

## Implementation Details

### Winston Logger

```typescript
export class WinstonLogger implements ILogger {
  private logger: winston.Logger;

  constructor(level: string = 'info') {
    this.logger = winston.createLogger({
      level,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({
          filename: 'error.log',
          level: 'error'
        }),
        new winston.transports.File({
          filename: 'combined.log'
        }),
      ],
    });
  }

  info(message: string, meta?: object): void {
    this.logger.info(message, meta);
  }

  error(message: string, error?: Error, meta?: object): void {
    this.logger.error(message, {
      error: error?.message,
      stack: error?.stack,
      ...meta
    });
  }
}
```

### Prometheus Metrics

```typescript
export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code', 'version'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
});

export const httpRequestTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code', 'version'],
});
```

### Health Checks

```typescript
// Liveness: Is the process alive?
app.get('/health/live', () => ({
  status: 'alive',
  timestamp: new Date().toISOString(),
}));

// Readiness: Can we serve traffic?
app.get('/health/ready', async () => {
  const checks = await Promise.all([
    checkDatabase(),
    checkMemory(),
    checkExternalServices(),
  ]);

  const allHealthy = checks.every(c => c.healthy);
  return {
    status: allHealthy ? 'ready' : 'not ready',
    checks,
  };
});
```

## Monitoring Strategy

### Key Metrics to Track

1. **Request Rate**: Requests per second
2. **Error Rate**: Percentage of failed requests
3. **Response Time**: p50, p95, p99 latencies
4. **Resource Usage**: CPU, memory, event loop lag
5. **Business Metrics**: Custom application metrics

### Alert Thresholds

- Error rate > 1% for 5 minutes
- p95 latency > 500ms for 10 minutes
- Memory usage > 80% for 15 minutes
- Health check failures

### Log Levels

- **error**: Errors requiring immediate attention
- **warn**: Warning conditions, potential issues
- **info**: General informational messages
- **debug**: Detailed debug information (dev only)

## Alternatives Considered

### Alternative 1: Pino Only (Fastify Default)

- **Pros**: Fastest Node.js logger, Fastify native, minimal setup
- **Cons**: Limited transports, less flexibility
- **Why hybrid**: We use Pino for HTTP logs, Winston for application logs

### Alternative 2: OpenTelemetry

- **Pros**: Vendor-neutral, traces + metrics + logs, standard
- **Cons**: Complex setup, overkill for simple projects
- **Why rejected**: Too complex for initial implementation

### Alternative 3: StatsD for Metrics

- **Pros**: Simple, UDP-based, low overhead
- **Cons**: Additional service required, less standard than Prometheus
- **Why rejected**: Prometheus is more widely adopted

### Alternative 4: ELK Stack (Elasticsearch, Logstash, Kibana)

- **Pros**: Powerful log aggregation and search
- **Cons**: Heavy infrastructure, complex setup
- **Why rejected**: Can add later if needed, not required initially

## Integration with Platforms

### Grafana Dashboards

- Import Prometheus metrics
- Create dashboards for:
  - Request rate and latency
  - Error rates
  - Resource usage
  - Custom business metrics

### Kubernetes

```yaml
livenessProbe:
  httpGet:
    path: /health/live
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 30

readinessProbe:
  httpGet:
    path: /health/ready
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 10
```

### Cloud Services

- Can send logs to: CloudWatch, Datadog, Splunk
- Metrics compatible with: Grafana Cloud, Datadog, New Relic

## Best Practices

### Logging

- Log meaningful messages with context
- Include request IDs for correlation
- Don't log sensitive data (passwords, tokens)
- Use appropriate log levels
- Structure logs for machine readability

### Metrics

- Use descriptive metric names
- Add relevant labels (version, endpoint, status)
- Don't create too many label combinations (cardinality)
- Document custom metrics

### Health Checks

- Liveness: Quick check, never fail unless process is dead
- Readiness: Check dependencies, fail if can't serve traffic
- Include dependency health in readiness response

## References

- [Winston Documentation](https://github.com/winstonjs/winston)
- [Prometheus Best Practices](https://prometheus.io/docs/practices/)
- [12-Factor App Logs](https://12factor.net/logs)
- [Kubernetes Health Checks](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)
- [Grafana Dashboards](https://grafana.com/grafana/dashboards/)
