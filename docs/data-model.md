# SoftCV Studio — Data Model & Schema Architecture

**Document Reference:** `DOC-DATA-2026-V1`  
**Status:** Implemented & Verified (Sprint 06)  

---

## 1. Canonical Resume Schema (`ResumeDocument`)

The resume document is defined in `src/lib/schemas/resume.ts` and validated with Zod:

```typescript
export interface ResumeDocument {
  schemaVersion: number; // Current: 1
  basics: {
    name: string;
    email?: string;
    phone?: string;
    location?: string;
    headline?: string;
    links: Array<{ label: string; url: string }>;
  };
  summary?: string;
  experience: Array<ExperienceItem>;
  education: Array<EducationItem>;
  projects: Array<ProjectItem>;
  skills: Array<SkillCategory>;
  internships: Array<InternshipItem>;
  awards?: Array<AwardItem>;
  volunteering?: Array<VolunteeringItem>;
  certifications?: Array<CertificationItem>;
  publications?: Array<PublicationItem>;
  customSections?: Array<CustomSection>;
  settings: {
    templateId: TemplateId;
    pageSize: "A4" | "US_LETTER";
    fontFamily: string;
    fontSize: "sm" | "md" | "lg";
    lineHeight: "tight" | "normal" | "relaxed";
    margin: "compact" | "normal" | "spacious";
    accentColor: string;
    sectionOrder: string[];
    hiddenSections: string[];
  };
}
```

### Schema Migrations (`src/lib/schemas/migrations.ts`)
- Whenever a stored document is retrieved from storage, it passes through `migrateResumeDocument()`.
- Future schema version bumps increment `schemaVersion` and define deterministic transformation functions to preserve user documents without data loss.

---

## 2. Job Target Model (`JobTarget`)

Defined in `src/lib/schemas/job-target.ts`:
- Associates a targeted job description with a specific `resumeId`.
- Stores target role, company, raw job text (max 10,000 chars), and extracted/verified skill requirements.
- Automatically cleaned up whenever the parent resume cartridge is deleted.

---

## 3. Storage Keys & Local Namespace

All local data is segregated under the `softcv_` namespace in browser `localStorage`:

| Key Pattern | Data Structure | Description |
|---|---|---|
| `softcv_resume_index` | `ResumeListItem[]` | Lightweight rack metadata (`id`, `title`, `updatedAt`, `templateId`, `isMaster`, `parentResumeId`, `targetRole`, `targetCompany`) |
| `softcv_resumes_${id}` | `ResumeDocument` | Complete serialized resume document |
| `softcv_job_target_${resumeId}` | `JobTarget` | Job description, company name, and extracted skills associated with resume |

### 3.1 Cartridge Lineage & Tailored Branching (RS-094)
- **Master Cartridge:** A base resume representing the candidate's canonical experience (`isMaster: true`, `parentResumeId: null`).
- **Tailored Cartridge:** An opportunity-specific branch (`isMaster: false`, `parentResumeId: <masterId>`, `targetRole: string`, `targetCompany?: string`).
- **Deep Clone Guarantee:** When creating a tailored copy (`createTailoredCopy`), the source document is cloned with `structuredClone()`, guaranteeing zero shared memory or storage references across all nested sections (experience, bullets, education, projects, skills, custom sections).
- **Atomic Rollback:** If the associated `JobTarget` fails to save, the newly initialized tailored cartridge is immediately purged, preventing orphan half-created states.
- **Master Immutability:** Mutating a tailored copy never mutates the master cartridge. Deleting a tailored copy deletes only its record and job target, leaving the master and sibling cartridges completely intact.


---

## 4. Supabase Cloud Database Architecture (RS-041, RS-042)

In authenticated cloud mode, documents and job targets are stored in a hosted PostgreSQL database managed by Supabase, fully secured by Row-Level Security (RLS) and foreign-key cascade deletions.

### 4.1 Schema Definitions (`docs/supabase/migrations/001_initial.sql`)

```sql
-- Resumes Table
CREATE TABLE public.resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled Cartridge',
  document JSONB NOT NULL,
  is_master BOOLEAN NOT NULL DEFAULT true,
  parent_resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Job Targets Table
CREATE TABLE public.job_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_role TEXT NOT NULL DEFAULT '',
  company_name TEXT NOT NULL DEFAULT '',
  raw_job_description TEXT NOT NULL DEFAULT '',
  extracted_requirements JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_resume_job_target UNIQUE (resume_id)
);
```

### 4.2 Row-Level Security (RLS) Policies
Both tables have RLS explicitly enabled. Every query is constrained at the database kernel level to records where `auth.uid() = user_id`:
```sql
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_targets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own resumes"
  ON public.resumes FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own job targets"
  ON public.job_targets FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### 4.3 Redundant Application-Layer Authorization (`supabase-adapter.ts`)
In addition to database RLS, `supabaseAdapter` performs redundant application-layer ownership validation:
- Obtains authenticated user session from Supabase client.
- Asserts `user_id` matches document owner before updating or deleting (`assertOwnership`).
- Validates all input documents against `ResumeDocumentSchema` via Zod before issuing SQL writes.

---

## 5. Storage Mode Resolution & Unified Adapter (`useStorageAdapter`)

The application consumes storage through a polymorphic `StorageAdapter` interface:

```typescript
export interface StorageAdapter {
  listResumes(): Promise<ResumeListItem[]>;
  loadResume(id: string): Promise<ResumeDocument | null>;
  saveResume(id: string, doc: ResumeDocument): Promise<void>;
  createResume(title?: string, templateId?: TemplateId, initialDoc?: Partial<ResumeDocument>): Promise<string>;
  deleteResume(id: string): Promise<void>;
  renameResume(id: string, newTitle: string): Promise<void>;
  duplicateResume(id: string, newTitle?: string): Promise<string>;
  getJobTarget(resumeId: string): Promise<JobTarget | null>;
  saveJobTarget(targetOrResumeId: JobTarget | string, targetIfResumeId?: JobTarget): Promise<void>;
  deleteJobTarget(resumeId: string): Promise<void>;
  exportAllData(): Promise<SoftCVBackup>;
  deleteAllData(): Promise<void>;
  resetDemoData(): Promise<void>;
}
```

The React hook `useStorageAdapter()` inspects Supabase auth state:
- **Unauthenticated / Demo Mode:** Resolves to `localAdapter` (backed by `localStorage`).
- **Authenticated Cloud Mode:** Resolves to `supabaseAdapter` (backed by Supabase Postgres).
- Switching modes leaves local data intact, giving the user full agency to migrate or keep local-first copies.

---

## 6. Local-to-Cloud Migration Pipeline (`src/lib/resume/cloud-migration.ts`)

When an existing local-first user logs into a Supabase account:
1. **Pre-flight Plan (`planLocalToCloudMigration`):** Inspects `localStorage`, validates records against Zod, excludes demo fixtures (`Priya Mehta`, `Marcus Vance`) by default, and detects title conflicts.
2. **Deterministic Deduplication:** Duplicate titles are suffixed with `(Local Import)` to prevent collision with existing cloud cartridges.
3. **Batch Insertion:** Inserts resumes and associated job targets into Supabase using authenticated `user_id`.
4. **Safety Guarantee:** Local storage is **never silently deleted or overwritten**. The user can optionally purge local copies via an explicit confirmation checkbox post-migration.

---

## 7. Portability & JSON Backup Format (`SoftCVBackup`)

Generated by `localAdapter.exportAllData()` or `supabaseAdapter.exportAllData()`:

```json
{
  "version": "1.0.0",
  "schemaVersion": 1,
  "exportedAt": "2026-10-22T01:00:00.000Z",
  "app": "SoftCV Studio",
  "storageMode": "localStorage",
  "totalResumes": 2,
  "resumes": [
    {
      "meta": {
        "id": "res-uuid-1",
        "title": "Priya Mehta — CS Graduate Demo",
        "updatedAt": "2026-10-22T01:00:00.000Z",
        "templateId": "fresher-graduate",
        "isMaster": true,
        "parentResumeId": null
      },
      "document": { ... },
      "jobTarget": { ... }
    }
  ]
}
```

---

## 8. Deletion Lifecycle & Autosave Race Prevention

1. **Delete-One (`deleteResume(id)`):**
   - Adds `id` to `tombstonedIds` in memory.
   - Filters out `id` from `softcv_resume_index`.
   - Removes `softcv_resumes_${id}` and `softcv_job_target_${id}` from `localStorage`.
2. **Delete-All (`deleteAllData()`):**
   - Iterates through `localStorage` and removes **only** keys matching the `softcv_*` prefix.
   - Unrelated site data is untouched.
   - All deleted IDs are added to `tombstonedIds`.
3. **Resurrection Guard:**
   - Any late-firing debounced `saveResume(id)` callback checks `tombstonedIds.has(id)` and throws immediately, preventing discarded resumes from reappearing on page refresh.

---

## 9. Standard JSON Resume Mapping & Portability Specification (RS-097)

Implemented in `src/lib/export/json-resume.ts` adhering to the official [JSON Resume Schema v1.0.0](https://jsonresume.org/schema/):

### 9.1 Two-Way Field Mapping

| SoftCV `ResumeDocument` Field | JSON Resume v1.0.0 Target | Mapping & Transformation Logic |
|---|---|---|
| `basics.name`, `headline` | `basics.name`, `basics.label` | Direct string assignment (max 100 / 150 chars). |
| `basics.email`, `phone`, `location` | `basics.email`, `basics.phone`, `basics.location.city` | Normalized and trimmed strings. |
| `basics.links` | `basics.profiles` + `basics.url` | Primary URL mapped to `basics.url`; additional links mapped to `profiles[]` with inferred network names (e.g. GitHub, LinkedIn). |
| `summary` | `basics.summary` | Direct markdown/text string. |
| `experience[]` | `work[]` | `employer` → `name`, `title` → `position`, `startDate` / `endDate` → `YYYY-MM` date format, `bullets[]` → `highlights[]`. |
| `education[]` | `education[]` | `institution` → `institution`, `degree` → `studyType`, `field` → `area`, `startDate` / `endDate` → `YYYY-MM`. |
| `skills[]` | `skills[]` | Category name → `name`, items → `keywords[]`. |
| `projects[]` | `projects[]` | `title` → `name`, `description` → `description`, `bullets[]` → `highlights[]`, `link` → `url`, `technologies[]` → `keywords[]`. |
| `certifications[]` | `certificates[]` | `title` → `name`, `issuer` → `issuer`, `date` → `date`. |
| `awards[]` | `awards[]` | `title` → `title`, `issuer` → `awarder`, `date` → `date`, `description` → `summary`. |
| `publications[]` | `publications[]` | `title` → `name`, `venue` → `publisher`, `date` → `releaseDate`, `description` → `summary`. |
| `languages[]` | `languages[]` | `language` → `language`, `proficiency` → `fluency`. |
| `internships[]`, `customSections[]`, `settings` | `x-softcv` extension block | SoftCV-specific collections preserved in namespaced extension block without violating JSON Resume v1.0.0 standard schema. |

### 9.2 Validation, Bounds & Security Boundaries
1. **File Size Bound:** Hard 1MB cap (`MAX_JSON_RESUME_SIZE = 1_048_576` bytes) prevents CPU/memory exhaustion during parsing.
2. **Schema Enforcement:** All incoming JSON Resume payloads are parsed into an intermediate draft and validated against canonical `ResumeDocumentSchema.safeParse()`. If validation fails, zero data is committed to storage.
3. **HTML Injection Protection:** All parsed text fields are rendered as inert React text nodes, never using `dangerouslySetInnerHTML`.
4. **Data Isolation:** Export includes only the actively selected resume cartridge. Server credentials, database identifiers, job descriptions, and other cartridge records are strictly excluded.
5. **Non-Destructive Import:** Imports always create a new cartridge via `adapter.createResume(...)`. Existing cartridges are never silently overwritten.

