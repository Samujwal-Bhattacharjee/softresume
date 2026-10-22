/**
 * RS-114 / RS-123 — Shared PDF/DOCX Export Panel and Presentation Settings
 *
 * Implements Nintendo 2001 Console Chrome design system (DESIGN.md) for
 * template selection, page formatting, typography, section reordering,
 * and reliable PDF/DOCX/TXT/JSON exports with live telemetry and feedback.
 */
"use client";

import { useState } from "react";
import { useEditorStore } from "@/lib/resume/editor-store";
import {
  TEMPLATE_REGISTRY,
  FONT_PRESET_CONFIG,
} from "@/lib/resume/template-contract";
import type {
  TemplateId,
  FontPreset,
  PageSize,
  MarginSize,
} from "@/lib/schemas/resume";
import { generatePlainTextResume } from "@/lib/export/txt-export";
import { generateDocxBlob } from "@/lib/export/docx-export";
import { sanitizeResumeFilename } from "@/lib/export/filename";
import { exportToJsonResume } from "@/lib/export/json-resume";
import {
  FileText,
  Download,
  Printer,
  FileCode,
  Check,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  AlertTriangle,
  Loader2,
  RefreshCw,
} from "lucide-react";

export function TemplateSettingsPanel() {
  const draft = useEditorStore((s) => s.draft);
  const updateSettings = useEditorStore((s) => s.updateSettings);

  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  const activeTemplate = TEMPLATE_REGISTRY[draft.settings.templateId] || TEMPLATE_REGISTRY["classic-ats"];

  // Helper for downloading generated blobs
  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Direct Server-Side PDF Download (RS-111)
  const handleDownloadPdf = async () => {
    const filename = sanitizeResumeFilename(draft.basics.name, "pdf");
    try {
      setIsExportingPdf(true);
      setStatusMessage({ type: "info", text: "Compiling vector PDF via Chromium..." });

      const response = await fetch("/api/export/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          document: draft,
          settings: draft.settings,
        }),
      });

      if (!response.ok) {
        throw new Error(`Export failed (${response.status}). Falling back to browser print.`);
      }

      const blob = await response.blob();
      downloadBlob(blob, filename);

      setStatusMessage({
        type: "success",
        text: `Export complete: ${filename}`,
      });
      setTimeout(() => setStatusMessage(null), 5000);
    } catch (err) {
      console.error("PDF export error:", err);
      setStatusMessage({
        type: "error",
        text: err instanceof Error ? err.message : "PDF generation failed. Try 'Print to PDF' below.",
      });
    } finally {
      setIsExportingPdf(false);
    }
  };

  // DOCX Export (RS-120)
  const handleExportDocx = async () => {
    const filename = sanitizeResumeFilename(draft.basics.name, "docx");
    try {
      setIsExportingDocx(true);
      setStatusMessage({ type: "info", text: "Assembling Word document (.docx)..." });

      const blob = await generateDocxBlob(draft);
      downloadBlob(blob, filename);

      setStatusMessage({
        type: "success",
        text: `Export complete: ${filename}`,
      });
      setTimeout(() => setStatusMessage(null), 5000);
    } catch (err) {
      console.error("DOCX export error:", err);
      setStatusMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to compile Word document.",
      });
    } finally {
      setIsExportingDocx(false);
    }
  };

  // Browser Print Dialog (Instant fallback)
  const handlePrintPdf = () => {
    window.print();
  };

  // Plain Text Export
  const handleExportTxt = () => {
    const filename = sanitizeResumeFilename(draft.basics.name, "txt");
    const txt = generatePlainTextResume(draft);
    const blob = new Blob([txt], { type: "text/plain;charset=utf-8" });
    downloadBlob(blob, filename);
    setStatusMessage({ type: "success", text: `Plain text exported: ${filename}` });
    setTimeout(() => setStatusMessage(null), 3500);
  };

  // JSON Schema Export
  const handleExportJson = () => {
    const filename = sanitizeResumeFilename(draft.basics.name, "json");
    const jsonStr = JSON.stringify(draft, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    downloadBlob(blob, filename);
    setStatusMessage({ type: "success", text: `App schema JSON exported: ${filename}` });
    setTimeout(() => setStatusMessage(null), 3500);
  };

  // Standard JSON Resume v1.0 Export (RS-097)
  const handleExportJsonResume = () => {
    const baseName = draft.basics.name?.trim() || "resume";
    const filename = sanitizeResumeFilename(`${baseName}-json-resume`, "json");
    const jsonResumePayload = exportToJsonResume(draft);
    const blob = new Blob([JSON.stringify(jsonResumePayload, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    downloadBlob(blob, filename);
    setStatusMessage({
      type: "success",
      text: `Standard JSON Resume (v1.0) exported: ${filename}`,
    });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // Section reordering
  const handleMoveSection = (index: number, direction: "up" | "down") => {
    const order = [...draft.settings.sectionOrder];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= order.length) return;
    const item = order[index];
    order[index] = order[targetIdx];
    order[targetIdx] = item;
    updateSettings({ sectionOrder: order });
  };

  const handleToggleSectionVisibility = (sectionKey: string) => {
    const hidden = draft.settings.hiddenSections || [];
    const isHidden = hidden.includes(sectionKey);
    const nextHidden = isHidden
      ? hidden.filter((s) => s !== sectionKey)
      : [...hidden, sectionKey];
    updateSettings({ hiddenSections: nextHidden });
  };

  // Warnings telemetry
  const isHighDensity =
    draft.settings.marginSize === "compact" && draft.settings.lineSpacing <= 1.05;
  const isMultiPageRisk =
    (draft.experience?.length || 0) + (draft.projects?.length || 0) >= 5;

  return (
    <div className="p-4 space-y-5 text-xs text-[#21242e]">
      {/* ─────────────────────────────────────────────
          Export Telemetry & Hardware Action Deck (RS-123)
          ───────────────────────────────────────────── */}
      <div className="rounded-xs border border-[#3d4f97] bg-[#eaedff] overflow-hidden shadow-xs">
        {/* Console Header Bar */}
        <div className="bg-[#21242e] text-white px-3 py-2 flex items-center justify-between border-b border-[#3d4f97]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#f68d1f] inline-block animate-pulse" />
            <span className="font-bold text-[11px] tracking-wider uppercase">
              EXPORT TELEMETRY
            </span>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-xs bg-[#ecab37] text-[#21242e] font-bold">
            {draft.settings.pageSize === "A4" ? "A4 210×297mm" : "LETTER 8.5×11″"}
          </span>
        </div>

        <div className="p-3.5 space-y-3">
          {/* Status Live Region */}
          <div aria-live="polite" className="min-h-[22px]">
            {statusMessage ? (
              <div
                className={`p-2 rounded-xs border text-[11px] font-medium flex items-center justify-between ${
                  statusMessage.type === "success"
                    ? "bg-[#e8f5e9] border-[#4caf50] text-[#1b5e20]"
                    : statusMessage.type === "error"
                    ? "bg-[#ffebee] border-[#f44336] text-[#b71c1c]"
                    : "bg-[#e3f2fd] border-[#2196f3] text-[#0d47a1]"
                }`}
              >
                <span>{statusMessage.text}</span>
                {statusMessage.type === "error" && (
                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    className="ml-2 underline flex items-center gap-1 hover:text-black font-bold"
                  >
                    <RefreshCw className="w-3 h-3" /> Retry
                  </button>
                )}
              </div>
            ) : (
              <div className="text-[11px] text-[#3d4f97] flex items-center gap-1.5">
                <span className="font-semibold text-[#21242e]">Format:</span> Vector PDF & Clean DOCX ready
              </div>
            )}
          </div>

          {/* Density / Overflow Warnings */}
          {(isHighDensity || isMultiPageRisk) && (
            <div className="p-2 bg-[#fff8e1] border border-[#ffb300] rounded-xs text-[11px] text-[#e65100] flex items-start gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#ff8f00]" />
              <div className="space-y-0.5">
                {isHighDensity && (
                  <p><strong>High Density:</strong> Compact margins and tight spacing may crowd text near page edges.</p>
                )}
                {isMultiPageRisk && (
                  <p><strong>Multi-Page Scope:</strong> 5+ work and project entries detected. Review pagination in preview.</p>
                )}
              </div>
            </div>
          )}

          {/* Primary Action Buttons */}
          <div className="space-y-2">
            <button
              type="button"
              disabled={isExportingPdf}
              onClick={handleDownloadPdf}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xs bg-[#f68d1f] hover:bg-[#e48600] active:scale-[0.99] text-[#21242e] font-bold text-xs uppercase tracking-wider transition border border-[#d35400] shadow-sm disabled:opacity-50"
            >
              {isExportingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating PDF Binary…
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download PDF (Vector)
                </>
              )}
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={isExportingDocx}
                onClick={handleExportDocx}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xs bg-[#21242e] hover:bg-[#2c3242] text-white font-bold transition text-xs border border-black disabled:opacity-50"
              >
                {isExportingDocx ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <FileText className="w-3.5 h-3.5 text-[#9fbee7]" />
                )}
                Word (.docx)
              </button>

              <button
                type="button"
                onClick={handlePrintPdf}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xs bg-white hover:bg-[#f2f3ff] text-[#21242e] font-bold transition text-xs border border-[#3d4f97]"
              >
                <Printer className="w-3.5 h-3.5 text-[#3d4f97]" />
                Print / Save PDF
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleExportTxt}
                className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-xs bg-[#f2f3ff] hover:bg-white text-[#3d4f97] border border-[#7a8aba]/60 text-[11px] font-medium"
              >
                <FileText className="w-3 h-3 text-[#3d4f97]" />
                Plain Text (.txt)
              </button>
              <button
                type="button"
                onClick={handleExportJson}
                className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-xs bg-[#f2f3ff] hover:bg-white text-[#3d4f97] border border-[#7a8aba]/60 text-[11px] font-medium"
                title="Export complete internal SoftCV schema JSON"
              >
                <FileCode className="w-3 h-3 text-[#3d4f97]" />
                App Schema (.json)
              </button>
            </div>

            <button
              type="button"
              onClick={handleExportJsonResume}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xs bg-[#21242e] hover:bg-black text-nav-gold border border-hairline text-[11px] font-bold hardware-bevel transition mt-2 cursor-pointer"
              title="Export single resume in public standard JSON Resume format (jsonresume.org v1.0.0)"
            >
              <FileCode className="w-3.5 h-3.5 text-nav-gold" />
              Standard JSON Resume (v1.0) ↓
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────
          Template Selection (Console Chrome Style)
          ───────────────────────────────────────────── */}
      <div className="space-y-2">
        <label className="font-bold uppercase tracking-wider block text-[11px] text-[#21242e]">
          CARTRIDGE ARCHETYPE (TEMPLATE)
        </label>
        <div className="space-y-1.5">
          {(Object.keys(TEMPLATE_REGISTRY) as TemplateId[]).map((id) => {
            const tmpl = TEMPLATE_REGISTRY[id];
            const isSelected = draft.settings.templateId === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => updateSettings({ templateId: id })}
                className={`w-full text-left p-2.5 rounded-xs border transition flex items-start justify-between ${
                  isSelected
                    ? "border-[#3d4f97] bg-white ring-2 ring-[#f68d1f]/80 shadow-xs"
                    : "border-[#7a8aba]/50 hover:border-[#3d4f97] bg-[#f2f3ff]"
                }`}
              >
                <div>
                  <div className="font-bold text-xs text-[#21242e] flex items-center gap-1.5">
                    {tmpl.name}
                    {tmpl.atsLevel === "safe" && (
                      <span className="text-[9px] px-1 py-0.2 bg-[#206479] text-white rounded-xs font-mono font-bold uppercase">
                        ATS Safe
                      </span>
                    )}
                    {tmpl.atsLevel === "expressive" && (
                      <span className="text-[9px] px-1 py-0.2 bg-[#ecab37] text-[#21242e] rounded-xs font-mono font-bold uppercase">
                        Deferred
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-[#5a5f8c] line-clamp-1 mt-0.5">
                    {tmpl.description}
                  </div>
                </div>
                {isSelected && <Check className="w-4 h-4 text-[#f68d1f] shrink-0 mt-0.5" />}
              </button>
            );
          })}
        </div>

        {/* ATS Disclosure Card */}
        {activeTemplate && (
          <div className="p-2.5 rounded-xs bg-[#f2f3ff] border border-[#7a8aba]/50 text-[11px] text-[#3d4f97] leading-relaxed">
            <span className="font-bold text-[#21242e] block mb-0.5">ATS Disclosure:</span>
            {activeTemplate.atsDisclosure}
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────
          Page Dimensions & Typography Preset
          ───────────────────────────────────────────── */}
      <div className="space-y-3 pt-3 border-t border-[#7a8aba]/40">
        <div>
          <label className="font-bold uppercase tracking-wider block text-[11px] text-[#21242e] mb-1">
            PAGE DIMENSIONS
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(["A4", "US_LETTER"] as PageSize[]).map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => updateSettings({ pageSize: size })}
                className={`py-1.5 px-2 rounded-xs border text-center font-bold text-xs transition ${
                  draft.settings.pageSize === size
                    ? "border-[#3d4f97] bg-[#21242e] text-white shadow-xs"
                    : "border-[#7a8aba]/50 hover:border-[#3d4f97] bg-white text-[#21242e]"
                }`}
              >
                {size === "A4" ? "A4 (Standard Int'l)" : "US Letter (8.5×11″)"}
              </button>
            ))}
          </div>
        </div>

        {/* Typography Preset */}
        <div>
          <label htmlFor="settings-font-preset" className="font-bold uppercase tracking-wider block text-[11px] text-[#21242e] mb-1">
            TYPOGRAPHY FAMILY
          </label>
          <select
            id="settings-font-preset"
            value={draft.settings.fontPreset}
            onChange={(e) =>
              updateSettings({ fontPreset: e.target.value as FontPreset })
            }
            className="w-full px-2.5 py-1.5 rounded-xs border border-[#3d4f97] bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#f68d1f]"
          >
            {Object.entries(FONT_PRESET_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>
                {config.label}
              </option>
            ))}
          </select>
        </div>

        {/* Margins & Line Spacing */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="settings-page-margins" className="font-bold uppercase tracking-wider block text-[10px] text-[#21242e] mb-1">
              PAGE MARGINS
            </label>
            <select
              id="settings-page-margins"
              value={draft.settings.marginSize}
              onChange={(e) =>
                updateSettings({ marginSize: e.target.value as MarginSize })
              }
              className="w-full px-2 py-1.5 rounded-xs border border-[#3d4f97] bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#f68d1f]"
            >
              <option value="compact">Compact (15mm)</option>
              <option value="normal">Normal (20mm)</option>
              <option value="spacious">Spacious (25mm)</option>
            </select>
          </div>

          <div>
            <label htmlFor="settings-line-spacing" className="font-bold uppercase tracking-wider block text-[10px] text-[#21242e] mb-1">
              LINE SPACING
            </label>
            <select
              id="settings-line-spacing"
              value={draft.settings.lineSpacing.toString()}
              onChange={(e) =>
                updateSettings({ lineSpacing: parseFloat(e.target.value) })
              }
              className="w-full px-2 py-1.5 rounded-xs border border-[#3d4f97] bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#f68d1f]"
            >
              <option value="1.0">1.0 (Dense)</option>
              <option value="1.15">1.15 (Standard)</option>
              <option value="1.25">1.25 (Relaxed)</option>
              <option value="1.5">1.5 (Airy)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────
          Section Reordering & Visibility Rack
          ───────────────────────────────────────────── */}
      <div className="space-y-2 pt-3 border-t border-[#7a8aba]/40">
        <label className="font-bold uppercase tracking-wider block text-[11px] text-[#21242e]">
          SECTION RACK ORDER & VISIBILITY
        </label>
        <p className="text-[11px] text-[#5a5f8c]">
          Reorder sections to optimize recruiter reading hierarchy.
        </p>

        <div className="space-y-1">
          {draft.settings.sectionOrder.map((sectionKey, index) => {
            const isHidden = draft.settings.hiddenSections.includes(sectionKey);
            return (
              <div
                key={sectionKey}
                className={`flex items-center justify-between p-2 rounded-xs border transition ${
                  isHidden
                    ? "bg-[#eaedff]/60 border-[#7a8aba]/40 text-[#5a5f8c] opacity-60"
                    : "bg-white border-[#3d4f97] text-[#21242e] shadow-xs"
                }`}
              >
                <span className="capitalize font-bold text-[11px]">
                  {sectionKey}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => handleMoveSection(index, "up")}
                    className="p-1 hover:text-[#f68d1f] disabled:opacity-20"
                    title="Move section up"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={index === draft.settings.sectionOrder.length - 1}
                    onClick={() => handleMoveSection(index, "down")}
                    className="p-1 hover:text-[#f68d1f] disabled:opacity-20"
                    title="Move section down"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleSectionVisibility(sectionKey)}
                    className="p-1 hover:text-[#f68d1f] ml-0.5"
                    title={isHidden ? "Show section" : "Hide section"}
                  >
                    {isHidden ? (
                      <EyeOff className="w-3.5 h-3.5 text-[#7a8aba]" />
                    ) : (
                      <Eye className="w-3.5 h-3.5 text-[#3d4f97]" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
