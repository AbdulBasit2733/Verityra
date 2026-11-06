import Link from "next/link"
import { ArrowRight, Check, ChevronRight, FileText, Layers3, PenLine, ScanLine, Sparkles, Trophy, UploadCloud } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

const visualSources = {
  hero: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Hero-section-eM7DnOksYx6WdT8Ig4NPbFaDxAh3aE.png",
  steps: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Section-2-UD6a6mBXhGMjBEGUqUffowOHQ3V2cg.png",
  progression: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/section-3-Ph2u4BO3F6PIqKrZGydt0KrS0C9sCZ.png",
  evaluation: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/section-4-l737KECOl1eQ8TGoUuAf3b7Hm7TTES.png",
  leaderboard: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Verityra%20Public%20Leaderboard%20Dashboard-xmUi4ydmMQ9sfnHJuoeC0WcmhIuTzz.png",
  pricing: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/section-7-W6DZMZQNeA9dGYOrQrc9ap92du1TUP.png",
}

const process = [
  { icon: FileText, title: "Download the booklet", body: "Use the official A4 answer sheet with exam-ready margins." },
  { icon: PenLine, title: "Handwrite your answers", body: "Practice with a real pen and paper, just like the examination hall." },
  { icon: ScanLine, title: "Scan & upload", body: "Submit your complete answer booklet as a single PDF." },
  { icon: Trophy, title: "Get detailed feedback", body: "Receive question-wise, rubric-based feedback within minutes." },
]

const benefits = ["Authentic handwriting practice", "Three-attempt progression", "Detailed rubric feedback", "Peer benchmarking"]

export default function HomePage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f4f8ff] text-[#071b3a]">
      <Navbar />
      <main>
        <section className="relative overflow-hidden border-b border-blue-100 bg-[radial-gradient(circle_at_78%_22%,#dbeafe,transparent_35%),linear-gradient(180deg,#f8fbff_0%,#edf5ff_100%)]">
          <div className="pointer-events-none absolute -bottom-24 left-[-8%] h-64 w-[60%] rounded-[50%] bg-blue-100/70 blur-2xl" />
          <div className="pointer-events-none absolute top-20 right-[-12%] h-80 w-[48%] rounded-full bg-blue-100/80 blur-3xl" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-24">
            <div className="max-w-2xl">
              <Badge className="rounded-full border border-blue-200 bg-blue-100/70 px-4 py-2 text-[#145deb] shadow-none"><Sparkles data-icon="inline-start" /> For UPSC, State PCS & Judicial Services</Badge>
              <h1 className="mt-7 font-heading text-5xl font-black leading-[1.02] tracking-[-0.045em] sm:text-6xl lg:text-7xl">Practice handwritten answers.<span className="block text-[#1465ed]">Get detailed evaluation.</span></h1>
              <p className="mt-7 max-w-xl text-base leading-8 text-[#304b73] sm:text-lg">A high-integrity test-series platform that preserves the real exam experience and delivers question-wise, rubric-based feedback within minutes.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/tests" className={cn(buttonVariants({ size: "lg" }), "rounded-xl bg-[#1465ed] px-6 shadow-lg shadow-blue-500/20 hover:bg-[#0d53cc]")}>Explore Test Series <ArrowRight data-icon="inline-end" /></Link>
                <a href="#how-it-works" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-xl border-blue-300 bg-white/70 px-6 text-[#071b3a] hover:bg-white")}>How It Works <ChevronRight data-icon="inline-end" /></a>
              </div>
              <div className="mt-9 flex flex-wrap gap-x-5 gap-y-3 text-sm font-semibold text-[#25466f]">{benefits.map((benefit) => <span key={benefit} className="inline-flex items-center gap-2"><Check className="text-emerald-500" />{benefit}</span>)}</div>
            </div>
            <div className="relative lg:-mr-24">
              <div className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/70 p-2 shadow-2xl shadow-blue-900/15 backdrop-blur"><img src={visualSources.hero} alt="Handwritten answer booklet and rubric evaluation preview" className="h-auto w-full rounded-[1.5rem]" /></div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-3xl text-center"><Badge className="rounded-full border border-blue-200 bg-blue-100 text-[#145deb] shadow-none"><Layers3 data-icon="inline-start" /> Simple 4-step process</Badge><h2 className="mt-5 font-heading text-4xl font-black tracking-tight sm:text-5xl">Your preparation. Your progress.<span className="block text-[#1465ed]">Four simple steps.</span></h2><p className="mt-5 text-lg leading-8 text-[#405b80]">From handwritten practice to detailed feedback, Verityra makes examination preparation simple, structured and effective.</p></div>
          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">{process.map(({ icon: Icon, title, body }, index) => <div key={title} className="relative rounded-3xl border border-blue-100 bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><span className="flex size-10 items-center justify-center rounded-full bg-[#dbeafe] text-lg font-bold text-[#145deb]">{index + 1}</span><Icon className="text-[#1465ed]" /></div><h3 className="mt-7 font-heading text-xl font-bold">{title}</h3><p className="mt-3 text-sm leading-6 text-[#547092]">{body}</p></div>)}</div>
          <div className="mt-12 overflow-hidden rounded-[2rem] border border-blue-100 bg-white p-2 shadow-xl shadow-blue-900/10"><img src={visualSources.steps} alt="Four-step handwritten test submission process" className="h-auto w-full rounded-[1.5rem]" /></div>
        </section>

        <section id="iterative-mastery" className="border-y border-blue-100 bg-white/70">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8 lg:py-28"><div><Badge className="rounded-full border border-blue-200 bg-blue-100 text-[#145deb] shadow-none"><Layers3 data-icon="inline-start" /> Three-attempt progression</Badge><h2 className="mt-5 font-heading text-4xl font-black tracking-tight sm:text-5xl">Improve with <span className="text-[#1465ed]">every attempt.</span></h2><p className="mt-5 text-lg leading-8 text-[#405b80]">A structured cycle helps you identify gaps, address feedback, and steadily refine your answer writing.</p><div className="mt-8 flex flex-col gap-4">{["Attempt 1: establish your baseline", "Attempt 2: focus on missing concepts", "Attempt 3: polish your exam-ready response"].map((item) => <div key={item} className="flex items-center gap-3 font-semibold text-[#17385f]"><span className="flex size-7 items-center justify-center rounded-full bg-[#1465ed] text-xs text-white"><Check /></span>{item}</div>)}</div></div><div className="overflow-hidden rounded-[2rem] border border-blue-100 bg-white p-2 shadow-xl shadow-blue-900/10"><img src={visualSources.progression} alt="Three attempt progression from assessment to final refinement" className="h-auto w-full rounded-[1.5rem]" /></div></div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28"><div className="mx-auto max-w-3xl text-center"><Badge className="rounded-full border border-blue-200 bg-blue-100 text-[#145deb] shadow-none"><UploadCloud data-icon="inline-start" /> Detailed question-wise evaluation</Badge><h2 className="mt-5 font-heading text-4xl font-black tracking-tight sm:text-5xl">Get in-depth feedback <span className="text-[#1465ed]">for real improvement.</span></h2><p className="mt-5 text-lg leading-8 text-[#405b80]">Know what worked, what was missing, and what to improve before your next attempt.</p></div><div className="mt-12 overflow-hidden rounded-[2rem] border border-blue-100 bg-white p-2 shadow-xl shadow-blue-900/10"><img src={visualSources.evaluation} alt="Question-wise rubric evaluation report" className="h-auto w-full rounded-[1.5rem]" /></div></section>

        <section className="border-y border-blue-100 bg-[#eaf3ff]"><div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-28"><div className="order-2 overflow-hidden rounded-[2rem] border border-blue-100 bg-white p-2 shadow-xl shadow-blue-900/10 lg:order-1"><img src={visualSources.leaderboard} alt="Public leaderboard showing peer benchmarking" className="h-auto w-full rounded-[1.5rem]" /></div><div className="order-1 lg:order-2"><Badge className="rounded-full border border-blue-200 bg-white text-[#145deb] shadow-none"><Trophy data-icon="inline-start" /> Peer benchmarking</Badge><h2 className="mt-5 font-heading text-4xl font-black tracking-tight sm:text-5xl">Benchmark your performance <span className="text-[#1465ed]">with peers.</span></h2><p className="mt-5 text-lg leading-8 text-[#405b80]">Track your rank, compare your progress with serious aspirants, and stay motivated to improve with every attempt.</p><Link href="/leaderboard" className={cn(buttonVariants(), "mt-8 rounded-xl bg-[#1465ed] hover:bg-[#0d53cc]")}>View leaderboard <ArrowRight data-icon="inline-end" /></Link></div></div></section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28"><div className="mx-auto max-w-3xl text-center"><Badge className="rounded-full border border-blue-200 bg-blue-100 text-[#145deb] shadow-none"><FileText data-icon="inline-start" /> Featured test series</Badge><h2 className="mt-5 font-heading text-4xl font-black tracking-tight sm:text-5xl">Choose your <span className="text-[#1465ed]">test series.</span></h2><p className="mt-5 text-lg leading-8 text-[#405b80]">Structured, handwritten test series with detailed evaluation and a three-attempt progression.</p></div><div className="mt-12 overflow-hidden rounded-[2rem] border border-blue-100 bg-white p-2 shadow-xl shadow-blue-900/10"><img src={visualSources.pricing} alt="Featured Verityra test series and pricing cards" className="h-auto w-full rounded-[1.5rem]" /></div><div className="mt-10 flex justify-center"><Link href="/tests" className={cn(buttonVariants({ size: "lg" }), "rounded-xl bg-[#1465ed] hover:bg-[#0d53cc]")}>Explore all test series <ArrowRight data-icon="inline-end" /></Link></div></section>
      </main>
      <Footer />
    </div>
  )
}
