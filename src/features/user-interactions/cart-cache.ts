import type { CartOrder } from './cart-types'

type CartCache = {
  draft: CartOrder | null
  orders: CartOrder[]
  savedAt: number
}

const cachePrefix = 'ganga:cart:'
export const cartCacheMaxAge = 30_000

const getKey = (userId: string) => `${cachePrefix}${userId}`

export const readCartCache = (userId: string): CartCache | null => {
  try {
    const raw = window.sessionStorage.getItem(getKey(userId))
    if (!raw) return null
    const cache = JSON.parse(raw) as CartCache
    return cache && typeof cache.savedAt === 'number' ? cache : null
  } catch {
    return null
  }
}

export const writeCartCache = (userId: string, draft: CartOrder | null, orders: CartOrder[]) => {
  try {
    window.sessionStorage.setItem(getKey(userId), JSON.stringify({ draft, orders, savedAt: Date.now() } satisfies CartCache))
  } catch {
    // Storage is only an optimization; the server remains authoritative.
  }
}

export const clearCartCache = (userId?: string) => {
  try {
    if (userId) {
      window.sessionStorage.removeItem(getKey(userId))
      return
    }

    for (let index = window.sessionStorage.length - 1; index >= 0; index -= 1) {
      const key = window.sessionStorage.key(index)
      if (key?.startsWith(cachePrefix)) window.sessionStorage.removeItem(key)
    }
  } catch {
    // Ignore unavailable storage.
  }
}
