# Verityra AI-Assisted Evaluation Engine

## 1. Multimodal Architecture

Verityra uses Google Gemini multimodal API (`gemini-2.5-flash` or `gemini-1.5-flash`) behind a modular service boundary (`lib/ai/gemini-evaluator.ts`).

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
- **Simulation Fallback**: In development without active `GEMINI_API_KEY`, the evaluator gracefully returns a realistic sample evaluation.
