import { describe, it, expect, beforeEach } from "vitest";
import { useEditorStore } from "@/lib/resume/editor-store";
import { FRESHER_FIXTURE } from "@/lib/fixtures/resume-fixtures";

describe("Editor Store (RS-032 / RS-071)", () => {
  beforeEach(() => {
    useEditorStore.getState().startBlank();
  });

  it("initializes draft from a loaded resume", () => {
    useEditorStore.getState().initResume("res-123", "Priya Resume", FRESHER_FIXTURE);

    const state = useEditorStore.getState();
    expect(state.resumeId).toBe("res-123");
    expect(state.resumeTitle).toBe("Priya Resume");
    expect(state.draft.basics.name).toBe("Priya Mehta");
    expect(state.isDirty).toBe(false);
    expect(state.saveStatus).toBe("idle");
  });

  it("marks state as dirty upon editing basics", () => {
    useEditorStore.getState().initResume("res-123", "Priya Resume", FRESHER_FIXTURE);
    useEditorStore.getState().updateBasics({ name: "Priya Sharma" });

    const state = useEditorStore.getState();
    expect(state.draft.basics.name).toBe("Priya Sharma");
    expect(state.isDirty).toBe(true);
  });

  it("reorders experience correctly", () => {
    useEditorStore.getState().addExperience();
    useEditorStore.getState().addExperience();

    const expBefore = useEditorStore.getState().draft.experience;
    expect(expBefore.length).toBe(2);

    const firstId = expBefore[0].id;
    const secondId = expBefore[1].id;

    useEditorStore.getState().reorderExperience(0, 1);

    const expAfter = useEditorStore.getState().draft.experience;
    expect(expAfter[0].id).toBe(secondId);
    expect(expAfter[1].id).toBe(firstId);
  });

  it("manages save status accurately (RS-071)", () => {
    useEditorStore.getState().setSaveStatus("saving");
    expect(useEditorStore.getState().saveStatus).toBe("saving");

    useEditorStore.getState().markSaved(useEditorStore.getState().draft);
    expect(useEditorStore.getState().saveStatus).toBe("saved");
    expect(useEditorStore.getState().isDirty).toBe(false);
  });
});
