import { NextResponse } from 'next/server'
import { getCustomer, getErrorMessage } from '../../orders/_lib'

export async function GET() {
  try {
    const result = await getCustomer()
    if (!result) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 })
    return NextResponse.json({ customer: result.customer })
  } catch (error) { return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 }) }
}

export async function PATCH(request: Request) {
  try {
    const result = await getCustomer()
    if (!result) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 })
    const body = await request.json().catch(() => null) as { phone?: string; addresses?: unknown } | null
    const phone = body?.phone?.trim()
    const addresses = Array.isArray(body?.addresses) ? body.addresses : undefined
    if (!phone) return NextResponse.json({ error: 'A phone number is required.' }, { status: 400 })
    if (addresses && addresses.some((address) => !address || typeof address !== 'object' || !['line1', 'city', 'state', 'postalCode', 'country'].every((key) => typeof (address as Record<string, unknown>)[key] === 'string' && (address as Record<string, string>)[key].trim()))) {
      return NextResponse.json({ error: 'Every address must include line 1, city, state, postal code, and country.' }, { status: 400 })
    }
    const customer = await result.payload.update({ collection: 'customers', id: result.customer.id, data: { phone, ...(addresses ? { addresses } : {}) }, overrideAccess: true })
    return NextResponse.json({ customer })
  } catch (error) { return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 }) }
}
