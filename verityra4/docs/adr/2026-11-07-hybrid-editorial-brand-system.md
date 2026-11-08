# ADR: Hybrid Editorial Brand System

**Status:** Accepted

## Context

The reference implementation uses a red-noir visual language, while Verityra's product rules require Electric Sapphire as the primary brand accent and demand high trust across candidate and administrator workflows.

## Alternatives

1. Full red-noir: visually close to the reference, but conflicts with the existing brand invariant and weakens semantic clarity in dense operational screens.
2. Separate marketing and portal themes: creates two brands and increases accessibility and maintenance drift.
3. Hybrid editorial system: preserves the Sapphire anchor and uses ink, paper, editorial hierarchy, and restrained crimson semantics as art direction.

## Decision

Use the hybrid editorial system. Sapphire owns primary actions and active states. Ink/slate owns structure. Paper-white owns reading surfaces. Crimson is reserved for destructive, error, and exam-warning semantics.

## Consequences

The interface can express the reference's confidence without changing product meaning. All colors must flow through semantic tokens and both themes must be tested independently.
