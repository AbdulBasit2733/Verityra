import { ExamPathsSection } from "@/components/landing/exam-paths-section"
import { HeroSection } from "@/components/landing/hero-section"
import { PreparationSection } from "@/components/landing/preparation-section"
import { ProgressSection } from "@/components/landing/progress-section"

export const revalidate = 300

export default function HomePage() {
  return (
    <div className="landing-light min-h-screen overflow-x-hidden bg-[var(--surface-canvas)] text-[var(--ink-primary)] selection:bg-blue-100 selection:text-[var(--brand-sapphire-hover)]">
      <main id="main-content">
        <HeroSection />
        <PreparationSection />
        <ExamPathsSection />
        <ProgressSection />
      </main>
    </div>
  )
}
