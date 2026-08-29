import configPromise from '@payload-config'
import { handleServerFunctions, RootLayout } from '@payloadcms/next/layouts'
import React from 'react'

import { importMap } from './admin/importMap.js'
import '@payloadcms/next/css'

type Args = {
  children: React.ReactNode
}

const serverFunction = async (args: any) => {
  'use server'
  return handleServerFunctions({
    ...args,
    config: configPromise,
    importMap,
  })
}

const Layout = ({ children }: Args) => (
  <RootLayout 
    config={configPromise} 
    importMap={importMap} 
    serverFunction={serverFunction}
  >
    {children}
  </RootLayout>
)

export default Layout