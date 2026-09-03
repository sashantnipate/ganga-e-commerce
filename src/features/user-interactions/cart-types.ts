export type ProductImage = {
  id?: string
  url?: string
  alt?: string
}

export type CartProduct = {
  id: string
  name: string
  price: number
  stock: number
  image?: ProductImage | string | null
}

export type CartItem = {
  id?: string
  product: string | CartProduct
  productName: string
  productImage?: ProductImage | string | null
  quantity: number
  unitPrice: number
  lineTotal: number
}

export type CustomerStatus = 'draft' | 'ordered'
export type AdminStatus = 'pending' | 'completed' | 'cancelled'

export type CartOrder = {
  id: string
  orderNumber: string
  customerStatus: CustomerStatus
  adminStatus: AdminStatus
  cancellationReason?: string | null
  items: CartItem[]
  subtotal: number
  shipping?: number
  discount?: number
  total: number
  createdAt: string
  submittedAt?: string | null
}
