import { NextResponse } from 'next/server'

import { getCustomer, getErrorMessage, type OrderData } from './_lib'

export async function GET() {
  try {
    const result = await getCustomer()
    if (!result) return NextResponse.json({ orders: [] }, { status: 401 })

    const orders = await result.payload.find({
      collection: 'orders',
      where: {
        and: [
          { customer: { equals: result.customer.id } },
          { customerStatus: { equals: 'ordered' } },
        ],
      },
      depth: 1,
      limit: 50,
      sort: '-createdAt',
      overrideAccess: true,
    })

    return NextResponse.json({ orders: orders.docs as unknown as OrderData[] }, { headers: { 'Cache-Control': 'no-store, max-age=0' } })
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 })
  }
}
