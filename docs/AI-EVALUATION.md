# Verityra AI-Assisted Evaluation Engine

## 1. Multimodal Architecture

Verityra uses the Google Gemini multimodal API behind a modular service boundary (`lib/ai/gemini-evaluator.ts`). The default model is `gemini-3.8-flash`; `GEMINI_MODEL` may select another model enabled for the configured API account.

### Pipeline Inputs:
1. Test Series metadata and Maximum Marks.
2. Official Question Paper content.
3. Marking Rubric and Model Answer specifications.
4. **Private Evaluation Instructions** (Confidential to evaluator).
5. Student Handwritten Answer Sheet (PDF document or image scan).

### Structured Output & Zod Validation:
Evaluations return structured JSON validated via `lib/ai/evaluation-schema.ts`:
- `generalFeedback`: Actionable assessment summary.
- `legibilityWarning`: Boolean flag for faint or unclear writing.
- `uncertaintyFlag`: Boolean flag for ambiguous interpretation.
- `questions`: Array of itemized question marks, max marks, specific feedback, and missing concepts.

### Safety Guardrails:
- **Application-Level Bounding**: Total marks and percentages are calculated exclusively by application code. Awarded question marks are clamped to `[0, maxMarks]` to prevent hallucinated scores.
- **Human Review Routing**: Submissions with uncertainty flags or legibility warnings are automatically set to `REVIEW_REQUIRED` for educator inspection.
- **Operational Failure Handling**: Missing credentials or provider/model errors fail evaluation and leave the submission retryable; they never create a zero-mark review placeholder. `REVIEW_REQUIRED` is reserved for valid evaluation output with uncertainty or legibility flags.
- **Simulation Fallback**: Only local development without an active `GEMINI_API_KEY` uses a sample evaluation. Production requires valid Gemini credentials.
