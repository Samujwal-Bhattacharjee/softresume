/**
 * RS-083 — AI Summary Helper Modal
 *
 * Provides a review-and-accept workflow for AI-assisted summary drafting/improvement.
 * Follows the same interaction conventions as BulletImproverModal.
 * Truth preservation: user must explicitly accept before any content is written.
 * Stale detection: if the resume changes while waiting, warns before applying.
 */
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Sparkles,
  Check,
  X,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Info,
  AlertTriangle,
} from "lucide-react";
import type { SummaryImprovementResponse, SummaryResumeContext } from "@/lib/ai/types";
import { useModalA11y } from "@/lib/hooks/use-modal-a11y";

interface SummaryHelperModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingSummary: string;
  resumeContext: SummaryResumeContext;
  /** Called only when user explicitly accepts — never auto-applied */
  onApply: (proposedSummary: string) => void;
}

export function SummaryHelperModal({
  isOpen,
  onClose,
  existingSummary,
  resumeContext,
  onApply,
}: SummaryHelperModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SummaryImprovementResponse | null>(null);
  const [editedText, setEditedText] = useState("");
  const [error, setError] = useState<{ code: string; message: string; isRetryable?: boolean } | null>(null);
  /** Snapshot of the context at the time of fetch — used for stale detection */
  const [fetchedContextHash, setFetchedContextHash] = useState<string | null>(null);

  const contextHash = JSON.stringify({
    exp: resumeContext.experience.length,
    edu: resumeContext.education.length,
    proj: resumeContext.projects.length,
    sk: resumeContext.skills.length,
    summary: existingSummary,
  });

  // Derive staleness without an effect
  const isStale = Boolean(fetchedContextHash && fetchedContextHash !== contextHash && result);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setFetchedContextHash(contextHash);

    try {
      const res = await fetch("/api/ai/improve-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: {
            ...resumeContext,
            existingSummary: existingSummary || undefined,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError({
          code: data.code || "PROVIDER_ERROR",
          message: data.error || "Failed to generate summary.",
          isRetryable: data.isRetryable,
        });
        return;
      }

      setResult(data.data);
      setEditedText(data.data.proposed || "");
    } catch {
      setError({
        code: "NETWORK_ERROR",
        message: "Could not reach the AI service endpoint. Please check your network connection.",
        isRetryable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [resumeContext, existingSummary, contextHash]);

  const handleClose = useCallback(() => {
    setResult(null);
    setError(null);
    setEditedText("");
    setFetchedContextHash(null);
    onClose();
  }, [onClose]);

  useModalA11y({
    isOpen,
    onClose: handleClose,
    containerRef,
  });

  // Auto-fetch on open
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      if (!cancelled) fetchSummary();
    }, 0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const isUnconfigured = error?.code === "NOT_CONFIGURED";
  const isDraftMode = existingSummary.trim().length === 0;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="summary-helper-title"
      tabIndex={-1}
    >
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 id="summary-helper-title" className="text-sm font-semibold text-neutral-900">
                {isDraftMode ? "Draft Summary with AI" : "Improve Summary with AI"}
              </h2>
              <p className="text-[11px] text-neutral-500">
                Grounded in your resume facts · No fabricated claims
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Existing summary (if any) */}
          {!isDraftMode && (
            <div>
              <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">
                Current Summary
              </label>
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-700 leading-relaxed italic">
                &ldquo;{existingSummary}&rdquo;
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="py-10 text-center space-y-3" aria-busy="true" aria-live="polite">
              <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin mx-auto" />
              <p className="text-xs text-neutral-600 font-medium">
                Drafting a grounded summary from your resume facts…
              </p>
              <p className="text-[11px] text-neutral-400">
                No seniority, metrics, or credentials will be assumed beyond what you&apos;ve entered.
              </p>
            </div>
          )}

          {/* Stale warning */}
          {isStale && result && (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2 text-xs text-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Resume changed since last generation</p>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  The suggested text below was generated from an earlier version. Consider re-generating to reflect your latest edits.
                </p>
                <button
                  type="button"
                  onClick={fetchSummary}
                  className="mt-1.5 text-[11px] font-semibold text-amber-800 underline hover:no-underline"
                >
                  Re-generate from latest
                </button>
              </div>
            </div>
          )}

          {/* Unconfigured State */}
          {isUnconfigured && (
            <div className="p-4 bg-amber-50/80 rounded-xl border border-amber-200 text-amber-900 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-xs text-amber-800">
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
                AI Assistant is in Demo / Local Mode
              </div>
              <p className="text-xs text-amber-700 leading-relaxed">{error?.message}</p>
              <div className="pt-2 text-[11px] text-amber-800/80 border-t border-amber-200/60">
                <strong>Next step:</strong> Copy <code>.env.example</code> to <code>.env.local</code> and set{" "}
                <code>AI_API_KEY=your_key</code>. SoftCV Studio never fabricates placeholder text as real AI output.
              </div>
            </div>
          )}

          {/* Other Errors */}
          {!loading && error && !isUnconfigured && (
            <div className="p-4 bg-red-50 rounded-xl border border-red-200 text-red-900 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-xs text-red-800">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                Error Generating Summary
              </div>
              <p className="text-xs text-red-700 leading-relaxed">{error.message}</p>
              {error.isRetryable && (
                <button
                  type="button"
                  onClick={fetchSummary}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Try Again
                </button>
              )}
            </div>
          )}

          {/* Insufficient data state */}
          {!loading && result?.insufficientData && (
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 space-y-2">
              <p className="text-xs font-semibold text-blue-800">
                Not enough resume data to draft a grounded summary
              </p>
              <p className="text-[11px] text-blue-700">{result.explanation}</p>
              {result.followUpQuestions.length > 0 && (
                <div className="pt-2 border-t border-blue-200">
                  <p className="text-[11px] font-semibold text-blue-800 mb-1">
                    <HelpCircle className="w-3.5 h-3.5 inline mr-1 text-blue-600" />
                    To generate a better summary, answer these:
                  </p>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] text-blue-800/90">
                    {result.followUpQuestions.map((q, i) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Result ready */}
          {!loading && result && !result.insufficientData && (
            <div className="space-y-4 animate-in fade-in-50 duration-200">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="proposed-summary-input"
                    className="block text-[11px] font-semibold text-indigo-700 uppercase tracking-wider"
                  >
                    Suggested Summary (Editable)
                  </label>
                  <span className="text-[10px] text-neutral-400">Review and adjust before applying</span>
                </div>
                <textarea
                  id="proposed-summary-input"
                  rows={5}
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl border border-indigo-200 bg-indigo-50/20 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-neutral-800 leading-relaxed"
                />
              </div>

              {/* Explanation */}
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-600 space-y-1">
                <span className="font-semibold text-neutral-800 block text-[11px]">What was drafted and why:</span>
                <p className="leading-relaxed">{result.explanation}</p>
              </div>

              {/* Evidenced facts */}
              {result.evidencedFacts.length > 0 && (
                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 text-xs space-y-1">
                  <span className="font-semibold text-emerald-800 block text-[11px]">
                    ✓ Grounded in your resume facts:
                  </span>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] text-emerald-800/90">
                    {result.evidencedFacts.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Follow-up questions */}
              {result.followUpQuestions.length > 0 && (
                <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 text-xs text-blue-900 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-semibold text-blue-800 text-[11px]">
                    <HelpCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    Could be more specific with:
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-blue-800/90 text-[11px]">
                    {result.followUpQuestions.map((q, i) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ul>
                  <p className="text-[10px] text-blue-600 italic pt-1">
                    SoftCV Studio never fabricates credentials or metrics. Add the real details yourself.
                  </p>
                </div>
              )}

              {/* Assumptions */}
              {result.assumptions.length > 0 && (
                <div className="p-2.5 bg-neutral-100 rounded-lg text-[11px] text-neutral-600">
                  <span className="font-medium text-neutral-700">Assumptions: </span>
                  {result.assumptions.join("; ")}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-100 bg-neutral-50/60 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-3.5 py-2 text-xs font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition"
          >
            {result && !result.insufficientData ? "Reject & Keep Original" : "Cancel"}
          </button>

          {result && !result.insufficientData && (
            <button
              type="button"
              disabled={!editedText.trim() || loading}
              onClick={() => {
                onApply(editedText.trim());
                handleClose();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl transition shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              Apply Summary
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
