import { describe, it, expect, beforeEach } from "vitest";
import { useEditorStore } from "@/lib/resume/editor-store";
import { createEmptyResume } from "@/lib/schemas/resume";

describe("Bounded Undo/Redo & State Recovery (RS-072)", () => {
  beforeEach(() => {
    const freshDoc = createEmptyResume();
    freshDoc.basics.name = "Original Candidate";
    freshDoc.summary = "Initial summary statement.";
    useEditorStore.getState().initResume("res-history-1", "History Test", freshDoc);
  });

  it("1. undoes and redoes a simple text edit", () => {
    const store = useEditorStore.getState();
    expect(store.canUndo).toBe(false);
    expect(store.canRedo).toBe(false);

    // Update summary
    store.updateSummary("First revised summary.");
    expect(useEditorStore.getState().draft.summary).toBe("First revised summary.");
    expect(useEditorStore.getState().canUndo).toBe(true);
    expect(useEditorStore.getState().canRedo).toBe(false);

    // Undo
    useEditorStore.getState().undo();
    expect(useEditorStore.getState().draft.summary).toBe("Initial summary statement.");
    expect(useEditorStore.getState().canUndo).toBe(false);
    expect(useEditorStore.getState().canRedo).toBe(true);

    // Redo
    useEditorStore.getState().redo();
    expect(useEditorStore.getState().draft.summary).toBe("First revised summary.");
    expect(useEditorStore.getState().canUndo).toBe(true);
    expect(useEditorStore.getState().canRedo).toBe(false);
  });

  it("2. undoes item addition and removal, preserving stable IDs upon undo", () => {
    const store = useEditorStore.getState();
    expect(store.draft.experience).toHaveLength(0);

    // Add experience entry
    store.addExperience();
    const expItem = useEditorStore.getState().draft.experience[0];
    expect(expItem).toBeDefined();
    const stableId = expItem.id;

    // Mutate the entry
    store.updateExperience(stableId, { employer: "Acme Corp", role: "Software Engineer" });
    expect(useEditorStore.getState().draft.experience[0].employer).toBe("Acme Corp");

    // Remove the entry
    store.removeExperience(stableId);
    expect(useEditorStore.getState().draft.experience).toHaveLength(0);

    // Undo removal -> restores the entry with exact same stableId!
    useEditorStore.getState().undo();
    const restored = useEditorStore.getState().draft.experience;
    expect(restored).toHaveLength(1);
    expect(restored[0].id).toBe(stableId);
    expect(restored[0].employer).toBe("Acme Corp");
    expect(restored[0].role).toBe("Software Engineer");
  });

  it("3. undoes and redoes item reordering", () => {
    const store = useEditorStore.getState();
    store.addExperience();
    store.addExperience();
    const idA = useEditorStore.getState().draft.experience[0].id;
    const idB = useEditorStore.getState().draft.experience[1].id;

    store.updateExperience(idA, { employer: "First Employer" });
    store.updateExperience(idB, { employer: "Second Employer" });

    // Reorder experience list
    store.reorderExperience(0, 1);
    expect(useEditorStore.getState().draft.experience[0].id).toBe(idB);
    expect(useEditorStore.getState().draft.experience[1].id).toBe(idA);

    // Undo reorder
    useEditorStore.getState().undo();
    expect(useEditorStore.getState().draft.experience[0].id).toBe(idA);
    expect(useEditorStore.getState().draft.experience[1].id).toBe(idB);

    // Redo reorder
    useEditorStore.getState().redo();
    expect(useEditorStore.getState().draft.experience[0].id).toBe(idB);
    expect(useEditorStore.getState().draft.experience[1].id).toBe(idA);
  });

  it("4. undoes and redoes AI suggestion acceptance via replaceDraft", () => {
    const store = useEditorStore.getState();
    const originalDoc = JSON.parse(JSON.stringify(store.draft));

    // Simulate AI suggestion accepted
    const revisedDoc = JSON.parse(JSON.stringify(originalDoc));
    revisedDoc.summary = "AI polished executive summary with strong metrics.";
    revisedDoc.basics.headline = "Lead Systems Architect";

    store.replaceDraft(revisedDoc, "Accepted AI suggestion");
    expect(useEditorStore.getState().draft.summary).toBe(
      "AI polished executive summary with strong metrics."
    );
    expect(useEditorStore.getState().canUndo).toBe(true);

    // Candidate clicks Undo to revert AI changes
    useEditorStore.getState().undo();
    expect(useEditorStore.getState().draft.summary).toBe("Initial summary statement.");
    expect(useEditorStore.getState().draft.basics.headline).toBe("");

    // Candidate clicks Redo to re-apply AI changes
    useEditorStore.getState().redo();
    expect(useEditorStore.getState().draft.summary).toBe(
      "AI polished executive summary with strong metrics."
    );
  });

  it("5. divergent edit after undo truncates redo branch", () => {
    const store = useEditorStore.getState();
    store.updateBasics({ name: "Version 2" });
    // Use a different field or structural action to create discrete snapshots
    store.updateSummary("Summary Version 3");

    // Undo back to before Summary Version 3
    useEditorStore.getState().undo();
    expect(useEditorStore.getState().draft.summary).toBe("Initial summary statement.");
    expect(useEditorStore.getState().canRedo).toBe(true);

    // Make a new divergent edit
    useEditorStore.getState().updateBasics({ email: "divergent@example.com" });
    expect(useEditorStore.getState().draft.basics.email).toBe("divergent@example.com");
    // Redo branch must be cleared
    expect(useEditorStore.getState().canRedo).toBe(false);
  });

  it("6. groups rapid consecutive keystrokes to the same field within grouping window", () => {
    const store = useEditorStore.getState();
    const initialIndex = store.historyIndex;

    // Simulate typing "Hello" quickly
    store.updateSummary("H");
    const indexAfterFirst = useEditorStore.getState().historyIndex;
    expect(indexAfterFirst).toBe(initialIndex + 1);

    store.updateSummary("He");
    store.updateSummary("Hel");
    store.updateSummary("Hell");
    store.updateSummary("Hello");

    // All consecutive keystrokes to the same field within the 600ms window are grouped!
    expect(useEditorStore.getState().historyIndex).toBe(indexAfterFirst);
    expect(useEditorStore.getState().draft.summary).toBe("Hello");

    // A single Undo reverts back to the state before the typing burst began
    useEditorStore.getState().undo();
    expect(useEditorStore.getState().draft.summary).toBe("Initial summary statement.");
  });

  it("7. caps history size at 30 entries and drops oldest snapshot safely", () => {
    const store = useEditorStore.getState();

    // Push 35 distinct non-grouped edits
    for (let i = 1; i <= 35; i++) {
      store.addExperience();
    }

    const currentState = useEditorStore.getState();
    expect(currentState.history.length).toBeLessThanOrEqual(30);
    expect(currentState.historyIndex).toBe(currentState.history.length - 1);
    expect(currentState.canUndo).toBe(true);
  });

  it("8. resets history when switching resume cartridges (no cross-resume leaks)", () => {
    const store = useEditorStore.getState();
    store.updateSummary("Resume 1 changes");
    expect(useEditorStore.getState().canUndo).toBe(true);

    // Switch to another resume
    const newDoc = createEmptyResume();
    newDoc.basics.name = "Other User Resume";
    store.initResume("res-other-2", "Other Resume", newDoc);

    const updated = useEditorStore.getState();
    expect(updated.resumeId).toBe("res-other-2");
    expect(updated.draft.basics.name).toBe("Other User Resume");
    expect(updated.canUndo).toBe(false);
    expect(updated.canRedo).toBe(false);
    expect(updated.history).toHaveLength(1);
  });
});
