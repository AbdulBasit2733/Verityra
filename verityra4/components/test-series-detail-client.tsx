"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileText,
  Layers,
  RotateCcw,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TestRegistrationButton } from "@/components/test-registration-button"
import {
  computeSeriesPricingSummary,
  formatInr,
  formatStandard,
} from "@/lib/test-catalog-projection"

export interface DetailTest {
  id: string
  title: string
  subject: string
  description?: string | null
  price: number
  isStandalone: boolean
  maxMarks: number
  durationMinutes: number
  maxAttempts: number
  owned: boolean
}

export interface DetailSeries {
  id: string
  price: number
  owned: boolean
}

export interface DetailTemplate {
  id: string
  title: string
  required: boolean
  previewUrl: string
  downloadUrl: string
}

interface Props {
  header: {
    title: string
    description: string
    standard?: string | null
    stream?: string | null
  }
  series: DetailSeries | null
  tests: DetailTest[]
  selectedTestId: string | null
  templates: DetailTemplate[]
  instructions: string
  isSignedIn: boolean
}

type Target = "series" | "test"

function scrollToCheckout() {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  document
    .getElementById("checkout")
    ?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest" })
}

export function TestSeriesDetailClient({
  header,
  series,
  tests,
  selectedTestId,
  templates,
  instructions,
  isSignedIn,
}: Props) {
  const standaloneTests = tests.filter((t) => t.isStandalone)
  const firstBuyable = standaloneTests.find((t) => !t.owned) || standaloneTests[0]
  const initialTestId =
    standaloneTests.find((t) => t.id === selectedTestId)?.id ||
    firstBuyable?.id ||
    ""

  const [tab, setTab] = React.useState<string>(
    tests.length > 0 ? "individual" : "series"
  )
  const [target, setTarget] = React.useState<Target>(
    series && !(selectedTestId && initialTestId) ? "series" : "test"
  )
  const [testId, setTestId] = React.useState(initialTestId)

  const selectedTest = standaloneTests.find((t) => t.id === testId)
  const summary = computeSeriesPricingSummary(series?.price ?? 0, tests)

  const totalMarks = tests.reduce((s, t) => s + t.maxMarks, 0)
  const durations = tests.map((t) => t.durationMinutes)
  const maxDuration = durations.length ? Math.max(...durations) : 0
  const attempts = tests.length ? Math.max(...tests.map((t) => t.maxAttempts)) : 3

  const activeTarget: Target =
    target === "series" && series ? "series" : selectedTest ? "test" : "series"
  const activePrice =
    activeTarget === "series" ? (series?.price ?? 0) : (selectedTest?.price ?? 0)
  const activeId =
    activeTarget === "series" ? (series?.id ?? "") : (selectedTest?.id ?? "")
  const activeOwned =
    activeTarget === "series" ? Boolean(series?.owned) : Boolean(selectedTest?.owned)
  const activeLabel =
    activeTarget === "series" ? "Complete test series" : selectedTest?.subject || "Subject test"

  const chooseTest = (id: string) => {
    setTarget("test")
    setTestId(id)
    scrollToCheckout()
  }
  const chooseSeries = () => {
    setTarget("series")
    scrollToCheckout()
  }

  const metrics = [
    series && { label: "Subject tests", value: String(tests.length) },
    {
      label: tests.length > 1 ? "Total marks" : "Maximum marks",
      value: String(totalMarks),
    },
    { label: "Duration per paper", value: `${maxDuration} min` },
    { label: "Attempts per paper", value: String(attempts) },
  ].filter(Boolean) as Array<{ label: string; value: string }>

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 pb-28 sm:px-6 lg:px-8 lg:pb-12">
      <Link
        href="/tests"
        className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Test library
      </Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-10">
        <div className="min-w-0">
          <header className="border-b border-border pb-6">
            <div className="flex flex-wrap items-center gap-2">
              {header.standard && (
                <Badge variant="secondary" className="text-xs font-semibold">
                  {formatStandard(header.standard)}
                </Badge>
              )}
              {header.stream && (
                <Badge variant="secondary" className="text-xs font-semibold">
                  {header.stream}
                </Badge>
              )}
              <Badge variant="outline" className="text-xs font-semibold">
                {series ? "Test series" : "Subject test"}
              </Badge>
            </div>
            <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight [overflow-wrap:break-word] sm:text-4xl">
              {header.title}
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
              {header.description}
            </p>
            <dl className="mt-6 grid grid-cols-2 divide-border border-t border-border pt-5 sm:grid-cols-4 sm:divide-x">
              {metrics.map((m) => (
                <div key={m.label} className="py-2 sm:px-4 sm:first:pl-0">
                  <dt className="text-xs text-muted-foreground">{m.label}</dt>
                  <dd className="mt-1 text-lg font-semibold tabular-nums">
                    {m.value}
                  </dd>
                </div>
              ))}
            </dl>
          </header>

          <Tabs value={tab} onValueChange={(v) => setTab(String(v))} className="mt-6">
            <TabsList
              variant="line"
              aria-label="Choose how to buy"
              className="w-full justify-start border-b border-border"
            >
              {tests.length > 0 && (
                <TabsTrigger value="individual" className="gap-2">
                  <FileText className="h-4 w-4" aria-hidden="true" />
                  Individual tests ({tests.length})
                </TabsTrigger>
              )}
              {series && (
                <TabsTrigger value="series" className="gap-2">
                  <Layers className="h-4 w-4" aria-hidden="true" />
                  Test series
                </TabsTrigger>
              )}
            </TabsList>

            {tests.length > 0 && (
              <TabsContent value="individual" className="pt-5">
                {series && summary.hasSavings && (
                  <p className="mb-4 rounded-md border border-primary/30 bg-secondary px-4 py-3 text-sm text-secondary-foreground">
                    Buying these {summary.standaloneCount} subjects separately costs{" "}
                    <strong className="tabular-nums">
                      {formatInr(summary.individualTotalPaise)}
                    </strong>
                    . The complete test series is{" "}
                    <strong className="tabular-nums">{formatInr(series.price)}</strong>, a
                    saving of{" "}
                    <strong className="tabular-nums">
                      {formatInr(summary.savingsPaise)} ({summary.savingsPercent}%)
                    </strong>
                    .
                  </p>
                )}
                <ul className="divide-y divide-border rounded-md border border-border bg-card">
                  {tests.map((t) => {
                    const selected = activeTarget === "test" && selectedTest?.id === t.id
                    return (
                      <li
                        key={t.id}
                        className={`flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between ${selected ? "bg-secondary/60" : ""}`}
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary" className="text-xs font-semibold">
                              {t.subject}
                            </Badge>
                            <h3 className="text-sm font-semibold">{t.title}</h3>
                          </div>
                          {t.description && (
                            <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
                              {t.description}
                            </p>
                          )}
                          <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <Award className="h-3.5 w-3.5" aria-hidden="true" />
                              {t.maxMarks} marks
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                              {t.durationMinutes} min
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                              {t.maxAttempts} attempts
                            </span>
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center justify-between gap-4 sm:justify-end">
                          <span className="text-base font-semibold tabular-nums">
                            {!t.isStandalone
                              ? "In series"
                              : t.price === 0
                                ? "Free"
                                : formatInr(t.price)}
                          </span>
                          {t.owned ? (
                            <Link
                              href={`/student/tests/${t.id}`}
                              className="inline-flex h-11 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-hover-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                            >
                              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                              Go to test
                            </Link>
                          ) : t.isStandalone ? (
                            <button
                              type="button"
                              onClick={() => chooseTest(t.id)}
                              aria-pressed={selected}
                              className="inline-flex h-11 items-center rounded-md border border-border bg-card px-4 text-sm font-semibold hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                            >
                              {t.price === 0 ? "Select to register" : "Select to buy"}
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={chooseSeries}
                              className="inline-flex h-11 items-center rounded-md border border-border bg-card px-4 text-sm font-semibold hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                            >
                              Get with series
                            </button>
                          )}
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </TabsContent>
            )}

            {series && (
              <TabsContent value="series" className="pt-5">
                <h2 className="text-lg font-semibold">Compare your options</h2>
                <div className="mt-3 overflow-x-auto rounded-md border border-border bg-card">
                  <table className="w-full min-w-[460px] text-left text-sm">
                    <caption className="sr-only">
                      Price comparison between individual subject tests and the
                      complete test series
                    </caption>
                    <thead className="border-b border-border bg-muted/60">
                      <tr>
                        <th scope="col" className="px-4 py-3 font-semibold">
                          What you get
                        </th>
                        <th scope="col" className="px-4 py-3 font-semibold">
                          Buy individually
                        </th>
                        <th scope="col" className="px-4 py-3 font-semibold text-primary">
                          Test series
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {standaloneTests.map((t) => (
                        <tr key={t.id}>
                          <th scope="row" className="px-4 py-3 font-medium">
                            {t.subject}
                          </th>
                          <td className="px-4 py-3 tabular-nums">
                            {t.price === 0 ? "Free" : formatInr(t.price)}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">Included</td>
                        </tr>
                      ))}
                      <tr className="bg-muted/40 font-semibold">
                        <th scope="row" className="px-4 py-3">
                          Total price
                        </th>
                        <td className="px-4 py-3 tabular-nums">
                          {formatInr(summary.individualTotalPaise)}
                        </td>
                        <td className="px-4 py-3 text-primary tabular-nums">
                          {series.price === 0 ? "Free" : formatInr(series.price)}
                        </td>
                      </tr>
                      {summary.hasSavings && (
                        <tr>
                          <th scope="row" className="px-4 py-3 font-medium">
                            You save
                          </th>
                          <td className="px-4 py-3 text-muted-foreground">Nothing</td>
                          <td className="px-4 py-3 font-semibold text-emerald-700 tabular-nums">
                            {formatInr(summary.savingsPaise)} ({summary.savingsPercent}%)
                          </td>
                        </tr>
                      )}
                      <tr>
                        <th scope="row" className="px-4 py-3 font-medium">
                          Attempts per paper
                        </th>
                        <td className="px-4 py-3 tabular-nums">{attempts}</td>
                        <td className="px-4 py-3 tabular-nums">{attempts}</td>
                      </tr>
                      <tr>
                        <th scope="row" className="px-4 py-3 font-medium">
                          Answer sheet template and score report
                        </th>
                        <td className="px-4 py-3">Yes</td>
                        <td className="px-4 py-3">Yes</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <section className="mt-8 border-t border-border pt-6">
                  <h2 className="text-lg font-semibold">Before you begin</h2>
                  <div className="mt-3 border-l-2 border-primary/40 pl-4 text-sm leading-7 whitespace-pre-line text-foreground/80">
                    {instructions}
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">
                    You can submit up to {attempts} accepted responses per paper. Each
                    submission is evaluated separately.
                  </p>
                </section>

                {templates.length > 0 && (
                  <section className="mt-8 border-t border-border pt-6">
                    <h2 className="text-lg font-semibold">Answer sheet templates</h2>
                    <ul className="mt-3 divide-y divide-border border-y border-border">
                      {templates.map((tpl) => (
                        <li
                          key={tpl.id}
                          className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div>
                            <p className="text-sm font-semibold">{tpl.title}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {tpl.required ? "Required for this series" : "Recommended format"}
                            </p>
                          </div>
                          {series.owned ? (
                            <div className="flex items-center gap-2">
                              <a
                                href={tpl.previewUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex h-11 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-sm font-semibold hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                              >
                                <Eye className="h-4 w-4" aria-hidden="true" />
                                Preview
                              </a>
                              <a
                                href={tpl.downloadUrl}
                                target="_blank"
                                rel="noreferrer"
                                download
                                className="inline-flex h-11 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground hover:bg-hover-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                              >
                                <Download className="h-4 w-4" aria-hidden="true" />
                                Download
                              </a>
                            </div>
                          ) : (
                            <span className="text-xs font-medium text-muted-foreground">
                              Available after enrollment
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </TabsContent>
            )}
          </Tabs>

          {!series && (
            <section className="mt-8 border-t border-border pt-6">
              <h2 className="text-lg font-semibold">Before you begin</h2>
              <div className="mt-3 border-l-2 border-primary/40 pl-4 text-sm leading-7 whitespace-pre-line text-foreground/80">
                {instructions}
              </div>
            </section>
          )}
        </div>

        <aside id="checkout" aria-label="Purchase options" className="self-start lg:sticky lg:top-24">
          <div className="rounded-md border border-border bg-card p-5">
            <h2 className="text-lg font-semibold">Choose what to buy</h2>

            <fieldset className="mt-4 space-y-3">
              <legend className="sr-only">Purchase option</legend>
              {series && (
                <label
                  className={`block cursor-pointer rounded-md border p-4 focus-within:ring-2 focus-within:ring-ring ${activeTarget === "series" ? "border-primary bg-secondary/60" : "border-border"}`}
                >
                  <input
                    type="radio"
                    name="purchase-target"
                    className="sr-only"
                    checked={activeTarget === "series"}
                    onChange={() => setTarget("series")}
                  />
                  <span className="flex items-start justify-between gap-3">
                    <span className="text-sm font-semibold">Complete test series</span>
                    <span className="text-right">
                      {summary.hasSavings && (
                        <span className="block text-xs text-muted-foreground line-through tabular-nums">
                          {formatInr(summary.individualTotalPaise)}
                        </span>
                      )}
                      <span className="text-lg font-bold text-primary tabular-nums">
                        {series.price === 0 ? "Free" : formatInr(series.price)}
                      </span>
                    </span>
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    All {tests.length} subject tests
                    {summary.hasSavings
                      ? `, save ${formatInr(summary.savingsPaise)}`
                      : ""}
                  </span>
                </label>
              )}

              {selectedTest && (
                <div
                  className={`rounded-md border p-4 focus-within:ring-2 focus-within:ring-ring ${activeTarget === "test" ? "border-primary bg-secondary/60" : "border-border"}`}
                >
                  <label className="block cursor-pointer">
                    <input
                      type="radio"
                      name="purchase-target"
                      className="sr-only"
                      checked={activeTarget === "test"}
                      onChange={() => setTarget("test")}
                    />
                    <span className="flex items-start justify-between gap-3">
                      <span className="text-sm font-semibold">Single subject test</span>
                      <span className="text-lg font-bold tabular-nums">
                        {selectedTest.price === 0 ? "Free" : formatInr(selectedTest.price)}
                      </span>
                    </span>
                  </label>
                  {standaloneTests.length > 1 && (
                    <div className="mt-3">
                      <label htmlFor="subject-test-select" className="text-xs text-muted-foreground">
                        Subject
                      </label>
                      <select
                        id="subject-test-select"
                        value={selectedTest.id}
                        onChange={(e) => {
                          setTestId(e.target.value)
                          setTarget("test")
                        }}
                        className="mt-1 h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                      >
                        {standaloneTests.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.subject}
                            {t.owned ? " (unlocked)" : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <span className="mt-2 block text-xs text-muted-foreground">
                    {selectedTest.maxMarks} marks, {selectedTest.durationMinutes} min,{" "}
                    {selectedTest.maxAttempts} attempts
                  </span>
                </div>
              )}
            </fieldset>

            <div className="mt-5" aria-live="polite">
              <TestRegistrationButton
                key={`${activeTarget}-${activeId}`}
                testSeriesId={activeId}
                isFree={activePrice === 0}
                priceInRupees={activePrice / 100}
                isRegistered={activeOwned}
                isSignedIn={isSignedIn}
                ctaLabel={
                  activeTarget === "series"
                    ? `Unlock test series, ${formatInr(activePrice)}`
                    : `Buy ${activeLabel} test, ${formatInr(activePrice)}`
                }
                freeCtaLabel={
                  activeTarget === "series"
                    ? "Register for free series"
                    : `Register for free ${activeLabel} test`
                }
                enrolledLabel={
                  activeTarget === "series"
                    ? "You have access to this test series."
                    : `You have access to this ${activeLabel} test.`
                }
              />
            </div>

            <ul className="mt-5 space-y-2 border-t border-border pt-4 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
                Official answer sheet template
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
                Question-by-question score report
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
                Up to {attempts} attempts per paper
              </li>
            </ul>
          </div>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-3 border-t border-border bg-background px-4 py-3 lg:hidden">
        <div className="min-w-0">
          <p className="truncate text-xs text-muted-foreground">{activeLabel}</p>
          <p className="text-lg font-bold tabular-nums">
            {activePrice === 0 ? "Free" : formatInr(activePrice)}
          </p>
        </div>
        <a
          href="#checkout"
          className="inline-flex h-11 items-center gap-1.5 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-hover-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          {activeOwned ? "View access" : "Buy options"}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>
    </div>
  )
}
