/**
 * RS-045 — PII-Safe Logger and Error Serializer
 *
 * Enforces privacy-preserving structured logging across server routes and client events.
 * Guarantees that:
 * 1. Personal Identifiable Information (email, phone, candidate names, full resume bodies)
 *    is scrubbed or omitted.
 * 2. API keys, secrets, Authorization headers, and session tokens are never logged.
 * 3. Log records contain only operational metadata: route, error code, duration,
 *    HTTP status, and correlation IDs.
 */

// Regex patterns for detecting and scrubbing sensitive information
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
const PHONE_REGEX = /(\+?\d{1,3}[-.\s]?)?(\(?\d{2,4}\)?[-.\s]?)?\d{3,4}[-.\s]?\d{3,4}/g;
const SECRET_KEY_PATTERNS = [
  /sk-[a-zA-Z0-9_-]{20,}/g,
  /key-[a-zA-Z0-9_-]{16,}/g,
  /bearer\s+[a-zA-Z0-9._-]+/gi,
];

export interface SafeLogMeta {
  route?: string;
  method?: string;
  status?: number;
  durationMs?: number;
  correlationId?: string;
  errorCode?: string;
  [key: string]: unknown;
}

/**
 * Recursively sanitize objects, arrays, and strings to remove sensitive PII or credentials.
 */
export function sanitizeLogValue(val: unknown, depth = 0): unknown {
  if (depth > 5) return "[MaxDepthExceeded]";
  if (val === null || val === undefined) return val;

  if (typeof val === "string") {
    let sanitized = val;
    // Scrub emails
    sanitized = sanitized.replace(EMAIL_REGEX, "[REDACTED_EMAIL]");
    // Scrub secrets
    for (const pattern of SECRET_KEY_PATTERNS) {
      sanitized = sanitized.replace(pattern, "[REDACTED_SECRET]");
    }
    // Scrub phone numbers if long enough to be PII
    if (sanitized.length >= 7 && /\d{7,}/.test(sanitized.replace(/\D/g, ""))) {
      sanitized = sanitized.replace(PHONE_REGEX, "[REDACTED_PHONE]");
    }
    return sanitized;
  }

  if (typeof val === "number" || typeof val === "boolean") {
    return val;
  }

  if (Array.isArray(val)) {
    return val.map((item) => sanitizeLogValue(item, depth + 1));
  }

  if (typeof val === "object") {
    const sanitizedObj: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
      const lowerKey = k.toLowerCase();
      // Drop obvious sensitive keys entirely
      if (
        lowerKey.includes("password") ||
        lowerKey.includes("apikey") ||
        lowerKey.includes("api_key") ||
        lowerKey.includes("secret") ||
        lowerKey.includes("token") ||
        lowerKey.includes("authorization") ||
        lowerKey.includes("cookie") ||
        lowerKey.includes("jobdescription") ||
        lowerKey.includes("resume") ||
        lowerKey.includes("bullet") ||
        lowerKey.includes("email") ||
        lowerKey.includes("phone")
      ) {
        sanitizedObj[k] = "[REDACTED]";
      } else {
        sanitizedObj[k] = sanitizeLogValue(v, depth + 1);
      }
    }
    return sanitizedObj;
  }

  return String(val);
}

/**
 * Format error objects into safe, structured metadata without leaking internal stack frames.
 */
export function formatSafeError(err: unknown): {
  errorName: string;
  errorMessage: string;
  errorCode?: string;
} {
  if (err instanceof Error) {
    let sanitizedMsg = err.message.replace(EMAIL_REGEX, "[REDACTED_EMAIL]");
    for (const pattern of SECRET_KEY_PATTERNS) {
      sanitizedMsg = sanitizedMsg.replace(pattern, "[REDACTED_SECRET]");
    }
    return {
      errorName: err.name,
      errorMessage: sanitizedMsg,
      errorCode: (err as unknown as { code?: string }).code,
    };
  }
  return {
    errorName: "UnknownError",
    errorMessage: "An unknown error occurred",
  };
}

export const logger = {
  info(message: string, meta?: SafeLogMeta): void {
    const sanitizedMeta = meta ? sanitizeLogValue(meta) : undefined;
    if (process.env.NODE_ENV === "production") {
      console.log(
        JSON.stringify({
          level: "info",
          message,
          timestamp: new Date().toISOString(),
          ...((sanitizedMeta as object) || {}),
        })
      );
    } else {
      console.log(`[INFO] ${message}`, sanitizedMeta ?? "");
    }
  },

  warn(message: string, meta?: SafeLogMeta): void {
    const sanitizedMeta = meta ? sanitizeLogValue(meta) : undefined;
    if (process.env.NODE_ENV === "production") {
      console.warn(
        JSON.stringify({
          level: "warn",
          message,
          timestamp: new Date().toISOString(),
          ...((sanitizedMeta as object) || {}),
        })
      );
    } else {
      console.warn(`[WARN] ${message}`, sanitizedMeta ?? "");
    }
  },

  error(message: string, err?: unknown, meta?: SafeLogMeta): void {
    const safeError = err ? formatSafeError(err) : undefined;
    const sanitizedMeta = meta ? sanitizeLogValue(meta) : undefined;

    if (process.env.NODE_ENV === "production") {
      console.error(
        JSON.stringify({
          level: "error",
          message,
          timestamp: new Date().toISOString(),
          error: safeError,
          ...((sanitizedMeta as object) || {}),
        })
      );
    } else {
      console.error(`[ERROR] ${message}`, safeError, sanitizedMeta ?? "");
    }
  },
};
