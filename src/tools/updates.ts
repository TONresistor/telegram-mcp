/**
 * Getting Updates - Category 1
 *
 * Methods:
 * - getUpdates
 * - setWebhook
 * - deleteWebhook
 * - getWebhookInfo
 */

import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { callTelegramAPI, createToolResult } from "../telegram-api.js";

// =============================================================================
// TOOL DEFINITIONS
// =============================================================================

export const updatesTools: Tool[] = [
  {
    name: "getUpdates",
    description:
      "Receive incoming updates using long polling. Returns an Array of Update objects.",
    inputSchema: {
      type: "object",
      properties: {
        offset: {
          type: "integer",
          description:
            "Identifier of the first update to be returned. Must be greater than the highest update_id received.",
        },
        limit: {
          type: "integer",
          description:
            "Limits the number of updates to be retrieved (1-100). Defaults to 100.",
          minimum: 1,
          maximum: 100,
        },
        timeout: {
          type: "integer",
          description:
            "Timeout in seconds for long polling (0-50). Defaults to 0 (short polling).",
          minimum: 0,
          maximum: 50,
        },
        allowed_updates: {
          type: "array",
          items: { type: "string" },
          description:
            'List of update types to receive. E.g., ["message", "edited_message", "callback_query"]',
        },
      },
      required: [],
    },
  },
  {
    name: "setWebhook",
    description:
      "Specify a URL to receive incoming updates via webhook. Use deleteWebhook to remove.",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description:
            "HTTPS URL to send updates to. Use empty string to remove webhook.",
        },
        certificate: {
          type: "string",
          description:
            "Upload your public key certificate (for self-signed certificates).",
        },
        ip_address: {
          type: "string",
          description:
            "Fixed IP address to send webhook requests instead of resolving URL.",
        },
        max_connections: {
          type: "integer",
          description:
            "Maximum allowed simultaneous HTTPS connections (1-100). Defaults to 40.",
          minimum: 1,
          maximum: 100,
        },
        allowed_updates: {
          type: "array",
          items: { type: "string" },
          description:
            'List of update types to receive. E.g., ["message", "callback_query"]',
        },
        drop_pending_updates: {
          type: "boolean",
          description: "Pass True to drop all pending updates.",
        },
        secret_token: {
          type: "string",
          description:
            "Secret token (1-256 chars) sent in X-Telegram-Bot-Api-Secret-Token header.",
        },
      },
      required: ["url"],
    },
  },
  {
    name: "deleteWebhook",
    description:
      "Remove webhook integration. Use getUpdates to receive updates after this.",
    inputSchema: {
      type: "object",
      properties: {
        drop_pending_updates: {
          type: "boolean",
          description: "Pass True to drop all pending updates.",
        },
      },
      required: [],
    },
  },
  {
    name: "getWebhookInfo",
    description:
      "Get current webhook status. Returns a WebhookInfo object with URL, pending updates count, and errors.",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
];

// =============================================================================
// TOOL HANDLER
// =============================================================================

export async function handleUpdatesTool(
  name: string,
  args: Record<string, unknown>
) {
  const response = await callTelegramAPI(name, args);
  return createToolResult(response);
}
