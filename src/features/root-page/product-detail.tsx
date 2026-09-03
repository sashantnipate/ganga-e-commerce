import { Package } from 'lucide-react'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import { RichText } from '@payloadcms/richtext-lexical/react'
import config from '@payload-config'

import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { AddToCartButton } from '@/features/user-interactions/add-to-cart-button'
import { OtherProducts } from '@/features/root-page/other-products'

type ProductImage = { url?: string; alt?: string }
type Product = {
  id: string
  name: string
  price: number
  stock: number
  category: string
  image?: ProductImage | string | null
  description?: Parameters<typeof RichText>[0]['data']
}

const getImage = (image: Product['image']) => image && typeof image !== 'string' ? image : undefined
const formatCategory = (category: string) => category.replace(/-/g, ' ')

type ProductDetailProps = { id: string }

export default async function ProductDetail({ id }: ProductDetailProps) {
  const payload = await getPayload({ config })
  let product: Product

  try {
    product = (await payload.findByID({ collection: 'products', id, depth: 1 })) as unknown as Product
  } catch {
    notFound()
  }

  const image = getImage(product.image)

  return (
    <main className="-mx-4 -mt-6 min-h-screen bg-[#f4eee7] px-6 py-10 text-[#2d241e] sm:-mx-6 sm:px-10 sm:py-14">
      <div className="mx-auto max-w-6xl">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(360px,1fr)] lg:gap-20">
          <div className="mx-auto w-full max-w-md">
            <AspectRatio ratio={4 / 5} className="overflow-hidden rounded-lg bg-muted/60">
              {image?.url ? (
                <img src={image.url} alt={image.alt || product.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
                  <Package className="size-12" /><span>Image coming soon</span>
                </div>
              )}
            </AspectRatio>
          </div>

          <div className="flex flex-col gap-7">
            <Badge variant="outline" className="w-fit capitalize">{formatCategory(product.category)}</Badge>
            <h1 className="font-serif text-4xl leading-none sm:text-6xl">{product.name}</h1>
            <div className="flex items-end justify-between gap-4">
              <span className="text-3xl font-semibold tracking-tight">₹{product.price.toLocaleString('en-IN')}</span>
              <span className="text-sm text-muted-foreground">{product.stock > 0 ? `${product.stock} available` : 'Currently unavailable'}</span>
            </div>
            <Separator className="bg-current/15" />
            <AddToCartButton productId={product.id} product={{ id: product.id, name: product.name, price: product.price, stock: product.stock, image: product.image }} disabled={product.stock === 0} />
          </div>
        </div>

        <OtherProducts currentProductId={product.id} />

        <section className="mt-16 border-t border-current/15 pt-10 sm:mt-20 sm:pt-12">
          {product.description ? (
            <RichText
              data={product.description}
              className="max-w-3xl text-base leading-8 text-[#2d241e] [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-current/30 [&_blockquote]:pl-5 [&_h1]:mb-5 [&_h1]:font-serif [&_h1]:text-4xl [&_h2]:mb-4 [&_h2]:font-serif [&_h2]:text-3xl [&_h3]:mb-3 [&_h3]:font-serif [&_h3]:text-2xl [&_li]:ml-5 [&_ol]:list-decimal [&_p]:mb-5 [&_ul]:list-disc"
            />
          ) : (
            <p className="text-muted-foreground">No description available.</p>
          )}
        </section>
      </div>
    </main>
  )
}
