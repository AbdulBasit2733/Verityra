# QA Verification Report: Hallmark CSS Adjustment & De-Carding Pass

**Date:** 2026-11-19  
**Scope:** System-wide CSS token clamping, elevation (`shadow <= sm`), corner radius (`rounded-md` / `rounded-sm` only), `rounded-full` restriction, de-carding (`FAIL 4` nested-card elimination & hairline dividers), and Hallmark Craft Gate cleanup across `verityra4/app` and `verityra4/components`.

---

## 1. Design Constraints Applied

1. **Elevation Ceiling (`shadow <= sm`):**
   - Replaced all `shadow-md`, `shadow-lg`, `shadow-xl`, `shadow-2xl`, `shadow-card`, `shadow-card-hover`, and custom bracketed shadows across components with `shadow-none`, `shadow-2xs`, `shadow-xs`, or `shadow-sm`.
   - Removed legacy `.shadow-card` and `.shadow-card-hover` utilities from [globals.css](file:///d:/Abdul%20Basit/Freelance/Verityra/verityra4/app/globals.css) and capped custom tokens (`--shadow-panel`, `.dropdown-shadow`, `.shadow-edtech`, `.shadow-mockup`) at `<= 0 1px 2px 0`.

2. **Border Radius (`rounded-md` & `rounded-sm` Only):**
   - Clamped radius tokens in `@theme inline` and `:root` inside [globals.css](file:///d:/Abdul%20Basit/Freelance/Verityra/verityra4/app/globals.css) to `0.25rem` / `0.375rem`.
   - Replaced all `rounded-lg`, `rounded-xl`, `rounded-2xl`, `rounded-3xl`, directional variants (`> md`), and bracketed radii (except `rounded-[inherit]` on `ScrollAreaPrimitive.Viewport` in [scroll-area.tsx](file:///d:/Abdul%20Basit/Freelance/Verityra/verityra4/components/ui/scroll-area.tsx#L17)) with `rounded-sm` (small badges, tags, serial chips, small icons) or `rounded-md` (inputs, buttons, dialogs, panels, cards).

3. **`rounded-full` Policy:**
   - Converted pill badges, status tags, filter tabs, and count chips to `rounded-sm` or `rounded-md`.
   - Retained `rounded-full` strictly on circular avatars (`avatar.tsx`, leaderboard initials avatars, portal avatar triggers), status/legend/ping dots (`h-2`, `h-2.5`, `h-3.5`), progress tracks/bars/scroll thumbs/drag handles, skeleton circular/bar shapes, and decorative background rings.

4. **De-Carding & Hallmark Gates (`FAIL 4`, `10a`, `19`, `26a`, `27`, `29`, `34`, `54`, `63`, `67`):**
   - Eliminated card-inside-card nesting (`bg-card` inside `bg-card` / `DataTable` outer surfaces) by switching `renderCard` rows in admin & student tables to `bg-background` and flattening nested summary boxes into hairline `border-t` / `border-y` strips.
   - De-carded boxed feature grids in [institute-highlights-section.tsx](file:///d:/Abdul%20Basit/Freelance/Verityra/verityra4/components/landing/institute-highlights-section.tsx), [admin-profile-client.tsx](file:///d:/Abdul%20Basit/Freelance/Verityra/verityra4/components/admin/profile/admin-profile-client.tsx), [student-profile-client.tsx](file:///d:/Abdul%20Basit/Freelance/Verityra/verityra4/components/student/profile/student-profile-client.tsx), and [student-evaluation-detail-client.tsx](file:///d:/Abdul%20Basit/Freelance/Verityra/verityra4/components/student/evaluations/student-evaluation-detail-client.tsx).
   - Fixed mobile topbar button nesting (`bg-background`), `:focus-visible` states, and `motion-safe:`/`motion-reduce:` variants in [portal-mobile-layout.tsx](file:///d:/Abdul%20Basit/Freelance/Verityra/verityra4/components/portal/mobile/portal-mobile-layout.tsx).
   - Replaced width/height CSS transitions with GPU `transform: scaleX(...)` (`motion-safe:transition-transform motion-reduce:transition-none`) in [progress.tsx](file:///d:/Abdul%20Basit/Freelance/Verityra/verityra4/components/ui/progress.tsx), [submission-status-badge.tsx](file:///d:/Abdul%20Basit/Freelance/Verityra/verityra4/components/student/shared/submission-status-badge.tsx), [submission-upload-form.tsx](file:///d:/Abdul%20Basit/Freelance/Verityra/verityra4/components/student/workspace/submission-upload-form.tsx), and [exam-workspace-timer.tsx](file:///d:/Abdul%20Basit/Freelance/Verityra/verityra4/components/student/workspace/exam-workspace-timer.tsx), and `motion-safe:transition-opacity` in [accordion.tsx](file:///d:/Abdul%20Basit/Freelance/Verityra/verityra4/components/ui/accordion.tsx).
   - Removed all `transition-all`, `backdrop-blur*`, and `tracking-(wider|widest)` utilities across `verityra4/app` and `verityra4/components`.

---

## 2. Automated Verification Results

| Check | Command | Outcome |
| --- | --- | --- |
| Shadows `> sm` | `git grep -n -E "shadow-(md\|lg\|xl\|2xl\|card\|\[)" -- verityra4/app verityra4/components` | `EXIT:1` (**0 matches**) |
| Rounded `> md` | `git grep -n -E "rounded-(t-\|b-\|l-\|r-\|tl-\|tr-\|bl-\|br-)?(lg\|xl\|2xl\|3xl\|\[)" -- verityra4/app verityra4/components` | Only `scroll-area.tsx:17` (`rounded-[inherit]`) |
| `rounded-full` Exceptions | `git grep -n "rounded-full" -- verityra4/app verityra4/components` | **All remaining matches verified** as circular avatars, status/ping dots, progress/scroll bars/thumbs, drawer handle, skeletons, or decorative rings |
| Motion / Blur / Tracking Gates | `git grep -n -E "transition-all\|backdrop-blur\|tracking-(wider\|widest)" -- verityra4/app verityra4/components` | `EXIT:1` (**0 matches**) |
| Hallmark `sloplint` (Editorial) | `node sloplint.mjs verityra4/app/globals.css verityra4/app/page.tsx verityra4/components/landing verityra4/components/common --genre editorial --scope page` (filtered non-Gate 48/74) | **0 non-Gate-48 `FAIL` findings** (clean on `4`, `10a`, `19`, `54`, `63`, `67`) |
| Hallmark `sloplint` (Modern Minimal) | `node sloplint.mjs verityra4/components/ui verityra4/components/portal --genre modern-minimal --scope app` (filtered non-Gate 48/74) | **0 non-Gate-48 `FAIL` findings** (clean on `4`, `10a`, `19`, `26a`, `27`) |
| Unit & Domain Tests | `cd verityra4; pnpm test` | **117 passed, 0 failed** across 12 suites (`91ms`, `TEST_EXIT:0`) |
| TypeScript Check | `cd verityra4; npm run typecheck` | Passed (`TSC_EXIT:0`) |
| Next.js Production Build | `cd verityra4; pnpm run build` | Passed (`Compiled successfully in 6.2s`, `21/21` static pages generated in `20.5s`, `BUILD_EXIT:0`) |
| Git Whitespace Check | `git diff --check` | Passed (`DIFF_CHECK_EXIT:0`) |
