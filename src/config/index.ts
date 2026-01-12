/**
 * Configuration Module
 *
 * Handles loading and validation of environment variables.
 * All secrets are loaded from environment variables only.
 */

// =============================================================================
// TYPES
// =============================================================================

export type LogLevel =
  | "debug"
  | "info"
  | "notice"
  | "warning"
  | "error"
  | "critical";

export interface ServerConfig {
  // Telegram Bot
  botToken: string;

  // Server settings
  logLevel: LogLevel;
  requestTimeout: number;
  maxRetries: number;
  rateLimitPerMinute: number;

  // Webhook (optional)
  webhookUrl?: string;
  webhookSecret?: string;
  webhookPort?: number;

  // Health check (optional)
  healthPort?: number;

  // Debug mode
  debug: boolean;
}

// =============================================================================
// VALIDATION
// =============================================================================

const VALID_LOG_LEVELS: LogLevel[] = [
  "debug",
  "info",
  "notice",
  "warning",
  "error",
  "critical",
];

function validateLogLevel(value: string | undefined): LogLevel {
  const level = (value || "info").toLowerCase() as LogLevel;
  if (VALID_LOG_LEVELS.includes(level)) {
    return level;
  }
  return "info";
}

function validateNumber(
  value: string | undefined,
  defaultValue: number,
  min: number,
  max: number
): number {
  if (!value) return defaultValue;
  const num = parseInt(value, 10);
  if (isNaN(num)) return defaultValue;
  return Math.min(Math.max(num, min), max);
}

function validateBotToken(token: string | undefined): string {
  if (!token) {
    throw new ConfigurationError(
      "TELEGRAM_BOT_TOKEN is required.\n" +
        "Get your bot token from @BotFather on Telegram.\n" +
        "Then set it: export TELEGRAM_BOT_TOKEN=your_token_here"
    );
  }

  // Basic format validation: number:alphanumeric
  const tokenRegex = /^\d+:[A-Za-z0-9_-]+$/;
  if (!tokenRegex.test(token)) {
    throw new ConfigurationError(
      "TELEGRAM_BOT_TOKEN format is invalid.\n" +
        "Expected format: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
    );
  }

  return token;
}

// =============================================================================
// ERROR CLASS
// =============================================================================

export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigurationError";
  }
}

// =============================================================================
// CONFIGURATION LOADING
// =============================================================================

let cachedConfig: ServerConfig | null = null;

/**
 * Load configuration from environment variables.
 * Validates all required values and provides sensible defaults.
 *
 * @throws ConfigurationError if required values are missing or invalid
 */
export function loadConfig(): ServerConfig {
  // Return cached config if already loaded
  if (cachedConfig) {
    return cachedConfig;
  }

  const config: ServerConfig = {
    // Required
    botToken: validateBotToken(process.env.TELEGRAM_BOT_TOKEN),

    // Optional with defaults
    logLevel: validateLogLevel(process.env.LOG_LEVEL),
    requestTimeout: validateNumber(process.env.REQUEST_TIMEOUT, 30000, 5000, 120000),
    maxRetries: validateNumber(process.env.MAX_RETRIES, 3, 0, 10),
    rateLimitPerMinute: validateNumber(process.env.RATE_LIMIT_PER_MINUTE, 30, 1, 60),

    // Optional
    webhookUrl: process.env.WEBHOOK_URL,
    webhookSecret: process.env.WEBHOOK_SECRET,
    webhookPort: process.env.WEBHOOK_PORT
      ? parseInt(process.env.WEBHOOK_PORT, 10)
      : undefined,

    // Health check
    healthPort: process.env.HEALTH_PORT
      ? parseInt(process.env.HEALTH_PORT, 10)
      : undefined,

    // Debug
    debug: process.env.DEBUG === "true",
  };

  // Cache the config
  cachedConfig = config;

  return config;
}

/**
 * Get current configuration.
 * Throws if config hasn't been loaded yet.
 */
export function getConfig(): ServerConfig {
  if (!cachedConfig) {
    return loadConfig();
  }
  return cachedConfig;
}

/**
 * Clear cached configuration (useful for testing)
 */
export function clearConfigCache(): void {
  cachedConfig = null;
}

/**
 * Mask sensitive values for logging
 */
export function getSafeConfigForLogging(): Record<string, unknown> {
  const config = getConfig();
  return {
    botToken: maskToken(config.botToken),
    logLevel: config.logLevel,
    requestTimeout: config.requestTimeout,
    maxRetries: config.maxRetries,
    rateLimitPerMinute: config.rateLimitPerMinute,
    webhookUrl: config.webhookUrl ? maskUrl(config.webhookUrl) : undefined,
    webhookSecret: config.webhookSecret ? "[REDACTED]" : undefined,
    webhookPort: config.webhookPort,
    healthPort: config.healthPort,
    debug: config.debug,
  };
}

/**
 * Mask a bot token for safe logging
 * Shows first 4 and last 4 characters only
 */
function maskToken(token: string): string {
  if (token.length <= 12) {
    return "[REDACTED]";
  }
  return `${token.slice(0, 4)}...${token.slice(-4)}`;
}

/**
 * Mask a URL for safe logging
 * Shows domain only
 */
function maskUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.host}/***`;
  } catch {
    return "[INVALID_URL]";
  }
}
