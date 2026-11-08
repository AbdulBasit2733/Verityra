-- Persist logical evaluation runs separately from the current/latest evaluation.
CREATE TYPE "EvaluationTrigger" AS ENUM ('AUTOMATIC', 'ADMIN_REEVALUATION');

ALTER TABLE "Submission"
ADD COLUMN "aiEvaluationRuns" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "QuestionEvaluation"
  ADD COLUMN "scoreBand" TEXT NOT NULL DEFAULT 'PARTIAL',
  ADD COLUMN "scoreExplanation" TEXT NOT NULL DEFAULT 'Score based on correctness, completeness, reasoning, and presentation.',
  ADD COLUMN "strengths" TEXT NOT NULL DEFAULT 'No specific strengths recorded.',
  ADD COLUMN "examinerExpectation" TEXT NOT NULL DEFAULT 'Address the core concepts, reasoning, and evidence required by the question.',
  ADD COLUMN "improvementAdvice" TEXT NOT NULL DEFAULT 'Review the missing concepts and strengthen the explanation.';

CREATE TABLE "EvaluationRun" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "runNumber" INTEGER NOT NULL,
    "trigger" "EvaluationTrigger" NOT NULL,
    "status" "EvaluationStatus" NOT NULL DEFAULT 'PENDING',
    "totalMarksAwarded" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maxMarks" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "percentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "generalFeedback" TEXT NOT NULL,
    "legibilityWarning" BOOLEAN NOT NULL DEFAULT false,
    "uncertaintyFlag" BOOLEAN NOT NULL DEFAULT false,
    "evaluatorModel" TEXT NOT NULL,
    "failureReason" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EvaluationRun_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EvaluationRunQuestion" (
    "id" TEXT NOT NULL,
    "evaluationRunId" TEXT NOT NULL,
    "questionNumber" TEXT NOT NULL,
    "maxMarks" DOUBLE PRECISION NOT NULL,
    "marksAwarded" DOUBLE PRECISION NOT NULL,
    "scoreBand" TEXT NOT NULL,
    "scoreExplanation" TEXT NOT NULL,
    "strengths" TEXT NOT NULL,
    "missingConcepts" TEXT,
    "examinerExpectation" TEXT NOT NULL,
    "improvementAdvice" TEXT NOT NULL,
    "isLegible" BOOLEAN NOT NULL DEFAULT true,
    "isUncertain" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EvaluationRunQuestion_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "EvaluationRun_submissionId_runNumber_key" ON "EvaluationRun"("submissionId", "runNumber");
CREATE INDEX "EvaluationRun_submissionId_createdAt_idx" ON "EvaluationRun"("submissionId", "createdAt");
CREATE INDEX "EvaluationRun_status_createdAt_idx" ON "EvaluationRun"("status", "createdAt");
CREATE INDEX "EvaluationRunQuestion_evaluationRunId_questionNumber_idx" ON "EvaluationRunQuestion"("evaluationRunId", "questionNumber");

ALTER TABLE "EvaluationRun" ADD CONSTRAINT "EvaluationRun_submissionId_fkey"
  FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EvaluationRunQuestion" ADD CONSTRAINT "EvaluationRunQuestion_evaluationRunId_fkey"
  FOREIGN KEY ("evaluationRunId") REFERENCES "EvaluationRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
