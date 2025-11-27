import type React from "react"
import type { Metadata } from "next"
import { Manrope, Inter, JetBrains_Mono } from "next/font/google"
import { Suspense } from "react"
import { LanguageProvider } from "@/contexts/language-context"
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
  title: "MAK-IA | Votre espion personnel",
  description:
    "Découvrez comment le monde vous perçoit vraiment. L'intelligence artificielle au service de votre pouvoir.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className="dark">
      <body
        className={`font-sans ${manrope.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased bg-background text-foreground`}
      >
        <LanguageProvider>
          <Header />
          <Suspense fallback={null}>{children}</Suspense>
        </LanguageProvider>
      </body>
    </html>
  )
}
