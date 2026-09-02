"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useUser, SignInButton, UserButton } from "@clerk/nextjs"
import { Search, SlidersHorizontal, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface HeaderProps {
  filtersOpen: boolean
  onToggleFilters: () => void
}

export function Header({
  filtersOpen,
  onToggleFilters,
}: HeaderProps) {
  const { isLoaded, isSignedIn } = useUser()
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8)
    }

    window.addEventListener("scroll", handleScroll)

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-200 ${
        isScrolled
          ? "bg-background/95 shadow-sm backdrop-blur-md"
          : "bg-background"
      }`}
    >
      <div className="mx-auto flex h-[72px] w-full items-center gap-5 px-4 sm:px-6">

        {/* Logo */}
        <Link
          href="/"
          className="shrink-0"
          aria-label="Ganga home"
        >
          <span
            className="
              font-serif
              text-[32px]
              font-bold
              leading-none
              tracking-[-0.055em]
              text-foreground
            "
          >
            Ganga
          </span>
        </Link>

        {/* Search */}
        <form
          className="mx-auto w-full max-w-[620px]"
          onSubmit={(event) => event.preventDefault()}
        >
          <div className="relative">
            <Search
              className="
                pointer-events-none
                absolute
                left-3.5
                top-1/2
                size-[17px]
                -translate-y-1/2
                text-muted-foreground
              "
            />

            <Input
              aria-label="Search"
              name="search"
              placeholder="Search products..."
              type="search"
              className="
                h-10
                rounded-full
                border-transparent
                bg-muted/50
                pl-10
                text-sm
                shadow-none
                transition-colors
                placeholder:text-muted-foreground
                focus:border-border
                focus:bg-background
                focus:ring-1
                focus:ring-ring/20
              "
            />
          </div>
        </form>

        {/* Right controls */}
        <div className="flex shrink-0 items-center gap-2">

          {/* Filter toggle */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onToggleFilters}
            className="
              size-9
              rounded-full
              text-muted-foreground
              hover:bg-muted
              hover:text-foreground
            "
            aria-label={
              filtersOpen ? "Close filters" : "Open filters"
            }
          >
            {filtersOpen ? (
              <X className="size-[18px]" />
            ) : (
              <SlidersHorizontal className="size-[18px]" />
            )}
          </Button>

          {/* User */}
          {!isLoaded ? (
            <Button
              className="h-9 rounded-full px-4"
              disabled
              variant="outline"
            >
              Loading
            </Button>
          ) : isSignedIn ? (
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "size-9",
                },
              }}
            />
          ) : (
            <SignInButton mode="modal">
              <Button className="h-9 rounded-full px-5">
                Sign in
              </Button>
            </SignInButton>
          )}
        </div>
      </div>
    </header>
  )
}