"use client"

import * as React from 'react'
import { Minus, Plus, Package } from 'lucide-react'

import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item'
import type { CartItem } from './cart-types'

type CartProductItemProps = {
  item: CartItem
  editable: boolean
  onQuantityChange: (quantity: number) => void
  busy?: boolean
}

const getImage = (image: CartItem['productImage']) =>
  image && typeof image !== 'string' ? image : undefined

export function CartProductItem({ item, editable, onQuantityChange, busy = false }: CartProductItemProps) {
  const [quantity, setQuantity] = React.useState(String(item.quantity))
  const image = getImage(item.productImage)

  React.useEffect(() => {
    setQuantity(String(item.quantity))
  }, [item.quantity])

  const commitQuantity = () => {
    const nextQuantity = Number(quantity)
    if (!Number.isInteger(nextQuantity) || nextQuantity < 0) {
      setQuantity(String(item.quantity))
      return
    }

    onQuantityChange(nextQuantity)
  }

  return (
    <Item variant="outline" size="sm" className="items-start gap-3 border-border/70 p-2.5">
      <ItemMedia variant="image" className="size-16 rounded-md bg-muted/60">
        <AspectRatio ratio={1} className="h-full w-full">
          {image?.url ? (
            <img src={image.url} alt={image.alt || item.productName} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <Package className="size-5" />
            </div>
          )}
        </AspectRatio>
      </ItemMedia>

      <ItemContent className="min-w-0 gap-1.5">
        <ItemTitle className="w-full justify-between gap-2">
          <span className="truncate">{item.productName}</span>
          <span className="shrink-0 text-xs font-semibold">₹{item.lineTotal.toLocaleString('en-IN')}</span>
        </ItemTitle>
        <ItemDescription>₹{item.unitPrice.toLocaleString('en-IN')} each</ItemDescription>
        {editable ? (
          <ItemActions className="mt-1 gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon-xs"
              aria-label={`Decrease ${item.productName} quantity`}
              disabled={busy}
              onClick={() => onQuantityChange(Math.max(0, item.quantity - 1))}
            >
              <Minus />
            </Button>
            <Input
              aria-label={`${item.productName} quantity`}
              inputMode="numeric"
              min={0}
              value={quantity}
              disabled={busy}
              className="h-6 w-10 px-1 text-center text-xs"
              onChange={(event) => setQuantity(event.target.value)}
              onBlur={commitQuantity}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.currentTarget.blur()
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="icon-xs"
              aria-label={`Increase ${item.productName} quantity`}
              disabled={busy}
              onClick={() => onQuantityChange(item.quantity + 1)}
            >
              <Plus />
            </Button>
          </ItemActions>
        ) : (
          <ItemDescription>Quantity: {item.quantity}</ItemDescription>
        )}
      </ItemContent>
    </Item>
  )
}
