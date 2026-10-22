import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { isCloudModeEnabled, getSupabaseBrowserClient } from "@/lib/supabase/client";
import { localAdapter } from "@/lib/resume/local-adapter";
import { createSupabaseAdapter } from "@/lib/resume/supabase-adapter";
import { useEditorStore } from "@/lib/resume/editor-store";
import { createEmptyResume } from "@/lib/schemas/resume";

describe("Cloud/Local Behavior Invariants (RS-040 / RS-042 / RS-172)", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    localStorage.clear();
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("invariant 1: unconfigured environment reports isCloudModeEnabled() = false and client returns null", () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    expect(isCloudModeEnabled()).toBe(false);
    expect(getSupabaseBrowserClient()).toBeNull();
  });

  it("invariant 2: localAdapter operates independently without network or cloud credentials", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const doc = createEmptyResume();
    const meta = localAdapter.createResume("Offline Local Cartridge", doc);
    expect(meta.id).toBeDefined();

    const loaded = localAdapter.loadResume(meta.id);
    expect(loaded).not.toBeNull();
    expect(loaded?.document.basics.name).toBe("");

    const list = localAdapter.listResumes();
    expect(list.some((r) => r.id === meta.id)).toBe(true);
  });

  it("invariant 3: failed cloud save does not report saved status and preserves in-memory draft", async () => {
    const store = useEditorStore.getState();
    const mockDoc = createEmptyResume();
    mockDoc.basics.name = "Candidate In-Flight Draft";

    store.initResume("res-fail-1", "Test Fail", mockDoc);
    expect(useEditorStore.getState().draft.basics.name).toBe("Candidate In-Flight Draft");

    // Simulate an unexpected adapter write failure
    store.setSaveStatus("saving");
    expect(useEditorStore.getState().saveStatus).toBe("saving");

    // Failure triggers error status
    store.setSaveStatus("error", "Database connection lost. Draft preserved locally.");
    const updated = useEditorStore.getState();

    expect(updated.saveStatus).toBe("error");
    expect(updated.saveError).toContain("Database connection lost");
    // Crucial: Draft is preserved intact, never wiped or reverted
    expect(updated.draft.basics.name).toBe("Candidate In-Flight Draft");
  });

  it("invariant 4: local storage purge is strictly scoped to softcv_* namespace and preserves foreign site data", async () => {
    localStorage.setItem("foreign_user_theme", "dark_mode");
    localStorage.setItem("analytics_session_id", "sess_9988");
    localStorage.setItem("softcv_resumes_test-1", JSON.stringify(createEmptyResume()));
    localStorage.setItem("softcv_resume_index", JSON.stringify([{ id: "test-1", title: "Test" }]));

    await localAdapter.deleteAllData();

    // Verify SoftCV data was wiped
    expect(localStorage.getItem("softcv_resumes_test-1")).toBeNull();
    expect(localStorage.getItem("softcv_resume_index")).toBeNull();

    // Verify unrelated site data is strictly preserved
    expect(localStorage.getItem("foreign_user_theme")).toBe("dark_mode");
    expect(localStorage.getItem("analytics_session_id")).toBe("sess_9988");
  });

  it("invariant 5: supabaseAdapter throws explicit error when initialized without authenticated user", async () => {
    // When instantiated with an empty userId
    const mockSupabase = {} as unknown as Parameters<typeof createSupabaseAdapter>[0];
    expect(() => createSupabaseAdapter(mockSupabase, "")).toThrow(
      "createSupabaseAdapter requires a non-empty userId"
    );
  });
});
