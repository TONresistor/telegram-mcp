/**
 * Bot Base Methods - Category 2
 *
 * Methods:
 * - getMe
 * - logOut
 * - close
 */

import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { callTelegramAPI, createToolResult } from "../telegram-api.js";

// =============================================================================
// TOOL DEFINITIONS
// =============================================================================

export const botTools: Tool[] = [
  {
    name: "getMe",
    description:
      "Get basic information about the bot. Returns a User object with id, is_bot, first_name, username, etc.",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "logOut",
    description:
      "Log out from the cloud Bot API server. After logging out, you must wait 10 minutes before logging in again.",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "close",
    description:
      "Close the bot instance. Use before moving the bot to a local server. Must be called before running locally.",
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

export async function handleBotTool(
  name: string,
  args: Record<string, unknown>
) {
  const response = await callTelegramAPI(name, args);
  return createToolResult(response);
}
