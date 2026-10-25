# Verityra — UI/UX Design System & Styling Specifications

> **Scope**: Visual hierarchy, 60/30/10 color theory, Dark Mode harmony, component scales, responsive breakpoints, and accessibility standards for **Verityra** (`verityra4/`).

---

## 1. Design System Philosophy

Verityra employs a modern, high-contrast **EdTech SaaS Aesthetic** engineered specifically for rigorous academic focus. The user experience is intentionally clean, authoritative, and free from gamified visual clutter.

### Core Principles
1. **The 60/30/10 Color Balance**:
   - **60% Primary Canvas**: Pure White (`#FFFFFF`) or Soft Alabaster (`#F8FAFC`) in Light Mode; Deep Obsidian Slate (`#0B1120`) in Dark Mode.
   - **30% Secondary Surfaces & Typography**: Slate Muted (`#64748B`), Soft Blue Tint (`#EFF6FF`), hairline borders (`#E2E8F0`), and dark card elevations (`#111827`, `#1E293B`).
   - **10% Brand Accent**: High-integrity Royal Blue (`#2A6AED` / Dark `#3B82F6`) reserved strictly for primary actions, active tabs, focus indicators, and key milestones.
2. **De-Carded Scannable Architecture**:
   - Portals avoid stacking heavy cards within cards (`rounded-2xl border shadow-card p-6` nesting).
   - Metrics utilize **horizontal divided KPI strips** (`divide-x divide-slate-200 border-y py-4`).
   - Sections separate cleanly with hairline `<Separator />` lines and `variant="line"` `<Tabs />`.
3. **Examination Authenticity**:
   - Visual mockups simulate physical pen-on-paper answer sheets: authentic 25mm left/right margin lines, ruled paper lines (`bg-ruled-paper`), and ink-contrast callouts.

---

## 2. Color Palette & Token Architecture

All colors are mapped to CSS variables in [`verityra4/app/globals.css`](file:///d:/Abdul%20Basit/Freelance/Verityra/verityra4/app/globals.css) and exposed through Tailwind CSS v4 `@theme inline`.

### 2.1. Light Theme Tokens (`:root`)

| Token | CSS Variable | Hex Value | Role & Usage |
|---|---|---|---|
| **Canvas Background** | `--background` | `#FFFFFF` | Viewport background, main page container. |
| **Foreground Text** | `--foreground` | `#0F172A` | Primary typography, headers, high contrast copy. |
| **Brand Accent** | `--brand` / `--primary` | `#2A6AED` | Primary buttons, brand icons, active state indicators. |
| **Brand Hover** | `--hover-accent` | `#1E55C7` | Hover state for primary buttons and interactive elements. |
| **Card Surface** | `--card` | `#FFFFFF` | Elevated surface containers, modals, table wrappers. |
| **Secondary Tint** | `--secondary` | `#EFF6FF` | Soft blue pill tags, active sidebar item backgrounds. |
| **Secondary Text** | `--secondary-foreground` | `#1E55C7` | Text on secondary tint tags and active nav links. |
| **Muted Surface** | `--muted` | `#F1F5F9` | Table header rows, disabled buttons, subtle panels. |
| **Muted Copy** | `--muted-foreground` | `#64748B` | Subtitles, date stamps, placeholder copy, table headers. |
| **Borders & Dividers** | `--border` | `#E2E8F0` | Hairline borders on cards, inputs, and table rows. |
| **Focus Rings** | `--ring` | `#2A6AED` | Accessible outline rings (`focus-visible:ring-3`). |
| **Destructive** | `--destructive` | `#DC2626` | Error dialogs, reject actions, destructive confirmations. |

### 2.2. Dark Theme Tokens (`.dark`)

| Token | CSS Variable | Hex Value | Role & Usage |
|---|---|---|---|
| **Canvas Background** | `--background` | `#0B1120` | Deep Midnight Slate canvas; eliminates blue eye-strain. |
| **Foreground Text** | `--foreground` | `#F8FAFC` | Crisp white typography with high contrast. |
| **Brand Accent** | `--brand` / `--primary` | `#3B82F6` | Luminous Royal Blue with calibrated WCAG contrast on dark surfaces. |
| **Brand Hover** | `--hover-accent` | `#2563EB` | Active/hover state on dark surfaces. |
| **Card Surface** | `--card` | `#111827` | Elevated dark surface (tables, modals, popovers). |
| **Secondary Tint** | `--secondary` | `#1E293B` | Muted dark containers and pill badges. |
| **Secondary Text** | `--secondary-foreground` | `#93C5FD` | High-contrast light blue text on secondary dark surfaces. |
| **Muted Surface** | `--muted` | `#1E293B` | Table headers, secondary interactive button states. |
| **Muted Copy** | `--muted-foreground` | `#94A3B8` | Clear, readable secondary typography on dark surfaces. |
| **Borders & Dividers** | `--border` | `#1E293B` | Hairline slate borders; subtle structure without stark contrast. |
| **Focus Rings** | `--ring` | `#3B82F6` | Glow focus rings on dark inputs. |
| **Destructive** | `--destructive` | `#EF4444` | High-visibility warning/destructive red. |

### 2.3. Semantic Status Color Harmony

| Status Meaning | Light Mode Badge | Dark Mode Badge | Text Token |
|---|---|---|---|
| **Success / Verified** | `bg-emerald-50 border-emerald-200` | `dark:bg-emerald-950/40 dark:border-emerald-800/60` | `text-emerald-700 dark:text-emerald-300` |
| **Warning / Review** | `bg-amber-50 border-amber-200` | `dark:bg-amber-950/40 dark:border-amber-800/60` | `text-amber-800 dark:text-amber-300` |
| **Error / Failed** | `bg-red-50 border-red-200` | `dark:bg-red-950/40 dark:border-red-800/60` | `text-red-700 dark:text-red-300` |
| **Informational / Quota** | `bg-[#EFF6FF] border-blue-200` | `dark:bg-blue-950/40 dark:border-blue-800/60` | `text-[#2A6AED] dark:text-blue-300` |

---

## 3. Typography & Hierarchy

Verityra uses **Poppins** (`var(--font-poppins)`) with clean geometric proportions and balanced tracking:

```css
font-family: var(--font-poppins), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
```

### Type Scale Standards

| Level | Desktop Size / Leading | Mobile Size / Leading | Weight | Usage |
|---|---|---|---|---|
| **Display H1** | `48px (3rem)` / `1.15` | `28px (1.75rem)` / `1.2` | `700` (Bold) | Landing page hero headline. |
| **Section H2** | `30px (1.875rem)` / `1.25` | `22px (1.375rem)` / `1.25` | `700` (Bold) | Section headers, major portal view titles. |
| **Subsection H3** | `20px (1.25rem)` / `1.3` | `18px (1.125rem)` / `1.3` | `700` (Bold) | Section subheadings, modal titles, table headers. |
| **Card Title / H4** | `15px (0.9375rem)` / `1.4` | `14px (0.875rem)` / `1.4` | `600` (SemiBold) | Tab titles, metric labels, item headers. |
| **Body (Default)** | `14px (0.875rem)` / `1.5` | `13px (0.8125rem)` / `1.5` | `400` (Regular) | Primary paragraphs, form inputs, table data cells. |
| **Metadata / Caption** | `12px (0.75rem)` / `1.4` | `11px (0.6875rem)` / `1.4` | `500` (Medium) | Subtitle descriptions, breadcrumbs, tags. |
| **Micro Labels** | `10px (0.625rem)` / `1.2` | `10px (0.625rem)` / `1.2` | `700` (Bold, Uppercase) | Eyebrow badges, attempt counters, table column headers. |

---

## 4. Component Scales & Specifications

### 4.1. Buttons ([`components/ui/button.tsx`](file:///d:/Abdul%20Basit/Freelance/Verityra/verityra4/components/ui/button.tsx))
- **Sizes**:
  - `default`: `h-11 px-5 rounded-xl text-sm font-semibold`
  - `lg`: `h-13 px-7 rounded-2xl text-base font-bold` (Hero CTA buttons)
  - `sm`: `h-9 px-4 rounded-lg text-xs font-semibold` (Table row actions, modal footers)
  - `xs`: `h-7 px-3 rounded-md text-xs font-medium`
  - `icon`: `size-11 rounded-xl` / `icon-sm`: `size-9 rounded-lg`
- **Variants**:
  - `default`: `bg-[#2A6AED] hover:bg-[#1E55C7] text-white shadow-xs`
  - `outline`: `border border-border bg-white dark:bg-card hover:bg-muted text-foreground shadow-xs`
  - `secondary`: `bg-[#EFF6FF] text-[#1E55C7] dark:bg-slate-800 dark:text-blue-300 font-semibold`
  - `destructive`: `bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20`
  - `ghost`: `hover:bg-muted hover:text-foreground`

### 4.2. Form Inputs & Textareas ([`components/ui/input.tsx`](file:///d:/Abdul%20Basit/Freelance/Verityra/verityra4/components/ui/input.tsx), [`components/ui/textarea.tsx`](file:///d:/Abdul%20Basit/Freelance/Verityra/verityra4/components/ui/textarea.tsx))
- **Height & Spacing**: `h-10 sm:h-11 px-3.5 rounded-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm`.
- **Focus Rings**: `focus:border-[#2A6AED] focus:ring-3 focus:ring-[#2A6AED]/20 outline-none`.
- **Disabled State**: `bg-slate-50 dark:bg-slate-950 text-slate-400 border-slate-200 cursor-not-allowed`.

### 4.3. Global DataTable ([`components/ui/data-table.tsx`](file:///d:/Abdul%20Basit/Freelance/Verityra/verityra4/components/ui/data-table.tsx))
- **Header Controls Toolbar**:
  - Live Search `<Input />` with `<Search className="h-4 w-4" />` prefix and instant client-side filtering across designated searchable columns.
  - Faceted `<DropdownMenu />` filters for status/category/allowance.
  - Interactive `<DateFilterPicker />` with presets (`Today`, `Last 7 Days`, `Last 30 Days`) and full calendar grid.
- **Table Cells**:
  - Headers: `h-11 px-4 text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50/70 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800`.
  - Sortable Headers: Column sort button with tri-state cycle (`asc` $\rightarrow$ `desc` $\rightarrow$ `reset`) and sort direction indicators.
  - Body Cells: `py-3.5 px-4 text-xs sm:text-sm text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors`.
- **Pagination ([`components/ui/pagination.tsx`](file:///d:/Abdul%20Basit/Freelance/Verityra/verityra4/components/ui/pagination.tsx))**:
  - Integrated `<GlobalPagination />` bar displaying `Showing X to Y of Z entries`.
  - Dynamic rows-per-page `<Select />` (`5 / 10 / 20 / 50`).
  - First, Previous, Next, Last navigation buttons.

### 4.4. Dialogs, Popovers & Confirmations
- **Promise-Based Confirmation (`useConfirm`)**:
  - Modal with title, body description, badge pill, and `Confirm` / `Cancel` action buttons.
  - Variants: `default` (blue), `warning` (amber), `destructive` (red).
- **Error Dialog (`useGlobalError`)**:
  - Error code badge (e.g. `ERR_ATTEMPT_LIMIT`), user-facing message, copy diagnostic JSON button, and automatic `Sonner` error toast synchronization.
- **Toast Notifications (`Sonner`)**:
  - Mounted via `<Toaster />` in root layout. Theme-aware `bg-popover text-popover-foreground border-border`.

### 4.5. Theme Toggle (`<ThemeToggle />`)
- **Variant `icon`**:
  - Mounted in desktop topbars.
  - Accessible `<DropdownMenu />` offering `Light Mode`, `Dark Mode`, and `System Default` options.
  - Smooth rotated morphing animation between `<Sun />` and `<Moon />` icons.
- **Variant `inline`**:
  - Segmented 3-option pill bar (`Light | Dark | Auto`) designed for mobile drawers.
- **Hot-Key**: Pressing `d` outside text inputs toggles theme instantly via [`theme-provider.tsx`](file:///d:/Abdul%20Basit/Freelance/Verityra/verityra4/components/theme-provider.tsx).

### 4.6. Payments & Financials Console (`/admin/payments`)
- **Header & 4-Metric KPI Strip**:
  - Clean page header (`Payments & Financials`) with subtitle and quick refresh button.
  - Horizontal divided metric strip (`KpiStatCard`):
    - `Net Collected Revenue` (₹ formatted, green trend indicator).
    - `Completed Transactions` (Success count with percentage rate).
    - `7-Day Refund Claims` (Total refunded count & ₹ sum).
    - `Pending Inquiries` (Transactions needing bank-side verification).
- **Multi-Tier Filtering Toolbar**:
  - Full-text search across Candidate Name, Email, Razorpay Order ID, and Payment ID.
  - Status faceted filter (`All`, `COMPLETED`, `REFUNDED`, `PENDING`, `FAILED`).
  - Eligibility filter (`Within 7 Days`, `Expired (> 7 Days)`).
  - Date Filter Picker with presets (`Today`, `Last 7 Days`, `Last 30 Days`).
- **Data Rows & Copyable Badges**:
  - `Sr.` sequential 1-indexed numbering with global pagination offset.
  - Monospace clickable badges for `razorpayOrderId` and `razorpayPaymentId` with one-click clipboard copying.
  - Dynamic status pills with 60/30/10 semantic styling (`emerald` for completed, `amber` for refunded, `slate` for pending).
- **Refund & Ledger Modals**:
  - **`AdminRefundDialog`**: Enforces strict 7-day window. If attempts have been consumed (`attemptsUsed > 0`), renders an amber alert callout requiring explicit candidate forfeiture acknowledgment before triggering the refund.
  - **`AdminPaymentLedgerSheet`**: Right-side drawer revealing immutable gateway webhooks, actor identification, and expandable JSON diagnostic payloads.

---

## 5. Responsive Grid & Breakpoint Standards

```
320px         375px         425px           768px           1024px         1280px+
  |-------------|-------------|---------------|---------------|--------------|
  Mobile S    Mobile M      Mobile L       Tablet (md)     Desktop (lg)    Wide (xl)
```

| Breakpoint | Target Devices | Layout Rules & Behavior |
|---|---|---|
| `< 375px` (Mobile S) | iPhone SE, smaller screens | Single column; compact `text-xs`; minimal padding `px-3`; stacked metric tiles; horizontal table scrolling. |
| `375px - 767px` (Mobile M/L) | Modern smartphones | Single column; `gap-4`; full-width buttons; hamburger navigation; drawer width `w-[270px]`. |
| `768px - 1023px` (Tablet) | iPad, tablets | 2-column grids for test catalogs; horizontal divided KPI strips; topbar hamburger menu. |
| `1024px+` (Desktop) | Laptops & monitors | **Fixed left sidebar (`w-64 fixed inset-y-0`)**; main content offset with `lg:pl-64`; 3-column catalogs; zero hamburger menu. |
| `1280px+` (Wide) | Desktops & widescreen | Max-width content constraint (`max-w-7xl mx-auto px-8`); expanded tables with full rubric details. |

---

## 6. Accessibility & WCAG Standards

1. **Color Contrast**: All text elements adhere to WCAG AA guidelines ($4.5:1$ contrast ratio for body text, $3:1$ for large text and interactive components).
2. **Keyboard Navigation**:
   - Every interactive element (buttons, tabs, table sort headers, dropdowns) includes visible focus rings: `focus-visible:ring-3 focus-visible:ring-ring/25 focus-visible:outline-none`.
   - Modals and slide-over drawers trap focus and support closing on `Escape`.
   - Command Palette: `Ctrl+K` / `Cmd+K` for global navigation (desktop only).
   - Sidebar Toggle: `Ctrl+B` to collapse/expand sidebar (desktop only).
3. **Screen Reader Semantics**:
   - Icons accompanied by accessible text or `aria-label`.
   - Buttons use native `<button>` or `@base-ui/react/button` primitives with `type="button"` or `type="submit"`.
4. **Touch Targets** (Mobile):
   - All interactive elements meet minimum 44px height requirement for touch accessibility.
   - Bottom navigation tabs: 56px minimum height with adequate padding.

---

## 7. New Responsive Components & Patterns (2025 Redesign)

### 7.1. KPI Metric Strip (`components/shared/kpi-metric-strip.tsx`)

**Purpose**: Replaces heavy card-based metrics with flat, horizontally divided strips for better information density and scannable layouts.

**Visual Pattern**:
- No rounded corners (flat edge-to-edge)
- Vertical hairline dividers (`divide-x divide-slate-200 dark:divide-slate-800`)
- Top and bottom borders only (`border-y`)
- 2-column grid on mobile, 4-column on desktop

**Usage Example**:
```tsx
<KpiMetricStrip columns={4}>
  <KpiMetric 
    label="Total Registered" 
    value="47" 
    icon={Users} 
    variant="blue" 
  />
  <KpiMetric 
    label="Attempts Used" 
    value="89" 
    icon={FileCheck2} 
    variant="indigo" 
  />
  <KpiMetric 
    label="Attempts Remaining" 
    value="52" 
    icon={Layers} 
    variant="amber" 
  />
  <KpiMetric 
    label="Avg Score" 
    value="73.2%" 
    icon={Award} 
    variant="emerald" 
  />
</KpiMetricStrip>
```

**Design Specifications**:
- Background: `bg-white dark:bg-slate-900`
- Border: `border-y border-slate-200/80 dark:border-slate-800`
- Dividers: `divide-x divide-slate-200/80 dark:divide-slate-800`
- Grid: `grid-cols-2 lg:grid-cols-4` (responsive)
- Padding: `px-4 py-3` per metric cell

**Color Variants**:
| Variant | Icon Background (Light) | Icon Background (Dark) | Icon Color |
|---------|------------------------|----------------------|------------|
| `blue` | `bg-blue-100` | `dark:bg-blue-950` | `text-[#2A6AED] dark:text-blue-400` |
| `indigo` | `bg-indigo-100` | `dark:bg-indigo-950` | `text-indigo-600 dark:text-indigo-400` |
| `emerald` | `bg-emerald-100` | `dark:bg-emerald-950` | `text-emerald-600 dark:text-emerald-400` |
| `amber` | `bg-amber-100` | `dark:bg-amber-950` | `text-amber-600 dark:text-amber-400` |

---

### 7.2. Attempt Progress Tracker (`components/shared/attempt-progress-tracker.tsx`)

**Purpose**: Dynamically renders attempt progression nodes based on `maxAttempts` (not hardcoded to 3). Supports admin-granted extra attempts beyond standard 3-attempt guarantee.

**Visual States**:
- **Completed**: Filled dot with checkmark (`CheckCircle2` icon, emerald-600)
- **Available/Current**: Empty circle (`Circle` icon, Royal Blue)
- **Locked**: Greyed circle with lock icon (`Lock` icon, slate-400)

**Usage Example**:
```tsx
<AttemptProgressTracker
  attemptsUsed={2}
  maxAttempts={4}
  submissions={[
    { attemptNumber: 1, status: "COMPLETED" },
    { attemptNumber: 2, status: "COMPLETED" }
  ]}
/>
```

**Design Specifications**:
- Node size: `h-8 w-8` circular containers
- Connector line: `h-0.5 min-w-[16px]` horizontal line
- Label: `text-[10px] font-bold uppercase` beneath each node
- Extra attempts: Display "(Extra)" suffix for attempts > 3

**Compact Variant**:
```tsx
<AttemptProgressTrackerCompact
  attemptsUsed={2}
  maxAttempts={3}
  submissions={submissions}
/>
```
Displays: "2 done • 1 left" inline format for mobile or tight spaces.

---

### 7.3. Mobile Bottom Navigation (`components/mobile/mobile-bottom-nav.tsx`)

**Purpose**: Fixed bottom navigation bar for student portal on mobile devices only (< 1024px).

**Navigation Tabs** (4 primary):
1. **Dashboard** → `/student/dashboard`
2. **Tests** → `/tests`
3. **Leaderboard** → `/leaderboard`
4. **Profile** → `/student/profile`

**Design Specifications**:
- Position: `fixed bottom-0 left-0 right-0 z-50`
- Background: `bg-white/95 dark:bg-slate-900/95 backdrop-blur-md`
- Border: `border-t border-slate-200 dark:border-slate-800`
- Safe Area: `paddingBottom: env(safe-area-inset-bottom, 0px)` for iPhone notch
- Touch targets: `min-h-[56px]` for accessibility
- Active state: Royal Blue fill (`bg-[#2A6AED]`) with white icon/text
- Inactive state: `text-slate-600 dark:text-slate-400`

**Visibility Rules**:
- Only visible on mobile (`< 1024px`)
- Only shown for student role (not admin)
- Only on student pages (`/student/*`, `/tests`, `/leaderboard`)

**Spacer**: Includes `h-20` spacer div to prevent content from being hidden behind fixed nav.

---

### 7.4. Desktop Command Palette (`components/desktop/desktop-command-palette.tsx`)

**Purpose**: Global keyboard-driven navigation with fuzzy search for rapid jumps across the platform.

**Keyboard Shortcut**: `Ctrl+K` (Windows/Linux) or `Cmd+K` (Mac)

**Command Categories**:

**Admin Commands** (7 routes):
- Navigation: Overview, Test Series, Submissions, Students, Payments, Profile
- Quick Actions: Create New Test Series

**Student Commands** (4 routes):
- Navigation: Dashboard, Profile, Explore Test Catalog, Live Leaderboard

**Design Specifications**:
- Modal: Centered dialog on desktop, full-screen on mobile
- Search input: `h-12` with `Search` icon prefix
- Results: Grouped by category with separators
- Each result: Icon (9×9 rounded container) + Label + Keywords
- Footer: Keyboard hints (`↵ to select`, `ESC to close`)
- Max height: `max-h-[400px]` with scroll

**Implementation**:
- Uses `cmdk` library (Command primitive)
- Fuzzy matching on label + keywords
- Keyboard navigation with arrow keys
- Auto-closes after selection

---

### 7.5. Collapsible Sidebar (`components/portal-shell.tsx`)

**Purpose**: Desktop sidebar that toggles between full-width (w-64) and icon-rail (w-16) modes for space efficiency.

**Keyboard Shortcut**: `Ctrl+B` to toggle

**States**:
1. **Expanded** (default): `w-64` with full labels
   - Brand logo + text visible
   - Navigation items with icons + labels
   - Footer with collapse button
   
2. **Collapsed**: `w-16` icon-rail
   - Icon-only navigation
   - Tooltip hints on hover
   - Reduced brand mark (icon only)

**Design Specifications**:
- Transition: `transition-all duration-300 ease-in-out`
- Position: `fixed inset-y-0 left-0` (desktop only)
- Main content padding adjusts: `lg:pl-64` → `lg:pl-16`
- Preference persistence: `localStorage.getItem("verityra-sidebar-collapsed")`

**Tooltip Integration**:
- Collapsed state shows tooltips on navigation item hover
- Delay: 200ms
- Position: Right-aligned

---

### 7.6. Adaptive Dialog Pattern (`components/shared/adaptive-dialog.tsx`)

**Purpose**: Auto-adapts between Desktop Dialog (centered modal) and Mobile Drawer (bottom sheet) based on viewport size.

**Behavior**:
- **Desktop** (≥ 1024px): Renders Radix `Dialog` (centered modal with backdrop)
- **Mobile** (< 1024px): Renders Vaul `Drawer` (bottom sheet with swipe-to-dismiss)

**Usage Example**:
```tsx
<AdaptiveDialog open={open} onOpenChange={setOpen}>
  <AdaptiveDialogContent>
    <AdaptiveDialogHeader>
      <AdaptiveDialogTitle>Refund Payment</AdaptiveDialogTitle>
      <AdaptiveDialogDescription>
        Enter refund reason and amount
      </AdaptiveDialogDescription>
    </AdaptiveDialogHeader>
    
    {/* Dialog content */}
    
    <AdaptiveDialogFooter>
      <AdaptiveDialogClose>Cancel</AdaptiveDialogClose>
      <Button>Confirm</Button>
    </AdaptiveDialogFooter>
  </AdaptiveDialogContent>
</AdaptiveDialog>
```

**Components**:
- `AdaptiveDialog` (root wrapper)
- `AdaptiveDialogTrigger`
- `AdaptiveDialogContent`
- `AdaptiveDialogHeader` / `AdaptiveDialogFooter`
- `AdaptiveDialogTitle` / `AdaptiveDialogDescription`
- `AdaptiveDialogClose`

**Design Specifications**:
- Mobile drawer: Fixed to bottom with rounded top corners (`rounded-t-xl`)
- Desktop dialog: Centered with max-width constraint
- Both: Backdrop blur with opacity transition

---

### 7.7. Responsive Hooks (`hooks/use-media-query.ts`)

**Purpose**: SSR-safe React hooks for breakpoint detection and responsive UI logic.

**Exported Hooks**:

```tsx
// Core hook - accepts any CSS media query
const matches = useMediaQuery('(min-width: 768px)')

// Convenience presets
const isMobile = useIsMobile()      // < 1024px
const isTablet = useIsTablet()      // 768px - 1023px
const isDesktop = useIsDesktop()    // ≥ 1024px

// Granular breakpoint detection
const breakpoint = useBreakpoint()  // 'mobile' | 'tablet' | 'desktop'
```

**SSR Safety**:
- Returns `false` during SSR (prevents hydration mismatches)
- Uses `window.matchMedia` after mount
- Includes `useMounted()` helper for conditional rendering

**Usage Pattern**:
```tsx
export function ResponsiveComponent() {
  const isMobile = useIsMobile()
  
  if (isMobile) {
    return <MobileBottomNav />
  }
  
  return <DesktopSidebar />
}
```

**Breakpoint Definitions**:
| Preset | Query | Use Case |
|--------|-------|----------|
| `useIsMobile()` | `(max-width: 1023px)` | Mobile/tablet layouts, bottom nav visibility |
| `useIsTablet()` | `(min-width: 768px) and (max-width: 1023px)` | Tablet-specific optimizations |
| `useIsDesktop()` | `(min-width: 1024px)` | Desktop sidebar, command palette, wide layouts |

---

### 7.8. PDF Preview & Legibility Checklist (`components/submission-upload-form.tsx`)

**Purpose**: Client-side file preview and acknowledgment before submission to reduce illegible uploads.

**Features**:
1. **Image Preview**: Renders thumbnail for JPG/PNG uploads via `URL.createObjectURL()`
2. **PDF Metadata**: Shows file size, estimated page count (~150KB/page heuristic)
3. **Legibility Checklist**:
   - ✓ All pages upright (not rotated)
   - ✓ Handwriting clear and legible
   - ✓ All pages included
   - ⚠ Warning: Illegible submissions may receive reduced scores
4. **Acknowledgment Checkbox**: Required before "Confirm & Submit" button enables

**Design Specifications**:
- Preview container: `rounded-xl border bg-slate-50 dark:bg-slate-900 p-4`
- Image preview: `max-h-64 object-contain` with border
- Checklist items: `CheckCircle2` icon (emerald) for requirements, `AlertCircle` (amber) for warning
- Submit button: Disabled until checkbox checked

---

### 7.9. URL State Management (Student Workspace)

**Purpose**: Persist attempt selection in URL for shareable workspace links.

**Implementation**:
```tsx
const searchParams = useSearchParams()
const attemptNumber = parseInt(searchParams.get('attempt') || '1')

// Update URL without page reload
function setAttempt(num: number) {
  const params = new URLSearchParams(searchParams)
  params.set('attempt', num.toString())
  router.replace(`${pathname}?${params.toString()}`, { scroll: false })
}
```

**URL Format**: `/student/tests/upsc-gs-1?attempt=2`

**Benefits**:
- Shareable workspace links (e.g., "Check my Attempt 2 score")
- Refreshing page preserves selected attempt
- Browser back/forward navigation works correctly

**SSR Safety**: Component wrapped in `<Suspense>` to handle `useSearchParams()` hydration

---

## 8. Testing & Quality Assurance

### 8.1. Unit Testing
- **Framework**: Custom `tsx` test runner
- **Coverage**: 45/45 tests passing (Authentication, Test Series, Submissions, Payments, Evaluation Engine)
- **Command**: `pnpm test` or `pnpm test:unit`

### 8.2. E2E Testing (Playwright)
- **Framework**: Playwright v1.64.1
- **Browsers**: Chromium, WebKit
- **Viewports**: Desktop Chrome (1280×800), iPhone SE (375×667), iPhone 14 (390×844)
- **Commands**:
  - `pnpm test:e2e` - Run all E2E tests
  - `pnpm test:e2e:ui` - Open Playwright UI mode
  - `pnpm test:e2e:headed` - Run tests with visible browser
  - `pnpm test:e2e:debug` - Debug mode with step-through

**Test Suites**:
1. **auth.spec.ts**: Sign-up, sign-in, RBAC, password reset
2. **student-flow.spec.ts**: Complete student journey (catalog → enroll → workspace → upload → results)
3. **admin-flow.spec.ts**: Admin workflows (submissions, score review, test series management)
4. **responsive.spec.ts**: Cross-device testing (mobile bottom nav, adaptive dialogs, KPI responsiveness)

---

## 9. Migration Guide: Cards → Flat KPI Strips

**Before** (Card-based metrics):
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <KpiStatCard label="Total Students" value="47" icon={Users} />
  <KpiStatCard label="Enrollments" value="89" icon={BookOpen} />
  <KpiStatCard label="Pending" value="12" icon={AlertTriangle} />
  <KpiStatCard label="Revenue" value="₹45,600" icon={CreditCard} />
</div>
```

**After** (Flat divided strip):
```tsx
<KpiMetricStrip columns={4}>
  <KpiMetric label="Total Students" value="47" icon={Users} variant="blue" />
  <KpiMetric label="Enrollments" value="89" icon={BookOpen} variant="indigo" />
  <KpiMetric label="Pending" value="12" icon={AlertTriangle} variant="amber" />
  <KpiMetric label="Revenue" value="₹45,600" icon={CreditCard} variant="emerald" />
</KpiMetricStrip>
```

**Benefits**:
- 40% more vertical space for content
- Faster scan pattern (horizontal eye movement)
- Cleaner visual hierarchy
- Better dark mode harmony (no card shadows)

---
