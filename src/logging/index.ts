/**
 * Logging Module
 *
 * Structured logging with RFC 5424 severity levels.
 * All logs go to stderr (stdout is reserved for MCP protocol).
 *
 * SECURITY: Never log sensitive data (tokens, passwords, PII).
 */

import { randomUUID } from "crypto";
import { LogLevel, getConfig } from "../config/index.js";

// =============================================================================
// TYPES
// =============================================================================

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  logger: string;
  message: string;
  data?: Record<string, unknown>;
}

// =============================================================================
// LOG LEVEL PRIORITY (RFC 5424)
// =============================================================================

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 7,
  info: 6,
  notice: 5,
  warning: 4,
  error: 3,
  critical: 2,
};

// =============================================================================
// SENSITIVE DATA PATTERNS
// =============================================================================

const SENSITIVE_PATTERNS = [
  /token[=:]\s*\S+/gi,
  /api[_-]?key[=:]\s*\S+/gi,
  /password[=:]\s*\S+/gi,
  /secret[=:]\s*\S+/gi,
  /authorization[=:]\s*\S+/gi,
  /bearer\s+\S+/gi,
  /\d{8,}:[A-Za-z0-9_-]{30,}/g, // Telegram bot token pattern
];

const SENSITIVE_KEYS = [
  "token",
  "password",
  "secret",
  "apiKey",
  "api_key",
  "authorization",
  "credentials",
  "botToken",
  "bot_token",
  "secret_token",
  "webhookSecret",
  "provider_token",
];

// =============================================================================
// SANITIZATION
// =============================================================================

/**
 * Sanitize a string by removing sensitive patterns
 */
function sanitizeString(str: string): string {
  let result = str;
  for (const pattern of SENSITIVE_PATTERNS) {
    result = result.replace(pattern, "[REDACTED]");
  }
  return result;
}

/**
 * Recursively sanitize an object, removing sensitive values
 */
function sanitizeObject(obj: unknown, depth = 0): unknown {
  // Prevent infinite recursion
  if (depth > 10) {
    return "[MAX_DEPTH]";
  }

  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === "string") {
    return sanitizeString(obj);
  }

  if (typeof obj === "number" || typeof obj === "boolean") {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item, depth + 1));
  }

  if (typeof obj === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      // Check if key is sensitive
      if (SENSITIVE_KEYS.some((k) => key.toLowerCase().includes(k.toLowerCase()))) {
        result[key] = "[REDACTED]";
      } else {
        result[key] = sanitizeObject(value, depth + 1);
      }
    }
    return result;
  }

  return "[UNKNOWN_TYPE]";
}

// =============================================================================
// LOGGER CLASS
// =============================================================================

class Logger {
  private name: string;

  constructor(name: string) {
    this.name = name;
  }

  /**
   * Check if a log level should be output based on current config
   */
  private shouldLog(level: LogLevel): boolean {
    try {
      const config = getConfig();
      const currentPriority = LOG_LEVEL_PRIORITY[config.logLevel];
      const messagePriority = LOG_LEVEL_PRIORITY[level];
      return messagePriority <= currentPriority;
    } catch {
      // If config isn't loaded yet, log everything
      return true;
    }
  }

  /**
   * Format and output a log entry
   */
  private log(level: LogLevel, message: string, data?: Record<string, unknown>): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      logger: this.name,
      message,
    };

    if (data) {
      entry.data = sanitizeObject(data) as Record<string, unknown>;
    }

    // Output to stderr (stdout is for MCP protocol)
    console.error(JSON.stringify(entry));
  }

  // Log level methods
  debug(message: string, data?: Record<string, unknown>): void {
    this.log("debug", message, data);
  }

  info(message: string, data?: Record<string, unknown>): void {
    this.log("info", message, data);
  }

  notice(message: string, data?: Record<string, unknown>): void {
    this.log("notice", message, data);
  }

  warning(message: string, data?: Record<string, unknown>): void {
    this.log("warning", message, data);
  }

  error(message: string, data?: Record<string, unknown>): void {
    this.log("error", message, data);
  }

  critical(message: string, data?: Record<string, unknown>): void {
    this.log("critical", message, data);
  }
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

/**
 * Create a logger instance for a specific component
 *
 * @param name - Component name (e.g., "telegram-api", "tools.updates")
 * @returns Logger instance
 */
export function createLogger(name: string): Logger {
  return new Logger(name);
}

// =============================================================================
// DEFAULT LOGGER
// =============================================================================

export const logger = createLogger("telegram-mcp");

// =============================================================================
// REQUEST TRACKING
// =============================================================================

/**
 * Generate a unique request ID for correlation
 */
export function generateRequestId(): string {
  return randomUUID().slice(0, 8);
}
