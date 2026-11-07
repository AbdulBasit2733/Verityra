# Verityra UI Redesign Specification

## Executive summary

Verityra uses a human-crafted hybrid editorial interface: Electric Sapphire (`#2A6AED`) remains the brand accent while deep ink surfaces, paper-inspired surfaces, restrained crimson semantics, and deliberate motion provide the red-noir reference's visual confidence.

The redesign is visual and interaction-focused. Existing authorization, payment, evaluation, upload, audit, and three-attempt behavior must remain unchanged.

## User stories

- A candidate can immediately understand what to do next, how many attempts remain, and what a submission state means.
- An administrator can scan operational risk, review queues, payment state, and audit history without hunting through decorative cards.
- A visitor can understand the physical practice workflow and enroll without unsupported claims or public exposure of evaluator-only instructions.
- Every user can navigate with keyboard, touch, reduced motion, and light or dark theme enabled.

## Design tokens

| Role           | Light     | Dark      |
| -------------- | --------- | --------- |
| Canvas         | `#F8FAFC` | `#090D16` |
| Surface        | `#FFFFFF` | `#111827` |
| Primary text   | `#0F172A` | `#F8FAFC` |
| Secondary text | `#334155` | `#CBD5E1` |
| Border         | `#CBD5E1` | `#26354A` |
| Brand          | `#2A6AED` | `#3B82F6` |
| Brand hover    | `#1E55C7` | `#2563EB` |
| Warning/score  | `#B45309` | `#F59E0B` |
| Destructive    | `#B42318` | `#F87171` |

Typography uses Plus Jakarta Sans for headings and UI text, with JetBrains Mono for identifiers and audit metadata. The spacing rhythm is based on 4px and 8px increments. Controls use 36px compact, 44px default, and 48–52px large heights; icon controls retain a minimum 44px hit area.

## Screen hierarchy

- Public: narrative hook → authentic workflow → proof/trust → enrollment action.
- Authentication: brand/trust context → labeled form → recovery/help action.
- Student: next action → attempt/progress context → enrolled work → history.
- Admin: governance metrics → prioritized queue → audit/financial detail.

### Landing page composition

- Hero → handwritten preparation workflow → exam paths → candidate progress/trust → footer.
- Each content section is a component under `components/landing/` and uses the light Sapphire palette regardless of the application theme toggle.
- Decorative geometry is CSS-only and aria-hidden; key actions retain `/tests`, `#how-it-works`, and `/signup` destinations.

### Shared public and authentication shells

- `SiteChrome` owns public navigation and footer and renders them once around marketing routes.
- Authentication/recovery/access-state routes use their own shared responsive auth frames and never receive marketing chrome.
- The root layout owns the sole `ThemeProvider`; auth shells reuse the global `ThemeToggle` and semantic theme tokens.

### Role-based feature ownership

- `components/admin/<feature>` contains governance-only interface modules for overview, payments, profile, students, submissions, and test series.
- `components/student/<feature>` contains candidate modules for dashboard, profile, purchases, tests, and workspace.
- `components/portal` owns authenticated shell structure shared by both roles. Desktop and mobile folders are used only because their navigation markup is intentionally different.
- This organization does not alter server actions, route authorization, client payloads, or UI behavior.

## Interaction and accessibility

- All interactive elements expose visible focus and non-color state cues.
- Errors appear next to the relevant field and multi-error forms provide an error summary.
- Empty states explain what is missing and provide a next action.
- Reduced motion disables decorative animation and preserves final readable content.
- Responsive layouts are explicitly checked at 375px, 768px, 1024px, and 1440px.
- Public marketing must not mention AI/automated grading or expose `privateEvaluationInstructions`.

## Edge states

Long names and titles truncate only where a tooltip or expanded view exists. Tables provide responsive card alternatives. Upload, evaluation, payment, expired-session, filtered-empty, and permission-denied states retain the same domain semantics as the current implementation.
