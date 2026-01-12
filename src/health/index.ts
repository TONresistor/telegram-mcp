/**
 * Health Check Module
 *
 * Provides health check functions and optional HTTP server for:
 * - /health - Full health status JSON
 * - /ready  - Kubernetes readiness probe (200/503)
 * - /live   - Kubernetes liveness probe (200/503)
 * - /metrics - Prometheus metrics
 *
 * Enable HTTP server by setting HEALTH_PORT environment variable.
 */

import { createServer, IncomingMessage, ServerResponse } from "http";
import { createLogger } from "../logging/index.js";
import { getConfig } from "../config/index.js";
import { getMetrics, getMetricsContentType } from "../metrics/index.js";
import { getCacheStats } from "../cache/index.js";
import { getCircuitBreakerStatus, getRateLimiterStatus } from "../telegram-api.js";

const logger = createLogger("health");

// =============================================================================
// TYPES
// =============================================================================

export interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  uptime: number;
  version: string;
  timestamp: string;
  checks: {
    circuitBreaker: {
      state: "closed" | "open" | "half-open";
      consecutiveFailures: number;
    };
    cache: {
      size: number;
      methods: Record<string, number>;
    };
    rateLimiter: {
      requestsInWindow: number;
      limited: boolean;
      perChatTracked: number;
    };
  };
}

// =============================================================================
// STATE
// =============================================================================

const startTime = Date.now();
let httpServer: ReturnType<typeof createServer> | null = null;

// =============================================================================
// HEALTH CHECK FUNCTIONS
// =============================================================================

/**
 * Get full health status
 */
export function getHealthStatus(): HealthStatus {
  const circuitBreaker = getCircuitBreakerStatus();
  const rateLimiter = getRateLimiterStatus();
  const cacheStats = getCacheStats();

  // Determine overall status
  let status: HealthStatus["status"] = "healthy";

  if (circuitBreaker.state === "open") {
    status = "unhealthy";
  } else if (circuitBreaker.state === "half-open" || rateLimiter.limited) {
    status = "degraded";
  }

  return {
    status,
    uptime: Math.floor((Date.now() - startTime) / 1000),
    version: process.env.npm_package_version || "1.0.0",
    timestamp: new Date().toISOString(),
    checks: {
      circuitBreaker: {
        state: circuitBreaker.state,
        consecutiveFailures: circuitBreaker.consecutiveFailures,
      },
      cache: {
        size: cacheStats.size,
        methods: cacheStats.methods,
      },
      rateLimiter: {
        requestsInWindow: rateLimiter.requestsInWindow,
        limited: rateLimiter.limited,
        perChatTracked: rateLimiter.perChatTracked,
      },
    },
  };
}

/**
 * Check if service is ready to accept traffic (K8s readiness)
 * Returns false if circuit breaker is open
 */
export function isReady(): boolean {
  const circuitBreaker = getCircuitBreakerStatus();
  return circuitBreaker.state !== "open";
}

/**
 * Check if service is alive (K8s liveness)
 * Always returns true unless process is corrupted
 */
export function isLive(): boolean {
  // Basic sanity checks
  try {
    // Verify we can access config
    getConfig();
    return true;
  } catch {
    return false;
  }
}

// =============================================================================
// HTTP SERVER
// =============================================================================

/**
 * Handle HTTP request
 */
async function handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const url = req.url || "/";

  try {
    switch (url) {
      case "/health": {
        const health = getHealthStatus();
        const statusCode = health.status === "healthy" ? 200 : health.status === "degraded" ? 200 : 503;
        res.writeHead(statusCode, { "Content-Type": "application/json" });
        res.end(JSON.stringify(health, null, 2));
        break;
      }

      case "/ready": {
        const ready = isReady();
        res.writeHead(ready ? 200 : 503, { "Content-Type": "text/plain" });
        res.end(ready ? "OK" : "NOT READY");
        break;
      }

      case "/live": {
        const live = isLive();
        res.writeHead(live ? 200 : 503, { "Content-Type": "text/plain" });
        res.end(live ? "OK" : "NOT LIVE");
        break;
      }

      case "/metrics": {
        const metrics = await getMetrics();
        res.writeHead(200, { "Content-Type": getMetricsContentType() });
        res.end(metrics);
        break;
      }

      default: {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not Found. Available endpoints: /health, /ready, /live, /metrics");
      }
    }
  } catch (error) {
    logger.error("Health endpoint error", {
      url,
      error: error instanceof Error ? error.message : String(error),
    });
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("Internal Server Error");
  }
}

/**
 * Start health check HTTP server
 * @param port - Port to listen on (default from HEALTH_PORT env)
 */
export function startHealthServer(port?: number): void {
  const config = getConfig();
  const serverPort = port ?? config.healthPort;

  if (!serverPort) {
    logger.debug("HEALTH_PORT not set, health server disabled");
    return;
  }

  if (httpServer) {
    logger.warning("Health server already running");
    return;
  }

  httpServer = createServer((req, res) => {
    handleRequest(req, res).catch((err) => {
      logger.error("Unhandled health server error", { error: String(err) });
      if (!res.headersSent) {
        res.writeHead(500);
        res.end("Internal Server Error");
      }
    });
  });

  httpServer.listen(serverPort, () => {
    logger.info("Health server started", {
      port: serverPort,
      endpoints: ["/health", "/ready", "/live", "/metrics"],
    });
  });

  httpServer.on("error", (err) => {
    logger.error("Health server error", { error: String(err) });
  });
}

/**
 * Stop health check HTTP server
 */
export function stopHealthServer(): Promise<void> {
  return new Promise((resolve) => {
    if (!httpServer) {
      resolve();
      return;
    }

    httpServer.close(() => {
      logger.info("Health server stopped");
      httpServer = null;
      resolve();
    });
  });
}

/**
 * Check if health server is running
 */
export function isHealthServerRunning(): boolean {
  return httpServer !== null;
}
