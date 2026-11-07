# Landing Page Component Design

## Summary

The public landing page is composed from reusable sections in `components/landing/` and uses the light Sapphire treatment even when the rest of the app is in dark mode.

## Page hierarchy

1. Hero: explain handwritten exam practice, show the primary `/tests` action, and link to the workflow section.
2. Preparation: explain download, handwritten practice, and feedback in three steps.
3. Exam paths: give UPSC, State PCS, and Judicial Services visitors a direct route to the existing test catalog.
4. Progress: explain candidate workspace privacy, progress, and the attempt policy, with a signup action.
5. Footer: light surface with platform, candidate, and support links.

## Visual system

- Light canvas and paper surfaces with navy text and Electric Sapphire emphasis.
- Use the canonical `--surface-*`, `--ink-*`, `--line-*`, and `--brand-sapphire*` tokens where available.
- Align the hero, exam strip, navbar, and content sections to the shared `max-w-7xl` container and `px-5 / sm:px-8 / lg:px-10` gutters.
- CSS-only rings, circles, and rounded geometric shapes add depth without additional raster assets.
- Keep body copy readable, actions at least 44px high, and decorative shapes hidden from assistive technology.
- Sections reflow from one column on phones to three-card grids on desktop; the hero image is reserved for desktop widths.

## Behavior and constraints

- Preserve existing navigation destinations and enrollment flow.
- Public marketing must not mention AI or expose private evaluator instructions.
- Exam path cards link to `/tests`; catalog data remains authoritative for available offerings.
- No backend, API, authorization, payment, or attempt-limit behavior changes.
