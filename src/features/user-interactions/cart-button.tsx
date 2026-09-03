"use client"

import type { ComponentProps } from "react"
import { useState } from "react"
import { useClerk, useUser } from "@clerk/nextjs"
import { ShoppingCart } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

function CartIconButton(props: ComponentProps<typeof Button>) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-9 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
      aria-label="Open cart"
      {...props}
    >
      <ShoppingCart className="size-[18px]" />
    </Button>
  )
}

export function CartButton() {
  const clerk = useClerk()
  const [open, setOpen] = useState(false)
  const { isLoaded, isSignedIn } = useUser()

  if (!isLoaded) {
    return <CartIconButton />
  }

  if (!isSignedIn) {
    return <CartIconButton onClick={() => clerk.openSignIn({})} />
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <CartIconButton onClick={() => setOpen(true)} />
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Your cart</SheetTitle>
          <SheetDescription>
            Items you add to your cart will appear here.
          </SheetDescription>
        </SheetHeader>
        <p className="px-4 text-sm text-muted-foreground">
          Your cart is empty.
        </p>
      </SheetContent>
    </Sheet>
  )
}
