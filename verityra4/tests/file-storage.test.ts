import assert from "node:assert/strict"
import {
  normalizePrivateFileUrl,
  parsePrivateFileReference,
} from "../lib/supabase"
import { TestSuite } from "./test-utils"

export function runFileStorageTests() {
  const suite = new TestSuite("Module: Private File URL Handling")

  suite.test(
    "Converts persisted bucket paths to authenticated download routes",
    () => {
      const url = normalizePrivateFileUrl(
        "verityra-private/papers/test-1/42-question-paper.pdf"
      )
      assert.equal(
        url,
        "/api/files/download?bucket=verityra-private&file=papers%2Ftest-1%2F42-question-paper.pdf"
      )
    }
  )

  suite.test(
    "Preserves existing local download routes and parses their file reference",
    () => {
      const url =
        "/api/files/download?file=submissions/test-1/student-1/answer.pdf"
      assert.equal(normalizePrivateFileUrl(url), url)
      assert.deepEqual(parsePrivateFileReference(url), {
        bucket: "verityra-private",
        filePath: "submissions/test-1/student-1/answer.pdf",
      })
    }
  )

  suite.test("Rejects malformed stored file references", () => {
    assert.equal(normalizePrivateFileUrl("verityra-private"), null)
    assert.equal(parsePrivateFileReference("/api/files/download"), null)
  })

  suite.test("Normalizes template paths and preserves external URLs", () => {
    const templateUrl = normalizePrivateFileUrl(
      "verityra-private/templates/upsc/template.pdf"
    )
    assert.equal(
      templateUrl,
      "/api/files/download?bucket=verityra-private&file=templates%2Fupsc%2Ftemplate.pdf"
    )
    const external = "https://example.com/sheet.pdf"
    assert.equal(normalizePrivateFileUrl(external), external)
  })

  suite.test(
    "Parses question-papers and legacy tests storage paths cleanly",
    () => {
      assert.deepEqual(
        parsePrivateFileReference("question-papers/1234-cbse-math.pdf"),
        {
          bucket: "verityra-private",
          filePath: "question-papers/1234-cbse-math.pdf",
        }
      )
      assert.deepEqual(
        parsePrivateFileReference(
          "/api/files/download?bucket=verityra-private&file=tests%2Fsample.pdf"
        ),
        {
          bucket: "verityra-private",
          filePath: "tests/sample.pdf",
        }
      )
      assert.equal(
        normalizePrivateFileUrl("papers/test-abc/123-paper.pdf"),
        "/api/files/download?bucket=verityra-private&file=papers%2Ftest-abc%2F123-paper.pdf"
      )
    }
  )

  return suite.summary()
}
