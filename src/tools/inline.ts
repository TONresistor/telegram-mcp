/**
 * Inline & Callbacks, Reactions, Boosts - Categories 7, 8, 9
 *
 * Methods:
 * - answerInlineQuery
 * - answerCallbackQuery
 * - answerWebAppQuery
 * - savePreparedInlineMessage
 * - setMessageReaction
 * - getUserChatBoosts
 * - getBusinessConnection
 */

import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { callTelegramAPI, createToolResult } from "../telegram-api.js";

// =============================================================================
// TOOL DEFINITIONS
// =============================================================================

export const inlineTools: Tool[] = [
  // ---------------------------------------------------------------------------
  // INLINE & CALLBACKS (4 methods)
  // ---------------------------------------------------------------------------
  {
    name: "answerInlineQuery",
    description:
      "Send answers to an inline query. Results are displayed in the user's chat. Maximum 50 results per query. Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        inline_query_id: {
          type: "string",
          description: "Unique identifier for the answered query.",
        },
        results: {
          type: "array",
          description:
            "A JSON-serialized array of InlineQueryResult objects representing results for the inline query.",
          items: { type: "object" },
        },
        cache_time: {
          type: "integer",
          description:
            "Maximum time in seconds that the result may be cached on Telegram servers. Defaults to 300.",
        },
        is_personal: {
          type: "boolean",
          description:
            "Pass True if results may be cached on the server side only for the user that sent the query.",
        },
        next_offset: {
          type: "string",
          description:
            "Offset that a client should send in the next query to receive more results. Max 64 bytes.",
        },
        button: {
          type: "object",
          description:
            "An InlineQueryResultsButton object to be shown above inline query results.",
        },
      },
      required: ["inline_query_id", "results"],
    },
  },
  {
    name: "answerCallbackQuery",
    description:
      "Send answers to callback queries sent from inline keyboards. The answer is displayed as a notification at the top of the chat screen or as an alert. Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        callback_query_id: {
          type: "string",
          description: "Unique identifier for the query to be answered.",
        },
        text: {
          type: "string",
          description:
            "Text of the notification. If not specified, nothing will be shown to the user. 0-200 characters.",
        },
        show_alert: {
          type: "boolean",
          description:
            "If True, an alert will be shown by the client instead of a notification at the top of the chat screen. Defaults to false.",
        },
        url: {
          type: "string",
          description:
            "URL that will be opened by the user's client. For game URLs or t.me deep links.",
        },
        cache_time: {
          type: "integer",
          description:
            "Maximum time in seconds that the result of the callback query may be cached client-side. Defaults to 0.",
        },
      },
      required: ["callback_query_id"],
    },
  },
  {
    name: "answerWebAppQuery",
    description:
      "Set the result of an interaction with a Web App and send a corresponding message on behalf of the user to the chat from which the query originated. Returns a SentWebAppMessage object on success.",
    inputSchema: {
      type: "object",
      properties: {
        web_app_query_id: {
          type: "string",
          description: "Unique identifier for the query to be answered.",
        },
        result: {
          type: "object",
          description:
            "A JSON-serialized InlineQueryResult object describing the message to be sent.",
        },
      },
      required: ["web_app_query_id", "result"],
    },
  },
  {
    name: "savePreparedInlineMessage",
    description:
      "Store a message that can be sent by a user of a Mini App. Returns a PreparedInlineMessage object with a unique identifier and expiration date.",
    inputSchema: {
      type: "object",
      properties: {
        user_id: {
          type: "integer",
          description:
            "Unique identifier of the target user that can use the prepared message.",
        },
        result: {
          type: "object",
          description:
            "A JSON-serialized InlineQueryResult object describing the message to be sent.",
        },
        allow_user_chats: {
          type: "boolean",
          description:
            "Pass True if the message can be sent to private chats with users.",
        },
        allow_bot_chats: {
          type: "boolean",
          description:
            "Pass True if the message can be sent to private chats with bots.",
        },
        allow_group_chats: {
          type: "boolean",
          description:
            "Pass True if the message can be sent to group and supergroup chats.",
        },
        allow_channel_chats: {
          type: "boolean",
          description:
            "Pass True if the message can be sent to channel chats.",
        },
      },
      required: ["user_id", "result"],
    },
  },

  // ---------------------------------------------------------------------------
  // REACTIONS (1 method)
  // ---------------------------------------------------------------------------
  {
    name: "setMessageReaction",
    description:
      "Change the chosen reactions on a message. Service messages cannot be reacted to. Bots cannot use paid reactions. Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["integer", "string"],
          description:
            "Unique identifier for the target chat or username of the target channel (in the format @channelusername).",
        },
        message_id: {
          type: "integer",
          description:
            "Identifier of the target message. If the message belongs to a media group, the reaction is set to the first non-deleted message in the group instead.",
        },
        reaction: {
          type: "array",
          description:
            "A JSON-serialized list of ReactionType objects to set on the message. Currently, bots can set up to one reaction per message. Custom emoji reactions can be used if already present on the message or allowed by chat administrators.",
          items: { type: "object" },
        },
        is_big: {
          type: "boolean",
          description: "Pass True to set the reaction with a big animation.",
        },
      },
      required: ["chat_id", "message_id"],
    },
  },

  // ---------------------------------------------------------------------------
  // BOOSTS (2 methods)
  // ---------------------------------------------------------------------------
  {
    name: "getUserChatBoosts",
    description:
      "Get the list of boosts added to a chat by a user. Requires administrator rights in the chat. Returns a UserChatBoosts object on success.",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["integer", "string"],
          description:
            "Unique identifier for the chat or username of the channel (in the format @channelusername).",
        },
        user_id: {
          type: "integer",
          description: "Unique identifier of the target user.",
        },
      },
      required: ["chat_id", "user_id"],
    },
  },
  {
    name: "getBusinessConnection",
    description:
      "Get information about the connection of the bot with a business account. Returns a BusinessConnection object on success.",
    inputSchema: {
      type: "object",
      properties: {
        business_connection_id: {
          type: "string",
          description: "Unique identifier of the business connection.",
        },
      },
      required: ["business_connection_id"],
    },
  },
];

// =============================================================================
// TOOL HANDLER
// =============================================================================

export async function handleInlineTool(
  name: string,
  args: Record<string, unknown>
) {
  const response = await callTelegramAPI(name, args);
  return createToolResult(response);
}
