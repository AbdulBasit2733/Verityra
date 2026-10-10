import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  FileText,
  PenTool,
  UploadCloud,
  CheckCircle2,
  Clock,
  Award,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  HelpCircle,
  BarChart3,
  BookOpen,
} from "lucide-react"
import { getLeaderboardAction } from "@/actions/leaderboard-actions"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const leaderboardPreview = await getLeaderboardAction()

  const featuredTests = [
    {
      id: "upsc-mains-gs1",
      title: "UPSC Civil Services General Studies Paper I Mock",
      description: "Comprehensive subjective test covering Indian Heritage, Culture, History and Geography with standard 20-question format.",
      duration: "180 mins",
      marks: 250,
      price: 0,
      isFree: true,
      maxAttempts: 3,
      category: "Civil Services",
    },
    {
      id: "state-psc-mains-essay",
      title: "State PSC Advanced Essay & Analytical Writing",
      description: "Thematic essay writing under timed conditions. Evaluated against rigorous articulation, coherence, and structure rubrics.",
      duration: "180 mins",
      marks: 150,
      price: 499,
      isFree: false,
      maxAttempts: 3,
      category: "State Administration",
    },
    {
      id: "judiciary-mains-law",
      title: "Judicial Services Criminal & Civil Law Practice Paper",
      description: "Fact-based legal problem scenarios and procedural jurisprudence drafting tested on official legal margins.",
      duration: "180 mins",
      marks: 200,
      price: 699,
      isFree: false,
      maxAttempts: 3,
      category: "Judicial Services",
    },
  ]

  const faqs = [
    {
      q: "How does answer sheet submission work?",
      a: "For each registered test series, you download our standardized printable answer-sheet template. You write out your complete solutions by hand, scan the completed pages (or click clear photos using your mobile camera), and upload the PDF file to your candidate portal.",
    },
    {
      q: "Why is handwritten answer submission required?",
      a: "Competitive subjective examinations demand real exam speed, pen-on-paper stamina, diagrammatic accuracy, and structured presentation. Verityra ensures you train under authentic exam conditions rather than typing on a keyboard.",
    },
    {
      q: "How many attempts do I have for each registered test series?",
      a: "Each registered candidate receives a strict maximum of three accepted submissions per test series. This allows you to write an initial draft, review your detailed question-wise feedback and rubric scores, and submit refined attempts to track measurable improvement.",
    },
    {
      q: "How quickly are evaluations and scores provided?",
      a: "Once your handwritten answer sheet is submitted, it is processed through our rigorous evaluation pipeline according to the administrator's marking rubric and model answers. Results and question-by-question marks with actionable feedback are posted to your dashboard promptly.",
    },
    {
      q: "Can I access both free and paid test series?",
      a: "Yes! Verityra offers foundational free mock tests as well as premium comprehensive series. Paid tests can be unlocked instantly via our secure Razorpay integration.",
    },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#CADEEF]/30 via-white to-white py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#9BD4E4] bg-[#CADEEF]/40 px-3.5 py-1 text-xs font-semibold text-[#0784B5]">
                  <Award className="h-3.5 w-3.5 text-[#0784B5]" />
                  <span>The Standard for Subjective Examination Preparation</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#0B192C] leading-[1.12]">
                  Master Your Examinations with Rigorous{" "}
                  <span className="text-[#0784B5] underline decoration-[#9BD4E4] decoration-4 underline-offset-8">
                    Handwritten Practice
                  </span>
                </h1>

                <p className="text-lg text-[#4B6375] leading-relaxed max-w-2xl">
                  Simulate real examination conditions with standardized printable answer sheets, authoritative marking rubrics, objective question-wise scoring, and three iterative attempts per registered test series.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <Link href="/tests">
                    <Button size="lg" className="bg-[#0784B5] hover:bg-[#0784B5]/90 text-white font-semibold px-8 shadow-md">
                      Explore Test Series
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="lg" variant="outline" className="border-[#0784B5] text-[#0784B5] hover:bg-[#CADEEF]/40 font-semibold px-8">
                      Get Started Free
                    </Button>
                  </Link>
                </div>

                <div className="pt-6 grid grid-cols-3 gap-6 border-t border-[#D5E5F2] max-w-lg">
                  <div>
                    <p className="text-2xl font-bold text-[#0784B5]">3 Attempts</p>
                    <p className="text-xs text-[#4B6375] font-medium">Per Registered Test</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#0784B5]">100%</p>
                    <p className="text-xs text-[#4B6375] font-medium">Handwritten Format</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#0784B5]">Rubric-Based</p>
                    <p className="text-xs text-[#4B6375] font-medium">Question Scoring</p>
                  </div>
                </div>
              </div>

              {/* Hero Graphic / Flow Card */}
              <div className="lg:col-span-5">
                <Card className="border border-[#9BD4E4] bg-white shadow-xl rounded-2xl overflow-hidden">
                  <div className="bg-[#0784B5] px-6 py-4 text-white flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm tracking-wide">Candidate Workflow</h3>
                      <p className="text-xs text-white/80">From blank page to published ranking</p>
                    </div>
                    <Badge variant="secondary" className="bg-[#CADEEF] text-[#0784B5] font-semibold text-xs border-0">
                      Standardized
                    </Badge>
                  </div>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start gap-3.5 p-3 rounded-xl bg-[#F2F7FA] border border-[#D5E5F2]">
                      <div className="h-8 w-8 rounded-lg bg-[#CADEEF] text-[#0784B5] flex items-center justify-center font-bold text-sm shrink-0">
                        1
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-[#0B192C]">Download Answer Sheet Template</h4>
                        <p className="text-xs text-[#4B6375]">Official margin-aligned PDF ready for printing.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3.5 p-3 rounded-xl bg-[#F2F7FA] border border-[#D5E5F2]">
                      <div className="h-8 w-8 rounded-lg bg-[#39ACE7] text-white flex items-center justify-center font-bold text-sm shrink-0">
                        2
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-[#0B192C]">Handwrite Complete Responses</h4>
                        <p className="text-xs text-[#4B6375]">Solve under timed conditions following test instructions.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3.5 p-3 rounded-xl bg-[#F2F7FA] border border-[#D5E5F2]">
                      <div className="h-8 w-8 rounded-lg bg-[#0784B5] text-white flex items-center justify-center font-bold text-sm shrink-0">
                        3
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-[#0B192C]">Upload Scanned PDF</h4>
                        <p className="text-xs text-[#4B6375]">Private secure vault with atomic attempt verification.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3.5 p-3 rounded-xl bg-[#E3F2FD] border border-[#9BD4E4]">
                      <div className="h-8 w-8 rounded-lg bg-[#0784B5] text-white flex items-center justify-center font-bold text-sm shrink-0">
                        4
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-[#0784B5]">Score Breakdown & Leaderboard</h4>
                        <p className="text-xs text-[#4B6375]">Question-by-question marks, missing concepts, and rank.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section id="how-it-works" className="py-20 bg-[#F2F7FA] border-y border-[#D5E5F2]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <Badge className="bg-[#CADEEF] text-[#0784B5] hover:bg-[#CADEEF] border-0 text-xs px-3 py-1 font-semibold">
                Iterative Mastery
              </Badge>
              <h2 className="text-3xl font-extrabold text-[#0B192C] tracking-tight">
                How Verityra Powers Exam Readiness
              </h2>
              <p className="text-[#4B6375] text-sm sm:text-base">
                Four simple steps designed to build real writing speed, analytical precision, and confidence.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="border-[#D5E5F2] bg-white shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="h-12 w-12 rounded-xl bg-[#CADEEF]/50 flex items-center justify-center text-[#0784B5] mb-2">
                    <FileText className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-base text-[#0B192C]">1. Pick & Register</CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-[#4B6375] leading-relaxed">
                  Browse available free and premium test series. Register instantly and gain access to the question paper and prescribed instructions.
                </CardContent>
              </Card>

              <Card className="border-[#D5E5F2] bg-white shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="h-12 w-12 rounded-xl bg-[#9BD4E4]/40 flex items-center justify-center text-[#0784B5] mb-2">
                    <PenTool className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-base text-[#0B192C]">2. Write by Hand</CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-[#4B6375] leading-relaxed">
                  Print the official template or use standard ruled sheets. Practice time management and structural answer formation with pen and paper.
                </CardContent>
              </Card>

              <Card className="border-[#D5E5F2] bg-white shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="h-12 w-12 rounded-xl bg-[#CADEEF]/50 flex items-center justify-center text-[#0784B5] mb-2">
                    <UploadCloud className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-base text-[#0B192C]">3. Scan & Upload</CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-[#4B6375] leading-relaxed">
                  Upload your multi-page PDF scan directly from your device. Each submission consumes one of your three dedicated attempts.
                </CardContent>
              </Card>

              <Card className="border-[#D5E5F2] bg-white shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="h-12 w-12 rounded-xl bg-[#39ACE7]/20 flex items-center justify-center text-[#0784B5] mb-2">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-base text-[#0B192C]">4. Detailed Feedback</CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-[#4B6375] leading-relaxed">
                  Review itemized scores against the model answer rubric. Identify missing concepts, improve your articulation, and re-attempt to climb ranks.
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FEATURED TEST SERIES CATALOG PREVIEW */}
        <section className="py-20 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4">
              <div>
                <Badge className="bg-[#CADEEF] text-[#0784B5] hover:bg-[#CADEEF] border-0 text-xs px-3 py-1 font-semibold mb-2">
                  Catalog Preview
                </Badge>
                <h2 className="text-3xl font-extrabold text-[#0B192C] tracking-tight">
                  Featured Test Series
                </h2>
                <p className="text-[#4B6375] text-sm">
                  Enroll in targeted practice modules crafted by experienced educators.
                </p>
              </div>
              <Link href="/tests">
                <Button variant="outline" className="border-[#0784B5] text-[#0784B5] hover:bg-[#CADEEF]/30">
                  View Full Catalog
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredTests.map((test) => (
                <Card key={test.id} className="border-[#D5E5F2] flex flex-col justify-between hover:border-[#39ACE7] transition-colors shadow-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <Badge variant="outline" className="text-[11px] font-medium border-[#9BD4E4] text-[#0784B5] bg-[#CADEEF]/20">
                        {test.category}
                      </Badge>
                      {test.isFree ? (
                        <Badge className="bg-emerald-600 text-white font-semibold text-xs border-0">
                          Free Test
                        </Badge>
                      ) : (
                        <Badge className="bg-[#0784B5] text-white font-semibold text-xs border-0">
                          ₹{test.price}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg text-[#0B192C] line-clamp-2">
                      {test.title}
                    </CardTitle>
                    <CardDescription className="text-xs text-[#4B6375] line-clamp-3 mt-1.5">
                      {test.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-2.5 pt-0">
                    <div className="flex items-center justify-between text-xs text-[#4B6375] border-t border-[#D5E5F2] pt-3">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-[#0784B5]" />
                        {test.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <Award className="h-3.5 w-3.5 text-[#0784B5]" />
                        {test.marks} Marks
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-[#0784B5]">
                        3 Attempts
                      </span>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-0">
                    <Link href={`/tests`} className="w-full">
                      <Button className="w-full bg-[#0784B5] hover:bg-[#0784B5]/90 text-white text-xs font-semibold">
                        View Details & Enroll
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* LEADERBOARD PREVIEW SECTION */}
        <section className="py-20 bg-[#F2F7FA] border-t border-[#D5E5F2]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-5 space-y-4">
                <Badge className="bg-[#CADEEF] text-[#0784B5] hover:bg-[#CADEEF] border-0 text-xs px-3 py-1 font-semibold">
                  Transparent Rankings
                </Badge>
                <h2 className="text-3xl font-extrabold text-[#0B192C] tracking-tight">
                  Benchmark Against Top Aspirants
                </h2>
                <p className="text-[#4B6375] text-sm leading-relaxed">
                  Compare your performance across finalized assessments. Rankings are computed strictly from eligible evaluated answer sheets, giving you an authentic pulse of where you stand.
                </p>
                <div className="pt-2">
                  <Link href="/leaderboard">
                    <Button className="bg-[#0784B5] hover:bg-[#0784B5]/90 text-white font-semibold">
                      Explore Full Leaderboard
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-7">
                <Card className="border-[#D5E5F2] bg-white shadow-md overflow-hidden">
                  <div className="px-6 py-4 border-b border-[#D5E5F2] bg-white flex items-center justify-between">
                    <h3 className="font-bold text-sm text-[#0B192C]">Recent Published Rankings</h3>
                    <span className="text-xs text-[#4B6375] font-medium">Top Candidates</span>
                  </div>
                  <div className="divide-y divide-[#D5E5F2]">
                    {leaderboardPreview.slice(0, 4).map((item) => (
                      <div key={item.rank} className="flex items-center justify-between px-6 py-3.5 text-xs">
                        <div className="flex items-center gap-3">
                          <span
                            className={`flex h-6 w-6 items-center justify-center rounded-full font-bold text-xs ${
                              item.rank === 1
                                ? "bg-amber-100 text-amber-800"
                                : item.rank === 2
                                ? "bg-slate-200 text-slate-800"
                                : item.rank === 3
                                ? "bg-amber-700/20 text-amber-900"
                                : "bg-[#CADEEF]/50 text-[#0784B5]"
                            }`}
                          >
                            {item.rank}
                          </span>
                          <div>
                            <p className="font-semibold text-[#0B192C]">{item.studentName}</p>
                            <p className="text-[11px] text-[#4B6375]">{item.testTitle}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[#0784B5]">{item.score} / {item.maxMarks}</p>
                          <p className="text-[10px] text-[#4B6375]">{item.percentage}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* FAQS SECTION */}
        <section id="faqs" className="py-20 bg-white">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14 space-y-3">
              <Badge className="bg-[#CADEEF] text-[#0784B5] hover:bg-[#CADEEF] border-0 text-xs px-3 py-1 font-semibold">
                Got Questions?
              </Badge>
              <h2 className="text-3xl font-extrabold text-[#0B192C] tracking-tight">
                Frequently Asked Questions
              </h2>
              <p className="text-[#4B6375] text-sm">
                Everything you need to know about testing, submissions, and evaluation rules.
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <Card key={index} className="border-[#D5E5F2] shadow-none">
                  <CardHeader className="py-4">
                    <CardTitle className="text-sm sm:text-base font-semibold text-[#0B192C] flex items-start gap-2">
                      <HelpCircle className="h-5 w-5 text-[#0784B5] shrink-0 mt-0.5" />
                      <span>{faq.q}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs sm:text-sm text-[#4B6375] leading-relaxed pt-0 pl-11">
                    {faq.a}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA BANNER */}
        <section className="bg-[#0784B5] py-16 text-white text-center">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Begin Your Examination Preparation Today
            </h2>
            <p className="text-white/80 text-sm sm:text-base max-w-xl mx-auto">
              Download your first answer-sheet template, write with precision, and track your rank with Verityra.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/signup">
                <Button size="lg" className="bg-white text-[#0784B5] hover:bg-white/90 font-bold px-8 shadow-md">
                  Create Candidate Account
                </Button>
              </Link>
              <Link href="/tests">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 font-bold px-8">
                  Browse Tests
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
