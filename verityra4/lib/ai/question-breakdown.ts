export interface BreakdownQuestionInput {
  id?: string
  questionNumber: string
  maxMarks: number
  marksAwarded: number
  feedback: string
  missingConcepts: string | null
  scoreBand?: string
  scoreExplanation?: string
  strengths?: string
  examinerExpectation?: string
  improvementAdvice?: string
  isLegible: boolean
}

export interface ParsedQuestionNumber {
  raw: string
  tokens: string[]
  canonicalNumber: string
  parentKey: string
  parentLabel: string
  sectionKey: string | null
  sectionLabel: string | null
}

export interface QuestionVerdict {
  label:
    | "Not Attempted"
    | "Wrong Answer"
    | "Needs Depth"
    | "Partial"
    | "Strong"
  tone: "muted" | "danger" | "warning" | "amber" | "success"
}

export interface BreakdownLeafItem<T extends BreakdownQuestionInput> {
  question: T
  parsed: ParsedQuestionNumber
  verdict: QuestionVerdict
  percentage: number
}

export interface BreakdownSectionGroup<T extends BreakdownQuestionInput> {
  sectionKey: string | null
  sectionLabel: string | null
  awarded: number
  max: number
  percentage: number
  items: BreakdownLeafItem<T>[]
}

export interface BreakdownParentGroup<T extends BreakdownQuestionInput> {
  parentKey: string
  parentLabel: string
  awarded: number
  max: number
  percentage: number
  questionCount: number
  hasSections: boolean
  sections: BreakdownSectionGroup<T>[]
}

const ROMAN_VALUES: Record<string, number> = {
  i: 1,
  ii: 2,
  iii: 3,
  iv: 4,
  v: 5,
  vi: 6,
  vii: 7,
  viii: 8,
  ix: 9,
  x: 10,
  xi: 11,
  xii: 12,
}

const AMBIGUOUS_SINGLE_UPPER_ROMAN = new Set(["I", "V", "X"])

function tokenizeQuestionLabel(raw: string): string[] {
  const cleaned = String(raw || "")
    .trim()
    .replace(/\b(?:question|ques|section|sec|part)\b/gi, " ")
    .replace(/^q(?:uestion)?\.?\s*/i, "")
    .trim()

  if (!cleaned) return []

  const roughTokens = cleaned
    .split(/[\s.():/\\_-]+/)
    .map((part) => part.trim())
    .filter(Boolean)

  const expanded: string[] = []
  for (const token of roughTokens) {
    // Split combined digit+letter segments (e.g. "1A" -> ["1", "A"], "A1" -> ["A", "1"])
    const subParts = token.match(/\d+|[a-zA-Z]+/g)
    if (subParts) {
      expanded.push(...subParts)
    } else {
      expanded.push(token)
    }
  }

  // Drop stray single "Q" prefix if any slipped through (e.g. "Section A Q1")
  if (expanded.length > 1 && /^q$/i.test(expanded[0])) {
    expanded.shift()
  }

  return expanded
}

function parseTokenSortKey(token: string): {
  kind: 0 | 1 | 2
  num: number
  str: string
} {
  if (/^\d+$/.test(token)) {
    return { kind: 0, num: Number(token), str: token }
  }

  const lower = token.toLowerCase()
  const isUnambiguousRoman =
    lower in ROMAN_VALUES && !AMBIGUOUS_SINGLE_UPPER_ROMAN.has(token)

  if (isUnambiguousRoman) {
    return { kind: 1, num: ROMAN_VALUES[lower], str: lower }
  }

  return { kind: 2, num: 0, str: token.toUpperCase() }
}

/**
 * Compares hierarchical question numbers accurately segment-by-segment
 * (e.g., Q1.A.1 < Q1.A.2 < Q1.A.10 < Q1.B.1 < Q2 < Q10).
 */
export function compareHierarchicalQuestionNumbers(
  a: string,
  b: string
): number {
  const tokensA = tokenizeQuestionLabel(a)
  const tokensB = tokenizeQuestionLabel(b)
  const maxLen = Math.max(tokensA.length, tokensB.length)

  for (let i = 0; i < maxLen; i += 1) {
    if (i >= tokensA.length) return -1
    if (i >= tokensB.length) return 1

    const keyA = parseTokenSortKey(tokensA[i])
    const keyB = parseTokenSortKey(tokensB[i])

    if (keyA.kind !== keyB.kind) {
      return keyA.kind - keyB.kind
    }
    if (keyA.kind === 0 || keyA.kind === 1) {
      if (keyA.num !== keyB.num) return keyA.num - keyB.num
    } else {
      const cmp = keyA.str.localeCompare(keyB.str, undefined, {
        sensitivity: "base",
      })
      if (cmp !== 0) return cmp
    }
  }

  return String(a || "").localeCompare(String(b || ""), undefined, {
    numeric: true,
    sensitivity: "base",
  })
}

/**
 * Normalizes labels like "Q1(a)(1)", "Question 1 Section A - 1", or "1.A.1"
 * into a collision-free canonical key ("Q1.A.1") for blueprint reconciliation.
 */
export function normalizeHierarchicalQuestionKey(raw: string): string {
  const tokens = tokenizeQuestionLabel(raw)
  if (tokens.length === 0) {
    return String(raw || "")
      .trim()
      .toUpperCase()
      .replace(/[\s.():-]+/g, "")
  }
  return `Q${tokens.map((t) => t.toUpperCase()).join(".")}`
}

/**
 * Parses a question number string into Parent Question -> Optional Section -> Canonical Leaf.
 */
export function parseHierarchicalQuestionNumber(
  raw: string
): ParsedQuestionNumber {
  const tokens = tokenizeQuestionLabel(raw)
  if (tokens.length === 0) {
    const fallback = String(raw || "Q1").trim() || "Q1"
    return {
      raw: fallback,
      tokens: [],
      canonicalNumber: fallback,
      parentKey: fallback.toUpperCase(),
      parentLabel: fallback,
      sectionKey: null,
      sectionLabel: null,
    }
  }

  const normalizedTokens = tokens.map((t) =>
    t.toLowerCase() in ROMAN_VALUES && t === t.toLowerCase() && t.length > 1
      ? t.toLowerCase()
      : /^[a-z]$/i.test(t) && tokens.length >= 3 && tokens[1] === t
        ? t.toUpperCase()
        : t.length === 1 && /^[a-z]$/i.test(t)
          ? t.toUpperCase()
          : t
  )

  const parentToken = normalizedTokens[0]
  const parentKey = /^\d+$/.test(parentToken)
    ? `Q${parentToken}`
    : parentToken.toUpperCase()
  const parentLabel = /^\d+$/.test(parentToken)
    ? `Question ${parentToken}`
    : parentKey

  const hasExplicitSection =
    normalizedTokens.length >= 3 && /^[A-Z]+$/i.test(normalizedTokens[1])
  const sectionKey = hasExplicitSection
    ? normalizedTokens[1].toUpperCase()
    : null
  const sectionLabel = sectionKey ? `Section ${sectionKey}` : null

  const canonicalNumber = /^\d+$/.test(parentToken)
    ? `Q${normalizedTokens.join(".")}`
    : normalizedTokens.join(".")

  return {
    raw: String(raw || ""),
    tokens: normalizedTokens,
    canonicalNumber,
    parentKey,
    parentLabel,
    sectionKey,
    sectionLabel,
  }
}

export function deriveQuestionVerdict(input: {
  marksAwarded: number
  maxMarks: number
  scoreBand?: string
  feedback?: string
  scoreExplanation?: string
}): QuestionVerdict {
  const combinedText =
    `${input.feedback || ""} ${input.scoreExplanation || ""}`.toLowerCase()

  if (
    input.marksAwarded <= 0 &&
    /(not attempted|unattempted|no response|skipped|blank answer)/i.test(
      combinedText
    )
  ) {
    return { label: "Not Attempted", tone: "muted" }
  }

  if (input.marksAwarded <= 0) {
    return { label: "Wrong Answer", tone: "danger" }
  }

  const ratio = input.maxMarks > 0 ? input.marksAwarded / input.maxMarks : 0
  const band = (input.scoreBand || "").toUpperCase()

  if (band === "WEAK" || ratio < 0.4) {
    return { label: "Needs Depth", tone: "warning" }
  }
  if (band === "PARTIAL" || ratio < 0.7) {
    return { label: "Partial", tone: "amber" }
  }
  return { label: "Strong", tone: "success" }
}

function roundMarks(value: number): number {
  return Number(value.toFixed(2))
}

function computePercentage(awarded: number, max: number): number {
  if (max <= 0) return 0
  return Math.round((awarded / max) * 100)
}

/**
 * Groups flat question evaluation rows into Parent Question -> Optional Section -> Sub-question tree
 * without requiring any database schema changes.
 */
export function buildQuestionBreakdownTree<T extends BreakdownQuestionInput>(
  questions: T[]
): BreakdownParentGroup<T>[] {
  const sorted = [...questions].sort((a, b) =>
    compareHierarchicalQuestionNumbers(a.questionNumber, b.questionNumber)
  )

  const parentMap = new Map<
    string,
    {
      parentKey: string
      parentLabel: string
      sectionOrder: string[]
      sectionMap: Map<string, BreakdownLeafItem<T>[]>
    }
  >()
  const parentOrder: string[] = []

  for (const question of sorted) {
    const parsed = parseHierarchicalQuestionNumber(question.questionNumber)
    const leaf: BreakdownLeafItem<T> = {
      question,
      parsed,
      verdict: deriveQuestionVerdict(question),
      percentage: computePercentage(question.marksAwarded, question.maxMarks),
    }

    let parentGroup = parentMap.get(parsed.parentKey)
    if (!parentGroup) {
      parentGroup = {
        parentKey: parsed.parentKey,
        parentLabel: parsed.parentLabel,
        sectionOrder: [],
        sectionMap: new Map(),
      }
      parentMap.set(parsed.parentKey, parentGroup)
      parentOrder.push(parsed.parentKey)
    }

    const secMapKey = parsed.sectionKey ?? "__NO_SECTION__"
    let sectionItems = parentGroup.sectionMap.get(secMapKey)
    if (!sectionItems) {
      sectionItems = []
      parentGroup.sectionMap.set(secMapKey, sectionItems)
      parentGroup.sectionOrder.push(secMapKey)
    }
    sectionItems.push(leaf)
  }

  return parentOrder.map((parentKey) => {
    const group = parentMap.get(parentKey)!
    const sections: BreakdownSectionGroup<T>[] = group.sectionOrder.map(
      (secMapKey) => {
        const items = group.sectionMap.get(secMapKey)!
        const awarded = roundMarks(
          items.reduce((sum, item) => sum + item.question.marksAwarded, 0)
        )
        const max = roundMarks(
          items.reduce((sum, item) => sum + item.question.maxMarks, 0)
        )
        const sectionKey = secMapKey === "__NO_SECTION__" ? null : secMapKey
        return {
          sectionKey,
          sectionLabel: sectionKey ? `Section ${sectionKey}` : null,
          awarded,
          max,
          percentage: computePercentage(awarded, max),
          items,
        }
      }
    )

    const totalAwarded = roundMarks(
      sections.reduce((sum, s) => sum + s.awarded, 0)
    )
    const totalMax = roundMarks(sections.reduce((sum, s) => sum + s.max, 0))
    const questionCount = sections.reduce((sum, s) => sum + s.items.length, 0)
    const hasSections = sections.some((s) => s.sectionKey !== null)

    return {
      parentKey: group.parentKey,
      parentLabel: group.parentLabel,
      awarded: totalAwarded,
      max: totalMax,
      percentage: computePercentage(totalAwarded, totalMax),
      questionCount,
      hasSections,
      sections,
    }
  })
}
