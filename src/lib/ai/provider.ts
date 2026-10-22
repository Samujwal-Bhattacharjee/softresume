/**
 * RS-080 — AI Provider Abstraction
 * RS-083 — Summary Helper provider method
 * RS-091 — Job Requirement Extraction provider method
 *
 * Implements server-side AI provider integration with strict error handling,
 * bounded timeouts, validated structured responses, and honesty regarding
 * unconfigured or offline states.
 */
import {
  AIProvider,
  BulletImprovementRequest,
  BulletImprovementResponse,
  SummaryImprovementRequest,
  SummaryImprovementResponse,
  JobRequirementExtractionRequest,
  JobRequirementExtractionResponse,
  AIErrorCode,
} from "./types";
import {
  BulletImprovementResponseSchema,
  SummaryImprovementResponseSchema,
  JobRequirementExtractionResponseSchema,
} from "./schemas";
import {
  BULLET_IMPROVER_SYSTEM_PROMPT,
  formatBulletImproverUserPrompt,
  SUMMARY_HELPER_SYSTEM_PROMPT,
  formatSummaryHelperUserPrompt,
  JOB_REQUIREMENT_EXTRACTOR_SYSTEM_PROMPT,
  formatJobRequirementExtractorUserPrompt,
} from "./prompts";

export class AIProviderException extends Error {
  constructor(
    public code: AIErrorCode,
    message: string,
    public isRetryable: boolean = false
  ) {
    super(message);
    this.name = "AIProviderException";
  }
}

// ─────────────────────────────────────────────
// Generic OpenAI-compatible HTTP call helper
// ─────────────────────────────────────────────

async function callOpenAICompatible<T>(
  apiKey: string,
  baseUrl: string,
  model: string,
  timeoutMs: number,
  systemPrompt: string,
  userPrompt: string,
  responseSchema: {
    safeParse: (v: unknown) =>
      | { success: true; data: T }
      | { success: false; error: { issues: { message: string }[] } };
  }
): Promise<T> {
  const body = {
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  };

  let attempts = 0;
  const maxAttempts = 2;

  while (attempts < maxAttempts) {
    attempts++;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!response.ok) {
        if (response.status === 429) {
          throw new AIProviderException(
            "RATE_LIMITED",
            "AI provider rate limit reached. Please wait a moment before trying again.",
            true
          );
        }
        if (response.status === 401 || response.status === 403) {
          throw new AIProviderException(
            "NOT_CONFIGURED",
            "Invalid or unauthorized AI provider credentials.",
            false
          );
        }
        if (response.status >= 500 && attempts < maxAttempts) {
          await new Promise((r) => setTimeout(r, 600));
          continue;
        }
        throw new AIProviderException(
          "PROVIDER_ERROR",
          `AI provider returned HTTP status ${response.status}.`,
          response.status >= 500
        );
      }

      const data = await response.json();
      const contentStr = data.choices?.[0]?.message?.content;

      if (!contentStr) {
        throw new AIProviderException(
          "VALIDATION_FAILED",
          "Empty response received from AI model.",
          true
        );
      }

      let parsedJson: unknown;
      try {
        parsedJson = JSON.parse(contentStr);
      } catch {
        throw new AIProviderException(
          "VALIDATION_FAILED",
          "Model returned malformed JSON.",
          true
        );
      }

      const validated = responseSchema.safeParse(parsedJson);
      if (!validated.success) {
        throw new AIProviderException(
          "VALIDATION_FAILED",
          "Model response did not meet required schema contracts.",
          true
        );
      }

      return validated.data;
    } catch (err: unknown) {
      clearTimeout(timer);

      if (err instanceof AIProviderException) {
        throw err;
      }

      if (err instanceof Error && err.name === "AbortError") {
        throw new AIProviderException(
          "TIMEOUT",
          "Request to AI provider timed out after 15 seconds.",
          true
        );
      }

      if (attempts >= maxAttempts) {
        throw new AIProviderException(
          "PROVIDER_ERROR",
          err instanceof Error
            ? err.message
            : "Unexpected network error during AI request.",
          true
        );
      }
    }
  }

  throw new AIProviderException(
    "PROVIDER_ERROR",
    "Failed to obtain AI response after retry.",
    true
  );
}

/**
 * Standard OpenAI-compatible HTTP Provider
 */
export class StandardHttpAIProvider implements AIProvider {
  name: string;
  private apiKey?: string;
  private model: string;
  private baseUrl: string;
  private timeoutMs: number;

  constructor(options?: {
    name?: string;
    apiKey?: string;
    model?: string;
    baseUrl?: string;
    timeoutMs?: number;
  }) {
    this.name = options?.name ?? process.env.AI_PROVIDER ?? "openai";
    this.apiKey = options?.apiKey ?? process.env.AI_API_KEY;
    this.model = options?.model ?? process.env.AI_MODEL ?? "gpt-4o-mini";
    this.baseUrl =
      options?.baseUrl ?? process.env.AI_BASE_URL ?? "https://api.openai.com/v1";
    this.timeoutMs = options?.timeoutMs ?? 15000;
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  private requireConfigured(): void {
    if (!this.isConfigured()) {
      throw new AIProviderException(
        "NOT_CONFIGURED",
        "AI provider API key is not configured. Add AI_API_KEY to your server environment or .env.local to enable AI features.",
        false
      );
    }
  }

  async improveBullet(req: BulletImprovementRequest): Promise<BulletImprovementResponse> {
    this.requireConfigured();
    const userPrompt = formatBulletImproverUserPrompt(req);
    return callOpenAICompatible(
      this.apiKey!,
      this.baseUrl,
      this.model,
      this.timeoutMs,
      BULLET_IMPROVER_SYSTEM_PROMPT,
      userPrompt,
      BulletImprovementResponseSchema
    );
  }

  async improveSummary(
    req: SummaryImprovementRequest
  ): Promise<SummaryImprovementResponse> {
    this.requireConfigured();
    const userPrompt = formatSummaryHelperUserPrompt(req.context);
    return callOpenAICompatible(
      this.apiKey!,
      this.baseUrl,
      this.model,
      this.timeoutMs,
      SUMMARY_HELPER_SYSTEM_PROMPT,
      userPrompt,
      SummaryImprovementResponseSchema
    );
  }

  async extractJobRequirements(
    req: JobRequirementExtractionRequest
  ): Promise<JobRequirementExtractionResponse> {
    this.requireConfigured();
    const userPrompt = formatJobRequirementExtractorUserPrompt(req.jobDescription);
    return callOpenAICompatible(
      this.apiKey!,
      this.baseUrl,
      this.model,
      this.timeoutMs,
      JOB_REQUIREMENT_EXTRACTOR_SYSTEM_PROMPT,
      userPrompt,
      JobRequirementExtractionResponseSchema
    );
  }
}

/**
 * Mock AI Provider for deterministic automated testing (RS-085)
 * STRICT RULE: Only active in unit tests or when explicitly injected. Never used as fake production fallback.
 */
export class MockAIProvider implements AIProvider {
  name = "mock";
  private bulletHandler?: (req: BulletImprovementRequest) => Promise<BulletImprovementResponse>;
  private summaryHandler?: (req: SummaryImprovementRequest) => Promise<SummaryImprovementResponse>;
  private extractionHandler?: (req: JobRequirementExtractionRequest) => Promise<JobRequirementExtractionResponse>;

  constructor(options?: {
    bulletHandler?: (req: BulletImprovementRequest) => Promise<BulletImprovementResponse>;
    summaryHandler?: (req: SummaryImprovementRequest) => Promise<SummaryImprovementResponse>;
    extractionHandler?: (req: JobRequirementExtractionRequest) => Promise<JobRequirementExtractionResponse>;
  }) {
    this.bulletHandler = options?.bulletHandler;
    this.summaryHandler = options?.summaryHandler;
    this.extractionHandler = options?.extractionHandler;
  }

  isConfigured(): boolean {
    return true;
  }

  async improveBullet(req: BulletImprovementRequest): Promise<BulletImprovementResponse> {
    if (this.bulletHandler) {
      return this.bulletHandler(req);
    }
    const hasMetric = /\d+%|\$\d+|\d+\s*(users|ms|seconds|x)/i.test(req.bullet);
    return {
      proposed: `Developed and optimized ${req.bullet.replace(
        /^(I |Was responsible for |Worked on )/i,
        ""
      )}`,
      explanation:
        "Replaced weak phrasing with strong action verb and focused on core deliverables.",
      followUpQuestions: hasMetric
        ? []
        : ["Did this work lead to a measurable improvement in latency, users, or adoption?"],
      assumptions: [],
      preservedFacts: [req.bullet.slice(0, 30)],
    };
  }

  async improveSummary(
    req: SummaryImprovementRequest
  ): Promise<SummaryImprovementResponse> {
    if (this.summaryHandler) {
      return this.summaryHandler(req);
    }
    const { context } = req;
    const hasEnoughData =
      context.experience.length > 0 ||
      context.education.length > 0 ||
      context.projects.length > 0;

    if (!hasEnoughData) {
      return {
        proposed: "",
        explanation: "Insufficient resume data to draft a grounded summary.",
        followUpQuestions: [
          "What is your current or most recent role?",
          "What technologies or skills would you like to highlight?",
        ],
        assumptions: [],
        evidencedFacts: [],
        insufficientData: true,
      };
    }

    const roleContext =
      context.experience[0]?.role ||
      context.education[0]?.field ||
      "professional";
    const skillSample =
      context.skills[0]?.items.slice(0, 3).join(", ") || "various technologies";

    return {
      proposed: `${roleContext} with experience in ${skillSample}. Demonstrated background in building and delivering software projects.`,
      explanation:
        "Drafted from available experience and skills data with no fabricated metrics or seniority claims.",
      followUpQuestions:
        context.experience.length === 0
          ? ["Do you have professional work experience to include?"]
          : [],
      assumptions: [
        "Used available role and skills data only; no experience duration inferred.",
      ],
      evidencedFacts: [
        context.experience[0]
          ? `Role: ${context.experience[0].role}`
          : `Education: ${context.education[0]?.institution}`,
        `Skills: ${skillSample}`,
      ].filter(Boolean) as string[],
      insufficientData: false,
    };
  }

  async extractJobRequirements(
    req: JobRequirementExtractionRequest
  ): Promise<JobRequirementExtractionResponse> {
    if (this.extractionHandler) {
      return this.extractionHandler(req);
    }
    const jd = req.jobDescription.toLowerCase();
    return {
      roleTitle: "Software Engineer",
      requiredSkills: jd.includes("javascript")
        ? [
            {
              text: "JavaScript",
              type: "required",
              sourcePhrase: "JavaScript required",
              confidence: "high",
            },
          ]
        : [],
      preferredSkills: jd.includes("typescript")
        ? [
            {
              text: "TypeScript",
              type: "preferred",
              sourcePhrase: "TypeScript preferred",
              confidence: "medium",
            },
          ]
        : [],
      responsibilities: [
        {
          text: "Develop software features",
          type: "responsibility",
          sourcePhrase: "develop software",
          confidence: "high",
        },
      ],
      experienceRequirements: [],
      otherRequirements: [],
      extractionWarnings: [],
    };
  }
}

let activeProvider: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (activeProvider) {
    return activeProvider;
  }
  return new StandardHttpAIProvider();
}

export function setAIProviderForTesting(provider: AIProvider | null): void {
  activeProvider = provider;
}
