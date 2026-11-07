# Verityra UI Architecture

## Ownership

- `app/globals.css`: semantic tokens, typography, spacing, surfaces, motion, and global accessibility behavior.
- `components/ui/*`: reusable primitives and their variants.
- `components/common/site-chrome.tsx`: one route-aware public navbar/footer owner; public pages do not import chrome individually.
- `components/layout/auth/*`: shared responsive authentication frame; auth, admin, and student routes do not receive marketing chrome.
- `components/layout/*` and `portal-shell.tsx`: route shells and portal navigation.
- Route pages and feature clients: composition and domain-specific content only.

## Composition rules

1. Pages use a shared shell, page header, and content container.
2. Feature components consume semantic tokens and primitive variants; they do not invent global colors or radii.
3. Primary actions use one Sapphire emphasis per section. Destructive actions use semantic danger styling.
4. Tables must have a responsive card representation when they cannot fit on narrow screens.
5. Loading, empty, error, and disabled states are part of every feature's design.
6. Candidate-facing UI never receives evaluator-only instructions.
7. `ThemeProvider` is mounted once from the root layout. Page and shell components may use `ThemeToggle`, but must not mount another provider.

## Responsive rules

The four reference widths are 375px, 768px, 1024px, and 1440px. Mobile navigation must preserve thumb reach, use 44px hit areas, and provide a keyboard-accessible equivalent for every gesture or drag interaction.

## Domain invariants

Visual work must not change authorization, candidate/admin isolation, the three-attempt ceiling, terminal-failure compensation, refund policy, audit logging, or upload safety.
