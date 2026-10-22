/**
 * RS-082 — AI Bullet Improver Server Route Handler
 *
 * Exposes a protected, rate-limited, server-side endpoint for bullet refinement.
 * Performs input schema validation, rate checking, provider calling, and error sanitization.
 */
import { NextRequest, NextResponse } from "next/server";
import { BulletImprovementRequestSchema } from "@/lib/ai/schemas";
import { getAIProvider, AIProviderException } from "@/lib/ai/provider";
import { checkRateLimit } from "@/lib/ai/rate-limiter";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  // 1. Rate Limiting Check
  const clientIp =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1";

  const rateCheck = checkRateLimit(clientIp, 20, 60_000, "improve-bullet");
  if (!rateCheck.allowed) {
    logger.warn("AI rate limit reached", { route: "/api/ai/improve-bullet", status: 429 });
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
      {
        ok: false,
        code: "INVALID_REQUEST",
        error: "Invalid JSON request payload.",
      },
      { status: 400 }
    );
  }

  const parsed = BulletImprovementRequestSchema.safeParse(body);
  if (!parsed.success) {
    const errorDetails = parsed.error.issues.map((i) => i.message).join("; ");
    return NextResponse.json(
      {
        ok: false,
        code: "INVALID_REQUEST",
        error: `Input validation failed: ${errorDetails}`,
      },
      { status: 400 }
    );
  }

  // 3. Invoke Provider
  const provider = getAIProvider();

  try {
    const result = await provider.improveBullet(parsed.data);
    return NextResponse.json({
      ok: true,
      data: result,
    });
  } catch (err: unknown) {
    if (err instanceof AIProviderException) {
      const status =
        err.code === "NOT_CONFIGURED"
          ? 503
          : err.code === "RATE_LIMITED"
          ? 429
          : err.code === "TIMEOUT"
          ? 504
          : err.code === "VALIDATION_FAILED"
          ? 502
          : 500;

      logger.warn(`AI Provider exception: ${err.code}`, {
        route: "/api/ai/improve-bullet",
        status,
        errorCode: err.code,
      });

      return NextResponse.json(
        {
          ok: false,
          code: err.code,
          error: err.message,
          isRetryable: err.isRetryable,
        },
        { status }
      );
    }

    // Generic sanitized error
    logger.error("Unexpected error in improve-bullet route", err, {
      route: "/api/ai/improve-bullet",
      status: 500,
    });

    return NextResponse.json(
      {
        ok: false,
        code: "PROVIDER_ERROR",
        error: "An unexpected error occurred while communicating with the AI service.",
        isRetryable: true,
      },
      { status: 500 }
    );
  }
}
