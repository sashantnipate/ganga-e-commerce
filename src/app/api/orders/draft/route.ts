import { NextResponse } from 'next/server'

import { getCustomer, getDraftOrder, getErrorMessage } from '../_lib'

export async function GET() {
  try {
    const result = await getCustomer()
    if (!result) return NextResponse.json({ draft: null }, { status: 401 })

    const draft = await getDraftOrder(result.payload, result.customer.id)
    return NextResponse.json({ draft }, { headers: { 'Cache-Control': 'no-store, max-age=0' } })
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 })
  }
}
