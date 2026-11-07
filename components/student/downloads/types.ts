export interface StudentDownloadResource {
  id: string
  type: "paper" | "template"
  title: string
  description?: string | null
  fileUrl: string
  version: number
  createdAt: string
}

export interface StudentDownloadGroup {
  testSeriesId: string
  testTitle: string
  resources: StudentDownloadResource[]
}
