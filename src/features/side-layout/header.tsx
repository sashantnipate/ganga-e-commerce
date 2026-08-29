"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useUser, SignInButton, UserButton } from "@clerk/nextjs"
import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Header() {
  const { isLoaded, isSignedIn } = useUser()
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "border-b border-border bg-background/95 backdrop-blur-md shadow-sm"
          : "bg-background/80 backdrop-blur-sm"
      }`}
    >
      {/* Reduced px padding and max-width removed to align with screen edges */}
      <div className="mx-auto flex w-full flex-col gap-3 px-4 py-3 md:grid md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center md:gap-6">
        <Link href="/" className="flex items-center gap-3 self-center group">
          <span className="font-serif text-3xl font-extrabold italic tracking-tight text-foreground normal-case sm:text-4xl">
            Ganga
          </span>
        </Link>

        <form
          className="w-full md:max-w-xl md:justify-self-center"
          onSubmit={(event) => event.preventDefault()}
        >
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label="Search"
              className="h-10 rounded-full bg-muted/50 pl-10 border-transparent transition-colors focus:bg-background focus:border-input"
              name="search"
              placeholder="Search..."
              type="search"
            />
          </div>
        </form>

        <div className="flex items-center justify-start gap-2.5 md:justify-end">
          {!isLoaded ? (
            <Button className="h-10 rounded-full px-5" disabled variant="outline">
              Loading
            </Button>
          ) : isSignedIn ? (
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "size-10",
                },
              }}
            />
          ) : (
            <SignInButton mode="modal">
              <Button className="h-10 rounded-full px-6 shadow-sm">
                Sign in
              </Button>
            </SignInButton>
          )}
        </div>
      </div>
    </header>
  )
}