import { describe, it, expect, beforeEach } from "vitest";
import { localAdapter } from "@/lib/resume/local-adapter";
import { FRESHER_FIXTURE } from "@/lib/fixtures/resume-fixtures";

describe("Local Storage Adapter (RS-070)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("saves, loads, and lists resumes", () => {
    const id = "res-test-01";
    const title = "Priya - Tech Resume";
    localAdapter.saveResume(id, title, FRESHER_FIXTURE);

    const loaded = localAdapter.loadResume(id);
    expect(loaded).not.toBeNull();
    expect(loaded?.meta.title).toBe(title);
    expect(loaded?.document.basics.name).toBe("Priya Mehta");

    const list = localAdapter.listResumes();
    expect(list.length).toBe(1);
    expect(list[0].id).toBe(id);
    expect(list[0].title).toBe(title);
  });

  it("deletes a resume", () => {
    const id = "res-test-02";
    localAdapter.saveResume(id, "To Delete", FRESHER_FIXTURE);
    expect(localAdapter.loadResume(id)).not.toBeNull();

    localAdapter.deleteResume(id);
    expect(localAdapter.loadResume(id)).toBeNull();
    expect(localAdapter.listResumes().length).toBe(0);
  });

  it("handles non-existent resumes gracefully", () => {
    const loaded = localAdapter.loadResume("non-existent-id");
    expect(loaded).toBeNull();
  });
});
