import type { Metadata } from "next"
import {
  Plus_Jakarta_Sans,
  Source_Serif_4,
  JetBrains_Mono,
} from "next/font/google"
import "./globals.css"
import { ClerkProvider } from "@clerk/nextjs"

import { StoreChrome } from "@/features/side-layout/store-chrome"

const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
})

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "Ganga",
  description: "Modern E-Commerce Store",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="h-full">
        <body
          className={`
            ${fontSans.variable}
            ${fontSerif.variable}
            ${fontMono.variable}
            flex
            min-h-full
            flex-col
            bg-background
            font-sans
            antialiased
          `}
        >
          <StoreChrome>
            {children}
          </StoreChrome>
        </body>
      </html>
    </ClerkProvider>
  )
}