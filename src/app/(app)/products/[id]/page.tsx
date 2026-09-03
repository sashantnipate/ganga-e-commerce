import ProductDetail from '@/features/root-page/product-detail'

type ProductPageProps = { params: Promise<{ id: string }> }

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params
  return <ProductDetail id={id} />
}
