/**
 * Verification - Category 4
 *
 * Methods:
 * - verifyUser
 * - verifyChat
 * - removeUserVerification
 * - removeChatVerification
 */

import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { callTelegramAPI, createToolResult } from "../telegram-api.js";

// =============================================================================
// TOOL DEFINITIONS
// =============================================================================

export const verificationTools: Tool[] = [
  {
    name: "verifyUser",
    description:
      "Verifies a user on behalf of the organization which is represented by the bot. Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        user_id: {
          type: "integer",
          description: "Unique identifier of the target user.",
        },
        custom_description: {
          type: "string",
          description:
            "Custom description for the verification; 0-70 characters. Must be empty if the organization isn't allowed to provide a custom verification description.",
        },
      },
      required: ["user_id"],
    },
  },
  {
    name: "verifyChat",
    description:
      "Verifies a chat on behalf of the organization which is represented by the bot. Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["integer", "string"],
          description:
            "Unique identifier for the target chat or username of the target channel (format: @channelusername). The chat must be a supergroup or channel. Channel direct messages chats cannot be verified.",
        },
        custom_description: {
          type: "string",
          description:
            "Custom description for the verification; 0-70 characters. Must be empty if the organization isn't allowed to provide a custom verification description.",
        },
      },
      required: ["chat_id"],
    },
  },
  {
    name: "removeUserVerification",
    description:
      "Removes verification from a user who is currently verified on behalf of the organization represented by the bot. Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        user_id: {
          type: "integer",
          description: "Unique identifier of the target user.",
        },
      },
      required: ["user_id"],
    },
  },
  {
    name: "removeChatVerification",
    description:
      "Removes verification from a chat that is currently verified on behalf of the organization represented by the bot. Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["integer", "string"],
          description:
            "Unique identifier for the target chat or username of the target channel (format: @channelusername).",
        },
      },
      required: ["chat_id"],
    },
  },
];

// =============================================================================
// TOOL HANDLER
// =============================================================================

export async function handleVerificationTool(
  name: string,
  args: Record<string, unknown>
) {
  const response = await callTelegramAPI(name, args);
  return createToolResult(response);
}
