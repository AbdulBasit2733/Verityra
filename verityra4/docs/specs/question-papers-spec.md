# Specification: Standalone Question Papers Management & Modernized Public/Student Library

## 1. Feature Overview
The Question Papers module provides administrative control and student-facing access to examination question papers within the Verityra platform as a **standalone, independent library** (not bound to test series).

### Core Routes:
- **Admin Management Suite (`/admin/question-papers`)**: Administrative interface to upload, view, publish, download, and delete standalone question papers with category, subject, year, marks, and PDF documents.
- **Question Papers Public & Student Library (`/question-papers` -> `http://localhost:3001/question-papers`)**: Fully modernized catalog workspace layout featuring a sticky filter sidebar (Streams, Categories, Subjects, Years), real-time search, sorting, pagination, in-browser PDF preview dialog, and 1-click downloads.
- **Question Paper Detail & Preview (`/question-papers/[id]`)**: Full document detail page with in-browser PDF preview and download capabilities.
- **Student Downloads Section (`/student/downloads`)**: Integrated downloads hub where students can access both their registered test materials and the full library of practice question papers.
- **Navigation Integration**:
  - Admin sidebar (`adminNavItems`): "Question Papers" -> `/admin/question-papers`
  - Student sidebar (`studentNavItems`): "Question Papers" -> `/question-papers`
  - Student sidebar: "Downloads" -> `/student/downloads` (includes Question Papers tab)

---

## 2. Layout Specifications for `http://localhost:3001/question-papers`

The layout of `/question-papers` is upgraded to match Verityra's high-fidelity catalog workspace architecture:

### A. Hero Header Section
- Branded gradient banner (`from-white via-[#F1F6FF] to-[#E4F0FF]`) with border `#DCE7FA`.
- Document library badge, bold typography (`text-[#071B3A]`), and descriptive subtitle.
- Live metric counters: Total Available Papers, Subjects Covered, Free Downloads.

### B. Catalog Workspace Grid Layout
- **Desktop Layout (`lg:grid-cols-[240px_minmax(0,1fr)]`)**:
  - **Sticky Left Filter Sidebar**:
    - **Examination Category / Stream**: Single-select dropdown and list buttons (All, School Education, Competitive Exams, Civil Services, State PSC, University).
    - **Subject Filter**: Filter by subject (General Studies, Mathematics, Physics, Chemistry, Law).
    - **Year Filter**: Filter by academic/exam year (2026, 2025, 2024, Earlier).
    - **Filter Summary & Reset**: Shows matching results counter and "Reset Filters" action button.
  - **Main Catalog Section**:
    - **Search & Sort Toolbar**: Full-width search input with clear (`X`) button, and sorting dropdown (Newest First, Highest Marks, Longest Duration, Title A-Z).
    - **Results Header**: Active paper count, curated badge.
    - **Paper Card Grid (`grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5`)**:
      - Card Header: Category badge, Subject chip, Year badge.
      - Card Body: Bold title, description snippet, metadata row (Max Marks with `Award` icon, Duration with `Clock` icon, File type with `FileText` icon).
      - Card Footer: "Preview" button (triggers in-browser PDF dialog) and "Download PDF" button (1-click download), plus link to detail page.
    - **Global Pagination**: Integrated pagination with items-per-page selector (6, 9, 12, 24).
- **Mobile Layout**: Responsive top search bar with collapsible filter sheet/drawer, preserving full filter capabilities without horizontal scroll.

---

## 3. Contracts & Schemas

### Database Schema (Prisma `QuestionPaper`):
```prisma
model QuestionPaper {
  id              String   @id @default(cuid())
  title           String
  description     String?  @db.Text
  category        String   // e.g. "School Education", "Competitive", "Civil Services", "State PSC", "General"
  subject         String?  // e.g. "Mathematics", "Physics", "General Studies", "Law"
  year            Int?     // e.g. 2024, 2025, 2026
  maxMarks        Float    @default(100)
  durationMinutes Int?     @default(180)
  fileUrl         String
  fileSizeBytes   Int?
  isPublished     Boolean  @default(true)
  downloadsCount  Int      @default(0)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([category])
  @@index([subject])
  @@index([isPublished])
  @@index([createdAt])
}
```

### TypeScript Data Transfer Objects (DTOs):
```typescript
export interface QuestionPaperItem {
  id: string
  title: string
  description?: string | null
  category: string
  subject?: string | null
  year?: number | null
  maxMarks: number
  durationMinutes?: number | null
  fileUrl: string
  fileSizeBytes?: number | null
  isPublished: boolean
  downloadsCount: number
  createdAt: string
}
```

---

## 4. Security & Authorization

| Route / Action | Allowed Roles | Enforcement Mechanism | Failure Response |
|---|---|---|---|
| `GET /admin/question-papers` | `ADMIN` | `requireAdmin("/admin/question-papers")` | Redirect to `/unauthorized` or `/signin` |
| `uploadQuestionPaperAction` | `ADMIN` | `getCurrentUser()?.role === Role.ADMIN` | `{ success: false, error: "Unauthorized" }` |
| `deleteQuestionPaperAction` | `ADMIN` | `getCurrentUser()?.role === Role.ADMIN` | `{ success: false, error: "Unauthorized" }` |
| `togglePublishQuestionPaperAction` | `ADMIN` | `getCurrentUser()?.role === Role.ADMIN` | `{ success: false, error: "Unauthorized" }` |
| `GET /question-papers` | Public / All Students | Open access (published papers) | None |
| `GET /question-papers/[id]` | Public / All Students | Open access (published papers) | 404 if not found or unpublished |
| `GET /student/downloads` | `STUDENT`, `ADMIN` | `requireStudent("/student/downloads")` | Redirect to `/signin` |
| `GET /api/files/download?file=question-papers/...` | Authenticated / Public | `paper.isPublished === true \|\| user.role === ADMIN` | `403 Forbidden` |

---

## 5. UI & Brand System Alignment
- **Primary Action Accent**: `#2A6AED` (Verityra royal blue action state)
- **Brand Primary**: `#145DEB`
- **Surface Neutrals**: `#FFFFFF` (Cards), `#F1F6FF` (Subtle tint background), `#DCE7FA` (Borders)
- **Typography Scale**: Space Grotesk / Inter headings (`#071B3A`), Slate muted text (`#64748B`).
- **Responsive Standard**: Desktop uses dense tables and filter toolbars; Mobile transitions to responsive touch cards and collapsible accordions.
