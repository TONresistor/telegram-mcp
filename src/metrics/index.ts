/**
 * Prometheus Metrics Module
 *
 * Exposes metrics for monitoring:
 * - Request counters (total, by tool, by status)
 * - Cache hit/miss counters
 * - Request duration histograms
 * - Circuit breaker state gauge
 * - Rate limiter gauge
 * - Cache size gauge
 */

import { Counter, Histogram, Gauge, Registry, collectDefaultMetrics } from "prom-client";

// =============================================================================
// REGISTRY
// =============================================================================

export const registry = new Registry();

// Collect default Node.js metrics (CPU, memory, event loop)
collectDefaultMetrics({ register: registry, prefix: "mcp_telegram_" });

// =============================================================================
// COUNTERS
// =============================================================================

/**
 * Total number of API requests
 */
export const requestsTotal = new Counter({
  name: "mcp_telegram_requests_total",
  help: "Total number of Telegram API requests",
  labelNames: ["tool", "status", "error_category"] as const,
  registers: [registry],
});

/**
 * Cache hit counter
 */
export const cacheHitsTotal = new Counter({
  name: "mcp_telegram_cache_hits_total",
  help: "Total number of cache hits",
  labelNames: ["method"] as const,
  registers: [registry],
});

/**
 * Cache miss counter
 */
export const cacheMissesTotal = new Counter({
  name: "mcp_telegram_cache_misses_total",
  help: "Total number of cache misses",
  labelNames: ["method"] as const,
  registers: [registry],
});

/**
 * Rate limit hits counter
 */
export const rateLimitHitsTotal = new Counter({
  name: "mcp_telegram_rate_limit_hits_total",
  help: "Total number of requests rate limited",
  labelNames: ["type"] as const, // "global" or "per_chat"
  registers: [registry],
});

/**
 * Circuit breaker trips counter
 */
export const circuitBreakerTripsTotal = new Counter({
  name: "mcp_telegram_circuit_breaker_trips_total",
  help: "Total number of times circuit breaker opened",
  registers: [registry],
});

/**
 * Retry counter
 */
export const retriesTotal = new Counter({
  name: "mcp_telegram_retries_total",
  help: "Total number of request retries",
  labelNames: ["tool", "reason"] as const,
  registers: [registry],
});

// =============================================================================
// HISTOGRAMS
// =============================================================================

/**
 * Request duration histogram
 */
export const requestDuration = new Histogram({
  name: "mcp_telegram_request_duration_seconds",
  help: "Telegram API request duration in seconds",
  labelNames: ["tool", "status"] as const,
  buckets: [0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [registry],
});

// =============================================================================
// GAUGES
// =============================================================================

/**
 * Circuit breaker state
 * 0 = closed (normal)
 * 1 = half-open (testing)
 * 2 = open (blocking)
 */
export const circuitBreakerState = new Gauge({
  name: "mcp_telegram_circuit_breaker_state",
  help: "Circuit breaker state (0=closed, 1=half-open, 2=open)",
  registers: [registry],
});

/**
 * Rate limiter requests in current window
 */
export const rateLimiterRequests = new Gauge({
  name: "mcp_telegram_rate_limiter_requests",
  help: "Number of requests in current rate limiter window",
  registers: [registry],
});

/**
 * Cache size gauge
 */
export const cacheSize = new Gauge({
  name: "mcp_telegram_cache_size",
  help: "Number of entries in cache",
  registers: [registry],
});

/**
 * Active chats tracked by per-chat rate limiter
 */
export const activeChatsTracked = new Gauge({
  name: "mcp_telegram_active_chats_tracked",
  help: "Number of chats being tracked by per-chat rate limiter",
  registers: [registry],
});

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Convert circuit breaker state string to numeric value
 */
export function circuitBreakerStateToNumber(state: "closed" | "open" | "half-open"): number {
  switch (state) {
    case "closed":
      return 0;
    case "half-open":
      return 1;
    case "open":
      return 2;
  }
}

/**
 * Record a request with all relevant metrics
 */
export function recordRequest(params: {
  tool: string;
  status: "success" | "error";
  errorCategory?: string;
  durationMs: number;
}) {
  const { tool, status, errorCategory, durationMs } = params;

  // Increment counter
  requestsTotal.inc({
    tool,
    status,
    error_category: errorCategory || "",
  });

  // Record duration
  requestDuration.observe(
    { tool, status },
    durationMs / 1000
  );
}

/**
 * Get all metrics in Prometheus format
 */
export async function getMetrics(): Promise<string> {
  return registry.metrics();
}

/**
 * Get metrics content type
 */
export function getMetricsContentType(): string {
  return registry.contentType;
}
