import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { prisma, isDatabaseConnected } from "@/lib/prisma"
import { TestSeriesStatus } from "@prisma/client"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Award, BookOpen, CheckCircle, ArrowRight } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function TestsCatalogPage() {
  const dbConnected = await isDatabaseConnected()

  let testSeriesList: any[] = []

  if (dbConnected) {
    testSeriesList = await prisma.testSeries.findMany({
      where: {
        isPublished: true,
      },
      include: {
        papers: true,
        templates: true,
      },
      orderBy: { createdAt: "desc" },
    })
  }

  // Fallback demo tests if database has not been seeded yet
  if (testSeriesList.length === 0) {
    testSeriesList = [
      {
        id: "demo-upsc-mains-1",
        title: "UPSC Civil Services General Studies Paper I Mock",
        slug: "upsc-gs-1",
        description: "Standard 20-question mock simulating real CSE Mains examination. Focus on Indian Heritage, History, Geography, and Society.",
        price: 0,
        maxMarks: 250,
        durationMinutes: 180,
        maxAttempts: 3,
        studentInstructions: "Write answers using black/blue ballpoint pen. Maintain margin constraints. Clearly label Question numbers.",
      },
      {
        id: "demo-state-psc-essay",
        title: "State PSC Advanced Essay & Analytical Writing",
        slug: "state-psc-essay",
        description: "In-depth essay module assessing thematic depth, structural flow, coherence, and analytical rigor under 3-hour examination format.",
        price: 49900, // INR 499.00
        maxMarks: 150,
        durationMinutes: 180,
        maxAttempts: 3,
        studentInstructions: "Choose two themes. Word limit: 1000 words per essay. Strict presentation guidelines apply.",
      },
      {
        id: "demo-judiciary-paper",
        title: "Judicial Services Criminal & Civil Law Practice Paper",
        slug: "judiciary-law-practice",
        description: "Problem-based procedural law questions evaluating case-law synthesis, factual framing, and statutory citation accuracy.",
        price: 69900, // INR 699.00
        maxMarks: 200,
        durationMinutes: 180,
        maxAttempts: 3,
        studentInstructions: "Handwrite precise legal solutions. Cite relevant sections of IPC/CrPC/CPC wherever applicable.",
      },
    ]
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />

      <main className="flex-1 py-16 lg:py-20 bg-slate-50/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14 text-center sm:text-left space-y-3">
            <Badge className="bg-blue-50 text-[#2A6AED] border border-blue-200 text-xs px-3.5 py-1 font-bold">
              Official Examination Catalog
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Subjective Test Series
            </h1>
            <p className="text-base text-slate-600 max-w-2xl leading-relaxed">
              Select an examination paper to download the answer sheet template, review guidelines, and register for practice.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testSeriesList.map((test) => {
              const isFree = test.price === 0
              const priceInRupees = test.price / 100

              return (
                <div
                  key={test.id}
                  className="rounded-3xl border border-slate-200/80 bg-white p-8 flex flex-col justify-between shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline" className="text-xs font-semibold border-blue-200 text-[#2A6AED] bg-blue-50">
                        {test.durationMinutes} Minutes
                      </Badge>
                      {isFree ? (
                        <Badge className="bg-emerald-600 text-white font-bold text-xs border-0 px-3 py-1">
                          Free Registration
                        </Badge>
                      ) : (
                        <span className="text-xl font-black text-slate-900">
                          ₹{priceInRupees}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 line-clamp-2 leading-snug">
                      {test.title}
                    </h3>
                    <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
                      {test.description}
                    </p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-100 space-y-4">
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 font-semibold">
                      <div className="flex items-center gap-1.5">
                        <Award className="h-4 w-4 text-[#2A6AED]" />
                        <span>Max Marks: {test.maxMarks}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-bold text-[#2A6AED]">
                        <CheckCircle className="h-4 w-4 text-[#2A6AED]" />
                        <span>{test.maxAttempts} Attempts</span>
                      </div>
                    </div>

                    <Link href={`/tests/${test.id}`} className="block w-full">
                      <Button className="w-full bg-[#2A6AED] hover:bg-[#1E55C7] text-white font-semibold text-sm h-11 rounded-xl shadow-sm">
                        View Test & Register
                        <ArrowRight className="ml-1.5 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
