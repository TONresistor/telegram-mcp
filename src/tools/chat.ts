/**
 * Chat Management Methods - Category 3
 *
 * Methods (30):
 * - banChatMember, unbanChatMember, restrictChatMember, promoteChatMember
 * - setChatAdministratorCustomTitle, banChatSenderChat, unbanChatSenderChat
 * - setChatPermissions, exportChatInviteLink, createChatInviteLink
 * - editChatInviteLink, createChatSubscriptionInviteLink, editChatSubscriptionInviteLink
 * - revokeChatInviteLink, approveChatJoinRequest, declineChatJoinRequest
 * - setChatPhoto, deleteChatPhoto, setChatTitle, setChatDescription
 * - pinChatMessage, unpinChatMessage, unpinAllChatMessages, leaveChat
 * - getChat, getChatAdministrators, getChatMemberCount, getChatMember
 * - setChatStickerSet, deleteChatStickerSet
 */

import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { callTelegramAPI, createToolResult } from "../telegram-api.js";

// =============================================================================
// SHARED SCHEMA DEFINITIONS
// =============================================================================

/**
 * ChatPermissions object schema - used by restrictChatMember and setChatPermissions
 */
const chatPermissionsSchema = {
  type: "object",
  description: "Object describing user permissions in a chat",
  properties: {
    can_send_messages: {
      type: "boolean",
      description: "True if the user is allowed to send text messages, contacts, giveaways, giveaway winners, invoices, locations and venues",
    },
    can_send_audios: {
      type: "boolean",
      description: "True if the user is allowed to send audios",
    },
    can_send_documents: {
      type: "boolean",
      description: "True if the user is allowed to send documents",
    },
    can_send_photos: {
      type: "boolean",
      description: "True if the user is allowed to send photos",
    },
    can_send_videos: {
      type: "boolean",
      description: "True if the user is allowed to send videos",
    },
    can_send_video_notes: {
      type: "boolean",
      description: "True if the user is allowed to send video notes",
    },
    can_send_voice_notes: {
      type: "boolean",
      description: "True if the user is allowed to send voice notes",
    },
    can_send_polls: {
      type: "boolean",
      description: "True if the user is allowed to send polls",
    },
    can_send_other_messages: {
      type: "boolean",
      description: "True if the user is allowed to send animations, games, stickers and use inline bots",
    },
    can_add_web_page_previews: {
      type: "boolean",
      description: "True if the user is allowed to add web page previews to their messages",
    },
    can_change_info: {
      type: "boolean",
      description: "True if the user is allowed to change the chat title, photo and other settings",
    },
    can_invite_users: {
      type: "boolean",
      description: "True if the user is allowed to invite new users to the chat",
    },
    can_pin_messages: {
      type: "boolean",
      description: "True if the user is allowed to pin messages",
    },
    can_manage_topics: {
      type: "boolean",
      description: "True if the user is allowed to create forum topics (supergroups only)",
    },
  },
};

// =============================================================================
// TOOL DEFINITIONS
// =============================================================================

export const chatTools: Tool[] = [
  // ---------------------------------------------------------------------------
  // BAN/UNBAN METHODS
  // ---------------------------------------------------------------------------
  {
    name: "banChatMember",
    description:
      "Ban a user in a group, supergroup or channel. The bot must be an administrator with the appropriate rights. Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["integer", "string"],
          description: "Unique identifier for the target chat or username of the target supergroup/channel (in the format @channelusername)",
        },
        user_id: {
          type: "integer",
          description: "Unique identifier of the target user",
        },
        until_date: {
          type: "integer",
          description: "Date when the user will be unbanned (Unix timestamp). If user is banned for more than 366 days or less than 30 seconds from the current time, they are considered banned forever. Applied for supergroups and channels only.",
        },
        revoke_messages: {
          type: "boolean",
          description: "Pass True to delete all messages from the chat for the user that is being removed. If False, the user will be able to see messages in the group that were sent before the user was removed. Always True for supergroups and channels.",
        },
      },
      required: ["chat_id", "user_id"],
    },
  },
  {
    name: "unbanChatMember",
    description:
      "Unban a previously banned user in a supergroup or channel. The user will NOT return to the group automatically but will be able to join via link, etc. The bot must be an administrator. Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["integer", "string"],
          description: "Unique identifier for the target chat or username of the target supergroup/channel (in the format @channelusername)",
        },
        user_id: {
          type: "integer",
          description: "Unique identifier of the target user",
        },
        only_if_banned: {
          type: "boolean",
          description: "Do nothing if the user is not banned",
        },
      },
      required: ["chat_id", "user_id"],
    },
  },
  {
    name: "banChatSenderChat",
    description:
      "Ban a channel chat in a supergroup or channel. Until the chat is unbanned, the owner of the banned chat won't be able to send messages on behalf of any of their channels. The bot must be an administrator and must have the appropriate administrator rights. Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["integer", "string"],
          description: "Unique identifier for the target chat or username of the target supergroup/channel (in the format @channelusername)",
        },
        sender_chat_id: {
          type: "integer",
          description: "Unique identifier of the target sender chat",
        },
      },
      required: ["chat_id", "sender_chat_id"],
    },
  },
  {
    name: "unbanChatSenderChat",
    description:
      "Unban a previously banned channel chat in a supergroup or channel. The bot must be an administrator and must have the appropriate administrator rights. Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["integer", "string"],
          description: "Unique identifier for the target chat or username of the target supergroup/channel (in the format @channelusername)",
        },
        sender_chat_id: {
          type: "integer",
          description: "Unique identifier of the target sender chat",
        },
      },
      required: ["chat_id", "sender_chat_id"],
    },
  },

  // ---------------------------------------------------------------------------
  // MEMBER MANAGEMENT METHODS
  // ---------------------------------------------------------------------------
  {
    name: "restrictChatMember",
    description:
      "Restrict a user in a supergroup. The bot must be an administrator with can_restrict_members rights. Pass True for all permissions to lift restrictions from a user. Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["integer", "string"],
          description: "Unique identifier for the target chat or username of the target supergroup (in the format @supergroupusername)",
        },
        user_id: {
          type: "integer",
          description: "Unique identifier of the target user",
        },
        permissions: {
          ...chatPermissionsSchema,
          description: "A JSON-serialized object for new user permissions",
        },
        use_independent_chat_permissions: {
          type: "boolean",
          description: "Pass True if chat permissions are set independently. Otherwise, the can_send_other_messages and can_add_web_page_previews permissions will imply the can_send_messages, can_send_audios, can_send_documents, can_send_photos, can_send_videos, can_send_video_notes, and can_send_voice_notes permissions; the can_send_polls permission will imply the can_send_messages permission.",
        },
        until_date: {
          type: "integer",
          description: "Date when restrictions will be lifted for the user (Unix timestamp). If user is restricted for more than 366 days or less than 30 seconds from the current time, they are considered restricted forever.",
        },
      },
      required: ["chat_id", "user_id", "permissions"],
    },
  },
  {
    name: "promoteChatMember",
    description:
      "Promote or demote a user in a supergroup or channel. The bot must be an administrator with the appropriate rights. Pass False for all boolean parameters to demote a user. Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["integer", "string"],
          description: "Unique identifier for the target chat or username of the target channel (in the format @channelusername)",
        },
        user_id: {
          type: "integer",
          description: "Unique identifier of the target user",
        },
        is_anonymous: {
          type: "boolean",
          description: "Pass True if the administrator's presence in the chat is hidden",
        },
        can_manage_chat: {
          type: "boolean",
          description: "Pass True if the administrator can access the chat event log, get boost list, see hidden supergroup and channel members, report spam messages, see anonymous administrators in supergroups and ignore slow mode. Implied by any other administrator privilege.",
        },
        can_delete_messages: {
          type: "boolean",
          description: "Pass True if the administrator can delete messages of other users",
        },
        can_manage_video_chats: {
          type: "boolean",
          description: "Pass True if the administrator can manage video chats",
        },
        can_restrict_members: {
          type: "boolean",
          description: "Pass True if the administrator can restrict, ban or unban chat members, or access supergroup statistics",
        },
        can_promote_members: {
          type: "boolean",
          description: "Pass True if the administrator can add new administrators with a subset of their own privileges or demote administrators that they have promoted, directly or indirectly",
        },
        can_change_info: {
          type: "boolean",
          description: "Pass True if the administrator can change chat title, photo and other settings",
        },
        can_invite_users: {
          type: "boolean",
          description: "Pass True if the administrator can invite new users to the chat",
        },
        can_post_stories: {
          type: "boolean",
          description: "Pass True if the administrator can post stories to the chat",
        },
        can_edit_stories: {
          type: "boolean",
          description: "Pass True if the administrator can edit stories posted by other users, post stories to the chat page, pin chat stories, and access the chat's story archive",
        },
        can_delete_stories: {
          type: "boolean",
          description: "Pass True if the administrator can delete stories posted by other users",
        },
        can_post_messages: {
          type: "boolean",
          description: "Pass True if the administrator can post messages in the channel, or access channel statistics (channels only)",
        },
        can_edit_messages: {
          type: "boolean",
          description: "Pass True if the administrator can edit messages of other users and can pin messages (channels only)",
        },
        can_pin_messages: {
          type: "boolean",
          description: "Pass True if the administrator can pin messages (supergroups only)",
        },
        can_manage_topics: {
          type: "boolean",
          description: "Pass True if the user is allowed to create, rename, close, and reopen forum topics (supergroups only)",
        },
      },
      required: ["chat_id", "user_id"],
    },
  },
  {
    name: "setChatAdministratorCustomTitle",
    description:
      "Set a custom title for an administrator in a supergroup promoted by the bot. Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["integer", "string"],
          description: "Unique identifier for the target chat or username of the target supergroup (in the format @supergroupusername)",
        },
        user_id: {
          type: "integer",
          description: "Unique identifier of the target user",
        },
        custom_title: {
          type: "string",
          description: "New custom title for the administrator; 0-16 characters, emoji are not allowed",
        },
      },
      required: ["chat_id", "user_id", "custom_title"],
    },
  },

  // ---------------------------------------------------------------------------
  // CHAT PERMISSIONS
  // ---------------------------------------------------------------------------
  {
    name: "setChatPermissions",
    description:
      "Set default chat permissions for all members. The bot must be an administrator and must have the can_restrict_members administrator rights. Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["integer", "string"],
          description: "Unique identifier for the target chat or username of the target supergroup (in the format @supergroupusername)",
        },
        permissions: {
          ...chatPermissionsSchema,
          description: "A JSON-serialized object for new default chat permissions",
        },
        use_independent_chat_permissions: {
          type: "boolean",
          description: "Pass True if chat permissions are set independently. Otherwise, the can_send_other_messages and can_add_web_page_previews permissions will imply the can_send_messages, can_send_audios, can_send_documents, can_send_photos, can_send_videos, can_send_video_notes, and can_send_voice_notes permissions; the can_send_polls permission will imply the can_send_messages permission.",
        },
      },
      required: ["chat_id", "permissions"],
    },
  },

  // ---------------------------------------------------------------------------
  // INVITE LINK METHODS
  // ---------------------------------------------------------------------------
  {
    name: "exportChatInviteLink",
    description:
      "Generate a new primary invite link for a chat. Any previously generated primary link is revoked. The bot must be an administrator with can_invite_users rights. Returns the new invite link as String on success.",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["integer", "string"],
          description: "Unique identifier for the target chat or username of the target channel (in the format @channelusername)",
        },
      },
      required: ["chat_id"],
    },
  },
  {
    name: "createChatInviteLink",
    description:
      "Create an additional invite link for a chat. The bot must be an administrator with can_invite_users rights. The link can be revoked using the method revokeChatInviteLink. Returns the new invite link as ChatInviteLink object.",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["integer", "string"],
          description: "Unique identifier for the target chat or username of the target channel (in the format @channelusername)",
        },
        name: {
          type: "string",
          description: "Invite link name; 0-32 characters",
        },
        expire_date: {
          type: "integer",
          description: "Point in time (Unix timestamp) when the link will expire",
        },
        member_limit: {
          type: "integer",
          description: "Maximum number of users that can be members of the chat simultaneously after joining the chat via this invite link; 1-99999",
        },
        creates_join_request: {
          type: "boolean",
          description: "True if users joining the chat via the link need to be approved by chat administrators. If True, member_limit can't be specified",
        },
      },
      required: ["chat_id"],
    },
  },
  {
    name: "editChatInviteLink",
    description:
      "Edit a non-primary invite link created by the bot. The bot must be an administrator with can_invite_users rights. Returns the edited invite link as ChatInviteLink object.",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["integer", "string"],
          description: "Unique identifier for the target chat or username of the target channel (in the format @channelusername)",
        },
        invite_link: {
          type: "string",
          description: "The invite link to edit",
        },
        name: {
          type: "string",
          description: "Invite link name; 0-32 characters",
        },
        expire_date: {
          type: "integer",
          description: "Point in time (Unix timestamp) when the link will expire",
        },
        member_limit: {
          type: "integer",
          description: "Maximum number of users that can be members of the chat simultaneously after joining the chat via this invite link; 1-99999",
        },
        creates_join_request: {
          type: "boolean",
          description: "True if users joining the chat via the link need to be approved by chat administrators. If True, member_limit can't be specified",
        },
      },
      required: ["chat_id", "invite_link"],
    },
  },
  {
    name: "createChatSubscriptionInviteLink",
    description:
      "Create a subscription invite link for a channel chat. The bot must have can_invite_users administrator rights. The link can be edited using editChatSubscriptionInviteLink or revoked using revokeChatInviteLink. Returns the new invite link as ChatInviteLink object.",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["integer", "string"],
          description: "Unique identifier for the target channel chat or username of the target channel (in the format @channelusername)",
        },
        name: {
          type: "string",
          description: "Invite link name; 0-32 characters",
        },
        subscription_period: {
          type: "integer",
          description: "The number of seconds the subscription will be active for before the next payment. Currently, it must always be 2592000 (30 days).",
        },
        subscription_price: {
          type: "integer",
          description: "The number of Telegram Stars a user must pay initially and after each subsequent subscription period to be a member of the chat; 1-10000",
        },
      },
      required: ["chat_id", "subscription_period", "subscription_price"],
    },
  },
  {
    name: "editChatSubscriptionInviteLink",
    description:
      "Edit a subscription invite link created by the bot. The bot must have can_invite_users administrator rights. Returns the edited invite link as ChatInviteLink object.",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["integer", "string"],
          description: "Unique identifier for the target channel chat or username of the target channel (in the format @channelusername)",
        },
        invite_link: {
          type: "string",
          description: "The invite link to edit",
        },
        name: {
          type: "string",
          description: "Invite link name; 0-32 characters",
        },
      },
      required: ["chat_id", "invite_link"],
    },
  },
  {
    name: "revokeChatInviteLink",
    description:
      "Revoke an invite link created by the bot. If the primary link is revoked, a new link is automatically generated. The bot must be an administrator with can_invite_users rights. Returns the revoked invite link as ChatInviteLink object.",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["integer", "string"],
          description: "Unique identifier for the target chat or username of the target channel (in the format @channelusername)",
        },
        invite_link: {
          type: "string",
          description: "The invite link to revoke",
        },
      },
      required: ["chat_id", "invite_link"],
    },
  },

  // ---------------------------------------------------------------------------
  // JOIN REQUEST METHODS
  // ---------------------------------------------------------------------------
  {
    name: "approveChatJoinRequest",
    description:
      "Approve a chat join request. The bot must be an administrator with can_invite_users rights. Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["integer", "string"],
          description: "Unique identifier for the target chat or username of the target channel (in the format @channelusername)",
        },
        user_id: {
          type: "integer",
          description: "Unique identifier of the target user",
        },
      },
      required: ["chat_id", "user_id"],
    },
  },
  {
    name: "declineChatJoinRequest",
    description:
      "Decline a chat join request. The bot must be an administrator with can_invite_users rights. Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["integer", "string"],
          description: "Unique identifier for the target chat or username of the target channel (in the format @channelusername)",
        },
        user_id: {
          type: "integer",
          description: "Unique identifier of the target user",
        },
      },
      required: ["chat_id", "user_id"],
    },
  },

  // ---------------------------------------------------------------------------
  // CHAT SETTINGS METHODS
  // ---------------------------------------------------------------------------
  {
    name: "setChatPhoto",
    description:
      "Set a new profile photo for the chat. Photos can't be changed for private chats. The bot must be an administrator with can_change_info rights. Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["integer", "string"],
          description: "Unique identifier for the target chat or username of the target channel (in the format @channelusername)",
        },
        photo: {
          type: "string",
          description: "New chat photo, uploaded using multipart/form-data (InputFile)",
        },
      },
      required: ["chat_id", "photo"],
    },
  },
  {
    name: "deleteChatPhoto",
    description:
      "Delete a chat photo. Photos can't be changed for private chats. The bot must be an administrator with can_change_info rights. Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["integer", "string"],
          description: "Unique identifier for the target chat or username of the target channel (in the format @channelusername)",
        },
      },
      required: ["chat_id"],
    },
  },
  {
    name: "setChatTitle",
    description:
      "Change the title of a chat. Titles can't be changed for private chats. The bot must be an administrator with can_change_info rights. Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["integer", "string"],
          description: "Unique identifier for the target chat or username of the target channel (in the format @channelusername)",
        },
        title: {
          type: "string",
          description: "New chat title, 1-128 characters",
        },
      },
      required: ["chat_id", "title"],
    },
  },
  {
    name: "setChatDescription",
    description:
      "Change the description of a group, a supergroup or a channel. The bot must be an administrator with can_change_info rights. Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["integer", "string"],
          description: "Unique identifier for the target chat or username of the target channel (in the format @channelusername)",
        },
        description: {
          type: "string",
          description: "New chat description, 0-255 characters",
        },
      },
      required: ["chat_id"],
    },
  },

  // ---------------------------------------------------------------------------
  // PIN MESSAGE METHODS
  // ---------------------------------------------------------------------------
  {
    name: "pinChatMessage",
    description:
      "Add a message to the list of pinned messages in a chat. If the chat is not a private chat, the bot must be an administrator with can_pin_messages rights in a supergroup or can_edit_messages rights in a channel. Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["integer", "string"],
          description: "Unique identifier for the target chat or username of the target channel (in the format @channelusername)",
        },
        message_id: {
          type: "integer",
          description: "Identifier of a message to pin",
        },
        business_connection_id: {
          type: "string",
          description: "Unique identifier of the business connection on behalf of which the message will be pinned",
        },
        disable_notification: {
          type: "boolean",
          description: "Pass True if it is not necessary to send a notification to all chat members about the new pinned message. Notifications are always disabled in channels and private chats.",
        },
      },
      required: ["chat_id", "message_id"],
    },
  },
  {
    name: "unpinChatMessage",
    description:
      "Remove a message from the list of pinned messages in a chat. If the chat is not a private chat, the bot must be an administrator with can_pin_messages rights in a supergroup or can_edit_messages rights in a channel. Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["integer", "string"],
          description: "Unique identifier for the target chat or username of the target channel (in the format @channelusername)",
        },
        message_id: {
          type: "integer",
          description: "Identifier of the message to unpin. Required if business_connection_id is specified. If not specified, the most recent pinned message (by sending date) will be unpinned.",
        },
        business_connection_id: {
          type: "string",
          description: "Unique identifier of the business connection on behalf of which the message will be unpinned",
        },
      },
      required: ["chat_id"],
    },
  },
  {
    name: "unpinAllChatMessages",
    description:
      "Clear the list of pinned messages in a chat. If the chat is not a private chat, the bot must be an administrator with can_pin_messages rights in a supergroup or can_edit_messages rights in a channel. Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["integer", "string"],
          description: "Unique identifier for the target chat or username of the target channel (in the format @channelusername)",
        },
      },
      required: ["chat_id"],
    },
  },

  // ---------------------------------------------------------------------------
  // CHAT INFORMATION METHODS
  // ---------------------------------------------------------------------------
  {
    name: "leaveChat",
    description:
      "Leave a group, supergroup or channel. Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["integer", "string"],
          description: "Unique identifier for the target chat or username of the target supergroup or channel (in the format @channelusername)",
        },
      },
      required: ["chat_id"],
    },
  },
  {
    name: "getChat",
    description:
      "Get up to date information about the chat. Returns ChatFullInfo object on success.",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["integer", "string"],
          description: "Unique identifier for the target chat or username of the target supergroup or channel (in the format @channelusername)",
        },
      },
      required: ["chat_id"],
    },
  },
  {
    name: "getChatAdministrators",
    description:
      "Get a list of administrators in a chat, which aren't bots. Returns an Array of ChatMember objects.",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["integer", "string"],
          description: "Unique identifier for the target chat or username of the target supergroup or channel (in the format @channelusername)",
        },
      },
      required: ["chat_id"],
    },
  },
  {
    name: "getChatMemberCount",
    description:
      "Get the number of members in a chat. Returns Int on success.",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["integer", "string"],
          description: "Unique identifier for the target chat or username of the target supergroup or channel (in the format @channelusername)",
        },
      },
      required: ["chat_id"],
    },
  },
  {
    name: "getChatMember",
    description:
      "Get information about a member of a chat. The method is only guaranteed to work for other users if the bot is an administrator in the chat. Returns a ChatMember object on success.",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["integer", "string"],
          description: "Unique identifier for the target chat or username of the target supergroup or channel (in the format @channelusername)",
        },
        user_id: {
          type: "integer",
          description: "Unique identifier of the target user",
        },
      },
      required: ["chat_id", "user_id"],
    },
  },

  // ---------------------------------------------------------------------------
  // STICKER SET METHODS
  // ---------------------------------------------------------------------------
  {
    name: "setChatStickerSet",
    description:
      "Set a new group sticker set for a supergroup. The bot must be an administrator with can_change_info rights. Use the field can_set_sticker_set optionally returned in getChat requests to check if the bot can use this method. Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["integer", "string"],
          description: "Unique identifier for the target chat or username of the target supergroup (in the format @supergroupusername)",
        },
        sticker_set_name: {
          type: "string",
          description: "Name of the sticker set to be set as the group sticker set",
        },
      },
      required: ["chat_id", "sticker_set_name"],
    },
  },
  {
    name: "deleteChatStickerSet",
    description:
      "Delete a group sticker set from a supergroup. The bot must be an administrator with can_change_info rights. Use the field can_set_sticker_set optionally returned in getChat requests to check if the bot can use this method. Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["integer", "string"],
          description: "Unique identifier for the target chat or username of the target supergroup (in the format @supergroupusername)",
        },
      },
      required: ["chat_id"],
    },
  },
];

// =============================================================================
// TOOL HANDLER
// =============================================================================

export async function handleChatTool(
  name: string,
  args: Record<string, unknown>
) {
  const response = await callTelegramAPI(name, args);
  return createToolResult(response);
}
