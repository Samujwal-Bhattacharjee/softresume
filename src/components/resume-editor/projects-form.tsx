/**
 * RS-029 — Projects Form Component
 *
 * Repeatable section for student, open-source, or freelance projects.
 * Supports bullets, tech stack tags, project links, and repository URLs.
 */
"use client";

import React, { useState } from "react";
import { useEditorStore } from "@/lib/resume/editor-store";
import { Plus, Trash2, ChevronUp, ChevronDown, ExternalLink, Code2, Sparkles } from "lucide-react";
import { BulletImproverModal } from "./bullet-improver-modal";

export function ProjectsForm() {
  const projects = useEditorStore((s) => s.draft.projects);
  const addProject = useEditorStore((s) => s.addProject);
  const updateProject = useEditorStore((s) => s.updateProject);
  const removeProject = useEditorStore((s) => s.removeProject);
  const reorderProject = useEditorStore((s) => s.reorderProject);

  const [activeAiModal, setActiveAiModal] = useState<{
    projId: string;
    bulletIdx: number;
    bulletText: string;
    role?: string;
    employer?: string;
    technologies?: string[];
  } | null>(null);

  const handleTechChange = (projId: string, val: string) => {
    const items = val
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    updateProject(projId, { technologies: items });
  };

  const handleAddBullet = (projId: string, bullets: string[]) => {
    updateProject(projId, { bullets: [...bullets, ""] });
  };

  const handleUpdateBullet = (
    projId: string,
    bullets: string[],
    idx: number,
    text: string
  ) => {
    const next = [...bullets];
    next[idx] = text;
    updateProject(projId, { bullets: next });
  };

  const handleRemoveBullet = (
    projId: string,
    bullets: string[],
    idx: number
  ) => {
    updateProject(projId, {
      bullets: bullets.filter((_, i) => i !== idx),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-neutral-800">Projects</h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Key personal, academic, open-source, or client projects showing your technical ability.
          </p>
        </div>
        <button
          type="button"
          onClick={addProject}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition shadow-sm"
          style={{ background: "var(--color-accent-lavender-deep, #7C6FF6)" }}
        >
          <Plus className="w-3.5 h-3.5" />
          Add Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="p-8 border-2 border-dashed border-neutral-200 rounded-xl text-center">
          <p className="text-xs text-neutral-500 mb-3">
            No projects added yet. Highlighting 2–3 strong projects is ideal for students and career switchers.
          </p>
          <button
            type="button"
            onClick={addProject}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Add First Project
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {projects.map((proj, index) => (
            <div
              key={proj.id}
              className="p-4 rounded-xl border border-neutral-200 bg-white shadow-xs space-y-4"
            >
              {/* Header with reordering */}
              <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Project #{index + 1}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => reorderProject(index, index - 1)}
                    className="p-1 text-neutral-400 hover:text-neutral-700 disabled:opacity-30 transition"
                    title="Move up"
                    aria-label={`Move project ${index + 1} (${proj.name || "Untitled"}) up`}
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={index === projects.length - 1}
                    onClick={() => reorderProject(index, index + 1)}
                    className="p-1 text-neutral-400 hover:text-neutral-700 disabled:opacity-30 transition"
                    title="Move down"
                    aria-label={`Move project ${index + 1} (${proj.name || "Untitled"}) down`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeProject(proj.id)}
                    className="p-1 text-neutral-400 hover:text-red-500 transition ml-1"
                    title="Remove project"
                    aria-label={`Remove project ${index + 1} (${proj.name || "Untitled"})`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Form fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="col-span-1 md:col-span-2">
                  <label htmlFor={`proj-name-${proj.id}`} className="block text-xs font-medium text-neutral-700 mb-1">
                    Project Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id={`proj-name-${proj.id}`}
                    type="text"
                    required
                    value={proj.name}
                    onChange={(e) => updateProject(proj.id, { name: e.target.value })}
                    placeholder="e.g. StudyBuddy — Collaborative Notes Platform"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label htmlFor={`proj-tech-${proj.id}`} className="block text-xs font-medium text-neutral-700 mb-1">
                    Technologies / Tools Used (comma-separated)
                  </label>
                  <input
                    id={`proj-tech-${proj.id}`}
                    type="text"
                    value={(proj.technologies || []).join(", ")}
                    onChange={(e) => handleTechChange(proj.id, e.target.value)}
                    placeholder="e.g. React, TypeScript, Next.js, PostgreSQL, TailwindCSS"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                <div>
                  <label htmlFor={`proj-url-${proj.id}`} className="block text-xs font-medium text-neutral-700 mb-1 flex items-center gap-1">
                    <ExternalLink className="w-3 h-3 text-neutral-400" />
                    Live Demo URL
                  </label>
                  <input
                    id={`proj-url-${proj.id}`}
                    type="url"
                    value={proj.url || ""}
                    onChange={(e) => updateProject(proj.id, { url: e.target.value })}
                    placeholder="https://myproject.com"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                <div>
                  <label htmlFor={`proj-repo-${proj.id}`} className="block text-xs font-medium text-neutral-700 mb-1 flex items-center gap-1">
                    <Code2 className="w-3 h-3 text-neutral-400" />
                    Source Code / GitHub URL
                  </label>
                  <input
                    id={`proj-repo-${proj.id}`}
                    type="url"
                    value={proj.repoUrl || ""}
                    onChange={(e) => updateProject(proj.id, { repoUrl: e.target.value })}
                    placeholder="https://github.com/username/project"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
              </div>

              {/* Bullets */}
              <div className="pt-2 border-t border-neutral-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-neutral-700">
                    Project Impact & Technical Highlights
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAddBullet(proj.id, proj.bullets || [])}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    <Plus className="w-3 h-3" />
                    Add Bullet
                  </button>
                </div>

                <div className="space-y-2">
                  {(proj.bullets || []).map((bullet, bIdx) => (
                    <div key={bIdx} className="flex items-start gap-2">
                      <span className="text-neutral-400 mt-2 text-xs">•</span>
                      <textarea
                        rows={2}
                        value={bullet}
                        aria-label={`Project highlight bullet ${bIdx + 1} for ${proj.name || `Project ${index + 1}`}`}
                        onChange={(e) =>
                          handleUpdateBullet(proj.id, proj.bullets || [], bIdx, e.target.value)
                        }
                        placeholder="What you built, technical challenge solved, and outcome (e.g. Implemented WebSockets to support 50 concurrent live editors)"
                        className="flex-1 p-2 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setActiveAiModal({
                            projId: proj.id,
                            bulletIdx: bIdx,
                            bulletText: bullet,
                            role: "Project Contributor",
                            employer: proj.name,
                            technologies: proj.technologies,
                          })
                        }
                        aria-label={`Improve project bullet ${bIdx + 1} with AI`}
                        className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 mt-1 transition shrink-0"
                        title="Improve bullet with AI"
                      >
                        <Sparkles className="w-3 h-3 text-indigo-600" />
                        Improve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveBullet(proj.id, proj.bullets || [], bIdx)}
                        aria-label={`Remove project bullet ${bIdx + 1}`}
                        className="p-1 text-neutral-400 hover:text-red-500 mt-1"
                        title="Remove project bullet"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI Bullet Improver Modal */}
      {activeAiModal && (
        <BulletImproverModal
          isOpen={true}
          onClose={() => setActiveAiModal(null)}
          originalBullet={activeAiModal.bulletText}
          context={{
            role: activeAiModal.role,
            employer: activeAiModal.employer,
            technologies: activeAiModal.technologies,
          }}
          onApply={(improved) => {
            const pr = projects.find((p) => p.id === activeAiModal.projId);
            if (pr) {
              handleUpdateBullet(activeAiModal.projId, pr.bullets || [], activeAiModal.bulletIdx, improved);
            }
          }}
        />
      )}
    </div>
  );
}
