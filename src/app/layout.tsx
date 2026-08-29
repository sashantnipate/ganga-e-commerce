import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Source_Serif_4, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Header } from "@/features/side-layout/header";
import { FilterSidebar } from "@/features/side-layout/filter";

const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Ganga",
  description: "Modern E-Commerce Store",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="h-full">
        <body
          className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} flex min-h-full flex-col bg-background font-sans antialiased`}
        >
          <Header />

          <div className="w-full px-4 sm:px-6">
            {/* Added pt-6 for a clean gap between Header and Sidebar */}
            <div className="relative flex min-h-[calc(100vh-4rem)] pt-6">
              
              {/* Sidebar moved down with top-20 for breathing space */}
              <aside className="hidden md:block fixed top-20 left-4 sm:left-6 w-52 lg:w-56 h-[calc(100vh-5.5rem)] overflow-y-auto pr-3 scrollbar-none">
                <FilterSidebar />
              </aside>

              {/* Main Content Area */}
              <main className="w-full min-w-0 md:pl-56 lg:pl-60">
                {children}
              </main>

            </div>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}