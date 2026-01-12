import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock metrics to avoid side effects
vi.mock("../../src/metrics/index.js", () => ({
  cacheHitsTotal: { inc: vi.fn() },
  cacheMissesTotal: { inc: vi.fn() },
  cacheSize: { set: vi.fn() },
}));

describe("Cache", () => {
  beforeEach(async () => {
    vi.resetModules();
    // Set required env before importing
    process.env.TELEGRAM_BOT_TOKEN = "123456789:ABCdefGHIjklMNOpqrsTUVwxyz";
  });

  it("should cache responses", async () => {
    const { setCache, getCached, clearCache } = await import("../../src/cache/index.js");
    clearCache();

    const testData = { id: 123, name: "test" };
    setCache("getMe", {}, testData);

    const cached = getCached("getMe", {});
    expect(cached).toEqual(testData);
  });

  it("should return null for expired entries", async () => {
    const { setCache, getCached, clearCache } = await import("../../src/cache/index.js");
    clearCache();

    const testData = { id: 123 };
    // Set with very short TTL (1ms)
    setCache("getMe", {}, testData, 1);

    // Wait for expiration
    await new Promise((resolve) => setTimeout(resolve, 10));

    const cached = getCached("getMe", {});
    expect(cached).toBeNull();
  });

  it("should respect TTL per method", async () => {
    const { CACHE_TTL } = await import("../../src/cache/index.js");

    // Verify different methods have different TTLs
    expect(CACHE_TTL.getMe).toBe(60 * 60 * 1000); // 1 hour
    expect(CACHE_TTL.getWebhookInfo).toBe(60 * 1000); // 1 minute
    expect(CACHE_TTL.getChat).toBe(2 * 60 * 1000); // 2 minutes
  });

  it("should clear specific method cache", async () => {
    const { setCache, getCached, clearCacheForMethod, clearCache } = await import("../../src/cache/index.js");
    clearCache();

    setCache("getMe", {}, { id: 1 });
    setCache("getChat", { chat_id: 123 }, { id: 123 });

    clearCacheForMethod("getMe");

    expect(getCached("getMe", {})).toBeNull();
    expect(getCached("getChat", { chat_id: 123 })).not.toBeNull();
  });

  it("should clear all cache", async () => {
    const { setCache, getCached, clearCache, getCacheStats } = await import("../../src/cache/index.js");

    setCache("getMe", {}, { id: 1 });
    setCache("getChat", { chat_id: 123 }, { id: 123 });

    clearCache();
    const stats = getCacheStats();

    expect(stats.size).toBe(0);
    expect(getCached("getMe", {})).toBeNull();
    expect(getCached("getChat", { chat_id: 123 })).toBeNull();
  });

  it("should report correct stats", async () => {
    const { setCache, getCacheStats, clearCache } = await import("../../src/cache/index.js");
    clearCache();

    setCache("getMe", {}, { id: 1 });
    setCache("getMe", { extra: true }, { id: 2 });
    setCache("getChat", { chat_id: 123 }, { id: 123 });

    const stats = getCacheStats();

    expect(stats.size).toBe(3);
    expect(stats.methods.getMe).toBe(2);
    expect(stats.methods.getChat).toBe(1);
  });

  it("should check if method is cacheable", async () => {
    const { isCacheable } = await import("../../src/cache/index.js");

    expect(isCacheable("getMe")).toBe(true);
    expect(isCacheable("sendMessage")).toBe(false);
    expect(isCacheable("unknownMethod")).toBe(false);
  });
});
