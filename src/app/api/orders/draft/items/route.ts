import { NextResponse } from 'next/server'

import {
  getCustomer,
  getDraftOrder,
  getErrorMessage,
  getRelationId,
  getOrderTotals,
  type CustomerData,
  type OrderData,
  type OrderItemData,
} from '../../_lib'

type ItemRequest = { productId?: string; quantity?: number; itemId?: string }

const parseBody = async (request: Request): Promise<ItemRequest | null> => {
  try {
    const body = await request.json()
    return body && typeof body === 'object' ? body as ItemRequest : null
  } catch {
    return null
  }
}

const getProduct = async (payload: Awaited<ReturnType<typeof getCustomer>> extends infer Result
  ? Result extends { payload: infer Payload } ? Payload : never : never, productId: string) =>
  payload.findByID({ collection: 'products', id: productId, depth: 1, overrideAccess: true })

const saveDraft = async (
  payload: Awaited<ReturnType<typeof getCustomer>> extends infer Result
    ? Result extends { payload: infer Payload } ? Payload : never : never,
  customer: CustomerData,
  draft: OrderData | null,
  items: OrderItemData[],
) => {
  const totals = getOrderTotals(items)
  const customerName = [customer.firstName, customer.lastName].filter(Boolean).join(' ') || customer.email
  const data = {
    customer: customer.id,
    customerStatus: 'draft' as const,
    adminStatus: 'pending' as const,
    customerSnapshot: {
      name: customerName,
      email: customer.email,
      phone: customer.phone ?? undefined,
    },
    items,
    ...totals,
  }

  if (draft) {
    return payload.update({
      collection: 'orders',
      id: draft.id,
      data,
      overrideAccess: true,
    })
  }

  return payload.create({
    collection: 'orders',
    // The collection hook generates the order number for new drafts.
    data: data as never,
    draft: false,
    overrideAccess: true,
  })
}

export async function POST(request: Request) {
  try {
    const result = await getCustomer()
    if (!result) return NextResponse.json({ error: 'Sign in to add items to your cart.' }, { status: 401 })

    const body = await parseBody(request)
    if (!body) {
      return NextResponse.json({ error: 'A valid JSON request body is required.' }, { status: 400 })
    }

    const { productId, quantity: bodyQuantity } = body
    const quantity = bodyQuantity ?? 1
    if (!productId || !Number.isInteger(quantity) || quantity < 1) {
      return NextResponse.json({ error: 'A valid product and quantity are required.' }, { status: 400 })
    }

    const product = await getProduct(result.payload, productId) as {
      name?: unknown
      price?: unknown
      stock?: unknown
      image?: unknown
    } | null
    if (
      !product ||
      typeof product.name !== 'string' ||
      typeof product.price !== 'number' ||
      typeof product.stock !== 'number' ||
      product.stock < quantity
    ) {
      return NextResponse.json({ error: 'The requested quantity is not available.' }, { status: 400 })
    }

    const draft = await getDraftOrder(result.payload, result.customer.id)
    const items = [...(draft?.items ?? [])]
    const existingIndex = items.findIndex((item) => getRelationId(item.product) === productId)
    const existing = existingIndex >= 0 ? items[existingIndex] : undefined
    const nextQuantity = (existing?.quantity ?? 0) + quantity

    if (nextQuantity > product.stock) {
      return NextResponse.json({ error: `Only ${product.stock} item(s) are available.` }, { status: 400 })
    }

    const imageId = getRelationId(product.image)
    const item: OrderItemData = {
      ...(existing?.id ? { id: existing.id } : {}),
      product: productId,
      productName: product.name,
      ...(imageId ? { productImage: imageId } : {}),
      quantity: nextQuantity,
      unitPrice: product.price,
      lineTotal: nextQuantity * product.price,
    }

    if (existingIndex >= 0) items[existingIndex] = item
    else items.push(item)

    const saved = await saveDraft(result.payload, result.customer, draft, items)
    return NextResponse.json({ draft: saved as unknown as OrderData })
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const result = await getCustomer()
    if (!result) return NextResponse.json({ error: 'Sign in to update your cart.' }, { status: 401 })

    const body = await parseBody(request)
    if (!body) {
      return NextResponse.json({ error: 'A valid JSON request body is required.' }, { status: 400 })
    }

    const { itemId, quantity } = body
    if (!itemId || typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity < 0) {
      return NextResponse.json({ error: 'A valid item and quantity are required.' }, { status: 400 })
    }

    const draft = await getDraftOrder(result.payload, result.customer.id)
    if (!draft) return NextResponse.json({ error: 'Your cart is empty.' }, { status: 404 })

    const itemIndex = draft.items.findIndex((item) => item.id === itemId)
    if (itemIndex < 0) return NextResponse.json({ error: 'Cart item not found.' }, { status: 404 })

    const item = draft.items[itemIndex]
    const productId = getRelationId(item.product)
    if (!productId) return NextResponse.json({ error: 'Cart item product not found.' }, { status: 400 })

    const product = await getProduct(result.payload, productId) as any
    if (quantity > 0 && (!product || quantity > product.stock)) {
      return NextResponse.json({ error: `Only ${product?.stock ?? 0} item(s) are available.` }, { status: 400 })
    }

    const items = draft.items.filter((_, index) => index !== itemIndex)
    if (quantity > 0) {
      items.splice(itemIndex, 0, {
        ...item,
        productName: product.name,
        unitPrice: product.price,
        quantity,
        lineTotal: quantity * product.price,
      })
    }

    if (items.length === 0) {
      await result.payload.delete({
        collection: 'orders',
        id: draft.id,
        overrideAccess: true,
      })
      return NextResponse.json({ draft: null })
    }

    const saved = await saveDraft(result.payload, result.customer, draft, items)
    return NextResponse.json({ draft: saved as unknown as OrderData })
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const result = await getCustomer()
    if (!result) return NextResponse.json({ error: 'Sign in to update your cart.' }, { status: 401 })
    const body = await parseBody(request)
    if (!body || !body.productId || typeof body.quantity !== 'number' || !Number.isInteger(body.quantity) || body.quantity < 0) {
      return NextResponse.json({ error: 'A valid product and quantity are required.' }, { status: 400 })
    }

    const product = await getProduct(result.payload, body.productId) as any
    const draft = await getDraftOrder(result.payload, result.customer.id)
    const itemIndex = draft?.items.findIndex((item) => getRelationId(item.product) === body.productId) ?? -1
    if (body.quantity > 0 && (!product || typeof product.stock !== 'number' || body.quantity > product.stock)) {
      return NextResponse.json({ error: `Only ${product?.stock ?? 0} item(s) are available.` }, { status: 400 })
    }
    if (!draft && body.quantity === 0) return NextResponse.json({ draft: null })

    const items = [...(draft?.items ?? [])]
    if (body.quantity === 0) {
      if (itemIndex >= 0) items.splice(itemIndex, 1)
    } else {
      const previous = itemIndex >= 0 ? items[itemIndex] : undefined
      const imageId = getRelationId(product.image)
      const item: OrderItemData = {
        ...(previous?.id ? { id: previous.id } : {}), product: body.productId,
        productName: product.name, ...(imageId ? { productImage: imageId } : {}),
        quantity: body.quantity, unitPrice: product.price, lineTotal: body.quantity * product.price,
      }
      if (itemIndex >= 0) items[itemIndex] = item
      else items.push(item)
    }

    if (items.length === 0) {
      if (draft) await result.payload.delete({ collection: 'orders', id: draft.id, overrideAccess: true })
      return NextResponse.json({ draft: null })
    }
    const saved = await saveDraft(result.payload, result.customer, draft, items)
    return NextResponse.json({ draft: saved as unknown as OrderData })
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 })
  }
}
