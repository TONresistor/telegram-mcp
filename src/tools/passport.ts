/**
 * Telegram Passport - Category 1
 *
 * Methods:
 * - setPassportDataErrors
 */

import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { callTelegramAPI, createToolResult } from "../telegram-api.js";

// =============================================================================
// TOOL DEFINITIONS
// =============================================================================

export const passportTools: Tool[] = [
  {
    name: "setPassportDataErrors",
    description:
      "Informs a user that some of the Telegram Passport elements they provided contain errors. The user will not be able to re-submit their Passport to you until the errors are fixed. Returns True on success.",
    inputSchema: {
      type: "object",
      properties: {
        user_id: {
          type: "integer",
          description: "Unique identifier of the target user.",
        },
        errors: {
          type: "array",
          items: {
            type: "object",
            description:
              "PassportElementError object describing the error. Types: PassportElementErrorDataField, PassportElementErrorFrontSide, PassportElementErrorReverseSide, PassportElementErrorSelfie, PassportElementErrorFile, PassportElementErrorFiles, PassportElementErrorTranslationFile, PassportElementErrorTranslationFiles, PassportElementErrorUnspecified.",
            properties: {
              source: {
                type: "string",
                description:
                  "Error source. Must be one of: data, front_side, reverse_side, selfie, file, files, translation_file, translation_files, unspecified.",
                enum: [
                  "data",
                  "front_side",
                  "reverse_side",
                  "selfie",
                  "file",
                  "files",
                  "translation_file",
                  "translation_files",
                  "unspecified",
                ],
              },
              type: {
                type: "string",
                description:
                  "The section of the user's Telegram Passport which has the error. Possible values depend on source: for 'data' - personal_details, passport, driver_license, identity_card, internal_passport, address; for document sources - passport, driver_license, identity_card, internal_passport, utility_bill, bank_statement, rental_agreement, passport_registration, temporary_registration.",
              },
              field_name: {
                type: "string",
                description:
                  "Name of the data field which has the error. Only for source='data'.",
              },
              data_hash: {
                type: "string",
                description:
                  "Base64-encoded data hash. Only for source='data'.",
              },
              file_hash: {
                type: "string",
                description:
                  "Base64-encoded file hash. For single file error sources: front_side, reverse_side, selfie, file, translation_file.",
              },
              file_hashes: {
                type: "array",
                items: { type: "string" },
                description:
                  "List of base64-encoded file hashes. For multi-file error sources: files, translation_files.",
              },
              element_hash: {
                type: "string",
                description:
                  "Base64-encoded element hash. Only for source='unspecified'.",
              },
              message: {
                type: "string",
                description: "Error message describing what is wrong with the element.",
              },
            },
            required: ["source", "type", "message"],
          },
          description:
            "A JSON-serialized array describing the errors. Use the appropriate PassportElementError type based on the error source.",
        },
      },
      required: ["user_id", "errors"],
    },
  },
];

// =============================================================================
// TOOL HANDLER
// =============================================================================

export async function handlePassportTool(
  name: string,
  args: Record<string, unknown>
) {
  const response = await callTelegramAPI(name, args);
  return createToolResult(response);
}
