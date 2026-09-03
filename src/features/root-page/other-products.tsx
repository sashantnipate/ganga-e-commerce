import { Package } from 'lucide-react'
import { getPayload } from 'payload'
import config from '@payload-config'

import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { ProductLink } from '@/features/root-page/product-link'

type ProductImage = { url?: string; alt?: string }

type Product = {
  id: string
  name: string
  price: number
  image?: ProductImage | string | null
}

const getImage = (image: Product['image']) =>
  image && typeof image !== 'string' ? image : undefined

type OtherProductsProps = { currentProductId: string }

export async function OtherProducts({ currentProductId }: OtherProductsProps) {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'products',
    depth: 1,
    limit: 4,
    where: { id: { not_equals: currentProductId } },
  })
  const products = docs as unknown as Product[]

  if (products.length === 0) return null

  return (
    <section className="mt-16 border-y border-current/15 py-8 sm:mt-20 sm:py-10" aria-labelledby="other-products-heading">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Explore more</p>
          <h2 id="other-products-heading" className="mt-1 font-serif text-3xl">You may also like</h2>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {products.map((product) => {
          const image = getImage(product.image)

          return (
            <ProductLink key={product.id} href={`/products/${product.id}`}>
              <Card size="sm" className="h-full border-current/10 bg-background/70 shadow-none transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md group-focus-visible:ring-2 group-focus-visible:ring-ring">
                <div className="p-2 pb-0">
                  <AspectRatio ratio={1} className="overflow-hidden rounded-md bg-muted/60">
                    {image?.url ? (
                      <img src={image.url} alt={image.alt || product.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        <Package className="size-6" />
                      </div>
                    )}
                  </AspectRatio>
                </div>
                <CardContent className="flex items-start justify-between gap-2 p-3">
                  <CardTitle className="line-clamp-2 text-sm">{product.name}</CardTitle>
                  <span className="shrink-0 text-xs font-semibold">₹{product.price.toLocaleString('en-IN')}</span>
                </CardContent>
              </Card>
            </ProductLink>
          )
        })}
      </div>
    </section>
  )
}
