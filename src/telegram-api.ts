/**
 * Telegram Bot API Client
 *
 * Handles all HTTP requests to the Telegram API with:
 * - Configuration-based token management
 * - Structured logging
 * - Rate limiting (global + per-chat)
 * - Circuit breaker for cascading failure protection
 * - Automatic retries with exponential backoff
 * - Proper error handling
 */

import { getConfig } from "./config/index.js";
import { createLogger } from "./logging/index.js";
import { getCached, setCache, isCacheable, CACHE_TTL } from "./cache/index.js";
import {
  FILE_UPLOAD_METHODS,
  checkForFileUploads,
  createMultipartFormData,
  validateFiles,
} from "./upload/index.js";
import {
  requestsTotal,
  requestDuration,
  circuitBreakerState,
  circuitBreakerTripsTotal,
  rateLimiterRequests,
  rateLimitHitsTotal,
  retriesTotal,
  activeChatsTracked,
  circuitBreakerStateToNumber,
} from "./metrics/index.js";

const logger = createLogger("telegram-api");

// =============================================================================
// CONSTANTS
// =============================================================================

const TELEGRAM_API_BASE = "https://api.telegram.org/bot";

// =============================================================================
// TYPES
// =============================================================================

/**
 * Error categories for classification and monitoring
 */
export enum ErrorCategory {
  VALIDATION = "VALIDATION",     // Bad input (missing/invalid params)
  CLIENT = "CLIENT",             // 4xx errors (bad request, forbidden, not found)
  SERVER = "SERVER",             // 5xx errors (Telegram server issues)
  NETWORK = "NETWORK",           // Connection failures
  RATE_LIMITED = "RATE_LIMITED", // 429 Too Many Requests
  TIMEOUT = "TIMEOUT",           // Request timeout
  CIRCUIT_OPEN = "CIRCUIT_OPEN", // Circuit breaker open
}

/**
 * Categorize an error based on response
 */
export function categorizeError(response: TelegramResponse<unknown>): ErrorCategory {
  if (response.ok) {
    throw new Error("Cannot categorize successful response");
  }

  // Check description for timeout
  if (response.description?.toLowerCase().includes("timeout")) {
    return ErrorCategory.TIMEOUT;
  }

  // Check description for circuit breaker
  if (response.description?.includes("circuit breaker")) {
    return ErrorCategory.CIRCUIT_OPEN;
  }

  // Check error code
  if (!response.error_code) {
    return ErrorCategory.NETWORK;
  }

  if (response.error_code === 429) {
    return ErrorCategory.RATE_LIMITED;
  }

  if (response.error_code >= 500) {
    return ErrorCategory.SERVER;
  }

  if (response.error_code >= 400) {
    return ErrorCategory.CLIENT;
  }

  return ErrorCategory.NETWORK;
}

/**
 * Telegram API response structure
 */
export interface TelegramResponse<T = unknown> {
  ok: boolean;
  result?: T;
  description?: string;
  error_code?: number;
  parameters?: {
    migrate_to_chat_id?: number;
    retry_after?: number;
  };
}

/**
 * API call options
 */
interface ApiCallOptions {
  /** Request timeout in ms (uses config default if not specified) */
  timeout?: number;
  /** Number of retries (uses config default if not specified) */
  maxRetries?: number;
  /** Skip rate limiting check */
  skipRateLimit?: boolean;
}

// =============================================================================
// RATE LIMITING
// =============================================================================

class RateLimiter {
  private requests: number[] = [];
  private limitPerMinute: number;

  constructor(limitPerMinute: number) {
    this.limitPerMinute = limitPerMinute;
  }

  /**
   * Check if we can make a request
   */
  canMakeRequest(): boolean {
    this.cleanup();
    return this.requests.length < this.limitPerMinute;
  }

  /**
   * Record a request
   */
  recordRequest(): void {
    this.requests.push(Date.now());
  }

  /**
   * Get time to wait before next request (in ms)
   */
  getWaitTime(): number {
    this.cleanup();
    if (this.requests.length < this.limitPerMinute) {
      return 0;
    }
    const oldestRequest = this.requests[0];
    return Math.max(0, 60000 - (Date.now() - oldestRequest));
  }

  /**
   * Get current requests in window (for metrics/health)
   */
  getRequestCount(): number {
    this.cleanup();
    return this.requests.length;
  }

  /**
   * Check if currently limited (for health)
   */
  isLimited(): boolean {
    return !this.canMakeRequest();
  }

  /**
   * Remove requests older than 1 minute
   */
  private cleanup(): void {
    const oneMinuteAgo = Date.now() - 60000;
    this.requests = this.requests.filter((time) => time > oneMinuteAgo);
  }
}

let rateLimiter: RateLimiter | null = null;

function getRateLimiter(): RateLimiter {
  if (!rateLimiter) {
    const config = getConfig();
    rateLimiter = new RateLimiter(config.rateLimitPerMinute);
  }
  return rateLimiter;
}

// =============================================================================
// PER-CHAT RATE LIMITING
// =============================================================================

/**
 * Per-chat rate limiter
 *
 * Telegram limits:
 * - Private chats: 1 message/second
 * - Groups/channels: 20 messages/minute
 *
 * Chat ID detection:
 * - Negative IDs = groups/channels
 * - Positive IDs = private chats
 */
class PerChatRateLimiter {
  private chatTimestamps: Map<string, number[]> = new Map();
  private lastCleanup = Date.now();
  private readonly cleanupIntervalMs = 60000; // Cleanup every minute

  // Limits
  private readonly privateMessageIntervalMs = 1000; // 1 msg/sec for private
  private readonly groupMessagesPerMinute = 20;     // 20 msgs/min for groups

  /**
   * Check if we can send to a chat
   */
  canSendToChat(chatId: string | number): boolean {
    this.maybeCleanup();
    const id = String(chatId);
    const timestamps = this.chatTimestamps.get(id) || [];
    const isGroup = this.isGroupChat(chatId);

    if (isGroup) {
      // Group: 20 messages per minute
      const oneMinuteAgo = Date.now() - 60000;
      const recentCount = timestamps.filter(t => t > oneMinuteAgo).length;
      return recentCount < this.groupMessagesPerMinute;
    } else {
      // Private: 1 message per second
      const lastMessage = timestamps[timestamps.length - 1];
      if (!lastMessage) return true;
      return Date.now() - lastMessage >= this.privateMessageIntervalMs;
    }
  }

  /**
   * Record a message sent to a chat
   */
  recordChatMessage(chatId: string | number): void {
    const id = String(chatId);
    const timestamps = this.chatTimestamps.get(id) || [];
    timestamps.push(Date.now());
    this.chatTimestamps.set(id, timestamps);
  }

  /**
   * Get wait time for a chat (in ms)
   */
  getWaitTimeForChat(chatId: string | number): number {
    this.maybeCleanup();
    const id = String(chatId);
    const timestamps = this.chatTimestamps.get(id) || [];
    const isGroup = this.isGroupChat(chatId);

    if (timestamps.length === 0) return 0;

    if (isGroup) {
      // Group: check if under 20/min limit
      const oneMinuteAgo = Date.now() - 60000;
      const recentTimestamps = timestamps.filter(t => t > oneMinuteAgo);
      if (recentTimestamps.length < this.groupMessagesPerMinute) {
        return 0;
      }
      // Wait until oldest recent message expires
      const oldest = recentTimestamps[0];
      return Math.max(0, 60000 - (Date.now() - oldest));
    } else {
      // Private: check 1/sec limit
      const lastMessage = timestamps[timestamps.length - 1];
      const elapsed = Date.now() - lastMessage;
      if (elapsed >= this.privateMessageIntervalMs) {
        return 0;
      }
      return this.privateMessageIntervalMs - elapsed;
    }
  }

  /**
   * Detect if chat is a group (negative ID) or private (positive ID)
   * Default to group limits (more conservative) if unknown
   */
  private isGroupChat(chatId: string | number): boolean {
    const id = typeof chatId === "string" ? parseInt(chatId, 10) : chatId;
    // Negative IDs are groups/channels, positive are users
    // If we can't parse, default to group (conservative)
    return isNaN(id) || id < 0;
  }

  /**
   * Cleanup old entries periodically
   */
  private maybeCleanup(): void {
    if (Date.now() - this.lastCleanup < this.cleanupIntervalMs) {
      return;
    }
    this.lastCleanup = Date.now();
    const oneMinuteAgo = Date.now() - 60000;

    for (const [chatId, timestamps] of this.chatTimestamps.entries()) {
      const recent = timestamps.filter(t => t > oneMinuteAgo);
      if (recent.length === 0) {
        this.chatTimestamps.delete(chatId);
      } else {
        this.chatTimestamps.set(chatId, recent);
      }
    }
  }

  /**
   * Get count of tracked chats (for metrics/health)
   */
  getTrackedChatsCount(): number {
    this.maybeCleanup();
    return this.chatTimestamps.size;
  }
}

let perChatLimiter: PerChatRateLimiter | null = null;

function getPerChatLimiter(): PerChatRateLimiter {
  if (!perChatLimiter) {
    perChatLimiter = new PerChatRateLimiter();
  }
  return perChatLimiter;
}

/**
 * Methods that send messages and need per-chat rate limiting
 */
const MESSAGE_SENDING_METHODS = new Set([
  "sendMessage",
  "sendPhoto",
  "sendAudio",
  "sendDocument",
  "sendVideo",
  "sendAnimation",
  "sendVoice",
  "sendVideoNote",
  "sendMediaGroup",
  "sendLocation",
  "sendVenue",
  "sendContact",
  "sendPoll",
  "sendDice",
  "sendSticker",
  "sendInvoice",
  "sendGame",
  "copyMessage",
  "forwardMessage",
]);

// =============================================================================
// CIRCUIT BREAKER
// =============================================================================

/**
 * Circuit breaker for cascading failure protection
 *
 * States:
 * - CLOSED: Normal operation, requests pass through
 * - OPEN: Failures exceeded threshold, requests rejected immediately
 * - HALF-OPEN: Testing if service recovered, one request allowed
 *
 * Only triggers on 5xx server errors and network failures.
 * Does NOT trigger on 429 (rate limit) - that's handled by retry_after.
 */
class CircuitBreaker {
  private consecutiveFailures = 0;
  private openedAt = 0;
  private state: "closed" | "open" | "half-open" = "closed";

  private readonly threshold = 5; // Open after 5 consecutive failures
  private readonly resetMs = 30000; // Try again after 30 seconds

  /**
   * Check if circuit is open (blocking requests)
   */
  isOpen(): boolean {
    if (this.state === "open") {
      // Check if reset timeout has passed
      if (Date.now() - this.openedAt >= this.resetMs) {
        this.state = "half-open";
        logger.info("Circuit breaker half-open, testing recovery");
        return false;
      }
      return true;
    }
    return false;
  }

  /**
   * Get current state for logging/monitoring
   */
  getState(): string {
    return this.state;
  }

  /**
   * Record a successful request
   */
  recordSuccess(): void {
    if (this.state === "half-open") {
      logger.info("Circuit breaker closed, service recovered");
    }
    this.consecutiveFailures = 0;
    this.state = "closed";
  }

  /**
   * Record a failed request
   * Only counts 5xx and network errors, NOT 429 or client errors
   */
  recordFailure(errorCode?: number): void {
    // Don't trip circuit on 429 (rate limit) or 4xx (client errors)
    if (errorCode !== undefined && errorCode < 500) {
      return;
    }

    this.consecutiveFailures++;
    if (this.consecutiveFailures >= this.threshold) {
      this.state = "open";
      this.openedAt = Date.now();
      // Update metrics
      circuitBreakerState.set(circuitBreakerStateToNumber(this.state));
      circuitBreakerTripsTotal.inc();
      logger.warning("Circuit breaker opened", {
        failures: this.consecutiveFailures,
        resetIn: `${this.resetMs / 1000}s`,
      });
    }
  }

  /**
   * Get consecutive failure count (for health)
   */
  getConsecutiveFailures(): number {
    return this.consecutiveFailures;
  }
}

let circuitBreaker: CircuitBreaker | null = null;

function getCircuitBreaker(): CircuitBreaker {
  if (!circuitBreaker) {
    circuitBreaker = new CircuitBreaker();
  }
  return circuitBreaker;
}

// =============================================================================
// RETRY LOGIC
// =============================================================================

/**
 * Calculate delay for exponential backoff
 */
function getRetryDelay(attempt: number, retryAfter?: number): number {
  // If Telegram tells us to wait, respect that
  if (retryAfter) {
    return retryAfter * 1000;
  }
  // Exponential backoff: 1s, 2s, 4s, 8s...
  return Math.min(1000 * Math.pow(2, attempt), 30000);
}

/**
 * Check if error is retryable
 */
function isRetryableError(response: TelegramResponse<unknown>): boolean {
  if (response.ok) return false;

  // Rate limited - always retry
  if (response.error_code === 429) return true;

  // Server errors - retry
  if (response.error_code && response.error_code >= 500) return true;

  // Network errors (no error_code) - retry
  if (!response.error_code && response.description?.includes("Network error")) {
    return true;
  }

  return false;
}

// =============================================================================
// API CLIENT
// =============================================================================

/**
 * Call the Telegram Bot API
 *
 * @param method - API method name (e.g., "sendMessage")
 * @param params - Method parameters
 * @param options - Call options (timeout, retries)
 * @returns API response
 */
export async function callTelegramAPI<T = unknown>(
  method: string,
  params: Record<string, unknown> = {},
  options: ApiCallOptions = {}
): Promise<TelegramResponse<T>> {
  const config = getConfig();
  const timeout = options.timeout ?? config.requestTimeout;
  const maxRetries = options.maxRetries ?? config.maxRetries;
  const startTime = Date.now();

  // Check cache first for cacheable methods
  if (isCacheable(method)) {
    const cached = getCached<T>(method, params);
    if (cached !== null) {
      return { ok: true, result: cached };
    }
  }

  // Check circuit breaker first
  const breaker = getCircuitBreaker();
  if (breaker.isOpen()) {
    logger.warning("Circuit breaker open, rejecting request", { method });
    requestsTotal.inc({ tool: method, status: "error", error_category: "CIRCUIT_OPEN" });
    return {
      ok: false,
      error_code: 503,
      description: "Service temporarily unavailable (circuit breaker open). Try again later.",
    };
  }

  // Check global rate limit
  if (!options.skipRateLimit) {
    const limiter = getRateLimiter();
    if (!limiter.canMakeRequest()) {
      const waitTime = limiter.getWaitTime();
      logger.warning("Global rate limit reached", { method, waitTime });
      rateLimitHitsTotal.inc({ type: "global" });
      requestsTotal.inc({ tool: method, status: "error", error_category: "RATE_LIMITED" });
      return {
        ok: false,
        error_code: 429,
        description: `Rate limit exceeded. Wait ${Math.ceil(waitTime / 1000)} seconds.`,
        parameters: { retry_after: Math.ceil(waitTime / 1000) },
      };
    }
  }

  // Check per-chat rate limit for message-sending methods
  if (!options.skipRateLimit && MESSAGE_SENDING_METHODS.has(method)) {
    const chatId = params.chat_id;
    if (chatId !== undefined) {
      const chatLimiter = getPerChatLimiter();
      if (!chatLimiter.canSendToChat(chatId as string | number)) {
        const waitTime = chatLimiter.getWaitTimeForChat(chatId as string | number);
        const waitSeconds = Math.ceil(waitTime / 1000);
        logger.warning("Per-chat rate limit reached", { method, chatId, waitTime });
        rateLimitHitsTotal.inc({ type: "per_chat" });
        requestsTotal.inc({ tool: method, status: "error", error_category: "RATE_LIMITED" });
        return {
          ok: false,
          error_code: 429,
          description: `Per-chat rate limit exceeded for chat ${chatId}. Wait ${waitSeconds} seconds.`,
          parameters: { retry_after: waitSeconds },
        };
      }
    }
  }

  // Build URL (token is never logged)
  const url = `${TELEGRAM_API_BASE}${config.botToken}/${method}`;

  // Clean params (remove undefined values)
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v !== undefined)
  );

  // Check for file uploads
  let useMultipart = false;
  let multipartData: { body: Buffer; contentType: string } | null = null;
  let finalParams = cleanParams;

  if (FILE_UPLOAD_METHODS.has(method)) {
    const fileCheck = checkForFileUploads(method, cleanParams);
    if (fileCheck.hasFiles) {
      try {
        // Validate that all files exist
        validateFiles(fileCheck.files);

        // Create multipart form-data
        multipartData = createMultipartFormData(fileCheck.cleanParams, fileCheck.files);
        finalParams = fileCheck.cleanParams;
        useMultipart = true;

        logger.debug("Using multipart upload", {
          method,
          fileCount: fileCheck.files.length,
          files: fileCheck.files.map(f => f.fileName),
        });
      } catch (fileError) {
        // File validation failed
        const errorMessage = fileError instanceof Error ? fileError.message : String(fileError);
        logger.error("File upload error", { method, error: errorMessage });
        return {
          ok: false,
          error_code: 400,
          description: `File upload error: ${errorMessage}`,
        };
      }
    }
  }

  // Log the call (without sensitive data)
  logger.debug("API call", { method, params: Object.keys(finalParams), useMultipart });

  // Retry loop
  let lastResponse: TelegramResponse<T> | null = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Record request for rate limiting
      getRateLimiter().recordRequest();

      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      // Build request options
      const requestOptions: RequestInit = {
        method: "POST",
        signal: controller.signal,
      };

      if (useMultipart && multipartData) {
        // Use multipart/form-data for file uploads
        requestOptions.headers = {
          "Content-Type": multipartData.contentType,
        };
        requestOptions.body = multipartData.body;
      } else {
        // Use JSON for regular requests
        requestOptions.headers = {
          "Content-Type": "application/json",
        };
        requestOptions.body = JSON.stringify(finalParams);
      }

      const response = await fetch(url, requestOptions);

      clearTimeout(timeoutId);

      const data = (await response.json()) as TelegramResponse<T>;
      lastResponse = data;

      // Success
      if (data.ok) {
        const durationMs = Date.now() - startTime;
        logger.debug("API success", { method });
        breaker.recordSuccess();

        // Record metrics
        requestsTotal.inc({ tool: method, status: "success", error_category: "" });
        requestDuration.observe({ tool: method, status: "success" }, durationMs / 1000);

        // Record per-chat message for rate limiting
        if (MESSAGE_SENDING_METHODS.has(method) && finalParams.chat_id !== undefined) {
          getPerChatLimiter().recordChatMessage(finalParams.chat_id as string | number);
        }

        // Store in cache for cacheable methods
        if (isCacheable(method) && data.result !== undefined) {
          setCache(method, finalParams, data.result, CACHE_TTL[method]);
        }

        return data;
      }

      // Check if we should retry
      if (isRetryableError(data) && attempt < maxRetries) {
        const delay = getRetryDelay(attempt, data.parameters?.retry_after);
        const reason = data.error_code === 429 ? "rate_limit" : "server_error";
        retriesTotal.inc({ tool: method, reason });
        logger.warning("API error, retrying", {
          method,
          attempt: attempt + 1,
          maxRetries,
          delay,
          errorCode: data.error_code,
        });
        await sleep(delay);
        continue;
      }

      // Non-retryable error
      const durationMs = Date.now() - startTime;
      const errorCategory = categorizeError(data);
      logger.error("API error", {
        method,
        category: errorCategory,
        errorCode: data.error_code,
        description: data.description,
      });
      requestsTotal.inc({ tool: method, status: "error", error_category: errorCategory });
      requestDuration.observe({ tool: method, status: "error" }, durationMs / 1000);
      breaker.recordFailure(data.error_code);
      return data;
    } catch (error) {
      // Handle fetch errors (network, timeout, etc.)
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const isTimeout =
        error instanceof Error && error.name === "AbortError";

      lastResponse = {
        ok: false,
        description: isTimeout
          ? `Request timeout after ${timeout}ms`
          : `Network error: ${errorMessage}`,
      };

      // Retry on network errors
      if (attempt < maxRetries) {
        const delay = getRetryDelay(attempt);
        retriesTotal.inc({ tool: method, reason: isTimeout ? "timeout" : "network" });
        logger.warning("Network error, retrying", {
          method,
          attempt: attempt + 1,
          maxRetries,
          delay,
          error: errorMessage,
        });
        await sleep(delay);
        continue;
      }

      const durationMs = Date.now() - startTime;
      const category = isTimeout ? ErrorCategory.TIMEOUT : ErrorCategory.NETWORK;
      logger.error("Network error", { method, category, error: errorMessage });
      requestsTotal.inc({ tool: method, status: "error", error_category: category });
      requestDuration.observe({ tool: method, status: "error" }, durationMs / 1000);
      breaker.recordFailure(); // Network error = no error_code, counts as server failure
      return lastResponse;
    }
  }

  // Should never reach here, but just in case
  return (
    lastResponse ?? {
      ok: false,
      description: "Unknown error",
    }
  );
}

// =============================================================================
// RESULT FORMATTING
// =============================================================================

/**
 * Format API response for MCP tool output
 */
export function formatResponse<T>(response: TelegramResponse<T>): string {
  if (response.ok) {
    return JSON.stringify(response.result, null, 2);
  } else {
    return JSON.stringify(
      {
        error: true,
        error_code: response.error_code,
        description: response.description,
        retry_after: response.parameters?.retry_after,
      },
      null,
      2
    );
  }
}

/**
 * Create MCP tool result content
 */
export function createToolResult(response: TelegramResponse<unknown>) {
  return {
    content: [
      {
        type: "text" as const,
        text: formatResponse(response),
      },
    ],
    isError: !response.ok,
  };
}

// =============================================================================
// UTILITIES
// =============================================================================

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// =============================================================================
// STATUS EXPORTS (for health check module)
// =============================================================================

/**
 * Get circuit breaker status for health checks
 */
export function getCircuitBreakerStatus(): {
  state: "closed" | "open" | "half-open";
  consecutiveFailures: number;
} {
  const breaker = getCircuitBreaker();
  // Force state check (may transition from open to half-open)
  breaker.isOpen();
  return {
    state: breaker.getState() as "closed" | "open" | "half-open",
    consecutiveFailures: breaker.getConsecutiveFailures(),
  };
}

/**
 * Get rate limiter status for health checks
 */
export function getRateLimiterStatus(): {
  requestsInWindow: number;
  limited: boolean;
  perChatTracked: number;
} {
  const limiter = getRateLimiter();
  const chatLimiter = getPerChatLimiter();

  // Update metrics
  rateLimiterRequests.set(limiter.getRequestCount());
  activeChatsTracked.set(chatLimiter.getTrackedChatsCount());

  return {
    requestsInWindow: limiter.getRequestCount(),
    limited: limiter.isLimited(),
    perChatTracked: chatLimiter.getTrackedChatsCount(),
  };
}
