# Shared Public Chrome and Authentication Layout

## Summary

Centralize public navigation/footer in `components/common/site-chrome.tsx` and standardize authentication, recovery, and access-state presentation around shared responsive auth components.

## Route behavior

- Marketing routes receive one navbar and one footer from `SiteChrome`.
- Sign-in, sign-up, password recovery, email verification, unauthorized, suspended, admin, student, dashboard, and API routes omit marketing chrome.
- Route pages do not import or render the shared navbar/footer themselves.

## Auth layout

- Sign-in and sign-up use one CSS-responsive shell with an editorial information panel on large screens and a compact form-first header on small screens.
- Recovery and access-state routes use `AuthPageFrame` for a shared semantic canvas and theme control.
- Forms preserve their existing actions, validation, OAuth behavior, redirects, and session boundaries.

## Theme ownership

`ThemeProvider` remains mounted exactly once in `app/layout.tsx`. Shared auth chrome consumes `ThemeToggle`; individual pages do not mount providers.
