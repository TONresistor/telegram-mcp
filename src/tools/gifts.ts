/**
 * Gifts - Category 9
 *
 * Methods:
 * - getAvailableGifts
 * - sendGift
 * - giftPremiumSubscription
 * - getBusinessAccountGifts
 * - getUserGifts
 * - getChatGifts
 * - convertGiftToStars
 * - upgradeGift
 * - transferGift
 */

import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { callTelegramAPI, createToolResult } from "../telegram-api.js";

// =============================================================================
// TOOL DEFINITIONS
// =============================================================================

export const giftTools: Tool[] = [
  {
    name: "getAvailableGifts",
    description:
      "Returns the list of gifts that can be sent by the bot to users and channel chats. Returns a Gifts object.",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "sendGift",
    description:
      "Sends a gift to the given user or channel chat. The gift cannot be converted to Telegram Stars by the receiver. Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        user_id: {
          type: "integer",
          description:
            "Unique identifier of the target user who will receive the gift. Required if chat_id is not specified.",
        },
        chat_id: {
          type: ["integer", "string"],
          description:
            "Unique identifier for the target chat or username of the channel (format: @channelusername). Required if user_id is not specified.",
        },
        gift_id: {
          type: "string",
          description:
            "Identifier of the gift to send. Limited gifts cannot be sent to channel chats.",
        },
        pay_for_upgrade: {
          type: "boolean",
          description:
            "Pass True to pay for the gift upgrade from the bot's balance.",
        },
        text: {
          type: "string",
          description: "Text that will be shown along with the gift; 0-128 characters.",
        },
        text_parse_mode: {
          type: "string",
          description:
            "Mode for parsing entities in the text. See formatting options for more details.",
        },
        text_entities: {
          type: "array",
          items: { type: "object" },
          description:
            "List of special entities that appear in the gift text. Can be specified instead of text_parse_mode.",
        },
      },
      required: ["gift_id"],
    },
  },
  {
    name: "giftPremiumSubscription",
    description:
      "Gifts a Telegram Premium subscription to the given user. Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        user_id: {
          type: "integer",
          description: "Unique identifier of the target user that will receive the gift.",
        },
        month_count: {
          type: "integer",
          description:
            "Number of months the Telegram Premium subscription will be active; must be 3, 6, or 12.",
          enum: [3, 6, 12],
        },
        star_count: {
          type: "integer",
          description:
            "Number of Telegram Stars to pay for the subscription; must be 1000 for 3 months, 1500 for 6 months, or 2500 for 12 months.",
          enum: [1000, 1500, 2500],
        },
        text: {
          type: "string",
          description:
            "Text that will be shown along with the service message about the subscription; 0-128 characters.",
        },
        text_parse_mode: {
          type: "string",
          description: "Mode for parsing entities in the text.",
        },
        text_entities: {
          type: "array",
          items: { type: "object" },
          description:
            "List of special entities that appear in the gift text. Can be specified instead of text_parse_mode.",
        },
      },
      required: ["user_id", "month_count", "star_count"],
    },
  },
  {
    name: "getBusinessAccountGifts",
    description:
      "Returns the gifts received and owned by a managed business account. Requires the can_view_gifts_and_stars business bot right. Returns an OwnedGifts object on success.",
    inputSchema: {
      type: "object",
      properties: {
        business_connection_id: {
          type: "string",
          description: "Unique identifier of the business connection.",
        },
        exclude_unsaved: {
          type: "boolean",
          description: "Pass True to exclude gifts that are not saved to the account's profile page.",
        },
        exclude_saved: {
          type: "boolean",
          description: "Pass True to exclude gifts that are saved to the account's profile page.",
        },
        exclude_unlimited: {
          type: "boolean",
          description: "Pass True to exclude gifts that can be purchased unlimited number of times.",
        },
        exclude_limited_upgradable: {
          type: "boolean",
          description: "Pass True to exclude limited gifts that can be upgraded.",
        },
        exclude_limited_non_upgradable: {
          type: "boolean",
          description: "Pass True to exclude limited gifts that cannot be upgraded.",
        },
        exclude_unique: {
          type: "boolean",
          description: "Pass True to exclude unique gifts.",
        },
        exclude_from_blockchain: {
          type: "boolean",
          description: "Pass True to exclude gifts transferred from the TON blockchain.",
        },
        sort_by_price: {
          type: "boolean",
          description:
            "Pass True to sort results by gift price instead of send date. Sorting is applied before pagination.",
        },
        offset: {
          type: "string",
          description: "Offset of the first entry to return as received from the previous request.",
        },
        limit: {
          type: "integer",
          description: "Maximum number of gifts to be returned; 1-100. Defaults to 100.",
          minimum: 1,
          maximum: 100,
        },
      },
      required: ["business_connection_id"],
    },
  },
  {
    name: "getUserGifts",
    description:
      "Returns the gifts received and owned by a given user. Returns an OwnedGifts object on success.",
    inputSchema: {
      type: "object",
      properties: {
        user_id: {
          type: "integer",
          description: "Unique identifier of the target user.",
        },
        exclude_unlimited: {
          type: "boolean",
          description: "Pass True to exclude gifts that can be purchased unlimited number of times.",
        },
        exclude_limited_upgradable: {
          type: "boolean",
          description: "Pass True to exclude limited gifts that can be upgraded.",
        },
        exclude_limited_non_upgradable: {
          type: "boolean",
          description: "Pass True to exclude limited gifts that cannot be upgraded.",
        },
        exclude_unique: {
          type: "boolean",
          description: "Pass True to exclude unique gifts.",
        },
        exclude_from_blockchain: {
          type: "boolean",
          description: "Pass True to exclude gifts transferred from the TON blockchain.",
        },
        sort_by_price: {
          type: "boolean",
          description:
            "Pass True to sort results by gift price instead of send date. Sorting is applied before pagination.",
        },
        offset: {
          type: "string",
          description: "Offset of the first entry to return as received from the previous request.",
        },
        limit: {
          type: "integer",
          description: "Maximum number of gifts to be returned; 1-100. Defaults to 100.",
          minimum: 1,
          maximum: 100,
        },
      },
      required: ["user_id"],
    },
  },
  {
    name: "getChatGifts",
    description:
      "Returns the gifts received and owned by a chat. Returns an OwnedGifts object on success.",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["integer", "string"],
          description:
            "Unique identifier for the target chat or username of the target channel (format: @channelusername).",
        },
        exclude_unsaved: {
          type: "boolean",
          description: "Pass True to exclude gifts that are not saved to the chat's profile page.",
        },
        exclude_saved: {
          type: "boolean",
          description: "Pass True to exclude gifts that are saved to the chat's profile page.",
        },
        exclude_unlimited: {
          type: "boolean",
          description: "Pass True to exclude gifts that can be purchased unlimited number of times.",
        },
        exclude_limited_upgradable: {
          type: "boolean",
          description: "Pass True to exclude limited gifts that can be upgraded.",
        },
        exclude_limited_non_upgradable: {
          type: "boolean",
          description: "Pass True to exclude limited gifts that cannot be upgraded.",
        },
        exclude_unique: {
          type: "boolean",
          description: "Pass True to exclude unique gifts.",
        },
        exclude_from_blockchain: {
          type: "boolean",
          description: "Pass True to exclude gifts transferred from the TON blockchain.",
        },
        sort_by_price: {
          type: "boolean",
          description:
            "Pass True to sort results by gift price instead of send date. Sorting is applied before pagination.",
        },
        offset: {
          type: "string",
          description: "Offset of the first entry to return as received from the previous request.",
        },
        limit: {
          type: "integer",
          description: "Maximum number of gifts to be returned; 1-100. Defaults to 100.",
          minimum: 1,
          maximum: 100,
        },
      },
      required: ["chat_id"],
    },
  },
  {
    name: "convertGiftToStars",
    description:
      "Converts a given regular gift to Telegram Stars. Requires the can_convert_gifts_to_stars business bot right. Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        business_connection_id: {
          type: "string",
          description:
            "Unique identifier of the business connection on behalf of which the gift will be converted.",
        },
        owned_gift_id: {
          type: "string",
          description: "Unique identifier of the regular gift that should be converted to Telegram Stars.",
        },
      },
      required: ["business_connection_id", "owned_gift_id"],
    },
  },
  {
    name: "upgradeGift",
    description:
      "Upgrades a given regular gift to a unique gift. Requires the can_transfer_and_upgrade_gifts business bot right. Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        business_connection_id: {
          type: "string",
          description:
            "Unique identifier of the business connection on behalf of which the gift will be upgraded.",
        },
        owned_gift_id: {
          type: "string",
          description: "Unique identifier of the regular gift that should be upgraded to a unique one.",
        },
        keep_original_details: {
          type: "boolean",
          description:
            "Pass True to keep the original gift text, sender, and receiver in the upgraded gift.",
        },
        star_count: {
          type: "integer",
          description:
            "Amount of Telegram Stars that will be paid for the upgrade from the business account balance. If the gift cannot be upgraded directly, the upgrade will be performed as a transfer to the current user with an optional payment for the transfer.",
        },
      },
      required: ["business_connection_id", "owned_gift_id"],
    },
  },
  {
    name: "transferGift",
    description:
      "Transfers an owned unique gift to another user. Requires the can_transfer_and_upgrade_gifts business bot right. Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        business_connection_id: {
          type: "string",
          description:
            "Unique identifier of the business connection on behalf of which the gift will be transferred.",
        },
        owned_gift_id: {
          type: "string",
          description: "Unique identifier of the gift that should be transferred.",
        },
        new_owner_chat_id: {
          type: "integer",
          description: "Unique identifier of the chat which will own the gift.",
        },
        star_count: {
          type: "integer",
          description:
            "Amount of Telegram Stars that will be paid for the transfer from the business account balance. If positive, the gift transfer is a paid operation and the gift cannot be sold. If the gift was paid for, then same amount must be paid for the transfer, otherwise the request will fail with a BAD_REQUEST error.",
        },
      },
      required: ["business_connection_id", "owned_gift_id", "new_owner_chat_id"],
    },
  },
];

// =============================================================================
// TOOL HANDLER
// =============================================================================

export async function handleGiftTool(
  name: string,
  args: Record<string, unknown>
) {
  const response = await callTelegramAPI(name, args);
  return createToolResult(response);
}
