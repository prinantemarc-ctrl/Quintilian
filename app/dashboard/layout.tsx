import { AuthGuard } from "@/components/auth/auth-guard"
import { UserMenu } from "@/components/auth/user-menu"
import { FreemiumBanner } from "@/components/paywall/freemium-banner"
import { Separator } from "@/components/ui/separator"
import { LayoutDashboard, Search, CreditCard, History, Settings, BookOpen } from "lucide-react"
import Link from "next/link"
import type React from "react"
import { Suspense } from "react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center">
            <div className="mr-4 flex">
              <Link href="/dashboard" className="mr-6 flex items-center space-x-2">
                <BookOpen className="h-6 w-6" />
                <span className="font-bold">MAK-IA</span>
              </Link>
            </div>
            <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
              <nav className="flex items-center space-x-6 text-sm font-medium">
                <Link href="/dashboard" className="transition-colors hover:text-foreground/80 text-foreground/60">
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/search"
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                >
                  Recherche
                </Link>
                <Link
                  href="/dashboard/credits"
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                >
                  Crédits
                </Link>
              </nav>
              <UserMenu />
            </div>
          </div>
        </header>

        {/* Freemium Banner */}
        <div className="container py-2">
          <FreemiumBanner />
        </div>

        {/* Main Content */}
        <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10 py-6">
          {/* Sidebar */}
          <aside className="fixed top-20 z-30 -ml-2 hidden h-[calc(100vh-5rem)] w-full shrink-0 md:sticky md:block">
            <div className="h-full py-6 pr-6 lg:py-8">
              <nav className="grid items-start gap-2">
                <Suspense fallback={<div>Loading...</div>}>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Vue d'ensemble
                  </Link>
                  <Link
                    href="/dashboard/search"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                  >
                    <Search className="h-4 w-4" />
                    Recherche IA
                  </Link>
                  <Link
                    href="/dashboard/credits"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                  >
                    <CreditCard className="h-4 w-4" />
                    Mes crédits
                  </Link>
                  <Link
                    href="/dashboard/history"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                  >
                    <History className="h-4 w-4" />
                    Historique
                  </Link>
                  <Separator className="my-2" />
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                  >
                    <Settings className="h-4 w-4" />
                    Paramètres
                  </Link>
                </Suspense>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex w-full flex-col overflow-hidden">{children}</main>
        </div>
      </div>
    </AuthGuard>
  )
}
