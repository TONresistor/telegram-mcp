/**
 * Tool Registry for Meta-Tools Mode
 *
 * Contains an index of all 161 Telegram API tools with searchable keywords.
 * This enables the meta-tools pattern where only 2 tools are exposed to Claude,
 * reducing token usage by ~98%.
 */

export interface ToolEntry {
  name: string;
  category: string;
  description: string;
  keywords: string[];
  required: string[];
  optional: string[];
}

export const toolRegistry: ToolEntry[] = [
  // ==========================================================================
  // MESSAGES (22 tools)
  // ==========================================================================
  {
    name: "sendMessage",
    category: "messages",
    description: "Send text message to chat",
    keywords: ["send", "text", "message", "chat", "write"],
    required: ["chat_id", "text"],
    optional: ["parse_mode", "reply_markup", "reply_parameters", "disable_notification"]
  },
  {
    name: "sendPhoto",
    category: "messages",
    description: "Send photo to chat",
    keywords: ["send", "photo", "image", "picture", "img"],
    required: ["chat_id", "photo"],
    optional: ["caption", "parse_mode", "reply_markup"]
  },
  {
    name: "sendVideo",
    category: "messages",
    description: "Send video to chat",
    keywords: ["send", "video", "movie", "clip", "mp4"],
    required: ["chat_id", "video"],
    optional: ["caption", "duration", "width", "height", "thumbnail"]
  },
  {
    name: "sendAudio",
    category: "messages",
    description: "Send audio file to chat",
    keywords: ["send", "audio", "music", "mp3", "sound"],
    required: ["chat_id", "audio"],
    optional: ["caption", "duration", "performer", "title"]
  },
  {
    name: "sendDocument",
    category: "messages",
    description: "Send document/file to chat",
    keywords: ["send", "document", "file", "pdf", "attachment"],
    required: ["chat_id", "document"],
    optional: ["caption", "thumbnail"]
  },
  {
    name: "sendAnimation",
    category: "messages",
    description: "Send GIF animation to chat",
    keywords: ["send", "animation", "gif", "animated"],
    required: ["chat_id", "animation"],
    optional: ["caption", "duration", "width", "height"]
  },
  {
    name: "sendVoice",
    category: "messages",
    description: "Send voice message to chat",
    keywords: ["send", "voice", "audio", "ogg", "record"],
    required: ["chat_id", "voice"],
    optional: ["caption", "duration"]
  },
  {
    name: "sendVideoNote",
    category: "messages",
    description: "Send video note (round video) to chat",
    keywords: ["send", "video", "note", "round", "circle"],
    required: ["chat_id", "video_note"],
    optional: ["duration", "length", "thumbnail"]
  },
  {
    name: "sendLocation",
    category: "messages",
    description: "Send location point on map",
    keywords: ["send", "location", "map", "gps", "position", "coordinates"],
    required: ["chat_id", "latitude", "longitude"],
    optional: ["horizontal_accuracy", "live_period", "heading"]
  },
  {
    name: "sendVenue",
    category: "messages",
    description: "Send venue/place information",
    keywords: ["send", "venue", "place", "location", "address", "business"],
    required: ["chat_id", "latitude", "longitude", "title", "address"],
    optional: ["foursquare_id", "google_place_id"]
  },
  {
    name: "sendContact",
    category: "messages",
    description: "Send phone contact",
    keywords: ["send", "contact", "phone", "number", "person"],
    required: ["chat_id", "phone_number", "first_name"],
    optional: ["last_name", "vcard"]
  },
  {
    name: "sendPoll",
    category: "messages",
    description: "Send poll/survey to chat",
    keywords: ["send", "poll", "vote", "survey", "question", "quiz"],
    required: ["chat_id", "question", "options"],
    optional: ["is_anonymous", "type", "allows_multiple_answers", "correct_option_id"]
  },
  {
    name: "sendDice",
    category: "messages",
    description: "Send animated dice/random emoji",
    keywords: ["send", "dice", "random", "game", "emoji", "slot"],
    required: ["chat_id"],
    optional: ["emoji"]
  },
  {
    name: "sendChatAction",
    category: "messages",
    description: "Send typing/upload status indicator",
    keywords: ["typing", "action", "status", "indicator", "upload"],
    required: ["chat_id", "action"],
    optional: []
  },
  {
    name: "sendMediaGroup",
    category: "messages",
    description: "Send album of photos/videos",
    keywords: ["send", "media", "group", "album", "multiple", "photos", "videos"],
    required: ["chat_id", "media"],
    optional: ["disable_notification", "reply_parameters"]
  },
  {
    name: "sendPaidMedia",
    category: "messages",
    description: "Send paid media content",
    keywords: ["send", "paid", "media", "premium", "stars"],
    required: ["chat_id", "star_count", "media"],
    optional: ["caption", "payload"]
  },
  {
    name: "forwardMessage",
    category: "messages",
    description: "Forward message to another chat",
    keywords: ["forward", "message", "share", "resend"],
    required: ["chat_id", "from_chat_id", "message_id"],
    optional: ["disable_notification", "protect_content"]
  },
  {
    name: "forwardMessages",
    category: "messages",
    description: "Forward multiple messages",
    keywords: ["forward", "messages", "multiple", "bulk", "batch"],
    required: ["chat_id", "from_chat_id", "message_ids"],
    optional: ["disable_notification", "protect_content"]
  },
  {
    name: "copyMessage",
    category: "messages",
    description: "Copy message without forward tag",
    keywords: ["copy", "message", "duplicate", "clone"],
    required: ["chat_id", "from_chat_id", "message_id"],
    optional: ["caption", "reply_markup"]
  },
  {
    name: "copyMessages",
    category: "messages",
    description: "Copy multiple messages",
    keywords: ["copy", "messages", "multiple", "bulk", "batch"],
    required: ["chat_id", "from_chat_id", "message_ids"],
    optional: ["remove_caption"]
  },
  {
    name: "sendSticker",
    category: "messages",
    description: "Send sticker to chat",
    keywords: ["send", "sticker", "emoji", "webp", "tgs"],
    required: ["chat_id", "sticker"],
    optional: ["emoji", "reply_markup"]
  },
  {
    name: "sendChecklist",
    category: "messages",
    description: "Send checklist (business only)",
    keywords: ["send", "checklist", "todo", "tasks", "list"],
    required: ["business_connection_id", "chat_id", "checklist"],
    optional: []
  },

  // ==========================================================================
  // CHAT MANAGEMENT (30 tools)
  // ==========================================================================
  {
    name: "getChat",
    category: "chat",
    description: "Get chat information",
    keywords: ["get", "chat", "info", "details", "group", "channel"],
    required: ["chat_id"],
    optional: []
  },
  {
    name: "getChatMember",
    category: "chat",
    description: "Get info about chat member",
    keywords: ["get", "member", "user", "info", "status"],
    required: ["chat_id", "user_id"],
    optional: []
  },
  {
    name: "getChatMemberCount",
    category: "chat",
    description: "Get number of members in chat",
    keywords: ["get", "count", "members", "users", "size"],
    required: ["chat_id"],
    optional: []
  },
  {
    name: "getChatAdministrators",
    category: "chat",
    description: "Get list of chat administrators",
    keywords: ["get", "admins", "administrators", "moderators", "list"],
    required: ["chat_id"],
    optional: []
  },
  {
    name: "banChatMember",
    category: "chat",
    description: "Ban user from chat",
    keywords: ["ban", "kick", "remove", "user", "member", "block"],
    required: ["chat_id", "user_id"],
    optional: ["until_date", "revoke_messages"]
  },
  {
    name: "unbanChatMember",
    category: "chat",
    description: "Unban user from chat",
    keywords: ["unban", "unblock", "allow", "user", "member"],
    required: ["chat_id", "user_id"],
    optional: ["only_if_banned"]
  },
  {
    name: "restrictChatMember",
    category: "chat",
    description: "Restrict user permissions in chat",
    keywords: ["restrict", "limit", "permissions", "user", "mute"],
    required: ["chat_id", "user_id", "permissions"],
    optional: ["until_date"]
  },
  {
    name: "promoteChatMember",
    category: "chat",
    description: "Promote user to admin",
    keywords: ["promote", "admin", "moderator", "permissions", "rights"],
    required: ["chat_id", "user_id"],
    optional: ["can_manage_chat", "can_delete_messages", "can_manage_video_chats", "can_restrict_members", "can_promote_members", "can_change_info", "can_invite_users", "can_post_messages", "can_edit_messages", "can_pin_messages"]
  },
  {
    name: "setChatAdministratorCustomTitle",
    category: "chat",
    description: "Set custom title for admin",
    keywords: ["set", "title", "admin", "custom", "role"],
    required: ["chat_id", "user_id", "custom_title"],
    optional: []
  },
  {
    name: "setChatPermissions",
    category: "chat",
    description: "Set default chat permissions",
    keywords: ["set", "permissions", "chat", "default", "rights"],
    required: ["chat_id", "permissions"],
    optional: []
  },
  {
    name: "setChatTitle",
    category: "chat",
    description: "Set chat title/name",
    keywords: ["set", "title", "name", "chat", "rename"],
    required: ["chat_id", "title"],
    optional: []
  },
  {
    name: "setChatDescription",
    category: "chat",
    description: "Set chat description/bio",
    keywords: ["set", "description", "bio", "about", "chat"],
    required: ["chat_id"],
    optional: ["description"]
  },
  {
    name: "setChatPhoto",
    category: "chat",
    description: "Set chat photo/avatar",
    keywords: ["set", "photo", "avatar", "picture", "chat"],
    required: ["chat_id", "photo"],
    optional: []
  },
  {
    name: "deleteChatPhoto",
    category: "chat",
    description: "Delete chat photo",
    keywords: ["delete", "remove", "photo", "avatar", "chat"],
    required: ["chat_id"],
    optional: []
  },
  {
    name: "pinChatMessage",
    category: "chat",
    description: "Pin message in chat",
    keywords: ["pin", "message", "sticky", "top", "important"],
    required: ["chat_id", "message_id"],
    optional: ["disable_notification"]
  },
  {
    name: "unpinChatMessage",
    category: "chat",
    description: "Unpin message from chat",
    keywords: ["unpin", "message", "remove", "unsticky"],
    required: ["chat_id"],
    optional: ["message_id"]
  },
  {
    name: "unpinAllChatMessages",
    category: "chat",
    description: "Unpin all messages in chat",
    keywords: ["unpin", "all", "messages", "clear", "pins"],
    required: ["chat_id"],
    optional: []
  },
  {
    name: "leaveChat",
    category: "chat",
    description: "Leave a chat/group",
    keywords: ["leave", "exit", "quit", "chat", "group"],
    required: ["chat_id"],
    optional: []
  },
  {
    name: "exportChatInviteLink",
    category: "chat",
    description: "Generate new invite link",
    keywords: ["export", "invite", "link", "generate", "share"],
    required: ["chat_id"],
    optional: []
  },
  {
    name: "createChatInviteLink",
    category: "chat",
    description: "Create additional invite link",
    keywords: ["create", "invite", "link", "new"],
    required: ["chat_id"],
    optional: ["name", "expire_date", "member_limit", "creates_join_request"]
  },
  {
    name: "editChatInviteLink",
    category: "chat",
    description: "Edit invite link",
    keywords: ["edit", "invite", "link", "modify", "update"],
    required: ["chat_id", "invite_link"],
    optional: ["name", "expire_date", "member_limit"]
  },
  {
    name: "revokeChatInviteLink",
    category: "chat",
    description: "Revoke invite link",
    keywords: ["revoke", "invite", "link", "disable", "cancel"],
    required: ["chat_id", "invite_link"],
    optional: []
  },
  {
    name: "approveChatJoinRequest",
    category: "chat",
    description: "Approve join request",
    keywords: ["approve", "accept", "join", "request", "member"],
    required: ["chat_id", "user_id"],
    optional: []
  },
  {
    name: "declineChatJoinRequest",
    category: "chat",
    description: "Decline join request",
    keywords: ["decline", "reject", "deny", "join", "request"],
    required: ["chat_id", "user_id"],
    optional: []
  },
  {
    name: "banChatSenderChat",
    category: "chat",
    description: "Ban channel in supergroup",
    keywords: ["ban", "channel", "sender", "chat"],
    required: ["chat_id", "sender_chat_id"],
    optional: []
  },
  {
    name: "unbanChatSenderChat",
    category: "chat",
    description: "Unban channel in supergroup",
    keywords: ["unban", "channel", "sender", "chat"],
    required: ["chat_id", "sender_chat_id"],
    optional: []
  },
  {
    name: "setChatStickerSet",
    category: "chat",
    description: "Set group sticker set",
    keywords: ["set", "sticker", "group", "pack"],
    required: ["chat_id", "sticker_set_name"],
    optional: []
  },
  {
    name: "deleteChatStickerSet",
    category: "chat",
    description: "Delete group sticker set",
    keywords: ["delete", "remove", "sticker", "group"],
    required: ["chat_id"],
    optional: []
  },
  {
    name: "createChatSubscriptionInviteLink",
    category: "chat",
    description: "Create paid subscription link",
    keywords: ["create", "subscription", "invite", "paid", "premium"],
    required: ["chat_id", "subscription_period", "subscription_price"],
    optional: ["name"]
  },
  {
    name: "editChatSubscriptionInviteLink",
    category: "chat",
    description: "Edit subscription link",
    keywords: ["edit", "subscription", "invite", "link"],
    required: ["chat_id", "invite_link"],
    optional: ["name"]
  },

  // ==========================================================================
  // EDITING (9 tools)
  // ==========================================================================
  {
    name: "editMessageText",
    category: "editing",
    description: "Edit text message",
    keywords: ["edit", "text", "message", "modify", "update"],
    required: ["text"],
    optional: ["chat_id", "message_id", "inline_message_id", "parse_mode", "reply_markup"]
  },
  {
    name: "editMessageCaption",
    category: "editing",
    description: "Edit message caption",
    keywords: ["edit", "caption", "message", "media"],
    required: [],
    optional: ["chat_id", "message_id", "inline_message_id", "caption", "parse_mode"]
  },
  {
    name: "editMessageMedia",
    category: "editing",
    description: "Edit message media content",
    keywords: ["edit", "media", "photo", "video", "document"],
    required: ["media"],
    optional: ["chat_id", "message_id", "inline_message_id", "reply_markup"]
  },
  {
    name: "editMessageReplyMarkup",
    category: "editing",
    description: "Edit message inline keyboard",
    keywords: ["edit", "keyboard", "buttons", "markup", "inline"],
    required: [],
    optional: ["chat_id", "message_id", "inline_message_id", "reply_markup"]
  },
  {
    name: "editMessageLiveLocation",
    category: "editing",
    description: "Edit live location message",
    keywords: ["edit", "location", "live", "gps", "position"],
    required: ["latitude", "longitude"],
    optional: ["chat_id", "message_id", "inline_message_id", "horizontal_accuracy"]
  },
  {
    name: "stopMessageLiveLocation",
    category: "editing",
    description: "Stop live location updates",
    keywords: ["stop", "location", "live", "end"],
    required: [],
    optional: ["chat_id", "message_id", "inline_message_id", "reply_markup"]
  },
  {
    name: "stopPoll",
    category: "editing",
    description: "Stop poll and show results",
    keywords: ["stop", "poll", "end", "close", "results"],
    required: ["chat_id", "message_id"],
    optional: ["reply_markup"]
  },
  {
    name: "deleteMessage",
    category: "editing",
    description: "Delete a message",
    keywords: ["delete", "remove", "message", "erase"],
    required: ["chat_id", "message_id"],
    optional: []
  },
  {
    name: "deleteMessages",
    category: "editing",
    description: "Delete multiple messages",
    keywords: ["delete", "remove", "messages", "bulk", "multiple"],
    required: ["chat_id", "message_ids"],
    optional: []
  },

  // ==========================================================================
  // UPDATES (4 tools)
  // ==========================================================================
  {
    name: "getUpdates",
    category: "updates",
    description: "Get incoming updates via polling",
    keywords: ["get", "updates", "messages", "poll", "receive"],
    required: [],
    optional: ["offset", "limit", "timeout", "allowed_updates"]
  },
  {
    name: "setWebhook",
    category: "updates",
    description: "Set webhook URL for updates",
    keywords: ["set", "webhook", "url", "callback", "https"],
    required: ["url"],
    optional: ["certificate", "ip_address", "max_connections", "allowed_updates", "drop_pending_updates", "secret_token"]
  },
  {
    name: "deleteWebhook",
    category: "updates",
    description: "Remove webhook integration",
    keywords: ["delete", "remove", "webhook", "disable"],
    required: [],
    optional: ["drop_pending_updates"]
  },
  {
    name: "getWebhookInfo",
    category: "updates",
    description: "Get current webhook status",
    keywords: ["get", "webhook", "info", "status"],
    required: [],
    optional: []
  },

  // ==========================================================================
  // BOT (3 tools)
  // ==========================================================================
  {
    name: "getMe",
    category: "bot",
    description: "Get bot information",
    keywords: ["get", "me", "bot", "info", "self"],
    required: [],
    optional: []
  },
  {
    name: "logOut",
    category: "bot",
    description: "Log out from cloud API",
    keywords: ["logout", "disconnect", "cloud"],
    required: [],
    optional: []
  },
  {
    name: "close",
    category: "bot",
    description: "Close bot instance",
    keywords: ["close", "shutdown", "stop"],
    required: [],
    optional: []
  },

  // ==========================================================================
  // SETTINGS (16 tools)
  // ==========================================================================
  {
    name: "setMyCommands",
    category: "settings",
    description: "Set bot command list",
    keywords: ["set", "commands", "menu", "list"],
    required: ["commands"],
    optional: ["scope", "language_code"]
  },
  {
    name: "getMyCommands",
    category: "settings",
    description: "Get bot command list",
    keywords: ["get", "commands", "menu", "list"],
    required: [],
    optional: ["scope", "language_code"]
  },
  {
    name: "deleteMyCommands",
    category: "settings",
    description: "Delete bot commands",
    keywords: ["delete", "commands", "remove", "clear"],
    required: [],
    optional: ["scope", "language_code"]
  },
  {
    name: "setMyName",
    category: "settings",
    description: "Set bot display name",
    keywords: ["set", "name", "bot", "display"],
    required: [],
    optional: ["name", "language_code"]
  },
  {
    name: "getMyName",
    category: "settings",
    description: "Get bot display name",
    keywords: ["get", "name", "bot"],
    required: [],
    optional: ["language_code"]
  },
  {
    name: "setMyDescription",
    category: "settings",
    description: "Set bot description",
    keywords: ["set", "description", "about", "bio"],
    required: [],
    optional: ["description", "language_code"]
  },
  {
    name: "getMyDescription",
    category: "settings",
    description: "Get bot description",
    keywords: ["get", "description", "about"],
    required: [],
    optional: ["language_code"]
  },
  {
    name: "setMyShortDescription",
    category: "settings",
    description: "Set bot short description",
    keywords: ["set", "short", "description", "tagline"],
    required: [],
    optional: ["short_description", "language_code"]
  },
  {
    name: "getMyShortDescription",
    category: "settings",
    description: "Get bot short description",
    keywords: ["get", "short", "description"],
    required: [],
    optional: ["language_code"]
  },
  {
    name: "setChatMenuButton",
    category: "settings",
    description: "Set chat menu button",
    keywords: ["set", "menu", "button", "webapp"],
    required: [],
    optional: ["chat_id", "menu_button"]
  },
  {
    name: "getChatMenuButton",
    category: "settings",
    description: "Get chat menu button",
    keywords: ["get", "menu", "button"],
    required: [],
    optional: ["chat_id"]
  },
  {
    name: "setMyDefaultAdministratorRights",
    category: "settings",
    description: "Set default admin rights",
    keywords: ["set", "admin", "rights", "default", "permissions"],
    required: [],
    optional: ["rights", "for_channels"]
  },
  {
    name: "getMyDefaultAdministratorRights",
    category: "settings",
    description: "Get default admin rights",
    keywords: ["get", "admin", "rights", "default"],
    required: [],
    optional: ["for_channels"]
  },
  {
    name: "getUserProfilePhotos",
    category: "settings",
    description: "Get user profile photos",
    keywords: ["get", "user", "profile", "photos", "avatar"],
    required: ["user_id"],
    optional: ["offset", "limit"]
  },
  {
    name: "getFile",
    category: "settings",
    description: "Get file download info",
    keywords: ["get", "file", "download", "path"],
    required: ["file_id"],
    optional: []
  },
  {
    name: "setUserEmojiStatus",
    category: "settings",
    description: "Set user emoji status",
    keywords: ["set", "emoji", "status", "user"],
    required: ["user_id"],
    optional: ["emoji_status_custom_emoji_id", "emoji_status_expiration_date"]
  },

  // ==========================================================================
  // INLINE & CALLBACKS (6 tools)
  // ==========================================================================
  {
    name: "answerInlineQuery",
    category: "inline",
    description: "Answer inline query",
    keywords: ["answer", "inline", "query", "results"],
    required: ["inline_query_id", "results"],
    optional: ["cache_time", "is_personal", "next_offset", "button"]
  },
  {
    name: "answerCallbackQuery",
    category: "inline",
    description: "Answer callback button click",
    keywords: ["answer", "callback", "button", "click", "alert"],
    required: ["callback_query_id"],
    optional: ["text", "show_alert", "url", "cache_time"]
  },
  {
    name: "answerWebAppQuery",
    category: "inline",
    description: "Answer Web App query",
    keywords: ["answer", "webapp", "query", "mini", "app"],
    required: ["web_app_query_id", "result"],
    optional: []
  },
  {
    name: "savePreparedInlineMessage",
    category: "inline",
    description: "Save prepared inline message",
    keywords: ["save", "prepared", "inline", "message"],
    required: ["user_id", "result"],
    optional: ["allow_user_chats", "allow_bot_chats", "allow_group_chats", "allow_channel_chats"]
  },
  {
    name: "setMessageReaction",
    category: "inline",
    description: "Set message reaction emoji",
    keywords: ["set", "reaction", "emoji", "like"],
    required: ["chat_id", "message_id"],
    optional: ["reaction", "is_big"]
  },
  {
    name: "getUserChatBoosts",
    category: "inline",
    description: "Get user's chat boosts",
    keywords: ["get", "boost", "user", "premium"],
    required: ["chat_id", "user_id"],
    optional: []
  },

  // ==========================================================================
  // FORUM (13 tools)
  // ==========================================================================
  {
    name: "getForumTopicIconStickers",
    category: "forum",
    description: "Get forum topic icon stickers",
    keywords: ["get", "forum", "topic", "icon", "sticker"],
    required: [],
    optional: []
  },
  {
    name: "createForumTopic",
    category: "forum",
    description: "Create forum topic",
    keywords: ["create", "forum", "topic", "thread"],
    required: ["chat_id", "name"],
    optional: ["icon_color", "icon_custom_emoji_id"]
  },
  {
    name: "editForumTopic",
    category: "forum",
    description: "Edit forum topic",
    keywords: ["edit", "forum", "topic", "modify"],
    required: ["chat_id", "message_thread_id"],
    optional: ["name", "icon_custom_emoji_id"]
  },
  {
    name: "closeForumTopic",
    category: "forum",
    description: "Close forum topic",
    keywords: ["close", "forum", "topic", "lock"],
    required: ["chat_id", "message_thread_id"],
    optional: []
  },
  {
    name: "reopenForumTopic",
    category: "forum",
    description: "Reopen forum topic",
    keywords: ["reopen", "forum", "topic", "unlock"],
    required: ["chat_id", "message_thread_id"],
    optional: []
  },
  {
    name: "deleteForumTopic",
    category: "forum",
    description: "Delete forum topic",
    keywords: ["delete", "forum", "topic", "remove"],
    required: ["chat_id", "message_thread_id"],
    optional: []
  },
  {
    name: "unpinAllForumTopicMessages",
    category: "forum",
    description: "Unpin all topic messages",
    keywords: ["unpin", "forum", "topic", "messages"],
    required: ["chat_id", "message_thread_id"],
    optional: []
  },
  {
    name: "editGeneralForumTopic",
    category: "forum",
    description: "Edit General topic name",
    keywords: ["edit", "general", "forum", "topic"],
    required: ["chat_id", "name"],
    optional: []
  },
  {
    name: "closeGeneralForumTopic",
    category: "forum",
    description: "Close General topic",
    keywords: ["close", "general", "forum", "topic"],
    required: ["chat_id"],
    optional: []
  },
  {
    name: "reopenGeneralForumTopic",
    category: "forum",
    description: "Reopen General topic",
    keywords: ["reopen", "general", "forum", "topic"],
    required: ["chat_id"],
    optional: []
  },
  {
    name: "hideGeneralForumTopic",
    category: "forum",
    description: "Hide General topic",
    keywords: ["hide", "general", "forum", "topic"],
    required: ["chat_id"],
    optional: []
  },
  {
    name: "unhideGeneralForumTopic",
    category: "forum",
    description: "Unhide General topic",
    keywords: ["unhide", "show", "general", "forum", "topic"],
    required: ["chat_id"],
    optional: []
  },
  {
    name: "unpinAllGeneralForumTopicMessages",
    category: "forum",
    description: "Unpin all General topic messages",
    keywords: ["unpin", "general", "forum", "messages"],
    required: ["chat_id"],
    optional: []
  },

  // ==========================================================================
  // STICKERS (15 tools - sendSticker already in messages)
  // ==========================================================================
  {
    name: "getStickerSet",
    category: "stickers",
    description: "Get sticker set info",
    keywords: ["get", "sticker", "set", "pack", "info"],
    required: ["name"],
    optional: []
  },
  {
    name: "getCustomEmojiStickers",
    category: "stickers",
    description: "Get custom emoji stickers",
    keywords: ["get", "custom", "emoji", "sticker"],
    required: ["custom_emoji_ids"],
    optional: []
  },
  {
    name: "uploadStickerFile",
    category: "stickers",
    description: "Upload sticker file",
    keywords: ["upload", "sticker", "file"],
    required: ["user_id", "sticker", "sticker_format"],
    optional: []
  },
  {
    name: "createNewStickerSet",
    category: "stickers",
    description: "Create new sticker set",
    keywords: ["create", "sticker", "set", "pack", "new"],
    required: ["user_id", "name", "title", "stickers"],
    optional: ["sticker_type", "needs_repainting"]
  },
  {
    name: "addStickerToSet",
    category: "stickers",
    description: "Add sticker to set",
    keywords: ["add", "sticker", "set", "pack"],
    required: ["user_id", "name", "sticker"],
    optional: []
  },
  {
    name: "setStickerPositionInSet",
    category: "stickers",
    description: "Move sticker position in set",
    keywords: ["set", "sticker", "position", "move", "order"],
    required: ["sticker", "position"],
    optional: []
  },
  {
    name: "deleteStickerFromSet",
    category: "stickers",
    description: "Delete sticker from set",
    keywords: ["delete", "sticker", "remove", "set"],
    required: ["sticker"],
    optional: []
  },
  {
    name: "replaceStickerInSet",
    category: "stickers",
    description: "Replace sticker in set",
    keywords: ["replace", "sticker", "set", "swap"],
    required: ["user_id", "name", "old_sticker", "sticker"],
    optional: []
  },
  {
    name: "setStickerEmojiList",
    category: "stickers",
    description: "Set sticker emoji list",
    keywords: ["set", "sticker", "emoji", "list"],
    required: ["sticker", "emoji_list"],
    optional: []
  },
  {
    name: "setStickerKeywords",
    category: "stickers",
    description: "Set sticker search keywords",
    keywords: ["set", "sticker", "keywords", "search"],
    required: ["sticker"],
    optional: ["keywords"]
  },
  {
    name: "setStickerMaskPosition",
    category: "stickers",
    description: "Set mask sticker position",
    keywords: ["set", "sticker", "mask", "position", "face"],
    required: ["sticker"],
    optional: ["mask_position"]
  },
  {
    name: "setStickerSetTitle",
    category: "stickers",
    description: "Set sticker set title",
    keywords: ["set", "sticker", "title", "name"],
    required: ["name", "title"],
    optional: []
  },
  {
    name: "setStickerSetThumbnail",
    category: "stickers",
    description: "Set sticker set thumbnail",
    keywords: ["set", "sticker", "thumbnail", "image"],
    required: ["name", "user_id", "format"],
    optional: ["thumbnail"]
  },
  {
    name: "setCustomEmojiStickerSetThumbnail",
    category: "stickers",
    description: "Set custom emoji set thumbnail",
    keywords: ["set", "custom", "emoji", "thumbnail"],
    required: ["name"],
    optional: ["custom_emoji_id"]
  },
  {
    name: "deleteStickerSet",
    category: "stickers",
    description: "Delete entire sticker set",
    keywords: ["delete", "sticker", "set", "pack", "remove"],
    required: ["name"],
    optional: []
  },

  // ==========================================================================
  // PAYMENTS (8 tools)
  // ==========================================================================
  {
    name: "sendInvoice",
    category: "payments",
    description: "Send payment invoice",
    keywords: ["send", "invoice", "payment", "buy", "purchase", "stars"],
    required: ["chat_id", "title", "description", "payload", "currency", "prices"],
    optional: ["provider_token", "max_tip_amount", "suggested_tip_amounts", "photo_url", "need_name", "need_phone_number", "need_email", "need_shipping_address", "is_flexible"]
  },
  {
    name: "createInvoiceLink",
    category: "payments",
    description: "Create invoice link",
    keywords: ["create", "invoice", "link", "payment", "url"],
    required: ["title", "description", "payload", "currency", "prices"],
    optional: ["provider_token", "subscription_period"]
  },
  {
    name: "answerShippingQuery",
    category: "payments",
    description: "Answer shipping query",
    keywords: ["answer", "shipping", "query", "delivery"],
    required: ["shipping_query_id", "ok"],
    optional: ["shipping_options", "error_message"]
  },
  {
    name: "answerPreCheckoutQuery",
    category: "payments",
    description: "Answer pre-checkout query",
    keywords: ["answer", "checkout", "query", "confirm"],
    required: ["pre_checkout_query_id", "ok"],
    optional: ["error_message"]
  },
  {
    name: "getStarTransactions",
    category: "payments",
    description: "Get Telegram Stars transactions",
    keywords: ["get", "stars", "transactions", "payments", "history"],
    required: [],
    optional: ["offset", "limit"]
  },
  {
    name: "refundStarPayment",
    category: "payments",
    description: "Refund Telegram Stars payment",
    keywords: ["refund", "stars", "payment", "return"],
    required: ["user_id", "telegram_payment_charge_id"],
    optional: []
  },
  {
    name: "editUserStarSubscription",
    category: "payments",
    description: "Edit user star subscription",
    keywords: ["edit", "subscription", "stars", "cancel"],
    required: ["user_id", "telegram_payment_charge_id", "is_canceled"],
    optional: []
  },
  {
    name: "getMyStarBalance",
    category: "payments",
    description: "Get bot's star balance",
    keywords: ["get", "stars", "balance", "amount"],
    required: [],
    optional: []
  },

  // ==========================================================================
  // GAMES (3 tools)
  // ==========================================================================
  {
    name: "sendGame",
    category: "games",
    description: "Send game",
    keywords: ["send", "game", "play"],
    required: ["chat_id", "game_short_name"],
    optional: ["disable_notification", "reply_parameters", "reply_markup"]
  },
  {
    name: "setGameScore",
    category: "games",
    description: "Set game high score",
    keywords: ["set", "game", "score", "points", "high"],
    required: ["user_id", "score"],
    optional: ["chat_id", "message_id", "inline_message_id", "force", "disable_edit_message"]
  },
  {
    name: "getGameHighScores",
    category: "games",
    description: "Get game high scores",
    keywords: ["get", "game", "scores", "leaderboard", "high"],
    required: ["user_id"],
    optional: ["chat_id", "message_id", "inline_message_id"]
  },

  // ==========================================================================
  // GIFTS (9 tools)
  // ==========================================================================
  {
    name: "getAvailableGifts",
    category: "gifts",
    description: "Get available gifts list",
    keywords: ["get", "gifts", "available", "list"],
    required: [],
    optional: []
  },
  {
    name: "sendGift",
    category: "gifts",
    description: "Send gift to user",
    keywords: ["send", "gift", "present", "stars"],
    required: ["gift_id"],
    optional: ["user_id", "chat_id", "text", "text_parse_mode", "pay_for_upgrade"]
  },
  {
    name: "giftPremiumSubscription",
    category: "gifts",
    description: "Gift Telegram Premium",
    keywords: ["gift", "premium", "subscription", "upgrade"],
    required: ["user_id", "month_count", "star_count"],
    optional: ["text", "text_parse_mode"]
  },
  {
    name: "getUserGifts",
    category: "gifts",
    description: "Get user's received gifts",
    keywords: ["get", "user", "gifts", "received"],
    required: ["user_id"],
    optional: ["offset", "limit"]
  },
  {
    name: "getChatGifts",
    category: "gifts",
    description: "Get chat's received gifts",
    keywords: ["get", "chat", "gifts", "received"],
    required: ["chat_id"],
    optional: ["offset", "limit"]
  },
  {
    name: "getBusinessAccountGifts",
    category: "gifts",
    description: "Get business account gifts",
    keywords: ["get", "business", "gifts", "account"],
    required: ["business_connection_id"],
    optional: ["offset", "limit"]
  },
  {
    name: "convertGiftToStars",
    category: "gifts",
    description: "Convert gift to Stars",
    keywords: ["convert", "gift", "stars", "exchange"],
    required: ["business_connection_id", "owned_gift_id"],
    optional: []
  },
  {
    name: "upgradeGift",
    category: "gifts",
    description: "Upgrade gift to unique",
    keywords: ["upgrade", "gift", "unique", "premium"],
    required: ["business_connection_id", "owned_gift_id"],
    optional: ["keep_original_details", "star_count"]
  },
  {
    name: "transferGift",
    category: "gifts",
    description: "Transfer gift to another user",
    keywords: ["transfer", "gift", "send", "move"],
    required: ["business_connection_id", "owned_gift_id", "new_owner_chat_id"],
    optional: ["star_count"]
  },

  // ==========================================================================
  // VERIFICATION (4 tools)
  // ==========================================================================
  {
    name: "verifyUser",
    category: "verification",
    description: "Verify user account",
    keywords: ["verify", "user", "badge", "checkmark"],
    required: ["user_id"],
    optional: ["custom_description"]
  },
  {
    name: "verifyChat",
    category: "verification",
    description: "Verify chat/channel",
    keywords: ["verify", "chat", "channel", "badge"],
    required: ["chat_id"],
    optional: ["custom_description"]
  },
  {
    name: "removeUserVerification",
    category: "verification",
    description: "Remove user verification",
    keywords: ["remove", "verify", "user", "badge"],
    required: ["user_id"],
    optional: []
  },
  {
    name: "removeChatVerification",
    category: "verification",
    description: "Remove chat verification",
    keywords: ["remove", "verify", "chat", "badge"],
    required: ["chat_id"],
    optional: []
  },

  // ==========================================================================
  // PASSPORT (1 tool)
  // ==========================================================================
  {
    name: "setPassportDataErrors",
    category: "passport",
    description: "Set Passport data errors",
    keywords: ["set", "passport", "error", "data", "identity"],
    required: ["user_id", "errors"],
    optional: []
  },

  // ==========================================================================
  // BUSINESS (16 tools)
  // ==========================================================================
  {
    name: "getBusinessConnection",
    category: "business",
    description: "Get business connection info",
    keywords: ["get", "business", "connection", "info"],
    required: ["business_connection_id"],
    optional: []
  },
  {
    name: "readBusinessMessage",
    category: "business",
    description: "Mark business message as read",
    keywords: ["read", "business", "message", "mark"],
    required: ["business_connection_id", "chat_id", "message_id"],
    optional: []
  },
  {
    name: "deleteBusinessMessages",
    category: "business",
    description: "Delete business messages",
    keywords: ["delete", "business", "messages"],
    required: ["business_connection_id", "message_ids"],
    optional: []
  },
  {
    name: "setBusinessAccountName",
    category: "business",
    description: "Set business account name",
    keywords: ["set", "business", "name", "account"],
    required: ["business_connection_id", "first_name"],
    optional: ["last_name"]
  },
  {
    name: "setBusinessAccountUsername",
    category: "business",
    description: "Set business username",
    keywords: ["set", "business", "username", "account"],
    required: ["business_connection_id"],
    optional: ["username"]
  },
  {
    name: "setBusinessAccountBio",
    category: "business",
    description: "Set business bio",
    keywords: ["set", "business", "bio", "description"],
    required: ["business_connection_id"],
    optional: ["bio"]
  },
  {
    name: "setBusinessAccountProfilePhoto",
    category: "business",
    description: "Set business profile photo",
    keywords: ["set", "business", "photo", "avatar", "profile"],
    required: ["business_connection_id", "photo"],
    optional: ["is_public"]
  },
  {
    name: "removeBusinessAccountProfilePhoto",
    category: "business",
    description: "Remove business profile photo",
    keywords: ["remove", "business", "photo", "avatar"],
    required: ["business_connection_id"],
    optional: ["is_public"]
  },
  {
    name: "setBusinessAccountGiftSettings",
    category: "business",
    description: "Set business gift settings",
    keywords: ["set", "business", "gift", "settings"],
    required: ["business_connection_id", "show_gift_button", "accepted_gift_types"],
    optional: []
  },
  {
    name: "getBusinessAccountStarBalance",
    category: "business",
    description: "Get business star balance",
    keywords: ["get", "business", "stars", "balance"],
    required: ["business_connection_id"],
    optional: []
  },
  {
    name: "transferBusinessAccountStars",
    category: "business",
    description: "Transfer business stars",
    keywords: ["transfer", "business", "stars", "send"],
    required: ["business_connection_id", "star_count"],
    optional: []
  },
  {
    name: "postStory",
    category: "business",
    description: "Post story to business account",
    keywords: ["post", "story", "business", "content"],
    required: ["business_connection_id", "content", "active_period"],
    optional: ["caption", "areas", "post_to_chat_page", "protect_content"]
  },
  {
    name: "editStory",
    category: "business",
    description: "Edit posted story",
    keywords: ["edit", "story", "modify", "update"],
    required: ["business_connection_id", "story_id", "content"],
    optional: ["caption", "areas"]
  },
  {
    name: "deleteStory",
    category: "business",
    description: "Delete posted story",
    keywords: ["delete", "story", "remove"],
    required: ["business_connection_id", "story_id"],
    optional: []
  },
  {
    name: "repostStory",
    category: "business",
    description: "Repost story",
    keywords: ["repost", "story", "share"],
    required: ["business_connection_id", "from_chat_id", "from_story_id", "active_period"],
    optional: ["post_to_chat_page", "protect_content"]
  },
  {
    name: "approveSuggestedPost",
    category: "business",
    description: "Approve suggested post",
    keywords: ["approve", "suggested", "post", "accept"],
    required: ["chat_id", "message_id"],
    optional: ["send_date"]
  },
  {
    name: "declineSuggestedPost",
    category: "business",
    description: "Decline suggested post",
    keywords: ["decline", "suggested", "post", "reject"],
    required: ["chat_id", "message_id"],
    optional: ["comment"]
  },
];

// ==========================================================================
// SEARCH FUNCTIONS
// ==========================================================================

/**
 * Search tools by query string
 * Uses keyword matching with scoring
 */
export function searchTools(query: string, limit: number = 5): ToolEntry[] {
  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 1);

  const scored = toolRegistry.map(tool => {
    let score = 0;

    // Check keywords
    for (const word of queryWords) {
      for (const keyword of tool.keywords) {
        if (keyword === word) {
          score += 10; // Exact match
        } else if (keyword.includes(word) || word.includes(keyword)) {
          score += 5; // Partial match
        }
      }

      // Check name
      if (tool.name.toLowerCase().includes(word)) {
        score += 8;
      }

      // Check description
      if (tool.description.toLowerCase().includes(word)) {
        score += 3;
      }

      // Check category
      if (tool.category.includes(word)) {
        score += 4;
      }
    }

    return { tool, score };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => s.tool);
}

/**
 * Get tools by category
 */
export function getToolsByCategory(category: string): ToolEntry[] {
  return toolRegistry.filter(t => t.category === category);
}

/**
 * Get all categories
 */
export function getCategories(): string[] {
  return [...new Set(toolRegistry.map(t => t.category))];
}

/**
 * Get tool by name
 */
export function getToolByName(name: string): ToolEntry | undefined {
  return toolRegistry.find(t => t.name === name);
}
