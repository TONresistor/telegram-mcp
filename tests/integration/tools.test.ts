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

describe("Tools Integration", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    process.env.TELEGRAM_BOT_TOKEN = "123456789:ABCdefGHIjklMNOpqrsTUVwxyz";
    process.env.RATE_LIMIT_PER_MINUTE = "100";
    process.env.MAX_RETRIES = "0";
  });

  describe("Tool handlers", () => {
    it("should export message tools", async () => {
      const tools = await import("../../src/tools/messages.js");

      expect(tools).toHaveProperty("messageTools");
      expect(Array.isArray(tools.messageTools)).toBe(true);
      expect(tools.messageTools.length).toBeGreaterThan(0);
    });

    it("should have correct tool structure", async () => {
      const { messageTools } = await import("../../src/tools/messages.js");

      const sendMessageTool = messageTools.find((t: { name: string }) => t.name === "sendMessage");

      expect(sendMessageTool).toBeDefined();
      expect(sendMessageTool).toHaveProperty("name");
      expect(sendMessageTool).toHaveProperty("description");
      expect(sendMessageTool).toHaveProperty("inputSchema");
    });

    it("should export chat tools", async () => {
      const tools = await import("../../src/tools/chat.js");

      expect(tools).toHaveProperty("chatTools");
      expect(Array.isArray(tools.chatTools)).toBe(true);
    });

    it("should export bot tools", async () => {
      const tools = await import("../../src/tools/bot.js");

      expect(tools).toHaveProperty("botTools");
      expect(Array.isArray(tools.botTools)).toBe(true);
    });

    it("should export sticker tools", async () => {
      const tools = await import("../../src/tools/stickers.js");

      expect(tools).toHaveProperty("stickerTools");
      expect(Array.isArray(tools.stickerTools)).toBe(true);
    });

    it("should export inline tools", async () => {
      const tools = await import("../../src/tools/inline.js");

      expect(tools).toHaveProperty("inlineTools");
      expect(Array.isArray(tools.inlineTools)).toBe(true);
    });

    it("should export forum tools", async () => {
      const tools = await import("../../src/tools/forum.js");

      expect(tools).toHaveProperty("forumTools");
      expect(Array.isArray(tools.forumTools)).toBe(true);
    });

    it("should export game tools", async () => {
      const tools = await import("../../src/tools/games.js");

      expect(tools).toHaveProperty("gameTools");
      expect(Array.isArray(tools.gameTools)).toBe(true);
    });

    it("should export payment tools", async () => {
      const tools = await import("../../src/tools/payments.js");

      expect(tools).toHaveProperty("paymentTools");
      expect(Array.isArray(tools.paymentTools)).toBe(true);
    });
  });

  describe("Tool input schemas", () => {
    it("should have valid JSON Schema for sendMessage", async () => {
      const { messageTools } = await import("../../src/tools/messages.js");

      const sendMessageTool = messageTools.find((t: { name: string }) => t.name === "sendMessage");
      const schema = sendMessageTool?.inputSchema;

      expect(schema).toHaveProperty("type", "object");
      expect(schema).toHaveProperty("properties");
      expect(schema.properties).toHaveProperty("chat_id");
      expect(schema.properties).toHaveProperty("text");
      expect(schema.required).toContain("chat_id");
      expect(schema.required).toContain("text");
    });
  });
});
