import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";

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

describe("Telegram API Integration", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    process.env.TELEGRAM_BOT_TOKEN = "123456789:ABCdefGHIjklMNOpqrsTUVwxyz";
    process.env.RATE_LIMIT_PER_MINUTE = "100";
    process.env.MAX_RETRIES = "0"; // Disable retries for faster tests
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("Full request flow", () => {
    it("should make API call with correct URL and headers", async () => {
      const { callTelegramAPI } = await import("../../src/telegram-api.js");

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        json: () => Promise.resolve({ ok: true, result: { id: 123, is_bot: true } }),
      });

      await callTelegramAPI("getMe", {});

      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.telegram.org/bot123456789:ABCdefGHIjklMNOpqrsTUVwxyz/getMe",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
        })
      );
    });

    it("should pass parameters in request body", async () => {
      const { callTelegramAPI } = await import("../../src/telegram-api.js");

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        json: () => Promise.resolve({ ok: true, result: { message_id: 1 } }),
      });

      await callTelegramAPI("sendMessage", {
        chat_id: 123456,
        text: "Hello, World!",
      });

      const callArgs = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
      const body = JSON.parse(callArgs[1].body);

      expect(body.chat_id).toBe(123456);
      expect(body.text).toBe("Hello, World!");
    });

    it("should return result on success", async () => {
      const { callTelegramAPI } = await import("../../src/telegram-api.js");

      const expectedResult = { message_id: 42, chat: { id: 123 } };
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        json: () => Promise.resolve({ ok: true, result: expectedResult }),
      });

      const result = await callTelegramAPI("sendMessage", {
        chat_id: 123,
        text: "Test",
      });

      expect(result.ok).toBe(true);
      expect(result.result).toEqual(expectedResult);
    });

    it("should return error on API failure", async () => {
      const { callTelegramAPI } = await import("../../src/telegram-api.js");

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        json: () => Promise.resolve({
          ok: false,
          error_code: 400,
          description: "Bad Request: chat not found",
        }),
      });

      const result = await callTelegramAPI("sendMessage", {
        chat_id: 999999,
        text: "Test",
      });

      expect(result.ok).toBe(false);
      expect(result.error_code).toBe(400);
      expect(result.description).toContain("chat not found");
    });
  });

  describe("Caching integration", () => {
    it("should cache getMe responses", async () => {
      const { callTelegramAPI } = await import("../../src/telegram-api.js");
      const { clearCache } = await import("../../src/cache/index.js");
      clearCache();

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        json: () => Promise.resolve({ ok: true, result: { id: 123 } }),
      });

      // First call
      await callTelegramAPI("getMe", {});
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Second call should use cache
      await callTelegramAPI("getMe", {});
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it("should not cache sendMessage responses", async () => {
      const { isCacheable } = await import("../../src/cache/index.js");

      // sendMessage should not be cacheable
      expect(isCacheable("sendMessage")).toBe(false);
      // getMe should be cacheable
      expect(isCacheable("getMe")).toBe(true);
    });

  });

  describe("Rate limiting integration", () => {
    it("should track rate limiter status correctly", async () => {
      const { getRateLimiterStatus } = await import("../../src/telegram-api.js");

      const status = getRateLimiterStatus();
      expect(status).toHaveProperty("requestsInWindow");
      expect(status).toHaveProperty("limited");
      expect(status).toHaveProperty("perChatTracked");
    });
  });

  describe("Circuit breaker integration", () => {
    it("should track circuit breaker status", async () => {
      const { getCircuitBreakerStatus } = await import("../../src/telegram-api.js");

      const status = getCircuitBreakerStatus();
      expect(status).toHaveProperty("state");
      expect(status).toHaveProperty("consecutiveFailures");
      expect(["closed", "open", "half-open"]).toContain(status.state);
    });
  });

  describe("Retry logic", () => {
    it("should not retry on non-retriable errors", async () => {
      const { callTelegramAPI } = await import("../../src/telegram-api.js");

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        json: () => Promise.resolve({
          ok: false,
          error_code: 400,
          description: "Bad Request",
        }),
      });

      await callTelegramAPI("sendMessage", { chat_id: 123, text: "Test" });

      // Should only be called once (no retries for 400)
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });
});
