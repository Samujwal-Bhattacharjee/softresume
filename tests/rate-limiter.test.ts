import { describe, it, expect, beforeEach } from "vitest";
import {
  checkRateLimit,
  resetRateLimits,
  sanitizeIdentifier,
  setRateLimiterStore,
  InMemoryRateLimiterStore,
  getRateLimitStoreEntryCount,
  type RateLimiterStore,
} from "@/lib/ai/rate-limiter";

describe("AI Rate Limiting Subsystem (Workstream B / RS-082 / RS-150)", () => {
  beforeEach(() => {
    resetRateLimits();
    setRateLimiterStore(new InMemoryRateLimiterStore());
  });

  describe("Identifier Sanitization & Length Bounding", () => {
    it("sanitizes control characters and strips dangerous whitespace", () => {
      const dirty = "192.168.1.1\r\n\t\x00malicious";
      const clean = sanitizeIdentifier(dirty);
      expect(clean).toBe("192.168.1.1malicious");
    });

    it("bounds identifier length to 128 characters to protect memory", () => {
      const veryLong = "a".repeat(1000);
      const clean = sanitizeIdentifier(veryLong);
      expect(clean.length).toBe(128);
    });

    it("falls back to 'anonymous' if identifier is completely empty or stripped", () => {
      expect(sanitizeIdentifier("")).toBe("anonymous");
      expect(sanitizeIdentifier("\x00\x01\x02")).toBe("anonymous");
    });
  });

  describe("Scope Isolation", () => {
    it("isolates quotas across distinct feature scopes for the same IP", () => {
      const ip = "10.0.0.1";

      // Consume 10 requests on bullet-improver
      for (let i = 0; i < 10; i++) {
        const res = checkRateLimit(ip, 10, 60_000, "bullet-improver");
        expect(res.allowed).toBe(true);
      }

      // 11th request on bullet-improver is rejected
      const bulletReject = checkRateLimit(ip, 10, 60_000, "bullet-improver");
      expect(bulletReject.allowed).toBe(false);

      // But summary-helper scope still has its full 10-request allowance
      const summaryAllowed = checkRateLimit(ip, 10, 60_000, "summary-helper");
      expect(summaryAllowed.allowed).toBe(true);
      expect(summaryAllowed.remaining).toBe(9);
    });
  });

  describe("Memory Bounds & Pruning", () => {
    it("evicts stale records when memory bounds are approached", () => {
      const store = new InMemoryRateLimiterStore();
      setRateLimiterStore(store);

      // Add entries
      for (let i = 0; i < 50; i++) {
        checkRateLimit(`test-ip-${i}`, 5, 60_000, "scope");
      }
      expect(getRateLimitStoreEntryCount()).toBe(50);

      // Reset works
      resetRateLimits();
      expect(getRateLimitStoreEntryCount()).toBe(0);
    });
  });

  describe("Pluggable Distributed Store Interface Contract", () => {
    it("allows plugging a custom RateLimiterStore implementation", () => {
      let customChecked = false;
      const customStore: RateLimiterStore = {
        check: () => {
          customChecked = true;
          return { allowed: true, remaining: 99, resetMs: 5000 };
        },
        reset: () => {},
        getEntryCount: () => 1,
      };

      setRateLimiterStore(customStore);
      const res = checkRateLimit("client-1", 10, 60_000);
      expect(customChecked).toBe(true);
      expect(res.remaining).toBe(99);
    });
  });
});
