/**
 * Games Methods - Category 9
 *
 * Methods:
 * - sendGame
 * - setGameScore
 * - getGameHighScores
 */

import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { callTelegramAPI, createToolResult } from "../telegram-api.js";

// =============================================================================
// TOOL DEFINITIONS
// =============================================================================

export const gameTools: Tool[] = [
  {
    name: "sendGame",
    description:
      "Send a game. On success, the sent Message is returned.",
    inputSchema: {
      type: "object",
      properties: {
        business_connection_id: {
          type: "string",
          description:
            "Unique identifier of the business connection on behalf of which the message will be sent",
        },
        chat_id: {
          type: "integer",
          description:
            "Unique identifier for the target chat",
        },
        message_thread_id: {
          type: "integer",
          description:
            "Unique identifier for the target message thread (topic) of the forum; for forum supergroups only",
        },
        game_short_name: {
          type: "string",
          description:
            "Short name of the game, serves as the unique identifier for the game. Set up your games via @BotFather.",
        },
        disable_notification: {
          type: "boolean",
          description:
            "Sends the message silently. Users will receive a notification with no sound.",
        },
        protect_content: {
          type: "boolean",
          description:
            "Protects the contents of the sent message from forwarding and saving.",
        },
        allow_paid_broadcast: {
          type: "boolean",
          description:
            "Pass True to allow up to 1000 messages per second, ignoring broadcasting limits for a fee of 0.1 Telegram Stars per message.",
        },
        message_effect_id: {
          type: "string",
          description:
            "Unique identifier of the message effect to be added to the message; for private chats only.",
        },
        reply_parameters: {
          type: "object",
          description: "Description of the message to reply to.",
        },
        reply_markup: {
          type: "object",
          description:
            "A JSON-serialized object for an inline keyboard. If empty, one 'Play game_title' button will be shown. If not empty, the first button must launch the game.",
        },
      },
      required: ["chat_id", "game_short_name"],
    },
  },
  {
    name: "setGameScore",
    description:
      "Set the score of the specified user in a game message. On success, if the message is not an inline message, the Message is returned, otherwise True is returned. Returns an error, if the new score is not greater than the user's current score in the chat and force is False.",
    inputSchema: {
      type: "object",
      properties: {
        user_id: {
          type: "integer",
          description: "User identifier",
        },
        score: {
          type: "integer",
          description: "New score, must be non-negative",
        },
        force: {
          type: "boolean",
          description:
            "Pass True if the high score is allowed to decrease. This can be useful when fixing mistakes or banning cheaters.",
        },
        disable_edit_message: {
          type: "boolean",
          description:
            "Pass True if the game message should not be automatically edited to include the current scoreboard.",
        },
        chat_id: {
          type: "integer",
          description:
            "Required if inline_message_id is not specified. Unique identifier for the target chat.",
        },
        message_id: {
          type: "integer",
          description:
            "Required if inline_message_id is not specified. Identifier of the sent message.",
        },
        inline_message_id: {
          type: "string",
          description:
            "Required if chat_id and message_id are not specified. Identifier of the inline message.",
        },
      },
      required: ["user_id", "score"],
    },
  },
  {
    name: "getGameHighScores",
    description:
      "Get data for high score tables. Will return the score of the specified user and several of their neighbors in a game. Returns an Array of GameHighScore objects.",
    inputSchema: {
      type: "object",
      properties: {
        user_id: {
          type: "integer",
          description: "Target user id",
        },
        chat_id: {
          type: "integer",
          description:
            "Required if inline_message_id is not specified. Unique identifier for the target chat.",
        },
        message_id: {
          type: "integer",
          description:
            "Required if inline_message_id is not specified. Identifier of the sent message.",
        },
        inline_message_id: {
          type: "string",
          description:
            "Required if chat_id and message_id are not specified. Identifier of the inline message.",
        },
      },
      required: ["user_id"],
    },
  },
];

// =============================================================================
// TOOL HANDLER
// =============================================================================

export async function handleGameTool(
  name: string,
  args: Record<string, unknown>
) {
  const response = await callTelegramAPI(name, args);
  return createToolResult(response);
}
