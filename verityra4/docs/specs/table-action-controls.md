# Table action controls

## Summary

Table action cells use compact visual controls without sacrificing clarity or accessibility.

## Contract

- Render visual actions as icons only.
- Use `IconActionButton` for regular actions and the shared tooltip primitive for dialog triggers.
- Keep a minimum 44 by 44 pixel target through the shared `Button` `icon` size.
- Provide an `aria-label` and a visible-on-focus tooltip for every icon action.
- Preserve action URLs, disabled behavior, dialog flows, audit controls, and server-action contracts.

## Scope

Administrative submission, test-series, and payment tables plus student purchase, registered-test, and dashboard tables.
