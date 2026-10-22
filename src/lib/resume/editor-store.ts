/**
 * RS-032 / RS-072 — Editor Draft State & Bounded Undo/Redo (Zustand store)
 *
 * Separates local draft editing state from persisted state.
 * Implements a bounded in-memory history ring (max 30 snapshots) for semantic resume edits.
 * Supports undo/redo across text edits, item add/remove, reordering, and AI acceptance.
 */
"use client";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import {
  type ResumeDocument,
  type ExperienceEntry,
  type EducationEntry,
  type ProjectEntry,
  type SkillGroup,
  type InternshipEntry,
  type CertificationEntry,
  type AwardEntry,
  type VolunteeringEntry,
  type PublicationEntry,
  type CustomSection,
  type CustomSectionItem,
  createEmptyResume,
} from "@/lib/schemas/resume";
import { generateId } from "@/lib/utils";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

const MAX_HISTORY = 30;
const GROUPING_WINDOW_MS = 600;

export interface EditorState {
  /** Current in-progress document (unsaved edits live here) */
  draft: ResumeDocument;
  /** Last successfully persisted document (for conflict detection) */
  persisted: ResumeDocument | null;
  /** Resume metadata (id, title, etc.) */
  resumeId: string | null;
  resumeTitle: string;
  /** Save status — never show 'saved' before persistence confirms */
  saveStatus: SaveStatus;
  saveError: string | null;
  /** Whether we have unsaved changes */
  isDirty: boolean;
  /** Active section key for the editor panel */
  activeSection: string;

  /** RS-096: Locator target for evidence inspection */
  locatorTarget: {
    section: string;
    term?: string;
    source?: "matched" | "missing";
    timestamp: number;
  } | null;

  // ── History & Undo/Redo State (RS-072) ──────────────────────────────────
  history: ResumeDocument[];
  historyIndex: number;
  canUndo: boolean;
  canRedo: boolean;
  lastActionDescription: string | null;
  lastGroupKey: string | null;
  lastGroupTime: number;
}

export interface EditorActions {
  /** Initialize the store with a loaded resume */
  initResume: (
    resumeId: string,
    title: string,
    document: ResumeDocument
  ) => void;
  /** Start a new blank resume */
  startBlank: () => void;
  /** Undo the last semantic edit */
  undo: () => void;
  /** Redo the previously undone edit */
  redo: () => void;

  /** Update the basics section */
  updateBasics: (patch: Partial<ResumeDocument["basics"]>) => void;
  /** Update the summary */
  updateSummary: (summary: string) => void;
  /** Add/update/remove experience entries */
  addExperience: () => void;
  updateExperience: (id: string, patch: Partial<ExperienceEntry>) => void;
  removeExperience: (id: string) => void;
  reorderExperience: (fromIndex: number, toIndex: number) => void;
  /** Education */
  addEducation: () => void;
  updateEducation: (id: string, patch: Partial<EducationEntry>) => void;
  removeEducation: (id: string) => void;
  reorderEducation: (fromIndex: number, toIndex: number) => void;
  /** Projects */
  addProject: () => void;
  updateProject: (id: string, patch: Partial<ProjectEntry>) => void;
  removeProject: (id: string) => void;
  reorderProject: (fromIndex: number, toIndex: number) => void;
  /** Skills */
  addSkillGroup: () => void;
  updateSkillGroup: (id: string, patch: Partial<SkillGroup>) => void;
  removeSkillGroup: (id: string) => void;
  /** Internships */
  addInternship: () => void;
  updateInternship: (id: string, patch: Partial<InternshipEntry>) => void;
  removeInternship: (id: string) => void;
  /** Certifications (RS-075) */
  addCertification: (entry?: Partial<CertificationEntry>) => void;
  updateCertification: (id: string, patch: Partial<CertificationEntry>) => void;
  removeCertification: (id: string) => void;
  /** Awards (RS-075) */
  addAward: (entry?: Partial<AwardEntry>) => void;
  updateAward: (id: string, patch: Partial<AwardEntry>) => void;
  removeAward: (id: string) => void;
  /** Volunteering (RS-075) */
  addVolunteering: (entry?: Partial<VolunteeringEntry>) => void;
  updateVolunteering: (id: string, patch: Partial<VolunteeringEntry>) => void;
  removeVolunteering: (id: string) => void;
  /** Publications (RS-075) */
  addPublication: (entry?: Partial<PublicationEntry>) => void;
  updatePublication: (id: string, patch: Partial<PublicationEntry>) => void;
  removePublication: (id: string) => void;
  /** Custom Sections (RS-075) */
  addCustomSection: (title?: string) => void;
  updateCustomSection: (id: string, patch: Partial<CustomSection>) => void;
  removeCustomSection: (id: string) => void;
  addCustomSectionItem: (sectionId: string, item?: Partial<CustomSectionItem>) => void;
  updateCustomSectionItem: (sectionId: string, itemId: string, patch: Partial<CustomSectionItem>) => void;
  removeCustomSectionItem: (sectionId: string, itemId: string) => void;
  /** Settings */
  updateSettings: (patch: Partial<ResumeDocument["settings"]>) => void;
  /** Section navigation */
  setActiveSection: (section: string) => void;
  /** RS-096: Set or clear locator focus target */
  setLocatorTarget: (target: { section: string; term?: string; source?: "matched" | "missing"; timestamp: number } | null) => void;
  /** RS-096: Navigate to editor section and focus locator target without mutating draft */
  navigateToSection: (section: string, term?: string, source?: "matched" | "missing") => void;
  /** Save lifecycle */
  setSaveStatus: (status: SaveStatus, error?: string) => void;
  markSaved: (persistedDoc: ResumeDocument) => void;
  /** Replace entire draft (e.g. after AI suggestion accepted) */
  replaceDraft: (doc: ResumeDocument, description?: string) => void;
}

type EditorStore = EditorState & EditorActions;

const EMPTY_RESUME = createEmptyResume();

function cloneDoc(doc: ResumeDocument): ResumeDocument {
  return JSON.parse(JSON.stringify(doc));
}

function reorder<T>(arr: T[], from: number, to: number): T[] {
  const result = [...arr];
  const [moved] = result.splice(from, 1);
  result.splice(to, 0, moved);
  return result;
}

/** Internal helper to record a new snapshot into history */
function recordHistory(
  state: EditorState,
  description: string,
  groupKey?: string
) {
  const now = Date.now();
  const isGrouped =
    groupKey &&
    state.lastGroupKey === groupKey &&
    now - state.lastGroupTime < GROUPING_WINDOW_MS &&
    state.historyIndex >= 0;

  // Drop redo branch if we made a new divergent edit
  if (state.historyIndex < state.history.length - 1) {
    state.history = state.history.slice(0, state.historyIndex + 1);
  }

  const snapshot = cloneDoc(state.draft);

  if (isGrouped && state.historyIndex >= 0) {
    // Update current snapshot in-place for continuous keystrokes
    state.history[state.historyIndex] = snapshot;
  } else {
    // Push a new discrete history step
    state.history.push(snapshot);
    if (state.history.length > MAX_HISTORY) {
      state.history.shift();
    }
    state.historyIndex = state.history.length - 1;
  }

  state.lastGroupKey = groupKey ?? null;
  state.lastGroupTime = now;
  state.lastActionDescription = description;
  state.canUndo = state.historyIndex > 0;
  state.canRedo = state.historyIndex < state.history.length - 1;
  state.isDirty = true;
  state.saveStatus = "idle";
}

export const useEditorStore = create<EditorStore>()(
  immer((set) => ({
    draft: EMPTY_RESUME,
    persisted: null,
    resumeId: null,
    resumeTitle: "Untitled Resume",
    saveStatus: "idle",
    saveError: null,
    isDirty: false,
    activeSection: "basics",
    locatorTarget: null,

    // History state
    history: [cloneDoc(EMPTY_RESUME)],
    historyIndex: 0,
    canUndo: false,
    canRedo: false,
    lastActionDescription: null,
    lastGroupKey: null,
    lastGroupTime: 0,

    initResume(resumeId, title, document) {
      set((state) => {
        state.resumeId = resumeId;
        state.resumeTitle = title;
        state.draft = document;
        state.persisted = document;
        state.isDirty = false;
        state.saveStatus = "idle";
        state.saveError = null;

        // Reset history ring specifically for this cartridge
        const initialSnap = cloneDoc(document);
        state.history = [initialSnap];
        state.historyIndex = 0;
        state.canUndo = false;
        state.canRedo = false;
        state.lastActionDescription = null;
        state.lastGroupKey = null;
        state.lastGroupTime = 0;
      });
    },

    startBlank() {
      set((state) => {
        const blank = createEmptyResume();
        state.resumeId = null;
        state.resumeTitle = "Untitled Resume";
        state.draft = blank;
        state.persisted = null;
        state.isDirty = false;
        state.saveStatus = "idle";
        state.saveError = null;

        state.history = [cloneDoc(blank)];
        state.historyIndex = 0;
        state.canUndo = false;
        state.canRedo = false;
        state.lastActionDescription = null;
        state.lastGroupKey = null;
        state.lastGroupTime = 0;
      });
    },

    undo() {
      set((state) => {
        if (state.historyIndex <= 0) return;
        state.historyIndex--;
        const previous = state.history[state.historyIndex];
        state.draft = cloneDoc(previous);
        state.canUndo = state.historyIndex > 0;
        state.canRedo = state.historyIndex < state.history.length - 1;
        state.isDirty = true;
        state.saveStatus = "idle";
        state.lastGroupKey = null;
        state.lastActionDescription = "Undo performed";
      });
    },

    redo() {
      set((state) => {
        if (state.historyIndex >= state.history.length - 1) return;
        state.historyIndex++;
        const next = state.history[state.historyIndex];
        state.draft = cloneDoc(next);
        state.canUndo = state.historyIndex > 0;
        state.canRedo = state.historyIndex < state.history.length - 1;
        state.isDirty = true;
        state.saveStatus = "idle";
        state.lastGroupKey = null;
        state.lastActionDescription = "Redo performed";
      });
    },

    updateBasics(patch) {
      set((state) => {
        Object.assign(state.draft.basics, patch);
        const fieldKey = Object.keys(patch)[0] || "basics";
        recordHistory(state, `Updated basics ${fieldKey}`, `basics.${fieldKey}`);
      });
    },

    updateSummary(summary) {
      set((state) => {
        state.draft.summary = summary;
        recordHistory(state, "Updated professional summary", "summary");
      });
    },

    addExperience() {
      set((state) => {
        state.draft.experience.push({
          id: generateId(),
          employer: "",
          role: "",
          bullets: [],
        });
        recordHistory(state, "Added experience role");
      });
    },

    updateExperience(id, patch) {
      set((state) => {
        const idx = state.draft.experience.findIndex((e) => e.id === id);
        if (idx >= 0) {
          Object.assign(state.draft.experience[idx], patch);
          const field = Object.keys(patch)[0] || "entry";
          recordHistory(state, `Updated experience ${field}`, `exp.${id}.${field}`);
        }
      });
    },

    removeExperience(id) {
      set((state) => {
        state.draft.experience = state.draft.experience.filter(
          (e) => e.id !== id
        );
        recordHistory(state, "Removed experience role");
      });
    },

    reorderExperience(from, to) {
      set((state) => {
        state.draft.experience = reorder(
          state.draft.experience,
          from,
          to
        ) as typeof state.draft.experience;
        recordHistory(state, "Reordered experience list");
      });
    },

    addEducation() {
      set((state) => {
        state.draft.education.push({
          id: generateId(),
          institution: "",
        });
        recordHistory(state, "Added education item");
      });
    },

    updateEducation(id, patch) {
      set((state) => {
        const idx = state.draft.education.findIndex((e) => e.id === id);
        if (idx >= 0) {
          Object.assign(state.draft.education[idx], patch);
          const field = Object.keys(patch)[0] || "entry";
          recordHistory(state, `Updated education ${field}`, `edu.${id}.${field}`);
        }
      });
    },

    removeEducation(id) {
      set((state) => {
        state.draft.education = state.draft.education.filter(
          (e) => e.id !== id
        );
        recordHistory(state, "Removed education item");
      });
    },

    reorderEducation(from, to) {
      set((state) => {
        state.draft.education = reorder(
          state.draft.education,
          from,
          to
        ) as typeof state.draft.education;
        recordHistory(state, "Reordered education list");
      });
    },

    addProject() {
      set((state) => {
        state.draft.projects.push({
          id: generateId(),
          name: "",
          technologies: [],
        });
        recordHistory(state, "Added project");
      });
    },

    updateProject(id, patch) {
      set((state) => {
        const idx = state.draft.projects.findIndex((p) => p.id === id);
        if (idx >= 0) {
          Object.assign(state.draft.projects[idx], patch);
          const field = Object.keys(patch)[0] || "entry";
          recordHistory(state, `Updated project ${field}`, `proj.${id}.${field}`);
        }
      });
    },

    removeProject(id) {
      set((state) => {
        state.draft.projects = state.draft.projects.filter(
          (p) => p.id !== id
        );
        recordHistory(state, "Removed project");
      });
    },

    reorderProject(from, to) {
      set((state) => {
        state.draft.projects = reorder(
          state.draft.projects,
          from,
          to
        ) as typeof state.draft.projects;
        recordHistory(state, "Reordered projects");
      });
    },

    addSkillGroup() {
      set((state) => {
        state.draft.skills.push({
          id: generateId(),
          category: "",
          items: [],
        });
        recordHistory(state, "Added skill group");
      });
    },

    updateSkillGroup(id, patch) {
      set((state) => {
        const idx = state.draft.skills.findIndex((s) => s.id === id);
        if (idx >= 0) {
          Object.assign(state.draft.skills[idx], patch);
          const field = Object.keys(patch)[0] || "entry";
          recordHistory(state, `Updated skill group ${field}`, `skill.${id}.${field}`);
        }
      });
    },

    removeSkillGroup(id) {
      set((state) => {
        state.draft.skills = state.draft.skills.filter((s) => s.id !== id);
        recordHistory(state, "Removed skill group");
      });
    },

    addInternship() {
      set((state) => {
        state.draft.internships.push({
          id: generateId(),
          employer: "",
          role: "",
          bullets: [],
        });
        recordHistory(state, "Added internship");
      });
    },

    updateInternship(id, patch) {
      set((state) => {
        const idx = state.draft.internships.findIndex((e) => e.id === id);
        if (idx >= 0) {
          Object.assign(state.draft.internships[idx], patch);
          const field = Object.keys(patch)[0] || "entry";
          recordHistory(state, `Updated internship ${field}`, `intern.${id}.${field}`);
        }
      });
    },

    removeInternship(id) {
      set((state) => {
        state.draft.internships = state.draft.internships.filter(
          (e) => e.id !== id
        );
        recordHistory(state, "Removed internship");
      });
    },

    addCertification(entry) {
      set((state) => {
        if (!state.draft.certifications) state.draft.certifications = [];
        state.draft.certifications.push({
          id: generateId(),
          name: "",
          ...entry,
        });
        recordHistory(state, "Added certification");
      });
    },

    updateCertification(id, patch) {
      set((state) => {
        if (!state.draft.certifications) return;
        const idx = state.draft.certifications.findIndex((c) => c.id === id);
        if (idx >= 0) {
          Object.assign(state.draft.certifications[idx], patch);
          const field = Object.keys(patch)[0] || "entry";
          recordHistory(state, `Updated certification ${field}`, `cert.${id}.${field}`);
        }
      });
    },

    removeCertification(id) {
      set((state) => {
        if (!state.draft.certifications) return;
        state.draft.certifications = state.draft.certifications.filter((c) => c.id !== id);
        recordHistory(state, "Removed certification");
      });
    },

    addAward(entry) {
      set((state) => {
        if (!state.draft.awards) state.draft.awards = [];
        state.draft.awards.push({
          id: generateId(),
          title: "",
          ...entry,
        });
        recordHistory(state, "Added award");
      });
    },

    updateAward(id, patch) {
      set((state) => {
        if (!state.draft.awards) return;
        const idx = state.draft.awards.findIndex((a) => a.id === id);
        if (idx >= 0) {
          Object.assign(state.draft.awards[idx], patch);
          const field = Object.keys(patch)[0] || "entry";
          recordHistory(state, `Updated award ${field}`, `award.${id}.${field}`);
        }
      });
    },

    removeAward(id) {
      set((state) => {
        if (!state.draft.awards) return;
        state.draft.awards = state.draft.awards.filter((a) => a.id !== id);
        recordHistory(state, "Removed award");
      });
    },

    addVolunteering(entry) {
      set((state) => {
        if (!state.draft.volunteering) state.draft.volunteering = [];
        state.draft.volunteering.push({
          id: generateId(),
          organization: "",
          bullets: [],
          ...entry,
        });
        recordHistory(state, "Added volunteering");
      });
    },

    updateVolunteering(id, patch) {
      set((state) => {
        if (!state.draft.volunteering) return;
        const idx = state.draft.volunteering.findIndex((v) => v.id === id);
        if (idx >= 0) {
          Object.assign(state.draft.volunteering[idx], patch);
          const field = Object.keys(patch)[0] || "entry";
          recordHistory(state, `Updated volunteering ${field}`, `vol.${id}.${field}`);
        }
      });
    },

    removeVolunteering(id) {
      set((state) => {
        if (!state.draft.volunteering) return;
        state.draft.volunteering = state.draft.volunteering.filter((v) => v.id !== id);
        recordHistory(state, "Removed volunteering");
      });
    },

    addPublication(entry) {
      set((state) => {
        if (!state.draft.publications) state.draft.publications = [];
        state.draft.publications.push({
          id: generateId(),
          title: "",
          ...entry,
        });
        recordHistory(state, "Added publication");
      });
    },

    updatePublication(id, patch) {
      set((state) => {
        if (!state.draft.publications) return;
        const idx = state.draft.publications.findIndex((p) => p.id === id);
        if (idx >= 0) {
          Object.assign(state.draft.publications[idx], patch);
          const field = Object.keys(patch)[0] || "entry";
          recordHistory(state, `Updated publication ${field}`, `pub.${id}.${field}`);
        }
      });
    },

    removePublication(id) {
      set((state) => {
        if (!state.draft.publications) return;
        state.draft.publications = state.draft.publications.filter((p) => p.id !== id);
        recordHistory(state, "Removed publication");
      });
    },

    addCustomSection(title = "Custom Section") {
      set((state) => {
        if (!state.draft.customSections) state.draft.customSections = [];
        state.draft.customSections.push({
          id: generateId(),
          title: title.slice(0, 80),
          items: [],
        });
        recordHistory(state, `Added custom section "${title}"`);
      });
    },

    updateCustomSection(id, patch) {
      set((state) => {
        if (!state.draft.customSections) return;
        const idx = state.draft.customSections.findIndex((s) => s.id === id);
        if (idx >= 0) {
          const sanitizedPatch = { ...patch };
          if (typeof sanitizedPatch.title === "string") {
            sanitizedPatch.title = sanitizedPatch.title.slice(0, 80);
          }
          Object.assign(state.draft.customSections[idx], sanitizedPatch);
          recordHistory(state, "Updated custom section title");
        }
      });
    },

    removeCustomSection(id) {
      set((state) => {
        if (!state.draft.customSections) return;
        state.draft.customSections = state.draft.customSections.filter((s) => s.id !== id);
        recordHistory(state, "Removed custom section");
      });
    },

    addCustomSectionItem(sectionId, item) {
      set((state) => {
        if (!state.draft.customSections) return;
        const sec = state.draft.customSections.find((s) => s.id === sectionId);
        if (sec) {
          sec.items.push({
            id: generateId(),
            title: "",
            ...item,
          });
          recordHistory(state, `Added item to "${sec.title}"`);
        }
      });
    },

    updateCustomSectionItem(sectionId, itemId, patch) {
      set((state) => {
        if (!state.draft.customSections) return;
        const sec = state.draft.customSections.find((s) => s.id === sectionId);
        if (sec) {
          const itemIdx = sec.items.findIndex((i) => i.id === itemId);
          if (itemIdx >= 0) {
            const sanitizedPatch = { ...patch };
            if (typeof sanitizedPatch.description === "string") {
              sanitizedPatch.description = sanitizedPatch.description.slice(0, 2000);
            }
            if (typeof sanitizedPatch.title === "string") {
              sanitizedPatch.title = sanitizedPatch.title.slice(0, 200);
            }
            Object.assign(sec.items[itemIdx], sanitizedPatch);
            const field = Object.keys(patch)[0] || "item";
            recordHistory(state, `Updated custom section item ${field}`, `customItem.${itemId}.${field}`);
          }
        }
      });
    },

    removeCustomSectionItem(sectionId, itemId) {
      set((state) => {
        if (!state.draft.customSections) return;
        const sec = state.draft.customSections.find((s) => s.id === sectionId);
        if (sec) {
          sec.items = sec.items.filter((i) => i.id !== itemId);
          recordHistory(state, `Removed item from "${sec.title}"`);
        }
      });
    },

    updateSettings(patch) {
      set((state) => {
        Object.assign(state.draft.settings, patch);
        recordHistory(state, "Updated document presentation settings");
      });
    },

    setActiveSection(section) {
      set((state) => {
        state.activeSection = section;
      });
    },

    setLocatorTarget(target) {
      set((state) => {
        state.locatorTarget = target;
      });
    },

    navigateToSection(section, term, source) {
      set((state) => {
        state.activeSection = section;
        state.locatorTarget = term
          ? {
              section,
              term,
              source,
              timestamp: Date.now(),
            }
          : null;
      });
    },

    setSaveStatus(status, error) {
      set((state) => {
        state.saveStatus = status;
        state.saveError = error ?? null;
      });
    },

    markSaved(persistedDoc) {
      set((state) => {
        state.persisted = persistedDoc;
        state.isDirty = false;
        state.saveStatus = "saved";
        state.saveError = null;
      });
    },

    replaceDraft(doc, description = "Applied external revision") {
      set((state) => {
        state.draft = doc;
        recordHistory(state, description);
      });
    },
  }))
);
