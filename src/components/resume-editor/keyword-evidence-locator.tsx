/**
 * RS-096 — Side-by-Side Keyword Evidence Locator (Console Chrome Edition)
 *
 * Implements a transparent link between job-match findings in the ATS Readiness Panel
 * and the evidence—or gap—in the resume editor.
 *
 * Principles:
 * - Deterministic heuristic text matching; zero AI provider calls.
 * - Every displayed term is traceable to the authoritative ATS engine.
 * - Truthfulness safeguard: explicitly warns against fabricating unearned skills.
 * - Deep navigation into editor sections without mutating draft or history.
 * - Full Console Chrome aesthetic with accessible keyboard navigation and dual-column responsive grid.
 */
"use client";

import { useState, useMemo } from "react";
import type { RequirementItem } from "@/lib/schemas/job-target";
import type {
  JobMatchResult,
  RequirementMatchEvidence,
  MissingRequirementItem,
} from "@/lib/ats/types";
import { useEditorStore } from "@/lib/resume/editor-store";
import {
  CheckCircle2,
  ArrowRight,
  Search,
  ShieldAlert,
  Info,
  Layers,
} from "lucide-react";

interface KeywordEvidenceLocatorProps {
  jobMatch: JobMatchResult;
  requirements: RequirementItem[];
}

export function KeywordEvidenceLocator({
  jobMatch,
  requirements,
}: KeywordEvidenceLocatorProps) {
  const navigateToSection = useEditorStore((s) => s.navigateToSection);

  // Filter states
  const [statusFilter, setStatusFilter] = useState<"all" | "matched" | "missing">("all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | "required" | "preferred">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Expanded disclosures for items with multiple evidence occurrences
  const [expandedOccurrences, setExpandedOccurrences] = useState<Set<string>>(new Set());

  const toggleOccurrence = (term: string) => {
    setExpandedOccurrences((prev) => {
      const next = new Set(prev);
      if (next.has(term)) {
        next.delete(term);
      } else {
        next.add(term);
      }
      return next;
    });
  };

  // Build unified items from requirements and engine results
  const unifiedItems = useMemo(() => {
    if (!requirements || requirements.length === 0) return [];

    const matchedMap = new Map<string, RequirementMatchEvidence>();
    (jobMatch.matchedRequirements || []).forEach((m) => {
      matchedMap.set(m.requirementText.toLowerCase(), m);
    });

    const missingMap = new Map<string, MissingRequirementItem>();
    (jobMatch.missingRequirements || []).forEach((m) => {
      missingMap.set(m.text.toLowerCase(), m);
    });

    return requirements.map((req) => {
      const lower = req.text.toLowerCase();
      const matched = matchedMap.get(lower);
      const missing = missingMap.get(lower);
      const isEvidenced = Boolean(matched && matched.evidenceLocations.length > 0);

      return {
        id: req.id,
        text: req.text,
        type: req.type,
        isEvidenced,
        matched,
        missing,
      };
    });
  }, [requirements, jobMatch]);

  // Dynamic counts
  const counts = useMemo(() => {
    const total = unifiedItems.length;
    const matched = unifiedItems.filter((i) => i.isEvidenced).length;
    const missing = total - matched;
    const requiredTotal = unifiedItems.filter((i) => i.type === "required").length;
    const requiredMatched = unifiedItems.filter((i) => i.type === "required" && i.isEvidenced).length;
    return {
      total,
      matched,
      missing,
      requiredTotal,
      requiredMatched,
    };
  }, [unifiedItems]);

  // Apply active filters
  const filteredItems = useMemo(() => {
    return unifiedItems.filter((item) => {
      // Status filter
      if (statusFilter === "matched" && !item.isEvidenced) return false;
      if (statusFilter === "missing" && item.isEvidenced) return false;

      // Priority filter
      if (priorityFilter === "required" && item.type !== "required") return false;
      if (priorityFilter === "preferred" && item.type !== "preferred") return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchesTerm = item.text.toLowerCase().includes(query);
        const matchesExcerpt =
          item.matched?.excerpt?.toLowerCase().includes(query) ||
          item.matched?.matchedItems?.some((m) => m.text.toLowerCase().includes(query));
        if (!matchesTerm && !matchesExcerpt) return false;
      }

      return true;
    });
  }, [unifiedItems, statusFilter, priorityFilter, searchQuery]);

  const matchedList = filteredItems.filter((i) => i.isEvidenced);
  const missingList = filteredItems.filter((i) => !i.isEvidenced);

  // If no requirements exist yet
  if (!requirements || requirements.length === 0) {
    return (
      <div className="p-4 bg-carbon hardware-bevel text-canvas-soft border border-hairline text-center space-y-2">
        <Layers className="w-6 h-6 text-nav-gold mx-auto opacity-70" />
        <h4 className="font-ui-label text-ui-label text-platinum uppercase font-bold">
          EVIDENCE LOCATOR STANDBY
        </h4>
        <p className="text-xs text-canvas-soft max-w-sm mx-auto leading-relaxed">
          Paste a target job description above or add structured criteria to inspect keyword evidence excerpts and identify resume gaps.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-testid="keyword-evidence-locator">
      {/* ── Locator Telemetry Header & Controls ── */}
      <div className="p-3 bg-carbon hardware-bevel border border-[#3d4f97]/40 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-hairline pb-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-nav-gold animate-pulse" />
              <h4 className="font-ui-label text-ui-label text-nav-gold uppercase font-bold tracking-wider">
                KEYWORD EVIDENCE LOCATOR // REQUISITION AUDIT
              </h4>
            </div>
            <p className="text-[11px] text-canvas-soft mt-0.5">
              Deterministic heuristic text matching. Evidence references verbatim occurrences in your active resume draft.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <span className="text-[10px] font-mono text-platinum bg-ink-soft px-2 py-0.5 hardware-bevel border border-hairline">
              MATCH: {counts.matched}/{counts.total} ({counts.total > 0 ? Math.round((counts.matched / counts.total) * 100) : 0}%)
            </span>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2 pt-0.5">
          {/* Status Filter Segmented Control */}
          <div
            role="group"
            aria-label="Filter terms by evidence status"
            className="inline-flex bg-ink-soft p-0.5 hardware-bevel border border-hairline text-[10px] font-ui-label uppercase"
          >
            <button
              type="button"
              aria-pressed={statusFilter === "all"}
              onClick={() => setStatusFilter("all")}
              className={`px-2.5 py-1 transition font-bold ${
                statusFilter === "all"
                  ? "bg-carbon text-nav-gold hardware-inset font-bold"
                  : "text-canvas-soft hover:text-white"
              }`}
            >
              ALL ({counts.total})
            </button>
            <button
              type="button"
              aria-pressed={statusFilter === "matched"}
              onClick={() => setStatusFilter("matched")}
              className={`px-2.5 py-1 transition flex items-center gap-1 font-bold ${
                statusFilter === "matched"
                  ? "bg-systems-teal text-surface hardware-inset font-bold"
                  : "text-canvas-soft hover:text-white"
              }`}
            >
              <span>✓</span>
              <span>EVIDENCED ({counts.matched})</span>
            </button>
            <button
              type="button"
              aria-pressed={statusFilter === "missing"}
              onClick={() => setStatusFilter("missing")}
              className={`px-2.5 py-1 transition flex items-center gap-1 font-bold ${
                statusFilter === "missing"
                  ? "bg-games-red text-surface hardware-inset font-bold"
                  : "text-canvas-soft hover:text-white"
              }`}
            >
              <span>✕</span>
              <span>MISSING ({counts.missing})</span>
            </button>
          </div>

          {/* Priority Filter + Search Input */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <div
              role="group"
              aria-label="Filter by requirement priority"
              className="inline-flex bg-ink-soft p-0.5 hardware-bevel border border-hairline text-[10px] font-ui-label uppercase"
            >
              <button
                type="button"
                aria-pressed={priorityFilter === "all"}
                onClick={() => setPriorityFilter("all")}
                className={`px-2 py-0.5 ${
                  priorityFilter === "all"
                    ? "bg-carbon text-nav-gold hardware-inset font-bold"
                    : "text-canvas-soft hover:text-white"
                }`}
              >
                ALL PRIORITY
              </button>
              <button
                type="button"
                aria-pressed={priorityFilter === "required"}
                onClick={() => setPriorityFilter("required")}
                className={`px-2 py-0.5 ${
                  priorityFilter === "required"
                    ? "bg-carbon text-nav-gold hardware-inset font-bold"
                    : "text-canvas-soft hover:text-white"
                }`}
              >
                REQUIRED
              </button>
              <button
                type="button"
                aria-pressed={priorityFilter === "preferred"}
                onClick={() => setPriorityFilter("preferred")}
                className={`px-2 py-0.5 ${
                  priorityFilter === "preferred"
                    ? "bg-carbon text-nav-gold hardware-inset font-bold"
                    : "text-canvas-soft hover:text-white"
                }`}
              >
                PREFERRED
              </button>
            </div>

            {/* Keyword Search */}
            <div className="relative flex-1 sm:w-44">
              <input
                type="text"
                placeholder="Filter keywords…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-ink-soft text-platinum px-2.5 py-1 pl-7 text-[11px] hardware-inset font-mono border border-hairline focus:outline-none focus:ring-1 focus:ring-amber placeholder:text-canvas-soft/60"
                aria-label="Filter keywords by text"
              />
              <Search className="w-3.5 h-3.5 text-canvas-soft absolute left-2 top-2 pointer-events-none" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-1.5 top-1.5 text-canvas-soft hover:text-white text-[10px] px-1"
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Dual-Column Side-by-Side Surface ── */}
      {filteredItems.length === 0 ? (
        <div className="p-6 bg-surface hardware-inset border border-hairline text-center space-y-2">
          <Info className="w-6 h-6 text-amber mx-auto opacity-70" />
          <h4 className="font-ui-label text-ui-label uppercase text-carbon font-bold">
            NO REQUIREMENTS MATCH FILTER
          </h4>
          <p className="text-xs text-neutral-600 max-w-sm mx-auto">
            No extracted criteria match your current filter selection. Reset filters to inspect all qualification terms.
          </p>
          <button
            type="button"
            onClick={() => {
              setStatusFilter("all");
              setPriorityFilter("all");
              setSearchQuery("");
            }}
            className="mt-2 px-3 py-1 bg-carbon text-nav-gold hardware-bevel font-ui-label text-ui-label uppercase font-bold text-xs"
          >
            RESET FILTERS
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* ── COLUMN 1: EVIDENCED QUALIFICATIONS ── */}
          {(statusFilter === "all" || statusFilter === "matched") && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="font-ui-label text-ui-label uppercase font-bold text-carbon flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-systems-teal" />
                  EVIDENCED TERMS ({matchedList.length})
                </span>
                <span className="text-[10px] font-mono text-neutral-500">
                  VERBATIM CITATIONS
                </span>
              </div>

              {matchedList.length === 0 ? (
                <div className="p-4 bg-surface hardware-inset border border-hairline text-center space-y-1">
                  <p className="text-xs text-neutral-500">
                    No evidenced qualifications in this filter view.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {matchedList.map((item) => {
                    const primarySection = item.matched?.primarySection || "skills";
                    const isExpanded = expandedOccurrences.has(item.text);
                    const allItems = item.matched?.matchedItems || [];
                    const hasMultiple = allItems.length > 1;

                    return (
                      <div
                        key={`matched-${item.id}`}
                        className="p-3 bg-surface hardware-inset border border-[#3d4f97]/25 space-y-2 shadow-2xs"
                      >
                        {/* Header: Term, Badges, Status */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="bg-systems-teal text-surface px-1.5 py-0.5 hardware-bevel font-micro text-micro uppercase font-bold flex items-center gap-0.5">
                                <span>✓</span>
                                <span>EVIDENCED</span>
                              </span>

                              <span
                                className={`px-1.5 py-0.5 hardware-bevel font-micro text-micro uppercase font-bold ${
                                  item.type === "required"
                                    ? "bg-amber text-carbon"
                                    : "bg-platinum text-carbon"
                                }`}
                              >
                                {item.type}
                              </span>

                              <span className="font-bold text-xs text-carbon">
                                {item.text}
                              </span>
                            </div>

                            <div className="text-[10px] font-mono text-neutral-500">
                              Primary Section: <strong className="text-carbon uppercase">[{primarySection}]</strong>
                            </div>
                          </div>

                          {/* Editor Section Navigation Action */}
                          <button
                            type="button"
                            onClick={() =>
                              navigateToSection(primarySection, item.text, "matched")
                            }
                            className="shrink-0 px-2.5 py-1 bg-carbon hover:bg-black text-nav-gold hardware-bevel font-ui-label text-ui-label uppercase font-bold text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                            title={`Navigate to ${primarySection} editor section to inspect "${item.text}"`}
                            aria-label={`Locate ${item.text} in ${primarySection} section`}
                          >
                            <span>LOCATE</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Primary Verbatim Excerpt */}
                        <div className="p-2 bg-periwinkle-light/40 border-l-2 border-systems-teal text-xs text-carbon space-y-1">
                          <div className="text-[10px] font-mono text-neutral-600 font-semibold">
                            {item.matched?.primaryLabel || `${primarySection.toUpperCase()} EVIDENCE`}
                          </div>
                          <div className="text-[11px] font-mono text-neutral-800 leading-snug break-words">
                            &ldquo;{item.matched?.excerpt || item.matched?.evidenceLocations[0] || item.text}&rdquo;
                          </div>
                        </div>

                        {/* Multiple Occurrences Disclosure */}
                        {hasMultiple && (
                          <div className="pt-1">
                            <button
                              type="button"
                              aria-expanded={isExpanded}
                              aria-controls={`occurrences-${item.id}`}
                              onClick={() => toggleOccurrence(item.text)}
                              className="inline-flex items-center gap-1 text-[10px] font-ui-label uppercase font-bold text-[#3d4f97] hover:text-black transition cursor-pointer"
                            >
                              <span>
                                {isExpanded
                                  ? `▲ Hide additional occurrences (${allItems.length - 1})`
                                  : `▼ View ${allItems.length - 1} additional occurrence${
                                      allItems.length - 1 === 1 ? "" : "s"
                                    }`}
                              </span>
                            </button>

                            {isExpanded && (
                              <div
                                id={`occurrences-${item.id}`}
                                className="mt-2 space-y-1.5 pl-2 border-l border-hairline"
                              >
                                {allItems.slice(1).map((loc, idx) => (
                                  <div
                                    key={idx}
                                    className="p-1.5 bg-neutral-50 text-[10px] font-mono text-neutral-700 border border-neutral-200 flex items-start justify-between gap-2"
                                  >
                                    <div className="space-y-0.5 min-w-0">
                                      <div className="font-bold text-neutral-800 uppercase">
                                        {loc.label}
                                      </div>
                                      <div className="break-words">&ldquo;{loc.excerpt}&rdquo;</div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        navigateToSection(loc.section, item.text, "matched")
                                      }
                                      className="text-[9px] font-mono text-[#3d4f97] hover:underline uppercase shrink-0 font-bold cursor-pointer"
                                    >
                                      JUMP →
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── COLUMN 2: UNMET QUALIFICATIONS & GAPS ── */}
          {(statusFilter === "all" || statusFilter === "missing") && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="font-ui-label text-ui-label uppercase font-bold text-carbon flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-games-red" />
                  UNMET QUALIFICATIONS ({missingList.length})
                </span>
                <span className="text-[10px] font-mono text-neutral-500">
                  EXPERIENCE GAPS
                </span>
              </div>

              {missingList.length === 0 ? (
                <div className="p-4 bg-surface hardware-inset border border-hairline text-center space-y-1">
                  <CheckCircle2 className="w-5 h-5 text-systems-teal mx-auto" />
                  <p className="text-xs text-neutral-600 font-semibold">
                    All evaluated qualifications have explicit resume evidence!
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {missingList.map((item) => {
                    const suggestedSection = item.missing?.suggestedSection || "skills";
                    const suggestedLabel = item.missing?.suggestedSectionLabel || "Skills or Experience";
                    const reason = item.missing?.suggestionReason || "Technical proficiency or keyword.";

                    return (
                      <div
                        key={`missing-${item.id}`}
                        className="p-3 bg-surface hardware-inset border border-rose-200/80 space-y-2 shadow-2xs"
                      >
                        {/* Header: Term, Badges, Status */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="bg-games-red text-surface px-1.5 py-0.5 hardware-bevel font-micro text-micro uppercase font-bold flex items-center gap-0.5">
                                <span>✕</span>
                                <span>NOT EVIDENCED</span>
                              </span>

                              <span
                                className={`px-1.5 py-0.5 hardware-bevel font-micro text-micro uppercase font-bold ${
                                  item.type === "required"
                                    ? "bg-amber text-carbon"
                                    : "bg-platinum text-carbon"
                                }`}
                              >
                                {item.type}
                              </span>

                              <span className="font-bold text-xs text-carbon">
                                {item.text}
                              </span>
                            </div>

                            <p className="text-[11px] text-neutral-600 leading-tight">
                              No verbatim or recognized synonym occurrences found across active draft.
                            </p>
                          </div>

                          {/* Editor Section Navigation Action */}
                          <button
                            type="button"
                            onClick={() =>
                              navigateToSection(suggestedSection, item.text, "missing")
                            }
                            className="shrink-0 px-2.5 py-1 bg-ink-soft hover:bg-black text-platinum hardware-bevel font-ui-label text-ui-label uppercase font-bold text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                            title={`Navigate to ${suggestedSection} section to review evidence`}
                            aria-label={`Inspect ${suggestedSection} section for ${item.text}`}
                          >
                            <span>INSPECT</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Grounded Suggestion Card */}
                        <div className="p-2 bg-neutral-50 border-l-2 border-games-red text-xs space-y-1">
                          <div className="text-[10px] font-mono text-neutral-600 font-semibold flex items-center gap-1">
                            <span>SUGGESTED REVIEW:</span>
                            <strong className="text-carbon uppercase">[{suggestedLabel}]</strong>
                          </div>
                          <p className="text-[11px] text-neutral-600">
                            {reason} Add to this section only if you possess genuine, interview-defensible experience.
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Truthfulness & Heuristic Safeguard Notice ── */}
      <div className="p-2.5 bg-carbon hardware-bevel border border-amber/40 text-[10px] text-canvas-soft flex items-start gap-2">
        <ShieldAlert className="w-4 h-4 text-amber shrink-0 mt-0.5" />
        <div className="space-y-0.5 leading-relaxed">
          <span className="font-ui-label uppercase text-nav-gold font-bold block">
            ETHICAL CITATION SAFEGUARD // ATS HEURISTIC LIMITATION
          </span>
          <p>
            Keyword presence in an automated screen does not guarantee candidate qualification or interview selection.
            <strong className="text-platinum"> Never fabricate unearned skills, credentials, or metrics to inflate keyword scores.</strong> Recruiters and hiring managers thoroughly probe practical competency during technical screenings.
          </p>
        </div>
      </div>
    </div>
  );
}
