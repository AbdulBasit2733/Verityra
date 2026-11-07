# UI and UX playbook

- Use semantic tokens from `app/globals.css`; Sapphire `#2A6AED` is the primary accent and crimson is reserved for danger/error states.
- Use the existing primitives from `components/ui` before creating new controls.
- Preserve the 4/8px rhythm, 44px default hit targets, visible focus, keyboard access, reduced motion, and non-color status cues.
- Design responsive behavior at 375px, 768px, 1024px, and 1440px. Do not create separate mobile/desktop modules unless structure or interaction differs materially.
- Use `ui-ux-pro-max`, `design-system`, and `ui-styling` for UI changes; run visual QA for modified portal, auth, or public surfaces.
- Icon-only actions require an accessible name and the shared tooltip pattern.
