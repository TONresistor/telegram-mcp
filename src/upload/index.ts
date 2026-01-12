/**
 * File Upload Support for Telegram Bot API
 *
 * Handles multipart/form-data file uploads for local files.
 * Supports detection of local file paths and creation of form-data requests.
 */

import * as fs from "fs";
import * as path from "path";
import { createLogger } from "../logging/index.js";

const logger = createLogger("upload");

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * Parameters that can contain file uploads, mapped by API method
 */
export const FILE_UPLOAD_PARAMS: Record<string, string[]> = {
  // Message sending methods
  sendPhoto: ["photo"],
  sendAudio: ["audio", "thumbnail"],
  sendDocument: ["document", "thumbnail"],
  sendVideo: ["video", "thumbnail", "cover"],
  sendAnimation: ["animation", "thumbnail"],
  sendVoice: ["voice"],
  sendVideoNote: ["video_note", "thumbnail"],
  sendSticker: ["sticker"],

  // Webhook
  setWebhook: ["certificate"],

  // Chat management
  setChatPhoto: ["photo"],

  // Stickers
  uploadStickerFile: ["sticker"],
  createNewStickerSet: ["stickers"], // Special handling: array of InputSticker objects
  addStickerToSet: ["sticker"], // InputSticker object with sticker field
  replaceStickerInSet: ["sticker"], // InputSticker object with sticker field
  setStickerSetThumbnail: ["thumbnail"],

  // Business
  setBusinessAccountProfilePhoto: ["photo"], // InputProfilePhoto object
};

/**
 * Methods that support file uploads
 */
export const FILE_UPLOAD_METHODS = new Set(Object.keys(FILE_UPLOAD_PARAMS));

// =============================================================================
// FILE DETECTION
// =============================================================================

/**
 * Check if a value represents a local file path
 *
 * Detection rules:
 * - Starts with "/" and file exists -> local file
 * - Starts with "file://" -> local file (strip prefix)
 * - Is alphanumeric with underscores/hyphens -> file_id (pass as-is)
 * - Starts with http:// or https:// -> URL (pass as-is)
 */
export function isLocalFilePath(value: unknown): boolean {
  if (typeof value !== "string") {
    return false;
  }

  // Handle file:// prefix
  let filePath = value;
  if (value.startsWith("file://")) {
    filePath = value.slice(7);
  }

  // Check if it's an absolute path that exists
  if (filePath.startsWith("/")) {
    try {
      return fs.existsSync(filePath);
    } catch {
      return false;
    }
  }

  return false;
}

/**
 * Extract the actual file path from a value
 */
export function extractFilePath(value: string): string {
  if (value.startsWith("file://")) {
    return value.slice(7);
  }
  return value;
}

/**
 * Check if a value is a file_id (Telegram's internal file identifier)
 * File IDs are base64-like strings with alphanumerics, underscores, and hyphens
 */
export function isFileId(value: unknown): boolean {
  if (typeof value !== "string") {
    return false;
  }

  // File IDs don't start with / or http
  if (value.startsWith("/") || value.startsWith("http://") || value.startsWith("https://") || value.startsWith("file://")) {
    return false;
  }

  // File IDs are typically base64-like: alphanumeric with _ and -
  // They're usually fairly long (20+ characters)
  return /^[A-Za-z0-9_-]{20,}$/.test(value);
}

/**
 * Check if a value is an HTTP/HTTPS URL
 */
export function isHttpUrl(value: unknown): boolean {
  if (typeof value !== "string") {
    return false;
  }
  return value.startsWith("http://") || value.startsWith("https://");
}

/**
 * Determine the type of file reference
 */
export type FileReferenceType = "local_file" | "file_id" | "url" | "unknown";

export function getFileReferenceType(value: unknown): FileReferenceType {
  if (isLocalFilePath(value)) {
    return "local_file";
  }
  if (isHttpUrl(value)) {
    return "url";
  }
  if (isFileId(value)) {
    return "file_id";
  }
  return "unknown";
}

// =============================================================================
// FILE INFO
// =============================================================================

export interface FileInfo {
  path: string;
  name: string;
  size: number;
  mimeType: string;
}

/**
 * Get MIME type from file extension
 */
function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes: Record<string, string> = {
    // Images
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".bmp": "image/bmp",

    // Audio
    ".mp3": "audio/mpeg",
    ".m4a": "audio/mp4",
    ".ogg": "audio/ogg",
    ".oga": "audio/ogg",
    ".opus": "audio/opus",
    ".wav": "audio/wav",
    ".flac": "audio/flac",

    // Video
    ".mp4": "video/mp4",
    ".mpeg": "video/mpeg",
    ".webm": "video/webm",
    ".avi": "video/x-msvideo",
    ".mov": "video/quicktime",
    ".mkv": "video/x-matroska",

    // Documents
    ".pdf": "application/pdf",
    ".doc": "application/msword",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".xls": "application/vnd.ms-excel",
    ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".ppt": "application/vnd.ms-powerpoint",
    ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ".txt": "text/plain",
    ".json": "application/json",
    ".xml": "application/xml",
    ".zip": "application/zip",
    ".tar": "application/x-tar",
    ".gz": "application/gzip",
    ".rar": "application/vnd.rar",

    // Stickers
    ".tgs": "application/x-tgsticker",

    // Certificates
    ".pem": "application/x-pem-file",
    ".crt": "application/x-x509-ca-cert",
    ".cer": "application/x-x509-ca-cert",
  };

  return mimeTypes[ext] || "application/octet-stream";
}

/**
 * Get file information for a local file
 */
export function getFileInfo(filePath: string): FileInfo {
  const actualPath = extractFilePath(filePath);
  const stats = fs.statSync(actualPath);

  return {
    path: actualPath,
    name: path.basename(actualPath),
    size: stats.size,
    mimeType: getMimeType(actualPath),
  };
}

// =============================================================================
// MULTIPART FORM-DATA CREATION
// =============================================================================

/**
 * Generate a random boundary string for multipart form-data
 */
function generateBoundary(): string {
  return "----TelegramMCPBoundary" + Math.random().toString(36).substring(2);
}

/**
 * File entry for multipart form-data
 */
interface FormDataFile {
  paramName: string;
  filePath: string;
  fileName: string;
  mimeType: string;
}

/**
 * Result of checking params for file uploads
 */
export interface FileUploadCheck {
  hasFiles: boolean;
  files: FormDataFile[];
  cleanParams: Record<string, unknown>;
}

/**
 * Check if parameters contain any local file uploads
 * Returns information about files found and cleaned params
 */
export function checkForFileUploads(
  method: string,
  params: Record<string, unknown>
): FileUploadCheck {
  const result: FileUploadCheck = {
    hasFiles: false,
    files: [],
    cleanParams: { ...params },
  };

  // Get the file parameters for this method
  const fileParams = FILE_UPLOAD_PARAMS[method];
  if (!fileParams) {
    return result;
  }

  for (const paramName of fileParams) {
    const value = params[paramName];

    if (value === undefined) {
      continue;
    }

    // Handle special cases for sticker methods with nested objects
    if (paramName === "stickers" && Array.isArray(value)) {
      // createNewStickerSet: stickers is an array of InputSticker objects
      const processedStickers = processInputStickerArray(value, result);
      result.cleanParams[paramName] = processedStickers;
      continue;
    }

    if (paramName === "sticker" && typeof value === "object" && value !== null) {
      // addStickerToSet/replaceStickerInSet: sticker is an InputSticker object
      const processedSticker = processInputSticker(value as Record<string, unknown>, paramName, result);
      result.cleanParams[paramName] = processedSticker;
      continue;
    }

    if (paramName === "photo" && typeof value === "object" && value !== null && method === "setBusinessAccountProfilePhoto") {
      // setBusinessAccountProfilePhoto: photo is an InputProfilePhoto object
      const processedPhoto = processInputProfilePhoto(value as Record<string, unknown>, paramName, result);
      result.cleanParams[paramName] = processedPhoto;
      continue;
    }

    // Standard file parameter (string value)
    if (typeof value === "string" && isLocalFilePath(value)) {
      const fileInfo = getFileInfo(value);
      result.hasFiles = true;
      result.files.push({
        paramName,
        filePath: fileInfo.path,
        fileName: fileInfo.name,
        mimeType: fileInfo.mimeType,
      });
      // Replace the file path with attach://<paramName> reference
      result.cleanParams[paramName] = `attach://${paramName}`;
      logger.debug("Found local file", { paramName, path: fileInfo.path });
    }
  }

  return result;
}

/**
 * Process an array of InputSticker objects for createNewStickerSet
 */
function processInputStickerArray(
  stickers: unknown[],
  result: FileUploadCheck
): unknown[] {
  return stickers.map((sticker, index) => {
    if (typeof sticker !== "object" || sticker === null) {
      return sticker;
    }
    const stickerObj = sticker as Record<string, unknown>;
    const stickerField = stickerObj.sticker;

    if (typeof stickerField === "string" && isLocalFilePath(stickerField)) {
      const fileInfo = getFileInfo(stickerField);
      const attachName = `sticker_${index}`;
      result.hasFiles = true;
      result.files.push({
        paramName: attachName,
        filePath: fileInfo.path,
        fileName: fileInfo.name,
        mimeType: fileInfo.mimeType,
      });
      return {
        ...stickerObj,
        sticker: `attach://${attachName}`,
      };
    }

    return sticker;
  });
}

/**
 * Process an InputSticker object for addStickerToSet/replaceStickerInSet
 */
function processInputSticker(
  sticker: Record<string, unknown>,
  _paramName: string,
  result: FileUploadCheck
): Record<string, unknown> {
  const stickerField = sticker.sticker;

  if (typeof stickerField === "string" && isLocalFilePath(stickerField)) {
    const fileInfo = getFileInfo(stickerField);
    const attachName = "sticker_file";
    result.hasFiles = true;
    result.files.push({
      paramName: attachName,
      filePath: fileInfo.path,
      fileName: fileInfo.name,
      mimeType: fileInfo.mimeType,
    });
    return {
      ...sticker,
      sticker: `attach://${attachName}`,
    };
  }

  return sticker;
}

/**
 * Process an InputProfilePhoto object for setBusinessAccountProfilePhoto
 */
function processInputProfilePhoto(
  photo: Record<string, unknown>,
  _paramName: string,
  result: FileUploadCheck
): Record<string, unknown> {
  // InputProfilePhoto can have 'photo' field for static or 'animation' for animated
  const photoField = photo.photo;
  const animationField = photo.animation;

  const processed = { ...photo };

  if (typeof photoField === "string" && isLocalFilePath(photoField)) {
    const fileInfo = getFileInfo(photoField);
    const attachName = "profile_photo";
    result.hasFiles = true;
    result.files.push({
      paramName: attachName,
      filePath: fileInfo.path,
      fileName: fileInfo.name,
      mimeType: fileInfo.mimeType,
    });
    processed.photo = `attach://${attachName}`;
  }

  if (typeof animationField === "string" && isLocalFilePath(animationField)) {
    const fileInfo = getFileInfo(animationField);
    const attachName = "profile_animation";
    result.hasFiles = true;
    result.files.push({
      paramName: attachName,
      filePath: fileInfo.path,
      fileName: fileInfo.name,
      mimeType: fileInfo.mimeType,
    });
    processed.animation = `attach://${attachName}`;
  }

  return processed;
}

// =============================================================================
// MULTIPART FORM-DATA BODY CREATION
// =============================================================================

/**
 * Result of creating multipart form-data
 */
export interface MultipartFormData {
  body: Buffer;
  contentType: string;
  boundary: string;
}

/**
 * Create a multipart/form-data request body
 *
 * @param params - The cleaned parameters (with attach:// references for files)
 * @param files - Array of file information
 * @returns The form-data body buffer and content-type header
 */
export function createMultipartFormData(
  params: Record<string, unknown>,
  files: FormDataFile[]
): MultipartFormData {
  const boundary = generateBoundary();
  const parts: Buffer[] = [];

  // Add regular parameters
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) {
      continue;
    }

    // Skip file parameters that have been converted to attach:// references
    // (they'll be added as file parts)

    const stringValue = typeof value === "object" ? JSON.stringify(value) : String(value);

    parts.push(Buffer.from(
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="${key}"\r\n\r\n` +
      `${stringValue}\r\n`
    ));
  }

  // Add file parts
  for (const file of files) {
    const fileContent = fs.readFileSync(file.filePath);

    parts.push(Buffer.from(
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="${file.paramName}"; filename="${file.fileName}"\r\n` +
      `Content-Type: ${file.mimeType}\r\n\r\n`
    ));
    parts.push(fileContent);
    parts.push(Buffer.from("\r\n"));
  }

  // Add closing boundary
  parts.push(Buffer.from(`--${boundary}--\r\n`));

  const body = Buffer.concat(parts);

  return {
    body,
    contentType: `multipart/form-data; boundary=${boundary}`,
    boundary,
  };
}

// =============================================================================
// VALIDATION
// =============================================================================

/**
 * Validate that all referenced files exist
 *
 * @param files - Array of file information
 * @throws Error if any file doesn't exist
 */
export function validateFiles(files: FormDataFile[]): void {
  for (const file of files) {
    if (!fs.existsSync(file.filePath)) {
      throw new Error(`File not found: ${file.filePath}`);
    }

    const stats = fs.statSync(file.filePath);
    if (!stats.isFile()) {
      throw new Error(`Not a file: ${file.filePath}`);
    }
  }
}
