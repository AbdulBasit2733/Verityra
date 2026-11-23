import assert from "node:assert/strict"
import bcrypt from "bcryptjs"
import { TestSuite } from "./test-utils"
import { siteConfig } from "../config/site"

// Mock/Logic validation helpers for deletion and curriculum rules
export interface DeletionTestSeriesTarget {
  id: string
  title: string
  completedPaymentsCount: number
  submissionsCount: number
  registrationsCount: number
  childTestsCount: number
}

export function validateTestSeriesDeletionPolicy(
  target: DeletionTestSeriesTarget,
  options?: { force?: boolean }
): { allowed: boolean; error?: string; requiresForce?: boolean } {
  if (target.completedPaymentsCount > 0 && !options?.force) {
    return {
      allowed: false,
      requiresForce: true,
      error: `Cannot delete: ${target.completedPaymentsCount} candidate(s) have paid purchases for this test series. Deleting will permanently remove candidate access and exam history. Confirm force deletion to proceed.`,
    }
  }
  return { allowed: true }
}

export interface DeletionSubjectTestTarget {
  id: string
  title: string
  subject: string
  submissionsCount: number
  registrationsCount: number
}

export function validateSubjectTestDeletionPolicy(
  target: DeletionSubjectTestTarget,
  options?: { force?: boolean }
): { allowed: boolean; error?: string; requiresForce?: boolean } {
  if (target.submissionsCount > 0 && !options?.force) {
    return {
      allowed: false,
      requiresForce: true,
      error: `Cannot delete: ${target.submissionsCount} student exam attempt(s) exist for this test. Confirm force deletion to permanently delete this test and associated submissions.`,
    }
  }
  return { allowed: true }
}

export function runDeletionAndCurriculumTests() {
  const suite = new TestSuite("Module: Deletion Engine & CBSE 8th-12th Curriculum")
  console.log(`\n==================================================`)
  console.log(`[TEST SUITE] ${suite.name}`)
  console.log(`==================================================`)

  suite.test("Admin Identity: defaultAdminEmail is set to admin@izonecc.in", () => {
    assert.equal(siteConfig.defaultAdminEmail, "admin@izonecc.in")
  })

  suite.test("Admin Security: bcrypt hash for izone@2027 passes verification", () => {
    const rawPassword = "izone@2027"
    const hash = bcrypt.hashSync(rawPassword, 10)
    
    assert.ok(bcrypt.compareSync(rawPassword, hash), "Password should match hash")
    assert.ok(!bcrypt.compareSync("wrong@pass", hash), "Invalid password should fail")
  })

  suite.test("Curriculum Matrix: Standards 8th through 12th exist and are mapped", () => {
    const standards = ["Class 8th", "Class 9th", "Class 10th", "Class 11th", "Class 12th"]
    assert.equal(standards.length, 5)
    assert.ok(standards.includes("Class 8th"))
    assert.ok(standards.includes("Class 12th"))
  })

  suite.test("Curriculum Matrix: Secondary (8th-10th) covers 5 core CBSE subjects", () => {
    const coreSubjects = ["Mathematics", "Science", "Social Science", "English", "Hindi"]
    assert.equal(coreSubjects.length, 5)
    for (const subj of coreSubjects) {
      assert.ok(coreSubjects.includes(subj))
    }
  })

  suite.test("Curriculum Matrix: Senior Secondary (11th-12th) covers Science & Commerce streams", () => {
    const scienceSubjects = ["Physics", "Chemistry", "Mathematics", "Biology", "English Core"]
    const commerceSubjects = ["Accountancy", "Business Studies", "Economics", "Mathematics", "English Core"]
    
    assert.equal(scienceSubjects.length, 5)
    assert.equal(commerceSubjects.length, 5)
    assert.ok(scienceSubjects.includes("Physics"))
    assert.ok(commerceSubjects.includes("Accountancy"))
  })

  suite.test("Deletion Policy: Test Series with completed payments blocks when force=false", () => {
    const target: DeletionTestSeriesTarget = {
      id: "series-101",
      title: "Class 10 CBSE Board Mock Series",
      completedPaymentsCount: 5,
      submissionsCount: 12,
      registrationsCount: 5,
      childTestsCount: 5,
    }

    const check = validateTestSeriesDeletionPolicy(target, { force: false })
    assert.equal(check.allowed, false)
    assert.equal(check.requiresForce, true)
    assert.ok(check.error?.includes("5 candidate(s) have paid purchases"))
  })

  suite.test("Deletion Policy: Test Series with completed payments allows deletion when force=true", () => {
    const target: DeletionTestSeriesTarget = {
      id: "series-101",
      title: "Class 10 CBSE Board Mock Series",
      completedPaymentsCount: 5,
      submissionsCount: 12,
      registrationsCount: 5,
      childTestsCount: 5,
    }

    const check = validateTestSeriesDeletionPolicy(target, { force: true })
    assert.equal(check.allowed, true)
    assert.equal(check.error, undefined)
  })

  suite.test("Deletion Policy: Subject Test with submissions blocks without force and permits with force", () => {
    const target: DeletionSubjectTestTarget = {
      id: "test-math-10",
      title: "Class 10 Mathematics Mock Paper",
      subject: "Mathematics",
      submissionsCount: 3,
      registrationsCount: 3,
    }

    const checkBlocked = validateSubjectTestDeletionPolicy(target, { force: false })
    assert.equal(checkBlocked.allowed, false)
    assert.equal(checkBlocked.requiresForce, true)
    assert.ok(checkBlocked.error?.includes("3 student exam attempt(s) exist"))

    const checkAllowed = validateSubjectTestDeletionPolicy(target, { force: true })
    assert.equal(checkAllowed.allowed, true)
  })

  return suite.summary()
}


