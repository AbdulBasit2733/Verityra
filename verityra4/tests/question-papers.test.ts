import assert from "node:assert/strict"
import { TestSuite } from "./test-utils"
import {
  DEMO_QUESTION_PAPERS,
  EXAMINATION_STREAMS,
} from "../lib/mock-question-papers"

function validateQuestionPaperInput(input: {
  title?: string
  category?: string
  maxMarks?: number
  durationMinutes?: number
  file?: { type: string; size: number }
}) {
  if (!input.title || input.title.trim().length === 0) {
    return { valid: false, error: "Question paper title is required." }
  }
  if (!input.file) {
    return { valid: false, error: "A valid PDF file is required." }
  }
  if (input.file.type !== "application/pdf") {
    return {
      valid: false,
      error: "Only PDF documents are allowed for question papers.",
    }
  }
  if (input.file.size <= 0 || input.file.size > 25 * 1024 * 1024) {
    return {
      valid: false,
      error: "The document must be smaller than 25 MB and cannot be empty.",
    }
  }
  if (input.maxMarks !== undefined && input.maxMarks <= 0) {
    return { valid: false, error: "Maximum marks must be a positive number." }
  }
  return { valid: true }
}

function evaluateQuestionPaperDownloadAuth(params: {
  userRole?: string
  isPublished: boolean
  isDevFixture?: boolean
}) {
  if (params.userRole === "ADMIN") return { allowed: true }
  if (params.isDevFixture) return { allowed: true }
  if (params.isPublished) return { allowed: true }
  return {
    allowed: false,
    error: "This question paper is currently unpublished.",
  }
}

export function runQuestionPaperTests() {
  const suite = new TestSuite(
    "Module: Question Papers Management & Public Library"
  )
  console.log(`\n==================================================`)
  console.log(`[TEST SUITE] ${suite.name}`)
  console.log(`==================================================`)

  suite.test(
    "Validation: Accepts valid question paper payload with PDF",
    () => {
      const res = validateQuestionPaperInput({
        title: "Class 10 CBSE Board Mathematics Standard 2026",
        category: "School Education",
        maxMarks: 80,
        durationMinutes: 180,
        file: { type: "application/pdf", size: 1024 * 100 },
      })
      assert.equal(res.valid, true)
    }
  )

  suite.test("Validation: Rejects empty or whitespace-only title", () => {
    const res = validateQuestionPaperInput({
      title: "   ",
      file: { type: "application/pdf", size: 1024 },
    })
    assert.equal(res.valid, false)
    assert.equal(res.error, "Question paper title is required.")
  })

  suite.test("Validation: Rejects non-PDF document uploads", () => {
    const res = validateQuestionPaperInput({
      title: "General Studies Paper 1",
      file: { type: "image/png", size: 5000 },
    })
    assert.equal(res.valid, false)
    assert.equal(
      res.error,
      "Only PDF documents are allowed for question papers."
    )
  })

  suite.test("Validation: Rejects files exceeding 25MB limit", () => {
    const res = validateQuestionPaperInput({
      title: "High-Res Exam Scan",
      file: { type: "application/pdf", size: 26 * 1024 * 1024 },
    })
    assert.equal(res.valid, false)
    assert.equal(
      res.error,
      "The document must be smaller than 25 MB and cannot be empty."
    )
  })

  suite.test("Validation: Rejects zero-byte empty files", () => {
    const res = validateQuestionPaperInput({
      title: "Empty Paper",
      file: { type: "application/pdf", size: 0 },
    })
    assert.equal(res.valid, false)
    assert.equal(
      res.error,
      "The document must be smaller than 25 MB and cannot be empty."
    )
  })

  suite.test(
    "Security: Admins can download both published and unpublished papers",
    () => {
      const pub = evaluateQuestionPaperDownloadAuth({
        userRole: "ADMIN",
        isPublished: true,
      })
      const unpub = evaluateQuestionPaperDownloadAuth({
        userRole: "ADMIN",
        isPublished: false,
      })
      assert.equal(pub.allowed, true)
      assert.equal(unpub.allowed, true)
    }
  )

  suite.test(
    "Security: Students and public visitors can download published papers",
    () => {
      const student = evaluateQuestionPaperDownloadAuth({
        userRole: "STUDENT",
        isPublished: true,
      })
      const visitor = evaluateQuestionPaperDownloadAuth({
        userRole: undefined,
        isPublished: true,
      })
      assert.equal(student.allowed, true)
      assert.equal(visitor.allowed, true)
    }
  )

  suite.test(
    "Security: Students and public visitors are blocked from unpublished papers",
    () => {
      const student = evaluateQuestionPaperDownloadAuth({
        userRole: "STUDENT",
        isPublished: false,
      })
      const visitor = evaluateQuestionPaperDownloadAuth({
        userRole: undefined,
        isPublished: false,
      })
      assert.equal(student.allowed, false)
      assert.equal(visitor.allowed, false)
      assert.equal(
        student.error,
        "This question paper is currently unpublished."
      )
    }
  )

  suite.test(
    "Data Integrity: Demo question papers have required metadata and valid URLs",
    () => {
      assert.ok(DEMO_QUESTION_PAPERS.length >= 5)
      for (const paper of DEMO_QUESTION_PAPERS) {
        assert.ok(paper.id && paper.id.startsWith("demo-qp-"))
        assert.ok(paper.title && paper.title.length > 5)
        assert.ok(paper.category && paper.category.length > 0)
        assert.ok(paper.maxMarks > 0)
        assert.ok(
          paper.fileUrl && paper.fileUrl.includes("file=question-papers/")
        )
        assert.equal(paper.isPublished, true)
      }
    }
  )

  suite.test(
    "Search & Filter Logic: Accurately filters papers by title, subject, and category",
    () => {
      const query = "mathematics"
      const matched = DEMO_QUESTION_PAPERS.filter((p) =>
        `${p.title} ${p.subject || ""} ${p.category}`
          .toLowerCase()
          .includes(query)
      )
      assert.ok(matched.length >= 2)
      assert.ok(
        matched.every(
          (p) =>
            p.title.toLowerCase().includes("math") ||
            p.subject?.toLowerCase().includes("math")
        )
      )

      const civilServicesOnly = DEMO_QUESTION_PAPERS.filter((p) =>
        p.category.includes("Civil Services")
      )
      assert.ok(civilServicesOnly.length >= 1)
    }
  )

  suite.test(
    "Stream Categories: Required examination streams are present",
    () => {
      const requiredStreams = [
        "SSC",
        "CBSE Board",
        "ICSE / ISC Board",
        "NEET",
        "JEE Main",
        "JEE Advanced",
      ]
      for (const stream of requiredStreams) {
        assert.ok(
          EXAMINATION_STREAMS.includes(stream as any),
          `Stream "${stream}" must be present in EXAMINATION_STREAMS`
        )
      }
    }
  )

  suite.test(
    "Stream Fixtures: Demo papers cover SSC, CBSE, ICSE, NEET, JEE Main, and JEE Advanced",
    () => {
      const streamsToVerify = [
        "SSC",
        "CBSE Board",
        "ICSE / ISC Board",
        "NEET",
        "JEE Main",
        "JEE Advanced",
      ]
      for (const stream of streamsToVerify) {
        const found = DEMO_QUESTION_PAPERS.some((p) => p.category === stream)
        assert.ok(
          found,
          `Expected at least one demo paper for stream "${stream}"`
        )
      }
    }
  )

  return suite.summary()
}
