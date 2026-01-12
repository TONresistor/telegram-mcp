import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock fetch globally
global.fetch = vi.fn();

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
}));

describe("CircuitBreaker", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    process.env.TELEGRAM_BOT_TOKEN = "123456789:ABCdefGHIjklMNOpqrsTUVwxyz";
    process.env.RATE_LIMIT_PER_MINUTE = "100"; // High to avoid rate limiting
    process.env.MAX_RETRIES = "0"; // Disable retries to speed up tests
  });

  it("should start in closed state", async () => {
    const { getCircuitBreakerStatus } = await import("../../src/telegram-api.js");

    const status = getCircuitBreakerStatus();
    expect(status.state).toBe("closed");
    expect(status.consecutiveFailures).toBe(0);
  });

  it("should open after consecutive failures", async () => {
    const { callTelegramAPI, getCircuitBreakerStatus } = await import("../../src/telegram-api.js");

    // Mock network errors
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Network error"));

    // Make 5 failing requests (default threshold)
    for (let i = 0; i < 5; i++) {
      await callTelegramAPI("getMe", {});
    }

    const status = getCircuitBreakerStatus();
    expect(status.state).toBe("open");
  });

  it("should reject requests when open", async () => {
    const { callTelegramAPI, getCircuitBreakerStatus } = await import("../../src/telegram-api.js");

    // Mock network errors to trigger circuit breaker
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Network error"));

    // Open the circuit
    for (let i = 0; i < 5; i++) {
      await callTelegramAPI("getMe", {});
    }

    expect(getCircuitBreakerStatus().state).toBe("open");

    // Next request should be rejected immediately
    const result = await callTelegramAPI("getMe", {});

    expect(result.ok).toBe(false);
    expect(result.error_code).toBe(503);
    expect(result.description).toContain("circuit breaker open");
  });

  it("should reset failure count on success", async () => {
    const { callTelegramAPI, getCircuitBreakerStatus } = await import("../../src/telegram-api.js");

    // Cause some failures (but not enough to trip circuit breaker)
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("Network error"));
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("Network error"));

    await callTelegramAPI("getMe", {});
    await callTelegramAPI("getMe", {});

    // Now succeed
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      json: () => Promise.resolve({ ok: true, result: {} }),
    });

    await callTelegramAPI("getMe", {});

    const status = getCircuitBreakerStatus();
    expect(status.consecutiveFailures).toBe(0);
    expect(status.state).toBe("closed");
  });

  it("should track consecutive failures count", async () => {
    const { callTelegramAPI, getCircuitBreakerStatus } = await import("../../src/telegram-api.js");

    // Cause failures (but not enough to trip the breaker)
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Network error"));

    await callTelegramAPI("getMe", {});
    await callTelegramAPI("getMe", {});

    const status = getCircuitBreakerStatus();
    expect(status.consecutiveFailures).toBe(2);
    expect(status.state).toBe("closed"); // Still closed with 2 failures
  });

});
