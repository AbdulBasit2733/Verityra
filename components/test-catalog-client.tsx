"use client"

import { TestCatalogDesktop } from "./test-catalog-desktop"
import { TestCatalogMobile } from "./test-catalog-mobile"

export interface TestCatalogItem {
  id: string
  title: string
  slug: string
  description: string
  price: number
  maxMarks: number
  durationMinutes: number
  maxAttempts: number
  studentInstructions?: string
  papersCount?: number
  templatesCount?: number
  createdAt?: string
}

export function TestCatalogClient({ testSeriesList }: { testSeriesList: TestCatalogItem[] }) {
  return <>
    <TestCatalogDesktop items={testSeriesList} />
    <TestCatalogMobile items={testSeriesList} />
  </>
}
