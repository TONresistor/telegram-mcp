/**
 * Sending Messages - Category 3
 *
 * Methods (22):
 * - sendMessage
 * - forwardMessage
 * - forwardMessages
 * - copyMessage
 * - copyMessages
 * - sendPhoto
 * - sendAudio
 * - sendDocument
 * - sendVideo
 * - sendAnimation
 * - sendVoice
 * - sendVideoNote
 * - sendPaidMedia
 * - sendMediaGroup
 * - sendLocation
 * - sendVenue
 * - sendContact
 * - sendPoll
 * - sendChecklist
 * - sendDice
 * - sendMessageDraft
 * - sendChatAction
 */

import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { callTelegramAPI, createToolResult } from "../telegram-api.js";

// =============================================================================
// TOOL DEFINITIONS
// =============================================================================

export const messageTools: Tool[] = [
  // ===========================================================================
  // sendMessage
  // ===========================================================================
  {
    name: "sendMessage",
    description:
      "Send text messages to a chat. Supports formatting, reply markup, and various message options. Returns the sent Message on success.",
    inputSchema: {
      type: "object",
      properties: {
        business_connection_id: {
          type: "string",
          description:
            "Unique identifier of the business connection on behalf of which the message will be sent.",
        },
        chat_id: {
          type: ["string", "integer"],
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
            "Unique identifier for the target direct messages topic; for bots only.",
        },
        text: {
          type: "string",
          description:
            "Text of the message to be sent, 1-4096 characters after entities parsing.",
        },
        parse_mode: {
          type: "string",
          description:
            "Mode for parsing entities in the message text. See formatting options for more details. Supported: 'Markdown', 'MarkdownV2', 'HTML'.",
        },
        entities: {
          type: "array",
          description:
            "A JSON-serialized list of special entities that appear in message text, which can be specified instead of parse_mode.",
          items: {
            type: "object",
          },
        },
        link_preview_options: {
          type: "object",
          description:
            "Link preview generation options for the message. Object with fields: is_disabled, url, prefer_small_media, prefer_large_media, show_above_text.",
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
        suggested_post_parameters: {
          type: "object",
          description:
            "Information about suggested post parameters; for channel chats only.",
        },
        reply_parameters: {
          type: "object",
          description:
            "Description of the message to reply to. Object with fields: message_id (required), chat_id, allow_sending_without_reply, quote, quote_parse_mode, quote_entities, quote_position.",
        },
        reply_markup: {
          type: "object",
          description:
            "Additional interface options. A JSON-serialized object for an inline keyboard, custom reply keyboard, instructions to remove a reply keyboard or to force a reply from the user.",
        },
      },
      required: ["chat_id", "text"],
    },
  },

  // ===========================================================================
  // forwardMessage
  // ===========================================================================
  {
    name: "forwardMessage",
    description:
      "Forward messages of any kind. Service messages and messages with protected content can't be forwarded. Returns the sent Message on success.",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["string", "integer"],
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
            "Unique identifier for the target direct messages topic; for bots only.",
        },
        from_chat_id: {
          type: ["string", "integer"],
          description:
            "Unique identifier for the chat where the original message was sent (or channel username in the format @channelusername).",
        },
        message_id: {
          type: "integer",
          description: "Message identifier in the chat specified in from_chat_id.",
        },
        video_start_timestamp: {
          type: "integer",
          description:
            "New start timestamp for the forwarded video in the message, in seconds.",
        },
        disable_notification: {
          type: "boolean",
          description:
            "Sends the message silently. Users will receive a notification with no sound.",
        },
        protect_content: {
          type: "boolean",
          description:
            "Protects the contents of the forwarded message from forwarding and saving.",
        },
        message_effect_id: {
          type: "string",
          description:
            "Unique identifier of the message effect to be added to the message; for private chats only.",
        },
        suggested_post_parameters: {
          type: "object",
          description:
            "Information about suggested post parameters; for channel chats only.",
        },
      },
      required: ["chat_id", "from_chat_id", "message_id"],
    },
  },

  // ===========================================================================
  // forwardMessages
  // ===========================================================================
  {
    name: "forwardMessages",
    description:
      "Forward multiple messages of any kind. If some of the specified messages can't be found or forwarded, they are skipped. Service messages and messages with protected content can't be forwarded. Album grouping is kept for forwarded messages. Returns an array of MessageId of the sent messages on success.",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["string", "integer"],
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
            "Unique identifier for the target direct messages topic; for bots only.",
        },
        from_chat_id: {
          type: ["string", "integer"],
          description:
            "Unique identifier for the chat where the original messages were sent (or channel username in the format @channelusername).",
        },
        message_ids: {
          type: "array",
          description:
            "A JSON-serialized list of 1-100 identifiers of messages in the chat from_chat_id to forward. The identifiers must be specified in a strictly increasing order.",
          items: {
            type: "integer",
          },
        },
        disable_notification: {
          type: "boolean",
          description:
            "Sends the messages silently. Users will receive a notification with no sound.",
        },
        protect_content: {
          type: "boolean",
          description:
            "Protects the contents of the forwarded messages from forwarding and saving.",
        },
      },
      required: ["chat_id", "from_chat_id", "message_ids"],
    },
  },

  // ===========================================================================
  // copyMessage
  // ===========================================================================
  {
    name: "copyMessage",
    description:
      "Copy messages of any kind. Service messages, paid media messages, giveaway messages, giveaway winners messages, and invoice messages can't be copied. A quiz poll can be copied only if the value of the field correct_option_id is known to the bot. The method is analogous to the method forwardMessage, but the copied message doesn't have a link to the original message. Returns the MessageId of the sent message on success.",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["string", "integer"],
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
            "Unique identifier for the target direct messages topic; for bots only.",
        },
        from_chat_id: {
          type: ["string", "integer"],
          description:
            "Unique identifier for the chat where the original message was sent (or channel username in the format @channelusername).",
        },
        message_id: {
          type: "integer",
          description: "Message identifier in the chat specified in from_chat_id.",
        },
        video_start_timestamp: {
          type: "integer",
          description:
            "New start timestamp for the copied video in the message, in seconds.",
        },
        caption: {
          type: "string",
          description:
            "New caption for media, 0-1024 characters after entities parsing. If not specified, the original caption is kept.",
        },
        parse_mode: {
          type: "string",
          description:
            "Mode for parsing entities in the new caption. See formatting options for more details.",
        },
        caption_entities: {
          type: "array",
          description:
            "A JSON-serialized list of special entities that appear in the new caption, which can be specified instead of parse_mode.",
          items: {
            type: "object",
          },
        },
        show_caption_above_media: {
          type: "boolean",
          description:
            "Pass True, if the caption must be shown above the message media. Ignored if a new caption isn't specified.",
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
        suggested_post_parameters: {
          type: "object",
          description:
            "Information about suggested post parameters; for channel chats only.",
        },
        reply_parameters: {
          type: "object",
          description:
            "Description of the message to reply to.",
        },
        reply_markup: {
          type: "object",
          description:
            "Additional interface options. A JSON-serialized object for an inline keyboard, custom reply keyboard, instructions to remove a reply keyboard or to force a reply from the user.",
        },
      },
      required: ["chat_id", "from_chat_id", "message_id"],
    },
  },

  // ===========================================================================
  // copyMessages
  // ===========================================================================
  {
    name: "copyMessages",
    description:
      "Copy messages of any kind. If some of the specified messages can't be found or copied, they are skipped. Service messages, paid media messages, giveaway messages, giveaway winners messages, and invoice messages can't be copied. A quiz poll can be copied only if the value of the field correct_option_id is known to the bot. The method is analogous to the method forwardMessages, but the copied messages don't have a link to the original message. Album grouping is kept for copied messages. Returns an array of MessageId of the sent messages on success.",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["string", "integer"],
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
            "Unique identifier for the target direct messages topic; for bots only.",
        },
        from_chat_id: {
          type: ["string", "integer"],
          description:
            "Unique identifier for the chat where the original messages were sent (or channel username in the format @channelusername).",
        },
        message_ids: {
          type: "array",
          description:
            "A JSON-serialized list of 1-100 identifiers of messages in the chat from_chat_id to copy. The identifiers must be specified in a strictly increasing order.",
          items: {
            type: "integer",
          },
        },
        disable_notification: {
          type: "boolean",
          description:
            "Sends the messages silently. Users will receive a notification with no sound.",
        },
        protect_content: {
          type: "boolean",
          description:
            "Protects the contents of the sent messages from forwarding and saving.",
        },
        remove_caption: {
          type: "boolean",
          description:
            "Pass True to copy the messages without their captions.",
        },
      },
      required: ["chat_id", "from_chat_id", "message_ids"],
    },
  },

  // ===========================================================================
  // sendPhoto
  // ===========================================================================
  {
    name: "sendPhoto",
    description:
      "Send photos. On success, the sent Message is returned. Photo must be at most 10 MB in size. The photo's width and height must not exceed 10000 in total. Width and height ratio must be at most 20.",
    inputSchema: {
      type: "object",
      properties: {
        business_connection_id: {
          type: "string",
          description:
            "Unique identifier of the business connection on behalf of which the message will be sent.",
        },
        chat_id: {
          type: ["string", "integer"],
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
            "Unique identifier for the target direct messages topic; for bots only.",
        },
        photo: {
          type: "string",
          description:
            "Photo to send. Pass a file_id as String to send a photo that exists on the Telegram servers (recommended), pass an HTTP URL as a String for Telegram to get a photo from the Internet, or upload a new photo using multipart/form-data.",
        },
        caption: {
          type: "string",
          description:
            "Photo caption (may also be used when resending photos by file_id), 0-1024 characters after entities parsing.",
        },
        parse_mode: {
          type: "string",
          description:
            "Mode for parsing entities in the photo caption. See formatting options for more details.",
        },
        caption_entities: {
          type: "array",
          description:
            "A JSON-serialized list of special entities that appear in the caption, which can be specified instead of parse_mode.",
          items: {
            type: "object",
          },
        },
        show_caption_above_media: {
          type: "boolean",
          description: "Pass True, if the caption must be shown above the message media.",
        },
        has_spoiler: {
          type: "boolean",
          description: "Pass True if the photo needs to be covered with a spoiler animation.",
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
        suggested_post_parameters: {
          type: "object",
          description:
            "Information about suggested post parameters; for channel chats only.",
        },
        reply_parameters: {
          type: "object",
          description: "Description of the message to reply to.",
        },
        reply_markup: {
          type: "object",
          description:
            "Additional interface options. A JSON-serialized object for an inline keyboard, custom reply keyboard, instructions to remove a reply keyboard or to force a reply from the user.",
        },
      },
      required: ["chat_id", "photo"],
    },
  },

  // ===========================================================================
  // sendAudio
  // ===========================================================================
  {
    name: "sendAudio",
    description:
      "Send audio files, if you want Telegram clients to display them in the music player. Your audio must be in the .MP3 or .M4A format. On success, the sent Message is returned. Bots can currently send audio files of up to 50 MB in size. For sending voice messages, use the sendVoice method instead.",
    inputSchema: {
      type: "object",
      properties: {
        business_connection_id: {
          type: "string",
          description:
            "Unique identifier of the business connection on behalf of which the message will be sent.",
        },
        chat_id: {
          type: ["string", "integer"],
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
            "Unique identifier for the target direct messages topic; for bots only.",
        },
        audio: {
          type: "string",
          description:
            "Audio file to send. Pass a file_id as String to send an audio file that exists on the Telegram servers (recommended), pass an HTTP URL as a String for Telegram to get an audio file from the Internet, or upload a new one using multipart/form-data.",
        },
        caption: {
          type: "string",
          description: "Audio caption, 0-1024 characters after entities parsing.",
        },
        parse_mode: {
          type: "string",
          description:
            "Mode for parsing entities in the audio caption. See formatting options for more details.",
        },
        caption_entities: {
          type: "array",
          description:
            "A JSON-serialized list of special entities that appear in the caption, which can be specified instead of parse_mode.",
          items: {
            type: "object",
          },
        },
        duration: {
          type: "integer",
          description: "Duration of the audio in seconds.",
        },
        performer: {
          type: "string",
          description: "Performer of the audio.",
        },
        title: {
          type: "string",
          description: "Track name.",
        },
        thumbnail: {
          type: "string",
          description:
            "Thumbnail of the file sent; can be ignored if thumbnail generation for the file is supported server-side. The thumbnail should be in JPEG format and less than 200 kB in size. A thumbnail's width and height should not exceed 320.",
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
        suggested_post_parameters: {
          type: "object",
          description:
            "Information about suggested post parameters; for channel chats only.",
        },
        reply_parameters: {
          type: "object",
          description: "Description of the message to reply to.",
        },
        reply_markup: {
          type: "object",
          description:
            "Additional interface options. A JSON-serialized object for an inline keyboard, custom reply keyboard, instructions to remove a reply keyboard or to force a reply from the user.",
        },
      },
      required: ["chat_id", "audio"],
    },
  },

  // ===========================================================================
  // sendDocument
  // ===========================================================================
  {
    name: "sendDocument",
    description:
      "Send general files. On success, the sent Message is returned. Bots can currently send files of any type of up to 50 MB in size.",
    inputSchema: {
      type: "object",
      properties: {
        business_connection_id: {
          type: "string",
          description:
            "Unique identifier of the business connection on behalf of which the message will be sent.",
        },
        chat_id: {
          type: ["string", "integer"],
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
            "Unique identifier for the target direct messages topic; for bots only.",
        },
        document: {
          type: "string",
          description:
            "File to send. Pass a file_id as String to send a file that exists on the Telegram servers (recommended), pass an HTTP URL as a String for Telegram to get a file from the Internet, or upload a new one using multipart/form-data.",
        },
        thumbnail: {
          type: "string",
          description:
            "Thumbnail of the file sent; can be ignored if thumbnail generation for the file is supported server-side. The thumbnail should be in JPEG format and less than 200 kB in size. A thumbnail's width and height should not exceed 320.",
        },
        caption: {
          type: "string",
          description:
            "Document caption (may also be used when resending documents by file_id), 0-1024 characters after entities parsing.",
        },
        parse_mode: {
          type: "string",
          description:
            "Mode for parsing entities in the document caption. See formatting options for more details.",
        },
        caption_entities: {
          type: "array",
          description:
            "A JSON-serialized list of special entities that appear in the caption, which can be specified instead of parse_mode.",
          items: {
            type: "object",
          },
        },
        disable_content_type_detection: {
          type: "boolean",
          description:
            "Disables automatic server-side content type detection for files uploaded using multipart/form-data.",
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
        suggested_post_parameters: {
          type: "object",
          description:
            "Information about suggested post parameters; for channel chats only.",
        },
        reply_parameters: {
          type: "object",
          description: "Description of the message to reply to.",
        },
        reply_markup: {
          type: "object",
          description:
            "Additional interface options. A JSON-serialized object for an inline keyboard, custom reply keyboard, instructions to remove a reply keyboard or to force a reply from the user.",
        },
      },
      required: ["chat_id", "document"],
    },
  },

  // ===========================================================================
  // sendVideo
  // ===========================================================================
  {
    name: "sendVideo",
    description:
      "Send video files, Telegram clients support MPEG4 videos (other formats may be sent as Document). On success, the sent Message is returned. Bots can currently send video files of up to 50 MB in size.",
    inputSchema: {
      type: "object",
      properties: {
        business_connection_id: {
          type: "string",
          description:
            "Unique identifier of the business connection on behalf of which the message will be sent.",
        },
        chat_id: {
          type: ["string", "integer"],
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
            "Unique identifier for the target direct messages topic; for bots only.",
        },
        video: {
          type: "string",
          description:
            "Video to send. Pass a file_id as String to send a video that exists on the Telegram servers (recommended), pass an HTTP URL as a String for Telegram to get a video from the Internet, or upload a new video using multipart/form-data.",
        },
        duration: {
          type: "integer",
          description: "Duration of sent video in seconds.",
        },
        width: {
          type: "integer",
          description: "Video width.",
        },
        height: {
          type: "integer",
          description: "Video height.",
        },
        thumbnail: {
          type: "string",
          description:
            "Thumbnail of the file sent; can be ignored if thumbnail generation for the file is supported server-side. The thumbnail should be in JPEG format and less than 200 kB in size. A thumbnail's width and height should not exceed 320.",
        },
        cover: {
          type: "string",
          description:
            "Cover for the video in the message. Pass a file_id to send a file that exists on the Telegram servers (recommended), or pass an HTTP URL for Telegram to get the file from the Internet.",
        },
        start_timestamp: {
          type: "integer",
          description:
            "Start timestamp for the video in the message, in seconds.",
        },
        caption: {
          type: "string",
          description:
            "Video caption (may also be used when resending videos by file_id), 0-1024 characters after entities parsing.",
        },
        parse_mode: {
          type: "string",
          description:
            "Mode for parsing entities in the video caption. See formatting options for more details.",
        },
        caption_entities: {
          type: "array",
          description:
            "A JSON-serialized list of special entities that appear in the caption, which can be specified instead of parse_mode.",
          items: {
            type: "object",
          },
        },
        show_caption_above_media: {
          type: "boolean",
          description: "Pass True, if the caption must be shown above the message media.",
        },
        has_spoiler: {
          type: "boolean",
          description: "Pass True if the video needs to be covered with a spoiler animation.",
        },
        supports_streaming: {
          type: "boolean",
          description: "Pass True if the uploaded video is suitable for streaming.",
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
        suggested_post_parameters: {
          type: "object",
          description:
            "Information about suggested post parameters; for channel chats only.",
        },
        reply_parameters: {
          type: "object",
          description: "Description of the message to reply to.",
        },
        reply_markup: {
          type: "object",
          description:
            "Additional interface options. A JSON-serialized object for an inline keyboard, custom reply keyboard, instructions to remove a reply keyboard or to force a reply from the user.",
        },
      },
      required: ["chat_id", "video"],
    },
  },

  // ===========================================================================
  // sendAnimation
  // ===========================================================================
  {
    name: "sendAnimation",
    description:
      "Send animation files (GIF or H.264/MPEG-4 AVC video without sound). On success, the sent Message is returned. Bots can currently send animation files of up to 50 MB in size.",
    inputSchema: {
      type: "object",
      properties: {
        business_connection_id: {
          type: "string",
          description:
            "Unique identifier of the business connection on behalf of which the message will be sent.",
        },
        chat_id: {
          type: ["string", "integer"],
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
            "Unique identifier for the target direct messages topic; for bots only.",
        },
        animation: {
          type: "string",
          description:
            "Animation to send. Pass a file_id as String to send an animation that exists on the Telegram servers (recommended), pass an HTTP URL as a String for Telegram to get an animation from the Internet, or upload a new animation using multipart/form-data.",
        },
        duration: {
          type: "integer",
          description: "Duration of sent animation in seconds.",
        },
        width: {
          type: "integer",
          description: "Animation width.",
        },
        height: {
          type: "integer",
          description: "Animation height.",
        },
        thumbnail: {
          type: "string",
          description:
            "Thumbnail of the file sent; can be ignored if thumbnail generation for the file is supported server-side. The thumbnail should be in JPEG format and less than 200 kB in size. A thumbnail's width and height should not exceed 320.",
        },
        caption: {
          type: "string",
          description:
            "Animation caption (may also be used when resending animation by file_id), 0-1024 characters after entities parsing.",
        },
        parse_mode: {
          type: "string",
          description:
            "Mode for parsing entities in the animation caption. See formatting options for more details.",
        },
        caption_entities: {
          type: "array",
          description:
            "A JSON-serialized list of special entities that appear in the caption, which can be specified instead of parse_mode.",
          items: {
            type: "object",
          },
        },
        show_caption_above_media: {
          type: "boolean",
          description: "Pass True, if the caption must be shown above the message media.",
        },
        has_spoiler: {
          type: "boolean",
          description:
            "Pass True if the animation needs to be covered with a spoiler animation.",
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
        suggested_post_parameters: {
          type: "object",
          description:
            "Information about suggested post parameters; for channel chats only.",
        },
        reply_parameters: {
          type: "object",
          description: "Description of the message to reply to.",
        },
        reply_markup: {
          type: "object",
          description:
            "Additional interface options. A JSON-serialized object for an inline keyboard, custom reply keyboard, instructions to remove a reply keyboard or to force a reply from the user.",
        },
      },
      required: ["chat_id", "animation"],
    },
  },

  // ===========================================================================
  // sendVoice
  // ===========================================================================
  {
    name: "sendVoice",
    description:
      "Send audio files, if you want Telegram clients to display the file as a playable voice message. For this to work, your audio must be in an .OGG file encoded with OPUS, or in .MP3 format, or in .M4A format. On success, the sent Message is returned. Bots can currently send voice messages of up to 50 MB in size.",
    inputSchema: {
      type: "object",
      properties: {
        business_connection_id: {
          type: "string",
          description:
            "Unique identifier of the business connection on behalf of which the message will be sent.",
        },
        chat_id: {
          type: ["string", "integer"],
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
            "Unique identifier for the target direct messages topic; for bots only.",
        },
        voice: {
          type: "string",
          description:
            "Audio file to send. Pass a file_id as String to send a file that exists on the Telegram servers (recommended), pass an HTTP URL as a String for Telegram to get a file from the Internet, or upload a new one using multipart/form-data.",
        },
        caption: {
          type: "string",
          description: "Voice message caption, 0-1024 characters after entities parsing.",
        },
        parse_mode: {
          type: "string",
          description:
            "Mode for parsing entities in the voice message caption. See formatting options for more details.",
        },
        caption_entities: {
          type: "array",
          description:
            "A JSON-serialized list of special entities that appear in the caption, which can be specified instead of parse_mode.",
          items: {
            type: "object",
          },
        },
        duration: {
          type: "integer",
          description: "Duration of the voice message in seconds.",
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
        suggested_post_parameters: {
          type: "object",
          description:
            "Information about suggested post parameters; for channel chats only.",
        },
        reply_parameters: {
          type: "object",
          description: "Description of the message to reply to.",
        },
        reply_markup: {
          type: "object",
          description:
            "Additional interface options. A JSON-serialized object for an inline keyboard, custom reply keyboard, instructions to remove a reply keyboard or to force a reply from the user.",
        },
      },
      required: ["chat_id", "voice"],
    },
  },

  // ===========================================================================
  // sendVideoNote
  // ===========================================================================
  {
    name: "sendVideoNote",
    description:
      "As of v.4.0, Telegram clients support rounded square MPEG4 videos of up to 1 minute long. Send video messages. On success, the sent Message is returned.",
    inputSchema: {
      type: "object",
      properties: {
        business_connection_id: {
          type: "string",
          description:
            "Unique identifier of the business connection on behalf of which the message will be sent.",
        },
        chat_id: {
          type: ["string", "integer"],
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
            "Unique identifier for the target direct messages topic; for bots only.",
        },
        video_note: {
          type: "string",
          description:
            "Video note to send. Pass a file_id as String to send a video note that exists on the Telegram servers (recommended) or upload a new video using multipart/form-data. Sending video notes by a URL is currently unsupported.",
        },
        duration: {
          type: "integer",
          description: "Duration of sent video in seconds.",
        },
        length: {
          type: "integer",
          description:
            "Video width and height, i.e. diameter of the video message.",
        },
        thumbnail: {
          type: "string",
          description:
            "Thumbnail of the file sent; can be ignored if thumbnail generation for the file is supported server-side. The thumbnail should be in JPEG format and less than 200 kB in size. A thumbnail's width and height should not exceed 320.",
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
        suggested_post_parameters: {
          type: "object",
          description:
            "Information about suggested post parameters; for channel chats only.",
        },
        reply_parameters: {
          type: "object",
          description: "Description of the message to reply to.",
        },
        reply_markup: {
          type: "object",
          description:
            "Additional interface options. A JSON-serialized object for an inline keyboard, custom reply keyboard, instructions to remove a reply keyboard or to force a reply from the user.",
        },
      },
      required: ["chat_id", "video_note"],
    },
  },

  // ===========================================================================
  // sendPaidMedia
  // ===========================================================================
  {
    name: "sendPaidMedia",
    description:
      "Send paid media. On success, the sent Message is returned. Maximum price is 25000 Telegram Stars.",
    inputSchema: {
      type: "object",
      properties: {
        business_connection_id: {
          type: "string",
          description:
            "Unique identifier of the business connection on behalf of which the message will be sent.",
        },
        chat_id: {
          type: ["string", "integer"],
          description:
            "Unique identifier for the target chat or username of the target channel (in the format @channelusername). If the chat is a channel, all Telegram Star proceeds from this media will be credited to the chat's balance. Otherwise, they will be credited to the bot's balance.",
        },
        message_thread_id: {
          type: "integer",
          description:
            "Unique identifier for the target message thread (topic) of the forum; for forum supergroups only.",
        },
        direct_messages_topic_id: {
          type: "integer",
          description:
            "Unique identifier for the target direct messages topic; for bots only.",
        },
        star_count: {
          type: "integer",
          description:
            "The number of Telegram Stars that must be paid to buy access to the media; 1-25000.",
        },
        media: {
          type: "array",
          description:
            "A JSON-serialized array describing the media to be sent; up to 10 items.",
          items: {
            type: "object",
            description:
              "InputPaidMedia object. Can be InputPaidMediaPhoto or InputPaidMediaVideo.",
          },
        },
        payload: {
          type: "string",
          description:
            "Bot-defined paid media payload, 0-128 bytes. This will not be displayed to the user, use it for your internal processes.",
        },
        caption: {
          type: "string",
          description: "Media caption, 0-1024 characters after entities parsing.",
        },
        parse_mode: {
          type: "string",
          description:
            "Mode for parsing entities in the media caption. See formatting options for more details.",
        },
        caption_entities: {
          type: "array",
          description:
            "A JSON-serialized list of special entities that appear in the caption, which can be specified instead of parse_mode.",
          items: {
            type: "object",
          },
        },
        show_caption_above_media: {
          type: "boolean",
          description: "Pass True, if the caption must be shown above the message media.",
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
        suggested_post_parameters: {
          type: "object",
          description:
            "Information about suggested post parameters; for channel chats only.",
        },
        reply_parameters: {
          type: "object",
          description: "Description of the message to reply to.",
        },
        reply_markup: {
          type: "object",
          description:
            "Additional interface options. A JSON-serialized object for an inline keyboard, custom reply keyboard, instructions to remove a reply keyboard or to force a reply from the user.",
        },
      },
      required: ["chat_id", "star_count", "media"],
    },
  },

  // ===========================================================================
  // sendMediaGroup
  // ===========================================================================
  {
    name: "sendMediaGroup",
    description:
      "Send a group of photos, videos, documents or audios as an album. Documents and audio files can be only grouped in an album with messages of the same type. On success, an array of Messages that were sent is returned.",
    inputSchema: {
      type: "object",
      properties: {
        business_connection_id: {
          type: "string",
          description:
            "Unique identifier of the business connection on behalf of which the message will be sent.",
        },
        chat_id: {
          type: ["string", "integer"],
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
            "Unique identifier for the target direct messages topic; for bots only.",
        },
        media: {
          type: "array",
          description:
            "A JSON-serialized array describing messages to be sent, must include 2-10 items. Each item is an InputMediaAudio, InputMediaDocument, InputMediaPhoto and InputMediaVideo.",
          items: {
            type: "object",
          },
        },
        disable_notification: {
          type: "boolean",
          description:
            "Sends messages silently. Users will receive a notification with no sound.",
        },
        protect_content: {
          type: "boolean",
          description:
            "Protects the contents of the sent messages from forwarding and saving.",
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
      },
      required: ["chat_id", "media"],
    },
  },

  // ===========================================================================
  // sendLocation
  // ===========================================================================
  {
    name: "sendLocation",
    description:
      "Send point on the map. On success, the sent Message is returned. Supports live locations that can be edited.",
    inputSchema: {
      type: "object",
      properties: {
        business_connection_id: {
          type: "string",
          description:
            "Unique identifier of the business connection on behalf of which the message will be sent.",
        },
        chat_id: {
          type: ["string", "integer"],
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
            "Unique identifier for the target direct messages topic; for bots only.",
        },
        latitude: {
          type: "number",
          description: "Latitude of the location.",
        },
        longitude: {
          type: "number",
          description: "Longitude of the location.",
        },
        horizontal_accuracy: {
          type: "number",
          description:
            "The radius of uncertainty for the location, measured in meters; 0-1500.",
        },
        live_period: {
          type: "integer",
          description:
            "Period in seconds during which the location will be updated (see Live Locations), should be between 60 and 86400, or 0x7FFFFFFF for live locations that can be edited indefinitely.",
        },
        heading: {
          type: "integer",
          description:
            "For live locations, a direction in which the user is moving, in degrees. Must be between 1 and 360 if specified.",
        },
        proximity_alert_radius: {
          type: "integer",
          description:
            "For live locations, a maximum distance for proximity alerts about approaching another chat member, in meters. Must be between 1 and 100000 if specified.",
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
        suggested_post_parameters: {
          type: "object",
          description:
            "Information about suggested post parameters; for channel chats only.",
        },
        reply_parameters: {
          type: "object",
          description: "Description of the message to reply to.",
        },
        reply_markup: {
          type: "object",
          description:
            "Additional interface options. A JSON-serialized object for an inline keyboard, custom reply keyboard, instructions to remove a reply keyboard or to force a reply from the user.",
        },
      },
      required: ["chat_id", "latitude", "longitude"],
    },
  },

  // ===========================================================================
  // sendVenue
  // ===========================================================================
  {
    name: "sendVenue",
    description:
      "Send information about a venue. On success, the sent Message is returned.",
    inputSchema: {
      type: "object",
      properties: {
        business_connection_id: {
          type: "string",
          description:
            "Unique identifier of the business connection on behalf of which the message will be sent.",
        },
        chat_id: {
          type: ["string", "integer"],
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
            "Unique identifier for the target direct messages topic; for bots only.",
        },
        latitude: {
          type: "number",
          description: "Latitude of the venue.",
        },
        longitude: {
          type: "number",
          description: "Longitude of the venue.",
        },
        title: {
          type: "string",
          description: "Name of the venue.",
        },
        address: {
          type: "string",
          description: "Address of the venue.",
        },
        foursquare_id: {
          type: "string",
          description: "Foursquare identifier of the venue.",
        },
        foursquare_type: {
          type: "string",
          description:
            "Foursquare type of the venue, if known. (For example, 'arts_entertainment/default', 'arts_entertainment/aquarium' or 'food/icecream'.)",
        },
        google_place_id: {
          type: "string",
          description: "Google Places identifier of the venue.",
        },
        google_place_type: {
          type: "string",
          description: "Google Places type of the venue. (See supported types.)",
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
        suggested_post_parameters: {
          type: "object",
          description:
            "Information about suggested post parameters; for channel chats only.",
        },
        reply_parameters: {
          type: "object",
          description: "Description of the message to reply to.",
        },
        reply_markup: {
          type: "object",
          description:
            "Additional interface options. A JSON-serialized object for an inline keyboard, custom reply keyboard, instructions to remove a reply keyboard or to force a reply from the user.",
        },
      },
      required: ["chat_id", "latitude", "longitude", "title", "address"],
    },
  },

  // ===========================================================================
  // sendContact
  // ===========================================================================
  {
    name: "sendContact",
    description:
      "Send phone contacts. On success, the sent Message is returned.",
    inputSchema: {
      type: "object",
      properties: {
        business_connection_id: {
          type: "string",
          description:
            "Unique identifier of the business connection on behalf of which the message will be sent.",
        },
        chat_id: {
          type: ["string", "integer"],
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
            "Unique identifier for the target direct messages topic; for bots only.",
        },
        phone_number: {
          type: "string",
          description: "Contact's phone number.",
        },
        first_name: {
          type: "string",
          description: "Contact's first name.",
        },
        last_name: {
          type: "string",
          description: "Contact's last name.",
        },
        vcard: {
          type: "string",
          description:
            "Additional data about the contact in the form of a vCard, 0-2048 bytes.",
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
        suggested_post_parameters: {
          type: "object",
          description:
            "Information about suggested post parameters; for channel chats only.",
        },
        reply_parameters: {
          type: "object",
          description: "Description of the message to reply to.",
        },
        reply_markup: {
          type: "object",
          description:
            "Additional interface options. A JSON-serialized object for an inline keyboard, custom reply keyboard, instructions to remove a reply keyboard or to force a reply from the user.",
        },
      },
      required: ["chat_id", "phone_number", "first_name"],
    },
  },

  // ===========================================================================
  // sendPoll
  // ===========================================================================
  {
    name: "sendPoll",
    description:
      "Send a native poll. On success, the sent Message is returned. Supports regular polls and quizzes.",
    inputSchema: {
      type: "object",
      properties: {
        business_connection_id: {
          type: "string",
          description:
            "Unique identifier of the business connection on behalf of which the message will be sent.",
        },
        chat_id: {
          type: ["string", "integer"],
          description:
            "Unique identifier for the target chat or username of the target channel (in the format @channelusername).",
        },
        message_thread_id: {
          type: "integer",
          description:
            "Unique identifier for the target message thread (topic) of the forum; for forum supergroups only.",
        },
        question: {
          type: "string",
          description: "Poll question, 1-300 characters.",
        },
        question_parse_mode: {
          type: "string",
          description:
            "Mode for parsing entities in the question. See formatting options for more details. Currently, only custom emoji entities are allowed.",
        },
        question_entities: {
          type: "array",
          description:
            "A JSON-serialized list of special entities that appear in the poll question. It can be specified instead of question_parse_mode.",
          items: {
            type: "object",
          },
        },
        options: {
          type: "array",
          description:
            "A JSON-serialized list of 2-12 answer options. Each option is an InputPollOption object with fields: text (required, 1-100 characters), text_parse_mode, text_entities.",
          items: {
            type: "object",
          },
        },
        is_anonymous: {
          type: "boolean",
          description: "True, if the poll needs to be anonymous, defaults to True.",
        },
        type: {
          type: "string",
          description:
            "Poll type, 'quiz' or 'regular', defaults to 'regular'.",
        },
        allows_multiple_answers: {
          type: "boolean",
          description:
            "True, if the poll allows multiple answers, ignored for polls in quiz mode, defaults to False.",
        },
        correct_option_id: {
          type: "integer",
          description:
            "0-based identifier of the correct answer option, required for polls in quiz mode.",
        },
        explanation: {
          type: "string",
          description:
            "Text that is shown when a user chooses an incorrect answer or taps on the lamp icon in a quiz-style poll, 0-200 characters with at most 2 line feeds after entities parsing.",
        },
        explanation_parse_mode: {
          type: "string",
          description:
            "Mode for parsing entities in the explanation. See formatting options for more details.",
        },
        explanation_entities: {
          type: "array",
          description:
            "A JSON-serialized list of special entities that appear in the poll explanation. It can be specified instead of explanation_parse_mode.",
          items: {
            type: "object",
          },
        },
        open_period: {
          type: "integer",
          description:
            "Amount of time in seconds the poll will be active after creation, 5-600. Can't be used together with close_date.",
        },
        close_date: {
          type: "integer",
          description:
            "Point in time (Unix timestamp) when the poll will be automatically closed. Must be at least 5 and no more than 600 seconds in the future. Can't be used together with open_period.",
        },
        is_closed: {
          type: "boolean",
          description:
            "Pass True if the poll needs to be immediately closed. This can be useful for poll preview.",
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
            "Additional interface options. A JSON-serialized object for an inline keyboard, custom reply keyboard, instructions to remove a reply keyboard or to force a reply from the user.",
        },
      },
      required: ["chat_id", "question", "options"],
    },
  },

  // ===========================================================================
  // sendChecklist
  // ===========================================================================
  {
    name: "sendChecklist",
    description:
      "Send a checklist on behalf of a business account. On success, the sent Message is returned. Available for business accounts only.",
    inputSchema: {
      type: "object",
      properties: {
        business_connection_id: {
          type: "string",
          description:
            "Unique identifier of the business connection on behalf of which the message will be sent.",
        },
        chat_id: {
          type: ["string", "integer"],
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
            "Unique identifier for the target direct messages topic; for bots only.",
        },
        checklist: {
          type: "object",
          description:
            "An InputChecklist object describing the checklist to send. Contains title and tasks array.",
          properties: {
            title: {
              type: "string",
              description: "Title of the checklist.",
            },
            tasks: {
              type: "array",
              description:
                "Array of InputChecklistTask objects representing checklist tasks.",
              items: {
                type: "object",
                properties: {
                  text: {
                    type: "string",
                    description: "Task text.",
                  },
                  is_completed: {
                    type: "boolean",
                    description: "Whether the task is completed.",
                  },
                },
              },
            },
          },
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
            "Additional interface options. A JSON-serialized object for an inline keyboard, custom reply keyboard, instructions to remove a reply keyboard or to force a reply from the user.",
        },
      },
      required: ["business_connection_id", "chat_id", "checklist"],
    },
  },

  // ===========================================================================
  // sendDice
  // ===========================================================================
  {
    name: "sendDice",
    description:
      "Send an animated emoji that will display a random value. On success, the sent Message is returned. Supported emoji: dice, darts, basketball, football, bowling, slot machine.",
    inputSchema: {
      type: "object",
      properties: {
        business_connection_id: {
          type: "string",
          description:
            "Unique identifier of the business connection on behalf of which the message will be sent.",
        },
        chat_id: {
          type: ["string", "integer"],
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
            "Unique identifier for the target direct messages topic; for bots only.",
        },
        emoji: {
          type: "string",
          description:
            "Emoji on which the dice throw animation is based. Currently, must be one of: dice, darts, basketball, football, bowling, or slot_machine. Dice can have values 1-6, darts and bowling 1-6, basketball and football 1-5, slot_machine 1-64. Defaults to dice.",
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
        suggested_post_parameters: {
          type: "object",
          description:
            "Information about suggested post parameters; for channel chats only.",
        },
        reply_parameters: {
          type: "object",
          description: "Description of the message to reply to.",
        },
        reply_markup: {
          type: "object",
          description:
            "Additional interface options. A JSON-serialized object for an inline keyboard, custom reply keyboard, instructions to remove a reply keyboard or to force a reply from the user.",
        },
      },
      required: ["chat_id"],
    },
  },

  // ===========================================================================
  // sendMessageDraft
  // ===========================================================================
  {
    name: "sendMessageDraft",
    description:
      "Stream partial messages to a user while being generated. This is useful for AI-powered bots that want to show responses as they're being created. Allows progressive message delivery during content generation.",
    inputSchema: {
      type: "object",
      properties: {
        business_connection_id: {
          type: "string",
          description:
            "Unique identifier of the business connection on behalf of which the message will be sent.",
        },
        chat_id: {
          type: ["string", "integer"],
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
            "Unique identifier for the target direct messages topic; for bots only.",
        },
        draft_message: {
          type: "object",
          description:
            "The draft message content to stream to the user. Contains text and optional formatting.",
          properties: {
            text: {
              type: "string",
              description: "The partial text of the message being generated.",
            },
            parse_mode: {
              type: "string",
              description: "Mode for parsing entities in the text.",
            },
            entities: {
              type: "array",
              description: "Special entities in the text.",
              items: {
                type: "object",
              },
            },
          },
        },
        reply_parameters: {
          type: "object",
          description: "Description of the message to reply to.",
        },
      },
      required: ["chat_id", "draft_message"],
    },
  },

  // ===========================================================================
  // sendChatAction
  // ===========================================================================
  {
    name: "sendChatAction",
    description:
      "Tell the user that something is happening on the bot's side. The status is set for 5 seconds or less (when a message arrives from your bot, Telegram clients clear its typing status). Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        business_connection_id: {
          type: "string",
          description:
            "Unique identifier of the business connection on behalf of which the action will be sent.",
        },
        chat_id: {
          type: ["string", "integer"],
          description:
            "Unique identifier for the target chat or username of the target supergroup or channel (in the format @channelusername).",
        },
        message_thread_id: {
          type: "integer",
          description:
            "Unique identifier for the target message thread; for supergroups only.",
        },
        action: {
          type: "string",
          description:
            "Type of action to broadcast. Choose one: 'typing' for text messages, 'upload_photo' for photos, 'record_video' or 'upload_video' for videos, 'record_voice' or 'upload_voice' for voice notes, 'upload_document' for general files, 'choose_sticker' for stickers, 'find_location' for location data, 'record_video_note' or 'upload_video_note' for video notes.",
          enum: [
            "typing",
            "upload_photo",
            "record_video",
            "upload_video",
            "record_voice",
            "upload_voice",
            "upload_document",
            "choose_sticker",
            "find_location",
            "record_video_note",
            "upload_video_note",
          ],
        },
      },
      required: ["chat_id", "action"],
    },
  },
];

// =============================================================================
// TOOL HANDLER
// =============================================================================

export async function handleMessageTool(
  name: string,
  args: Record<string, unknown>
) {
  const response = await callTelegramAPI(name, args);
  return createToolResult(response);
}
