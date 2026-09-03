import { auth, currentUser } from '@clerk/nextjs/server'
import config from '@payload-config'
import { getPayload } from 'payload'

export type OrderItemData = {
  id?: string
  product: string
  productName: string
  productImage?: string | null
  quantity: number
  unitPrice: number
  lineTotal: number
}

export type OrderData = {
  id: string
  orderNumber: string
  customerStatus: 'draft' | 'ordered'
  adminStatus: 'pending' | 'completed' | 'cancelled'
  cancellationReason?: string | null
  items: OrderItemData[]
  subtotal: number
  shipping?: number
  discount?: number
  total: number
  createdAt: string
  submittedAt?: string | null
}

export type CustomerData = {
  id: string
  clerkUserId: string
  email: string
  firstName?: string | null
  lastName?: string | null
  phone?: string | null
  addresses?: Array<{ id?: string; label?: string; line1: string; line2?: string; city: string; state: string; postalCode: string; country: string }> | null
}

export const getRelationId = (value: unknown) => {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object' && 'id' in value) {
    return String(value.id)
  }
  return undefined
}

export const getCustomer = async () => {
  const { userId } = await auth()
  if (!userId) return null

  const payload = await getPayload({ config })
  const existing = await payload.find({
    collection: 'customers',
    where: { clerkUserId: { equals: userId } },
    limit: 1,
    overrideAccess: true,
  })

  // Cart requests only need the existing customer. Avoid the expensive Clerk
  // profile lookup and customer update on every cart read or mutation.
  if (existing.docs[0]) {
    return { payload, customer: existing.docs[0] as unknown as CustomerData }
  }

  const clerkUser = await currentUser()
  const email = clerkUser?.emailAddresses.find(
    (address) => address.id === clerkUser.primaryEmailAddressId,
  )?.emailAddress ?? clerkUser?.emailAddresses[0]?.emailAddress

  if (!email) throw new Error('Your account does not have an email address.')

  const customerData = {
    clerkUserId: userId,
    email,
    firstName: clerkUser?.firstName ?? undefined,
    lastName: clerkUser?.lastName ?? undefined,
  }

  const customer = await payload.create({
    collection: 'customers',
    data: customerData,
    overrideAccess: true,
  })

  return { payload, customer: customer as unknown as CustomerData }
}

export const getDraftOrder = async (payload: Awaited<ReturnType<typeof getPayload>>, customerId: string) => {
  const result = await payload.find({
    collection: 'orders',
    where: {
      and: [
        { customer: { equals: customerId } },
        { customerStatus: { equals: 'draft' } },
      ],
    },
    depth: 1,
    limit: 1,
    sort: '-createdAt',
    overrideAccess: true,
  })

  return (result.docs[0] as unknown as OrderData | undefined) ?? null
}

export const getOrderTotals = (items: OrderItemData[]) => {
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0)
  return { subtotal, shipping: 0, discount: 0, total: subtotal }
}

export const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Something went wrong. Please try again.'
