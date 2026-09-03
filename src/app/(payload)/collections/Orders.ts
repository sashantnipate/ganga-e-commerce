import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'
import { APIError } from 'payload'
import { reconcileOrderInventory } from '../../api/orders/inventory'

const customerSnapshotFields = [
  { name: 'name', type: 'text' as const, required: true },
  { name: 'email', type: 'email' as const, required: true },
  { name: 'phone', type: 'text' as const },
  { name: 'shippingAddress', type: 'group' as const, fields: [
    { name: 'line1', type: 'text' as const }, { name: 'line2', type: 'text' as const },
    { name: 'city', type: 'text' as const }, { name: 'state', type: 'text' as const },
    { name: 'postalCode', type: 'text' as const }, { name: 'country', type: 'text' as const },
  ] },
]

const createOrderNumber: CollectionBeforeChangeHook = ({ data, operation }) => {
  if (operation === 'create' && data && !data.orderNumber) data.orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
  return data
}

const protectCustomerStatus: CollectionBeforeChangeHook = ({ data, originalDoc, operation, req }) => {
  if (operation !== 'update' || !data || !originalDoc) return data
  if (Object.prototype.hasOwnProperty.call(data, 'customerStatus') && data.customerStatus !== originalDoc.customerStatus && !req.context?.allowCustomerStatusTransition) {
    throw new APIError('Customer status is controlled by the storefront checkout flow.', 400)
  }
  if (data.adminStatus === 'cancelled' && typeof data.cancellationReason === 'string' && !data.cancellationReason.trim()) throw new APIError('A cancellation reason is required when an order is cancelled.', 400)
  if (data.adminStatus && data.adminStatus !== 'cancelled' && Object.prototype.hasOwnProperty.call(data, 'cancellationReason')) data.cancellationReason = null
  if (data.adminStatus === 'completed' && originalDoc.adminStatus !== 'completed') data.completedAt = new Date().toISOString()
  if (data.adminStatus === 'cancelled' && originalDoc.adminStatus !== 'cancelled') data.cancelledAt = new Date().toISOString()
  return data
}

const reconcileAfterChange = async ({ doc, previousDoc, req, context }: any) => {
  if (context?.skipInventoryReconciliation || !previousDoc || doc.customerStatus !== 'ordered') return doc
  if (JSON.stringify(doc.items) === JSON.stringify(previousDoc.items) && doc.adminStatus === previousDoc.adminStatus) return doc
  const transactionID = req.transactionID ?? await req.payload.db.beginTransaction()
  if (!transactionID) throw new APIError('Inventory transactions are not available.', 500)
  await reconcileOrderInventory(req.payload, previousDoc, doc, transactionID)
  await req.payload.update({ collection: 'orders', id: doc.id, data: { inventoryStatus: doc.adminStatus === 'cancelled' ? 'released' : 'reserved' }, overrideAccess: true, disableTransaction: true, req: { transactionID }, context: { skipInventoryReconciliation: true } })
  if (!req.transactionID) await req.payload.db.commitTransaction(transactionID)
  return doc
}

const reconcileBeforeDelete = async ({ id, req }: any) => {
  const order = await req.payload.findByID({ collection: 'orders', id, depth: 1, overrideAccess: true })
  if (!order || order.customerStatus !== 'ordered' || order.adminStatus === 'cancelled') return
  const transactionID = req.transactionID ?? await req.payload.db.beginTransaction()
  if (!transactionID) throw new APIError('Inventory transactions are not available.', 500)
  await reconcileOrderInventory(req.payload, order, { ...order, customerStatus: 'draft' }, transactionID)
  if (!req.transactionID) await req.payload.db.commitTransaction(transactionID)
}

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: { useAsTitle: 'orderNumber', defaultColumns: ['orderNumber', 'customer', 'adminStatus', 'total', 'createdAt'] },
  access: { read: ({ req }) => Boolean(req.user), create: ({ req }) => Boolean(req.user), update: ({ req }) => Boolean(req.user), delete: ({ req }) => Boolean(req.user) },
  disableBulkDelete: true,
  hooks: { beforeChange: [createOrderNumber, protectCustomerStatus], afterChange: [reconcileAfterChange], beforeDelete: [reconcileBeforeDelete] },
  fields: [
    { name: 'orderNumber', type: 'text', required: true, unique: true, admin: { readOnly: true } },
    { name: 'customer', type: 'relationship', relationTo: 'customers' as any, required: true },
    { name: 'customerStatus', type: 'select', required: true, defaultValue: 'draft', options: [{ label: 'Draft', value: 'draft' }, { label: 'Ordered', value: 'ordered' }], admin: { readOnly: true, description: 'Updated by the storefront checkout flow.' } },
    { name: 'adminStatus', type: 'select', required: true, defaultValue: 'pending', options: [{ label: 'Pending', value: 'pending' }, { label: 'Completed', value: 'completed' }, { label: 'Cancelled', value: 'cancelled' }] },
    { name: 'cancellationReason', type: 'textarea', admin: { condition: (_, siblingData) => (siblingData as { adminStatus?: string } | undefined)?.adminStatus === 'cancelled' }, validate: (value, { siblingData }) => (siblingData as { adminStatus?: string } | undefined)?.adminStatus === 'cancelled' && !(typeof value === 'string' && value.trim()) ? 'A cancellation reason is required when an order is cancelled.' : true },
    { name: 'inventoryStatus', type: 'select', required: true, defaultValue: 'not_reserved', options: [{ label: 'Not reserved', value: 'not_reserved' }, { label: 'Reserved', value: 'reserved' }, { label: 'Released', value: 'released' }], admin: { hidden: true } },
    { name: 'items', type: 'array', required: true, minRows: 1, fields: [
      { name: 'product', type: 'relationship', relationTo: 'products', required: true }, { name: 'productName', type: 'text', required: true },
      { name: 'productImage', type: 'upload', relationTo: 'media' }, { name: 'quantity', type: 'number', required: true, min: 1 },
      { name: 'unitPrice', type: 'number', required: true, min: 0 }, { name: 'lineTotal', type: 'number', required: true, min: 0 },
    ] },
    { name: 'customerSnapshot', type: 'group', fields: customerSnapshotFields },
    { name: 'subtotal', type: 'number', required: true, min: 0 }, { name: 'shipping', type: 'number', defaultValue: 0, min: 0 },
    { name: 'discount', type: 'number', defaultValue: 0, min: 0 }, { name: 'total', type: 'number', required: true, min: 0 },
    { name: 'submittedAt', type: 'date', admin: { readOnly: true } }, { name: 'completedAt', type: 'date', admin: { readOnly: true } }, { name: 'cancelledAt', type: 'date', admin: { readOnly: true } },
  ],
}
