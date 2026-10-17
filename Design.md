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
3. **Screen Reader Semantics**:
   - Icons accompanied by accessible text or `aria-label`.
   - Buttons use native `<button>` or `@base-ui/react/button` primitives with `type="button"` or `type="submit"`.
