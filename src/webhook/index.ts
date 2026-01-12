/**
 * Webhook Module for Telegram MCP Server
 *
 * Provides an HTTP server to receive Telegram updates via webhook.
 * Validates incoming requests using the secret token and stores updates
 * for retrieval by MCP tools.
 */

import { createServer, IncomingMessage, ServerResponse, Server } from "http";
import { logger } from "../logging/index.js";
import { getConfig } from "../config/index.js";

// =============================================================================
// TYPES
// =============================================================================

/**
 * Telegram Update object (simplified type - actual object has many more fields)
 */
export interface TelegramUpdate {
  update_id: number;
  message?: unknown;
  edited_message?: unknown;
  channel_post?: unknown;
  edited_channel_post?: unknown;
  inline_query?: unknown;
  chosen_inline_result?: unknown;
  callback_query?: unknown;
  shipping_query?: unknown;
  pre_checkout_query?: unknown;
  poll?: unknown;
  poll_answer?: unknown;
  my_chat_member?: unknown;
  chat_member?: unknown;
  chat_join_request?: unknown;
  [key: string]: unknown;
}

// =============================================================================
// STATE
// =============================================================================

let httpServer: Server | null = null;
const pendingUpdates: TelegramUpdate[] = [];
const MAX_PENDING_UPDATES = 1000;

// =============================================================================
// REQUEST HANDLING
// =============================================================================

/**
 * Read request body as string
 */
function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
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
 * Handle incoming webhook request
 */
async function handleWebhookRequest(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  const config = getConfig();

  // Only accept POST requests
  if (req.method !== "POST") {
    logger.debug("Webhook: Rejected non-POST request", { method: req.method });
    sendJson(res, 405, { ok: false, error: "Method not allowed" });
    return;
  }

  // Validate secret token if configured
  if (config.webhookSecret) {
    const secretHeader = req.headers["x-telegram-bot-api-secret-token"];
    if (secretHeader !== config.webhookSecret) {
      logger.warning("Webhook: Invalid secret token");
      sendJson(res, 401, { ok: false, error: "Unauthorized" });
      return;
    }
  }

  try {
    // Parse request body
    const body = await readBody(req);
    const update = JSON.parse(body) as TelegramUpdate;

    // Validate update_id exists
    if (typeof update.update_id !== "number") {
      logger.warning("Webhook: Invalid update - missing update_id");
      sendJson(res, 400, { ok: false, error: "Invalid update format" });
      return;
    }

    // Store update
    pendingUpdates.push(update);

    // Trim oldest updates if exceeding limit
    while (pendingUpdates.length > MAX_PENDING_UPDATES) {
      pendingUpdates.shift();
    }

    logger.debug("Webhook: Update received", { update_id: update.update_id });

    // Telegram expects a 200 OK response
    sendJson(res, 200, { ok: true });
  } catch (error) {
    logger.error("Webhook: Failed to parse update", {
      error: error instanceof Error ? error.message : String(error),
    });
    sendJson(res, 400, { ok: false, error: "Invalid JSON" });
  }
}

/**
 * Request handler for the HTTP server
 */
function requestHandler(req: IncomingMessage, res: ServerResponse): void {
  // Handle health check endpoint
  if (req.method === "GET" && req.url === "/health") {
    sendJson(res, 200, { ok: true, pending_updates: pendingUpdates.length });
    return;
  }

  // Handle webhook endpoint (root path or /webhook)
  if (req.url === "/" || req.url === "/webhook") {
    handleWebhookRequest(req, res).catch((error) => {
      logger.error("Webhook: Unhandled error", {
        error: error instanceof Error ? error.message : String(error),
      });
      sendJson(res, 500, { ok: false, error: "Internal server error" });
    });
    return;
  }

  // 404 for other paths
  sendJson(res, 404, { ok: false, error: "Not found" });
}

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Start the webhook HTTP server
 *
 * @param port - Port to listen on (default: 3000)
 * @returns Promise that resolves when server is listening
 */
export function startWebhookServer(port: number = 3000): Promise<void> {
  return new Promise((resolve, reject) => {
    if (httpServer) {
      logger.warning("Webhook server already running");
      resolve();
      return;
    }

    httpServer = createServer(requestHandler);

    httpServer.on("error", (error) => {
      logger.error("Webhook server error", {
        error: error instanceof Error ? error.message : String(error),
      });
      reject(error);
    });

    httpServer.listen(port, () => {
      logger.info("Webhook server started", { port });
      resolve();
    });
  });
}

/**
 * Stop the webhook HTTP server
 *
 * @returns Promise that resolves when server is stopped
 */
export function stopWebhookServer(): Promise<void> {
  return new Promise((resolve) => {
    if (!httpServer) {
      resolve();
      return;
    }

    httpServer.close(() => {
      logger.info("Webhook server stopped");
      httpServer = null;
      resolve();
    });
  });
}

/**
 * Get pending updates received via webhook
 * Clears the updates after retrieval
 *
 * @param limit - Maximum number of updates to return (default: 100)
 * @returns Array of Telegram updates
 */
export function getWebhookUpdates(limit: number = 100): TelegramUpdate[] {
  const count = Math.min(limit, pendingUpdates.length);
  const updates = pendingUpdates.splice(0, count);
  return updates;
}

/**
 * Get count of pending updates without consuming them
 */
export function getPendingUpdateCount(): number {
  return pendingUpdates.length;
}

/**
 * Check if webhook server is running
 */
export function isWebhookServerRunning(): boolean {
  return httpServer !== null && httpServer.listening;
}
