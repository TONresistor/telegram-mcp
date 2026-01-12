/**
 * Forum/Topics Methods - Category: Forum
 *
 * Methods:
 * - getForumTopicIconStickers
 * - createForumTopic
 * - editForumTopic
 * - closeForumTopic
 * - reopenForumTopic
 * - deleteForumTopic
 * - unpinAllForumTopicMessages
 * - editGeneralForumTopic
 * - closeGeneralForumTopic
 * - reopenGeneralForumTopic
 * - hideGeneralForumTopic
 * - unhideGeneralForumTopic
 * - unpinAllGeneralForumTopicMessages
 */

import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { callTelegramAPI, createToolResult } from "../telegram-api.js";

// =============================================================================
// TOOL DEFINITIONS
// =============================================================================

export const forumTools: Tool[] = [
  {
    name: "getForumTopicIconStickers",
    description:
      "Get custom emoji stickers that can be used as forum topic icons by any user. Returns an Array of Sticker objects.",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "createForumTopic",
    description:
      "Create a topic in a forum supergroup chat. The bot must be an administrator with can_manage_topics rights. Returns ForumTopic object.",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["integer", "string"],
          description:
            "Unique identifier for the target supergroup or username (in the format @supergroupusername)",
        },
        name: {
          type: "string",
          description: "Topic name, 1-128 characters",
        },
        icon_color: {
          type: "integer",
          description:
            "Color of the topic icon in RGB format. Currently, must be one of 7322096 (0x6FB9F0), 16766590 (0xFFD67E), 13338331 (0xCB86DB), 9367192 (0x8EEE98), 16749490 (0xFF93B2), or 16478047 (0xFB6F5F)",
        },
        icon_custom_emoji_id: {
          type: "string",
          description:
            "Unique identifier of the custom emoji shown as the topic icon. Use getForumTopicIconStickers to get all allowed custom emoji identifiers",
        },
      },
      required: ["chat_id", "name"],
    },
  },
  {
    name: "editForumTopic",
    description:
      "Edit name and icon of a forum topic. The bot must be an administrator with can_manage_topics rights. Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["integer", "string"],
          description:
            "Unique identifier for the target chat or username (in the format @supergroupusername)",
        },
        message_thread_id: {
          type: "integer",
          description: "Unique identifier for the target message thread of the forum topic",
        },
        name: {
          type: "string",
          description: "New topic name, 0-128 characters. If not specified or empty, the current name of the topic will be kept",
        },
        icon_custom_emoji_id: {
          type: "string",
          description:
            "New unique identifier of the custom emoji shown as the topic icon. Use getForumTopicIconStickers to get all allowed custom emoji identifiers. Pass an empty string to remove the icon",
        },
      },
      required: ["chat_id", "message_thread_id"],
    },
  },
  {
    name: "closeForumTopic",
    description:
      "Close an open topic in a forum supergroup chat. The bot must be an administrator with can_manage_topics rights. Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["integer", "string"],
          description:
            "Unique identifier for the target supergroup or username (in the format @supergroupusername)",
        },
        message_thread_id: {
          type: "integer",
          description: "Unique identifier for the target message thread of the forum topic",
        },
      },
      required: ["chat_id", "message_thread_id"],
    },
  },
  {
    name: "reopenForumTopic",
    description:
      "Reopen a closed topic in a forum supergroup chat. The bot must be an administrator with can_manage_topics rights. Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["integer", "string"],
          description:
            "Unique identifier for the target supergroup or username (in the format @supergroupusername)",
        },
        message_thread_id: {
          type: "integer",
          description: "Unique identifier for the target message thread of the forum topic",
        },
      },
      required: ["chat_id", "message_thread_id"],
    },
  },
  {
    name: "deleteForumTopic",
    description:
      "Delete a forum topic along with all its messages in a forum supergroup chat. The bot must be an administrator with can_delete_messages rights. Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["integer", "string"],
          description:
            "Unique identifier for the target chat or username (in the format @supergroupusername)",
        },
        message_thread_id: {
          type: "integer",
          description: "Unique identifier for the target message thread of the forum topic",
        },
      },
      required: ["chat_id", "message_thread_id"],
    },
  },
  {
    name: "unpinAllForumTopicMessages",
    description:
      "Clear the list of pinned messages in a forum topic. The bot must be an administrator with can_pin_messages rights. Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["integer", "string"],
          description:
            "Unique identifier for the target chat or username (in the format @supergroupusername)",
        },
        message_thread_id: {
          type: "integer",
          description: "Unique identifier for the target message thread of the forum topic",
        },
      },
      required: ["chat_id", "message_thread_id"],
    },
  },
  {
    name: "editGeneralForumTopic",
    description:
      "Edit the name of the 'General' topic in a forum supergroup chat. The bot must be an administrator with can_manage_topics rights. Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["integer", "string"],
          description:
            "Unique identifier for the target supergroup or username (in the format @supergroupusername)",
        },
        name: {
          type: "string",
          description: "New topic name, 1-128 characters",
        },
      },
      required: ["chat_id", "name"],
    },
  },
  {
    name: "closeGeneralForumTopic",
    description:
      "Close the 'General' topic in a forum supergroup chat. The bot must be an administrator with can_manage_topics rights. Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["integer", "string"],
          description:
            "Unique identifier for the target supergroup or username (in the format @supergroupusername)",
        },
      },
      required: ["chat_id"],
    },
  },
  {
    name: "reopenGeneralForumTopic",
    description:
      "Reopen the closed 'General' topic in a forum supergroup chat. The bot must be an administrator with can_manage_topics rights. Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["integer", "string"],
          description:
            "Unique identifier for the target supergroup or username (in the format @supergroupusername)",
        },
      },
      required: ["chat_id"],
    },
  },
  {
    name: "hideGeneralForumTopic",
    description:
      "Hide the 'General' topic in a forum supergroup chat. The bot must be an administrator with can_manage_topics rights. The topic will be automatically closed if it was open. Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["integer", "string"],
          description:
            "Unique identifier for the target supergroup or username (in the format @supergroupusername)",
        },
      },
      required: ["chat_id"],
    },
  },
  {
    name: "unhideGeneralForumTopic",
    description:
      "Unhide the 'General' topic in a forum supergroup chat. The bot must be an administrator with can_manage_topics rights. Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["integer", "string"],
          description:
            "Unique identifier for the target supergroup or username (in the format @supergroupusername)",
        },
      },
      required: ["chat_id"],
    },
  },
  {
    name: "unpinAllGeneralForumTopicMessages",
    description:
      "Clear the list of pinned messages in a General forum topic. The bot must be an administrator with can_pin_messages rights. Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["integer", "string"],
          description:
            "Unique identifier for the target supergroup or username (in the format @supergroupusername)",
        },
      },
      required: ["chat_id"],
    },
  },
];

// =============================================================================
// TOOL HANDLER
// =============================================================================

export async function handleForumTool(
  name: string,
  args: Record<string, unknown>
) {
  const response = await callTelegramAPI(name, args);
  return createToolResult(response);
}
