import type React from "react"
import type { Metadata } from "next"
import { Manrope, Inter, JetBrains_Mono } from "next/font/google"
import { Suspense } from "react"
import { Header } from "@/components/header"
import "./globals.css"

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "MAK-IA | Your Personal Spy",
  description: "Discover how the world really perceives you. Artificial intelligence at the service of your power.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`font-sans ${manrope.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased bg-background text-foreground`}
      >
        <Header />
        <Suspense fallback={null}>{children}</Suspense>
      </body>
    </html>
  )
}
