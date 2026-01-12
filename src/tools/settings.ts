/**
 * Bot Configuration & Users - Categories 3 & 4
 *
 * Configuration Methods (13):
 * - setMyCommands, deleteMyCommands, getMyCommands
 * - setMyName, getMyName, setMyDescription, getMyDescription
 * - setMyShortDescription, getMyShortDescription
 * - setChatMenuButton, getChatMenuButton
 * - setMyDefaultAdministratorRights, getMyDefaultAdministratorRights
 *
 * User Methods (3):
 * - getUserProfilePhotos, setUserEmojiStatus, getFile
 */

import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { callTelegramAPI, createToolResult } from "../telegram-api.js";

// =============================================================================
// TOOL DEFINITIONS
// =============================================================================

export const settingsTools: Tool[] = [
  // ===========================================================================
  // COMMANDS MANAGEMENT
  // ===========================================================================
  {
    name: "setMyCommands",
    description:
      "Change the list of bot commands. Returns True on success. At most 100 commands can be specified.",
    inputSchema: {
      type: "object",
      properties: {
        commands: {
          type: "array",
          description:
            "A list of bot commands to set. Each command object must have 'command' (1-32 chars) and 'description' (1-256 chars).",
          items: {
            type: "object",
            properties: {
              command: {
                type: "string",
                description:
                  "Text of the command; 1-32 characters. Can contain only lowercase English letters, digits and underscores.",
              },
              description: {
                type: "string",
                description: "Description of the command; 1-256 characters.",
              },
            },
            required: ["command", "description"],
          },
        },
        scope: {
          type: "object",
          description:
            "Scope of users for which the commands are relevant. Defaults to BotCommandScopeDefault.",
          properties: {
            type: {
              type: "string",
              enum: [
                "default",
                "all_private_chats",
                "all_group_chats",
                "all_chat_administrators",
                "chat",
                "chat_administrators",
                "chat_member",
              ],
              description: "Scope type.",
            },
            chat_id: {
              type: ["integer", "string"],
              description:
                "Unique identifier for the target chat or username (for chat, chat_administrators, chat_member scopes).",
            },
            user_id: {
              type: "integer",
              description:
                "Unique identifier of the target user (for chat_member scope).",
            },
          },
          required: ["type"],
        },
        language_code: {
          type: "string",
          description:
            "Two-letter ISO 639-1 language code. If empty, commands apply to all users from the given scope.",
        },
      },
      required: ["commands"],
    },
  },
  {
    name: "deleteMyCommands",
    description:
      "Delete the list of bot commands for the given scope and language. Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        scope: {
          type: "object",
          description:
            "Scope of users for which the commands are relevant. Defaults to BotCommandScopeDefault.",
          properties: {
            type: {
              type: "string",
              enum: [
                "default",
                "all_private_chats",
                "all_group_chats",
                "all_chat_administrators",
                "chat",
                "chat_administrators",
                "chat_member",
              ],
              description: "Scope type.",
            },
            chat_id: {
              type: ["integer", "string"],
              description: "Unique identifier for the target chat or username.",
            },
            user_id: {
              type: "integer",
              description: "Unique identifier of the target user.",
            },
          },
          required: ["type"],
        },
        language_code: {
          type: "string",
          description:
            "Two-letter ISO 639-1 language code. If empty, commands apply to all users from the given scope.",
        },
      },
      required: [],
    },
  },
  {
    name: "getMyCommands",
    description:
      "Get the current list of bot commands for the given scope and language. Returns an Array of BotCommand objects.",
    inputSchema: {
      type: "object",
      properties: {
        scope: {
          type: "object",
          description:
            "Scope of users for which the commands are relevant. Defaults to BotCommandScopeDefault.",
          properties: {
            type: {
              type: "string",
              enum: [
                "default",
                "all_private_chats",
                "all_group_chats",
                "all_chat_administrators",
                "chat",
                "chat_administrators",
                "chat_member",
              ],
              description: "Scope type.",
            },
            chat_id: {
              type: ["integer", "string"],
              description: "Unique identifier for the target chat or username.",
            },
            user_id: {
              type: "integer",
              description: "Unique identifier of the target user.",
            },
          },
          required: ["type"],
        },
        language_code: {
          type: "string",
          description:
            "Two-letter ISO 639-1 language code or empty string.",
        },
      },
      required: [],
    },
  },

  // ===========================================================================
  // BOT NAME
  // ===========================================================================
  {
    name: "setMyName",
    description:
      "Change the bot's name. Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description:
            "New bot name; 0-64 characters. Pass empty string to remove the dedicated name for the given language.",
        },
        language_code: {
          type: "string",
          description:
            "Two-letter ISO 639-1 language code. If empty, the name applies to all users without a dedicated name.",
        },
      },
      required: [],
    },
  },
  {
    name: "getMyName",
    description:
      "Get the current bot name for the given user language. Returns a BotName object.",
    inputSchema: {
      type: "object",
      properties: {
        language_code: {
          type: "string",
          description: "Two-letter ISO 639-1 language code or empty string.",
        },
      },
      required: [],
    },
  },

  // ===========================================================================
  // BOT DESCRIPTION
  // ===========================================================================
  {
    name: "setMyDescription",
    description:
      "Change the bot's description, shown in empty chats and shared via bot links. Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        description: {
          type: "string",
          description:
            "New bot description; 0-512 characters. Pass empty string to remove the dedicated description for the given language.",
        },
        language_code: {
          type: "string",
          description:
            "Two-letter ISO 639-1 language code. If empty, the description applies to all users without a dedicated description.",
        },
      },
      required: [],
    },
  },
  {
    name: "getMyDescription",
    description:
      "Get the current bot description for the given user language. Returns a BotDescription object.",
    inputSchema: {
      type: "object",
      properties: {
        language_code: {
          type: "string",
          description: "Two-letter ISO 639-1 language code or empty string.",
        },
      },
      required: [],
    },
  },

  // ===========================================================================
  // BOT SHORT DESCRIPTION
  // ===========================================================================
  {
    name: "setMyShortDescription",
    description:
      "Change the bot's short description, shown on the bot's profile page and shared alongside bot links. Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        short_description: {
          type: "string",
          description:
            "New short description; 0-120 characters. Pass empty string to remove the dedicated short description for the given language.",
        },
        language_code: {
          type: "string",
          description:
            "Two-letter ISO 639-1 language code. If empty, the short description applies to all users without a dedicated one.",
        },
      },
      required: [],
    },
  },
  {
    name: "getMyShortDescription",
    description:
      "Get the current bot short description for the given user language. Returns a BotShortDescription object.",
    inputSchema: {
      type: "object",
      properties: {
        language_code: {
          type: "string",
          description: "Two-letter ISO 639-1 language code or empty string.",
        },
      },
      required: [],
    },
  },

  // ===========================================================================
  // CHAT MENU BUTTON
  // ===========================================================================
  {
    name: "setChatMenuButton",
    description:
      "Change the bot's menu button in a private chat, or the default menu button. Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: "integer",
          description:
            "Unique identifier for the target private chat. If not specified, changes the default bot menu button.",
        },
        menu_button: {
          type: "object",
          description:
            "Object for the bot's new menu button. Defaults to MenuButtonDefault.",
          properties: {
            type: {
              type: "string",
              enum: ["commands", "web_app", "default"],
              description: "Type of the button.",
            },
            text: {
              type: "string",
              description: "Text on the button (for web_app type).",
            },
            web_app: {
              type: "object",
              description: "Web App info (for web_app type).",
              properties: {
                url: {
                  type: "string",
                  description: "HTTPS URL of the Web App.",
                },
              },
              required: ["url"],
            },
          },
          required: ["type"],
        },
      },
      required: [],
    },
  },
  {
    name: "getChatMenuButton",
    description:
      "Get the current value of the bot's menu button in a private chat, or the default menu button. Returns a MenuButton object.",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: "integer",
          description:
            "Unique identifier for the target private chat. If not specified, returns the default bot menu button.",
        },
      },
      required: [],
    },
  },

  // ===========================================================================
  // DEFAULT ADMINISTRATOR RIGHTS
  // ===========================================================================
  {
    name: "setMyDefaultAdministratorRights",
    description:
      "Change the default administrator rights requested when adding the bot as administrator to groups or channels. Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        rights: {
          type: "object",
          description:
            "Object describing new default administrator rights. If not specified, clears default rights.",
          properties: {
            is_anonymous: {
              type: "boolean",
              description: "True if the administrator's presence in the chat is hidden.",
            },
            can_manage_chat: {
              type: "boolean",
              description:
                "True if the administrator can access the chat event log, stats, and more.",
            },
            can_delete_messages: {
              type: "boolean",
              description: "True if the administrator can delete messages of other users.",
            },
            can_manage_video_chats: {
              type: "boolean",
              description: "True if the administrator can manage video chats.",
            },
            can_restrict_members: {
              type: "boolean",
              description: "True if the administrator can restrict, ban or unban chat members.",
            },
            can_promote_members: {
              type: "boolean",
              description: "True if the administrator can add new administrators.",
            },
            can_change_info: {
              type: "boolean",
              description: "True if the administrator can change chat title, photo, etc.",
            },
            can_invite_users: {
              type: "boolean",
              description: "True if the administrator can invite new users to the chat.",
            },
            can_post_stories: {
              type: "boolean",
              description: "True if the administrator can post stories to the chat.",
            },
            can_edit_stories: {
              type: "boolean",
              description: "True if the administrator can edit stories posted by other users.",
            },
            can_delete_stories: {
              type: "boolean",
              description: "True if the administrator can delete stories posted by other users.",
            },
            can_post_messages: {
              type: "boolean",
              description: "True if the administrator can post messages in the channel (channels only).",
            },
            can_edit_messages: {
              type: "boolean",
              description: "True if the administrator can edit messages (channels only).",
            },
            can_pin_messages: {
              type: "boolean",
              description: "True if the administrator can pin messages (groups and supergroups only).",
            },
            can_manage_topics: {
              type: "boolean",
              description: "True if the administrator can manage forum topics (supergroups only).",
            },
          },
        },
        for_channels: {
          type: "boolean",
          description:
            "Pass True to change the default administrator rights for channels. Otherwise, changes rights for groups and supergroups.",
        },
      },
      required: [],
    },
  },
  {
    name: "getMyDefaultAdministratorRights",
    description:
      "Get the current default administrator rights of the bot. Returns a ChatAdministratorRights object.",
    inputSchema: {
      type: "object",
      properties: {
        for_channels: {
          type: "boolean",
          description:
            "Pass True to get default administrator rights for channels. Otherwise, returns rights for groups and supergroups.",
        },
      },
      required: [],
    },
  },

  // ===========================================================================
  // USER METHODS
  // ===========================================================================
  {
    name: "getUserProfilePhotos",
    description:
      "Get a list of profile pictures for a user. Returns a UserProfilePhotos object.",
    inputSchema: {
      type: "object",
      properties: {
        user_id: {
          type: "integer",
          description: "Unique identifier of the target user.",
        },
        offset: {
          type: "integer",
          description:
            "Sequential number of the first photo to be returned. By default, all photos are returned.",
        },
        limit: {
          type: "integer",
          description: "Limits the number of photos to be retrieved. Values between 1-100. Defaults to 100.",
          minimum: 1,
          maximum: 100,
        },
      },
      required: ["user_id"],
    },
  },
  {
    name: "setUserEmojiStatus",
    description:
      "Change the emoji status for a user who authorized the bot via Mini App method requestEmojiStatusAccess. Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        user_id: {
          type: "integer",
          description: "Unique identifier of the target user.",
        },
        emoji_status_custom_emoji_id: {
          type: "string",
          description:
            "Custom emoji identifier of the emoji status to set. Pass empty string to remove the status.",
        },
        emoji_status_expiration_date: {
          type: "integer",
          description:
            "Expiration date of the emoji status, if any (Unix timestamp).",
        },
      },
      required: ["user_id"],
    },
  },
  {
    name: "getFile",
    description:
      "Get basic info about a file and prepare it for downloading. Returns a File object with file_path for download. Files up to 20MB can be downloaded.",
    inputSchema: {
      type: "object",
      properties: {
        file_id: {
          type: "string",
          description: "File identifier to get information about.",
        },
      },
      required: ["file_id"],
    },
  },
];

// =============================================================================
// TOOL HANDLER
// =============================================================================

export async function handleSettingsTool(
  name: string,
  args: Record<string, unknown>
) {
  const response = await callTelegramAPI(name, args);
  return createToolResult(response);
}
