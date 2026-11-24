"use client"

import * as React from "react"
import type { TestCatalogItem } from "./test-catalog-client"

export type CatalogSort =
  "NEWEST" | "PRICE_ASC" | "PRICE_DESC" | "MARKS_DESC" | "DURATION_DESC"

export type CatalogFormat = "ALL" | "BUNDLE" | "SINGLE"

export function useTestCatalogState(items: TestCatalogItem[]) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [pricingFilter, setPricingFilter] = React.useState<
    "ALL" | "FREE" | "PAID"
  >("ALL")
  const [formatFilter, setFormatFilter] = React.useState<CatalogFormat>("ALL")
  const [standardFilter, setStandardFilter] = React.useState("ALL")
  const [categoryFilter, setCategoryFilter] = React.useState("ALL")
  const [sortBy, setSortBy] = React.useState<CatalogSort>("NEWEST")
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(6)

  const filteredItems = React.useMemo(() => {
    const result = items.filter((item) => {
      const text =
        `${item.title} ${item.description} ${item.slug} ${item.standard || ""} ${item.subject || ""} ${item.studentInstructions || ""}`.toLowerCase()
      const categoryText = `${item.title} ${item.description} ${item.standard || ""}`.toLowerCase()
      
      const matchesSearch =
        !searchQuery.trim() || text.includes(searchQuery.toLowerCase().trim())
      
      const matchesPrice =
        pricingFilter === "ALL" ||
        (pricingFilter === "FREE" ? item.price === 0 : item.price > 0)
      
      const matchesFormat =
        formatFilter === "ALL" ||
        (formatFilter === "BUNDLE"
          ? item.type === "BUNDLE"
          : item.type !== "BUNDLE")

      const matchesStandard =
        standardFilter === "ALL" ||
        (item.standard && item.standard.toLowerCase().includes(standardFilter.toLowerCase())) ||
        (standardFilter === "10th" && (text.includes("10th") || text.includes("class 10") || text.includes("class x"))) ||
        (standardFilter === "11th" && (text.includes("11th") || text.includes("class 11") || text.includes("class xi"))) ||
        (standardFilter === "12th" && (text.includes("12th") || text.includes("class 12") || text.includes("class xii"))) ||
        (standardFilter === "NEET" && (text.includes("neet") || text.includes("medical"))) ||
        (standardFilter === "JEE" && (text.includes("jee") || text.includes("iit"))) ||
        (standardFilter === "FOUNDATION" && (text.includes("foundation") || text.includes("olympiad") || text.includes("ntse")))

      const matchesCategory =
        categoryFilter === "ALL" ||
        (categoryFilter === "SCHOOL_BOARDS" &&
          (categoryText.includes("cbse") ||
            categoryText.includes("icse") ||
            categoryText.includes("isc") ||
            categoryText.includes("state board") ||
            categoryText.includes("class ") ||
            categoryText.includes("10th") ||
            categoryText.includes("12th") ||
            categoryText.includes("board") ||
            categoryText.includes("kg") ||
            categoryText.includes("primary"))) ||
        (categoryFilter === "NEET" &&
          (categoryText.includes("neet") ||
            categoryText.includes("biology") ||
            categoryText.includes("medical"))) ||
        (categoryFilter === "JEE" &&
          (categoryText.includes("jee") || categoryText.includes("iit"))) ||
        (categoryFilter === "FOUNDATION_OLYMPIADS" &&
          (categoryText.includes("foundation") ||
            categoryText.includes("olympiad") ||
            categoryText.includes("ntse"))) ||
        (categoryFilter === "UGC_NET_ENGLISH" &&
          (categoryText.includes("ugc") ||
            categoryText.includes("net") ||
            categoryText.includes("english") ||
            categoryText.includes("grammar")))

      return matchesSearch && matchesPrice && matchesFormat && matchesStandard && matchesCategory
    })
    return result.sort((a, b) => {
      if (sortBy === "PRICE_ASC") return a.price - b.price
      if (sortBy === "PRICE_DESC") return b.price - a.price
      if (sortBy === "MARKS_DESC") return b.maxMarks - a.maxMarks
      if (sortBy === "DURATION_DESC")
        return b.durationMinutes - a.durationMinutes
      return (
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
      )
    })
  }, [items, searchQuery, pricingFilter, formatFilter, standardFilter, categoryFilter, sortBy])

  React.useEffect(
    () => setCurrentPage(1),
    [searchQuery, pricingFilter, formatFilter, standardFilter, categoryFilter, sortBy]
  )

  const pageItems = React.useMemo(
    () =>
      filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filteredItems, currentPage, pageSize]
  )
  const reset = () => {
    setSearchQuery("")
    setPricingFilter("ALL")
    setFormatFilter("ALL")
    setStandardFilter("ALL")
    setCategoryFilter("ALL")
    setSortBy("NEWEST")
    setCurrentPage(1)
  }

  return {
    searchQuery,
    setSearchQuery,
    pricingFilter,
    setPricingFilter,
    formatFilter,
    setFormatFilter,
    standardFilter,
    setStandardFilter,
    categoryFilter,
    setCategoryFilter,
    sortBy,
    setSortBy,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    filteredItems,
    pageItems,
    reset,
    hasActiveFilters: Boolean(
      searchQuery ||
      pricingFilter !== "ALL" ||
      formatFilter !== "ALL" ||
      standardFilter !== "ALL" ||
      categoryFilter !== "ALL" ||
      sortBy !== "NEWEST"
    ),
  }
}
