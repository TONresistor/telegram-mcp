#!/usr/bin/env node

/**
 * Telegram Bot API MCP Server - META MODE
 *
 * This mode exposes only 2 tools instead of 161, reducing token usage by ~98%.
 *
 * Tools:
 * - telegram_find: Search for relevant Telegram API tools
 * - telegram_call: Execute a Telegram API tool
 *
 * Usage:
 *   TELEGRAM_BOT_TOKEN="xxx" node build/index-meta.js
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
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
import { callTelegramAPI, createToolResult } from "./telegram-api.js";
import { startWebhookServer, stopWebhookServer } from "./webhook/index.js";
import {
  searchTools,
  getToolByName,
  getCategories,
  getToolsByCategory,
  toolRegistry,
  ToolEntry,
} from "./meta/tool-registry.js";
import { validateParams } from "./validation/index.js";

// =============================================================================
// META TOOLS DEFINITIONS (only 2 tools!)
// =============================================================================

const metaTools: Tool[] = [
  {
    name: "telegram_find",
    description:
      "Search Telegram API tools. Returns matching tools with parameters info.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            "Search query (e.g., 'send photo', 'ban user', 'get chat info')",
        },
        category: {
          type: "string",
          description:
            "Filter by category: messages, chat, editing, settings, stickers, payments, business, forum, inline, games, gifts, verification, updates, bot, passport",
        },
        limit: {
          type: "integer",
          description: "Max results (default: 5, max: 15)",
          minimum: 1,
          maximum: 15,
        },
      },
      required: ["query"],
    },
  },
  {
    name: "telegram_call",
    description:
      "Execute a Telegram API tool. Use telegram_find first to discover tool names and parameters.",
    inputSchema: {
      type: "object",
      properties: {
        tool: {
          type: "string",
          description: "Tool name (e.g., 'sendMessage', 'banChatMember')",
        },
        params: {
          type: "object",
          description: "Tool parameters as key-value pairs",
        },
      },
      required: ["tool"],
    },
  },
];

// =============================================================================
// VALIDATE CONFIGURATION
// =============================================================================

function validateConfiguration(): void {
  try {
    const config = loadConfig();
    logger.info("Configuration loaded (META MODE)", getSafeConfigForLogging());

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
// FORMAT TOOL RESULTS
// =============================================================================

function formatToolInfo(tool: ToolEntry): object {
  return {
    name: tool.name,
    description: tool.description,
    category: tool.category,
    required_params: tool.required,
    optional_params: tool.optional.slice(0, 5), // Limit optional to reduce tokens
  };
}

function formatSearchResults(tools: ToolEntry[]): string {
  if (tools.length === 0) {
    return JSON.stringify({
      found: 0,
      message: "No matching tools found. Try different keywords.",
      categories: getCategories(),
    });
  }

  return JSON.stringify({
    found: tools.length,
    tools: tools.map(formatToolInfo),
    hint: "Use telegram_call with tool name and params to execute",
  });
}

// =============================================================================
// HANDLER FUNCTIONS
// =============================================================================

async function handleTelegramFind(
  args: Record<string, unknown>
): Promise<ReturnType<typeof createToolResult>> {
  const query = args.query as string | undefined;
  const category = args.category as string | undefined;
  const limit = Math.min((args.limit as number) || 5, 15);

  logger.debug("telegram_find", { query, category, limit });

  // Validate query
  if (!query || typeof query !== "string" || query.trim().length === 0) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            error: true,
            message: "Missing required parameter: query",
            example: { query: "send photo", limit: 5 },
          }),
        },
      ],
      isError: true,
    };
  }

  let results: ToolEntry[];

  if (category) {
    // Filter by category first, then search
    const categoryTools = getToolsByCategory(category);
    if (categoryTools.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              error: true,
              message: `Unknown category: ${category}`,
              valid_categories: getCategories(),
            }),
          },
        ],
        isError: true,
      };
    }

    // Search within category
    const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 1);
    results = categoryTools
      .filter((tool) => {
        const searchText = `${tool.name} ${tool.description} ${tool.keywords.join(" ")}`.toLowerCase();
        return queryWords.some((word) => searchText.includes(word));
      })
      .slice(0, limit);
  } else {
    results = searchTools(query, limit);
  }

  return {
    content: [
      {
        type: "text",
        text: formatSearchResults(results),
      },
    ],
    isError: false,
  };
}

async function handleTelegramCall(
  args: Record<string, unknown>
): Promise<ReturnType<typeof createToolResult>> {
  const toolName = args.tool as string | undefined;
  const params = (args.params as Record<string, unknown>) || {};

  // Validate tool name
  if (!toolName || typeof toolName !== "string" || toolName.trim().length === 0) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            error: true,
            message: "Missing or invalid required parameter: tool",
            example: { tool: "sendMessage", params: { chat_id: 123, text: "Hello" } },
          }),
        },
      ],
      isError: true,
    };
  }

  logger.info("telegram_call", { tool: toolName });

  // Verify tool exists
  const toolEntry = getToolByName(toolName);
  if (!toolEntry) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            error: true,
            message: `Unknown tool: ${toolName}`,
            hint: "Use telegram_find to search for available tools",
          }),
        },
      ],
      isError: true,
    };
  }

  // Check required parameters
  const missingParams = toolEntry.required.filter(
    (p) => params[p] === undefined
  );
  if (missingParams.length > 0) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            error: true,
            message: `Missing required parameters: ${missingParams.join(", ")}`,
            tool: formatToolInfo(toolEntry),
          }),
        },
      ],
      isError: true,
    };
  }

  // Validate parameters with Zod schemas (if available)
  const validation = validateParams(toolName, params);
  if (!validation.success) {
    logger.warning("Validation failed", { tool: toolName, error: validation.error });
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            error: true,
            message: validation.error,
            details: validation.details,
            tool: formatToolInfo(toolEntry),
          }),
        },
      ],
      isError: true,
    };
  }

  // Call the actual Telegram API with validated params
  const response = await callTelegramAPI(toolName, validation.data);
  return createToolResult(response);
}

// =============================================================================
// SERVER INITIALIZATION
// =============================================================================

const server = new Server(
  {
    name: "telegram-mcp-meta",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// =============================================================================
// REQUEST HANDLERS
// =============================================================================

server.setRequestHandler(ListToolsRequestSchema, async () => {
  logger.debug("tools/list request (META MODE)", { toolCount: 2 });
  return { tools: metaTools };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const toolArgs = (args ?? {}) as Record<string, unknown>;
  const requestId = generateRequestId();
  const startTime = Date.now();

  logger.info("Tool call", { requestId, tool: name });

  try {
    let result;
    switch (name) {
      case "telegram_find":
        result = await handleTelegramFind(toolArgs);
        break;

      case "telegram_call":
        result = await handleTelegramCall(toolArgs);
        break;

      default:
        logger.warning("Unknown tool", { requestId, tool: name, durationMs: Date.now() - startTime });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                error: true,
                message: `Unknown meta-tool: ${name}`,
                available: ["telegram_find", "telegram_call"],
              }),
            },
          ],
          isError: true,
        };
    }

    logger.info("Tool complete", { requestId, tool: name, durationMs: Date.now() - startTime });
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error("Tool error", { requestId, tool: name, error: errorMessage, durationMs: Date.now() - startTime });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            error: true,
            message: "Internal error occurred. Check server logs for details.",
          }),
        },
      ],
      isError: true,
    };
  }
});

// =============================================================================
// GRACEFUL SHUTDOWN
// =============================================================================

function setupShutdownHandlers(): void {
  const shutdown = async (signal: string) => {
    logger.info("Shutdown signal received", { signal });
    try {
      await stopWebhookServer();
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
  setupShutdownHandlers();
  validateConfiguration();

  // Get config for webhook settings
  const config = getConfig();

  // Start webhook server if WEBHOOK_URL is configured
  if (config.webhookUrl) {
    const webhookPort = config.webhookPort ?? 3000;
    await startWebhookServer(webhookPort);
    logger.info("Webhook mode enabled (META MODE)", {
      port: webhookPort,
      webhookUrl: config.webhookUrl,
    });
  }

  const transport = new StdioServerTransport();

  logger.info("Starting Telegram MCP Server (META MODE)", {
    version: "1.0.0",
    tools: 2,
    registeredApis: toolRegistry.length,
    mode: config.webhookUrl ? "webhook" : "polling",
  });

  await server.connect(transport);

  logger.info("Server connected and ready (META MODE)");
}

main().catch((error) => {
  logger.critical("Fatal startup error", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
