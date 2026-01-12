import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Mock metrics
vi.mock("../../src/metrics/index.js", () => ({
  requestsTotal: { inc: vi.fn() },
  requestDuration: { observe: vi.fn() },
  circuitBreakerState: { set: vi.fn() },
  circuitBreakerTripsTotal: { inc: vi.fn() },
  rateLimiterRequests: { set: vi.fn() },
  rateLimitHitsTotal: { inc: vi.fn() },
  retriesTotal: { inc: vi.fn() },
  activeChatsTracked: { set: vi.fn() },
  circuitBreakerStateToNumber: (s: string) => s === "closed" ? 0 : s === "half-open" ? 1 : 2,
  cacheHitsTotal: { inc: vi.fn() },
  cacheMissesTotal: { inc: vi.fn() },
  cacheSize: { set: vi.fn() },
  registry: {
    metrics: () => Promise.resolve("# HELP test\ntest 1"),
  },
  getMetrics: () => Promise.resolve("# HELP test\ntest 1"),
}));

describe("Health Check Integration", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    process.env.TELEGRAM_BOT_TOKEN = "123456789:ABCdefGHIjklMNOpqrsTUVwxyz";
    process.env.MAX_RETRIES = "0"; // Disable retries for faster tests
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("getHealthStatus", () => {
    it("should return comprehensive health status", async () => {
      const { getHealthStatus } = await import("../../src/health/index.js");

      const status = getHealthStatus();

      expect(status).toHaveProperty("status");
      expect(status).toHaveProperty("uptime");
      expect(status).toHaveProperty("version");
      expect(status).toHaveProperty("timestamp");
      expect(status).toHaveProperty("checks");

      expect(status.checks).toHaveProperty("circuitBreaker");
      expect(status.checks).toHaveProperty("cache");
      expect(status.checks).toHaveProperty("rateLimiter");
    });

    it("should report healthy status when all checks pass", async () => {
      const { getHealthStatus } = await import("../../src/health/index.js");

      const status = getHealthStatus();

      // Check overall status
      expect(["healthy", "degraded"]).toContain(status.status);
      expect(status.checks.circuitBreaker).toHaveProperty("state");
      expect(status.checks.rateLimiter).toHaveProperty("limited");
    });

    it("should include uptime in seconds", async () => {
      const { getHealthStatus } = await import("../../src/health/index.js");

      const status = getHealthStatus();

      expect(typeof status.uptime).toBe("number");
      expect(status.uptime).toBeGreaterThanOrEqual(0);
    });

    it("should include ISO timestamp", async () => {
      const { getHealthStatus } = await import("../../src/health/index.js");

      const status = getHealthStatus();

      expect(status.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
  });

  describe("isReady", () => {
    it("should return true when system is ready", async () => {
      const { isReady } = await import("../../src/health/index.js");

      expect(isReady()).toBe(true);
    });
  });

  describe("isLive", () => {
    it("should return true when system is live", async () => {
      const { isLive } = await import("../../src/health/index.js");

      expect(isLive()).toBe(true);
    });
  });

  describe("Health status with circuit breaker states", () => {
    it("should report degraded when circuit breaker is open", async () => {
      // Mock fetch to fail and trigger circuit breaker
      global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

      const { callTelegramAPI } = await import("../../src/telegram-api.js");
      const { getHealthStatus } = await import("../../src/health/index.js");

      // Trigger circuit breaker by causing failures
      for (let i = 0; i < 5; i++) {
        await callTelegramAPI("getMe", {});
      }

      const status = getHealthStatus();

      expect(["degraded", "unhealthy"]).toContain(status.status);
      expect(status.checks.circuitBreaker.state).toBe("open");
    });
  });
});
