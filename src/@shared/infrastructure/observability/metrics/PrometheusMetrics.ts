import { Counter, Gauge, Histogram, Registry } from "prom-client";

class PrometheusMetrics {
  public readonly register: Registry;
  public readonly httpRequestDuration: Histogram;
  public readonly httpRequestTotal: Counter;
  public readonly httpRequestsInProgress: Gauge;

  constructor() {
    this.register = new Registry();

    this.httpRequestDuration = new Histogram({
      name: "http_request_duration_seconds",
      help: "Duration of HTTP requests in seconds",
      labelNames: ["method", "route", "status_code", "version"],
      registers: [this.register],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
    });

    this.httpRequestTotal = new Counter({
      name: "http_requests_total",
      help: "Total number of HTTP requests",
      labelNames: ["method", "route", "status_code", "version"],
      registers: [this.register],
    });

    this.httpRequestsInProgress = new Gauge({
      name: "http_requests_in_progress",
      help: "Number of HTTP requests currently in progress",
      labelNames: ["method", "route"],
      registers: [this.register],
    });
  }
}

export const metrics = new PrometheusMetrics();
