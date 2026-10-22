/**
 * RS-082 / RS-084 / RS-150 — Rate Limiting Subsystem & Store Contract
 *
 * Provides application-level rate limiting per client IP and feature scope to
 * prevent unintentional spam and service degradation.
 *
 * Architectural Architecture:
 * - Default runtime: Bounded in-memory sliding-window limiter (`InMemoryRateLimiterStore`).
 * - Security bounds: Memory capped at MAX_RATE_LIMIT_ENTRIES (5,000) with automatic stale eviction
 *   and LRU pruning, plus identifier sanitization (max 128 chars) to prevent header memory exhaustion.
 * - Multi-container roadmap: Defines `RateLimiterStore` interface so distributed backends
 *   (e.g., Upstash Redis, PostgreSQL token bucket, or Cloudflare KV) can be plugged in seamlessly.
 */

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetMs: number;
}

export interface RateLimiterStore {
  check(key: string, maxRequests: number, windowMs: number): Promise<RateLimitResult> | RateLimitResult;
  reset?(): Promise<void> | void;
  getEntryCount?(): number;
}

interface RateLimitRecord {
  timestamps: number[];
  lastAccessed: number;
}

export const MAX_RATE_LIMIT_ENTRIES = 5000;
const CLEANUP_INTERVAL_MS = 60_000;

export function sanitizeIdentifier(identifier: string): string {
  // Strip control and non-ASCII printable chars, cap at 128 chars to prevent memory bloat
  const clean = identifier.replace(/[^\x20-\x7E]/g, "").trim().slice(0, 128);
  return clean || "anonymous";
}

export class InMemoryRateLimiterStore implements RateLimiterStore {
  private map = new Map<string, RateLimitRecord>();
  private lastCleanup = Date.now();

  private cleanupStale(windowMs: number, force = false): void {
    const now = Date.now();
    if (!force && now - this.lastCleanup < CLEANUP_INTERVAL_MS) return;
    this.lastCleanup = now;

    for (const [key, record] of this.map.entries()) {
      record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);
      if (record.timestamps.length === 0) {
        this.map.delete(key);
      }
    }
  }

  private enforceMemoryBounds(windowMs: number): void {
    if (this.map.size < MAX_RATE_LIMIT_ENTRIES) return;

    // First try standard cleanup
    this.cleanupStale(windowMs, true);

    // If still at or over bound, evict oldest entries by lastAccessed
    if (this.map.size >= MAX_RATE_LIMIT_ENTRIES) {
      const targetSize = Math.floor(MAX_RATE_LIMIT_ENTRIES * 0.8);
      const sorted = Array.from(this.map.entries()).sort(
        (a, b) => a[1].lastAccessed - b[1].lastAccessed
      );
      const toRemove = this.map.size - targetSize;
      for (let i = 0; i < toRemove; i++) {
        if (sorted[i]) {
          this.map.delete(sorted[i][0]);
        }
      }
    }
  }

  check(key: string, maxRequests: number, windowMs: number): RateLimitResult {
    const now = Date.now();
    this.cleanupStale(windowMs);
    this.enforceMemoryBounds(windowMs);

    let record = this.map.get(key);
    if (!record) {
      record = { timestamps: [], lastAccessed: now };
      this.map.set(key, record);
    } else {
      record.lastAccessed = now;
    }

    // Filter timestamps within current window
    record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

    if (record.timestamps.length >= maxRequests) {
      const oldest = record.timestamps[0];
      const resetMs = Math.max(0, oldest + windowMs - now);
      return {
        allowed: false,
        remaining: 0,
        resetMs,
      };
    }

    record.timestamps.push(now);
    return {
      allowed: true,
      remaining: maxRequests - record.timestamps.length,
      resetMs: windowMs,
    };
  }

  reset(): void {
    this.map.clear();
    this.lastCleanup = Date.now();
  }

  getEntryCount(): number {
    return this.map.size;
  }
}

// Global default singleton store (in-memory)
let activeStore: RateLimiterStore = new InMemoryRateLimiterStore();

export function setRateLimiterStore(store: RateLimiterStore): void {
  activeStore = store;
}

export function resetRateLimits(): void {
  if (activeStore.reset) {
    activeStore.reset();
  }
}

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 20,
  windowMs: number = 60_000,
  scope?: string
): RateLimitResult {
  const cleanId = sanitizeIdentifier(identifier);
  const compositeKey = scope ? `${scope}:${cleanId}` : cleanId;
  return activeStore.check(compositeKey, maxRequests, windowMs) as RateLimitResult;
}

export function getRateLimitStoreEntryCount(): number {
  return activeStore.getEntryCount ? activeStore.getEntryCount() : 0;
}
