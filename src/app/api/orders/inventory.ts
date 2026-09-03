import type { OrderData } from './_lib'
import { getRelationId } from './_lib'

type PayloadLike = any
type InventoryOrder = OrderData & { inventoryStatus?: 'not_reserved' | 'reserved' | 'released' }

const quantities = (order: InventoryOrder | null | undefined) => {
  const result = new Map<string, number>()
  for (const item of order?.items ?? []) {
    const id = getRelationId(item.product)
    if (!id) throw new Error(`Product for ${item.productName} was not found.`)
    result.set(id, (result.get(id) ?? 0) + item.quantity)
  }
  return result
}

const adjust = async (payload: PayloadLike, changes: Map<string, number>, transactionID: number | string) => {
  for (const [productId, delta] of changes) {
    if (!delta) continue
    const product = await payload.findByID({ collection: 'products', id: productId, depth: 0, overrideAccess: true, req: { transactionID } }) as { stock?: unknown } | null
    if (!product || typeof product.stock !== 'number') throw new Error(`Product ${productId} was not found.`)
    const nextStock = product.stock - delta
    if (nextStock < 0) {
      throw new Error(`Only ${product.stock} item(s) are available for product ${productId}.`)
    }
    await payload.update({ collection: 'products', id: productId, data: { stock: nextStock }, overrideAccess: true, disableTransaction: true, req: { transactionID } })
  }
}

export const reserveInventory = async (payload: PayloadLike, order: InventoryOrder, transactionID: number | string) => {
  await adjust(payload, quantities(order), transactionID)
}

export const releaseInventory = async (payload: PayloadLike, order: InventoryOrder, transactionID: number | string) => {
  const changes = new Map([...quantities(order)].map(([id, quantity]) => [id, -quantity]))
  await adjust(payload, changes, transactionID)
}

export const reconcileOrderInventory = async (payload: PayloadLike, previous: InventoryOrder, next: InventoryOrder, transactionID: number | string) => {
  const previousActive = previous.customerStatus === 'ordered' && previous.adminStatus !== 'cancelled'
  const nextActive = next.customerStatus === 'ordered' && next.adminStatus !== 'cancelled'
  const previousQuantities = quantities(previous)
  const nextQuantities = quantities(next)
  const changes = new Map<string, number>()
  const ids = new Set([...previousQuantities.keys(), ...nextQuantities.keys()])
  for (const id of ids) {
    const previousQuantity = previousActive ? previousQuantities.get(id) ?? 0 : 0
    const nextQuantity = nextActive ? nextQuantities.get(id) ?? 0 : 0
    changes.set(id, nextQuantity - previousQuantity)
  }
  await adjust(payload, changes, transactionID)
}
