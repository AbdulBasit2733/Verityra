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

      <main className="flex-1 py-12 bg-[#F2F7FA]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center sm:text-left">
            <Badge className="bg-[#CADEEF] text-[#0784B5] hover:bg-[#CADEEF] border-0 text-xs px-3 py-1 font-semibold mb-2">
              Official Test Catalog
            </Badge>
            <h1 className="text-3xl font-extrabold text-[#0B192C] tracking-tight">
              Subjective Test Series
            </h1>
            <p className="mt-1 text-sm text-[#4B6375] max-w-2xl">
              Select an examination paper to download the answer sheet template, review guidelines, and register for practice.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testSeriesList.map((test) => {
              const isFree = test.price === 0
              const priceInRupees = test.price / 100

              return (
                <Card
                  key={test.id}
                  className="border-[#D5E5F2] bg-white flex flex-col justify-between hover:border-[#39ACE7] transition-all hover:shadow-md"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <Badge variant="outline" className="text-xs border-[#9BD4E4] text-[#0784B5] bg-[#CADEEF]/20">
                        {test.durationMinutes} Minutes
                      </Badge>
                      {isFree ? (
                        <Badge className="bg-emerald-600 text-white font-semibold text-xs border-0">
                          Free Registration
                        </Badge>
                      ) : (
                        <Badge className="bg-[#0784B5] text-white font-semibold text-xs border-0">
                          ₹{priceInRupees}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg text-[#0B192C]">
                      {test.title}
                    </CardTitle>
                    <CardDescription className="text-xs text-[#4B6375] line-clamp-3 mt-1 leading-relaxed">
                      {test.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-3 pt-0">
                    <div className="grid grid-cols-2 gap-2 text-xs text-[#4B6375] border-t border-[#D5E5F2] pt-3">
                      <div className="flex items-center gap-1.5">
                        <Award className="h-4 w-4 text-[#0784B5]" />
                        <span>Max Marks: {test.maxMarks}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-medium text-[#0784B5]">
                        <CheckCircle className="h-4 w-4 text-[#0784B5]" />
                        <span>{test.maxAttempts} Allowed Attempts</span>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-0">
                    <Link href={`/tests/${test.id}`} className="w-full">
                      <Button className="w-full bg-[#0784B5] hover:bg-[#0784B5]/90 text-white font-semibold text-xs">
                        View Test & Register
                        <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
