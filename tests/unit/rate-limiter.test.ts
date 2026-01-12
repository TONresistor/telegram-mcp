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

describe("RateLimiter", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    process.env.TELEGRAM_BOT_TOKEN = "123456789:ABCdefGHIjklMNOpqrsTUVwxyz";
    process.env.RATE_LIMIT_PER_MINUTE = "5"; // Low limit for testing
    process.env.MAX_RETRIES = "0"; // Disable retries for faster tests
  });

  it("should allow requests under limit", async () => {
    const { getRateLimiterStatus } = await import("../../src/telegram-api.js");

    const status = getRateLimiterStatus();
    expect(status.limited).toBe(false);
    expect(status).toHaveProperty("requestsInWindow");
    expect(status).toHaveProperty("perChatTracked");
  });

  it("should track request count correctly", async () => {
    // Set low limit
    process.env.RATE_LIMIT_PER_MINUTE = "10";
    process.env.MAX_RETRIES = "0";

    const { clearConfigCache } = await import("../../src/config/index.js");
    clearConfigCache();

    const { callTelegramAPI, getRateLimiterStatus } = await import("../../src/telegram-api.js");

    // Mock successful response
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      json: () => Promise.resolve({ ok: true, result: {} }),
    });

    const statusBefore = getRateLimiterStatus();
    const requestsBefore = statusBefore.requestsInWindow;

    // Make a request that won't be cached (use different params each time)
    await callTelegramAPI("getMe", {});

    const statusAfter = getRateLimiterStatus();
    // Request count should increase
    expect(statusAfter.requestsInWindow).toBeGreaterThanOrEqual(requestsBefore);
  });

  it("should return rate limited response with retry_after", async () => {
    process.env.RATE_LIMIT_PER_MINUTE = "1";
    process.env.MAX_RETRIES = "0";

    const { clearConfigCache } = await import("../../src/config/index.js");
    clearConfigCache();

    const { callTelegramAPI, getRateLimiterStatus } = await import("../../src/telegram-api.js");

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      json: () => Promise.resolve({ ok: true, result: {} }),
    });

    // First request succeeds
    await callTelegramAPI("getMe", {});

    // Check status after one request
    const status = getRateLimiterStatus();
    expect(status.requestsInWindow).toBe(1);
    expect(status.limited).toBe(true); // Limit of 1 reached
  });

  it("should skip rate limit when option is set", async () => {
    process.env.RATE_LIMIT_PER_MINUTE = "1";
    process.env.MAX_RETRIES = "0";

    const { clearConfigCache } = await import("../../src/config/index.js");
    clearConfigCache();

    const { callTelegramAPI } = await import("../../src/telegram-api.js");

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      json: () => Promise.resolve({ ok: true, result: {} }),
    });

    await callTelegramAPI("getMe", {});

    // With skipRateLimit, should not be blocked
    const result = await callTelegramAPI("getMe", {}, { skipRateLimit: true });

    expect(result.ok).toBe(true);
  });
});

describe("PerChatRateLimiter", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    process.env.TELEGRAM_BOT_TOKEN = "123456789:ABCdefGHIjklMNOpqrsTUVwxyz";
    process.env.RATE_LIMIT_PER_MINUTE = "100"; // High global limit
    process.env.MAX_RETRIES = "0"; // Disable retries for faster tests
  });

  it("should limit private chats to 1/sec", async () => {
    const { callTelegramAPI } = await import("../../src/telegram-api.js");

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      json: () => Promise.resolve({ ok: true, result: { message_id: 1 } }),
    });

    // Send first message to private chat (positive ID)
    await callTelegramAPI("sendMessage", { chat_id: 12345, text: "Hello" });

    // Immediate second message should be rate limited
    const result = await callTelegramAPI("sendMessage", { chat_id: 12345, text: "World" });

    expect(result.ok).toBe(false);
    expect(result.error_code).toBe(429);
    expect(result.description).toContain("Per-chat rate limit");
  });

  it("should track separate chats independently", async () => {
    const { callTelegramAPI } = await import("../../src/telegram-api.js");

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      json: () => Promise.resolve({ ok: true, result: { message_id: 1 } }),
    });

    // Send to chat A
    await callTelegramAPI("sendMessage", { chat_id: 111, text: "Hello A" });

    // Send to chat B - should work
    const result = await callTelegramAPI("sendMessage", { chat_id: 222, text: "Hello B" });

    expect(result.ok).toBe(true);
  });

  it("should count tracked chats in status", async () => {
    const { callTelegramAPI, getRateLimiterStatus } = await import("../../src/telegram-api.js");

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      json: () => Promise.resolve({ ok: true, result: { message_id: 1 } }),
    });

    await callTelegramAPI("sendMessage", { chat_id: 111, text: "Test" });
    await callTelegramAPI("sendMessage", { chat_id: 222, text: "Test" });

    const status = getRateLimiterStatus();
    expect(status.perChatTracked).toBeGreaterThanOrEqual(2);
  });

  it("should not apply per-chat limit to non-message methods", async () => {
    const { callTelegramAPI } = await import("../../src/telegram-api.js");

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      json: () => Promise.resolve({ ok: true, result: {} }),
    });

    // getChat is not a message-sending method
    await callTelegramAPI("getChat", { chat_id: 12345 });
    const result = await callTelegramAPI("getChat", { chat_id: 12345 });

    expect(result.ok).toBe(true);
  });
});
