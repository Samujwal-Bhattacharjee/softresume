/**
 * RS-103 — ATS Readiness, Writing Quality & Job Match Panel
 * RS-102 — Writing Quality checks with subjective ignore capability
 * RS-090 — Job Target data model & persistence
 * RS-091 — AI requirement extraction & user corrections
 * RS-092 — Transparent skill & keyword coverage with evidence
 * RS-095 — Resume Readiness Explainability & Actionable Remediation
 *
 * Integrated into the editor shell. Displays structured findings and explainable checks:
 * 1. Parse Readiness (structural/readability/layout checks)
 * 2. Content Completeness (role/persona-aware information coverage)
 * 3. Writing Quality (objective vs subjective style guidance, dismissable)
 * 4. Job Match (transparent keyword coverage, evidence locator, AI extraction)
 *
 * Honest empty states; no fake scores; transparent heuristic scoring formulas;
 * no "guaranteed ATS approved" claims.
 */
"use client";

import { useState, useMemo, useEffect } from "react";
import { useEditorStore } from "@/lib/resume/editor-store";
import { evaluateResumeAts } from "@/lib/ats/engine";
import { useStorageAdapter } from "@/lib/hooks/useStorageAdapter";
import type { FindingCategory, AtsFinding, TargetPersona } from "@/lib/ats/types";
import type { JobTarget, RequirementItem, RequirementType } from "@/lib/schemas/job-target";
import { CATEGORY_SCORING_GUIDES } from "@/lib/ats/rules-catalog";
import { KeywordEvidenceLocator } from "./keyword-evidence-locator";
import {
  ShieldAlert,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  FileSearch,
  ArrowRight,
  Briefcase,
  Sparkles,
  Plus,
  Trash2,
  EyeOff,
  RotateCcw,
  Check,
  Loader2,
  PenTool,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";

export function AtsReadinessPanel() {
  const draft = useEditorStore((s) => s.draft);
  const resumeId = useEditorStore((s) => s.resumeId) || "default-resume";
  const setActiveSection = useEditorStore((s) => s.setActiveSection);
  const { adapter } = useStorageAdapter();

  const [activeTab, setActiveTab] = useState<FindingCategory>("parse-readiness");
  const [persona, setPersona] = useState<TargetPersona>("general");

  // RS-095: Scoring guide disclosure & check list filter
  const [showScoringGuide, setShowScoringGuide] = useState(false);
  const [filterMode, setFilterMode] = useState<"all" | "incomplete" | "passed">("all");
  const [expandedCheckIds, setExpandedCheckIds] = useState<Set<string>>(new Set());

  // Job Target State (RS-090)
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [requirements, setRequirements] = useState<RequirementItem[]>([]);
  const [showJdInput, setShowJdInput] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);

  // New requirement input state
  const [newReqText, setNewReqText] = useState("");
  const [newReqType, setNewReqType] = useState<RequirementType>("required");

  // RS-102: Ignored subjective findings
  const [ignoredFindingIds, setIgnoredFindingIds] = useState<Set<string>>(new Set());
  const [showIgnoredDrawer, setShowIgnoredDrawer] = useState(false);

  // Load persisted Job Target on resume change
  useEffect(() => {
    let cancelled = false;
    Promise.resolve(adapter.getJobTarget(resumeId))
      .then((persisted) => {
        if (cancelled || !persisted) return;
        setJobTitle(persisted.roleTitle || "");
        setCompany(persisted.company || "");
        setJobDescription(persisted.jobDescription || "");
        setRequirements(persisted.requirements || []);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [resumeId, adapter]);

  // Persist Job Target changes in active adapter (RS-090)
  const saveCurrentJobTarget = (
    updatedReqs: RequirementItem[],
    updatedJd = jobDescription,
    updatedTitle = jobTitle,
    updatedComp = company
  ) => {
    const target: JobTarget = {
      id: `job-target-${resumeId}`,
      resumeId,
      roleTitle: updatedTitle,
      company: updatedComp,
      jobDescription: updatedJd,
      requirements: updatedReqs,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    Promise.resolve(adapter.saveJobTarget(target)).catch(() => {});
  };

  // Evaluate whenever draft, settings, persona, jobDescription, or requirements change
  const evaluation = useMemo(() => {
    return evaluateResumeAts({
      document: draft,
      settings: draft.settings,
      persona,
      jobDescription: jobDescription.trim(),
      requirements: requirements.length > 0 ? requirements : undefined,
    });
  }, [draft, persona, jobDescription, requirements]);

  const { parseReadiness, contentCompleteness, writingQuality, jobMatch } = evaluation;

  // Active category checklist with explainability items
  const categoryChecks = useMemo(() => {
    if (activeTab === "job-match") return [];
    return evaluation.checks?.[activeTab] || [];
  }, [evaluation.checks, activeTab]);

  // Ignored subjective writing findings
  const ignoredWritingFindings = useMemo(() => {
    return evaluation.findings.filter(
      (f) => f.category === "writing-quality" && ignoredFindingIds.has(f.ruleId)
    );
  }, [evaluation.findings, ignoredFindingIds]);

  // Filtered checks respecting ignore state and selected filter mode
  const visibleChecks = useMemo(() => {
    let list = categoryChecks;
    if (activeTab === "writing-quality") {
      list = list.filter((c) => !c.finding || !ignoredFindingIds.has(c.finding.ruleId));
    }
    if (filterMode === "incomplete") {
      return list.filter((c) => c.status === "incomplete");
    }
    if (filterMode === "passed") {
      return list.filter((c) => c.status === "passed");
    }
    // "all": sort incomplete first, then passed
    return [...list].sort((a, b) => {
      if (a.status === "incomplete" && b.status === "passed") return -1;
      if (a.status === "passed" && b.status === "incomplete") return 1;
      return 0;
    });
  }, [categoryChecks, activeTab, ignoredFindingIds, filterMode]);

  // Counts for the active tab's checklist
  const checkCounts = useMemo(() => {
    let list = categoryChecks;
    if (activeTab === "writing-quality") {
      list = list.filter((c) => !c.finding || !ignoredFindingIds.has(c.finding.ruleId));
    }
    const total = list.length;
    const incomplete = list.filter((c) => c.status === "incomplete").length;
    const passed = list.filter((c) => c.status === "passed").length;
    return { total, incomplete, passed };
  }, [categoryChecks, activeTab, ignoredFindingIds]);

  const handleToggleIgnore = (ruleId: string) => {
    setIgnoredFindingIds((prev) => {
      const next = new Set(prev);
      if (next.has(ruleId)) {
        next.delete(ruleId);
      } else {
        next.add(ruleId);
      }
      return next;
    });
  };

  const handleToggleCheckDetails = (id: string) => {
    setExpandedCheckIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleJumpToSection = (sectionId?: string) => {
    if (!sectionId) return;
    setActiveSection(sectionId);
    setTimeout(() => {
      const dest = document.querySelector<HTMLElement>(
        "#editor-modules-panel h2, #editor-modules-panel input, #editor-modules-panel textarea"
      );
      dest?.focus();
    }, 50);
  };

  // RS-091: Extract requirements using server route or heuristic fallback
  const handleExtractRequirements = async () => {
    if (!jobDescription.trim() || jobDescription.trim().length < 25) {
      setExtractionError("Please paste at least 25 characters of the job description.");
      return;
    }

    setIsExtracting(true);
    setExtractionError(null);

    try {
      const res = await fetch("/api/ai/extract-requirements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription: jobDescription.trim() }),
      });

      const json = await res.json();
      if (res.ok && json.ok && json.data) {
        const data = json.data;
        if (data.roleTitle && !jobTitle) {
          setJobTitle(data.roleTitle);
        }

        const extractedItems: RequirementItem[] = [];

        (data.requiredSkills || []).forEach((r: { text: string; sourcePhrase?: string; confidence?: "high" | "medium" | "low" }, idx: number) => {
          extractedItems.push({
            id: `req-ext-req-${idx}-${Date.now()}`,
            text: r.text,
            type: "required",
            sourcePhrase: r.sourcePhrase || "",
            confidence: r.confidence || "high",
            userAdded: false,
            userModified: false,
          });
        });

        (data.preferredSkills || []).forEach((r: { text: string; sourcePhrase?: string; confidence?: "high" | "medium" | "low" }, idx: number) => {
          extractedItems.push({
            id: `req-ext-pref-${idx}-${Date.now()}`,
            text: r.text,
            type: "preferred",
            sourcePhrase: r.sourcePhrase || "",
            confidence: r.confidence || "medium",
            userAdded: false,
            userModified: false,
          });
        });

        (data.responsibilities || []).forEach((r: { text: string; sourcePhrase?: string; confidence?: "high" | "medium" | "low" }, idx: number) => {
          extractedItems.push({
            id: `req-ext-resp-${idx}-${Date.now()}`,
            text: r.text,
            type: "responsibility",
            sourcePhrase: r.sourcePhrase || "",
            confidence: r.confidence || "high",
            userAdded: false,
            userModified: false,
          });
        });

        setRequirements(extractedItems);
        saveCurrentJobTarget(extractedItems, jobDescription, data.roleTitle || jobTitle, company);
        setShowJdInput(false);
      } else {
        fallbackHeuristicExtraction();
      }
    } catch {
      fallbackHeuristicExtraction();
    } finally {
      setIsExtracting(false);
    }
  };

  const fallbackHeuristicExtraction = () => {
    const lines = jobDescription
      .split(/\n+/)
      .map((l) => l.trim())
      .filter((l) => l.length > 3);

    const items: RequirementItem[] = [];
    lines.forEach((line, idx) => {
      if (line.length > 120) return;
      const lower = line.toLowerCase();
      let type: RequirementType = "responsibility";
      if (lower.includes("required") || lower.includes("must have") || lower.includes("qualifications")) {
        type = "required";
      } else if (lower.includes("preferred") || lower.includes("nice to have") || lower.includes("plus")) {
        type = "preferred";
      }

      const cleanText = line.replace(/^[•\-\*\d\.]+\s*/, "").trim();
      if (cleanText.length > 2 && cleanText.length < 100) {
        items.push({
          id: `req-fallback-${idx}-${Date.now()}`,
          text: cleanText,
          type,
          sourcePhrase: line,
          confidence: "medium",
          userAdded: false,
          userModified: false,
        });
      }
    });

    const safeItems = items.slice(0, 15);
    setRequirements(safeItems);
    saveCurrentJobTarget(safeItems);
    setShowJdInput(false);
  };

  const handleAddRequirement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReqText.trim()) return;

    const newReq: RequirementItem = {
      id: `req-user-${Date.now()}`,
      text: newReqText.trim(),
      type: newReqType,
      sourcePhrase: "Added by candidate",
      confidence: "high",
      userAdded: true,
      userModified: false,
    };

    const updated = [newReq, ...requirements];
    setRequirements(updated);
    saveCurrentJobTarget(updated);
    setNewReqText("");
  };

  const handleUpdateRequirementType = (id: string, newType: RequirementType) => {
    const updated = requirements.map((r) =>
      r.id === id ? { ...r, type: newType, userModified: true } : r
    );
    setRequirements(updated);
    saveCurrentJobTarget(updated);
  };

  const handleDeleteRequirement = (id: string) => {
    const updated = requirements.filter((r) => r.id !== id);
    setRequirements(updated);
    saveCurrentJobTarget(updated);
  };

  const handleClearTarget = () => {
    setJobTitle("");
    setCompany("");
    setJobDescription("");
    setRequirements([]);
    Promise.resolve(adapter.deleteJobTarget(resumeId)).catch(() => {});
  };

  const renderSeverityBadge = (severity?: AtsFinding["severity"]) => {
    switch (severity) {
      case "error":
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <ShieldAlert className="w-3 h-3 text-rose-600" />
            Error
          </span>
        );
      case "warning":
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            Warning
          </span>
        );
      case "suggestion":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
            <Lightbulb className="w-3 h-3 text-blue-600" />
            Suggestion
          </span>
        );
    }
  };

  const activeGuide = CATEGORY_SCORING_GUIDES[activeTab];

  return (
    <div className="space-y-4 text-xs text-neutral-800" aria-label="ATS Readiness Panel">
      {/* Header & Persona Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-200 pb-3">
        <div>
          <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-1.5">
            <FileSearch className="w-4 h-4 text-indigo-600" />
            Readiness & ATS Review
          </h3>
          <p className="text-[11px] text-neutral-600 mt-0.5 font-medium">
            Deterministic heuristics checking formatting, completeness, writing quality, and job match.
          </p>
        </div>

        {/* Persona context selector */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <label htmlFor="ats-persona-select" className="text-[11px] text-neutral-700 font-medium">
            Role context:
          </label>
          <select
            id="ats-persona-select"
            value={persona}
            onChange={(e) => setPersona(e.target.value as TargetPersona)}
            className="text-[11px] px-2 py-1 rounded-md border border-neutral-300 bg-white font-medium text-neutral-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="general">General Professional</option>
            <option value="fresher">Student / Fresher</option>
            <option value="internship">Internship Applicant</option>
            <option value="experienced">Experienced Professional</option>
            <option value="technical">Software / Technical</option>
          </select>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div
        role="tablist"
        aria-label="ATS Readiness categories"
        className="flex rounded-lg border border-neutral-200 p-0.5 bg-neutral-100/80 text-[11px]"
      >
        <button
          type="button"
          role="tab"
          id="ats-tab-parse-readiness"
          aria-selected={activeTab === "parse-readiness"}
          aria-controls="ats-tabpanel"
          tabIndex={activeTab === "parse-readiness" ? 0 : -1}
          onClick={() => {
            setActiveTab("parse-readiness");
            setFilterMode("all");
          }}
          className={`flex-1 py-1.5 px-2 rounded-md font-medium transition text-center flex items-center justify-center gap-1.5 ${
            activeTab === "parse-readiness"
              ? "bg-white text-neutral-900 shadow-xs font-bold"
              : "text-neutral-600 hover:text-neutral-900"
          }`}
        >
          Parse Readiness
          {parseReadiness.errorCount > 0 ? (
            <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] flex items-center justify-center font-bold">
              {parseReadiness.errorCount}
            </span>
          ) : parseReadiness.warningCount > 0 ? (
            <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] flex items-center justify-center font-bold">
              {parseReadiness.warningCount}
            </span>
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          )}
        </button>

        <button
          type="button"
          role="tab"
          id="ats-tab-content-completeness"
          aria-selected={activeTab === "content-completeness"}
          aria-controls="ats-tabpanel"
          tabIndex={activeTab === "content-completeness" ? 0 : -1}
          onClick={() => {
            setActiveTab("content-completeness");
            setFilterMode("all");
          }}
          className={`flex-1 py-1.5 px-2 rounded-md font-medium transition text-center flex items-center justify-center gap-1.5 ${
            activeTab === "content-completeness"
              ? "bg-white text-neutral-900 shadow-xs font-bold"
              : "text-neutral-600 hover:text-neutral-900"
          }`}
        >
          Completeness
          {contentCompleteness.errorCount > 0 ? (
            <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] flex items-center justify-center font-bold">
              {contentCompleteness.errorCount}
            </span>
          ) : (
            <span className="text-[10px] text-neutral-700 font-bold">
              {contentCompleteness.score}%
            </span>
          )}
        </button>

        <button
          type="button"
          role="tab"
          id="ats-tab-writing-quality"
          aria-selected={activeTab === "writing-quality"}
          aria-controls="ats-tabpanel"
          tabIndex={activeTab === "writing-quality" ? 0 : -1}
          onClick={() => {
            setActiveTab("writing-quality");
            setFilterMode("all");
          }}
          className={`flex-1 py-1.5 px-2 rounded-md font-medium transition text-center flex items-center justify-center gap-1.5 ${
            activeTab === "writing-quality"
              ? "bg-white text-neutral-900 shadow-xs font-bold"
              : "text-neutral-600 hover:text-neutral-900"
          }`}
        >
          Writing Quality
          <span className="text-[10px] text-neutral-700 font-bold">
            {writingQuality.score}%
          </span>
        </button>

        <button
          type="button"
          role="tab"
          id="ats-tab-job-match"
          aria-selected={activeTab === "job-match"}
          aria-controls="ats-tabpanel"
          tabIndex={activeTab === "job-match" ? 0 : -1}
          onClick={() => {
            setActiveTab("job-match");
            setFilterMode("all");
          }}
          className={`flex-1 py-1.5 px-2 rounded-md font-medium transition text-center flex items-center justify-center gap-1.5 ${
            activeTab === "job-match"
              ? "bg-white text-neutral-900 shadow-xs font-bold"
              : "text-neutral-600 hover:text-neutral-900"
          }`}
        >
          Job Match
          {jobMatch.analyzed && (
            <span className="text-[10px] text-indigo-700 font-bold px-1.5 py-0.2 bg-indigo-50 rounded">
              {jobMatch.score}%
            </span>
          )}
        </button>
      </div>

      <div
        role="tabpanel"
        id="ats-tabpanel"
        aria-labelledby={`ats-tab-${activeTab}`}
        tabIndex={0}
        className="space-y-4 focus:outline-none"
      >
        {/* Category Overview Cards with "How This Is Scored" Disclosure Trigger */}
        {activeTab === "parse-readiness" && (
          <div className="p-3.5 rounded-xl border border-neutral-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="space-y-0.5">
              <div className="font-bold text-neutral-900 text-xs">
                Internal Readiness Index: {parseReadiness.score} / 100
              </div>
              <div className="text-[11px] text-neutral-600 font-medium">
                Standard structural constraints (contact identity, headings, safe layout).
              </div>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                  parseReadiness.score >= 90
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : parseReadiness.score >= 70
                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                    : "bg-rose-50 text-rose-700 border border-rose-200"
                }`}
              >
                {parseReadiness.score >= 90
                  ? "Parse Ready"
                  : parseReadiness.score >= 70
                  ? "Needs Attention"
                  : "Critical Issues"}
              </span>
              <button
                type="button"
                aria-expanded={showScoringGuide}
                aria-controls="scoring-guide-panel"
                onClick={() => setShowScoringGuide(!showScoringGuide)}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#3d4f97] hover:text-[#21242e] bg-[#eaedff] hover:bg-[#dce3ff] px-2 py-1 rounded border border-[#3d4f97]/30 transition"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                {showScoringGuide ? "Hide Guide" : "How This Is Scored"}
                {showScoringGuide ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>
          </div>
        )}

        {activeTab === "content-completeness" && (
          <div className="p-3.5 rounded-xl border border-neutral-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="space-y-0.5">
              <div className="font-bold text-neutral-900 text-xs">
                Profile Completeness: {contentCompleteness.score}% ({persona} context)
              </div>
              <div className="text-[11px] text-neutral-600 font-medium">
                Evaluated against typical recruiter expectations for this target stage.
              </div>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                  contentCompleteness.score >= 90
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : contentCompleteness.score >= 70
                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                    : "bg-rose-50 text-rose-700 border border-rose-200"
                }`}
              >
                {contentCompleteness.score >= 90
                  ? "Comprehensive"
                  : contentCompleteness.score >= 70
                  ? "Moderate Coverage"
                  : "Sparse Content"}
              </span>
              <button
                type="button"
                aria-expanded={showScoringGuide}
                aria-controls="scoring-guide-panel"
                onClick={() => setShowScoringGuide(!showScoringGuide)}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#3d4f97] hover:text-[#21242e] bg-[#eaedff] hover:bg-[#dce3ff] px-2 py-1 rounded border border-[#3d4f97]/30 transition"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                {showScoringGuide ? "Hide Guide" : "How This Is Scored"}
                {showScoringGuide ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>
          </div>
        )}

        {activeTab === "writing-quality" && (
          <div className="p-3.5 rounded-xl border border-neutral-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="space-y-0.5">
              <div className="font-bold text-neutral-900 text-xs flex items-center gap-1.5">
                <PenTool className="w-3.5 h-3.5 text-indigo-600" />
                Writing Quality Score: {writingQuality.score} / 100
              </div>
              <div className="text-[11px] text-neutral-600 font-medium">
                Checks for inverted dates, repeated wording, overused buzzwords, and missing metrics.
              </div>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              {ignoredWritingFindings.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowIgnoredDrawer(!showIgnoredDrawer)}
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium underline"
                >
                  {showIgnoredDrawer ? "Hide Ignored" : `Ignored (${ignoredWritingFindings.length})`}
                </button>
              )}
              <button
                type="button"
                aria-expanded={showScoringGuide}
                aria-controls="scoring-guide-panel"
                onClick={() => setShowScoringGuide(!showScoringGuide)}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#3d4f97] hover:text-[#21242e] bg-[#eaedff] hover:bg-[#dce3ff] px-2 py-1 rounded border border-[#3d4f97]/30 transition"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                {showScoringGuide ? "Hide Guide" : "How This Is Scored"}
                {showScoringGuide ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>
          </div>
        )}

        {/* Collapsible "HOW THIS IS SCORED" card (RS-095) */}
        {showScoringGuide && (
          <div
            id="scoring-guide-panel"
            className="p-3.5 rounded-xl border-2 border-[#3d4f97] bg-[#eaedff]/60 space-y-3 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div className="font-bold text-xs text-[#21242e] flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-[#3d4f97]" />
                How {activeGuide.title} Is Assessed
              </div>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#3d4f97] text-white">
                HEURISTIC SPEC
              </span>
            </div>

            <p className="text-[11px] text-neutral-700 leading-relaxed font-medium">
              {activeGuide.description}
            </p>

            {/* Formula Banner */}
            <div className="p-2.5 rounded-lg bg-white border border-[#3d4f97]/30 space-y-1">
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">
                Deterministic Calculation Formula
              </span>
              <div className="font-mono text-[11px] font-bold text-[#21242e] bg-neutral-50 px-2 py-1 rounded border border-neutral-200">
                {activeGuide.scoringFormula}
              </div>
            </div>

            {/* Deductions & Rules */}
            {activeTab !== "job-match" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px]">
                <div className="p-2 rounded bg-white border border-rose-200 space-y-0.5">
                  <span className="font-bold text-rose-700 block">Critical Error (-25 pts)</span>
                  <p className="text-neutral-600">Blocking flaw or missing required contact identity.</p>
                </div>
                <div className="p-2 rounded bg-white border border-amber-200 space-y-0.5">
                  <span className="font-bold text-amber-700 block">Warning (-10 pts)</span>
                  <p className="text-neutral-600">Layout, spacing, or credential gaps affecting readability.</p>
                </div>
                <div className="p-2 rounded bg-white border border-blue-200 space-y-0.5">
                  <span className="font-bold text-blue-700 block">Suggestion (-3 pts)</span>
                  <p className="text-neutral-600">Advisory polish, metrics, or buzzword recommendations.</p>
                </div>
              </div>
            )}

            {/* Score Bands */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">
                Score Bands & Interpretation
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px]">
                {activeGuide.scoreBands.map((band) => (
                  <div key={band.label} className="p-2 rounded bg-white border border-neutral-200 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#21242e]">{band.label}</span>
                      <span className="font-mono text-neutral-500 font-semibold">{band.min}–{band.max}%</span>
                    </div>
                    <p className="text-neutral-600 leading-tight">{band.interpretation}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Heuristic Disclaimer */}
            <div className="p-2 rounded bg-white/90 border border-neutral-200 text-[10px] text-neutral-600 leading-relaxed italic flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
              <span>{activeGuide.disclaimer}</span>
            </div>
          </div>
        )}

        {/* JOB MATCH TAB CONTENT (RS-090 / RS-091 / RS-092) */}
        {activeTab === "job-match" && (
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl border border-indigo-100 bg-indigo-50/40 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-neutral-900 text-xs flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                    Target Job Details & Requirements
                  </span>
                  <p className="text-[10px] text-neutral-600 mt-0.5">
                    Private & user-owned (100% client storage). Extracted requirements can be corrected anytime.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-expanded={showScoringGuide}
                    aria-controls="scoring-guide-panel"
                    onClick={() => setShowScoringGuide(!showScoringGuide)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#3d4f97] hover:text-[#21242e] bg-white px-2 py-1 rounded border border-[#3d4f97]/30 transition"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    {showScoringGuide ? "Hide Guide" : "How Job Match Works"}
                  </button>
                  {requirements.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearTarget}
                      className="text-[10px] text-rose-600 hover:text-rose-800 font-medium transition"
                    >
                      Clear Target
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowJdInput(!showJdInput)}
                    className="text-[11px] font-medium text-indigo-600 hover:text-indigo-800 transition"
                  >
                    {showJdInput ? "Hide Input" : jobMatch.analyzed ? "Edit Job Description" : "Paste Job Description"}
                  </button>
                </div>
              </div>

              {/* Input Form for Job Description & Metadata */}
              {(!jobMatch.analyzed || showJdInput) && (
                <div className="space-y-2 pt-1 border-t border-indigo-100">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-neutral-700 font-semibold">Job Title (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. Senior Frontend Engineer"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        className="w-full p-1.5 text-xs rounded border border-neutral-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-neutral-700 font-semibold">Company (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. Acme Corp"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="w-full p-1.5 text-xs rounded border border-neutral-300 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-neutral-700 font-semibold">Pasted Job Description</label>
                    <textarea
                      rows={4}
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste the target job description or posting here to analyze keyword alignment…"
                      className="w-full p-2.5 text-xs rounded-lg border border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 font-mono text-[11px]"
                    />
                    <div className="flex justify-between items-center text-[10px] text-neutral-600 mt-1">
                      <span>{jobDescription.length} / 10,000 characters</span>
                      {jobDescription.length > 0 && jobDescription.length < 25 && (
                        <span className="text-amber-600">Please paste at least 25 characters for meaningful analysis.</span>
                      )}
                    </div>
                  </div>

                  {extractionError && (
                    <div className="p-2 rounded bg-rose-50 text-rose-700 text-[11px] border border-rose-200">
                      {extractionError}
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      disabled={isExtracting || jobDescription.trim().length < 25}
                      onClick={handleExtractRequirements}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition shadow-xs"
                    >
                      {isExtracting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Extracting Requirements…
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          Extract Requirements with AI
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Keyword / Qualification Alignment Summary */}
              {jobMatch.analyzed && (
                <div className="pt-2 border-t border-indigo-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-700 font-medium">
                      Keyword Alignment: <strong>{jobMatch.score}%</strong>
                    </span>
                    {jobMatch.requiredScore !== undefined && (
                      <span className="text-[11px] text-neutral-600">
                        Required: <strong className="text-indigo-700">{jobMatch.requiredScore}%</strong> | Preferred: <strong>{jobMatch.preferredScore}%</strong>
                      </span>
                    )}
                  </div>

                  <div className="text-[10px] text-neutral-500 italic">
                    Never fabricate unpossessed skills. Matched evidence links directly to explicit sections in your resume.
                  </div>
                </div>
              )}
            </div>

            {/* Structured Requirements List & Corrections (RS-091 & RS-092) */}
            {(requirements.length > 0 || jobMatch.analyzed) && (
              <div className="p-3.5 rounded-xl border border-neutral-200 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-xs text-neutral-900">
                    Target Requirements ({requirements.length})
                  </h4>
                  <span className="text-[10px] text-neutral-500">
                    Click badge to toggle Required / Preferred
                  </span>
                </div>

                {/* Add Custom Requirement form */}
                <form onSubmit={handleAddRequirement} className="flex gap-2 text-xs">
                  <input
                    type="text"
                    placeholder="Add custom required or preferred skill…"
                    value={newReqText}
                    onChange={(e) => setNewReqText(e.target.value)}
                    className="flex-1 px-2.5 py-1 text-xs rounded border border-neutral-300"
                  />
                  <select
                    value={newReqType}
                    onChange={(e) => setNewReqType(e.target.value as RequirementType)}
                    className="px-2 py-1 text-xs rounded border border-neutral-300 bg-white font-medium"
                  >
                    <option value="required">Required</option>
                    <option value="preferred">Preferred</option>
                    <option value="responsibility">Responsibility</option>
                  </select>
                  <button
                    type="submit"
                    disabled={!newReqText.trim()}
                    className="px-2.5 py-1 rounded bg-neutral-900 text-white font-medium hover:bg-neutral-800 disabled:opacity-40 transition flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add
                  </button>
                </form>

                {/* Requirements List with Matched Status & Evidence */}
                <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                  {requirements.map((req) => {
                    const matchedInfo = jobMatch.matchedRequirements?.find(
                      (m) => m.requirementText.toLowerCase() === req.text.toLowerCase()
                    );
                    const isMatched = Boolean(matchedInfo);

                    return (
                      <div
                        key={req.id}
                        className="p-2 rounded-lg border border-neutral-100 bg-neutral-50/70 text-xs flex items-start justify-between gap-2"
                      >
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <button
                              type="button"
                              title="Click to toggle required / preferred / responsibility"
                              onClick={() =>
                                handleUpdateRequirementType(
                                  req.id,
                                  req.type === "required"
                                    ? "preferred"
                                    : req.type === "preferred"
                                    ? "responsibility"
                                    : "required"
                                )
                              }
                              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold cursor-pointer transition ${
                                req.type === "required"
                                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                                  : req.type === "preferred"
                                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                                  : "bg-neutral-100 text-neutral-600 border border-neutral-200"
                              }`}
                            >
                              {req.type}
                            </button>
                            <span className="font-medium text-neutral-800 text-[11px]">
                              {req.text}
                            </span>
                            {isMatched ? (
                              <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1 rounded border border-emerald-200">
                                <Check className="w-2.5 h-2.5" /> Evidenced
                              </span>
                            ) : (
                              <span className="text-[10px] text-amber-700 bg-amber-50 px-1 rounded border border-amber-200 font-medium">
                                Not Evidenced
                              </span>
                            )}
                          </div>

                          {/* Evidence Location Display (RS-092) */}
                          {isMatched && matchedInfo && matchedInfo.evidenceLocations.length > 0 && (
                            <div className="text-[10px] text-neutral-500 pl-1 border-l-2 border-emerald-400">
                              Found in: {matchedInfo.evidenceLocations[0]}
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteRequirement(req.id)}
                          title="Remove requirement"
                          className="text-neutral-400 hover:text-rose-600 transition p-0.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* RS-096: Side-by-Side Keyword Evidence Locator */}
            {(requirements.length > 0 || jobMatch.analyzed) && (
              <KeywordEvidenceLocator
                jobMatch={jobMatch}
                requirements={requirements}
              />
            )}

            {/* Empty State when no JD pasted */}
            {!jobMatch.analyzed && (
              <div className="p-6 rounded-xl border border-dashed border-neutral-200 bg-white text-center space-y-2">
                <CheckCircle2 className="w-7 h-7 text-indigo-400 mx-auto" />
                <h4 className="font-semibold text-neutral-800 text-xs">
                  No Job Description Added
                </h4>
                <p className="text-[11px] text-neutral-500 max-w-sm mx-auto">
                  Paste a job description above to inspect keyword overlap, identify missing qualifications, and evaluate evidence without sending private data to third parties.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Ignored Suggestions Drawer (RS-102) */}
        {activeTab === "writing-quality" && showIgnoredDrawer && ignoredWritingFindings.length > 0 && (
          <div className="p-3 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-neutral-700 text-xs">
                Ignored Suggestions ({ignoredWritingFindings.length})
              </span>
              <span className="text-[10px] text-neutral-500">
                Subjective style guidance you opted to skip
              </span>
            </div>
            <div className="space-y-1.5">
              {ignoredWritingFindings.map((f) => (
                <div
                  key={f.ruleId}
                  className="p-2 rounded bg-white border border-neutral-200 flex items-center justify-between text-[11px]"
                >
                  <div>
                    <span className="font-medium text-neutral-800">{f.title}</span>
                    <p className="text-[10px] text-neutral-500">{f.message}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleIgnore(f.ruleId)}
                    className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Restore
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CHECKLIST VIEW & EXPLAINABILITY (RS-095) for non-Job-Match categories */}
        {activeTab !== "job-match" && (
          <div className="space-y-3">
            {/* Filter Affordance Segmented Control */}
            <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
              <div
                role="group"
                aria-label="Filter readiness checks"
                className="inline-flex rounded-lg border border-neutral-200 p-0.5 bg-neutral-100/90 text-[10px] font-bold"
              >
                <button
                  type="button"
                  aria-pressed={filterMode === "all"}
                  onClick={() => setFilterMode("all")}
                  className={`px-2.5 py-1 rounded-md transition ${
                    filterMode === "all"
                      ? "bg-[#21242e] text-white shadow-xs"
                      : "text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  All Checks ({checkCounts.total})
                </button>
                <button
                  type="button"
                  aria-pressed={filterMode === "incomplete"}
                  onClick={() => setFilterMode("incomplete")}
                  className={`px-2.5 py-1 rounded-md transition flex items-center gap-1 ${
                    filterMode === "incomplete"
                      ? "bg-[#21242e] text-white shadow-xs"
                      : "text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  Incomplete ({checkCounts.incomplete})
                  {checkCounts.incomplete > 0 && (
                    <span className="w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[8px] flex items-center justify-center font-bold">
                      {checkCounts.incomplete}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  aria-pressed={filterMode === "passed"}
                  onClick={() => setFilterMode("passed")}
                  className={`px-2.5 py-1 rounded-md transition flex items-center gap-1 ${
                    filterMode === "passed"
                      ? "bg-[#21242e] text-white shadow-xs"
                      : "text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  Passed ({checkCounts.passed})
                  <Check className="w-3 h-3 text-emerald-500" />
                </button>
              </div>

              <span className="text-[10px] text-neutral-500 font-medium">
                Showing {visibleChecks.length} item{visibleChecks.length === 1 ? "" : "s"}
              </span>
            </div>

            {/* Checklist items */}
            {visibleChecks.length === 0 ? (
              <div className="p-6 rounded-xl border border-dashed border-neutral-200 bg-white text-center space-y-2">
                <CheckCircle2 className="w-7 h-7 text-emerald-500 mx-auto" />
                <h4 className="font-semibold text-neutral-800 text-xs">
                  {filterMode === "incomplete"
                    ? "All Category Checks Passed"
                    : filterMode === "passed"
                    ? "No Passed Checks in this View"
                    : "No Checks Available"}
                </h4>
                <p className="text-[11px] text-neutral-500 max-w-sm mx-auto">
                  {filterMode === "incomplete"
                    ? "All evaluated criteria for this category meet standard conservative ATS parsing and completeness expectations."
                    : "Complete more sections to verify readiness against our deterministic criteria."}
                </p>
              </div>
            ) : (
              visibleChecks.map((check) => {
                const isExpanded = expandedCheckIds.has(check.ruleId);
                const isPassed = check.status === "passed";

                return (
                  <div
                    key={check.ruleId}
                    className={`p-3.5 rounded-xl border transition space-y-2 shadow-2xs ${
                      isPassed
                        ? "bg-white/90 border-neutral-200 hover:border-neutral-300"
                        : "bg-white border-neutral-200 hover:border-neutral-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {isPassed ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Passed
                            </span>
                          ) : (
                            renderSeverityBadge(check.severity || "warning")
                          )}

                          {!isPassed && check.isSubjective && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-neutral-100 text-neutral-600 font-medium">
                              Subjective Guidance
                            </span>
                          )}

                          <h4 className="font-semibold text-xs text-neutral-900 break-words">
                            {check.title}
                          </h4>
                        </div>

                        {/* Summary message */}
                        <p className="text-[11px] text-neutral-600 leading-relaxed">
                          {isPassed ? check.passCondition : check.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* RS-102: Ignore button for subjective style guidance */}
                        {check.isSubjective && !isPassed && (
                          <button
                            type="button"
                            onClick={() => handleToggleIgnore(check.finding?.ruleId || check.ruleId)}
                            title="Ignore this subjective suggestion"
                            className="inline-flex items-center gap-1 text-[10px] text-neutral-400 hover:text-neutral-700 px-1.5 py-0.5 rounded border border-neutral-200 hover:bg-neutral-50 transition"
                          >
                            <EyeOff className="w-3 h-3" />
                            Ignore
                          </button>
                        )}

                        {/* Expand/Collapse Details button */}
                        <button
                          type="button"
                          aria-expanded={isExpanded}
                          aria-controls={`check-details-${check.ruleId}`}
                          onClick={() => handleToggleCheckDetails(check.ruleId)}
                          className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-[#3d4f97] hover:text-[#21242e] px-2 py-0.5 rounded hover:bg-[#eaedff] transition"
                        >
                          {isExpanded ? "Hide Details" : "Why this check?"}
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>

                    {/* Actionable recommendation for incomplete checks */}
                    {!isPassed && (
                      <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-100 text-[11px] space-y-1">
                        <div className="text-neutral-500">
                          <span className="font-medium text-neutral-700">Why it matters:</span> {check.whyItMatters}
                        </div>
                        <div className="text-neutral-700 font-medium">
                          <span className="text-indigo-600 font-semibold">Recommended fix:</span> {check.remediation}
                        </div>
                      </div>
                    )}

                    {/* Expandable explainability details (RS-095) */}
                    {isExpanded && (
                      <div
                        id={`check-details-${check.ruleId}`}
                        className="p-3 rounded-lg bg-[#eaedff]/40 border border-[#3d4f97]/20 text-[11px] space-y-2 mt-2"
                      >
                        <div className="space-y-1">
                          <div className="text-neutral-700">
                            <span className="font-bold text-[#21242e]">What is evaluated: </span>
                            {check.description}
                          </div>
                          <div className="text-neutral-700">
                            <span className="font-bold text-[#21242e]">Pass condition: </span>
                            {check.passCondition}
                          </div>
                          {check.evidence && (
                            <div className="text-neutral-700 bg-white/80 p-2 rounded border border-neutral-200">
                              <span className="font-bold text-[#21242e]">Observed status / evidence: </span>
                              <span className="font-mono text-[10px] text-neutral-800">{check.evidence}</span>
                            </div>
                          )}
                          {isPassed && check.whyItMatters && (
                            <div className="text-neutral-600">
                              <span className="font-bold text-[#21242e]">Parser context: </span>
                              {check.whyItMatters}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Jump to section action */}
                    {!isPassed && check.sectionId && (
                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => handleJumpToSection(check.sectionId)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition"
                        >
                          Edit in {check.sectionId}
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Realistic ATS Disclaimer */}
      <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-200 text-[10px] text-neutral-600 leading-relaxed">
        <span className="font-semibold text-neutral-700">ATS Assessment Transparency:</span> Independent builders cannot replicate proprietary employer applicant tracking algorithms or guarantee interview invitations. These heuristics assess known structural formatting risks, readability, and content coverage.
      </div>
    </div>
  );
}
