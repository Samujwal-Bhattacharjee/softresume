# ADR-002 — AI Provider Abstraction, Grounding, and Truth Preservation

**Status:** Accepted  
**Date:** 2026-10-20  
**Author:** Lead Full-Stack & Security Engineer (Antigravity Sprint)

---

## Context

SoftCV Studio requires an AI assistant to assist candidates with refining resume bullet points and summaries.
Key risks and requirements:
1. **Security & Privacy:** Provider API keys must never be bundled into client JavaScript. Resume content must not be logged or persisted in third-party telemetry without consent.
2. **Hallucination / Fabrication Risk:** AI must NEVER invent credentials, metrics, percentages, team sizes, revenue, technologies, or dates.
3. **Prompt Injection:** Untrusted user input (candidate bullets, pasted job descriptions) could attempt to override system instructions or exfiltrate prompts.
4. **Resilience & Honesty:** When unconfigured (e.g., local development or demo mode), the application must display an honest configuration-required notice instead of fabricating fake success states.

---

## Decision

1. **Server-Side Provider Abstraction (`RS-080`):**
   - Implemented `AIProvider` interface with a concrete `StandardHttpAIProvider` and testing `MockAIProvider`.
   - Provider calls are restricted entirely to server-side Next.js route handlers (`/api/ai/improve-bullet`).
   - Credentials are read solely from server environment variables (`AI_API_KEY`, `AI_PROVIDER`, `AI_MODEL`, `AI_BASE_URL`).
   - Timeouts are strictly bounded to 15 seconds with `AbortController`, and retries are bounded to 1 transient retry.

2. **Structured Response Schemas (`RS-081`):**
   - Both request bodies and model responses are strictly validated using Zod schemas (`BulletImprovementRequestSchema`, `BulletImprovementResponseSchema`).
   - Output must contain: `proposed`, `explanation`, `followUpQuestions`, `assumptions`, and `preservedFacts`.
   - The UI never executes or trusts raw HTML or JavaScript from the model.

3. **Truth Preservation & Prompt Injection Defense (`RS-084`):**
   - Candidate bullet text is quarantined inside `<user_candidate_bullet>` XML containers.
   - Privileged system prompts instruct the model to treat container content strictly as passive data and reject any embedded instructions (e.g. "ignore previous instructions").
   - If a measurable metric or outcome is absent from the input, the model is forbidden from inventing numbers or inserting placeholders like `[X]%`; it must ask for the metric in `followUpQuestions`.

4. **Human-in-the-Loop Review Slice (`RS-082`):**
   - Suggested text is shown in a side-by-side review modal.
   - The user has three choices: **Accept & Apply**, **Edit & Apply**, or **Reject & Keep Original**.
   - Resume state is only mutated when the user explicitly accepts.

5. **Local / Demo Mode Graceful Degradation:**
   - When `AI_API_KEY` is not present, the system returns a 503 with code `NOT_CONFIGURED`.
   - The UI displays an honest banner explaining that the assistant is in local demo mode, instructing the developer on how to configure `.env.local`.

---

## Consequences

- Full protection against client-side key leakage.
- Deterministic automated testing using `MockAIProvider` without incurring paid token costs or network flakiness.
- User retains complete ownership and factual authority over resume contents.
