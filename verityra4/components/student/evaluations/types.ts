export interface StudentEvaluationRow {
  submissionId: string
  testSeriesId: string
  testTitle: string
  seriesTitle?: string | null
  subject?: string | null
  attemptNumber: number
  status: string
  submittedAt: string
  evaluatedAt: string | null
  score: number | null
  maxMarks: number | null
  percentage: number | null
  questionCount: number
  legibilityWarning: boolean
  uncertaintyFlag: boolean
}

export interface StudentEvaluationQuestion {
  id: string
  questionNumber: string
  maxMarks: number
  marksAwarded: number
  scoreBand: string
  feedback: string
  strengths: string
  missingConcepts: string | null
  improvementAdvice: string
  examinerExpectation: string
  isLegible: boolean
  isUncertain: boolean
}

export interface StudentEvaluationDetail {
  submissionId: string
  testSeriesId: string
  testTitle: string
  attemptNumber: number
  submittedAt: string
  status: string
  evaluation: {
    totalMarksAwarded: number
    maxMarks: number
    percentage: number
    generalFeedback: string
    evaluatedAt: string | null
    legibilityWarning: boolean
    uncertaintyFlag: boolean
    questions: StudentEvaluationQuestion[]
  } | null
}
