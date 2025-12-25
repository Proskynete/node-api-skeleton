import http from "k6/http";
import { check, sleep, group } from "k6";

/**
 * K6 Load Test - Complete API Load Test
 * Tests all API endpoints under realistic load conditions
 */

export const options = {
  stages: [
    { duration: "1m", target: 50 }, // Ramp up to 50 users
    { duration: "3m", target: 100 }, // Stay at 100 users for 3 minutes
    { duration: "1m", target: 150 }, // Spike to 150 users
    { duration: "2m", target: 150 }, // Maintain spike
    { duration: "1m", target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<500", "p(99)<1000"], // 95th percentile < 500ms, 99th < 1s
    http_req_failed: ["rate<0.01"], // Error rate < 1%
    "http_req_duration{endpoint:v1}": ["p(95)<500"],
    "http_req_duration{endpoint:v2}": ["p(95)<500"],
    "http_req_duration{endpoint:health}": ["p(95)<100"],
    "http_req_duration{endpoint:metrics}": ["p(95)<200"],
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

export default function () {
  // Test v1 endpoint
  group("API v1", () => {
    const res = http.get(`${BASE_URL}/api/v1/greetings`, {
      tags: { endpoint: "v1" },
    });

    check(res, {
      "v1: status 200": (r) => r.status === 200,
      "v1: has message": (r) => JSON.parse(r.body).hasOwnProperty("message"),
      "v1: no timestamp": (r) =>
        !JSON.parse(r.body).hasOwnProperty("timestamp"),
    });
  });

  sleep(0.3);

  // Test v2 endpoint
  group("API v2", () => {
    const res = http.get(`${BASE_URL}/api/v2/greetings`, {
      tags: { endpoint: "v2" },
    });

    check(res, {
      "v2: status 200": (r) => r.status === 200,
      "v2: has message": (r) => JSON.parse(r.body).hasOwnProperty("message"),
      "v2: has timestamp": (r) =>
        JSON.parse(r.body).hasOwnProperty("timestamp"),
      "v2: has version": (r) => JSON.parse(r.body).version === "2.0",
    });
  });

  sleep(0.3);

  // Test health endpoints (less frequently)
  if (__ITER % 10 === 0) {
    group("Health Checks", () => {
      const healthRes = http.get(`${BASE_URL}/health/live`, {
        tags: { endpoint: "health" },
      });

      check(healthRes, {
        "health: status 200": (r) => r.status === 200,
        "health: is alive": (r) => JSON.parse(r.body).status === "alive",
      });

      const readyRes = http.get(`${BASE_URL}/health/ready`, {
        tags: { endpoint: "health" },
      });

      check(readyRes, {
        "ready: status 200": (r) => r.status === 200,
        "ready: is ready": (r) => JSON.parse(r.body).status === "ready",
      });
    });
  }

  // Test metrics endpoint (even less frequently)
  if (__ITER % 50 === 0) {
    group("Metrics", () => {
      const metricsRes = http.get(`${BASE_URL}/metrics`, {
        tags: { endpoint: "metrics" },
      });

      check(metricsRes, {
        "metrics: status 200": (r) => r.status === 200,
        "metrics: prometheus format": (r) =>
          r.body.includes("http_requests_total"),
      });
    });
  }

  sleep(0.5);
}

export function handleSummary(data) {
  return {
    stdout: textSummary(data, { indent: " ", enableColors: true }),
  };
}

function textSummary(data, options = {}) {
  const indent = options.indent || "";

  let summary = `\n${indent}Complete API Load Test Summary\n`;
  summary += `${indent}${"=".repeat(60)}\n\n`;

  // Test duration
  summary += `${indent}Test Duration: ${(data.state.testRunDurationMs / 1000).toFixed(2)}s\n\n`;

  // HTTP metrics
  if (data.metrics.http_reqs) {
    summary += `${indent}HTTP Requests:\n`;
    summary += `${indent}  Total: ${data.metrics.http_reqs.values.count}\n`;
    summary += `${indent}  Rate: ${data.metrics.http_reqs.values.rate.toFixed(2)} req/s\n\n`;
  }

  // Response time overall
  if (data.metrics.http_req_duration) {
    summary += `${indent}Response Time (Overall):\n`;
    summary += `${indent}  Min: ${data.metrics.http_req_duration.values.min.toFixed(2)}ms\n`;
    summary += `${indent}  Avg: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms\n`;
    summary += `${indent}  Max: ${data.metrics.http_req_duration.values.max.toFixed(2)}ms\n`;
    summary += `${indent}  p(50): ${data.metrics.http_req_duration.values["p(50)"].toFixed(2)}ms (median)\n`;
    summary += `${indent}  p(90): ${data.metrics.http_req_duration.values["p(90)"].toFixed(2)}ms\n`;
    summary += `${indent}  p(95): ${data.metrics.http_req_duration.values["p(95)"].toFixed(2)}ms\n`;
    summary += `${indent}  p(99): ${data.metrics.http_req_duration.values["p(99)"].toFixed(2)}ms\n\n`;
  }

  // VUs
  if (data.metrics.vus) {
    summary += `${indent}Virtual Users:\n`;
    summary += `${indent}  Min: ${data.metrics.vus.values.min}\n`;
    summary += `${indent}  Max: ${data.metrics.vus.values.max}\n\n`;
  }

  // Error rate
  if (data.metrics.http_req_failed) {
    const errorRate = (data.metrics.http_req_failed.values.rate * 100).toFixed(2);
    const passed = errorRate < 1;
    const status = passed ? "✓ PASSED" : "✗ FAILED";
    summary += `${indent}Error Rate: ${errorRate}% ${status}\n\n`;
  }

  // Checks
  if (data.metrics.checks) {
    const passRate = (data.metrics.checks.values.rate * 100).toFixed(2);
    const passed = passRate > 95;
    const status = passed ? "✓ PASSED" : "✗ FAILED";
    summary += `${indent}Checks Passed: ${passRate}% ${status}\n\n`;
  }

  // Thresholds
  summary += `${indent}Thresholds:\n`;
  for (const [name, threshold] of Object.entries(data.metrics)) {
    if (threshold.thresholds) {
      for (const [thresholdName, thresholdData] of Object.entries(
        threshold.thresholds
      )) {
        const passed = thresholdData.ok;
        const status = passed ? "✓" : "✗";
        summary += `${indent}  ${status} ${name}: ${thresholdName}\n`;
      }
    }
  }

  return summary;
}
