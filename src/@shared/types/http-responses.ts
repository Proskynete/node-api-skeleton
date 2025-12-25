/**
 * Common HTTP Response Types
 * Used across tests and application for type safety
 */

// Health Check Types
export interface HealthResponse {
  status: string;
  timestamp: string;
}

export interface HealthCheck {
  name: string;
  status: "healthy" | "unhealthy";
  responseTime: number;
  message?: string;
}

export interface ReadinessResponse {
  status: "ready" | "not ready";
  checks: HealthCheck[];
  timestamp: string;
}

// Greeting Response Types
export interface V1GreetingResponse {
  message: string;
}

export interface V2GreetingResponse {
  message: string;
  timestamp: string;
  version: string;
}

// Error Response Types
export interface ErrorResponse {
  error: string;
  message: string;
  requestId?: string;
  code?: string;
  details?: unknown;
}
