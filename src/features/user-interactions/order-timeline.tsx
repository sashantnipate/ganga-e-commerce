"use client"

import { Check, Clock3, PackageCheck, X } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Item, ItemContent, ItemDescription, ItemTitle } from '@/components/ui/item'
import { Separator } from '@/components/ui/separator'
import type { AdminStatus, CartOrder } from './cart-types'

type OrderTimelineProps = {
  orders: CartOrder[]
}

const statusMeta: Record<AdminStatus, { label: string; icon: typeof Clock3; className: string }> = {
  pending: { label: 'Pending', icon: Clock3, className: 'border-amber-500/30 bg-amber-500/10 text-amber-700' },
  completed: { label: 'Completed', icon: Check, className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700' },
  cancelled: { label: 'Cancelled', icon: X, className: 'border-destructive/30 bg-destructive/10 text-destructive' },
}

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value))

export function OrderTimeline({ orders }: OrderTimelineProps) {
  if (orders.length === 0) {
    return (
      <Item variant="muted" className="justify-center py-5 text-center">
        <ItemContent>
          <ItemTitle className="w-full justify-center">No previous orders</ItemTitle>
          <ItemDescription className="text-center">Your submitted orders will appear here.</ItemDescription>
        </ItemContent>
      </Item>
    )
  }

  return (
    <div className="relative space-y-4 pl-5">
      <div className="absolute top-2 bottom-2 left-[7px] w-px bg-border" aria-hidden="true" />
      {orders.map((order) => {
        const status = statusMeta[order.adminStatus]
        const StatusIcon = status.icon

        return (
          <div key={order.id} className="relative">
            <div className="absolute -left-5 top-3 z-10 flex size-4 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground" aria-hidden="true">
              <StatusIcon className="size-2.5" />
            </div>
            <Card size="sm" className="gap-0 border-border/70 shadow-none">
              <CardHeader className="gap-2 pb-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle>{order.orderNumber}</CardTitle>
                    <CardDescription>{formatDate(order.submittedAt || order.createdAt)}</CardDescription>
                  </div>
                  <Badge variant="outline" className={status.className}>{status.label}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Separator />
                <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5"><PackageCheck className="size-3.5" />{order.items.length} item{order.items.length === 1 ? '' : 's'}</span>
                  <span className="font-semibold text-foreground">₹{order.total.toLocaleString('en-IN')}</span>
                </div>
                <p className="line-clamp-2 text-xs text-muted-foreground">
                  {order.items.map((item) => `${item.productName} × ${item.quantity}`).join(', ')}
                </p>
                {order.cancellationReason ? (
                  <p className="text-xs text-destructive">Reason: {order.cancellationReason}</p>
                ) : null}
              </CardContent>
            </Card>
          </div>
        )
      })}
    </div>
  )
}
