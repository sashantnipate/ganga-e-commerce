'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { ComponentProps } from 'react'

import { Spinner } from '@/components/ui/spinner'

type ProductLinkProps = ComponentProps<typeof Link>

export function ProductLink({ children, onClick, ...props }: ProductLinkProps) {
  const [isNavigating, setIsNavigating] = useState(false)

  return (
    <Link
      {...props}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) setIsNavigating(true)
      }}
      aria-busy={isNavigating || undefined}
      className={`group relative block focus-visible:outline-none ${props.className ?? ''}`}
    >
      {children}
      {isNavigating && (
        <span className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-background/45 backdrop-blur-[1px]">
          <span className="rounded-full bg-background p-3 shadow-md" aria-label="Opening product">
            <Spinner className="size-5" />
          </span>
        </span>
      )}
    </Link>
  )
}
