export interface StudentDownloadResource {
  id: string
  type: "paper" | "template" | "question-paper"
  title: string
  description?: string | null
  fileUrl: string
  version: number
  createdAt: string
  category?: string
  maxMarks?: number
}

export interface StudentDownloadGroup {
  testSeriesId: string
  testTitle: string
  resources: StudentDownloadResource[]
  isQuestionPaperLibrary?: boolean
}
