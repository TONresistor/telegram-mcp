/**
 * Payments Methods - Category 8
 *
 * Methods:
 * - sendInvoice
 * - createInvoiceLink
 * - answerShippingQuery
 * - answerPreCheckoutQuery
 * - getStarTransactions
 * - refundStarPayment
 * - editUserStarSubscription
 * - getMyStarBalance
 */

import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { callTelegramAPI, createToolResult } from "../telegram-api.js";

// =============================================================================
// TOOL DEFINITIONS
// =============================================================================

export const paymentTools: Tool[] = [
  {
    name: "sendInvoice",
    description:
      "Send an invoice to a user. On success, the sent Message is returned.",
    inputSchema: {
      type: "object",
      properties: {
        chat_id: {
          type: ["integer", "string"],
          description:
            "Unique identifier for the target chat or username of the target channel (in the format @channelusername)",
        },
        message_thread_id: {
          type: "integer",
          description:
            "Unique identifier for the target message thread (topic) of the forum; for forum supergroups only",
        },
        title: {
          type: "string",
          description: "Product name, 1-32 characters",
        },
        description: {
          type: "string",
          description: "Product description, 1-255 characters",
        },
        payload: {
          type: "string",
          description:
            "Bot-defined invoice payload, 1-128 bytes. This will not be displayed to the user, use it for your internal processes.",
        },
        provider_token: {
          type: "string",
          description:
            "Payment provider token, obtained via @BotFather. Pass an empty string for payments in Telegram Stars.",
        },
        currency: {
          type: "string",
          description:
            'Three-letter ISO 4217 currency code, or "XTR" for payments in Telegram Stars',
        },
        prices: {
          type: "array",
          items: {
            type: "object",
            properties: {
              label: { type: "string" },
              amount: { type: "integer" },
            },
            required: ["label", "amount"],
          },
          description:
            "Price breakdown, a JSON-serialized list of components (e.g. product price, tax, discount, delivery cost, etc.)",
        },
        max_tip_amount: {
          type: "integer",
          description:
            "The maximum accepted amount for tips in the smallest units of the currency. Defaults to 0.",
        },
        suggested_tip_amounts: {
          type: "array",
          items: { type: "integer" },
          description:
            "A JSON-serialized array of suggested amounts of tips in the smallest units of the currency. At most 4 suggested tip amounts can be specified.",
        },
        start_parameter: {
          type: "string",
          description:
            "Unique deep-linking parameter. If left empty, forwarded copies of the sent message will have a Pay button.",
        },
        provider_data: {
          type: "string",
          description:
            "JSON-serialized data about the invoice, which will be shared with the payment provider.",
        },
        photo_url: {
          type: "string",
          description:
            "URL of the product photo for the invoice. Can be a photo of the goods or a marketing image for a service.",
        },
        photo_size: {
          type: "integer",
          description: "Photo size in bytes",
        },
        photo_width: {
          type: "integer",
          description: "Photo width",
        },
        photo_height: {
          type: "integer",
          description: "Photo height",
        },
        need_name: {
          type: "boolean",
          description:
            "Pass True if you require the user's full name to complete the order. Ignored for payments in Telegram Stars.",
        },
        need_phone_number: {
          type: "boolean",
          description:
            "Pass True if you require the user's phone number to complete the order. Ignored for payments in Telegram Stars.",
        },
        need_email: {
          type: "boolean",
          description:
            "Pass True if you require the user's email address to complete the order. Ignored for payments in Telegram Stars.",
        },
        need_shipping_address: {
          type: "boolean",
          description:
            "Pass True if you require the user's shipping address to complete the order. Ignored for payments in Telegram Stars.",
        },
        send_phone_number_to_provider: {
          type: "boolean",
          description:
            "Pass True if the user's phone number should be sent to the provider. Ignored for payments in Telegram Stars.",
        },
        send_email_to_provider: {
          type: "boolean",
          description:
            "Pass True if the user's email address should be sent to the provider. Ignored for payments in Telegram Stars.",
        },
        is_flexible: {
          type: "boolean",
          description:
            "Pass True if the final price depends on the shipping method. Ignored for payments in Telegram Stars.",
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
            "A JSON-serialized object for an inline keyboard. If empty, one 'Pay total price' button will be shown.",
        },
      },
      required: ["chat_id", "title", "description", "payload", "currency", "prices"],
    },
  },
  {
    name: "createInvoiceLink",
    description:
      "Create a link for an invoice. Returns the created invoice link as String on success.",
    inputSchema: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "Product name, 1-32 characters",
        },
        description: {
          type: "string",
          description: "Product description, 1-255 characters",
        },
        payload: {
          type: "string",
          description:
            "Bot-defined invoice payload, 1-128 bytes. This will not be displayed to the user, use it for your internal processes.",
        },
        provider_token: {
          type: "string",
          description:
            "Payment provider token, obtained via @BotFather. Pass an empty string for payments in Telegram Stars.",
        },
        currency: {
          type: "string",
          description:
            'Three-letter ISO 4217 currency code, or "XTR" for payments in Telegram Stars',
        },
        prices: {
          type: "array",
          items: {
            type: "object",
            properties: {
              label: { type: "string" },
              amount: { type: "integer" },
            },
            required: ["label", "amount"],
          },
          description:
            "Price breakdown, a JSON-serialized list of components.",
        },
        business_connection_id: {
          type: "string",
          description:
            "Unique identifier of the business connection on behalf of which the link will be created. For payments in Telegram Stars only.",
        },
        subscription_period: {
          type: "integer",
          description:
            "The number of seconds the subscription will be active for before the next payment. The currency must be set to 'XTR' (Telegram Stars) if the parameter is used. Currently, it must always be 2592000 (30 days).",
        },
        max_tip_amount: {
          type: "integer",
          description:
            "The maximum accepted amount for tips in the smallest units of the currency.",
        },
        suggested_tip_amounts: {
          type: "array",
          items: { type: "integer" },
          description:
            "A JSON-serialized array of suggested amounts of tips in the smallest units of the currency.",
        },
        provider_data: {
          type: "string",
          description:
            "JSON-serialized data about the invoice, which will be shared with the payment provider.",
        },
        photo_url: {
          type: "string",
          description: "URL of the product photo for the invoice.",
        },
        photo_size: {
          type: "integer",
          description: "Photo size in bytes",
        },
        photo_width: {
          type: "integer",
          description: "Photo width",
        },
        photo_height: {
          type: "integer",
          description: "Photo height",
        },
        need_name: {
          type: "boolean",
          description: "Pass True if you require the user's full name to complete the order.",
        },
        need_phone_number: {
          type: "boolean",
          description: "Pass True if you require the user's phone number to complete the order.",
        },
        need_email: {
          type: "boolean",
          description: "Pass True if you require the user's email address to complete the order.",
        },
        need_shipping_address: {
          type: "boolean",
          description: "Pass True if you require the user's shipping address to complete the order.",
        },
        send_phone_number_to_provider: {
          type: "boolean",
          description: "Pass True if the user's phone number should be sent to the provider.",
        },
        send_email_to_provider: {
          type: "boolean",
          description: "Pass True if the user's email address should be sent to the provider.",
        },
        is_flexible: {
          type: "boolean",
          description: "Pass True if the final price depends on the shipping method.",
        },
      },
      required: ["title", "description", "payload", "currency", "prices"],
    },
  },
  {
    name: "answerShippingQuery",
    description:
      "Reply to shipping queries. If you sent an invoice requesting a shipping address and the parameter is_flexible was specified, the Bot API will send an Update with a shipping_query field to the bot. Use this method to reply to shipping queries. On success, True is returned.",
    inputSchema: {
      type: "object",
      properties: {
        shipping_query_id: {
          type: "string",
          description: "Unique identifier for the query to be answered",
        },
        ok: {
          type: "boolean",
          description:
            "Pass True if delivery to the specified address is possible and False if there are any problems.",
        },
        shipping_options: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              title: { type: "string" },
              prices: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    label: { type: "string" },
                    amount: { type: "integer" },
                  },
                },
              },
            },
            required: ["id", "title", "prices"],
          },
          description:
            "Required if ok is True. A JSON-serialized array of available shipping options.",
        },
        error_message: {
          type: "string",
          description:
            "Required if ok is False. Error message in human readable form that explains why it is impossible to complete the order.",
        },
      },
      required: ["shipping_query_id", "ok"],
    },
  },
  {
    name: "answerPreCheckoutQuery",
    description:
      "Respond to pre-checkout queries. Once the user has confirmed their payment and shipping details, the Bot API sends the final confirmation in the form of an Update with the field pre_checkout_query. Use this method to respond to such pre-checkout queries. On success, True is returned. Note: The Bot API must receive an answer within 10 seconds after the pre-checkout query was sent.",
    inputSchema: {
      type: "object",
      properties: {
        pre_checkout_query_id: {
          type: "string",
          description: "Unique identifier for the query to be answered",
        },
        ok: {
          type: "boolean",
          description:
            "Specify True if everything is alright (goods are available, etc.) and the bot is ready to proceed with the order. Use False if there are any problems.",
        },
        error_message: {
          type: "string",
          description:
            "Required if ok is False. Error message in human readable form that explains the reason for failure to proceed with the checkout.",
        },
      },
      required: ["pre_checkout_query_id", "ok"],
    },
  },
  {
    name: "getStarTransactions",
    description:
      "Returns the bot's Telegram Star transactions in chronological order. On success, returns a StarTransactions object.",
    inputSchema: {
      type: "object",
      properties: {
        offset: {
          type: "integer",
          description: "Number of transactions to skip in the response",
        },
        limit: {
          type: "integer",
          description:
            "The maximum number of transactions to be retrieved. Values between 1-100 are accepted. Defaults to 100.",
        },
      },
      required: [],
    },
  },
  {
    name: "refundStarPayment",
    description:
      "Refunds a successful payment in Telegram Stars. Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        user_id: {
          type: "integer",
          description: "Identifier of the user whose payment will be refunded",
        },
        telegram_payment_charge_id: {
          type: "string",
          description: "Telegram payment identifier",
        },
      },
      required: ["user_id", "telegram_payment_charge_id"],
    },
  },
  {
    name: "editUserStarSubscription",
    description:
      "Allows the bot to cancel or re-enable extension of a subscription paid in Telegram Stars. Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        user_id: {
          type: "integer",
          description: "Identifier of the user whose subscription will be edited",
        },
        telegram_payment_charge_id: {
          type: "string",
          description: "Telegram payment identifier for the subscription",
        },
        is_canceled: {
          type: "boolean",
          description:
            "Pass True to cancel extension of the user subscription; the subscription must be active up to the end of the current subscription period. Pass False to allow the user to re-enable it.",
        },
      },
      required: ["user_id", "telegram_payment_charge_id", "is_canceled"],
    },
  },
  {
    name: "getMyStarBalance",
    description:
      "Returns the bot's current balance in Telegram Stars. On success, returns a StarAmount object.",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
];

// =============================================================================
// TOOL HANDLER
// =============================================================================

export async function handlePaymentTool(
  name: string,
  args: Record<string, unknown>
) {
  const response = await callTelegramAPI(name, args);
  return createToolResult(response);
}
