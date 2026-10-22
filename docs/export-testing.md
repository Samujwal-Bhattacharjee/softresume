# Export Testing and Validation Procedure

This document provides the reproducible local and CI procedures for verifying SoftCV Studio's PDF and DOCX export generation, binary text extraction, structural XML integrity, and visual layout regression.

---

## 1. Test Architecture Overview

Export testing is split into focused suites operating exclusively on synthetic fixtures containing zero personally identifiable information (PII):

| Test Suite | File Path | Focus | Target Tickets |
| :--- | :--- | :--- | :--- |
| **Multi-Template Export Regression Matrix** | [`tests/export-regression-matrix.test.ts`](../tests/export-regression-matrix.test.ts) | Parametrized end-to-end matrix covering all 5 launch templates across 6 content profiles, A4/US Letter dimensions, binary PDF text extraction, OpenXML DOCX inspection, and PDF/DOCX semantic equivalence. | RS-173 |
| **PDF Binary Text Extraction** | [`tests/export-pdf-text.test.ts`](../tests/export-pdf-text.test.ts) | Inspects actual generated PDF byte buffers using `pdf-parse` for contact info, section order, pagination, and Unicode preservation. | RS-111, RS-112 |
| **PDF Layout & Visual Regression** | [`tests/export-pdf-visual.test.ts`](../tests/export-pdf-visual.test.ts) | Playwright headless page evaluation asserting zero horizontal overflow, descending non-overlapping bounding boxes, and saving reviewable baseline PNG snapshots. | RS-113 |
| **DOCX Structural & XML Order** | [`tests/export-docx-structure.test.ts`](../tests/export-docx-structure.test.ts) | Unpacks `.docx` ZIP archives via `JSZip` to validate `word/document.xml`, native `<w:numPr>` bullets, linear order, and page dimensions. | RS-120, RS-122 |
| **Filename Security & Sanitizer** | [`tests/export-filename.test.ts`](../tests/export-filename.test.ts) | Exercises malicious path traversal, control chars, Windows device names, Latin transliteration, and length boundaries. | RS-115 |

---

## 2. Environment Prerequisites

Export generation and visual verification rely on headless Chromium:

```bash
# Install Chromium browser binary for Playwright
npx playwright install chromium
```

---

## 3. Execution Commands

### Run Full Test Suite
```bash
npm test
```

### Run Multi-Template Regression Matrix (RS-173)
Executes the parametrized matrix verifying all 5 templates across PDF and DOCX formats:
```bash
npx vitest run tests/export-regression-matrix.test.ts
```

### Run PDF Binary Text Extraction Suite (RS-111 / RS-112)
Validates real generated PDF bytes across all 5 launch templates (Classic ATS, Fresher/Graduate, Modern Editorial, Technical, Experienced):
```bash
npx vitest run tests/export-pdf-text.test.ts
```

### Run PDF Visual & Layout Regression Suite (RS-113)
Renders page snapshots and validates paper geometry (A4 and US Letter):
```bash
npx vitest run tests/export-pdf-visual.test.ts
```
*Generated review artifacts are written to:* `tests/artifacts/pdf-visual/`
- `classic-ats-sparse.png`
- `fresher-graduate.png`
- `technical-dense.png`
- `experienced-multipage.png`
- `modern-editorial-unicode.png`

### Run DOCX XML Structural Suite (RS-120 / RS-122)
Validates OpenXML document parts, native bullets, heading tags, and page size twips (`11906` for A4, `12240` for US Letter):
```bash
npx vitest run tests/export-docx-structure.test.ts
```

### Run Filename Sanitization Suite (RS-115)
```bash
npx vitest run tests/export-filename.test.ts
```

---

## 4. Test Matrix Specification

The regression suite tests combinations of the following templates, content profiles, and paper geometries:

### Supported Templates (5 Implemented Launch Templates)
1. **Classic ATS (`classic-ats`)**: Single-column conservative layout designed for optimal parser predictability.
2. **Fresher / Graduate (`fresher-graduate`)**: Education and coursework prioritized above work history.
3. **Modern Editorial (`modern-editorial`)**: Typographic hierarchy, serif accents, and editorial flow.
4. **Technical / Project-First (`technical`)**: Compact technology tags, GitHub/repository link formatting, and dense bullet formatting.
5. **Experienced Professional (`experienced`)**: Two-column executive layout with career progression.
*Note: Creative / Portfolio (`creative`) remains deferred for post-launch releases.*

### Content Profiles (Synthetic Fixtures)
- `SPARSE_SHORT_FIXTURE`: 1-page compact profile with optional sections omitted; verifies absence of orphan headings or accidental blank 2nd pages.
- `FRESHER_STUDENT_FIXTURE`: Education-first layout with internships, coursework, and campus leadership.
- `TECHNICAL_HEAVY_FIXTURE`: High density, long repository URLs, code tags, and multi-category technology tags.
- `MULTIPAGE_EXPERIENCED_FIXTURE`: Executive 15-year background spanning multiple pages with page break assertions.
- `MODERN_EDITORIAL_UNICODE_FIXTURE`: Non-ASCII candidate name (`Renée Müller-Château`), French/German diacritics, and typographic punctuation.
- `LONG_URL_OVERFLOW_FIXTURE`: Extreme URL lengths (>120 chars) and lengthy single bullets (>350 chars) verifying text wrapping without horizontal overflow.

### Paper Geometries
- **A4**: 210mm x 297mm (`794px` x `1123px` at 96 DPI / `11906` x `16838` dxa in DOCX).
- **US Letter**: 8.5in x 11in (`816px` x `1056px` at 96 DPI / `12240` x `15840` dxa in DOCX).

---

## 5. Actual Binary Verification vs. Mock Verification

SoftCV Studio strictly avoids synthetic mock assertions for file exports:
- **PDF**: Verified by compiling the React template tree to static HTML, running Puppeteer/Chromium server-side (or Playwright in test harness) to output a true binary PDF Buffer, and parsing the raw byte stream using `pdf-parse`. Magic bytes (`%PDF-1.`) and extracted strings are verified.
- **DOCX**: Verified by compiling canonical JSON into an OpenXML `.docx` byte blob using `docx`, decompressing the ZIP container with `JSZip`, and asserting XML tags (`<w:document>`, `<w:p>`, `<w:numPr>`, `<w:hyperlink>`, `<w:pgSz>`).
- **DOM / CSS**: Playwright measures real computed `scrollWidth` and `clientWidth` in a headless browser viewport to guarantee no horizontal clipping.

---

## 6. Known Limitations & Operating Notes

1. **Chromium Deployment Dependency**:
   - Server-side PDF export requires Chromium installed on the server environment. If deployed to a serverless platform without Chromium binaries, client fallback triggers `window.print()` with `@media print` stylesheets.
2. **Browser Print Fallback Differences**:
   - `window.print()` relies on the user's browser rendering engine and local printer driver. Margins, headers, and footers may differ slightly from server-rendered PDF buffers.
3. **DOCX Two-Column Layout**:
   - Word processors display two-column layouts differently than CSS grid. SoftCV exports linear tables and section blocks to maximize cross-platform fidelity across Microsoft Word, Google Docs, and LibreOffice.

---

## 7. Baseline Review & Approval Procedure

When visual snapshots in `tests/artifacts/pdf-visual/` change:
1. Open the changed PNG in a diff tool or image viewer.
2. Confirm the visual change is intentional (e.g. typography or padding update) and introduces no horizontal text clipping or overlapping sections.
3. Commit the updated test and documentation together. Never overwrite baselines blindly to silence a test failure.

---

## 8. Release Gate Criteria

A release is **BLOCKED** if any of the following occur:
- Any test in `tests/export-regression-matrix.test.ts` fails.
- PDF generation produces a blank page or fewer than expected pages for multi-page fixtures.
- An optional section produces an empty heading when the user provided no data.
- DOCX package cannot be decompressed by standard OpenXML parsers.
- Any horizontal overflow occurs (`scrollWidth > clientWidth + 2px`).
- Candidate personal details, Unicode names, or URLs are truncated.
