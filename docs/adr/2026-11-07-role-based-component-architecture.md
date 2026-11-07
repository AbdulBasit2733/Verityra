# ADR: Role-based component architecture

**Status:** Accepted

## Context

Administrator and student client components were flat at the component root, which obscured ownership and made role-isolation reviews slower. The shared portal shell was separated from its desktop/mobile implementations.

## Decision

Adopt role-first, feature-second folders for authenticated UI and move shared portal navigation to `components/portal`. Use device folders only for structurally different markup.

## Consequences

Feature locality improves without exposing new runtime interfaces. Import paths change internally, so source search and verification are required after moves. Shared primitives remain centralized to prevent parallel role-specific design systems.
