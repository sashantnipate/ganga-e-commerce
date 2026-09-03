import type { CartOrder } from './cart-types'

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(path, {
    ...init,
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
    credentials: 'include',
  })

  const body = await response.json().catch(() => null)
  if (!response.ok) {
    const message = body && typeof body === 'object' && 'error' in body && typeof body.error === 'string'
      ? body.error
      : 'Unable to update your cart.'
    throw new Error(message)
  }

  if (!body) throw new Error('The cart service returned an empty response.')
  return body as T
}

export const getDraftOrder = async () =>
  request<{ draft: CartOrder | null }>('/api/orders/draft')

export const getOrderHistory = async () =>
  request<{ orders: CartOrder[] }>('/api/orders')

export const addItemToDraft = async (productId: string, quantity = 1) => {
  if (!productId || !Number.isInteger(quantity) || quantity < 1) {
    throw new Error('A valid product and quantity are required.')
  }

  return request<{ draft: CartOrder }>('/api/orders/draft/items', {
    method: 'POST',
    body: JSON.stringify({ productId, quantity }),
  })
}

export const updateDraftItem = async (itemId: string, quantity: number) =>
  request<{ draft: CartOrder | null }>('/api/orders/draft/items', {
    method: 'PATCH', body: JSON.stringify({ itemId, quantity }),
  })

export const setDraftQuantity = async (productId: string, quantity: number) => {
  if (!productId || !Number.isInteger(quantity) || quantity < 0) {
    throw new Error('A valid product and quantity are required.')
  }

  return request<{ draft: CartOrder | null }>('/api/orders/draft/items', {
    method: 'PUT', body: JSON.stringify({ productId, quantity }),
  })
}

export type CheckoutAddress = { line1: string; line2?: string; city: string; state: string; postalCode: string; country: string }

export const submitDraftOrder = async (phone: string, address: CheckoutAddress) =>
  request<{ order: CartOrder }>('/api/orders/draft/submit', { method: 'POST', body: JSON.stringify({ phone, address }) })

export const notifyCartUpdated = () => {
  window.dispatchEvent(new CustomEvent('cart:updated'))
}
