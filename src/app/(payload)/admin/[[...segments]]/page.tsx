import configPromise from '@payload-config'
import { RootPage, generatePageMetadata } from '@payloadcms/next/views'
import { importMap } from '../importMap'

type Args = {
  params: Promise<{
    segments?: string[]
  }>
  searchParams: Promise<{
    [key: string]: string | string[]
  }>
}

export const generateMetadata = ({ params, searchParams }: Args) =>
  generatePageMetadata({ 
    config: configPromise, 
    params, 
    searchParams 
  })

const Page = ({ params, searchParams }: Args) => (
  <RootPage
    config={configPromise}
    importMap={importMap}
    params={params}
    searchParams={searchParams}
  />
)

export default Page