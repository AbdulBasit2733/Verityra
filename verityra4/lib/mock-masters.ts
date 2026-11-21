export interface MasterItem {
  id: string
  name: string
  code?: string | null
  description?: string | null
  order?: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export const DEFAULT_STANDARDS: Omit<MasterItem, "createdAt" | "updatedAt">[] = [
  { id: "std-10", name: "Class 10th", code: "10th", order: 10, isActive: true, description: "Secondary School Examination" },
  { id: "std-11", name: "Class 11th", code: "11th", order: 11, isActive: true, description: "Higher Secondary (First Year)" },
  { id: "std-12", name: "Class 12th", code: "12th", order: 12, isActive: true, description: "Senior Secondary Board Examination" },
  { id: "std-neet", name: "NEET-UG", code: "NEET", order: 20, isActive: true, description: "National Eligibility Entrance Test (Undergraduate)" },
  { id: "std-jee-main", name: "JEE Main", code: "JEE-M", order: 21, isActive: true, description: "Joint Entrance Examination (Main)" },
  { id: "std-jee-adv", name: "JEE Advanced", code: "JEE-A", order: 22, isActive: true, description: "Joint Entrance Examination (Advanced)" },
  { id: "std-foundation", name: "Foundation (Class VI–X)", code: "FOUNDATION", order: 30, isActive: true, description: "Foundation Olympiad & NTSE Track" },
  { id: "std-general", name: "General / Other", code: "GENERAL", order: 99, isActive: true, description: "Open Academic Track" },
]

export const DEFAULT_BOARDS: Omit<MasterItem, "createdAt" | "updatedAt">[] = [
  { id: "brd-cbse", name: "CBSE Board", code: "CBSE", isActive: true, description: "Central Board of Secondary Education" },
  { id: "brd-icse", name: "ICSE / ISC Board", code: "ICSE", isActive: true, description: "Council for the Indian School Certificate Examinations" },
  { id: "brd-state-mh", name: "Maharashtra State Board", code: "MSBSHSE", isActive: true, description: "Maharashtra State Board of Secondary and Higher Secondary Education" },
  { id: "brd-state-other", name: "State Board (Other)", code: "STATE", isActive: true, description: "Other State Secondary Education Boards" },
  { id: "brd-cambridge", name: "Cambridge / IGCSE", code: "IGCSE", isActive: true, description: "International General Certificate of Secondary Education" },
  { id: "brd-general", name: "General / Competitive", code: "GEN", isActive: true, description: "National Competitive & General Assessments" },
]

export const DEFAULT_SUBJECTS: Omit<MasterItem, "createdAt" | "updatedAt">[] = [
  { id: "sub-math", name: "Mathematics", code: "MATH", isActive: true, description: "Arithmetic, Algebra, Geometry, Calculus, Trigonometry" },
  { id: "sub-sci", name: "Science", code: "SCI", isActive: true, description: "Integrated Science & Technology (Physics, Chemistry, Biology)" },
  { id: "sub-phy", name: "Physics", code: "PHY", isActive: true, description: "Mechanics, Thermodynamics, Electromagnetism, Modern Physics" },
  { id: "sub-chem", name: "Chemistry", code: "CHEM", isActive: true, description: "Physical, Inorganic, and Organic Chemistry" },
  { id: "sub-bio", name: "Biology", code: "BIO", isActive: true, description: "Botany, Zoology, Genetics, Human Physiology" },
  { id: "sub-soc", name: "Social Science", code: "SST", isActive: true, description: "History, Geography, Political Science, Economics" },
  { id: "sub-eng", name: "English", code: "ENG", isActive: true, description: "Reading Comprehension, Writing Skills, Literature" },
  { id: "sub-hin", name: "Hindi", code: "HIN", isActive: true, description: "Hindi Grammar, Prose, Poetry" },
  { id: "sub-cs", name: "Computer Science", code: "CS", isActive: true, description: "Programming, Data Structures, Algorithms" },
  { id: "sub-acc", name: "Accountancy", code: "ACC", isActive: true, description: "Financial Accounting, Partnership, Company Accounts" },
  { id: "sub-eco", name: "Economics", code: "ECO", isActive: true, description: "Microeconomics, Macroeconomics, Indian Economic Development" },
]
