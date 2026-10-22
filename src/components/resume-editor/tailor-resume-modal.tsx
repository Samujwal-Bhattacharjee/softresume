/**
 * RS-094 — Job-Specific Resume Tailoring & Cartridge Cloning Modal
 *
 * Implements the user flow for creating an independent tailored resume copy
 * associated with a specific job target (role, company, job description).
 *
 * Core Guarantees:
 * 1. Master Immutability: Source cartridge remains 100% unaltered.
 * 2. Deep Clone: Independent memory/storage references for all sections.
 * 3. Lineage Tracking: Derived cartridge retains parentResumeId and target role/company.
 * 4. Safe Concurrency: Duplicate-submission protection while creation is in-flight.
 * 5. Console Chrome: Follows docs/DESIGN.md hardware aesthetics.
 */
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { ResumeListItem } from "@/lib/resume/local-adapter";
import { useStorageAdapter } from "@/lib/hooks/useStorageAdapter";

interface TailorResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceResumeId?: string;
  resumes: ResumeListItem[];
  onSuccess?: (newResumeId: string) => void;
}

export function TailorResumeModal({
  isOpen,
  onClose,
  sourceResumeId,
  resumes,
  onSuccess,
}: TailorResumeModalProps) {
  const router = useRouter();
  const { adapter } = useStorageAdapter();

  // Find default source: either passed sourceResumeId or first master or first available
  const defaultSourceId =
    sourceResumeId ||
    resumes.find((r) => r.isMaster)?.id ||
    resumes[0]?.id ||
    "";

  const [selectedSourceId, setSelectedSourceId] = useState<string>(defaultSourceId);
  const [roleTitle, setRoleTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const roleInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Focus role input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      roleInputRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // ESC key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape" && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const selectedSource = resumes.find((r) => r.id === selectedSourceId);
  const sourceTitle = selectedSource?.title || "Master Cartridge";

  // Generated Title Preview
  const computedTitle =
    customTitle.trim() ||
    (roleTitle.trim()
      ? `${sourceTitle} — ${roleTitle.trim()}${company.trim() ? ` (${company.trim()})` : ""}`
      : `${sourceTitle} — Tailored Variant`);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleTitle.trim()) {
      setErrorMessage("Target Role Title is required to initialize a tailored cartridge.");
      roleInputRef.current?.focus();
      return;
    }
    if (!selectedSourceId) {
      setErrorMessage("Please select a valid source cartridge to branch from.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await Promise.resolve(
        adapter.createTailoredCopy(selectedSourceId, {
          roleTitle: roleTitle.trim(),
          company: company.trim(),
          jobDescription: jobDescription.trim(),
          customTitle: computedTitle,
        })
      );

      if (onSuccess) {
        onSuccess(result.meta.id);
      } else {
        onClose();
        router.push(`/resume/${result.meta.id}/edit`);
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to create tailored cartridge. Please retry."
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-carbon/80 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tailor-modal-title"
      ref={modalRef}
    >
      <div className="bg-periwinkle-mid hardware-bevel p-space-xs sm:p-space-sm max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Hardware Header Telemetry */}
        <div className="bg-carbon text-nav-gold px-space-md py-space-xs flex items-center justify-between hardware-bevel shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-nav-gold animate-pulse"></span>
            <h2
              id="tailor-modal-title"
              className="font-display text-xs sm:text-sm tracking-wider uppercase"
            >
              TAILOR CARTRIDGE // SECTOR BRANCHING (RS-094)
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-platinum hover:text-nav-gold font-bold text-xs uppercase px-1.5 py-0.5 hardware-bevel bg-carbon cursor-pointer disabled:opacity-50"
            aria-label="Close tailoring modal"
          >
            ✕ ESC
          </button>
        </div>

        {/* Modal Scrollable Inset Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto space-y-4 text-carbon p-3 sm:p-5 bg-surface hardware-inset">
          {/* Instructions and Value Proposition */}
          <div className="border-l-2 border-nav-gold pl-3 py-0.5 text-xs text-carbon/90 font-hero-tagline">
            Branch a dedicated variant for a specific opportunity. Your source master remains unchanged, while this copy is paired with target job requirements for transparent ATS keyword matching.
          </div>

          {errorMessage && (
            <div
              role="alert"
              className="bg-games-red/10 border border-games-red text-games-red p-2.5 text-xs font-bold hardware-bevel flex items-center gap-2"
            >
              <span>⚠</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form Grid */}
          <div className="space-y-3">
            {/* Source Resume Selector */}
            <div>
              <label
                htmlFor="source-resume-select"
                className="block text-micro font-micro uppercase tracking-wider text-carbon/80 font-bold mb-1"
              >
                1. SOURCE CARTRIDGE TO CLONE FROM:
              </label>
              <select
                id="source-resume-select"
                value={selectedSourceId}
                onChange={(e) => setSelectedSourceId(e.target.value)}
                disabled={isSubmitting || resumes.length <= 1}
                className="w-full bg-surface-container-high border border-hairline p-2 text-xs font-bold uppercase hardware-inset focus:outline-none focus:ring-1 focus:ring-systems-teal disabled:opacity-60"
              >
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.isMaster ? "★ [MASTER] " : "◈ [TAILORED] "}
                    {r.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Role & Company Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="target-role-title"
                  className="block text-micro font-micro uppercase tracking-wider text-carbon/80 font-bold mb-1"
                >
                  2. TARGET POSITION / ROLE TITLE <span className="text-games-red">*</span>:
                </label>
                <input
                  id="target-role-title"
                  ref={roleInputRef}
                  type="text"
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  placeholder="e.g. Senior Platform Engineer"
                  maxLength={120}
                  disabled={isSubmitting}
                  className="w-full bg-surface-container-high border border-hairline p-2 text-xs font-bold hardware-inset focus:outline-none focus:ring-1 focus:ring-systems-teal"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="target-company"
                  className="block text-micro font-micro uppercase tracking-wider text-carbon/80 font-bold mb-1"
                >
                  3. COMPANY / CLIENT (OPTIONAL):
                </label>
                <input
                  id="target-company"
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Stripe, Linear, NHS"
                  maxLength={120}
                  disabled={isSubmitting}
                  className="w-full bg-surface-container-high border border-hairline p-2 text-xs font-bold hardware-inset focus:outline-none focus:ring-1 focus:ring-systems-teal"
                />
              </div>
            </div>

            {/* Job Description (Optional) */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label
                  htmlFor="job-description-input"
                  className="block text-micro font-micro uppercase tracking-wider text-carbon/80 font-bold"
                >
                  4. JOB DESCRIPTION / REQUIREMENTS (OPTIONAL):
                </label>
                <span className="text-micro font-micro text-carbon/60">
                  {jobDescription.length} / 10,000 CHARS
                </span>
              </div>
              <textarea
                id="job-description-input"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job posting, key qualifications, or required tech stack here. This will feed into your ATS Review panel for keyword coverage matching."
                maxLength={10000}
                rows={4}
                disabled={isSubmitting}
                className="w-full bg-surface-container-high border border-hairline p-2 text-xs hardware-inset font-mono focus:outline-none focus:ring-1 focus:ring-systems-teal resize-y"
              />
            </div>

            {/* Generated Cartridge Title */}
            <div>
              <label
                htmlFor="custom-title-input"
                className="block text-micro font-micro uppercase tracking-wider text-carbon/80 font-bold mb-1"
              >
                5. VARIANT CARTRIDGE LABEL (PREVIEW / EDIT):
              </label>
              <input
                id="custom-title-input"
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder={computedTitle}
                maxLength={120}
                disabled={isSubmitting}
                className="w-full bg-surface-container-high border border-hairline p-2 text-xs font-bold uppercase hardware-inset focus:outline-none focus:ring-1 focus:ring-systems-teal"
              />
            </div>
          </div>

          {/* Master Immutability Guarantee Banner */}
          <div className="bg-periwinkle-light hardware-bevel p-2.5 flex items-start gap-2 border border-hairline">
            <span className="text-nav-gold text-sm shrink-0">🔒</span>
            <div className="text-micro font-micro text-carbon/90">
              <span className="font-bold uppercase tracking-wider text-carbon block">
                IMMUTABILITY GUARANTEE & DATA BOUNDARY
              </span>
              Source cartridge <strong className="text-carbon font-bold">&ldquo;{sourceTitle}&rdquo;</strong> will remain 100% untouched. All sections, bullets, and settings are cloned into an independent revision sector. Edits in either document will never leak across documents.
            </div>
          </div>

          {/* Actions Deck */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-2 pt-2 border-t border-hairline">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-4 py-2 bg-platinum hover:bg-surface text-carbon hardware-bevel font-ui-label text-ui-label uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
            >
              CANCEL
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !roleTitle.trim()}
              className="w-full sm:w-auto px-5 py-2 bg-secondary-container hover:bg-nav-gold text-carbon font-bold hardware-bevel font-nav-link text-nav-link uppercase tracking-wider flex items-center justify-center gap-1.5 active:translate-y-0.5 transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-carbon animate-ping" />
                  <span>INITIALIZING SECTOR...</span>
                </>
              ) : (
                <>
                  <span>INITIALIZE TAILORED CARTRIDGE →</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
