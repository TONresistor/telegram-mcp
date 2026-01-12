import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock logger
vi.mock("../../src/logging/index.js", () => ({
  createLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
  }),
}));

describe("Validation", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("should validate sendMessage schema", async () => {
    const { validateParams } = await import("../../src/validation/index.js");

    const result = validateParams("sendMessage", {
      chat_id: 123456,
      text: "Hello, World!",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.chat_id).toBe(123456);
      expect(result.data.text).toBe("Hello, World!");
    }
  });

  it("should reject missing required fields", async () => {
    const { validateParams } = await import("../../src/validation/index.js");

    const result = validateParams("sendMessage", {
      chat_id: 123456,
      // missing 'text' field
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("text");
    }
  });

  it("should reject invalid types", async () => {
    const { validateParams } = await import("../../src/validation/index.js");

    const result = validateParams("sendMessage", {
      chat_id: "not-a-valid-chat-id-or-username",
      text: 12345, // Should be string
    });

    expect(result.success).toBe(false);
  });

  it("should allow optional fields", async () => {
    const { validateParams } = await import("../../src/validation/index.js");

    const result = validateParams("sendMessage", {
      chat_id: 123456,
      text: "Hello",
      parse_mode: "HTML",
      disable_notification: true,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.parse_mode).toBe("HTML");
      expect(result.data.disable_notification).toBe(true);
    }
  });

  it("should pass through unknown fields (lenient mode)", async () => {
    const { validateParams } = await import("../../src/validation/index.js");

    const result = validateParams("sendMessage", {
      chat_id: 123456,
      text: "Hello",
      future_field: "some value", // Unknown field
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.future_field).toBe("some value");
    }
  });

  it("should lazy-load schemas", async () => {
    const { getSchemaStats, validateParams } = await import("../../src/validation/index.js");

    const statsBefore = getSchemaStats();
    const loadedBefore = statsBefore.loaded;

    // Validate a new method
    validateParams("sendPhoto", { chat_id: 123, photo: "file_id" });

    const statsAfter = getSchemaStats();
    expect(statsAfter.loaded).toBeGreaterThanOrEqual(loadedBefore);
  });

  it("should check if method has schema", async () => {
    const { hasSchema } = await import("../../src/validation/index.js");

    expect(hasSchema("sendMessage")).toBe(true);
    expect(hasSchema("unknownMethod")).toBe(false);
  });

  it("should pass through methods without schemas", async () => {
    const { validateParams } = await import("../../src/validation/index.js");

    // A method without a defined schema should pass through
    const result = validateParams("unknownNewMethod", {
      any_param: "value",
    });

    expect(result.success).toBe(true);
  });

  it("should validate editMessageText with either chat_id+message_id or inline_message_id", async () => {
    const { validateParams } = await import("../../src/validation/index.js");

    // Valid with chat_id + message_id
    const result1 = validateParams("editMessageText", {
      text: "New text",
      chat_id: 123,
      message_id: 456,
    });
    expect(result1.success).toBe(true);

    // Valid with inline_message_id
    const result2 = validateParams("editMessageText", {
      text: "New text",
      inline_message_id: "abc123",
    });
    expect(result2.success).toBe(true);

    // Invalid: missing both
    const result3 = validateParams("editMessageText", {
      text: "New text",
    });
    expect(result3.success).toBe(false);
  });
});
