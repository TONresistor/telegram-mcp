/**
 * Stickers - Category 3
 *
 * Methods:
 * - sendSticker
 * - getStickerSet
 * - getCustomEmojiStickers
 * - uploadStickerFile
 * - createNewStickerSet
 * - addStickerToSet
 * - setStickerPositionInSet
 * - deleteStickerFromSet
 * - replaceStickerInSet
 * - setStickerEmojiList
 * - setStickerKeywords
 * - setStickerMaskPosition
 * - setStickerSetTitle
 * - setStickerSetThumbnail
 * - setCustomEmojiStickerSetThumbnail
 * - deleteStickerSet
 */

import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { callTelegramAPI, createToolResult } from "../telegram-api.js";

// =============================================================================
// TOOL DEFINITIONS
// =============================================================================

export const stickerTools: Tool[] = [
  {
    name: "sendSticker",
    description:
      "Send static .WEBP, animated .TGS, or video .WEBM stickers. Returns the sent Message on success.",
    inputSchema: {
      type: "object",
      properties: {
        business_connection_id: {
          type: "string",
          description:
            "Unique identifier of the business connection on behalf of which the message will be sent.",
        },
        chat_id: {
          type: ["integer", "string"],
          description:
            "Unique identifier for the target chat or username of the target channel (in the format @channelusername).",
        },
        message_thread_id: {
          type: "integer",
          description:
            "Unique identifier for the target message thread (topic) of the forum; for forum supergroups only.",
        },
        direct_messages_topic_id: {
          type: "integer",
          description:
            "Unique identifier for the target Direct Messages topic; for bots only.",
        },
        sticker: {
          type: "string",
          description:
            "Sticker to send. Pass a file_id as String to send a file that exists on the Telegram servers, pass an HTTP URL as a String for Telegram to get a .WEBP sticker from the Internet, or upload a new .WEBP, .TGS, or .WEBM sticker.",
        },
        emoji: {
          type: "string",
          description:
            "Emoji associated with the sticker; only for just uploaded stickers.",
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
          description:
            "Description of the message to reply to. Object with message_id and optionally chat_id, allow_sending_without_reply, quote, quote_parse_mode, quote_entities, quote_position.",
        },
        reply_markup: {
          type: "object",
          description:
            "Additional interface options. A JSON-serialized object for an inline keyboard, custom reply keyboard, instructions to remove a reply keyboard or to force a reply from the user.",
        },
      },
      required: ["chat_id", "sticker"],
    },
  },
  {
    name: "getStickerSet",
    description:
      "Get a sticker set by name. Returns a StickerSet object on success.",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Name of the sticker set.",
        },
      },
      required: ["name"],
    },
  },
  {
    name: "getCustomEmojiStickers",
    description:
      "Get information about custom emoji stickers by their identifiers. Returns an Array of Sticker objects.",
    inputSchema: {
      type: "object",
      properties: {
        custom_emoji_ids: {
          type: "array",
          items: { type: "string" },
          description:
            "A list of custom emoji identifiers. At most 200 custom emoji identifiers can be specified.",
        },
      },
      required: ["custom_emoji_ids"],
    },
  },
  {
    name: "uploadStickerFile",
    description:
      "Upload a file with a sticker for later use in the createNewStickerSet, addStickerToSet, or replaceStickerInSet methods. Returns the uploaded File on success.",
    inputSchema: {
      type: "object",
      properties: {
        user_id: {
          type: "integer",
          description: "User identifier of sticker file owner.",
        },
        sticker: {
          type: "string",
          description:
            "A file with the sticker in .WEBP, .PNG, .TGS, or .WEBM format. See https://core.telegram.org/stickers for technical requirements.",
        },
        sticker_format: {
          type: "string",
          enum: ["static", "animated", "video"],
          description:
            'Format of the sticker: "static" for .WEBP or .PNG, "animated" for .TGS, "video" for .WEBM.',
        },
      },
      required: ["user_id", "sticker", "sticker_format"],
    },
  },
  {
    name: "createNewStickerSet",
    description:
      "Create a new sticker set owned by a user. The bot will be able to edit the sticker set. Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        user_id: {
          type: "integer",
          description: "User identifier of created sticker set owner.",
        },
        name: {
          type: "string",
          description:
            "Short name of sticker set, to be used in t.me/addstickers/ URLs (e.g., animals). Can contain only English letters, digits and underscores. Must begin with a letter, can't contain consecutive underscores and must end in '_by_<bot_username>'. <bot_username> is case insensitive. 1-64 characters.",
        },
        title: {
          type: "string",
          description: "Sticker set title, 1-64 characters.",
        },
        stickers: {
          type: "array",
          items: { type: "object" },
          description:
            "A list of 1-50 initial stickers to be added to the sticker set. Each object is an InputSticker with sticker, format, emoji_list, mask_position (optional), and keywords (optional).",
        },
        sticker_type: {
          type: "string",
          enum: ["regular", "mask", "custom_emoji"],
          description:
            'Type of stickers in the set: "regular", "mask", or "custom_emoji". By default, a regular sticker set is created.',
        },
        needs_repainting: {
          type: "boolean",
          description:
            "Pass True if stickers in the sticker set must be repainted to the color of text when used in messages, the accent color if used as emoji status, white on chat photos, or another appropriate color based on context. For custom emoji sticker sets only.",
        },
      },
      required: ["user_id", "name", "title", "stickers"],
    },
  },
  {
    name: "addStickerToSet",
    description:
      "Add a new sticker to a set created by the bot. Emoji sticker sets can have up to 200 stickers. Other sticker sets can have up to 120 stickers. Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        user_id: {
          type: "integer",
          description: "User identifier of sticker set owner.",
        },
        name: {
          type: "string",
          description: "Sticker set name.",
        },
        sticker: {
          type: "object",
          description:
            "An InputSticker object with information about the sticker to be added. Must include sticker, format, emoji_list, and optionally mask_position and keywords.",
        },
      },
      required: ["user_id", "name", "sticker"],
    },
  },
  {
    name: "setStickerPositionInSet",
    description:
      "Move a sticker in a set created by the bot to a specific position. Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        sticker: {
          type: "string",
          description: "File identifier of the sticker.",
        },
        position: {
          type: "integer",
          description: "New sticker position in the set, zero-based.",
          minimum: 0,
        },
      },
      required: ["sticker", "position"],
    },
  },
  {
    name: "deleteStickerFromSet",
    description:
      "Delete a sticker from a set created by the bot. Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        sticker: {
          type: "string",
          description: "File identifier of the sticker.",
        },
      },
      required: ["sticker"],
    },
  },
  {
    name: "replaceStickerInSet",
    description:
      "Replace an existing sticker in a sticker set with a new one. The method is equivalent to calling deleteStickerFromSet, then addStickerToSet, then setStickerPositionInSet. Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        user_id: {
          type: "integer",
          description: "User identifier of the sticker set owner.",
        },
        name: {
          type: "string",
          description: "Sticker set name.",
        },
        old_sticker: {
          type: "string",
          description: "File identifier of the replaced sticker.",
        },
        sticker: {
          type: "object",
          description:
            "An InputSticker object with information about the new sticker. Must include sticker, format, emoji_list, and optionally mask_position and keywords.",
        },
      },
      required: ["user_id", "name", "old_sticker", "sticker"],
    },
  },
  {
    name: "setStickerEmojiList",
    description:
      "Change the list of emoji assigned to a regular or custom emoji sticker. The sticker must belong to a sticker set created by the bot. Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        sticker: {
          type: "string",
          description: "File identifier of the sticker.",
        },
        emoji_list: {
          type: "array",
          items: { type: "string" },
          description: "A list of 1-20 emoji associated with the sticker.",
        },
      },
      required: ["sticker", "emoji_list"],
    },
  },
  {
    name: "setStickerKeywords",
    description:
      "Change search keywords assigned to a regular or custom emoji sticker. The sticker must belong to a sticker set created by the bot. Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        sticker: {
          type: "string",
          description: "File identifier of the sticker.",
        },
        keywords: {
          type: "array",
          items: { type: "string" },
          description:
            "A list of 0-20 search keywords for the sticker with total length of up to 64 characters.",
        },
      },
      required: ["sticker"],
    },
  },
  {
    name: "setStickerMaskPosition",
    description:
      "Change the mask position of a mask sticker. The sticker must belong to a sticker set that was created by the bot. Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        sticker: {
          type: "string",
          description: "File identifier of the sticker.",
        },
        mask_position: {
          type: "object",
          description:
            'A MaskPosition object with the position where the mask should be placed on faces. Contains: point ("forehead", "eyes", "mouth", or "chin"), x_shift, y_shift, scale. Omit the parameter to remove the mask position.',
        },
      },
      required: ["sticker"],
    },
  },
  {
    name: "setStickerSetTitle",
    description:
      "Set the title of a created sticker set. Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Sticker set name.",
        },
        title: {
          type: "string",
          description: "Sticker set title, 1-64 characters.",
        },
      },
      required: ["name", "title"],
    },
  },
  {
    name: "setStickerSetThumbnail",
    description:
      "Set the thumbnail of a regular or mask sticker set. The format of the thumbnail file must match the format of the stickers in the set. Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Sticker set name.",
        },
        user_id: {
          type: "integer",
          description: "User identifier of the sticker set owner.",
        },
        thumbnail: {
          type: "string",
          description:
            "A .WEBP or .PNG image with the thumbnail, must be up to 128 kilobytes in size and have a width and height of exactly 100px, or a .TGS animation with a thumbnail up to 32 kilobytes in size, or a .WEBM video with the thumbnail up to 32 kilobytes in size. Pass a file_id, HTTP URL, or upload a new file. Animated and video sticker set thumbnails can't be uploaded via HTTP URL. If omitted, then the thumbnail is dropped and the first sticker is used as the thumbnail.",
        },
        format: {
          type: "string",
          enum: ["static", "animated", "video"],
          description:
            'Format of the thumbnail: "static" for .WEBP or .PNG, "animated" for .TGS, "video" for .WEBM.',
        },
      },
      required: ["name", "user_id", "format"],
    },
  },
  {
    name: "setCustomEmojiStickerSetThumbnail",
    description:
      "Set the thumbnail of a custom emoji sticker set. Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Sticker set name.",
        },
        custom_emoji_id: {
          type: "string",
          description:
            "Custom emoji identifier of a sticker from the sticker set; pass an empty string to drop the thumbnail and use the first sticker as the thumbnail.",
        },
      },
      required: ["name"],
    },
  },
  {
    name: "deleteStickerSet",
    description:
      "Delete a sticker set that was created by the bot. Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Sticker set name.",
        },
      },
      required: ["name"],
    },
  },
];

// =============================================================================
// TOOL HANDLER
// =============================================================================

export async function handleStickerTool(
  name: string,
  args: Record<string, unknown>
) {
  const response = await callTelegramAPI(name, args);
  return createToolResult(response);
}
