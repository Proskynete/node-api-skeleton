# ADR-0011: Use k6 for Performance Testing

## Status

Accepted

## Context

Performance testing is essential to ensure the API can handle expected load and identify performance bottlenecks before they affect users. We needed a performance testing solution that would:

- Support realistic load scenarios
- Provide detailed performance metrics
- Be scriptable and automatable
- Integrate with CI/CD pipelines
- Generate actionable reports
- Be easy to write and maintain test scripts

Performance testing frameworks vary in capabilities, from simple HTTP benchmarking tools to sophisticated load testing platforms.

## Decision

We will use **k6** as our performance testing framework.

### Use Cases

1. **Load Testing**: Test system behavior under expected load
2. **Stress Testing**: Find breaking point of the system
3. **Spike Testing**: Test behavior during traffic spikes
4. **Soak Testing**: Test for memory leaks over extended periods

### Implementation

- **Test Scripts**: JavaScript-based, stored in `test/performance/`
- **Automation**: Custom test runner for auto-discovery
- **CI Integration**: Run performance tests in CI pipeline
- **Thresholds**: Define pass/fail criteria in test scripts

## Consequences

### Positive

- **Modern scripting**: Write tests in JavaScript (familiar to team)
- **Detailed metrics**: p50, p95, p99 latencies, throughput, error rates
- **Built-in assertions**: Thresholds and checks in test code
- **CI-friendly**: CLI tool, scriptable, exit codes
- **Grafana integration**: Native Grafana dashboard support
- **Cloud option**: Can use k6 Cloud for distributed load testing
- **Low resource usage**: Efficient virtual user implementation

### Negative

- **Not GUI-based**: No visual test recorder (compared to JMeter)
- **External dependency**: Requires k6 binary to be installed
- **JavaScript only**: Can't use other languages for test scripts

### Neutral

- **Learning curve**: New tool to learn, but JavaScript syntax
- **Community**: Growing community, backed by Grafana Labs

## Test Structure

### Performance Test Example

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 },   // Ramp up to 20 users
    { duration: '1m', target: 100 },   // Ramp up to 100 users
    { duration: '30s', target: 0 },    // Ramp down to 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% of requests < 500ms
    http_req_failed: ['rate<0.01'],    // < 1% errors
    http_reqs: ['rate>50'],            // > 50 requests/second
  },
};

export default function () {
  const res = http.get('http://localhost:3000/api/v1/greetings');

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
```

### Automated Test Runner

```bash
# Run all performance tests
npm run test:performance

# Run specific test
npm run test:performance greetings-v1

# Output includes:
# - Test execution progress
# - Pass/fail status per test
# - Summary with duration and results
```

### Test Organization

```
test/performance/
├── greetings-v1.k6.js       # Test for v1 API
├── greetings-v2.k6.js       # Test for v2 API
├── load-test.k6.js          # General load test
└── README.md                # Performance testing guide
```

## Performance Thresholds

### Standard Thresholds

- **p95 latency**: < 500ms (95% of requests complete within 500ms)
- **p99 latency**: < 1000ms (99% of requests complete within 1 second)
- **Error rate**: < 1% (less than 1% of requests fail)
- **Throughput**: > 50 req/s (can handle at least 50 requests per second)

### Test Scenarios

#### Load Test
- Gradual ramp-up to expected load
- Hold at peak for observation period
- Gradual ramp-down

#### Stress Test
- Ramp up beyond expected load
- Find breaking point
- Observe recovery

#### Spike Test
- Sudden increase in load
- Hold briefly
- Drop back to normal

#### Soak Test
- Moderate load over extended period (hours)
- Check for memory leaks
- Verify stability

## Alternatives Considered

### Alternative 1: Apache JMeter

- **Pros**: Mature, GUI for test creation, enterprise standard
- **Cons**: Java-based, heavy, XML configuration, slower execution
- **Why rejected**: Heavy tooling, not developer-friendly

### Alternative 2: Artillery

- **Pros**: JavaScript-based, YAML config, good for simple tests
- **Cons**: Less detailed metrics, smaller community
- **Why rejected**: k6 provides more detailed metrics

### Alternative 3: Gatling

- **Pros**: Powerful, Scala-based, detailed reports
- **Cons**: JVM required, steeper learning curve
- **Why rejected**: k6 is more lightweight and JavaScript-based

### Alternative 4: wrk/ab (Apache Bench)

- **Pros**: Very fast, simple, command-line
- **Cons**: Limited scripting, basic metrics, no complex scenarios
- **Why rejected**: Too basic for comprehensive performance testing

### Alternative 5: Autocannon

- **Pros**: Node.js native, fast, simple
- **Cons**: Limited scenario support, fewer metrics
- **Why rejected**: k6 provides better scenario support

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: Performance Tests

on:
  pull_request:
    branches: [main]

jobs:
  performance:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Start API server
        run: |
          npm run build
          npm start &
          sleep 5

      - name: Install k6
        run: |
          sudo gpg -k
          sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
          echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/grafana.list
          sudo apt-get update
          sudo apt-get install k6

      - name: Run performance tests
        run: npm run test:performance
```

## Monitoring and Reporting

### Metrics Collected

- **Request duration**: min, max, avg, p50, p90, p95, p99
- **Request rate**: requests per second
- **Failure rate**: percentage of failed requests
- **Data transferred**: bytes sent/received
- **Virtual users**: concurrent users over time

### Output Formats

- **Console**: Real-time progress and summary
- **JSON**: Machine-readable results for processing
- **CSV**: For spreadsheet analysis
- **Grafana**: Live dashboard during test execution

## Best Practices

### Writing Tests

- Start with low load, increase gradually
- Set realistic thresholds based on SLAs
- Include checks for response content, not just status codes
- Use sleep() to simulate realistic user behavior
- Modularize common test logic

### Running Tests

- Run against production-like environment
- Monitor system resources during tests
- Run baseline tests before changes
- Compare results over time
- Don't test production without planning

### Interpreting Results

- Focus on p95/p99, not just average
- Look for degradation as load increases
- Identify bottlenecks (CPU, memory, database, network)
- Check for resource leaks (increasing memory over time)
- Validate error patterns

## References

- [k6 Official Documentation](https://k6.io/docs/)
- [k6 Test Types](https://k6.io/docs/test-types/)
- [Performance Testing Best Practices](https://k6.io/docs/testing-guides/api-load-testing/)
- [k6 in CI/CD](https://k6.io/docs/integrations/)
- [Grafana k6 Cloud](https://k6.io/cloud/)
