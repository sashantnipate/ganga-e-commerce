"use client"

import type { ComponentProps } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useClerk, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { ArrowUpRight, Loader2, ShoppingCart } from 'lucide-react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { getDraftOrder, getOrderHistory, setDraftQuantity, submitDraftOrder, type CheckoutAddress } from './cart-api'
import { CartProductItem } from './cart-product-item'
import type { CartOrder } from './cart-types'
import { clearCartCache, readCartCache, writeCartCache } from './cart-cache'
import { OrderTimeline } from './order-timeline'

function CartIconButton(props: ComponentProps<typeof Button>) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="relative size-9 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
      aria-label="Open cart"
      {...props}
    >
      <ShoppingCart className="size-[18px]" />
    </Button>
  )
}

function CartLoading() {
  return (
    <div className="space-y-3 px-4">
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-8 w-1/2" />
    </div>
  )
}

const itemCount = (order: CartOrder | null) => order?.items.length ?? 0
const productId = (item: CartOrder['items'][number]) => typeof item.product === 'string' ? item.product : item.product.id

export function CartButton() {
  const clerk = useClerk()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<CartOrder | null>(null)
  const [orders, setOrders] = useState<CartOrder[]>([])
  const [draftLoading, setDraftLoading] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState<CheckoutAddress>({ line1: '', city: '', state: '', postalCode: '', country: 'India' })
  const draftRequest = useRef<Promise<void> | null>(null)
  const historyRequest = useRef<Promise<void> | null>(null)
  const quantityTimers = useRef(new Map<string, number>())
  const quantityVersions = useRef(new Map<string, number>())
  const { isLoaded, isSignedIn, user } = useUser()

  const loadDraft = useCallback(async () => {
    if (draftRequest.current) return draftRequest.current
    setDraftLoading(true)
    setError(null)
    const request = getDraftOrder().then(({ draft: nextDraft }) => setDraft(nextDraft)).catch((loadError) => setError(loadError instanceof Error ? loadError.message : 'Unable to load your cart.')).finally(() => { setDraftLoading(false); draftRequest.current = null })
    draftRequest.current = request
    return request
  }, [])

  const loadHistory = useCallback(async () => {
    if (historyRequest.current) return historyRequest.current
    setHistoryLoading(true)
    setError(null)
    const request = getOrderHistory().then(({ orders: nextOrders }) => setOrders(nextOrders)).catch((loadError) => setError(loadError instanceof Error ? loadError.message : 'Unable to load your order history.')).finally(() => { setHistoryLoading(false); historyRequest.current = null })
    historyRequest.current = request
    return request
  }, [])

  useEffect(() => {
    if (!isLoaded) return

    if (!isSignedIn) {
      setDraft(null)
      setOrders([])
      clearCartCache()
      return
    }

    const cached = user?.id ? readCartCache(user.id) : null
    if (cached) {
      setDraft(cached.draft)
      setOrders(cached.orders)
    }
    void loadDraft()
  }, [isSignedIn, user?.id, loadDraft])

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return
    void fetch('/api/customer/profile', { credentials: 'include' })
      .then((response) => response.ok ? response.json() : null)
      .then((body: { customer?: { phone?: string | null; addresses?: Array<CheckoutAddress> | null } } | null) => {
        const customer = body?.customer
        if (!customer) return
        if (customer.phone) setPhone(customer.phone)
        const savedAddress = customer.addresses?.[0]
        if (savedAddress) setAddress({ line1: savedAddress.line1, line2: savedAddress.line2, city: savedAddress.city, state: savedAddress.state, postalCode: savedAddress.postalCode, country: savedAddress.country })
      })
      .catch(() => undefined)
  }, [isLoaded, isSignedIn])

  useEffect(() => {
    if (!open || !isSignedIn) return

    void loadHistory()
  }, [open, isSignedIn, loadHistory])

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return
    const refresh = () => { void loadDraft(); if (open) void loadHistory() }
    const onVisibility = () => { if (document.visibilityState === 'visible') refresh() }
    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', onVisibility)
    const interval = window.setInterval(() => { if (open) refresh() }, 10_000)
    return () => { window.removeEventListener('focus', refresh); document.removeEventListener('visibilitychange', onVisibility); window.clearInterval(interval) }
  }, [isLoaded, isSignedIn, open, loadDraft, loadHistory])

  useEffect(() => {
    if (isSignedIn && user?.id) writeCartCache(user.id, draft, orders)
  }, [draft, orders, isSignedIn, user?.id])

  useEffect(() => {
    const handleCartUpdated = () => { if (isSignedIn) void loadDraft() }
    const handleOptimistic = (event: Event) => { const draft = (event as CustomEvent<{ draft: CartOrder }>).detail?.draft; if (draft) setDraft(draft) }
    const handleServer = (event: Event) => { const draft = (event as CustomEvent<{ draft: CartOrder | null }>).detail?.draft; setDraft(draft ?? null) }
    const handleSyncFailed = () => { if (isSignedIn) void loadDraft() }

    window.addEventListener('cart:updated', handleCartUpdated)
    window.addEventListener('cart:optimistic', handleOptimistic)
    window.addEventListener('cart:server', handleServer)
    window.addEventListener('cart:sync-failed', handleSyncFailed)
    return () => { window.removeEventListener('cart:updated', handleCartUpdated); window.removeEventListener('cart:optimistic', handleOptimistic); window.removeEventListener('cart:server', handleServer); window.removeEventListener('cart:sync-failed', handleSyncFailed) }
  }, [open, isSignedIn, loadDraft, loadHistory])

  const changeQuantity = (itemId: string, quantity: number) => {
    setError(null)
    const current = draft
    const item = current?.items.find((candidate) => candidate.id === itemId)
    if (!current || !item) return
    const items = current.items.map((candidate) => candidate.id === itemId ? { ...candidate, quantity, lineTotal: quantity * candidate.unitPrice } : candidate).filter((candidate) => candidate.quantity > 0)
    const subtotal = items.reduce((sum, candidate) => sum + candidate.lineTotal, 0)
    setDraft(items.length ? { ...current, items, subtotal, total: subtotal } : null)
    const key = productId(item)
    const version = (quantityVersions.current.get(key) ?? 0) + 1
    quantityVersions.current.set(key, version)
    const previousTimer = quantityTimers.current.get(key)
    if (previousTimer) window.clearTimeout(previousTimer)
    quantityTimers.current.set(key, window.setTimeout(() => {
      void setDraftQuantity(key, quantity).then(({ draft: saved }) => {
        if (quantityVersions.current.get(key) === version) setDraft(saved)
      }).catch((updateError) => {
        if (quantityVersions.current.get(key) === version) { setError(updateError instanceof Error ? updateError.message : 'Unable to update this item.'); void loadDraft() }
      }).finally(() => { if (quantityVersions.current.get(key) === version) quantityTimers.current.delete(key) })
    }, 300))
  }

  const placeOrder = async () => {
    setBusy(true)
    setError(null)
    try {
      await fetch('/api/customer/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ phone, addresses: [address] }) })
      const result = await submitDraftOrder(phone, address)
      setDraft(null)
      setOrders((currentOrders) => [result.order, ...currentOrders])
      router.refresh()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to place your order.')
    } finally {
      setBusy(false)
    }
  }

  if (!isLoaded) return <CartIconButton disabled />
  if (!isSignedIn) return <CartIconButton onClick={() => clerk.openSignIn({})} />

  const count = itemCount(draft)
  const loading = draftLoading || (open && historyLoading)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <div className="relative">
        <CartIconButton
          aria-label={count > 0 ? `Open cart, ${count} unique product${count === 1 ? '' : 's'}` : 'Open cart'}
          onClick={() => setOpen(true)}
        />
        {count > 0 ? (
          <Badge className="pointer-events-none absolute -top-1 -right-1 min-w-4 justify-center px-1 text-[10px]" aria-label={`${count} items in cart`}>
            {count}
          </Badge>
        ) : null}
      </div>
      <SheetContent className="w-full gap-0 sm:max-w-lg">
        <SheetHeader className="border-b">
          <SheetTitle className="flex items-center justify-between gap-3 pr-8">
            <span>Your cart</span>
            {count > 0 ? <Badge variant="secondary">{count} item{count === 1 ? '' : 's'}</Badge> : null}
          </SheetTitle>
          <SheetDescription>Manage your draft order and follow previous purchases.</SheetDescription>
        </SheetHeader>

        <ScrollArea className="min-h-0 flex-1">
          <div className="space-y-6 p-4">
            {error ? <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert> : null}

            {loading ? <CartLoading /> : (
              <>
                <section aria-labelledby="current-cart-heading" className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <h2 id="current-cart-heading" className="text-sm font-semibold">Current draft</h2>
                    {draft ? <Badge variant="outline">Draft</Badge> : null}
                  </div>

                  {draft ? (
                    <>
                      <div className="space-y-2">
                        {draft.items.map((item) => item.id ? (
                          <CartProductItem
                            key={item.id}
                            item={item}
                            editable
                            busy={busy}
                            onQuantityChange={(quantity) => void changeQuantity(item.id!, quantity)}
                          />
                        ) : null)}
                      </div>
                      <Card size="sm" className="gap-0 border-border/70 shadow-none">
                        <CardHeader className="pb-2"><CardTitle>Order summary</CardTitle></CardHeader>
                        <CardContent className="space-y-1 text-sm">
                          <div className="flex justify-between gap-3 text-muted-foreground"><span>Subtotal</span><span>₹{draft.subtotal.toLocaleString('en-IN')}</span></div>
                          <div className="flex justify-between gap-3 text-muted-foreground"><span>Shipping</span><span>{draft.shipping ? `₹${draft.shipping.toLocaleString('en-IN')}` : 'Free'}</span></div>
                        </CardContent>
                      <CardFooter className="justify-between"><span className="font-semibold">Total</span><span className="font-semibold">₹{draft.total.toLocaleString('en-IN')}</span></CardFooter>
                      </Card>
                      <Card size="sm" className="gap-3 border-border/70 shadow-none">
                        <CardHeader className="pb-0"><CardTitle>Delivery details</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                          <label className="grid gap-1 text-sm"><span>Phone number</span><input className="h-9 rounded-md border bg-transparent px-3" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="10-digit phone number" /></label>
                          <label className="grid gap-1 text-sm"><span>Address line 1</span><input className="h-9 rounded-md border bg-transparent px-3" value={address.line1} onChange={(event) => setAddress({ ...address, line1: event.target.value })} /></label>
                          <label className="grid gap-1 text-sm"><span>Address line 2 <span className="text-muted-foreground">(optional)</span></span><input className="h-9 rounded-md border bg-transparent px-3" value={address.line2 ?? ''} onChange={(event) => setAddress({ ...address, line2: event.target.value })} /></label>
                          <div className="grid grid-cols-2 gap-2">
                            <label className="grid gap-1 text-sm"><span>City</span><input className="h-9 rounded-md border bg-transparent px-3" value={address.city} onChange={(event) => setAddress({ ...address, city: event.target.value })} /></label>
                            <label className="grid gap-1 text-sm"><span>State</span><input className="h-9 rounded-md border bg-transparent px-3" value={address.state} onChange={(event) => setAddress({ ...address, state: event.target.value })} /></label>
                            <label className="grid gap-1 text-sm"><span>Postal code</span><input className="h-9 rounded-md border bg-transparent px-3" value={address.postalCode} onChange={(event) => setAddress({ ...address, postalCode: event.target.value })} /></label>
                            <label className="grid gap-1 text-sm"><span>Country</span><input className="h-9 rounded-md border bg-transparent px-3" value={address.country} onChange={(event) => setAddress({ ...address, country: event.target.value })} /></label>
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  ) : (
                    <Card size="sm" className="border-dashed text-center shadow-none">
                      <CardContent className="py-6 text-sm text-muted-foreground">Your cart is waiting for something considered.</CardContent>
                    </Card>
                  )}
                </section>

                <Separator />

                <section aria-labelledby="order-history-heading" className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <h2 id="order-history-heading" className="text-sm font-semibold">Order history</h2>
                    <Badge variant="secondary">Timeline</Badge>
                  </div>
                  <OrderTimeline orders={orders} />
                </section>
              </>
            )}
          </div>
        </ScrollArea>

        {draft && !loading ? (
          <SheetFooter className="border-t">
            <Button type="button" size="lg" disabled={busy || draft.items.length === 0 || !phone.trim() || !address.line1.trim() || !address.city.trim() || !address.state.trim() || !address.postalCode.trim() || !address.country.trim()} onClick={() => void placeOrder()}>
              {busy ? <Loader2 className="animate-spin" /> : <ArrowUpRight />}
              {busy ? 'Updating...' : `Place order · ₹${draft.total.toLocaleString('en-IN')}`}
            </Button>
          </SheetFooter>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
