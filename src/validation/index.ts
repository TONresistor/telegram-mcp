/**
 * Runtime Input Validation
 *
 * Validates parameters before sending to Telegram API.
 * Uses Zod for schema validation with:
 * - Lazy loading of schemas (only loaded when first used)
 * - Reusable base schemas for common types
 * - Method-specific schemas for priority methods
 * - Lenient mode (.passthrough) for forward compatibility
 * - Clear, actionable error messages
 */

import { z, type ZodType } from "zod";
import { createLogger } from "../logging/index.js";

const logger = createLogger("validation");

// =============================================================================
// LAZY LOADING INFRASTRUCTURE
// =============================================================================

/**
 * Cache for loaded schemas
 */
const schemaCache = new Map<string, ZodType>();

/**
 * Track schema loading for debugging
 */
let schemasLoaded = 0;

// Log startup status
logger.debug("Schemas: 0 loaded (lazy mode)");

// =============================================================================
// BASE TYPE SCHEMAS (loaded lazily via getters)
// =============================================================================

let _chatIdSchema: ZodType | null = null;
function getChatIdSchema(): ZodType {
  if (!_chatIdSchema) {
    _chatIdSchema = z.union([z.number().int(), z.string().min(1)]);
  }
  return _chatIdSchema;
}

let _userIdSchema: ZodType | null = null;
function getUserIdSchema(): ZodType {
  if (!_userIdSchema) {
    _userIdSchema = z.number().int().positive();
  }
  return _userIdSchema;
}

let _messageIdSchema: ZodType | null = null;
function getMessageIdSchema(): ZodType {
  if (!_messageIdSchema) {
    _messageIdSchema = z.number().int();
  }
  return _messageIdSchema;
}

let _messageTextSchema: ZodType | null = null;
function getMessageTextSchema(): ZodType {
  if (!_messageTextSchema) {
    _messageTextSchema = z.string().min(1).max(4096);
  }
  return _messageTextSchema;
}

let _captionSchema: ZodType | null = null;
function getCaptionSchema(): ZodType {
  if (!_captionSchema) {
    _captionSchema = z.string().max(1024).optional();
  }
  return _captionSchema;
}

let _parseModeSchema: ZodType | null = null;
function getParseModeSchema(): ZodType {
  if (!_parseModeSchema) {
    _parseModeSchema = z.enum(["Markdown", "MarkdownV2", "HTML"]).optional();
  }
  return _parseModeSchema;
}

let _booleanSchema: ZodType | null = null;
function getBooleanSchema(): ZodType {
  if (!_booleanSchema) {
    _booleanSchema = z.boolean().optional();
  }
  return _booleanSchema;
}

let _fileSchema: ZodType | null = null;
function getFileSchema(): ZodType {
  if (!_fileSchema) {
    _fileSchema = z.string().min(1);
  }
  return _fileSchema;
}

let _replyMarkupSchema: ZodType | null = null;
function getReplyMarkupSchema(): ZodType {
  if (!_replyMarkupSchema) {
    _replyMarkupSchema = z.object({}).passthrough().optional();
  }
  return _replyMarkupSchema;
}

let _replyParametersSchema: ZodType | null = null;
function getReplyParametersSchema(): ZodType {
  if (!_replyParametersSchema) {
    _replyParametersSchema = z
      .object({
        message_id: getMessageIdSchema(),
        chat_id: getChatIdSchema().optional(),
      })
      .passthrough()
      .optional();
  }
  return _replyParametersSchema;
}

// =============================================================================
// SCHEMA FACTORIES
// =============================================================================

/**
 * Factory functions that create schemas on demand.
 * Each factory is only called once per method, then cached.
 */
const schemaFactories: Record<string, () => ZodType> = {
  // ---------------------------------------------------------------------------
  // Messages
  // ---------------------------------------------------------------------------
  sendMessage: () =>
    z
      .object({
        chat_id: getChatIdSchema(),
        text: getMessageTextSchema(),
        parse_mode: getParseModeSchema(),
        disable_notification: getBooleanSchema(),
        protect_content: getBooleanSchema(),
        reply_parameters: getReplyParametersSchema(),
        reply_markup: getReplyMarkupSchema(),
      })
      .passthrough(),

  sendPhoto: () =>
    z
      .object({
        chat_id: getChatIdSchema(),
        photo: getFileSchema(),
        caption: getCaptionSchema(),
        parse_mode: getParseModeSchema(),
      })
      .passthrough(),

  sendDocument: () =>
    z
      .object({
        chat_id: getChatIdSchema(),
        document: getFileSchema(),
        caption: getCaptionSchema(),
        parse_mode: getParseModeSchema(),
      })
      .passthrough(),

  sendVideo: () =>
    z
      .object({
        chat_id: getChatIdSchema(),
        video: getFileSchema(),
        caption: getCaptionSchema(),
        parse_mode: getParseModeSchema(),
      })
      .passthrough(),

  sendAudio: () =>
    z
      .object({
        chat_id: getChatIdSchema(),
        audio: getFileSchema(),
        caption: getCaptionSchema(),
        parse_mode: getParseModeSchema(),
      })
      .passthrough(),

  sendVoice: () =>
    z
      .object({
        chat_id: getChatIdSchema(),
        voice: getFileSchema(),
        caption: getCaptionSchema(),
        parse_mode: getParseModeSchema(),
      })
      .passthrough(),

  sendAnimation: () =>
    z
      .object({
        chat_id: getChatIdSchema(),
        animation: getFileSchema(),
        caption: getCaptionSchema(),
        parse_mode: getParseModeSchema(),
      })
      .passthrough(),

  sendSticker: () =>
    z
      .object({
        chat_id: getChatIdSchema(),
        sticker: getFileSchema(),
      })
      .passthrough(),

  sendLocation: () =>
    z
      .object({
        chat_id: getChatIdSchema(),
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
      })
      .passthrough(),

  sendContact: () =>
    z
      .object({
        chat_id: getChatIdSchema(),
        phone_number: z.string().min(1),
        first_name: z.string().min(1),
      })
      .passthrough(),

  sendPoll: () =>
    z
      .object({
        chat_id: getChatIdSchema(),
        question: z.string().min(1).max(300),
        options: z.array(z.object({}).passthrough()).min(2).max(10),
      })
      .passthrough(),

  sendDice: () =>
    z
      .object({
        chat_id: getChatIdSchema(),
        emoji: z.string().optional(),
      })
      .passthrough(),

  sendChatAction: () =>
    z
      .object({
        chat_id: getChatIdSchema(),
        action: z.enum([
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
        ]),
      })
      .passthrough(),

  forwardMessage: () =>
    z
      .object({
        chat_id: getChatIdSchema(),
        from_chat_id: getChatIdSchema(),
        message_id: getMessageIdSchema(),
      })
      .passthrough(),

  copyMessage: () =>
    z
      .object({
        chat_id: getChatIdSchema(),
        from_chat_id: getChatIdSchema(),
        message_id: getMessageIdSchema(),
      })
      .passthrough(),

  // ---------------------------------------------------------------------------
  // Editing
  // ---------------------------------------------------------------------------
  editMessageText: () =>
    z
      .object({
        text: getMessageTextSchema(),
        chat_id: getChatIdSchema().optional(),
        message_id: getMessageIdSchema().optional(),
        inline_message_id: z.string().optional(),
        parse_mode: getParseModeSchema(),
      })
      .passthrough()
      .refine(
        (data) => (data.chat_id && data.message_id) || data.inline_message_id,
        {
          message:
            "Either chat_id + message_id OR inline_message_id must be provided",
        }
      ),

  editMessageCaption: () =>
    z
      .object({
        chat_id: getChatIdSchema().optional(),
        message_id: getMessageIdSchema().optional(),
        inline_message_id: z.string().optional(),
        caption: getCaptionSchema(),
      })
      .passthrough(),

  editMessageReplyMarkup: () =>
    z
      .object({
        chat_id: getChatIdSchema().optional(),
        message_id: getMessageIdSchema().optional(),
        inline_message_id: z.string().optional(),
      })
      .passthrough(),

  deleteMessage: () =>
    z
      .object({
        chat_id: getChatIdSchema(),
        message_id: getMessageIdSchema(),
      })
      .passthrough(),

  deleteMessages: () =>
    z
      .object({
        chat_id: getChatIdSchema(),
        message_ids: z.array(getMessageIdSchema()).min(1).max(100),
      })
      .passthrough(),

  // ---------------------------------------------------------------------------
  // Chat Management
  // ---------------------------------------------------------------------------
  getChat: () =>
    z
      .object({
        chat_id: getChatIdSchema(),
      })
      .passthrough(),

  getChatMember: () =>
    z
      .object({
        chat_id: getChatIdSchema(),
        user_id: getUserIdSchema(),
      })
      .passthrough(),

  getChatMemberCount: () =>
    z
      .object({
        chat_id: getChatIdSchema(),
      })
      .passthrough(),

  getChatAdministrators: () =>
    z
      .object({
        chat_id: getChatIdSchema(),
      })
      .passthrough(),

  banChatMember: () =>
    z
      .object({
        chat_id: getChatIdSchema(),
        user_id: getUserIdSchema(),
        until_date: z.number().int().optional(),
        revoke_messages: getBooleanSchema(),
      })
      .passthrough(),

  unbanChatMember: () =>
    z
      .object({
        chat_id: getChatIdSchema(),
        user_id: getUserIdSchema(),
        only_if_banned: getBooleanSchema(),
      })
      .passthrough(),

  restrictChatMember: () =>
    z
      .object({
        chat_id: getChatIdSchema(),
        user_id: getUserIdSchema(),
        permissions: z.object({}).passthrough(),
      })
      .passthrough(),

  promoteChatMember: () =>
    z
      .object({
        chat_id: getChatIdSchema(),
        user_id: getUserIdSchema(),
      })
      .passthrough(),

  setChatTitle: () =>
    z
      .object({
        chat_id: getChatIdSchema(),
        title: z.string().min(1).max(128),
      })
      .passthrough(),

  setChatDescription: () =>
    z
      .object({
        chat_id: getChatIdSchema(),
        description: z.string().max(255).optional(),
      })
      .passthrough(),

  pinChatMessage: () =>
    z
      .object({
        chat_id: getChatIdSchema(),
        message_id: getMessageIdSchema(),
      })
      .passthrough(),

  unpinChatMessage: () =>
    z
      .object({
        chat_id: getChatIdSchema(),
        message_id: getMessageIdSchema().optional(),
      })
      .passthrough(),

  leaveChat: () =>
    z
      .object({
        chat_id: getChatIdSchema(),
      })
      .passthrough(),

  // ---------------------------------------------------------------------------
  // Updates & Bot Info
  // ---------------------------------------------------------------------------
  getUpdates: () =>
    z
      .object({
        offset: z.number().int().optional(),
        limit: z.number().int().min(1).max(100).optional(),
        timeout: z.number().int().min(0).optional(),
        allowed_updates: z.array(z.string()).optional(),
      })
      .passthrough(),

  setWebhook: () =>
    z
      .object({
        url: z.string().url(),
        certificate: z.string().optional(),
        max_connections: z.number().int().min(1).max(100).optional(),
        allowed_updates: z.array(z.string()).optional(),
      })
      .passthrough(),

  deleteWebhook: () =>
    z
      .object({
        drop_pending_updates: getBooleanSchema(),
      })
      .passthrough(),

  // No params required
  getMe: () => z.object({}).passthrough(),
  getWebhookInfo: () => z.object({}).passthrough(),
  logOut: () => z.object({}).passthrough(),
  close: () => z.object({}).passthrough(),

  // ---------------------------------------------------------------------------
  // Inline & Callbacks
  // ---------------------------------------------------------------------------
  answerCallbackQuery: () =>
    z
      .object({
        callback_query_id: z.string().min(1),
        text: z.string().max(200).optional(),
        show_alert: getBooleanSchema(),
        url: z.string().url().optional(),
        cache_time: z.number().int().optional(),
      })
      .passthrough(),

  answerInlineQuery: () =>
    z
      .object({
        inline_query_id: z.string().min(1),
        results: z.array(z.object({}).passthrough()),
      })
      .passthrough(),

  // ---------------------------------------------------------------------------
  // Settings
  // ---------------------------------------------------------------------------
  setMyCommands: () =>
    z
      .object({
        commands: z
          .array(
            z.object({
              command: z.string().min(1).max(32),
              description: z.string().min(1).max(256),
            })
          )
          .max(100),
      })
      .passthrough(),

  deleteMyCommands: () => z.object({}).passthrough(),
  getMyCommands: () => z.object({}).passthrough(),

  setMyName: () =>
    z
      .object({
        name: z.string().max(64).optional(),
        language_code: z.string().max(2).optional(),
      })
      .passthrough(),

  setMyDescription: () =>
    z
      .object({
        description: z.string().max(512).optional(),
        language_code: z.string().max(2).optional(),
      })
      .passthrough(),

  // ---------------------------------------------------------------------------
  // Payments
  // ---------------------------------------------------------------------------
  sendInvoice: () =>
    z
      .object({
        chat_id: getChatIdSchema(),
        title: z.string().min(1).max(32),
        description: z.string().min(1).max(255),
        payload: z.string().min(1).max(128),
        currency: z.string().length(3),
        prices: z.array(
          z.object({
            label: z.string(),
            amount: z.number().int(),
          })
        ),
      })
      .passthrough(),

  answerPreCheckoutQuery: () =>
    z
      .object({
        pre_checkout_query_id: z.string().min(1),
        ok: z.boolean(),
        error_message: z.string().optional(),
      })
      .passthrough(),

  answerShippingQuery: () =>
    z
      .object({
        shipping_query_id: z.string().min(1),
        ok: z.boolean(),
      })
      .passthrough(),

  // ---------------------------------------------------------------------------
  // Stickers
  // ---------------------------------------------------------------------------
  getStickerSet: () =>
    z
      .object({
        name: z.string().min(1),
      })
      .passthrough(),

  // ---------------------------------------------------------------------------
  // Files
  // ---------------------------------------------------------------------------
  getFile: () =>
    z
      .object({
        file_id: z.string().min(1),
      })
      .passthrough(),

  getUserProfilePhotos: () =>
    z
      .object({
        user_id: getUserIdSchema(),
        offset: z.number().int().optional(),
        limit: z.number().int().min(1).max(100).optional(),
      })
      .passthrough(),
};

// =============================================================================
// SCHEMA RETRIEVAL
// =============================================================================

/**
 * Get schema for a method, loading it lazily if needed.
 * Returns null if no schema is defined for the method.
 */
function getSchema(method: string): ZodType | null {
  // Check cache first
  const cached = schemaCache.get(method);
  if (cached) {
    return cached;
  }

  // Check if factory exists
  const factory = schemaFactories[method];
  if (!factory) {
    return null;
  }

  // Create schema, cache it, and log
  const schema = factory();
  schemaCache.set(method, schema);
  schemasLoaded++;
  logger.debug("Schema loaded", { method, totalLoaded: schemasLoaded });

  return schema;
}

// =============================================================================
// VALIDATION RESULT
// =============================================================================

export interface ValidationSuccess {
  success: true;
  data: Record<string, unknown>;
}

export interface ValidationError {
  success: false;
  error: string;
  details?: Array<{
    path: string;
    message: string;
  }>;
}

export type ValidationResult = ValidationSuccess | ValidationError;

// =============================================================================
// VALIDATION FUNCTION
// =============================================================================

/**
 * Validate parameters for a Telegram API method
 *
 * @param method - API method name (e.g., "sendMessage")
 * @param params - Parameters to validate
 * @returns ValidationResult with success/error status
 */
export function validateParams(
  method: string,
  params: Record<string, unknown>
): ValidationResult {
  const schema = getSchema(method);

  // No schema defined - pass through without validation
  // This ensures forward compatibility with new/undocumented methods
  if (!schema) {
    return { success: true, data: params };
  }

  const result = schema.safeParse(params);

  if (result.success) {
    return { success: true, data: result.data as Record<string, unknown> };
  }

  // Format Zod errors into readable messages
  const details = result.error.errors.map((err) => ({
    path: err.path.join(".") || "(root)",
    message: err.message,
  }));

  const errorMessage = details
    .map((d) => (d.path === "(root)" ? d.message : `${d.path}: ${d.message}`))
    .join("; ");

  return {
    success: false,
    error: `Validation failed: ${errorMessage}`,
    details,
  };
}

/**
 * Check if a method has a validation schema defined
 */
export function hasSchema(method: string): boolean {
  return method in schemaFactories;
}

/**
 * Get list of methods with validation schemas
 */
export function getValidatedMethods(): string[] {
  return Object.keys(schemaFactories);
}

/**
 * Get current schema loading statistics (for debugging)
 */
export function getSchemaStats(): { defined: number; loaded: number } {
  return {
    defined: Object.keys(schemaFactories).length,
    loaded: schemasLoaded,
  };
}

// =============================================================================
// EXPORTED BASE SCHEMA GETTERS (for external use if needed)
// These are lazy getters - schemas are only created when called
// =============================================================================

export {
  getChatIdSchema,
  getUserIdSchema,
  getMessageIdSchema,
  getMessageTextSchema,
  getCaptionSchema,
  getParseModeSchema,
  getBooleanSchema,
  getFileSchema,
  getReplyMarkupSchema,
  getReplyParametersSchema,
};
