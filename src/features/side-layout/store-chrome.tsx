"use client"

import { useState } from "react"

import { Header } from "@/features/side-layout/header"
import { FilterSidebar } from "@/features/side-layout/filter"

interface StoreChromeProps {
  children: React.ReactNode
}

export function StoreChrome({ children }: StoreChromeProps) {
  const [filtersOpen, setFiltersOpen] = useState(false)

  const toggleFilters = () => {
    setFiltersOpen((prev) => !prev)
  }

  return (
    <div className="min-h-screen">
      <Header
        filtersOpen={filtersOpen}
        onToggleFilters={toggleFilters}
      />

      <div className="w-full px-4 sm:px-6">
        {filtersOpen && (
          <FilterSidebar
            totalResults={132}
          />
        )}

        <main className="w-full min-w-0 pb-10 pt-6">
          {children}
        </main>
      </div>
    </div>
  )
}