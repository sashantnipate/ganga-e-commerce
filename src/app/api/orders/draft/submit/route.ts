import { NextResponse } from 'next/server'

import { getCustomer, getDraftOrder, getErrorMessage, type OrderData } from '../../_lib'
import { reserveInventory } from '../../inventory'

export async function POST(request: Request) {
  let transactionID: number | string | null = null
  let rollback: (() => Promise<void>) | null = null

  try {
    const result = await getCustomer()
    if (!result) return NextResponse.json({ error: 'Sign in to place your order.' }, { status: 401 })

    const body = await request.json().catch(() => ({})) as { phone?: string; address?: Record<string, string> }
    const phone = body.phone?.trim() || result.customer.phone?.trim()
    const address = body.address
    if (!phone) return NextResponse.json({ error: 'A phone number is required before placing your order.' }, { status: 400 })
    if (!address?.line1?.trim() || !address.city?.trim() || !address.state?.trim() || !address.postalCode?.trim() || !address.country?.trim()) {
      return NextResponse.json({ error: 'Complete shipping address details are required before placing your order.' }, { status: 400 })
    }

    const draft = await getDraftOrder(result.payload, result.customer.id)
    if (!draft || draft.items.length === 0) {
      return NextResponse.json({ error: 'Add at least one product before placing your order.' }, { status: 400 })
    }

    transactionID = await result.payload.db.beginTransaction()
    if (!transactionID) throw new Error('Inventory transactions are not available. Please try again.')
    rollback = () => result.payload.db.rollbackTransaction(transactionID!)

    await reserveInventory(result.payload, draft, transactionID)

    const now = new Date().toISOString()
    const customerName = [result.customer.firstName, result.customer.lastName].filter(Boolean).join(' ') || result.customer.email
    const saved = await result.payload.update({
      collection: 'orders',
      id: draft.id,
      data: {
        customerStatus: 'ordered',
        customerSnapshot: {
          name: customerName,
          email: result.customer.email,
          phone,
          shippingAddress: address,
        },
        submittedAt: now,
        inventoryStatus: 'reserved',
      },
      overrideAccess: true,
      disableTransaction: true,
      req: { transactionID },
      context: { allowCustomerStatusTransition: true },
    })

    await result.payload.db.commitTransaction(transactionID)
    transactionID = null
    rollback = null

    return NextResponse.json({ order: saved as unknown as OrderData })
  } catch (error) {
    if (rollback) await rollback().catch(() => undefined)
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 })
  }
}
