#!/usr/bin/env node

/**
 * Telegram Bot API MCP Server - HTTP Transport
 *
 * This server exposes the complete Telegram Bot API as MCP tools over HTTP.
 * Use this for remote access from LLM APIs (OpenAI, etc.) or web applications.
 *
 * Features:
 * - All 162 Telegram Bot API methods
 * - Streamable HTTP transport (MCP spec 2025-03-26)
 * - Optional API key authentication
 * - CORS support for browser clients
 * - Structured logging
 * - Rate limiting
 * - Automatic retries
 */

import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";

import {
  loadConfig,
  getConfig,
  getSafeConfigForLogging,
  ConfigurationError,
} from "./config/index.js";
import { logger, generateRequestId } from "./logging/index.js";
import { createToolResult } from "./telegram-api.js";
import { validateParams } from "./validation/index.js";
import { startWebhookServer, stopWebhookServer } from "./webhook/index.js";

// Import tool definitions from categories
import { updatesTools, handleUpdatesTool } from "./tools/updates.js";
import { botTools, handleBotTool } from "./tools/bot.js";
import { forumTools, handleForumTool } from "./tools/forum.js";
import { inlineTools, handleInlineTool } from "./tools/inline.js";
import { editingTools, handleEditingTool } from "./tools/editing.js";
import { giftTools, handleGiftTool } from "./tools/gifts.js";
import { verificationTools, handleVerificationTool } from "./tools/verification.js";
import { passportTools, handlePassportTool } from "./tools/passport.js";
import { businessTools, handleBusinessTool } from "./tools/business.js";
import { paymentTools, handlePaymentTool } from "./tools/payments.js";
import { gameTools, handleGameTool } from "./tools/games.js";
import { settingsTools, handleSettingsTool } from "./tools/settings.js";
import { chatTools, handleChatTool } from "./tools/chat.js";
import { messageTools, handleMessageTool } from "./tools/messages.js";
import { stickerTools, handleStickerTool } from "./tools/stickers.js";

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

type ToolHandler = (
  name: string,
  args: Record<string, unknown>
) => Promise<ReturnType<typeof createToolResult>>;

// =============================================================================
// HTTP SERVER CONFIGURATION
// =============================================================================

const HTTP_PORT = parseInt(process.env.MCP_HTTP_PORT || "3001", 10);
const MCP_API_KEY = process.env.MCP_API_KEY; // Optional API key for authentication
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*"; // CORS allowed origins

// =============================================================================
// VALIDATE CONFIGURATION
// =============================================================================

function validateConfiguration(): void {
  try {
    const config = loadConfig();
    logger.info("Configuration loaded", getSafeConfigForLogging());

    if (config.debug) {
      logger.warning("Debug mode is enabled - do not use in production");
    }
  } catch (error) {
    if (error instanceof ConfigurationError) {
      console.error("\n[CONFIGURATION ERROR]");
      console.error(error.message);
      console.error("\nPlease check your environment variables.\n");
      process.exit(1);
    }
    throw error;
  }
}

// =============================================================================
// SERVER INITIALIZATION
// =============================================================================

const server = new Server(
  {
    name: "telegram-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// =============================================================================
// COMBINE ALL TOOLS
// =============================================================================

const allTools: Tool[] = [
  ...updatesTools,
  ...botTools,
  ...forumTools,
  ...inlineTools,
  ...editingTools,
  ...giftTools,
  ...verificationTools,
  ...passportTools,
  ...businessTools,
  ...paymentTools,
  ...gameTools,
  ...settingsTools,
  ...chatTools,
  ...messageTools,
  ...stickerTools,
];

// =============================================================================
// TOOL HANDLER REGISTRY
// =============================================================================

const toolHandlers: Record<string, ToolHandler> = {
  // Updates category (4 methods)
  getUpdates: handleUpdatesTool,
  setWebhook: handleUpdatesTool,
  deleteWebhook: handleUpdatesTool,
  getWebhookInfo: handleUpdatesTool,

  // Bot category (3 methods)
  getMe: handleBotTool,
  logOut: handleBotTool,
  close: handleBotTool,

  // Forum category (13 methods)
  getForumTopicIconStickers: handleForumTool,
  createForumTopic: handleForumTool,
  editForumTopic: handleForumTool,
  closeForumTopic: handleForumTool,
  reopenForumTopic: handleForumTool,
  deleteForumTopic: handleForumTool,
  unpinAllForumTopicMessages: handleForumTool,
  editGeneralForumTopic: handleForumTool,
  closeGeneralForumTopic: handleForumTool,
  reopenGeneralForumTopic: handleForumTool,
  hideGeneralForumTopic: handleForumTool,
  unhideGeneralForumTopic: handleForumTool,
  unpinAllGeneralForumTopicMessages: handleForumTool,

  // Inline & Callbacks category (4 methods)
  answerInlineQuery: handleInlineTool,
  answerCallbackQuery: handleInlineTool,
  answerWebAppQuery: handleInlineTool,
  savePreparedInlineMessage: handleInlineTool,

  // Reactions category (1 method)
  setMessageReaction: handleInlineTool,

  // Boosts category (2 methods)
  getUserChatBoosts: handleInlineTool,
  getBusinessConnection: handleInlineTool,

  // Editing/Updating Messages category (9 methods)
  editMessageText: handleEditingTool,
  editMessageCaption: handleEditingTool,
  editMessageMedia: handleEditingTool,
  editMessageLiveLocation: handleEditingTool,
  stopMessageLiveLocation: handleEditingTool,
  editMessageReplyMarkup: handleEditingTool,
  stopPoll: handleEditingTool,
  deleteMessage: handleEditingTool,
  deleteMessages: handleEditingTool,

  // Payments category (8 methods)
  sendInvoice: handlePaymentTool,
  createInvoiceLink: handlePaymentTool,
  answerShippingQuery: handlePaymentTool,
  answerPreCheckoutQuery: handlePaymentTool,
  getStarTransactions: handlePaymentTool,
  refundStarPayment: handlePaymentTool,
  editUserStarSubscription: handlePaymentTool,
  getMyStarBalance: handlePaymentTool,

  // Games category (3 methods)
  sendGame: handleGameTool,
  setGameScore: handleGameTool,
  getGameHighScores: handleGameTool,

  // Chat Management category (30 methods)
  banChatMember: handleChatTool,
  unbanChatMember: handleChatTool,
  restrictChatMember: handleChatTool,
  promoteChatMember: handleChatTool,
  setChatAdministratorCustomTitle: handleChatTool,
  banChatSenderChat: handleChatTool,
  unbanChatSenderChat: handleChatTool,
  setChatPermissions: handleChatTool,
  exportChatInviteLink: handleChatTool,
  createChatInviteLink: handleChatTool,
  editChatInviteLink: handleChatTool,
  createChatSubscriptionInviteLink: handleChatTool,
  editChatSubscriptionInviteLink: handleChatTool,
  revokeChatInviteLink: handleChatTool,
  approveChatJoinRequest: handleChatTool,
  declineChatJoinRequest: handleChatTool,
  setChatPhoto: handleChatTool,
  deleteChatPhoto: handleChatTool,
  setChatTitle: handleChatTool,
  setChatDescription: handleChatTool,
  pinChatMessage: handleChatTool,
  unpinChatMessage: handleChatTool,
  unpinAllChatMessages: handleChatTool,
  leaveChat: handleChatTool,
  getChat: handleChatTool,
  getChatAdministrators: handleChatTool,
  getChatMemberCount: handleChatTool,
  getChatMember: handleChatTool,
  setChatStickerSet: handleChatTool,
  deleteChatStickerSet: handleChatTool,

  // Gifts category (9 methods)
  getAvailableGifts: handleGiftTool,
  sendGift: handleGiftTool,
  giftPremiumSubscription: handleGiftTool,
  getBusinessAccountGifts: handleGiftTool,
  getUserGifts: handleGiftTool,
  getChatGifts: handleGiftTool,
  convertGiftToStars: handleGiftTool,
  upgradeGift: handleGiftTool,
  transferGift: handleGiftTool,

  // Verification category (4 methods)
  verifyUser: handleVerificationTool,
  verifyChat: handleVerificationTool,
  removeUserVerification: handleVerificationTool,
  removeChatVerification: handleVerificationTool,

  // Telegram Passport category (1 method)
  setPassportDataErrors: handlePassportTool,

  // Settings category - Commands (3 methods)
  setMyCommands: handleSettingsTool,
  deleteMyCommands: handleSettingsTool,
  getMyCommands: handleSettingsTool,

  // Settings category - Bot Name & Description (6 methods)
  setMyName: handleSettingsTool,
  getMyName: handleSettingsTool,
  setMyDescription: handleSettingsTool,
  getMyDescription: handleSettingsTool,
  setMyShortDescription: handleSettingsTool,
  getMyShortDescription: handleSettingsTool,

  // Settings category - Menu Button (2 methods)
  setChatMenuButton: handleSettingsTool,
  getChatMenuButton: handleSettingsTool,

  // Settings category - Administrator Rights (2 methods)
  setMyDefaultAdministratorRights: handleSettingsTool,
  getMyDefaultAdministratorRights: handleSettingsTool,

  // Users category (3 methods)
  getUserProfilePhotos: handleSettingsTool,
  setUserEmojiStatus: handleSettingsTool,
  getFile: handleSettingsTool,

  // Business category (10 methods)
  readBusinessMessage: handleBusinessTool,
  deleteBusinessMessages: handleBusinessTool,
  setBusinessAccountName: handleBusinessTool,
  setBusinessAccountUsername: handleBusinessTool,
  setBusinessAccountBio: handleBusinessTool,
  setBusinessAccountProfilePhoto: handleBusinessTool,
  removeBusinessAccountProfilePhoto: handleBusinessTool,
  setBusinessAccountGiftSettings: handleBusinessTool,
  getBusinessAccountStarBalance: handleBusinessTool,
  transferBusinessAccountStars: handleBusinessTool,

  // Stories category (4 methods)
  postStory: handleBusinessTool,
  editStory: handleBusinessTool,
  deleteStory: handleBusinessTool,
  repostStory: handleBusinessTool,

  // Suggested Posts category (2 methods)
  approveSuggestedPost: handleBusinessTool,
  declineSuggestedPost: handleBusinessTool,

  // Sending Messages category (22 methods)
  sendMessage: handleMessageTool,
  forwardMessage: handleMessageTool,
  forwardMessages: handleMessageTool,
  copyMessage: handleMessageTool,
  copyMessages: handleMessageTool,
  sendPhoto: handleMessageTool,
  sendAudio: handleMessageTool,
  sendDocument: handleMessageTool,
  sendVideo: handleMessageTool,
  sendAnimation: handleMessageTool,
  sendVoice: handleMessageTool,
  sendVideoNote: handleMessageTool,
  sendPaidMedia: handleMessageTool,
  sendMediaGroup: handleMessageTool,
  sendLocation: handleMessageTool,
  sendVenue: handleMessageTool,
  sendContact: handleMessageTool,
  sendPoll: handleMessageTool,
  sendChecklist: handleMessageTool,
  sendDice: handleMessageTool,
  sendMessageDraft: handleMessageTool,
  sendChatAction: handleMessageTool,

  // Stickers category (16 methods)
  sendSticker: handleStickerTool,
  getStickerSet: handleStickerTool,
  getCustomEmojiStickers: handleStickerTool,
  uploadStickerFile: handleStickerTool,
  createNewStickerSet: handleStickerTool,
  addStickerToSet: handleStickerTool,
  setStickerPositionInSet: handleStickerTool,
  deleteStickerFromSet: handleStickerTool,
  replaceStickerInSet: handleStickerTool,
  setStickerEmojiList: handleStickerTool,
  setStickerKeywords: handleStickerTool,
  setStickerMaskPosition: handleStickerTool,
  setStickerSetTitle: handleStickerTool,
  setStickerSetThumbnail: handleStickerTool,
  setCustomEmojiStickerSetThumbnail: handleStickerTool,
  deleteStickerSet: handleStickerTool,
};

// =============================================================================
// REQUEST HANDLERS
// =============================================================================

/**
 * Handle tools/list request
 * Returns all available Telegram API tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  logger.debug("tools/list request", { toolCount: allTools.length });
  return { tools: allTools };
});

/**
 * Handle tools/call request
 * Routes to appropriate handler based on tool name
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const toolArgs = (args ?? {}) as Record<string, unknown>;
  const requestId = generateRequestId();
  const startTime = Date.now();

  logger.info("Tool call", { requestId, tool: name });

  // Find the appropriate handler
  const handler = toolHandlers[name];

  if (handler) {
    // Validate parameters before calling handler
    const validation = validateParams(name, toolArgs);
    if (!validation.success) {
      logger.warning("Validation failed", { requestId, tool: name, error: validation.error, durationMs: Date.now() - startTime });
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              error: true,
              description: validation.error,
              details: validation.details,
            }),
          },
        ],
        isError: true,
      };
    }

    try {
      const result = await handler(name, validation.data);
      logger.info("Tool complete", { requestId, tool: name, durationMs: Date.now() - startTime });
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.error("Tool error", { requestId, tool: name, error: errorMessage, durationMs: Date.now() - startTime });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              error: true,
              description: "Internal error occurred. Check server logs for details.",
            }),
          },
        ],
        isError: true,
      };
    }
  }

  // Tool not found
  logger.warning("Unknown tool", { requestId, tool: name, durationMs: Date.now() - startTime });
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify({
          error: true,
          description: `Unknown tool: ${name}. Use tools/list to see available tools.`,
        }),
      },
    ],
    isError: true,
  };
});

// =============================================================================
// HTTP TRANSPORT SETUP
// =============================================================================

// Create stateless transport (no session management needed for simple use cases)
// For stateful sessions, pass a sessionIdGenerator function instead of undefined
const transport = new StreamableHTTPServerTransport({
  sessionIdGenerator: undefined, // Stateless mode
});

// =============================================================================
// HTTP SERVER HELPERS
// =============================================================================

/**
 * Set CORS headers on the response
 */
function setCorsHeaders(res: ServerResponse): void {
  res.setHeader("Access-Control-Allow-Origin", CORS_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept, Authorization, Mcp-Session-Id");
  res.setHeader("Access-Control-Expose-Headers", "Mcp-Session-Id");
}

/**
 * Validate API key if configured
 */
function validateApiKey(req: IncomingMessage): boolean {
  if (!MCP_API_KEY) {
    return true; // No API key configured, allow all requests
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return false;
  }

  // Support both "Bearer <key>" and just "<key>"
  const key = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  return key === MCP_API_KEY;
}

/**
 * Read request body as JSON
 */
async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

/**
 * Send JSON response
 */
function sendJson(res: ServerResponse, statusCode: number, data: unknown): void {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

/**
 * Send error response
 */
function sendError(res: ServerResponse, statusCode: number, message: string): void {
  sendJson(res, statusCode, {
    jsonrpc: "2.0",
    error: {
      code: -32000,
      message,
    },
    id: null,
  });
}

// =============================================================================
// HTTP REQUEST HANDLER
// =============================================================================

async function handleHttpRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const url = new URL(req.url || "/", `http://${req.headers.host}`);
  const path = url.pathname;

  // Set CORS headers for all responses
  setCorsHeaders(res);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // Health check endpoint
  if (path === "/health" && req.method === "GET") {
    sendJson(res, 200, {
      status: "ok",
      server: "telegram-mcp",
      version: "1.0.0",
      tools: allTools.length,
    });
    return;
  }

  // MCP endpoint
  if (path === "/mcp") {
    // Validate API key for MCP requests
    if (!validateApiKey(req)) {
      logger.warning("Unauthorized request", { path, method: req.method });
      sendError(res, 401, "Unauthorized: Invalid or missing API key");
      return;
    }

    if (req.method === "POST") {
      try {
        const body = await readJsonBody(req);

        // Let the transport handle the request
        // The transport will set appropriate headers and write the response
        await transport.handleRequest(req, res, body);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        logger.error("MCP request error", { error: message });
        if (!res.headersSent) {
          sendError(res, 400, message);
        }
      }
      return;
    }

    if (req.method === "GET") {
      // GET is used for SSE streaming (server-to-client notifications)
      // For stateless mode, we don't support this
      res.writeHead(405, { "Content-Type": "text/plain" });
      res.end("Method Not Allowed: This server runs in stateless mode");
      return;
    }

    if (req.method === "DELETE") {
      // DELETE is used to terminate sessions
      // For stateless mode, we just acknowledge
      res.writeHead(202);
      res.end();
      return;
    }
  }

  // 404 for unknown paths
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not Found");
}

// =============================================================================
// GRACEFUL SHUTDOWN
// =============================================================================

let httpServer: ReturnType<typeof createServer> | null = null;

function setupShutdownHandlers(): void {
  const shutdown = async (signal: string) => {
    logger.info("Shutdown signal received", { signal });
    try {
      await stopWebhookServer();

      if (httpServer) {
        await new Promise<void>((resolve) => {
          httpServer!.close(() => resolve());
        });
      }

      await transport.close();
      await server.close();
      logger.info("Server closed gracefully");
    } catch (error) {
      logger.error("Shutdown error", { error: error instanceof Error ? error.message : String(error) });
    }
    process.exit(0);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  process.on("uncaughtException", (error) => {
    logger.critical("Uncaught exception", { error: error.message });
    process.exit(1);
  });

  process.on("unhandledRejection", (reason) => {
    logger.critical("Unhandled rejection", {
      reason: reason instanceof Error ? reason.message : String(reason),
    });
    process.exit(1);
  });
}

// =============================================================================
// SERVER STARTUP
// =============================================================================

async function main(): Promise<void> {
  // Setup shutdown handlers
  setupShutdownHandlers();

  // Validate configuration first
  validateConfiguration();

  // Get config for webhook settings
  const config = getConfig();

  // Start webhook server if WEBHOOK_URL is configured
  if (config.webhookUrl) {
    const webhookPort = config.webhookPort ?? 3000;
    await startWebhookServer(webhookPort);
    logger.info("Webhook mode enabled", {
      port: webhookPort,
      webhookUrl: config.webhookUrl,
    });
  }

  // Connect MCP server to transport
  await server.connect(transport);

  // Create and start HTTP server
  httpServer = createServer(handleHttpRequest);

  httpServer.listen(HTTP_PORT, () => {
    logger.info("Starting Telegram MCP Server (HTTP)", {
      version: "1.0.0",
      tools: allTools.length,
      port: HTTP_PORT,
      mode: config.webhookUrl ? "webhook" : "polling",
      auth: MCP_API_KEY ? "enabled" : "disabled",
      cors: CORS_ORIGIN,
    });

    console.log(`
╔════════════════════════════════════════════════════════════╗
║           Telegram MCP Server (HTTP Transport)             ║
╠════════════════════════════════════════════════════════════╣
║  Endpoint:  http://localhost:${HTTP_PORT}/mcp                          ║
║  Health:    http://localhost:${HTTP_PORT}/health                       ║
║  Tools:     ${allTools.length} available                                    ║
║  Auth:      ${MCP_API_KEY ? "API Key required" : "None (open access)"}                          ║
╚════════════════════════════════════════════════════════════╝
`);
  });
}

// Start the server
main().catch((error) => {
  logger.critical("Fatal startup error", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
