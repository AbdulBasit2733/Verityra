# Standalone Question Papers Module Implementation Plan

Status: Completed & Verified

## Phase 1: Database Model & Prisma Client
- [x] Add standalone `QuestionPaper` model in `verityra4/prisma/schema.prisma`.
- [x] Push schema to Supabase PostgreSQL (`prisma db push`).
- [x] Provide fallback demo fixtures in `verityra4/lib/mock-question-papers.ts` for offline/development environments.

## Phase 2: Navigation & Authorization Architecture
- [x] Add "Question Papers" item to `adminNavItems` in `verityra4/components/portal/portal-shell.tsx` (`/admin/question-papers`).
- [x] Add "Question Papers" and "Downloads" to `desktop-command-palette.tsx` (Ctrl+K).
- [x] Ensure `studentNavItems` in `verityra4/components/portal/portal-shell.tsx` links to `/question-papers` (`http://localhost:3001/question-papers`).
- [x] Update `/api/files/download/route.ts` authorization to support standalone `question-papers` file paths so any published question paper can be downloaded without enrollment blocks.

## Phase 3: Backend Server Actions & Services
- [x] Create `verityra4/actions/question-paper-actions.ts`:
  - `uploadQuestionPaperAction(formData: FormData)`: Admin-only upload with title, category, subject, year, maxMarks, durationMinutes, description, and PDF file.
  - `deleteQuestionPaperAction(id: string)`: Admin-only deletion with audit logging.
  - `togglePublishQuestionPaperAction(id: string, isPublished: boolean)`: Admin-only publication toggle.

## Phase 4: Admin Question Papers Management Suite
- [x] Create `verityra4/app/admin/question-papers/page.tsx` with server-side authentication (`requireAdmin`) and data loader.
- [x] Create `verityra4/app/admin/question-papers/loading.tsx` skeleton.
- [x] Build `verityra4/components/admin/question-papers/admin-question-papers-client.tsx`:
  - KPI Stat Cards (Total Papers, Published Papers, Total Downloads, Categories Count).
  - Search, category filter dropdown, subject filter, and sortable data table.
  - In-browser PDF preview trigger and download link.
  - Publish/Unpublish toggle.
  - Delete action with confirmation modal.
- [x] Build `verityra4/components/admin/question-papers/admin-add-question-paper-modal.tsx`:
  - Standalone form (NO test series selector required).
  - Fields: Title, Category (School, Competitive, Civil Services, State PSC, Other), Subject, Year, Max Marks, Duration (Minutes), Description, and PDF File dropzone.
- [x] Build `verityra4/components/admin/question-papers/admin-pdf-preview-modal.tsx`:
  - In-browser PDF preview modal with download and new-tab controls.

## Phase 5: Modernize Question Papers Library Layout (`http://localhost:3001/question-papers`)
- [x] Upgrade `verityra4/app/question-papers/page.tsx`:
  - Query `prisma.questionPaper.findMany({ where: { isPublished: true }, orderBy: { createdAt: "desc" } })`.
  - Fallback to rich demo items if database is empty/disconnected.
  - Modern hero banner with metrics (Available Papers, Downloads).
- [x] Upgrade `verityra4/components/question-paper-library.tsx`:
  - Adopt high-fidelity 2-column workspace layout (`lg:grid-cols-[240px_minmax(0,1fr)]`).
  - Left sticky filter sidebar with category dropdown, subject list, year filter, active counts, and reset button.
  - Mobile responsive drawer/sheet for filters.
  - Toolbar with search bar (clear button `X`) and sorting dropdown (Newest, Marks, Duration, Downloads, Title).
  - Polished Question Paper Cards with category, subject, year, marks, duration, in-browser PDF preview modal, and 1-click download.
  - Global pagination component integration.
- [x] Upgrade `verityra4/app/question-papers/[id]/page.tsx`:
  - Render standalone Question Paper details with in-browser PDF preview and download button.

## Phase 6: Student Downloads Section Update (`/student/downloads`)
- [x] Update `verityra4/app/student/downloads/page.tsx` and components to load both registered test materials and standalone practice question papers.
- [x] Add tabbed switcher: "All Resources", "Enrolled Tests", "Question Papers Library".
- [x] Provide instant preview and download directly from the downloads hub.

## Phase 7: Automated Testing & Verification
- [x] Create `verityra4/tests/question-papers.test.ts` to test standalone question paper creation schema, validation, authorization, and download guards.
- [x] Register new tests in `verityra4/tests/run-all.ts`.
- [x] Run `npm run typecheck` (PASSED, 0 errors).
- [x] Run `npm run test` (PASSED, 81 tests).
- [x] Run `npm run build` (PASSED, clean compilation).
- [x] Document QA report in `docs/qa/question-papers-verification.md` and walkthrough in brain.
