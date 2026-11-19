# Landing Page Component Design

## Summary

The public landing page is composed from reusable sections in `components/landing/` and uses the light Sapphire treatment even when the rest of the app is in dark mode.

## Page hierarchy

1. Hero: position **Izone** as **I Zone Coaching Classes'** online portal for free & paid test series and question papers across **Jr. KG–XII (CBSE, ICSE, State Board)**, **NEET-UG**, **JEE**, **Olympiads**, **NTSE**, **UGC NET**, and **English Grammar**, with primary actions to `/tests` and `/question-papers`.
2. Preparation: explain choosing a free/paid test series or paper, writing under exam timing, and improving via rubric feedback and doubt-clearing in three steps.
3. Exam paths: showcase School Boards (Jr. KG–XII & Foundation VI–X), JEE & NEET-UG, and Olympiads / NTSE / UGC NET & English Grammar cards linking to `/tests` and `/question-papers`. (Never include UPSC, State PCS, Judicial Services, or government exam paths.)
4. Institute highlights: present I Zone Coaching Classes' Chhatrapati Sambhajinagar campus details (`4.8★` rating, small batch sizes, study materials & doubt clearing, accessibility features, Central Naka Rd address, phone `+91 98604 47370`, Mon–Sat & Sunday hours, Justdial & I Zone Training Academy links).
5. Progress: explain candidate workspace privacy, 3-attempt progression, and signup action.
6. Footer: light surface with institute bio, clickable phone/location, platform/candidate links, and copyright (`I Zone Coaching Classes`).

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
