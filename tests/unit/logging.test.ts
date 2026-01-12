import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("Logger", () => {
  const originalEnv = process.env;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    process.env.TELEGRAM_BOT_TOKEN = "123456789:ABCdefGHIjklMNOpqrsTUVwxyz";
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = originalEnv;
    consoleErrorSpy.mockRestore();
  });

  it("should output structured JSON", async () => {
    const { createLogger } = await import("../../src/logging/index.js");
    const logger = createLogger("test");

    logger.info("Test message");

    expect(consoleErrorSpy).toHaveBeenCalled();
    const output = consoleErrorSpy.mock.calls[0][0];
    const parsed = JSON.parse(output);

    expect(parsed).toHaveProperty("timestamp");
    expect(parsed).toHaveProperty("level");
    expect(parsed).toHaveProperty("logger");
    expect(parsed).toHaveProperty("message");
  });

  it("should include timestamp and level", async () => {
    const { createLogger } = await import("../../src/logging/index.js");
    const logger = createLogger("test");

    logger.warning("Warning message");

    const output = consoleErrorSpy.mock.calls[0][0];
    const parsed = JSON.parse(output);

    expect(parsed.level).toBe("warning");
    expect(parsed.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("should include logger name", async () => {
    const { createLogger } = await import("../../src/logging/index.js");
    const logger = createLogger("my-component");

    logger.info("Test");

    const output = consoleErrorSpy.mock.calls[0][0];
    const parsed = JSON.parse(output);

    expect(parsed.logger).toBe("my-component");
  });

  it("should sanitize sensitive data", async () => {
    const { createLogger } = await import("../../src/logging/index.js");
    const logger = createLogger("test");

    logger.info("Request", { token: "secret123", other: "value" });

    const output = consoleErrorSpy.mock.calls[0][0];
    const parsed = JSON.parse(output);

    expect(parsed.data.token).toBe("[REDACTED]");
    expect(parsed.data.other).toBe("value");
  });

  it("should redact bot tokens", async () => {
    const { createLogger } = await import("../../src/logging/index.js");
    const logger = createLogger("test");

    logger.info("Token info", { botToken: "123456789:ABCdef" });

    const output = consoleErrorSpy.mock.calls[0][0];
    const parsed = JSON.parse(output);

    expect(parsed.data.botToken).toBe("[REDACTED]");
  });

  it("should handle nested objects", async () => {
    const { createLogger } = await import("../../src/logging/index.js");
    const logger = createLogger("test");

    logger.info("Nested", {
      level1: {
        level2: {
          password: "secret",
          normal: "value",
        },
      },
    });

    const output = consoleErrorSpy.mock.calls[0][0];
    const parsed = JSON.parse(output);

    expect(parsed.data.level1.level2.password).toBe("[REDACTED]");
    expect(parsed.data.level1.level2.normal).toBe("value");
  });

  it("should respect depth limit", async () => {
    const { createLogger } = await import("../../src/logging/index.js");
    const logger = createLogger("test");

    // Create deeply nested object
    let deepObj: Record<string, unknown> = { value: "deep" };
    for (let i = 0; i < 15; i++) {
      deepObj = { nested: deepObj };
    }

    logger.info("Deep", { data: deepObj });

    const output = consoleErrorSpy.mock.calls[0][0];
    const parsed = JSON.parse(output);

    // Should hit max depth somewhere in the chain
    const checkDepth = (obj: unknown, depth = 0): boolean => {
      if (obj === "[MAX_DEPTH]") return true;
      if (typeof obj === "object" && obj !== null) {
        return Object.values(obj).some((v) => checkDepth(v, depth + 1));
      }
      return false;
    };

    expect(checkDepth(parsed.data)).toBe(true);
  });

  it("should have all log levels", async () => {
    const { createLogger } = await import("../../src/logging/index.js");
    const logger = createLogger("test");

    // All methods should exist
    expect(typeof logger.debug).toBe("function");
    expect(typeof logger.info).toBe("function");
    expect(typeof logger.notice).toBe("function");
    expect(typeof logger.warning).toBe("function");
    expect(typeof logger.error).toBe("function");
    expect(typeof logger.critical).toBe("function");
  });

  it("should respect log level from config", async () => {
    process.env.LOG_LEVEL = "error";

    // Clear config cache
    const { clearConfigCache } = await import("../../src/config/index.js");
    clearConfigCache();

    const { createLogger } = await import("../../src/logging/index.js");
    const logger = createLogger("test");

    logger.debug("Debug message"); // Should be suppressed
    logger.info("Info message"); // Should be suppressed
    logger.error("Error message"); // Should be logged

    // Only error should have been logged
    const calls = consoleErrorSpy.mock.calls;
    expect(calls.length).toBe(1);

    const parsed = JSON.parse(calls[0][0]);
    expect(parsed.level).toBe("error");
  });
});
