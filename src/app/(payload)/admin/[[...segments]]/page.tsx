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

type RootPageParams = Promise<{ segments: string[] }>

const rootPageParams = (params: Args['params']) => params as RootPageParams

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
    params={rootPageParams(params)}
    searchParams={searchParams}
  />
)

export default Page
