/**
 * RS-083 — AI Summary Helper Server Route Handler
 *
 * Accepts a structured resume context and returns a grounded summary proposal.
 * Rate-limited, schema-validated, and server-side only.
 */
import { NextRequest, NextResponse } from "next/server";
import { SummaryImprovementRequestSchema } from "@/lib/ai/schemas";
import { getAIProvider, AIProviderException } from "@/lib/ai/provider";
import { checkRateLimit } from "@/lib/ai/rate-limiter";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  // 1. Rate Limiting
  const clientIp =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1";

  const rateCheck = checkRateLimit(clientIp, 10, 60_000, "improve-summary");
  if (!rateCheck.allowed) {
    logger.warn("AI rate limit reached", { route: "/api/ai/improve-summary", status: 429 });
    return NextResponse.json(
      {
        ok: false,
        code: "RATE_LIMITED",
        error: "Too many AI requests. Please wait a minute before trying again.",
      },
      {
        status: 429,
        headers: { "Retry-After": Math.ceil(rateCheck.resetMs / 1000).toString() },
      }
    );
  }

  // 2. Parse & Validate Request Body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, code: "INVALID_REQUEST", error: "Invalid JSON request payload." },
      { status: 400 }
    );
  }

  const parsed = SummaryImprovementRequestSchema.safeParse(body);
  if (!parsed.success) {
    const errorDetails = parsed.error.issues.map((i) => i.message).join("; ");
    return NextResponse.json(
      { ok: false, code: "INVALID_REQUEST", error: `Input validation failed: ${errorDetails}` },
      { status: 400 }
    );
  }

  // 3. Invoke Provider
  const provider = getAIProvider();

  try {
    const result = await provider.improveSummary(parsed.data);
    return NextResponse.json({ ok: true, data: result });
  } catch (err: unknown) {
    if (err instanceof AIProviderException) {
      const status =
        err.code === "NOT_CONFIGURED" ? 503
          : err.code === "RATE_LIMITED" ? 429
          : err.code === "TIMEOUT" ? 504
          : err.code === "VALIDATION_FAILED" ? 502
          : 500;

      logger.warn(`AI Provider exception: ${err.code}`, {
        route: "/api/ai/improve-summary",
        status,
        errorCode: err.code,
      });

      return NextResponse.json(
        { ok: false, code: err.code, error: err.message, isRetryable: err.isRetryable },
        { status }
      );
    }

    logger.error("Unexpected error in improve-summary route", err, {
      route: "/api/ai/improve-summary",
      status: 500,
    });

    return NextResponse.json(
      { ok: false, code: "PROVIDER_ERROR", error: "An unexpected error occurred while communicating with the AI service.", isRetryable: true },
      { status: 500 }
    );
  }
}
