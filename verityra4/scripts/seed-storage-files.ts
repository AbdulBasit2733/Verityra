import fs from "fs"
import path from "path"

function buildMinimalPdf(
  title: string,
  subtitle: string,
  lines: string[]
): Buffer {
  const content = [
    "BT",
    "/F1 15 Tf",
    "50 740 Td",
    "(VERITYRA EXAMINATION PLATFORM) Tj",
    "/F1 11 Tf",
    "0 -22 Td",
    `(${title.replace(/[()\\]/g, "")}) Tj`,
    "/F2 9 Tf",
    "0 -16 Td",
    `(${subtitle.replace(/[()\\]/g, "")}) Tj`,
    "0 -24 Td",
    ...lines.map((l) => `(${l.replace(/[()\\]/g, "")}) Tj\n0 -14 Td`),
    "ET",
    // Left margin line
    "0.75 w",
    "110 40 m",
    "110 760 l",
    "S",
    // Top margin line
    "40 705 m",
    "570 705 l",
    "S",
  ].join("\n")

  const streamLength = Buffer.byteLength(content)

  const pdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<<
  /Type /Page
  /Parent 2 0 R
  /MediaBox [0 0 612 792]
  /Contents 4 0 R
  /Resources <<
    /Font <<
      /F1 5 0 R
      /F2 6 0 R
    >>
  >>
>>
endobj
4 0 obj
<< /Length ${streamLength} >>
stream
${content}
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>
endobj
6 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 7
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000260 00000 n 
0000000360 00000 n 
0000000445 00000 n 
trailer
<< /Size 7 /Root 1 0 R >>
startxref
530
%%EOF`

  return Buffer.from(pdf, "utf8")
}

const UPLOADS_DIR = path.join(process.cwd(), "uploads", "verityra-private")
const SAMPLES_DIR = path.join(process.cwd(), "public", "samples")

const PAPERS = [
  {
    path: "papers/upsc-paper.pdf",
    title: "UPSC Civil Services General Studies Paper I Mock Examination",
    subtitle:
      "Official Question Paper | Total Marks: 250 | Duration: 180 Minutes",
    lines: [
      "INSTRUCTIONS TO CANDIDATES:",
      "1. There are 20 questions printed in English and Hindi.",
      "2. All questions are compulsory.",
      "3. Questions 1 to 10 are 10 marks each (150 words limit).",
      "4. Questions 11 to 20 are 15 marks each (250 words limit).",
      "5. Write your responses in authorized margin-aligned answer booklet only.",
      "Q1. Examine the uniqueness of the tribal art tradition in central India. (10 Marks)",
      "Q2. Discuss the geophysical factors responsible for tropical cyclones in the Bay of Bengal. (10 Marks)",
      "Q3. How does demographic transition impact regional urbanization and infrastructure? (15 Marks)",
    ],
  },
  {
    path: "papers/upsc-gs1-paper.pdf",
    title: "UPSC General Studies Paper I Official Mock Paper",
    subtitle: "Standard 20-Question Subjective Paper | 250 Marks",
    lines: [
      "SECTION A - 150 Word Responses (10 Marks each)",
      "1. Analyze the socio-economic impacts of the Industrial Revolution on colonial economies.",
      "2. Outline the salient architectural characteristics of Chola temple architecture.",
      "SECTION B - 250 Word Responses (15 Marks each)",
      "3. Critically evaluate the causes and mitigation strategies for groundwater depletion in Northwest India.",
    ],
  },
  {
    path: "papers/class-10-mathematics-paper.pdf",
    title: "Class 10 CBSE Board Mathematics Standard Mock Examination",
    subtitle: "Maximum Marks: 80 | Duration: 3 Hours",
    lines: [
      "General Instructions: Section A (MCQs), Section B (2 Marks), Section C (3 Marks), Section D (5 Marks).",
      "Section B: Solve questions with all mathematical steps shown clearly.",
      "Section D: Construct figures neatly with pencil and proper geometric instruments.",
    ],
  },
  {
    path: "papers/class-10-science-paper.pdf",
    title: "Class 10 CBSE Board Science Theory Mock Examination",
    subtitle: "Maximum Marks: 80 | Duration: 3 Hours",
    lines: [
      "Instructions: All 39 questions are divided into 5 sections: A, B, C, D and E.",
      "Draw labeled chemical reaction mechanisms and biological diagrams where appropriate.",
    ],
  },
  {
    path: "papers/class-11-maths-paper.pdf",
    title: "Class 11 Mathematics Annual Examination Model Paper",
    subtitle: "Maximum Marks: 80 | Duration: 180 Mins",
    lines: ["Calculus, Coordinate Geometry, and Algebra Sectional Questions."],
  },
  {
    path: "papers/class-12-maths-paper.pdf",
    title: "Class 12 Mathematics Official Pre-Board Mock Paper",
    subtitle: "Senior Secondary Mathematics Standard Mock | 80 Marks",
    lines: ["Matrices, Vectors, 3D Geometry, and Probability Problems."],
  },
  {
    path: "papers/class-12-physics-paper.pdf",
    title: "Class 12 Physics Theory Pre-Board Examination Paper",
    subtitle: "Maximum Marks: 70 | Duration: 180 Mins",
    lines: ["Electrostatics, Magnetism, Optics, and Modern Physics."],
  },
  {
    path: "papers/state-psc-essay.pdf",
    title: "State PSC Advanced Essay Prompt Document",
    subtitle: "Maximum Marks: 150 | Duration: 180 Mins",
    lines: [
      "Section A: Ethical leadership and governance in the 21st century.",
    ],
  },
]

const TEMPLATES = [
  {
    path: "templates/upsc-template.pdf",
    title: "Standard Margin Answer Sheet Template (24 Pages)",
    subtitle: "Official Ruled Margin Answer Booklet | Printable Format",
    lines: [
      "MARGIN GUIDELINES FOR CANDIDATES:",
      "- Do not write in the left and right designated margins.",
      "- Write question numbers clearly in the left margin column.",
      "- Use ballpoint pen (blue or black ink) for optimal scanning legibility.",
      "- Maintain clean headings, sub-points, and boxed concluding observations.",
    ],
  },
  {
    path: "templates/class-10-maths-template.pdf",
    title: "Class 10 Board 32-Page Ruled Answer Sheet Booklet Template",
    subtitle: "Prescribed 32-Page Booklet with Rough Work Column",
    lines: ["Standard board margin answer sheet template."],
  },
  {
    path: "templates/class-10-science-template.pdf",
    title: "Class 10 Science Margin-Aligned Examination Template",
    subtitle: "Ruled Answer Booklet with Diagram Margin Box",
    lines: ["Standard board format answer sheet template."],
  },
  {
    path: "templates/class-11-maths-template.pdf",
    title: "Senior Secondary Mathematics Ruled Answer Booklet Template",
    subtitle: "32-Page Senior Secondary Format with Graph Insert Margin",
    lines: ["Standard 32-page ruled answer booklet."],
  },
  {
    path: "templates/class-12-maths-template.pdf",
    title: "Class 12 Senior Secondary Board Answer Sheet Template (36 Pages)",
    subtitle: "Board Ruled Margin Format with Page Number Stamp",
    lines: ["36-page board examination booklet."],
  },
  {
    path: "templates/class-12-physics-template.pdf",
    title: "Class 12 Science Standard Answer Booklet Template (32 Pages)",
    subtitle: "32-Page Board Examination Booklet with Millimeter Ruling",
    lines: [
      "Prescribed physics laboratory and theoretical examination format.",
    ],
  },
  {
    path: "templates/state-psc-template.pdf",
    title: "State PSC Essay Sheet Template (16 Pages)",
    subtitle: "16-Page Ruled Essay Booklet with Header Line",
    lines: ["16-page ruled essay booklet."],
  },
]

const SUBMISSIONS = [
  {
    path: "submissions/demo/sample-attempt.pdf",
    title: "UPSC CSE Mains Mock Attempt #1 - Candidate Handwritten Response",
    subtitle:
      "Evaluated Booklet | Score: 184.5 / 250 (73.8%) | Verified Assessment",
    lines: [
      "EVALUATED ANSWER SCRIPT SAMPLE:",
      "Candidate Name: Roll No. 2026-CSE-4891 | Attempt: 1 of 3",
      "Rubric Score Breakdown:",
      "- Question 1: 7.5 / 10 marks (Clear historical chronology & tribal art context)",
      "- Question 2: 11.0 / 15 marks (Effective coastal flow diagram & pressure gradients)",
      "- Question 3: 10.5 / 15 marks (Strong demographic synthesis, urban policy needs depth)",
      "Evaluator Feedback:",
      "'Excellent use of margins, clear handwriting, and well-organized introductory framing.'",
    ],
  },
]

export function seedStoragePdfs() {
  console.log("Seeding storage PDFs...")

  for (const item of [...PAPERS, ...TEMPLATES, ...SUBMISSIONS]) {
    const fullPath = path.join(UPLOADS_DIR, item.path)
    fs.mkdirSync(path.dirname(fullPath), { recursive: true })
    const pdfBuffer = buildMinimalPdf(item.title, item.subtitle, item.lines)
    fs.writeFileSync(fullPath, pdfBuffer)
    console.log(`✓ Seeded: uploads/verityra-private/${item.path}`)
  }

  // Also ensure public/samples has the model files
  fs.mkdirSync(SAMPLES_DIR, { recursive: true })
  fs.writeFileSync(
    path.join(SAMPLES_DIR, "upsc-sample-answer-sheet.pdf"),
    buildMinimalPdf(
      SUBMISSIONS[0].title,
      SUBMISSIONS[0].subtitle,
      SUBMISSIONS[0].lines
    )
  )
  fs.writeFileSync(
    path.join(SAMPLES_DIR, "standard-margin-template.pdf"),
    buildMinimalPdf(
      TEMPLATES[0].title,
      TEMPLATES[0].subtitle,
      TEMPLATES[0].lines
    )
  )
  fs.writeFileSync(
    path.join(SAMPLES_DIR, "upsc-gs1-question-paper.pdf"),
    buildMinimalPdf(PAPERS[0].title, PAPERS[0].subtitle, PAPERS[0].lines)
  )

  console.log(
    "✓ All seed storage PDFs and public sample files successfully created."
  )
}

seedStoragePdfs()
