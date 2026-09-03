import { NextResponse } from 'next/server'
import config from '@payload-config'
import { getPayload } from 'payload'
import { getErrorMessage } from '../../../orders/_lib'

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const payload = await getPayload({ config })
    const auth = await payload.auth({ headers: request.headers, canSetHeaders: false, req: {} as never })
    if (!auth.user) return NextResponse.json({ error: 'Administrator access is required.' }, { status: 403 })
    const { id } = await context.params
    await payload.delete({ collection: 'orders', id, overrideAccess: true })
    return NextResponse.json({ deleted: true })
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 })
  }
}
