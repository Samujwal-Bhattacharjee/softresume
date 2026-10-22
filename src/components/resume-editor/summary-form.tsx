/**
 * RS-083 — Professional Summary Form with AI Helper
 *
 * Integrates the SummaryHelperModal for AI-assisted drafting/improvement.
 * AI is only invoked on explicit user request; never auto-applied.
 */
"use client";

import { useState } from "react";
import { useEditorStore } from "@/lib/resume/editor-store";
import { Sparkles } from "lucide-react";
import { SummaryHelperModal } from "./summary-helper-modal";
import type { SummaryResumeContext } from "@/lib/ai/types";

export function SummaryForm() {
  const summary = useEditorStore((s) => s.draft.summary || "");
  const updateSummary = useEditorStore((s) => s.updateSummary);
  const draft = useEditorStore((s) => s.draft);
  const [showModal, setShowModal] = useState(false);

  // Build the context from the current draft — excluding contact details
  const resumeContext: SummaryResumeContext = {
    existingSummary: summary || undefined,
    targetRole: draft.basics.headline || undefined,
    experience: draft.experience.map((e) => ({
      role: e.role,
      employer: e.employer,
      bullets: e.bullets.slice(0, 5),
    })),
    education: draft.education.map((ed) => ({
      institution: ed.institution,
      degree: ed.degree,
      field: ed.field,
    })),
    projects: draft.projects.map((p) => ({
      name: p.name,
      description: p.description,
      technologies: p.technologies,
    })),
    skills: draft.skills.map((sg) => ({
      category: sg.category,
      items: sg.items,
    })),
    internships: draft.internships.map((i) => ({
      role: i.role,
      employer: i.employer,
      bullets: i.bullets.slice(0, 3),
    })),
    certifications: draft.certifications.map((c) => c.name),
  };

  const isDraftMode = !summary.trim();
  const aiButtonLabel = isDraftMode ? "Draft with AI" : "Improve with AI";

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-neutral-800">Professional Summary</h2>
        <p className="text-xs text-neutral-500 mt-0.5">
          A concise 2–4 sentence overview highlighting your focus areas, key accomplishments, or academic background.
        </p>
      </div>

      <div>
        <label htmlFor="resume-summary" className="block text-xs font-medium text-neutral-700 mb-1">
          Summary Statement
        </label>
        <textarea
          id="resume-summary"
          rows={6}
          value={summary}
          onChange={(e) => updateSummary(e.target.value)}
          placeholder="e.g. Senior Software Engineer with 8 years of experience building distributed cloud architectures. Specialised in high-throughput data processing with Kafka and AWS, with a track record of improving latency by 35%."
          className="w-full p-3 text-sm rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-[11px] text-neutral-600 font-medium">
            {summary.length} characters · {summary.trim() ? summary.trim().split(/\s+/).length : 0} words
          </span>
          <span className="text-[11px] text-neutral-500 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Keep it under 60 words for maximum ATS readability
          </span>
        </div>
      </div>

      {/* AI Helper action */}
      <div className="pt-1 border-t border-neutral-100">
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition"
          aria-label={aiButtonLabel}
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          {aiButtonLabel}
        </button>
        <p className="text-[11px] text-neutral-600 font-medium mt-1.5">
          AI will draft from your entered facts only — no fabricated claims. You review and decide before applying.
        </p>
      </div>

      {showModal && (
        <SummaryHelperModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          existingSummary={summary}
          resumeContext={resumeContext}
          onApply={(proposed) => {
            updateSummary(proposed);
          }}
        />
      )}
    </div>
  );
}
