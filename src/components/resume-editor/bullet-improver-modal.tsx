/**
 * RS-082 — AI Bullet Improver Modal
 *
 * Provides a review-and-accept workflow for AI-assisted bullet refinement.
 * Enforces truth preservation: shows original vs proposed text, follow-up questions
 * for unstated metrics, and guarantees that content is only mutated upon user acceptance.
 */
"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Check,
  X,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Info,
} from "lucide-react";
import type { BulletImprovementResponse } from "@/lib/ai/types";
import { useModalA11y } from "@/lib/hooks/use-modal-a11y";

interface BulletImproverModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalBullet: string;
  context?: {
    role?: string;
    employer?: string;
    technologies?: string[];
  };
  targetRole?: string;
  onApply: (improvedBullet: string) => void;
}

export function BulletImproverModal({
  isOpen,
  onClose,
  originalBullet,
  context,
  targetRole,
  onApply,
}: BulletImproverModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BulletImprovementResponse | null>(null);
  const [editedText, setEditedText] = useState("");
  const [error, setError] = useState<{ code: string; message: string; isRetryable?: boolean } | null>(null);

  const fetchImprovement = async () => {
    if (!originalBullet || originalBullet.trim().length < 3) {
      setError({
        code: "INVALID_REQUEST",
        message: "Please write at least a few words in the bullet before requesting AI refinement.",
      });
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/ai/improve-bullet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bullet: originalBullet,
          context,
          targetRole,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError({
          code: data.code || "PROVIDER_ERROR",
          message: data.error || "Failed to generate bullet improvement.",
          isRetryable: data.isRetryable,
        });
        return;
      }

      setResult(data.data);
      setEditedText(data.data.proposed);
    } catch {
      setError({
        code: "NETWORK_ERROR",
        message: "Could not reach the AI service endpoint. Please check your local network connection.",
        isRetryable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = React.useCallback(() => {
    setResult(null);
    setError(null);
    setEditedText("");
    onClose();
  }, [onClose]);

  useModalA11y({
    isOpen,
    onClose: handleClose,
    containerRef,
  });

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    const timer = setTimeout(() => {
      if (!cancelled) {
        fetchImprovement();
      }
    }, 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, originalBullet]);

  if (!isOpen) return null;

  const isUnconfigured = error?.code === "NOT_CONFIGURED";

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bullet-improver-title"
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
              <h2 id="bullet-improver-title" className="text-sm font-semibold text-neutral-900">
                AI Bullet Refinement
              </h2>
              <p className="text-[11px] text-neutral-500">
                Active voice and ATS clarity with strict truth preservation
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
          {/* Original Bullet */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">
              Original Bullet Text
            </label>
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-700 leading-relaxed italic">
              &ldquo;{originalBullet}&rdquo;
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div
              className="py-10 text-center space-y-3"
              aria-busy="true"
              aria-live="polite"
            >
              <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin mx-auto" />
              <p className="text-xs text-neutral-600 font-medium">
                Refining bullet syntax and verifying factual preservation...
              </p>
              <p className="text-[11px] text-neutral-400">
                Checking action verbs, removing passive phrasing, and evaluating ATS clarity.
              </p>
            </div>
          )}

          {/* Unconfigured State (Honest disclosure — no fake mock success in prod) */}
          {isUnconfigured && (
            <div className="p-4 bg-amber-50/80 rounded-xl border border-amber-200 text-amber-900 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-xs text-amber-800">
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
                AI Assistant is in Demo / Local Mode
              </div>
              <p className="text-xs text-amber-700 leading-relaxed">
                {error?.message}
              </p>
              <div className="pt-2 text-[11px] text-amber-800/80 border-t border-amber-200/60">
                <strong>Next step:</strong> Copy <code>.env.example</code> to <code>.env.local</code> and set <code>AI_API_KEY=your_key</code>. SoftCV Studio never fabricates placeholder text as real AI output.
              </div>
            </div>
          )}

          {/* Other Errors */}
          {!loading && error && !isUnconfigured && (
            <div className="p-4 bg-red-50 rounded-xl border border-red-200 text-red-900 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-xs text-red-800">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                Error Refining Bullet
              </div>
              <p className="text-xs text-red-700 leading-relaxed">
                {error.message}
              </p>
              {error.isRetryable && (
                <button
                  type="button"
                  onClick={fetchImprovement}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Try Again
                </button>
              )}
            </div>
          )}

          {/* Result Ready */}
          {!loading && result && (
            <div className="space-y-4 animate-in fade-in-50 duration-200">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="proposed-bullet-input"
                    className="block text-[11px] font-semibold text-indigo-700 uppercase tracking-wider"
                  >
                    Suggested Refinement (Editable)
                  </label>
                  <span className="text-[10px] text-neutral-400">
                    Review and adjust if needed
                  </span>
                </div>
                <textarea
                  id="proposed-bullet-input"
                  rows={3}
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl border border-indigo-200 bg-indigo-50/20 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-neutral-800 leading-relaxed font-normal"
                />
              </div>

              {/* Explanation */}
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-600 space-y-1">
                <span className="font-semibold text-neutral-800 block text-[11px]">
                  Why this improves your resume:
                </span>
                <p className="leading-relaxed">{result.explanation}</p>
              </div>

              {/* Follow-up Questions for Missing Metrics */}
              {result.followUpQuestions && result.followUpQuestions.length > 0 && (
                <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 text-xs text-blue-900 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-semibold text-blue-800 text-[11px]">
                    <HelpCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    Missing measurable details?
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-blue-800/90 text-[11px]">
                    {result.followUpQuestions.map((q, i) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ul>
                  <p className="text-[10px] text-blue-600 italic pt-1">
                    SoftCV Studio never fabricates numbers. If you know the actual metrics, you can type them directly into the suggested text above.
                  </p>
                </div>
              )}

              {/* Assumptions (if any) */}
              {result.assumptions && result.assumptions.length > 0 && (
                <div className="p-2.5 bg-neutral-100 rounded-lg text-[11px] text-neutral-600">
                  <span className="font-medium text-neutral-700">Assumptions checked: </span>
                  {result.assumptions.join("; ")}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-neutral-100 bg-neutral-50/60 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-3.5 py-2 text-xs font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition"
          >
            Reject & Keep Original
          </button>

          {result && (
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
              Accept & Apply Bullet
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
