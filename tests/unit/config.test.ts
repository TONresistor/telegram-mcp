import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// We need to reset modules between tests
describe("Config", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("loadConfig", () => {
    it("should load from environment", async () => {
      process.env.TELEGRAM_BOT_TOKEN = "123456789:ABCdefGHIjklMNOpqrsTUVwxyz";
      process.env.LOG_LEVEL = "debug";

      const { loadConfig, clearConfigCache } = await import("../../src/config/index.js");
      clearConfigCache();
      const config = loadConfig();

      expect(config.botToken).toBe("123456789:ABCdefGHIjklMNOpqrsTUVwxyz");
      expect(config.logLevel).toBe("debug");
    });

    it("should validate bot token format", async () => {
      process.env.TELEGRAM_BOT_TOKEN = "invalid-token";

      const { loadConfig, clearConfigCache } = await import("../../src/config/index.js");
      clearConfigCache();

      expect(() => loadConfig()).toThrow("format is invalid");
    });

    it("should use defaults for optional values", async () => {
      process.env.TELEGRAM_BOT_TOKEN = "123456789:ABCdefGHIjklMNOpqrsTUVwxyz";

      const { loadConfig, clearConfigCache } = await import("../../src/config/index.js");
      clearConfigCache();
      const config = loadConfig();

      expect(config.logLevel).toBe("info");
      expect(config.requestTimeout).toBe(30000);
      expect(config.maxRetries).toBe(3);
      expect(config.rateLimitPerMinute).toBe(30);
      expect(config.debug).toBe(false);
    });

    it("should clamp values to ranges", async () => {
      process.env.TELEGRAM_BOT_TOKEN = "123456789:ABCdefGHIjklMNOpqrsTUVwxyz";
      process.env.REQUEST_TIMEOUT = "1000"; // Below min (5000)
      process.env.MAX_RETRIES = "100"; // Above max (10)

      const { loadConfig, clearConfigCache } = await import("../../src/config/index.js");
      clearConfigCache();
      const config = loadConfig();

      expect(config.requestTimeout).toBe(5000); // Clamped to min
      expect(config.maxRetries).toBe(10); // Clamped to max
    });

    it("should throw on missing required values", async () => {
      delete process.env.TELEGRAM_BOT_TOKEN;

      const { loadConfig, clearConfigCache } = await import("../../src/config/index.js");
      clearConfigCache();

      expect(() => loadConfig()).toThrow("TELEGRAM_BOT_TOKEN is required");
    });

    it("should mask sensitive values in safe config", async () => {
      process.env.TELEGRAM_BOT_TOKEN = "123456789:ABCdefGHIjklMNOpqrsTUVwxyz";
      process.env.WEBHOOK_SECRET = "super-secret";

      const { loadConfig, clearConfigCache, getSafeConfigForLogging } = await import("../../src/config/index.js");
      clearConfigCache();
      loadConfig();

      const safe = getSafeConfigForLogging();
      expect(safe.botToken).toContain("...");
      expect(safe.botToken).not.toBe("123456789:ABCdefGHIjklMNOpqrsTUVwxyz");
      expect(safe.webhookSecret).toBe("[REDACTED]");
    });

    it("should parse HEALTH_PORT", async () => {
      process.env.TELEGRAM_BOT_TOKEN = "123456789:ABCdefGHIjklMNOpqrsTUVwxyz";
      process.env.HEALTH_PORT = "8080";

      const { loadConfig, clearConfigCache } = await import("../../src/config/index.js");
      clearConfigCache();
      const config = loadConfig();

      expect(config.healthPort).toBe(8080);
    });
  });
});
