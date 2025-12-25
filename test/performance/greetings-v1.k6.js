import http from "k6/http";
import { check, sleep } from "k6";

/**
 * K6 Performance Test - Greetings v1 API
 * Tests the /api/v1/greetings endpoint under load
 */

export const options = {
  stages: [
    { duration: "30s", target: 20 }, // Ramp up to 20 users
    { duration: "1m", target: 50 }, // Stay at 50 users for 1 minute
    { duration: "30s", target: 100 }, // Spike to 100 users
    { duration: "1m", target: 100 }, // Stay at 100 users
    { duration: "30s", target: 0 }, // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ["p(95)<500"], // 95% of requests should be below 500ms
    http_req_failed: ["rate<0.01"], // Error rate should be less than 1%
    http_reqs: ["rate>50"], // Should handle at least 50 requests per second
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

export default function () {
  // Test GET /api/v1/greetings
  const res = http.get(`${BASE_URL}/api/v1/greetings`);

  check(res, {
    "status is 200": (r) => r.status === 200,
    "has message property": (r) => {
      const body = JSON.parse(r.body);
      return body.hasOwnProperty("message");
    },
    "message is not empty": (r) => {
      const body = JSON.parse(r.body);
      return body.message && body.message.length > 0;
    },
    "response time < 500ms": (r) => r.timings.duration < 500,
  });

  sleep(0.5); // Sleep for 500ms between iterations
}

export function handleSummary(data) {
  return {
    stdout: textSummary(data, { indent: " ", enableColors: true }),
  };
}

function textSummary(data, options = {}) {
  const indent = options.indent || "";
  const enableColors = options.enableColors || false;

  let summary = `\n${indent}Greetings v1 Performance Test Summary\n`;
  summary += `${indent}${"=".repeat(50)}\n\n`;

  // Test duration
  summary += `${indent}Test Duration: ${(data.state.testRunDurationMs / 1000).toFixed(2)}s\n\n`;

  // HTTP metrics
  if (data.metrics.http_reqs) {
    summary += `${indent}HTTP Requests:\n`;
    summary += `${indent}  Total: ${data.metrics.http_reqs.values.count}\n`;
    summary += `${indent}  Rate: ${data.metrics.http_reqs.values.rate.toFixed(2)} req/s\n\n`;
  }

  // Response time
  if (data.metrics.http_req_duration) {
    summary += `${indent}Response Time:\n`;
    summary += `${indent}  Min: ${data.metrics.http_req_duration.values.min.toFixed(2)}ms\n`;
    summary += `${indent}  Avg: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms\n`;
    summary += `${indent}  Max: ${data.metrics.http_req_duration.values.max.toFixed(2)}ms\n`;
    summary += `${indent}  p(95): ${data.metrics.http_req_duration.values["p(95)"].toFixed(2)}ms\n`;
    summary += `${indent}  p(99): ${data.metrics.http_req_duration.values["p(99)"].toFixed(2)}ms\n\n`;
  }

  // Error rate
  if (data.metrics.http_req_failed) {
    const errorRate = (data.metrics.http_req_failed.values.rate * 100).toFixed(2);
    summary += `${indent}Error Rate: ${errorRate}%\n\n`;
  }

  // Checks
  if (data.metrics.checks) {
    const passRate = (data.metrics.checks.values.rate * 100).toFixed(2);
    summary += `${indent}Checks Passed: ${passRate}%\n`;
  }

  return summary;
}
