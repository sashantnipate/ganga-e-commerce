import Link from 'next/link'
import { ArrowUpRight, Package } from 'lucide-react'
import { getPayload } from 'payload'
import config from '@payload-config'

import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type ProductImage = { url?: string; alt?: string }

type Product = {
  id: string
  name: string
  price: number
  stock: number
  category: string
  image?: ProductImage | string | null
  description?: unknown
}

type LexicalNode = { text?: string; children?: LexicalNode[] }

const bandStyles = [
  'bg-[#f4eee7] text-[#2d241e]',
  'bg-[#e5efee] text-[#193b3a]',
  'bg-[#eee9f3] text-[#30223d]',
  'bg-[#f4ead2] text-[#46351a]',
]

const getDescription = (description: unknown) => {
  const root = description as { root?: { children?: LexicalNode[] } } | null
  if (!root?.root?.children) return ''

  const extractText = (node: LexicalNode): string => {
    if (typeof node.text === 'string') return node.text
    return node.children?.map(extractText).join(' ') ?? ''
  }

  return root.root.children.map(extractText).join(' ').replace(/\s+/g, ' ').trim()
}

const getImage = (image: Product['image']) =>
  image && typeof image !== 'string' ? image : undefined

const formatCategory = (category: string) => category.replace(/-/g, ' ')

const RootPage = async () => {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({ collection: 'products', depth: 1, limit: 20 })
  const products = docs as unknown as Product[]
  const bands = Array.from({ length: Math.ceil(products.length / 4) }, (_, index) =>
    products.slice(index * 4, index * 4 + 4),
  )

  return (
    <main className="-mx-4 -mt-6 min-h-screen overflow-hidden sm:-mx-6">

      <section id="collection" aria-label="Product collection">
        {bands.length > 0 ? bands.map((band, bandIndex) => (
          <div key={bandIndex} className={`${bandStyles[bandIndex % bandStyles.length]} border-y border-current/10`}>
            <div className="mx-auto grid max-w-7xl gap-6 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:px-10 lg:py-20">
              {band.map((product) => {
                const image = getImage(product.image)
                const description = getDescription(product.description)

                return (
                  <Link key={product.id} href={`/products/${product.id}`} className="group block focus-visible:outline-none">
                    <Card className="h-full border-current/10 bg-background/75 shadow-none transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-xl group-focus-visible:ring-2 group-focus-visible:ring-ring">
                      <div className="px-3 pt-3">
                        <AspectRatio ratio={4 / 5} className="overflow-hidden rounded-lg bg-muted/60">
                          {image?.url ? (
                            <img src={image.url} alt={image.alt || product.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          ) : (
                            <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                              <Package className="size-8" /><span className="text-xs">Image coming soon</span>
                            </div>
                          )}
                          <Badge className="absolute left-3 top-3 capitalize" variant="secondary">{formatCategory(product.category)}</Badge>
                        </AspectRatio>
                      </div>
                      <CardHeader className="gap-2 pb-3">
                        <div className="flex items-start justify-between gap-3">
                          <CardTitle className="text-lg leading-tight">{product.name}</CardTitle>
                          <span className="shrink-0 text-sm font-semibold">₹{product.price.toLocaleString('en-IN')}</span>
                        </div>
                        <CardDescription className="line-clamp-2 min-h-10">
                          {description || 'A considered addition to your everyday.'}
                        </CardDescription>
                      </CardHeader>
                      <CardFooter className="mt-auto justify-between gap-3">
                        <span className="text-xs font-medium text-muted-foreground">{product.stock > 0 ? `${product.stock} available` : 'Out of stock'}</span>
                        <span className="text-sm font-medium transition-transform group-hover:translate-x-1">View item <ArrowUpRight className="ml-1 inline size-4" /></span>
                      </CardFooter>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </div>
        )) : (
          <div className="mx-auto max-w-7xl px-6 pb-24 lg:px-10">
            <Card className="items-center justify-center border-dashed py-20 text-center">
              <CardContent>
                <Package className="mx-auto mb-4 size-10 text-muted-foreground" />
                <CardTitle>No products yet</CardTitle>
                <CardDescription className="mt-2">The collection is being carefully assembled.</CardDescription>
              </CardContent>
            </Card>
          </div>
        )}
      </section>

    </main>
  )
}

export default RootPage
