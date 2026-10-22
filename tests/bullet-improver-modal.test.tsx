import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { BulletImproverModal } from "@/components/resume-editor/bullet-improver-modal";

describe("Bullet Improver Modal Component (RS-082)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders original bullet and shows unconfigured honest state when API returns 503", async () => {
    // Mock fetch returning NOT_CONFIGURED
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({
        ok: false,
        code: "NOT_CONFIGURED",
        error: "AI provider API key is not configured. Add AI_API_KEY to your server environment or .env.local to enable AI features.",
      }),
    });

    render(
      <BulletImproverModal
        isOpen={true}
        onClose={vi.fn()}
        originalBullet="Wrote backend unit tests using Jest."
        onApply={vi.fn()}
      />
    );

    expect(screen.getByText("Original Bullet Text")).toBeInTheDocument();
    expect(screen.getByText(/Wrote backend unit tests using Jest/)).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByText(/AI Assistant is in Demo \/ Local Mode/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/SoftCV Studio never fabricates placeholder text as real AI output/i)
      ).toBeInTheDocument();
    });
  });

  it("displays proposed bullet, explanation, and missing-metrics questions on success", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        ok: true,
        data: {
          proposed: "Engineered automated test suites using Jest, raising service code coverage.",
          explanation: "Replaced passive phrasing with active verbs and highlighted test scope.",
          followUpQuestions: ["What was the final code coverage percentage achieved?"],
          assumptions: [],
          preservedFacts: ["Jest", "unit tests"],
        },
      }),
    });

    const onApply = vi.fn();
    const onClose = vi.fn();

    render(
      <BulletImproverModal
        isOpen={true}
        onClose={onClose}
        originalBullet="Wrote backend unit tests using Jest."
        onApply={onApply}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Suggested Refinement (Editable)")).toBeInTheDocument();
      expect(
        screen.getByDisplayValue(
          "Engineered automated test suites using Jest, raising service code coverage."
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText(/What was the final code coverage percentage achieved\?/)
      ).toBeInTheDocument();
    });

    // Accept & Apply
    const applyBtn = screen.getByRole("button", { name: /Accept & Apply Bullet/i });
    fireEvent.click(applyBtn);

    expect(onApply).toHaveBeenCalledWith(
      "Engineered automated test suites using Jest, raising service code coverage."
    );
    expect(onClose).toHaveBeenCalled();
  });

  it("allows user to edit proposed text before applying", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        ok: true,
        data: {
          proposed: "Architected microservices with Go.",
          explanation: "Active voice.",
          followUpQuestions: [],
          assumptions: [],
          preservedFacts: ["Go"],
        },
      }),
    });

    const onApply = vi.fn();

    render(
      <BulletImproverModal
        isOpen={true}
        onClose={vi.fn()}
        originalBullet="Used Go for microservices."
        onApply={onApply}
      />
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue("Architected microservices with Go.")).toBeInTheDocument();
    });

    const textarea = screen.getByDisplayValue("Architected microservices with Go.");
    fireEvent.change(textarea, {
      target: { value: "Architected 5 microservices with Go and gRPC." },
    });

    const applyBtn = screen.getByRole("button", { name: /Accept & Apply Bullet/i });
    fireEvent.click(applyBtn);

    expect(onApply).toHaveBeenCalledWith("Architected 5 microservices with Go and gRPC.");
  });

  it("rejecting or closing leaves original content unchanged", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        ok: true,
        data: {
          proposed: "Maintained mission-critical legacy system.",
          explanation: "Clearer tone.",
          followUpQuestions: [],
          assumptions: [],
          preservedFacts: [],
        },
      }),
    });

    const onApply = vi.fn();
    const onClose = vi.fn();

    render(
      <BulletImproverModal
        isOpen={true}
        onClose={onClose}
        originalBullet="Maintained legacy app."
        onApply={onApply}
      />
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue("Maintained mission-critical legacy system.")).toBeInTheDocument();
    });

    const rejectBtn = screen.getByRole("button", { name: /Reject & Keep Original/i });
    fireEvent.click(rejectBtn);

    expect(onClose).toHaveBeenCalled();
    expect(onApply).not.toHaveBeenCalled();
  });
});
