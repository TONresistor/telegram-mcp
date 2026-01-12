/**
 * Updating Messages - Category 4
 *
 * Methods:
 * - editMessageText
 * - editMessageCaption
 * - editMessageMedia
 * - editMessageLiveLocation
 * - stopMessageLiveLocation
 * - editMessageReplyMarkup
 * - stopPoll
 * - deleteMessage
 * - deleteMessages
 */

import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { callTelegramAPI, createToolResult } from "../telegram-api.js";

// =============================================================================
// TOOL DEFINITIONS
// =============================================================================

export const editingTools: Tool[] = [
  {
    name: "editMessageText",
    description:
      "Edit text and game messages. Returns the edited Message on success, or True if the message is an inline message.",
    inputSchema: {
      type: "object",
      properties: {
        business_connection_id: {
          type: "string",
          description:
            "Unique identifier of the business connection on behalf of which the message to be edited was sent.",
        },
        chat_id: {
          type: ["integer", "string"],
          description:
            "Required if inline_message_id is not specified. Unique identifier for the target chat or username of the target channel (in the format @channelusername).",
        },
        message_id: {
          type: "integer",
          description:
            "Required if inline_message_id is not specified. Identifier of the message to edit.",
        },
        inline_message_id: {
          type: "string",
          description:
            "Required if chat_id and message_id are not specified. Identifier of the inline message.",
        },
        text: {
          type: "string",
          description:
            "New text of the message, 1-4096 characters after entities parsing.",
        },
        parse_mode: {
          type: "string",
          description:
            "Mode for parsing entities in the message text. See formatting options for more details.",
          enum: ["Markdown", "MarkdownV2", "HTML"],
        },
        entities: {
          type: "array",
          items: { type: "object" },
          description:
            "A JSON-serialized list of special entities that appear in message text, which can be specified instead of parse_mode.",
        },
        link_preview_options: {
          type: "object",
          description: "Link preview generation options for the message.",
          properties: {
            is_disabled: {
              type: "boolean",
              description: "True, if the link preview is disabled.",
            },
            url: {
              type: "string",
              description:
                "URL to use for the link preview. If empty, then the first URL found in the message text will be used.",
            },
            prefer_small_media: {
              type: "boolean",
              description:
                "True, if the media in the link preview is supposed to be shrunk.",
            },
            prefer_large_media: {
              type: "boolean",
              description:
                "True, if the media in the link preview is supposed to be enlarged.",
            },
            show_above_text: {
              type: "boolean",
              description:
                "True, if the link preview must be shown above the message text.",
            },
          },
        },
        reply_markup: {
          type: "object",
          description: "A JSON-serialized object for an inline keyboard.",
        },
      },
      required: ["text"],
    },
  },
  {
    name: "editMessageCaption",
    description:
      "Edit captions of messages. Returns the edited Message on success, or True if the message is an inline message.",
    inputSchema: {
      type: "object",
      properties: {
        business_connection_id: {
          type: "string",
          description:
            "Unique identifier of the business connection on behalf of which the message to be edited was sent.",
        },
        chat_id: {
          type: ["integer", "string"],
          description:
            "Required if inline_message_id is not specified. Unique identifier for the target chat or username of the target channel (in the format @channelusername).",
        },
        message_id: {
          type: "integer",
          description:
            "Required if inline_message_id is not specified. Identifier of the message to edit.",
        },
        inline_message_id: {
          type: "string",
          description:
            "Required if chat_id and message_id are not specified. Identifier of the inline message.",
        },
        caption: {
          type: "string",
          description:
            "New caption of the message, 0-1024 characters after entities parsing.",
        },
        parse_mode: {
          type: "string",
          description:
            "Mode for parsing entities in the message caption. See formatting options for more details.",
          enum: ["Markdown", "MarkdownV2", "HTML"],
        },
        caption_entities: {
          type: "array",
          items: { type: "object" },
          description:
            "A JSON-serialized list of special entities that appear in the caption, which can be specified instead of parse_mode.",
        },
        show_caption_above_media: {
          type: "boolean",
          description:
            "Pass True if the caption must be shown above the message media. Supported only for animation, photo and video messages.",
        },
        reply_markup: {
          type: "object",
          description: "A JSON-serialized object for an inline keyboard.",
        },
      },
      required: [],
    },
  },
  {
    name: "editMessageMedia",
    description:
      "Edit animation, audio, document, photo, or video messages, or add media to text messages. If a message is part of a message album, then it can only be edited to an audio for audio albums, only to a document for document albums and to a photo or a video otherwise. Returns the edited Message on success, or True if the message is an inline message.",
    inputSchema: {
      type: "object",
      properties: {
        business_connection_id: {
          type: "string",
          description:
            "Unique identifier of the business connection on behalf of which the message to be edited was sent.",
        },
        chat_id: {
          type: ["integer", "string"],
          description:
            "Required if inline_message_id is not specified. Unique identifier for the target chat or username of the target channel (in the format @channelusername).",
        },
        message_id: {
          type: "integer",
          description:
            "Required if inline_message_id is not specified. Identifier of the message to edit.",
        },
        inline_message_id: {
          type: "string",
          description:
            "Required if chat_id and message_id are not specified. Identifier of the inline message.",
        },
        media: {
          type: "object",
          description:
            "A JSON-serialized object for a new media content of the message. Supported types: InputMediaAnimation, InputMediaAudio, InputMediaDocument, InputMediaPhoto, InputMediaVideo.",
          properties: {
            type: {
              type: "string",
              description:
                "Type of the media. Must be animation, audio, document, photo, or video.",
              enum: ["animation", "audio", "document", "photo", "video"],
            },
            media: {
              type: "string",
              description:
                "File to send. Pass a file_id to send a file that exists on the Telegram servers, pass an HTTP URL for Telegram to get a file from the Internet, or pass attach://<file_attach_name> to upload a new one.",
            },
            caption: {
              type: "string",
              description: "Caption of the media to be sent, 0-1024 characters after entities parsing.",
            },
            parse_mode: {
              type: "string",
              description: "Mode for parsing entities in the media caption.",
            },
          },
          required: ["type", "media"],
        },
        reply_markup: {
          type: "object",
          description: "A JSON-serialized object for an inline keyboard.",
        },
      },
      required: ["media"],
    },
  },
  {
    name: "editMessageLiveLocation",
    description:
      "Edit live location messages. A location can be edited until its live_period expires or editing is explicitly disabled by a call to stopMessageLiveLocation. Returns the edited Message on success, or True if the message is an inline message.",
    inputSchema: {
      type: "object",
      properties: {
        business_connection_id: {
          type: "string",
          description:
            "Unique identifier of the business connection on behalf of which the message to be edited was sent.",
        },
        chat_id: {
          type: ["integer", "string"],
          description:
            "Required if inline_message_id is not specified. Unique identifier for the target chat or username of the target channel (in the format @channelusername).",
        },
        message_id: {
          type: "integer",
          description:
            "Required if inline_message_id is not specified. Identifier of the message to edit.",
        },
        inline_message_id: {
          type: "string",
          description:
            "Required if chat_id and message_id are not specified. Identifier of the inline message.",
        },
        latitude: {
          type: "number",
          description: "Latitude of new location.",
        },
        longitude: {
          type: "number",
          description: "Longitude of new location.",
        },
        live_period: {
          type: "integer",
          description:
            "New period in seconds during which the location can be updated, starting from the message send date. If 0x7FFFFFFF is specified, then the location can be updated forever. Otherwise, the new value must not exceed the current live_period by more than a day, and the live location expiration date must remain within the next 90 days. If not specified, then live_period remains unchanged.",
        },
        horizontal_accuracy: {
          type: "number",
          description:
            "The radius of uncertainty for the location, measured in meters; 0-1500.",
          minimum: 0,
          maximum: 1500,
        },
        heading: {
          type: "integer",
          description:
            "Direction in which the user is moving, in degrees. Must be between 1 and 360 if specified.",
          minimum: 1,
          maximum: 360,
        },
        proximity_alert_radius: {
          type: "integer",
          description:
            "Maximum distance for proximity alerts about approaching another chat member, in meters. Must be between 1 and 100000 if specified.",
          minimum: 1,
          maximum: 100000,
        },
        reply_markup: {
          type: "object",
          description: "A JSON-serialized object for an inline keyboard.",
        },
      },
      required: ["latitude", "longitude"],
    },
  },
  {
    name: "stopMessageLiveLocation",
    description:
      "Stop updating a live location message before live_period expires. Returns the edited Message on success, or True if the message is an inline message.",
    inputSchema: {
      type: "object",
      properties: {
        business_connection_id: {
          type: "string",
          description:
            "Unique identifier of the business connection on behalf of which the message was sent.",
        },
        chat_id: {
          type: ["integer", "string"],
          description:
            "Required if inline_message_id is not specified. Unique identifier for the target chat or username of the target channel (in the format @channelusername).",
        },
        message_id: {
          type: "integer",
          description:
            "Required if inline_message_id is not specified. Identifier of the message with live location to stop.",
        },
        inline_message_id: {
          type: "string",
          description:
            "Required if chat_id and message_id are not specified. Identifier of the inline message.",
        },
        reply_markup: {
          type: "object",
          description: "A JSON-serialized object for an inline keyboard.",
        },
      },
      required: [],
    },
  },
  {
    name: "editMessageReplyMarkup",
    description:
      "Edit only the reply markup of messages. Returns the edited Message on success, or True if the message is an inline message.",
    inputSchema: {
      type: "object",
      properties: {
        business_connection_id: {
          type: "string",
          description:
            "Unique identifier of the business connection on behalf of which the message to be edited was sent.",
        },
        chat_id: {
          type: ["integer", "string"],
          description:
            "Required if inline_message_id is not specified. Unique identifier for the target chat or username of the target channel (in the format @channelusername).",
        },
        message_id: {
          type: "integer",
          description:
            "Required if inline_message_id is not specified. Identifier of the message to edit.",
        },
        inline_message_id: {
          type: "string",
          description:
            "Required if chat_id and message_id are not specified. Identifier of the inline message.",
        },
        reply_markup: {
          type: "object",
          description: "A JSON-serialized object for an inline keyboard.",
        },
      },
      required: [],
    },
  },
  {
    name: "stopPoll",
    description:
      "Stop a poll which was sent by the bot. Returns the stopped Poll on success.",
    inputSchema: {
      type: "object",
      properties: {
        business_connection_id: {
          type: "string",
          description:
            "Unique identifier of the business connection on behalf of which the message to be edited was sent.",
        },
        chat_id: {
          type: ["integer", "string"],
          description:
            "Unique identifier for the target chat or username of the target channel (in the format @channelusername).",
        },
        message_id: {
          type: "integer",
          description: "Identifier of the original message with the poll.",
        },
        reply_markup: {
          type: "object",
          description:
            "A JSON-serialized object for a new message inline keyboard.",
        },
      },
      required: ["chat_id", "message_id"],
    },
  },
  {
    name: "deleteMessage",
    description:
      "Delete a message, including service messages, with the following limitations: A message can only be deleted if it was sent less than 48 hours ago. Service messages about a supergroup, channel, or forum topic creation can't be deleted. A dice message in a private chat can only be deleted if it was sent more than 24 hours ago. Bots can delete outgoing messages in private chats, groups, and supergroups. Bots can delete incoming messages in private chats. Bots granted can_post_messages permissions can delete outgoing messages in channels. If the bot is an administrator of a group, it can delete any message there. If the bot has can_delete_messages permission in a supergroup or a channel, it can delete any message there. Returns True on success.",
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
          description: "Identifier of the message to delete.",
        },
      },
      required: ["chat_id", "message_id"],
    },
  },
  {
    name: "deleteMessages",
    description:
      "Delete multiple messages simultaneously. If some of the specified messages can't be found, they are skipped. Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["integer", "string"],
          description:
            "Unique identifier for the target chat or username of the target channel (in the format @channelusername).",
        },
        message_ids: {
          type: "array",
          items: { type: "integer" },
          description:
            "A JSON-serialized list of 1-100 identifiers of messages to delete. See deleteMessage for limitations on which messages can be deleted.",
          minItems: 1,
          maxItems: 100,
        },
      },
      required: ["chat_id", "message_ids"],
    },
  },
];

// =============================================================================
// TOOL HANDLER
// =============================================================================

export async function handleEditingTool(
  name: string,
  args: Record<string, unknown>
) {
  const response = await callTelegramAPI(name, args);
  return createToolResult(response);
}
