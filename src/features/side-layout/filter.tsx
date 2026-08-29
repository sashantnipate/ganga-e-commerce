"use client"

import { useState } from "react"
import { SlidersHorizontal, RotateCcw } from "lucide-react"

import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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

interface FilterSidebarProps {
  totalResults?: number
}

export function FilterSidebar({ totalResults = 132 }: FilterSidebarProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [minPrice, setMinPrice] = useState<string>("")
  const [maxPrice, setMaxPrice] = useState<string>("")

  const handleCategoryToggle = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleTagToggle = (id: string) => {
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
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

  return (
    <div className="w-full space-y-6 bg-transparent pr-2 text-card-foreground">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="size-4 text-foreground" />
          <h2 className="text-base font-bold tracking-tight">Filters</h2>
        </div>
        <span className="text-xs text-muted-foreground">{totalResults} results</span>
      </div>

      {/* Category Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Category</h3>
        <div className="space-y-2.5">
          {CATEGORIES.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Checkbox
                  id={`cat-${cat.id}`}
                  checked={selectedCategories.includes(cat.id)}
                  onCheckedChange={() => handleCategoryToggle(cat.id)}
                />
                <label
                  htmlFor={`cat-${cat.id}`}
                  className="cursor-pointer text-sm leading-none text-foreground/90"
                >
                  {cat.label}
                </label>
              </div>
              <span className="text-xs text-muted-foreground">({cat.count})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Price Section */}
      <div className="space-y-3 pt-1">
        <h3 className="text-sm font-semibold text-foreground">Price (₹)</h3>
        
        <div className="grid grid-cols-2 gap-2">
          {/* Min Price Input */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-muted-foreground">
              Min Price
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-2.5 text-xs text-muted-foreground font-semibold">₹</span>
              <Input
                type="number"
                placeholder="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="h-9 pl-6 pr-2 text-xs"
              />
            </div>
          </div>

          {/* Max Price Input */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-muted-foreground">
              Max Price
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-2.5 text-xs text-muted-foreground font-semibold">₹</span>
              <Input
                type="number"
                placeholder="5000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="h-9 pl-6 pr-2 text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tags Section */}
      <div className="space-y-3 pt-1">
        <h3 className="text-sm font-semibold text-foreground">Tags</h3>
        <div className="flex flex-wrap gap-1.5">
          {TAGS.map((tag) => {
            const isSelected = selectedTags.includes(tag.id)
            return (
              <Badge
                key={tag.id}
                variant={isSelected ? "default" : "secondary"}
                className="cursor-pointer font-normal text-xs transition-colors"
                onClick={() => handleTagToggle(tag.id)}
              >
                {tag.label}
              </Badge>
            )
          })}
        </div>
      </div>

      {/* Reset Action */}
      {activeFilterCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="w-full justify-center gap-2 text-xs text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="size-3.5" />
          Reset Filters ({activeFilterCount})
        </Button>
      )}
    </div>
  )
}