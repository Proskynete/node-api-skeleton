# Performance Tests with k6

This directory contains k6 performance tests for the Node API Skeleton.

## Prerequisites

Install k6 on your system:

**macOS:**
```bash
brew install k6
```

**Linux:**
```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

**Windows:**
```bash
choco install k6
```

Or download from: https://k6.io/docs/get-started/installation/

## Available Tests

### 1. Greetings v1 Performance Test
Tests the `/api/v1/greetings` endpoint under load.

**Run:**
```bash
npm run test:performance:v1
```

**Details:**
- Stages: 20 → 50 → 100 users
- Duration: ~3.5 minutes
- Thresholds: p95 < 500ms, error rate < 1%

### 2. Greetings v2 Performance Test
Tests the `/api/v2/greetings` endpoint under load.

**Run:**
```bash
npm run test:performance:v2
```

**Details:**
- Stages: 20 → 50 → 100 users
- Duration: ~3.5 minutes
- Thresholds: p95 < 500ms, error rate < 1%
- Additional checks for timestamp and version fields

### 3. Complete Load Test
Tests all API endpoints (v1, v2, health, metrics) simultaneously.

**Run:**
```bash
npm run test:performance:load
```

**Details:**
- Stages: 50 → 100 → 150 users (spike test)
- Duration: ~8 minutes
- Tests v1, v2, health endpoints, and metrics
- More comprehensive thresholds per endpoint

## Running Tests

### Important: Start the server first

**For best results, use production mode:**
```bash
# Build and start production server
npm run build
npm start
```

**Or use dev mode (results may vary):**
```bash
npm run dev
```

### Then run tests in another terminal:
```bash
# Run all tests sequentially (continues even if one fails)
npm run test:performance

# Run specific test
npm run test:performance:v1
npm run test:performance:v2
npm run test:performance:load

# Or run k6 directly
k6 run test/performance/greetings-v1.k6.js
k6 run test/performance/greetings-v2.k6.js
k6 run test/performance/load-test.k6.js
```

**Note:** The `npm run test:performance` command uses `;` to run all tests sequentially, meaning all tests will run even if one fails. This allows you to see results from all test suites.

### Test against different environment:
```bash
BASE_URL=http://production-url.com k6 run test/performance/load-test.k6.js
```

## Understanding Results

### Key Metrics

- **http_reqs**: Total number of HTTP requests made
- **http_req_duration**: Request duration metrics (min, avg, max, percentiles)
- **http_req_failed**: Percentage of failed requests
- **vus**: Number of virtual users
- **checks**: Percentage of passed checks

### Thresholds

Tests are configured with thresholds that must pass:

- **p(95) < 500ms**: 95% of requests complete in under 500ms
- **p(99) < 1000ms**: 99% of requests complete in under 1 second
- **Error rate < 1%**: Less than 1% of requests fail
- **Rate > 50 req/s**: System handles at least 50 requests per second

### Example Output

```
Greetings v1 Performance Test Summary
==================================================

Test Duration: 210.45s

HTTP Requests:
  Total: 15234
  Rate: 72.41 req/s

Response Time:
  Min: 2.15ms
  Avg: 45.32ms
  Max: 312.45ms
  p(95): 156.23ms
  p(99): 234.56ms

Error Rate: 0.00%

Checks Passed: 100.00%
```

## Performance Targets

Based on the thresholds, the API should:

- Handle 50-100+ requests per second
- Respond to 95% of requests in under 500ms
- Respond to 99% of requests in under 1 second
- Maintain error rate below 1%
- Support 100-150 concurrent users

## Tips

1. **Warm up**: Run a small test first to warm up the server
2. **Consistent environment**: Run tests on the same machine for consistent results
3. **Monitor resources**: Watch CPU and memory during tests
4. **Baseline**: Establish baseline metrics before making changes
5. **Iterate**: Run tests after performance improvements to validate

## Integration with CI/CD

You can run k6 tests in CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run performance tests
  run: |
    npm run dev &
    sleep 10
    npm run test:performance:load
```

## Advanced Usage

### Custom stages:
```bash
k6 run --stage 10s:10,30s:50,10s:0 test/performance/greetings-v1.k6.js
```

### Output to file:
```bash
k6 run --out json=results.json test/performance/load-test.k6.js
```

### Cloud execution:
```bash
k6 cloud test/performance/load-test.k6.js
```

## Troubleshooting

**High error rate (e.g., 58%)?**

This usually indicates the server is struggling under load. Common causes:

1. **Server not running in production mode**
   ```bash
   # Stop dev server and run:
   npm run build
   npm start
   ```
   Dev mode (`npm run dev`) with nodemon can be slower under heavy load.

2. **Server resource exhaustion**
   - Check CPU usage during test
   - Monitor memory consumption
   - Reduce concurrent users in test configuration

3. **Port conflicts or server not listening**
   ```bash
   # Verify server is running:
   curl http://localhost:3000/health/live

   # Check what's on port 3000:
   lsof -i :3000
   ```

4. **Network/Connection limits**
   - Increase system file descriptors: `ulimit -n 65536`
   - Check system connection limits

**Slow responses?**
- Profile the code
- Check database queries
- Monitor server resources
- Check network latency
- Use production build, not dev mode

**Tests timing out?**
- Increase timeout in k6 options
- Reduce concurrent users
- Check for deadlocks or blocking code

**Only first test runs?**
- Fixed in latest version - script now uses `;` instead of `&&`
- All tests will run even if one fails
