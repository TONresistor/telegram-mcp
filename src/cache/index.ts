/**
 * Response Cache Module
 *
 * Simple TTL-based cache for Telegram API responses.
 * Reduces API calls for data that rarely changes.
 */

import { createLogger } from "../logging/index.js";
import { cacheHitsTotal, cacheMissesTotal, cacheSize } from "../metrics/index.js";

const logger = createLogger("cache");

// =============================================================================
// TYPES
// =============================================================================

interface CacheEntry<T = unknown> {
  data: T;
  expiresAt: number;
}

// =============================================================================
// CACHE CONFIGURATION
// =============================================================================

/**
 * TTL configuration for cacheable methods (in milliseconds)
 */
export const CACHE_TTL: Record<string, number> = {
  getMe: 60 * 60 * 1000,        // 1 hour - bot info rarely changes
  getWebhookInfo: 60 * 1000,    // 1 minute - webhook status can change
  getStickerSet: 5 * 60 * 1000, // 5 minutes - sticker sets update occasionally
  getChat: 2 * 60 * 1000,       // 2 minutes - chat info changes sometimes
};

// =============================================================================
// CACHE STORAGE
// =============================================================================

const cache = new Map<string, CacheEntry>();

// =============================================================================
// CACHE FUNCTIONS
// =============================================================================

/**
 * Generate cache key from method and params
 */
function generateKey(method: string, params: Record<string, unknown>): string {
  return `${method}:${JSON.stringify(params)}`;
}

/**
 * Check if a method is cacheable
 */
export function isCacheable(method: string): boolean {
  return method in CACHE_TTL;
}

/**
 * Get cached response if available and not expired
 */
export function getCached<T = unknown>(
  method: string,
  params: Record<string, unknown>
): T | null {
  const key = generateKey(method, params);
  const entry = cache.get(key);

  if (!entry) {
    cacheMissesTotal.inc({ method });
    return null;
  }

  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    cacheSize.set(cache.size);
    cacheMissesTotal.inc({ method });
    logger.debug("Cache expired", { method, key });
    return null;
  }

  cacheHitsTotal.inc({ method });
  logger.debug("Cache hit", { method, key });
  return entry.data as T;
}

/**
 * Store response in cache
 */
export function setCache<T = unknown>(
  method: string,
  params: Record<string, unknown>,
  data: T,
  ttlMs?: number
): void {
  const key = generateKey(method, params);
  const ttl = ttlMs ?? CACHE_TTL[method];

  if (!ttl) {
    return;
  }

  cache.set(key, {
    data,
    expiresAt: Date.now() + ttl,
  });

  cacheSize.set(cache.size);
  logger.debug("Cache set", { method, key, ttlMs: ttl });
}

/**
 * Clear all cached entries
 */
export function clearCache(): void {
  const size = cache.size;
  cache.clear();
  cacheSize.set(0);
  logger.info("Cache cleared", { entriesRemoved: size });
}

/**
 * Clear cached entries for a specific method
 */
export function clearCacheForMethod(method: string): void {
  const prefix = `${method}:`;
  let removed = 0;

  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
      removed++;
    }
  }

  if (removed > 0) {
    cacheSize.set(cache.size);
    logger.debug("Cache cleared for method", { method, entriesRemoved: removed });
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { size: number; methods: Record<string, number> } {
  const methods: Record<string, number> = {};

  for (const key of cache.keys()) {
    const method = key.split(":")[0];
    methods[method] = (methods[method] || 0) + 1;
  }

  return {
    size: cache.size,
    methods,
  };
}
