import { Spinner } from '@/components/ui/spinner'
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <main className="-mx-4 -mt-6 min-h-screen bg-[#f4eee7] px-6 py-10 text-[#2d241e] sm:-mx-6 sm:px-10 sm:py-14" aria-label="Loading product">
      <div className="mx-auto max-w-6xl">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(360px,1fr)] lg:gap-20">
          <Skeleton className="mx-auto aspect-[4/5] w-full max-w-md rounded-lg" />
          <div className="flex flex-col gap-6">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-14 w-4/5" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-9 w-32" />
              <Skeleton className="h-5 w-28" />
            </div>
            <Skeleton className="h-px w-full" />
            <Skeleton className="h-11 w-full rounded-md" />
          </div>
        </div>
        <div className="mt-16 border-t border-current/15 pt-10">
          <div className="flex items-center gap-2">
            <Spinner className="size-4" />
            <span className="text-sm text-muted-foreground">Loading product details…</span>
          </div>
          <Skeleton className="mt-6 h-5 w-full max-w-3xl" />
          <Skeleton className="mt-3 h-5 w-11/12 max-w-3xl" />
          <Skeleton className="mt-3 h-5 w-4/5 max-w-3xl" />
        </div>
      </div>
    </main>
  )
}
