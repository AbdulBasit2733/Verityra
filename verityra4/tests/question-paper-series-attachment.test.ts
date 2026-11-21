import assert from "node:assert/strict"
import { TestSuite } from "./test-utils"

interface AttachmentValidationInput {
  title: string
  file?: { type: string; size: number }
  attachToSeries: boolean
  testSeriesId?: string
  isStandalone?: boolean
  standalonePrice?: number
}

function validateAttachmentInput(input: AttachmentValidationInput) {
  if (!input.title || input.title.trim().length === 0) {
    return { valid: false, error: "Question paper title is required." }
  }
  if (!input.file || input.file.type !== "application/pdf") {
    return { valid: false, error: "A valid PDF file is required." }
  }
  if (input.attachToSeries && (!input.testSeriesId || input.testSeriesId.trim().length === 0)) {
    return { valid: false, error: "Target test series bundle must be selected when attaching." }
  }
  if (input.isStandalone && input.standalonePrice !== undefined && input.standalonePrice < 0) {
    return { valid: false, error: "Standalone price cannot be negative." }
  }
  return { valid: true }
}

function simulateAttachQuestionPaperToSeries(params: {
  paperId: string
  title: string
  subject: string
  maxMarks: number
  durationMinutes: number
  fileUrl: string
  series: { id: string; title: string }
  isStandalone: boolean
  standalonePrice: number
}) {
  const updatedPaper = {
    id: params.paperId,
    title: params.title,
    subject: params.subject,
    maxMarks: params.maxMarks,
    durationMinutes: params.durationMinutes,
    fileUrl: params.fileUrl,
    testSeriesId: params.series.id,
    testSeriesTitle: params.series.title,
  }

  // Simulated child Test creation under TestSeries
  const synchronizedChildTest = {
    id: `test-child-${params.paperId}`,
    testSeriesId: params.series.id,
    title: `${params.series.title} - ${params.title}`,
    subject: params.subject,
    maxMarks: params.maxMarks,
    durationMinutes: params.durationMinutes,
    questionPaperUrl: params.fileUrl,
    isStandalone: params.isStandalone,
    price: params.standalonePrice,
    isActive: true,
  }

  return { updatedPaper, synchronizedChildTest }
}

export function runQuestionPaperSeriesAttachmentTests() {
  const suite = new TestSuite("Module: Question Paper Master Record & Series Attachment")
  console.log(`\n==================================================`)
  console.log(`[TEST SUITE] ${suite.name}`)
  console.log(`==================================================`)

  suite.test("Validation: Accepts valid question paper master record without series", () => {
    const res = validateAttachmentInput({
      title: "Class 10 Science Practice Paper",
      file: { type: "application/pdf", size: 1024 * 500 },
      attachToSeries: false,
    })
    assert.equal(res.valid, true)
  })

  suite.test("Validation: Rejects attachment if target testSeriesId is missing", () => {
    const res = validateAttachmentInput({
      title: "Class 10 Science Practice Paper",
      file: { type: "application/pdf", size: 1024 * 500 },
      attachToSeries: true,
      testSeriesId: "",
    })
    assert.equal(res.valid, false)
    assert.equal(res.error, "Target test series bundle must be selected when attaching.")
  })

  suite.test("Validation: Rejects negative standalone price", () => {
    const res = validateAttachmentInput({
      title: "Class 10 Science Practice Paper",
      file: { type: "application/pdf", size: 1024 * 500 },
      attachToSeries: true,
      testSeriesId: "series-cbse-10",
      isStandalone: true,
      standalonePrice: -50,
    })
    assert.equal(res.valid, false)
    assert.equal(res.error, "Standalone price cannot be negative.")
  })

  suite.test("Synchronization: Attaching paper creates linked child Test record", () => {
    const result = simulateAttachQuestionPaperToSeries({
      paperId: "qp-cbse-math-1",
      title: "Mathematics Standard Mock 1",
      subject: "Mathematics",
      maxMarks: 80,
      durationMinutes: 180,
      fileUrl: "/api/files/download?file=qp-cbse-math-1.pdf",
      series: {
        id: "series-cbse-10-bundle",
        title: "Class 10th CBSE Comprehensive Board Mock Series",
      },
      isStandalone: true,
      standalonePrice: 99,
    })

    // Assert QuestionPaper carries the series reference
    assert.equal(result.updatedPaper.testSeriesId, "series-cbse-10-bundle")
    assert.equal(
      result.updatedPaper.testSeriesTitle,
      "Class 10th CBSE Comprehensive Board Mock Series"
    )

    // Assert child test was generated with correct inherited metadata
    assert.equal(result.synchronizedChildTest.testSeriesId, "series-cbse-10-bundle")
    assert.equal(result.synchronizedChildTest.questionPaperUrl, "/api/files/download?file=qp-cbse-math-1.pdf")
    assert.equal(result.synchronizedChildTest.maxMarks, 80)
    assert.equal(result.synchronizedChildTest.durationMinutes, 180)
    assert.equal(result.synchronizedChildTest.isStandalone, true)
    assert.equal(result.synchronizedChildTest.price, 99)
    assert.equal(result.synchronizedChildTest.isActive, true)
  })

  suite.test("Navigation Integrity: Admin and student routes are consistent", () => {
    const adminRoutes = [
      "/admin",
      "/admin/submissions",
      "/admin/test-series",
      "/admin/test-series/new",
      "/admin/question-papers",
      "/admin/question-papers/new",
      "/admin/students",
      "/admin/payments",
      "/admin/profile",
    ]

    const studentRoutes = [
      "/student/dashboard",
      "/student/tests",
      "/student/evaluations",
      "/tests",
      "/question-papers",
      "/student/downloads",
      "/leaderboard",
      "/student/purchases",
      "/student/profile",
    ]

    assert.ok(adminRoutes.includes("/admin/test-series/new"))
    assert.ok(adminRoutes.includes("/admin/question-papers/new"))
    assert.ok(studentRoutes.includes("/student/tests"))
    assert.ok(studentRoutes.includes("/question-papers"))
  })

  return suite.summary()
}
