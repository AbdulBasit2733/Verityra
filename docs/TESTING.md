# Verityra Quality Assurance & Testing Guide

## 1. Automated Test Suite

Verityra includes automated tests covering critical business invariants:
- Password policy and Zod registration schema validation.
- Strict three-attempt limit simulation (attempts 1, 2, and 3 accepted; attempt 4 rejected).
- Safe upload rejection without burning attempts.
- AI evaluation structured output validation and score bounds clamping.
- Uncertainty and legibility flag handling.
- Razorpay HMAC SHA-256 signature verification and tamper detection.
- Private evaluation instruction isolation.

## 2. Running Automated Tests

Run the test suite via:

```bash
pnpm test
```

## 3. Type Checking & Production Build

Ensure all TypeScript types and Next.js routes pass validation:

```bash
# Type checking
pnpm run typecheck

# Full production build
pnpm run build
```
