# Resume Studio — Product & Engineering Plan

> **Working name:** SoftCV Studio (placeholder; perform a name/trademark/domain check before committing to branding)  
> **Document status:** Draft implementation plan  
> **Product type:** Full-stack, AI-assisted resume builder and job-application preparation workspace  
> **Primary markets:** Students, new graduates, early-career applicants, experienced professionals, and career switchers  
> **Design direction:** Soft-club / Y2K-inspired product interface with restrained, recruiter-friendly downloadable documents

---

## 1. Executive summary

Build a polished resume studio that lets a user create a master resume, adapt it to specific job opportunities, receive explainable AI writing assistance, check document readability and likely parsing risks, and export a real, editable document in the requested format.

The product should not be just a form that inserts text into a template. Its value comes from joining:

1. **Professional document creation** — structured content, a good editor, real-time preview, accessible templates, and reliable PDF/DOCX output.
2. **Truth-preserving AI assistance** — improve wording, surface missing evidence, compare a resume with a job description, and explain each suggestion without inventing accomplishments.
3. **Transparent readiness checks** — identify concrete formatting, completeness, consistency, and job-relevance issues rather than promising an unknowable universal “ATS score.”
4. **Role-aware guidance** — provide suitable section order, examples, prompts, and coaching for students, software engineers, data/AI roles, cloud/DevOps, product, design, finance, sales, research, and other career paths.
5. **Distinctive product design** — a soft-club/Y2K-inspired web interface, while keeping the default exported resume visually restrained and easy to parse.
6. **Portable data and reliable exports** — one versioned structured resume model powers the editor, previews, checks, AI context, PDF, DOCX, TXT, and JSON export.

### Product promise

**Create once. Improve with AI. Tailor to each job. Download without friction.**

### Core design principle

The application interface may be expressive; the default resume output should prioritize readability, clarity, and compatibility. The product must explain the limitations of its checks: no independent builder can guarantee that every employer's ATS will parse or rank a resume in a particular way.

---

## 2. Vision, goals, and non-goals

### 2.1 Vision

Give applicants a clear, low-friction way to communicate their real experience and produce targeted, high-quality application documents without needing design skills or resume-writing expertise.

### 2.2 Product goals

- Make the first usable resume possible for a novice without requiring prior resume knowledge.
- Make changes easy to review, undo, accept, or reject.
- Make resume content independent of any one visual template.
- Deliver predictable, searchable/selectable text in generated PDF files and editable Word documents.
- Help users tailor content to a real job description using evidence they can stand behind.
- Support students and freshers whose strongest experience may be projects, coursework, clubs, and internships.
- Support experienced professionals whose strongest evidence may be scope, leadership, impact, and measurable outcomes.
- Provide clear explanations for ATS-readiness and keyword-match findings.
- Protect personal data and allow users to export and delete it.
- Demonstrate strong engineering quality through tests, accessibility, documentation, privacy controls, and maintainable architecture.

### 2.3 Success criteria

The initial release is successful when a user can:

1. Sign in or use an explicitly supported guest/demo flow.
2. Start from a blank resume or a supported import format.
3. Enter and reorder sections, including custom sections.
4. See the preview update as content changes.
5. Save their work and create a job-specific copy without changing the master resume.
6. Use AI suggestions without losing the original text.
7. run transparent content, parsing-readiness, and job-match checks.
8. Download a correctly formatted PDF and DOCX.
9. Reopen the app and recover the resume.
10. Export and delete their data.

### 2.4 Non-goals for MVP

- Guaranteeing interview outcomes, ATS passage, or employment.
- Claiming to replicate the proprietary scoring logic of an employer's ATS.
- Automatically applying to jobs or submitting applications on a user's behalf.
- Scraping job boards in ways that violate their terms.
- Building a full social network or public candidate directory.
- Training a foundation model.
- Offering a complete applicant tracking system for recruiters.
- Supporting every file format, locale, page design, or document parser from day one.
- Reproducing competitor designs or proprietary template libraries.

---

## 3. Users and personas

### 3.1 Student / fresher

**Context:** Has coursework, personal projects, hackathons, clubs, maybe one internship, but limited formal employment history. May not know what content belongs in a resume.

**Needs:** Guided prompts, project-first templates, education and graduation-date fields, relevant coursework, practical examples, portfolio/GitHub links, concise wording, one-page guidance, and feedback that does not shame the user for lacking experience.

**Default ordering:** Education → Skills → Projects → Experience or Internships → Leadership/Activities → Certifications/Awards. Permit manual reordering and role-specific exceptions.

### 3.2 Internship applicant

**Context:** Needs a targeted version quickly for a specific role, often with a project portfolio but minimal employment history.

**Needs:** Job-description comparison, project matching, skills evidence, deadline-friendly workflow, reusable master content, and fast PDF/DOCX download.

### 3.3 Experienced professional

**Context:** Has several roles and accomplishments. Their challenge is relevance, concision, and making impact visible.

**Needs:** Reverse chronology, achievement-first bullets, scope/leadership prompts, role-specific versions, two-page handling when appropriate, and tools for managing long histories.

**Default ordering:** Summary → Experience → Skills → Selected Projects (if relevant) → Education → Certifications / Leadership.

### 3.4 Career switcher

**Context:** Existing experience may not map obviously to a new job family.

**Needs:** Transferable-skills guidance, job-specific versions, relevant projects/certifications, and suggestions that avoid exaggerating past responsibilities.

### 3.5 Technical applicant

**Context:** Software engineering, AI/ML, data, cloud, platform, security, or DevOps applicant.

**Needs:** Technical skills taxonomy, project details, repository/demo links, relevant methods and tools, tests/evaluation/deployment evidence, and guidance not to merely list technologies without evidence.

### 3.6 Creative professional

**Context:** Designer, filmmaker, photographer, writer, or other visual/creative applicant.

**Needs:** Portfolio links, selected-work sections, creative template options, and clear warnings when an expressive design has not been validated for conservative ATS parsing.

### 3.7 Academic / researcher (later mode)

**Context:** Needs publications, research, presentations, teaching, grants, and longer multi-page documents.

**Needs:** Academic CV mode distinct from the normal resume flow; citation/publication fields and multi-page support.

---

## 4. Product principles

1. **Truth over polish:** Never invent metrics, employers, skills, credentials, dates, or outcomes.
2. **User control:** AI suggestions are proposals; the user chooses what to apply.
3. **Clear provenance:** Explain why a suggestion is made and which user-provided text or job requirement it relates to.
4. **Content is not a template:** Resume content must survive changing templates.
5. **Exports are first-class:** A download is not complete until its actual file is validated.
6. **Transparent checks:** Show findings and rules, not an unexplained score.
7. **Privacy by default:** Private resumes remain private; public links are opt-in and revocable.
8. **Progressive complexity:** Offer a useful first resume before presenting advanced settings.
9. **Accessible by design:** Keyboard access, good contrast, reduced motion, semantic structure, and responsive layouts.
10. **Delight without distraction:** Visual personality belongs in the application chrome; the default resume remains professional.

---

## 5. Market research and competitive reference points

The market contains products that emphasize different parts of the workflow. Revisit these sources before major product decisions because product plans and features can change.

| Product | Public reference | Useful patterns to study | Product lesson |
|---|---|---|---|
| FlowCV | https://flowcv.com/ | Guided entry, live preview, templates, export flow | Keep the core creation flow simple and make download predictable. |
| Teal | https://www.tealhq.com/tools/resume-builder | Job-specific resumes, job description matching, skill analysis | Treat tailoring as a repeatable workflow, not a one-time final step. |
| Kickresume | https://www.kickresume.com/en/ | AI writing, examples, templates, cover letters, checks | Provide role-aware examples and writing help. |
| Reactive Resume | https://github.com/reactive-resume/reactive-resume | Open-source architecture, template system, portability, export concepts | Keep data portable and study maintainable document-generation patterns. |
| Resume.io | https://resume.io/ | Guided content entry, examples, resume sections | Help inexperienced users understand what to write and where. |
| Canva | https://www.canva.com/create/resumes/ | Visual customisation and design flexibility | Distinguish a visually expressive design mode from a conservative ATS-focused mode. |
| Greenhouse parsing guidance | https://support.greenhouse.io/hc/en-us/articles/200989175-Unsuccessful-resume-parse | Examples of parsing failures | Test reading order and extracted text; avoid overpromising universal ATS compatibility. |
| Harvard resume guidance | https://careerservices.fas.harvard.edu/resources/create-a-strong-resume/ | Content, organization, and clarity | Coach users to be clear, relevant, consistent, and evidence-based. |
| React PDF | https://react-pdf.org/docs/v4 | React-based PDF-specific layout | Consider only if a separate PDF renderer is justified. |
| `docx` library | https://www.npmjs.com/package/docx | Programmatic Word generation | Generate editable DOCX and test it independently. |

### 5.1 Competitive positioning

Do not compete only on the quantity of templates. Differentiate through:

- Explanations for AI suggestions.
- Transparent parsing and job-match checks.
- Multiple targeted versions from one master profile.
- Truth-preserving writing assistance.
- Reliable PDF/DOCX exports with regression tests.
- A distinctive and accessible visual product.
- Private-by-default data handling and portable exports.

---

## 6. Product scope and release strategy

### MVP — build a complete end-to-end workflow

- Landing page and dashboard.
- Authentication and private storage.
- Resume creation from a blank state or starter content.
- Structured section editor.
- Real-time desktop preview; edit/preview tabs on mobile.
- Add, remove, hide, reorder, and rename supported sections.
- Six template families, with each template built from shared data.
- Curated font presets and conservative accent-color choices.
- A4 and US Letter page sizes.
- Autosave, save status, undo/redo or a documented equivalent.
- Master resume and job-specific copies.
- AI bullet rewrite and summary assistance.
- Job description paste and keyword/skill comparison.
- Transparent parse-readiness and content completeness checks.
- PDF and DOCX export.
- Extracted-text and layout validation tests.
- Privacy controls, delete/export data flow, accessible UI and core documentation.

### V2 — make it more useful

- Existing PDF/DOCX import and reviewable extraction.
- TXT and JSON exports/imports.
- Cover-letter generation using shared profile/job context.
- Resume history and comparison/diff view.
- Richer role-specific coaching.
- More template variants and section presets.
- Resume feedback explainability and saved suggestions.
- More languages and localisation readiness.
- Application tracker with status, dates, contacts and notes.

### V3 — broader career workspace

- Portfolio/website generation from selected resume content.
- Interview practice using the user's experience and target job.
- Skill-gap analysis and suggested learning/project plans.
- Job-source integrations where terms and user consent permit.
- Academic CV mode with publications, teaching and research.
- More robust multi-language and regional formats.
- Optional public resume/share links with expiry/revocation controls.
- Team, mentor, or career-services feedback workflow only if a real use case is validated.

---

## 7. Information architecture

### 7.1 Public routes

- `/` — marketing landing page.
- `/features` — feature overview.
- `/templates` — template gallery and template details.
- `/pricing` — only once a real pricing model exists; avoid fake pricing pages.
- `/privacy` — privacy policy.
- `/terms` — terms of use.
- `/help` — help, export, and ATS-check explanations.

### 7.2 Authenticated routes

- `/dashboard` — resume list, recent versions, create/import actions.
- `/resume/new` — choose goal, audience, and start method.
- `/resume/[resumeId]/edit` — main editor.
- `/resume/[resumeId]/preview` — full preview and export panel if separate view is needed.
- `/resume/[resumeId]/checks` — parse readiness, content quality, and job-match details.
- `/jobs` — saved job descriptions and application targets (V2).
- `/settings` — profile, privacy, account, export/delete data.

### 7.3 Main editor layout

Desktop:

- **Left panel:** sections and form fields; supports reordering and visibility.
- **Center/right panel:** live page preview with page boundaries.
- **Context tools:** AI rewrite, check results, template settings, export controls.
- **Persistent status:** saved/saving/error state, undo/redo, and download.

Mobile:

- Switch between **Edit** and **Preview** tabs.
- Put export and autosave status in a visible, compact action area.
- Avoid requiring horizontal scrolling to edit fields.

### 7.4 First-run flow

1. Ask for goal: internship/fresher, experienced professional, career switch, creative, academic (academic can be labelled later release).
2. Ask how to start: blank, guided builder, or upload an existing resume (upload may be V2).
3. Create an editable skeleton with a recommended section order.
4. Explain the minimum next step and allow users to skip optional fields.
5. Show a preview early so the user sees progress.
6. Suggest AI assistance only when useful; do not block manual editing.

---

## 8. Feature specifications

### 8.1 Resume builder

Required capabilities:

- Create, edit, delete, duplicate and rename resumes.
- Create job-specific copies from a master resume.
- Add, remove, hide, reorder, and rename sections.
- Support multiple items in experience, education, projects, awards, certificates, activities, volunteering, publications and custom sections as they are added.
- Support optional fields without awkward blank labels.
- Preserve text exactly when the user switches templates.
- Validate basic input formats without blocking unusual but valid data.
- Handle long entries and multi-page output gracefully.
- Provide an explicit delete/undo confirmation for destructive actions.
- Autosave with visible saved/saving/error states; do not show “Saved” until persistence is confirmed.

### 8.2 Template families

Launch with these six families:

1. **Classic ATS:** single column, black/white, standard headings, chronological experience, no decorative charts.
2. **Modern Editorial:** clean typography, restrained accent, subtle rules and spacing.
3. **Fresher / Graduate:** education, skills and projects can lead; supports coursework, internships, clubs and hackathons.
4. **Technical / Project-First:** visible project contributions, toolset, repository/demo links and technical details.
5. **Experienced Professional:** space for scope, leadership, impact and selected experience; suitable for one or two pages depending on content.
6. **Creative / Portfolio:** stronger visual hierarchy and portfolio space; clearly state if the template has not passed the conservative ATS validation suite.

Later: **Academic CV** with multi-page support, publications, research, teaching, presentations, grants and references if appropriate.

Template architecture requirements:

- Every template consumes the same versioned resume model.
- Templates define rendering, not content semantics.
- Shared primitives handle heading, experience row, date, bullet, link and page spacing.
- Keep template-specific style tokens separate from user content.
- Each template has documented ATS/readability expectations and an automated validation status.
- A template selection must not mutate, erase, or reorder stored semantic content except where a user explicitly chooses section reordering.

### 8.3 Role presets and section order

Presets should adjust recommended ordering, coaching, sample prompts, and checks, not create separate data schemas.

| Role family | Emphasis |
|---|---|
| Software engineer | Languages, data structures, architecture, tests, GitHub, deployed projects and measurable improvements. |
| AI/ML engineer | Dataset, baseline, method, evaluation metrics, deployment, reproducibility and limitations. |
| Cloud/DevOps/platform | AWS/Azure/GCP, CI/CD, Docker, Kubernetes, observability, infrastructure and reliability evidence. |
| Data analyst/scientist | SQL, Python, statistics, dashboards, experimentation and analytical outcomes. |
| Product manager | User problems, roadmap decisions, prioritisation, cross-functional delivery, adoption and business outcomes. |
| UI/UX designer | Research, design rationale, accessibility, prototypes, iteration and case-study/portfolio links. |
| Finance/consulting | Analysis, modelling, structured problem-solving, relevant qualifications and quantified outcomes. |
| Sales/customer success | Quota or target attainment, pipeline, retention, customer results and account growth; only where verified. |
| Research/academic | Research question, method, contributions, publications and presentations; deeper academic CV in later release. |
| Creative/film | Portfolio, selected work, role/contribution, tools, credits and links. |

### 8.4 Font and layout system

Offer curated font combinations and test them in the final output. Suggested first presets:

- **Clean:** Inter or another bundled, well-supported sans serif.
- **Corporate:** Arial/Aptos-like conservative system fonts where available; control fallback behavior.
- **Editorial:** Source Sans 3 or equivalent readable sans serif.
- **Classic serif:** Georgia or equivalent readable serif.

Suggested defaults—not rigid rules:

- Body: approximately 10–11 pt.
- Section headings: approximately 12–14 pt.
- Name: approximately 22–26 pt.
- Margins: approximately 0.6–0.7 inches.
- Line spacing: approximately 1.1–1.2.
- Default page size: A4; offer US Letter.

Warn if typography becomes too small, contrast drops, or content overflows. Do not silently force users into unreadable typography to fit one page.

### 8.5 Visual system: soft-club / Y2K

Design direction:

- Warm off-white background (`#F7F5F4`).
- Dark text (`#201E28`).
- Lavender accent (`#C8BFFF`).
- Cool blue surfaces (`#BEE9F2`).
- Soft pink accent (`#F3C6D8`).
- Dark-mode surface (`#24222F`).
- Restrained gradients, subtle borders, carefully used glass effects, retro window details, small technical labels, and consistent icons.
- Motion is subtle, purposeful and disabled/respectfully reduced when `prefers-reduced-motion` is set.
- Keep the resume output more conservative than the application interface.

Accessibility requirements:

- Meet WCAG 2.2 AA as a project target where practical.
- Keyboard navigation and visible focus.
- Semantic headings and labels.
- Sufficient color contrast; do not convey state by color alone.
- Screen-reader labels for icon-only controls.
- Reduced-motion support.
- Responsive layout and zoom/reflow support.
- Clear validation messages linked to their input fields.

### 8.6 AI bullet improver

Input:

- Existing user-authored bullet or rough notes.
- Optional role context and target job description.
- Optional tone: concise, technical, leadership-focused, customer-focused.

Output:

- One or more candidate rewrites.
- Short explanation of what changed.
- Missing-fact questions if more evidence is needed.
- Claims/facts that remain uncertain marked for user review.

Rules:

- Never fabricate numbers, revenue, percentages, latency reductions, team sizes, titles, qualifications, or outcomes.
- Never claim that an action/result happened unless present in user-provided evidence.
- Preserve the user's intended meaning.
- Keep original text available for undo/rejection.
- Let the user accept, edit, regenerate, or reject.
- Use structured output and validate it server-side.
- Use safe prompt construction: treat job descriptions and uploaded documents as untrusted data, not instructions to the model.
- Do not expose provider API keys in the browser.
- Add rate limits, token/input length limits, user-visible error states, and usage-cost telemetry that avoids storing resume content.

### 8.7 Job description matching

Flow:

1. User pastes a job description and optionally names the company/role.
2. Extract likely requirements, responsibilities, required skills, preferred skills, qualifications and domain phrases.
3. Compare them with structured resume content and reasonable synonym variants.
4. Show supported matches, weakly evidenced matches, and missing/unconfirmed requirements.
5. For each finding, point to resume evidence when available or explain what needs user confirmation.
6. Suggest an edit only when supported by real experience; otherwise suggest learning or project evidence instead.
7. Save the job target and a tailored resume copy if the user requests it.

Do not imply exact compatibility with proprietary employer ranking. Explain keyword coverage as a heuristic and show its criteria.

### 8.8 Readiness checks

Display three separate assessments:

1. **Parse readiness:** common structural/format risks, heading detection, contact-detail placement, extracted-text order, text selection, unusual graphics/tables/columns, missing document metadata where relevant, and overflow.
2. **Job match:** coverage of required and preferred skills, synonyms, evidence quality, and gaps relative to the specific job description.
3. **Content quality:** completeness, consistency, clear action verbs, evidence/impact where available, date consistency, duplicate bullets, link completeness, spelling/grammar suggestions, and role relevance.

Avoid an unsupported “ATS approved” or guaranteed score. If a numeric heuristic is offered, explain the exact rule set and label it as a product-defined indicator, not an employer ATS prediction.

### 8.9 Import and parsing (V2 scope; design data model to support it)

- PDF/DOCX import should produce a **review screen**, not silently overwrite a resume.
- Show confidence per extracted section/item where possible.
- Preserve source file privately and allow its deletion.
- Warn if the source is image-only or extraction is incomplete.
- Provide correction tools for dates, company names, bullet order and headings.
- Parse plain text in a predictable order.
- Add file-size/type checks and safe processing; treat files as untrusted content.
- Avoid saving extracted data until the user explicitly imports it.

### 8.10 Export settings

Formats:

- **PDF:** primary output; searchable/selectable text, predictable page layout.
- **DOCX:** editable Word document.
- **TXT:** plain-text content/read-order inspection (V2).
- **JSON:** portable, structured resume backup/import (V2).

Settings:

- File format.
- A4 or US Letter.
- Template.
- Font preset and accent color.
- Spacing/margins within safe bounds.
- Optional sections.
- Page overflow information.
- Optional share link (later, explicitly opt-in).

Implementation options:

- First PDF version: browser print with dedicated `@media print` CSS if it meets layout and browser requirements.
- More controlled PDF version: Playwright/Chromium rendering the same HTML/CSS template to PDF.
- Alternative: `@react-pdf/renderer`, recognizing it creates a PDF-specific layout model and may require duplicated layout logic.
- DOCX: `docx` library or an equivalent maintained Word document generator.
- TXT/JSON: generate from the canonical semantic model, not by scraping a screenshot.

Never create the resume PDF as a single raster image. Export output must be tested for selectable text and content order.

---

## 9. Technical architecture

### 9.1 Recommended baseline stack

| Layer | Recommendation | Reason |
|---|---|---|
| Full-stack web framework | Next.js + TypeScript | SEO-friendly public routes plus interactive application routes. |
| UI styling/components | Tailwind CSS + shadcn/ui | Consistent design tokens, fast accessible component implementation. |
| Motion | Motion/Framer Motion, used sparingly | Subtle transitions and microinteractions. |
| Editor state | Zustand or a similarly simple state layer | Manage draft editing state without coupling to persistence. |
| Forms/schema validation | React Hook Form + Zod | Form performance and shared client/server validation. |
| Auth/database | Supabase Auth + PostgreSQL | Managed authentication and relational data, with JSONB for versioned resume content. |
| AI | Provider API behind server-side routes | Keeps secrets private and allows provider changes. |
| PDF | Print CSS plus Playwright/Chromium if needed | Use the same semantic HTML template and validate real output. |
| DOCX | `docx` package or equivalent | Generate editable Word files programmatically. |
| PDF text extraction | `pdfjs-dist` or equivalent | Validate actual text and reading order. |
| DOCX import | `mammoth` or another tested extractor (V2) | Extract editable content from Word files. |
| Unit/component tests | Vitest + React Testing Library | Fast tests for state, validations and UI behavior. |
| End-to-end tests | Playwright | Verify full flows, exports and responsive behavior. |
| Hosting | Vercel or comparable platform + Supabase | Straightforward deployment of the selected stack. |
| Error monitoring | Sentry or equivalent with PII scrubbing | Observe production errors without logging resume content. |

FastAPI/Python is optional, not an initial requirement. Add it only when Python-specific parsing/analysis or a separate worker provides clear value. Avoid operating two backend stacks without a concrete use case.

### 9.2 High-level architecture

```text
Browser (Next.js / React / TypeScript)
  ├── Editor forms + local draft state
  ├── Template renderer / live preview
  ├── Readiness-check UI
  └── Export controls
          |
          v
Server routes / server actions
  ├── Authentication + authorization
  ├── Zod schema validation
  ├── AI orchestration + rate limits
  ├── Export orchestration
  └── Import/parsing routes (V2)
          |
          +---- Supabase Auth + PostgreSQL
          |       ├── profiles
          |       ├── resumes (versioned JSONB)
          |       ├── resume_versions
          |       ├── job_targets
          |       └── ai_suggestions (minimal metadata)
          |
          +---- LLM provider (server-side only)
          |
          +---- PDF/DOCX generation + validation
```

### 9.3 Main data-model principle

One versioned semantic resume model should power:

- Editor form values.
- Live preview.
- Template rendering.
- AI context.
- Parse-readiness checks.
- Job-description matching.
- PDF and DOCX export.
- TXT and JSON export/import.
- Future portfolio generation.

Keep **content**, **template/display settings**, and **job-specific versions** logically separate.

### 9.4 Example schema (simplified)

```ts
export type ResumeDocument = {
  schemaVersion: number;
  basics: {
    name: string;
    email: string;
    phone?: string;
    location?: string;
    links: { label: string; url: string }[];
  };
  summary?: string;
  experience: {
    id: string;
    company: string;
    role: string;
    location?: string;
    startDate: string;
    endDate?: string;
    current?: boolean;
    bullets: string[];
  }[];
  education: {
    id: string;
    institution: string;
    degree: string;
    field?: string;
    startDate?: string;
    endDate?: string;
    grade?: string;
  }[];
  projects: {
    id: string;
    name: string;
    description: string;
    technologies: string[];
    url?: string;
    bullets?: string[];
  }[];
  skills: { category?: string; items: string[] }[];
  certifications?: Record<string, unknown>[];
  awards?: Record<string, unknown>[];
  activities?: Record<string, unknown>[];
  customSections?: Record<string, unknown>[];
};
```

This example is a starting shape, not a final contract. Use stable IDs for repeatable items, dates with defined validation/formatting, optional properties, and schema migrations. Avoid making every uncommon section a free-form unvalidated blob if it needs rendering or ATS logic.

### 9.5 Suggested storage entities

- `profiles`: account-level preferences; avoid duplicating resume content.
- `resumes`: user ownership, title, master/derived type, current content, style settings, updated timestamp, schema version.
- `resume_versions`: snapshots/diffs or version history metadata when needed.
- `job_targets`: pasted job description, role/company labels, extracted requirements, user ownership and timestamps.
- `ai_suggestions`: suggestion type, source field/version, status (`pending`, `accepted`, `edited`, `rejected`), minimal necessary metadata; avoid unnecessarily storing full prompt bodies.
- `public_share_links` (later): token hash, resume/version reference, expiration and revocation timestamps.
- `usage_events`: privacy-conscious event metadata for product analytics; do not include resume text or direct identifiers in event payloads.

### 9.6 Data integrity and versioning

- Keep a `schemaVersion` field in each saved document.
- Write migrations when the structure changes.
- Test old fixtures through every migration.
- Store master and tailored versions separately, with explicit lineage (e.g., `parent_resume_id` or version relationship).
- Define how autosave conflicts behave if the same resume is edited in two tabs.
- Prevent stale saves from overwriting newer content where possible.
- Use soft deletion only when a documented recovery policy requires it; otherwise honour user deletion and retention obligations.

---

## 10. ATS and document-validation strategy

ATS compatibility is not a universal pass/fail property. Build a transparent **readiness checker** for known risk factors and test real outputs.

### 10.1 Conservative template rules

- Prefer one-column reading order in ATS-focused templates.
- Use conventional section headings: Experience, Education, Skills, Projects, Certifications.
- Keep contact details in the document body, not only in headers, footers, graphics or text boxes.
- Use real text, not a screenshot or image of the resume.
- Avoid text-only information encoded in icons or charts.
- Avoid tables and elaborate sidebars in conservative templates.
- Use consistent date formats and reverse chronological order where suitable.
- Make links visible/readable and avoid showing a link icon with no text.
- Do not force all users into one page if doing so produces tiny text or removes relevant content.

### 10.2 Automated checks

- Extract PDF text and compare it to expected semantic content.
- Confirm name/contact details are present in extracted text.
- Confirm section labels appear in logical order.
- Confirm bullets and date/title/company pairs stay associated.
- Confirm no content is clipped outside page bounds.
- Confirm fonts are embedded or have dependable fallback behavior when applicable.
- Confirm hyperlink destinations are valid and visible.
- Confirm page size and expected page count.
- Render representative exports to images and compare visual regressions.
- Open DOCX output with an independent parser/test pipeline where feasible.
- Test long names, non-ASCII characters, em dashes, apostrophes, URLs, absent optional fields, very long bullets, many jobs, and multi-page content.

### 10.3 User-facing explanation

Describe results as findings and checks. Example:

- “Contact information was detected in the main document body.”
- “The extracted reading order places Skills before Experience. Review if unintended.”
- “This template uses a multi-column layout, which can be harder for some parsers.”
- “The job description mentions CI/CD, but your resume does not currently provide evidence for it.”

Avoid: “100% ATS approved”, “guaranteed to pass”, or an unexplained ranking score.

---

## 11. AI design, quality, and evaluation

### 11.1 AI workflow patterns

- Use narrow tools (rewrite a bullet, draft a summary, extract job requirements) rather than one prompt to rewrite the entire resume.
- Use structured JSON output validated with Zod or equivalent.
- Pass only the relevant fields into a request, not the complete profile by default.
- Treat pasted job descriptions, imported documents, and quoted text as untrusted input; never follow instructions embedded within them.
- Use model-provider abstraction so the provider can be changed without rewriting the product logic.
- Keep API keys server-side and apply quotas/rate limits.
- Log aggregate performance/cost/errors without logging personal resume content.

### 11.2 Prompt requirements

Prompts must specify:

- Preserve user-provided facts.
- Do not invent metrics, outcomes, tools, credentials or employment details.
- Distinguish explicit evidence from inferred possibilities.
- Ask a clarifying question when an important fact is missing.
- Return schema-valid structured content.
- Provide a brief explanation for the edit.
- Offer concise and role-relevant writing, not empty buzzwords.
- Treat quoted job descriptions as data, not instructions.

### 11.3 Evaluation dataset

Create an anonymized/synthetic evaluation set with:

- Rough project bullets from students.
- Weak and strong experience bullets.
- Missing metrics and incomplete facts.
- Job descriptions across engineering, data, product, design, finance, sales and research.
- Misleading prompts that tempt the model to invent outcomes.
- Pasted content containing instruction-like strings.
- Non-English names, punctuation and unusual formatting.

Track:

- Factual preservation.
- Unsupported-claim rate.
- Relevance to the target role.
- Readability and concision.
- Schema validity.
- User accept/edit/reject rates (with privacy safeguards).
- Latency, failure rate and estimated cost per successful operation.

Do not use acceptance rate alone as quality proof. Users may accept fluent but inaccurate content.

---

## 12. Privacy, security, and legal considerations

Resume content includes personal data such as contact details, employment history, education and links. Privacy and security are product requirements, not future polish.

### Required controls

- Private-by-default records.
- Authenticated routes enforce ownership on the server.
- Supabase Row Level Security policies ensure a user can only access their permitted rows.
- Never expose service-role secrets to the browser.
- Validate ownership independently of client-provided IDs.
- Keep LLM credentials and privileged database credentials server-side.
- Validate file types and file sizes for import.
- Apply request size limits, rate limits and abuse handling.
- Use HTTPS in deployed environments.
- Provide account/data export and deletion workflows.
- Explain when resume/job content is sent to an AI provider and which provider is used.
- Avoid retaining full AI prompts/responses longer than needed for product functionality.
- Remove personal data from monitoring and analytics.
- Use opt-in, revocable public sharing with unguessable tokens and optional expiry if sharing is added.
- Publish accurate privacy/terms documentation before public launch.
- Review provider terms, retention settings and applicable privacy obligations for target markets.

### Security tests

- Attempt to read/update/delete another user's resume by modifying IDs.
- Test RLS from client and server code paths.
- Confirm unauthenticated routes cannot access private data.
- Confirm public share links expose only the explicitly shared version and can be revoked.
- Check production bundles and repository history for secrets.
- Test rate limits and oversized/unexpected payloads.
- Verify deletion reaches all storage locations and documented backups/retention paths.

This is a product/engineering checklist, not legal advice. Before public launch, review applicable Indian and other relevant data-protection requirements with qualified guidance as needed.

---

## 13. Analytics and product metrics

Instrument events without placing PII or resume content into analytics payloads.

### Funnel

- Landing page visit.
- Start creation.
- First section completed.
- Preview viewed.
- First save confirmed.
- First export started/completed.
- AI suggestion generated/accepted/edited/rejected.
- Job description added.
- Tailored version created.

### Quality metrics

- Time to first valid preview.
- Time to first successful export.
- Export success rate by format/template/browser.
- Export defect rate found in tests or user reports.
- Autosave failure/conflict rate.
- AI schema-valid response rate.
- AI unsupported-claim rate on the evaluation set.
- Job-match finding usefulness, measured through review/feedback rather than score alone.
- Resume completion abandonment by step.
- Accessibility audit issues remaining.
- Crash/error-free session rate.

### Avoid misleading metrics

- Do not advertise that a higher internal score guarantees interviews.
- Do not use employer-response rate as the sole success signal; the hiring outcome depends on many factors outside the product.
- Do not collect sensitive analytics without a defined purpose and appropriate notice/consent.

---

## 14. Testing strategy

### Unit tests

- Resume schema validation and migrations.
- Date formatting and chronology.
- Section ordering and optional fields.
- Template token/config validation.
- Keyword/synonym matching rules.
- ATS/readability rules.
- AI output validation and sanitization.
- Export filename sanitization.

### Component tests

- Forms, repeatable sections, reorder UI, dialogs, autosave state, preview switches, tooltips, error states and keyboard interactions.
- AI suggestion acceptance/rejection/undo.
- Export settings and layout warning states.

### Integration tests

- Save/load resume.
- Create and edit a job-specific copy.
- Enforce user ownership through API routes.
- AI provider error/retry/timeout handling.
- PDF/DOCX generation pipeline.
- Extract generated PDF text and compare expected content.

### End-to-end tests

- First-run fresher journey.
- Experienced professional resume with multiple roles and a second page.
- Role-specific job match workflow.
- Rejecting an AI suggestion leaves the original intact.
- Export PDF and DOCX successfully.
- Reload page and recover saved content.
- Switch template without data loss.
- Mobile edit and preview journey.
- User deletes their resume/account data.

### Visual regression tests

Use representative fixtures for every template and page size. Render each export and compare page images with an approved baseline. Review intentional design changes before updating baselines.

### Accessibility tests

Automated axe checks plus manual keyboard and screen-reader testing. Automated scans cannot detect every accessibility issue.

---

## 15. Deployment and operations

- Environments: local development, preview/staging, production.
- Separate secrets/configuration per environment.
- Validate environment variables at startup/build.
- Run lint, type-check, unit tests, integration tests (where safe), and build before merging.
- Run database migrations explicitly and document rollback/forward-fix procedures.
- Use preview deployments for visual/export checks.
- Monitor errors, export failures, AI timeouts and rate limiting.
- Use reasonable timeouts, cancellation and user-facing retry guidance.
- Have a backup/recovery plan for the database and test restoration periodically.
- Keep dependencies updated and run vulnerability checks.
- Keep generated documents out of public build artifacts and default public storage.
- Avoid serverless execution timeouts by separating long-running rendering into an appropriate worker/service if needed.
- Document local setup, test commands, deployment and rollback procedures.

---

## 16. Suggested repository structure

```text
softcv-studio/
├── app/
│   ├── (marketing)/
│   ├── (auth)/
│   ├── dashboard/
│   ├── resume/[resumeId]/edit/
│   ├── api/                 # server routes where needed
│   └── settings/
├── components/
│   ├── ui/
│   ├── editor/
│   ├── preview/
│   ├── templates/
│   ├── ai/
│   ├── checks/
│   └── export/
├── lib/
│   ├── auth/
│   ├── database/
│   ├── resume-schema/
│   ├── template-engine/
│   ├── ats-checks/
│   ├── job-matching/
│   ├── ai/
│   ├── export/
│   └── security/
├── supabase/
│   ├── migrations/
│   └── seed.sql
├── tests/
│   ├── fixtures/
│   ├── unit/
│   ├── integration/
│   ├── e2e/
│   └── visual/
├── docs/
│   ├── architecture.md
│   ├── data-model.md
│   ├── ai-safety.md
│   ├── export-testing.md
│   └── security.md
├── PLAN.md
├── BACKLOG.md
├── README.md
└── .env.example
```

Adapt the structure to the framework's conventions; do not create empty folders purely to match this diagram.

---

## 17. Milestones and exit criteria

### Milestone 0 — Research and product definition

Deliverables: product brief, personas, information architecture, low-fidelity flows, template content rules, data schema draft, security model, and decisions record.

Exit criteria: MVP scope is frozen; open decisions and risks are documented; primary user journey is testable in a prototype.

### Milestone 1 — Design system and editor skeleton

Deliverables: design tokens, accessible form primitives, dashboard shell, editor layout, responsive navigation, first two templates and structured form state.

Exit criteria: user can create/edit a draft and see an accurate preview without persistence.

### Milestone 2 — Persistence and template engine

Deliverables: auth, database migration, RLS policies, save/load/autosave, master/derived versions and all six initial template families.

Exit criteria: data survives refresh; templates share content; user isolation tests pass.

### Milestone 3 — PDF/DOCX export quality

Deliverables: PDF and DOCX generators, export panel, page-size options, validation fixtures and automated text/layout tests.

Exit criteria: every launch template passes minimum export tests for short, typical and long content; no known critical clipping/order defect remains.

### Milestone 4 — AI and transparent checks

Deliverables: bullet improver, summary assistance, job-description parser, rule-based readiness checks, keyword/evidence comparison and AI evaluation fixtures.

Exit criteria: unsupported-claim tests pass the defined threshold; error states are understandable; user can reject edits and preserve originals.

### Milestone 5 — Release hardening

Deliverables: mobile polish, accessibility remediation, privacy/delete/export flow, security review, documentation, monitoring and demo content.

Exit criteria: release checklist is complete; known risks and limitations are disclosed; backup/incident procedures are documented.

### Milestone 6 — V2 validation

Deliverables: import, TXT/JSON, cover letters, resume history, richer role guidance, language readiness and application tracker discovery/prototype.

Exit criteria: each V2 feature has user evidence, clear scope and its own acceptance criteria before implementation.

---

## 18. Risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| ATS claims are overstated | User trust and reputational risk | Report concrete checks; explain limitations; never guarantee a hiring-system result. |
| AI fabricates achievement metrics | Misrepresentation and user harm | Evidence-preserving prompts, structured outputs, user review, adversarial evaluation tests. |
| PDF layout breaks with long content | Core product failure | Representative fixtures, actual PDF text extraction, visual regression and multi-page tests. |
| DOCX output is visually different | Poor user experience | Keep DOCX layouts conservative; test output independently; disclose unsupported template details. |
| Template complexity becomes unmaintainable | Slow development and inconsistent behavior | Shared semantic model and primitives; six well-tested initial families instead of a huge catalogue. |
| Resume data leaks | Serious privacy failure | RLS, server authorization, secret handling, no PII in logs, security tests and deletion workflow. |
| AI cost/latency grows | Poor UX and high operating cost | Narrow calls, token limits, rate limits, caching where safe, model selection and cost telemetry. |
| Users confuse keyword match with ATS score | Misleading product experience | Separate parse readiness from job match; show criteria and evidence. |
| Scope expands indefinitely | MVP never ships | Freeze MVP, defer import/cover letters/academic CV/application tracker to later releases. |
| Creative UI weakens document readability | Lower job-application usefulness | Keep visual effects in the product UI; validate resume output separately. |
| Dependency/vendor changes | Maintenance burden | Provider abstraction, dependency review, lockfile and migration notes. |

---

## 19. Definition of Done (global)

A feature is not done merely because it appears in the UI. Unless an item explicitly says otherwise, it is done when:

- Requirements and acceptance criteria are satisfied.
- Types and runtime validation cover its inputs/outputs.
- Loading, empty, error, success and retry states are present where relevant.
- Keyboard navigation and responsive behavior are checked.
- Automated tests cover important behavior and regression risks.
- Security and ownership checks are in place where data is involved.
- Analytics contain no unnecessary personal or resume content.
- Documentation and environment configuration are updated.
- No secret is committed and `.env.example` contains placeholders only.
- The change passes formatting/lint, type-check, test and build commands.
- Destructive data changes include migration/rollback or recovery notes.
- Export changes are tested using actual generated files.

---

## 20. Launch checklist

### Product and content
- [ ] Main creation journey has been tested with a student and an experienced-professional fixture.
- [ ] All six launch templates have complete design notes and known limitations.
- [ ] AI text clearly remains editable and user-controlled.
- [ ] ATS/readiness language is accurate and avoids guarantees.
- [ ] Pricing claims, if any, match the actual product.
- [ ] Empty states and sample content are helpful and clearly labelled as examples.

### Quality
- [ ] PDF and DOCX exports pass text, page, link and visual checks.
- [ ] Multi-page content has been tested.
- [ ] Export failures show useful recovery instructions.
- [ ] Autosave failure and conflicting edits are handled.
- [ ] Mobile editor and download flow work.
- [ ] Accessibility audit has no unresolved release-blocking findings.

### Security/privacy
- [ ] RLS and ownership tests pass.
- [ ] No keys or secrets are present in client bundles or repository history.
- [ ] Data export and deletion are tested.
- [ ] AI provider disclosure is accessible at the point of use.
- [ ] Logs/analytics are scrubbed of resume content and direct identifiers.
- [ ] Public sharing, if enabled, is opt-in and revocable.

### Operations
- [ ] Production environment variables are documented and set.
- [ ] Migrations and restore procedures are documented.
- [ ] Monitoring and alerts cover critical failures.
- [ ] Repository README includes install, environment, test, build and deploy steps.
- [ ] A demo account/fixture uses synthetic information, not a real person's resume.

---

## 21. Reference appendix

These links are research starting points; verify current features, pricing, APIs, and terms before relying on them.

- FlowCV: https://flowcv.com/
- Teal Resume Builder: https://www.tealhq.com/tools/resume-builder
- Kickresume: https://www.kickresume.com/en/
- Reactive Resume source: https://github.com/reactive-resume/reactive-resume
- Resume.io: https://resume.io/
- Canva Resume Maker: https://www.canva.com/create/resumes/
- Greenhouse resume parsing guidance: https://support.greenhouse.io/hc/en-us/articles/200989175-Unsuccessful-resume-parse
- Harvard resume guidance: https://careerservices.fas.harvard.edu/resources/create-a-strong-resume/
- React PDF: https://react-pdf.org/docs/v4
- `docx` package: https://www.npmjs.com/package/docx
- Next.js: https://nextjs.org/docs
- Supabase documentation: https://supabase.com/docs
- Playwright: https://playwright.dev/docs/intro
- Tailwind CSS: https://tailwindcss.com/docs
- shadcn/ui: https://ui.shadcn.com/docs

---

## 22. Open decisions to resolve before implementation

1. **Brand:** Is “SoftCV Studio” temporary, or should a final brand/name/domain be selected now?
2. **Authentication:** Is guest mode important, or should all persistent resume storage require login?
3. **AI provider:** Choose provider based on quality, price, privacy/data controls, structured outputs and availability in target regions.
4. **Export route:** Decide between browser print, server-rendered Chromium PDF, or a split approach after a technical spike with real templates.
5. **DOCX fidelity:** Define the common denominator across templates; the first DOCX templates should likely remain conservative even when the web preview is more expressive.
6. **Free/premium boundary:** Avoid designing paywalls until the core free product works and likely costs are understood.
7. **Supported locales:** Start with English and A4-friendly defaults; design data/formatting for future localisation.
8. **Import timeline:** Defer document import until export and schema quality are stable unless user research makes import a launch blocker.
9. **Public sharing:** Default off. Decide separately whether and how share links expire, can be revoked, and are indexed.
10. **Retention policy:** Define what happens to deleted account data, temporary rendered files, logs, backups, and provider-side AI requests.

