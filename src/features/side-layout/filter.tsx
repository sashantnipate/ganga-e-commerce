"use client"

import { useState } from "react"
import {
  SlidersHorizontal,
  RotateCcw,
  ChevronDown,
} from "lucide-react"

import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"

const CATEGORIES = [
  { id: "electronics", label: "Electronics", count: 42 },
  { id: "clothing", label: "Clothing", count: 35 },
  { id: "home-living", label: "Home & Living", count: 28 },
  { id: "footwear", label: "Footwear", count: 19 },
]

const TAGS = [
  { id: "new-arrival", label: "New Arrival" },
  { id: "bestseller", label: "Bestseller" },
  { id: "sale", label: "On Sale" },
  { id: "featured", label: "Featured" },
  { id: "trending", label: "Trending" },
]

type Section = "category" | "price" | "tags" | null

interface FilterSidebarProps {
  totalResults?: number
  filtersOpen?: boolean
  onToggleFilters?: () => void
}

export function FilterSidebar({
  totalResults = 132,
  filtersOpen = false,
}: FilterSidebarProps) {
  const [selectedCategories, setSelectedCategories] =
    useState<string[]>([])

  const [selectedTags, setSelectedTags] =
    useState<string[]>([])

  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")

  const [openSection, setOpenSection] =
    useState<Section>(null)

  const handleCategoryToggle = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    )
  }

  const handleTagToggle = (id: string) => {
    setSelectedTags((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    )
  }

  const handleReset = () => {
    setSelectedCategories([])
    setSelectedTags([])
    setMinPrice("")
    setMaxPrice("")
  }

  const activeFilterCount =
    selectedCategories.length +
    selectedTags.length +
    (minPrice ? 1 : 0) +
    (maxPrice ? 1 : 0)

  const toggleSection = (section: Section) => {
    setOpenSection((current) =>
      current === section ? null : section
    )
  }

  /*
   * Header controls whether the filter system is visible.
   * When filters are closed, only the compact filter row is shown.
   */
  return (
    <div className="w-full">

      {/* Compact Filter Bar */}
      <div className="flex min-h-[58px] items-center justify-between border-b">

        <div className="flex items-center gap-2">

          <div className="mr-1 flex items-center gap-2 text-sm font-semibold">
            <SlidersHorizontal className="size-[16px]" />
            <span className="hidden sm:inline">
              Filters
            </span>
          </div>

          {/* Category */}
          <button
            type="button"
            onClick={() => toggleSection("category")}
            className={`flex h-9 items-center gap-2 rounded-full border px-3.5 text-sm transition-colors ${
              openSection === "category"
                ? "border-foreground bg-foreground text-background"
                : "bg-background hover:bg-muted"
            }`}
          >
            Category
            {selectedCategories.length > 0 && (
              <span className="text-[11px] opacity-70">
                {selectedCategories.length}
              </span>
            )}
            <ChevronDown
              className={`size-3.5 transition-transform ${
                openSection === "category"
                  ? "rotate-180"
                  : ""
              }`}
            />
          </button>

          {/* Price */}
          <button
            type="button"
            onClick={() => toggleSection("price")}
            className={`flex h-9 items-center gap-2 rounded-full border px-3.5 text-sm transition-colors ${
              openSection === "price"
                ? "border-foreground bg-foreground text-background"
                : "bg-background hover:bg-muted"
            }`}
          >
            Price
            {(minPrice || maxPrice) && (
              <span className="text-[11px] opacity-70">
                1
              </span>
            )}
            <ChevronDown
              className={`size-3.5 transition-transform ${
                openSection === "price"
                  ? "rotate-180"
                  : ""
              }`}
            />
          </button>

          {/* Tags */}
          <button
            type="button"
            onClick={() => toggleSection("tags")}
            className={`flex h-9 items-center gap-2 rounded-full border px-3.5 text-sm transition-colors ${
              openSection === "tags"
                ? "border-foreground bg-foreground text-background"
                : "bg-background hover:bg-muted"
            }`}
          >
            Tags
            {selectedTags.length > 0 && (
              <span className="text-[11px] opacity-70">
                {selectedTags.length}
              </span>
            )}
            <ChevronDown
              className={`size-3.5 transition-transform ${
                openSection === "tags"
                  ? "rotate-180"
                  : ""
              }`}
            />
          </button>

          {/* Reset */}
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={handleReset}
              className="
                ml-1
                flex
                items-center
                gap-1.5
                text-xs
                text-muted-foreground
                transition-colors
                hover:text-foreground
              "
            >
              <RotateCcw className="size-3.5" />
              <span className="hidden sm:inline">
                Clear
              </span>
            </button>
          )}
        </div>

        <span className="text-xs text-muted-foreground sm:text-sm">
          {totalResults} results
        </span>
      </div>

      {/* Expanded Section */}
      {filtersOpen && openSection && (
        <div className="border-b bg-muted/20 px-2 py-5 sm:px-4">

          {/* Category */}
          {openSection === "category" && (
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Category
              </p>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {CATEGORIES.map((category) => {
                  const checked =
                    selectedCategories.includes(category.id)

                  return (
                    <label
                      key={category.id}
                      htmlFor={`category-${category.id}`}
                      className={`
                        flex
                        cursor-pointer
                        items-center
                        justify-between
                        rounded-lg
                        border
                        px-3
                        py-2.5
                        transition-colors
                        ${
                          checked
                            ? "border-foreground/20 bg-background"
                            : "bg-background hover:bg-muted"
                        }
                      `}
                    >
                      <div className="flex items-center gap-2.5">
                        <Checkbox
                          id={`category-${category.id}`}
                          checked={checked}
                          onCheckedChange={() =>
                            handleCategoryToggle(category.id)
                          }
                        />

                        <span className="text-sm">
                          {category.label}
                        </span>
                      </div>

                      <span className="text-xs text-muted-foreground">
                        {category.count}
                      </span>
                    </label>
                  )
                })}
              </div>
            </div>
          )}

          {/* Price */}
          {openSection === "price" && (
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Price range
              </p>

              <div className="flex max-w-[520px] items-center gap-3">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    ₹
                  </span>

                  <Input
                    type="number"
                    placeholder="Minimum"
                    value={minPrice}
                    onChange={(e) =>
                      setMinPrice(e.target.value)
                    }
                    className="h-10 rounded-lg bg-background pl-8 shadow-none"
                  />
                </div>

                <span className="text-muted-foreground">
                  —
                </span>

                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    ₹
                  </span>

                  <Input
                    type="number"
                    placeholder="Maximum"
                    value={maxPrice}
                    onChange={(e) =>
                      setMaxPrice(e.target.value)
                    }
                    className="h-10 rounded-lg bg-background pl-8 shadow-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tags */}
          {openSection === "tags" && (
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Tags
              </p>

              <div className="flex flex-wrap gap-2">
                {TAGS.map((tag) => {
                  const selected =
                    selectedTags.includes(tag.id)

                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() =>
                        handleTagToggle(tag.id)
                      }
                      className={`
                        rounded-full
                        border
                        px-3.5
                        py-1.5
                        text-sm
                        transition-colors
                        ${
                          selected
                            ? "border-foreground bg-foreground text-background"
                            : "bg-background hover:bg-muted"
                        }
                      `}
                    >
                      {tag.label}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}