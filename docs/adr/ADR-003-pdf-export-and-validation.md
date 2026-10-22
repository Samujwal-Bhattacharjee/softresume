# ADR-003: PDF Generation Pipeline, Binary Validation, and Visual Regression Strategy

- **Status:** Accepted
- **Date:** 2026-10-21
- **Deciders:** Full-Stack & Systems Architecture Team
- **Consulted:** Sprint 04 Backlog (RS-110, RS-111, RS-112, RS-113)

---

## 1. Context and Problem Statement

SoftCV Studio produces recruiter-grade, ATS-parseable resumes. In prior sprints, PDF output relied solely on browser `window.print()` styles. While lightweight, browser printing presents significant limitations for a production application:
1. **User Experience Friction:** Requires users to manually select "Save as PDF", configure margins to "None", and toggle "Background graphics". Different browsers (Chrome vs Safari vs Firefox vs Edge) apply disparate default margins and print heuristics.
2. **Untestable Binaries:** Browser print cannot be exercised deterministically in automated CI pipelines without interactive OS print dialog mocks.
3. **Download File Automation:** Browser print cannot directly generate or stream a `.pdf` file with a sanitized, customized filename.
4. **Validation Void:** Without generated PDF byte buffers, automated tests cannot verify selectable text extraction, character encoding, or reading order.

We must select and implement a reliable, reproducible PDF generation pipeline that preserves selectable text, semantic reading order, exact page dimensions (A4 and US Letter), and allows rigorous automated binary validation.

---

## 2. Alternatives Considered

### Option A: Pure Client-Side `window.print()` (Existing Baseline)
- **Pros:** Zero bundle size overhead, zero server runtime requirements, works offline.
- **Cons:** Dependent on user print dialog settings; cannot trigger automated download; cannot test actual generated PDF bytes in CI; non-standardized font rasterization across OSs.

### Option B: Client-Side Screenshot to PDF (`html2canvas` / `dom-to-image` + `jspdf`)
- **Pros:** Generates direct `.pdf` download in the browser.
- **Cons:** **Unacceptable for ATS resumes.** Rasterizes text into flat bitmap images. Text is unselectable, links are inactive, ATS parsers read zero text, and file sizes are bloated.

### Option C: Client-Side `@react-pdf/renderer`
- **Pros:** Native PDF generation directly from React components in the browser or Node.
- **Cons:** Requires a parallel component library (`<Document>`, `<Page>`, `<View>`, `<Text>`) that cannot reuse standard HTML/CSS. Would force duplicate implementations of all 5 launch templates, doubling maintenance cost and creating subtle visual parity discrepancies between editor preview and export.

### Option D: Headless Chromium via Playwright + React Server Markup (`react-dom/server.edge`) + `@page` CSS (Selected)
- **Pros:**
  - Single source of truth: Reuses existing semantic HTML/CSS `TemplateRenderer` components directly with `isPrint: true`.
  - True vector PDF: 100% selectable text, searchable, screen-reader accessible, preserved hyperlinks, and minimal file size (typically 15–40 KB).
  - Exact standard dimensions: Full control over `@page { size: A4 / letter; margin: 0; }` with CSS print color adjustment (`exact`).
  - Automated binary validation: Generates real byte buffers testable with `pdf-parse` in automated CI test suites.
  - Deterministic downloads: Streams direct attachment files with sanitized filenames (`Alex_Chen_Resume.pdf`).
- **Cons:** Requires Chromium browser binary installed in the execution environment (addressed via `npx playwright install chromium`).

---

## 3. Decision

We adopt a **Hybrid Production Architecture**:
1. **Primary Route:** Headless Chromium rendering via Playwright in a dedicated API route (`POST /api/export/pdf`).
   - Accepts canonical `ResumeDocument` and optional `PresentationSettings`.
   - Renders static markup using `react-dom/server.edge` with Tailwind/CSS print tokens.
   - Generates vector PDF buffer adhering strictly to `A4` (210×297mm) or `US_LETTER` (8.5×11″).
   - Sanitizes attachment filename using the unified filename sanitizer (`RS-115`).
2. **Instant Fallback Route:** Browser `window.print()` remains available as a zero-latency fallback button for offline or restricted environments.
3. **Automated Binary Validation (RS-112):** Comprehensive test suite (`tests/export-pdf-text.test.ts`) using `pdf-parse` (`PDFParse` class) inspecting real generated PDF bytes across all 5 launch templates:
   - Candidate names, email, phone, location, links.
   - Section headings and semantic reading order.
   - Multi-page pagination and second-page content survival.
   - Unicode, diacritics, and international punctuation.
   - Clean omission of empty optional sections without orphaned headings.
4. **Visual Layout Regression (RS-113):** Headless page rendering tests (`tests/export-pdf-visual.test.ts`) that verify absence of horizontal overflow (`scrollWidth <= clientWidth`), non-overlapping section bounding boxes, and save reviewable baseline snapshot artifacts in `tests/artifacts/pdf-visual/`.

---

## 4. Consequences and Trade-offs

- **Positive:**
  - Guaranteed 100% vector selectable text for recruiter and ATS parsing compatibility.
  - Zero divergence between editor preview markup and exported PDF layout.
  - Fully automated CI test gate verifying actual generated PDF binaries.
  - Resilient user experience with both direct vector download and browser print fallback.
- **Negative / Operational Requirements:**
  - Deployment environment must support Chromium execution (e.g., standard Docker, AWS ECS/Lambda with Playwright layer, or server runtime).
  - Memory footprint: Chromium instances must be bounded and cleanly terminated via `try / finally` blocks to prevent zombie processes.
  - Peak load concurrency should reuse browser contexts or rate-limit exports.

---

## 5. Revisit Triggers

- If serverless execution environments impose strict size budgets that preclude Chromium binaries, evaluate lightweight WebAssembly headless engines or hybrid client WebAssembly PDF compilers.
- If employer ATS parsing requirements change regarding embedded fonts or specific PDF/A archival compliance standards.
