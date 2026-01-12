/**
 * Business, Stories & Suggested Posts Methods - Categories 10, 11, 12
 *
 * Business Methods (10):
 * - readBusinessMessage
 * - deleteBusinessMessages
 * - setBusinessAccountName
 * - setBusinessAccountUsername
 * - setBusinessAccountBio
 * - setBusinessAccountProfilePhoto
 * - removeBusinessAccountProfilePhoto
 * - setBusinessAccountGiftSettings
 * - getBusinessAccountStarBalance
 * - transferBusinessAccountStars
 *
 * Stories Methods (4):
 * - postStory
 * - editStory
 * - deleteStory
 * - repostStory
 *
 * Suggested Posts Methods (2):
 * - approveSuggestedPost
 * - declineSuggestedPost
 */

import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { callTelegramAPI, createToolResult } from "../telegram-api.js";

// =============================================================================
// TOOL DEFINITIONS
// =============================================================================

export const businessTools: Tool[] = [
  // ===========================================================================
  // BUSINESS METHODS (10)
  // ===========================================================================
  {
    name: "readBusinessMessage",
    description:
      "Marks incoming message as read on behalf of a business account. Requires the can_read_messages business bot right. Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        business_connection_id: {
          type: "string",
          description: "Unique identifier of the business connection",
        },
        chat_id: {
          type: "integer",
          description: "Unique identifier of the chat with the message",
        },
        message_id: {
          type: "integer",
          description: "Unique identifier of the message to mark as read",
        },
      },
      required: ["business_connection_id", "chat_id", "message_id"],
    },
  },
  {
    name: "deleteBusinessMessages",
    description:
      "Deletes messages on behalf of a business account. Requires can_delete_sent_messages for bot's own messages or can_delete_all_messages for any message. Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        business_connection_id: {
          type: "string",
          description: "Unique identifier of the business connection",
        },
        message_ids: {
          type: "array",
          items: { type: "integer" },
          description:
            "A list of 1-100 identifiers of messages to delete. All messages must be from the same chat.",
        },
      },
      required: ["business_connection_id", "message_ids"],
    },
  },
  {
    name: "setBusinessAccountName",
    description:
      "Changes the first and last name of a managed business account. Requires the can_change_name business bot right. Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        business_connection_id: {
          type: "string",
          description: "Unique identifier of the business connection",
        },
        first_name: {
          type: "string",
          description: "The new first name for the business account; 1-64 characters",
        },
        last_name: {
          type: "string",
          description:
            "The new last name for the business account; 0-64 characters",
        },
      },
      required: ["business_connection_id", "first_name"],
    },
  },
  {
    name: "setBusinessAccountUsername",
    description:
      "Changes the username of a managed business account. Requires the can_change_username business bot right. Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        business_connection_id: {
          type: "string",
          description: "Unique identifier of the business connection",
        },
        username: {
          type: "string",
          description:
            "The new username for the business account; 0-32 characters. Pass an empty string to remove the username.",
        },
      },
      required: ["business_connection_id"],
    },
  },
  {
    name: "setBusinessAccountBio",
    description:
      "Changes the bio of a managed business account. Requires the can_change_bio business bot right. Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        business_connection_id: {
          type: "string",
          description: "Unique identifier of the business connection",
        },
        bio: {
          type: "string",
          description:
            "The new bio for the business account; 0-140 characters. Pass an empty string to remove the bio.",
        },
      },
      required: ["business_connection_id"],
    },
  },
  {
    name: "setBusinessAccountProfilePhoto",
    description:
      "Changes the profile photo of a managed business account. Requires the can_edit_profile_photo business bot right. Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        business_connection_id: {
          type: "string",
          description: "Unique identifier of the business connection",
        },
        photo: {
          type: "object",
          description:
            "The new profile photo to set. Must be an InputProfilePhoto object.",
        },
        is_public: {
          type: "boolean",
          description:
            "Pass True to set the public photo, which will be visible even if the main photo is hidden by the business account's privacy settings.",
        },
      },
      required: ["business_connection_id", "photo"],
    },
  },
  {
    name: "removeBusinessAccountProfilePhoto",
    description:
      "Removes the current profile photo of a managed business account. Requires the can_edit_profile_photo business bot right. Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        business_connection_id: {
          type: "string",
          description: "Unique identifier of the business connection",
        },
        is_public: {
          type: "boolean",
          description:
            "Pass True to remove the public photo. The account will revert to using the private photo if available.",
        },
      },
      required: ["business_connection_id"],
    },
  },
  {
    name: "setBusinessAccountGiftSettings",
    description:
      "Changes the privacy settings for gifts in a managed business account. Requires the can_change_gift_settings business bot right. Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        business_connection_id: {
          type: "string",
          description: "Unique identifier of the business connection",
        },
        show_gift_button: {
          type: "boolean",
          description:
            "Pass True to show the gift button on the business account's profile; False to hide it.",
        },
        accepted_gift_types: {
          type: "object",
          description:
            "An AcceptedGiftTypes object describing the types of gifts that can be sent to the business account.",
        },
      },
      required: [
        "business_connection_id",
        "show_gift_button",
        "accepted_gift_types",
      ],
    },
  },
  {
    name: "getBusinessAccountStarBalance",
    description:
      "Returns the current Telegram Star balance of a managed business account. Requires the can_view_gifts_and_stars business bot right. Returns a StarAmount object on success.",
    inputSchema: {
      type: "object",
      properties: {
        business_connection_id: {
          type: "string",
          description: "Unique identifier of the business connection",
        },
      },
      required: ["business_connection_id"],
    },
  },
  {
    name: "transferBusinessAccountStars",
    description:
      "Transfers Telegram Stars from a managed business account to the bot's balance. The Stars can then be withdrawn by the bot. Requires the can_transfer_stars business bot right. Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        business_connection_id: {
          type: "string",
          description: "Unique identifier of the business connection",
        },
        star_count: {
          type: "integer",
          description:
            "Number of Telegram Stars to transfer; 1-10000",
        },
      },
      required: ["business_connection_id", "star_count"],
    },
  },

  // ===========================================================================
  // STORIES METHODS (4)
  // ===========================================================================
  {
    name: "postStory",
    description:
      "Posts a story on behalf of a managed business account. Requires the can_manage_stories business bot right. Returns a Story object on success.",
    inputSchema: {
      type: "object",
      properties: {
        business_connection_id: {
          type: "string",
          description: "Unique identifier of the business connection",
        },
        content: {
          type: "object",
          description:
            "Content of the story. Must be an InputStoryContent object (InputStoryContentPhoto or InputStoryContentVideo).",
        },
        active_period: {
          type: "integer",
          description:
            "Period in seconds during which the story will be visible; must be one of 21600 (6 hours), 43200 (12 hours), 86400 (24 hours), or 172800 (48 hours).",
        },
        caption: {
          type: "string",
          description: "Caption for the story; 0-2048 characters",
        },
        parse_mode: {
          type: "string",
          description:
            "Mode for parsing entities in the caption. See formatting options for more details.",
        },
        caption_entities: {
          type: "array",
          items: { type: "object" },
          description:
            "A list of special entities that appear in the caption, which can be specified instead of parse_mode.",
        },
        areas: {
          type: "array",
          items: { type: "object" },
          description:
            "A list of StoryArea objects to be shown on the story.",
        },
        post_to_chat_page: {
          type: "boolean",
          description:
            "Pass True to keep the story accessible after it expires.",
        },
        protect_content: {
          type: "boolean",
          description:
            "Pass True if the content of the story must be protected from forwarding and screenshotting.",
        },
      },
      required: ["business_connection_id", "content", "active_period"],
    },
  },
  {
    name: "editStory",
    description:
      "Edits a story previously posted by the bot on behalf of a managed business account. Requires the can_manage_stories business bot right. Returns a Story object on success.",
    inputSchema: {
      type: "object",
      properties: {
        business_connection_id: {
          type: "string",
          description: "Unique identifier of the business connection",
        },
        story_id: {
          type: "integer",
          description: "Unique identifier of the story to edit",
        },
        content: {
          type: "object",
          description:
            "New content of the story. Must be an InputStoryContent object.",
        },
        caption: {
          type: "string",
          description: "New caption for the story; 0-2048 characters",
        },
        parse_mode: {
          type: "string",
          description:
            "Mode for parsing entities in the caption.",
        },
        caption_entities: {
          type: "array",
          items: { type: "object" },
          description:
            "A list of special entities that appear in the caption.",
        },
        areas: {
          type: "array",
          items: { type: "object" },
          description:
            "A list of StoryArea objects to be shown on the story.",
        },
      },
      required: ["business_connection_id", "story_id", "content"],
    },
  },
  {
    name: "deleteStory",
    description:
      "Deletes a story previously posted by the bot on behalf of a managed business account. Requires the can_manage_stories business bot right. Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        business_connection_id: {
          type: "string",
          description: "Unique identifier of the business connection",
        },
        story_id: {
          type: "integer",
          description: "Unique identifier of the story to delete",
        },
      },
      required: ["business_connection_id", "story_id"],
    },
  },
  {
    name: "repostStory",
    description:
      "Reposts a story from one managed business account to another. Both accounts must be managed by the same bot. Requires the can_manage_stories business bot right for both accounts. Returns a Story object on success.",
    inputSchema: {
      type: "object",
      properties: {
        business_connection_id: {
          type: "string",
          description:
            "Unique identifier of the business connection on behalf of which to repost the story",
        },
        from_chat_id: {
          type: "integer",
          description:
            "Unique identifier of the chat from which the story was originally posted",
        },
        from_story_id: {
          type: "integer",
          description: "Unique identifier of the story to repost",
        },
        active_period: {
          type: "integer",
          description:
            "Period in seconds during which the reposted story will be visible; must be one of 21600 (6 hours), 43200 (12 hours), 86400 (24 hours), or 172800 (48 hours).",
        },
        post_to_chat_page: {
          type: "boolean",
          description:
            "Pass True to keep the reposted story accessible after it expires.",
        },
        protect_content: {
          type: "boolean",
          description:
            "Pass True if the content of the reposted story must be protected from forwarding and screenshotting.",
        },
      },
      required: [
        "business_connection_id",
        "from_chat_id",
        "from_story_id",
        "active_period",
      ],
    },
  },

  // ===========================================================================
  // SUGGESTED POSTS METHODS (2)
  // ===========================================================================
  {
    name: "approveSuggestedPost",
    description:
      "Approves a suggested post in a direct messages chat. The bot must have the can_post_messages administrator right in the corresponding channel chat. Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: "integer",
          description:
            "Unique identifier of the chat containing the suggested post",
        },
        message_id: {
          type: "integer",
          description: "Unique identifier of the suggested post message",
        },
        send_date: {
          type: "integer",
          description:
            "Unix timestamp specifying when the post should be published. If not specified, the post is published immediately. Must be no more than 2678400 seconds (30 days) in the future.",
        },
      },
      required: ["chat_id", "message_id"],
    },
  },
  {
    name: "declineSuggestedPost",
    description:
      "Declines a suggested post in a direct messages chat. Requires the can_manage_direct_messages administrator right in the corresponding channel. Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: "integer",
          description:
            "Unique identifier of the chat containing the suggested post",
        },
        message_id: {
          type: "integer",
          description: "Unique identifier of the suggested post message",
        },
        comment: {
          type: "string",
          description:
            "A comment explaining why the post was declined; 0-128 characters",
        },
      },
      required: ["chat_id", "message_id"],
    },
  },
];

// =============================================================================
// TOOL HANDLER
// =============================================================================

export async function handleBusinessTool(
  name: string,
  args: Record<string, unknown>
) {
  const response = await callTelegramAPI(name, args);
  return createToolResult(response);
}
