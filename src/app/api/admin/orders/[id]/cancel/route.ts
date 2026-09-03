import { NextResponse } from 'next/server'
import config from '@payload-config'
import { getPayload } from 'payload'
import { getErrorMessage, type OrderData } from '../../../../orders/_lib'

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  let transactionID: number | string | null = null
  try {
    const payload = await getPayload({ config })
    const auth = await payload.auth({ headers: request.headers, canSetHeaders: false, req: {} as never })
    if (!auth.user) return NextResponse.json({ error: 'Administrator access is required.' }, { status: 403 })
    const body = await request.json().catch(() => null) as { reason?: string } | null
    const reason = body?.reason?.trim()
    if (!reason) return NextResponse.json({ error: 'A cancellation reason is required.' }, { status: 400 })
    const { id } = await context.params
    const order = await payload.findByID({ collection: 'orders', id, depth: 1, overrideAccess: true }) as unknown as OrderData
    if (order.customerStatus !== 'ordered') return NextResponse.json({ error: 'Only submitted orders can be cancelled.' }, { status: 400 })
    if (order.adminStatus === 'cancelled') return NextResponse.json({ error: 'This order is already cancelled.' }, { status: 409 })
    transactionID = await payload.db.beginTransaction()
    if (!transactionID) throw new Error('Inventory transactions are not available.')
    const saved = await payload.update({ collection: 'orders', id, data: { adminStatus: 'cancelled', cancellationReason: reason }, overrideAccess: true, disableTransaction: true, req: { transactionID } })
    await payload.db.commitTransaction(transactionID)
    return NextResponse.json({ order: saved })
  } catch (error) {
    if (transactionID) await (await getPayload({ config })).db.rollbackTransaction(transactionID).catch(() => undefined)
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 })
  }
}
