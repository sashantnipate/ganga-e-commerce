"use client"

import { useRef, useState } from 'react'
import { useClerk, useUser } from '@clerk/nextjs'
import { ArrowUpRight, Check } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { setDraftQuantity } from './cart-api'
import { readCartCache, writeCartCache } from './cart-cache'
import type { CartOrder, CartProduct } from './cart-types'

type AddToCartButtonProps = {
  productId: string
  product?: CartProduct
  disabled?: boolean
}

export function AddToCartButton({ productId, product, disabled = false }: AddToCartButtonProps) {
  const clerk = useClerk()
  const { isLoaded, isSignedIn, user } = useUser()
  const syncVersion = useRef(0)
  const syncTimer = useRef<number | null>(null)
  const [added, setAdded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addToCart = async () => {
    if (!isSignedIn) {
      clerk.openSignIn({})
      return
    }

    setAdded(false)
    setError(null)
    const userId = user?.id
    if (!userId || !product) {
      setError('Unable to prepare this product for your cart.')
      return
    }

    const cached = readCartCache(userId)
    const current = cached?.draft?.items.find((item) => typeof item.product === 'string' ? item.product === productId : item.product.id === productId)
    const quantity = (current?.quantity ?? 0) + 1
    const items = [...(cached?.draft?.items ?? [])]
    const nextItem = { id: current?.id ?? `optimistic-${productId}`, product, productName: product.name, productImage: product.image, quantity, unitPrice: product.price, lineTotal: quantity * product.price }
    const index = items.findIndex((item) => typeof item.product === 'string' ? item.product === productId : item.product.id === productId)
    if (index >= 0) items[index] = nextItem
    else items.push(nextItem)
    const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0)
    const optimistic: CartOrder = cached?.draft ? { ...cached.draft, items, subtotal, total: subtotal } : { id: `optimistic-${userId}`, orderNumber: '', customerStatus: 'draft', adminStatus: 'pending', items, subtotal, shipping: 0, discount: 0, total: subtotal, createdAt: new Date().toISOString() }
    writeCartCache(userId, optimistic, cached?.orders ?? [])
    window.dispatchEvent(new CustomEvent('cart:optimistic', { detail: { draft: optimistic } }))
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1800)

    const version = ++syncVersion.current
    if (syncTimer.current) window.clearTimeout(syncTimer.current)
    syncTimer.current = window.setTimeout(() => void setDraftQuantity(productId, quantity).then(({ draft }) => {
      if (syncVersion.current !== version) return
      const latest = readCartCache(userId)
      writeCartCache(userId, draft, latest?.orders ?? [])
      window.dispatchEvent(new CustomEvent('cart:server', { detail: { draft } }))
    }).catch((addError) => {
      if (syncVersion.current !== version) return
      setError(addError instanceof Error ? addError.message : 'Unable to add this product.')
      window.dispatchEvent(new CustomEvent('cart:sync-failed'))
    }).finally(() => { if (syncVersion.current === version) syncTimer.current = null }), 300)
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <Button size="lg" disabled={disabled || !isLoaded} onClick={() => void addToCart()} className="w-fit rounded-full px-6">
        {added ? <Check /> : <ArrowUpRight />}
        {added ? 'Added to Cart' : disabled ? 'Out of stock' : 'Add to Cart'}
      </Button>
      {error ? <p role="alert" className="max-w-xs text-xs text-destructive">{error}</p> : null}
    </div>
  )
}
