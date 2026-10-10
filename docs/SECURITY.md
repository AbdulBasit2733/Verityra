# Verityra Security & Privacy Policy

## 1. Marketing Rule Enforcement

**CRITICAL POLICY**:
The public landing page and marketing copy never promote or mention AI, AI-powered grading, or automated evaluation. All public copy describes structured practice, standardized answer-sheet formats, objective rubric assessments, and performance tracking.

## 2. Document & Submission Vault Security

- Question papers, model answers, and student submissions are saved in private object storage (`verityra-private` bucket in Supabase Storage or protected local uploads).
- Download routes (`/api/files/download`) check session authentication and enforce strict student ownership:
  - Students can ONLY access their own submissions.
  - Directory traversal attacks are prevented using sanitized paths.
  - Short-lived signed URLs are used for document retrieval.

## 3. Attempt Limiter Concurrency Protection

- The 3-attempt limit is strictly enforced via database transactions and a unique constraint on `(registrationId, attemptNumber)`.
- Re-querying current attempts inside transactions prevents race-condition bypass from simultaneous client requests.
- Failed or invalid uploads (wrong file type, oversized payloads) are rejected prior to attempt reservation and do NOT consume attempt allowances.

## 4. Evaluator Prompt Injection Defense

Student answer sheets and response text are treated as untrusted input. The evaluation pipeline instructs the multimodal evaluator that no directives found within student answer sheets can alter marking rules or override private evaluation instructions.
