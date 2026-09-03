"use client"

import { useState } from "react"

import { Header } from "@/features/side-layout/header"

interface StoreChromeProps {
  children: React.ReactNode
}

export function StoreChrome({ children }: StoreChromeProps) {
  

  return (
    <div className="min-h-screen">
      <Header/>

      <div className="w-full px-4 sm:px-6">
        <main className="w-full min-w-0 pb-10 pt-6">
          {children}
        </main>
      </div>
    </div>
  )
}