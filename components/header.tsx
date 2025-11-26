"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, Swords, BarChart3, Shield } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { LanguageSelector } from "@/components/language-selector-new"
import { UserMenu } from "@/components/auth/user-menu-new"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { language, setLanguage, t } = useLanguage()
  const router = useRouter()
  const [supabase, setSupabase] = useState<any>(null)

  useEffect(() => {
    try {
      const client = createClient()
      setSupabase(client)
    } catch (error) {
      console.log("[v0] Failed to create Supabase client:", error)
      setSupabase(null)
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false)
      return
    }

    const getUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        setUser(user)
      } catch (error) {
        console.log("[v0] Auth error:", error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    getUser()

    try {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        setUser(session?.user ?? null)
      })

      return () => subscription.unsubscribe()
    } catch (error) {
      console.log("[v0] Auth listener error:", error)
      setIsLoading(false)
    }
  }, [supabase])

  const handleLogout = async () => {
    if (!supabase) {
      setUser(null)
      router.push("/")
      return
    }

    try {
      await supabase.auth.signOut()
      router.push("/")
    } catch (error) {
      console.log("[v0] Logout error:", error)
      setUser(null)
      router.push("/")
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/80 backdrop-blur-xl supports-[backdrop-filter]:bg-black/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center shrink-0">
            <Link href="/" className="group flex items-center gap-4">
              <div className="relative shrink-0">
                <div className="absolute inset-0 bg-red-600/20 rounded-sm blur-md group-hover:bg-red-600/30 transition-all duration-300"></div>
                <div className="relative border border-red-900 bg-black text-red-500 w-10 h-10 flex items-center justify-center font-serif font-black text-xl tracking-tighter rounded-sm">
                  M
                </div>
              </div>
              <span className="text-xl font-heading font-bold tracking-widest text-white group-hover:text-red-500 transition-colors uppercase whitespace-nowrap">
                MAK-IA
              </span>
            </Link>
          </div>

          {/* Desktop Navigation - Simplified to 2 analysis types */}
          <nav className="hidden md:flex items-center gap-8 mx-6">
            <Link
              href="/renseignement"
              className="text-xs font-medium tracking-widest text-zinc-400 hover:text-white transition-colors flex items-center gap-2 uppercase whitespace-nowrap"
            >
              <Shield className="w-4 h-4 text-emerald-500/50" />
              Renseignement
            </Link>
            <Link
              href="/analyze"
              className="text-xs font-medium tracking-widest text-zinc-400 hover:text-white transition-colors flex items-center gap-2 uppercase whitespace-nowrap"
            >
              <BarChart3 className="w-4 h-4 text-blue-500/50" />
              Audit
            </Link>
            <Link
              href="/duel"
              className="text-xs font-medium tracking-widest text-zinc-400 hover:text-white transition-colors flex items-center gap-2 uppercase whitespace-nowrap"
            >
              <Swords className="w-4 h-4 text-red-500/50" />
              Confrontation
            </Link>
          </nav>

          {/* Desktop CTA and Auth */}
          <div className="hidden md:flex items-center gap-8 shrink-0">
            <div className="flex items-center">
              <LanguageSelector />
            </div>

            {!isLoading && (
              <>
                {user ? (
                  <UserMenu />
                ) : (
                  <div className="flex items-center">
                    <Link
                      href="/auth/login"
                      className="text-xs font-medium uppercase tracking-widest text-zinc-400 hover:text-white transition-colors whitespace-nowrap"
                    >
                      LOG IN
                    </Link>
                  </div>
                )}
              </>
            )}

            <Link href="/analyze">
              <Button className="bg-red-600 hover:bg-red-700 text-white rounded-sm font-bold text-xs uppercase tracking-widest px-6 py-5 shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)] transition-all duration-300 border-none whitespace-nowrap">
                {t("header.try_free")}
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Navigation - Simplified to 2 analysis types */}
        {isMenuOpen && (
          <div className="md:hidden z-[100] border-t border-white/10 bg-black">
            <div className="px-4 pt-4 pb-6 space-y-4">
              <Link
                href="/renseignement"
                className="block py-2 text-sm font-mono uppercase text-zinc-400 hover:text-emerald-500"
                onClick={() => setIsMenuOpen(false)}
              >
                <Shield className="w-4 h-4 inline mr-2" />
                Renseignement
              </Link>
              <Link
                href="/analyze"
                className="block py-2 text-sm font-mono uppercase text-zinc-400 hover:text-blue-500"
                onClick={() => setIsMenuOpen(false)}
              >
                <BarChart3 className="w-4 h-4 inline mr-2" />
                Audit de Réputation
              </Link>
              <Link
                href="/duel"
                className="block py-2 text-sm font-mono uppercase text-zinc-400 hover:text-red-500"
                onClick={() => setIsMenuOpen(false)}
              >
                <Swords className="w-4 h-4 inline mr-2" />
                Mode Confrontation
              </Link>
              <Link
                href="/contact"
                className="block py-2 text-sm font-mono uppercase text-zinc-400 hover:text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>

              <div className="pt-4 border-t border-white/10">
                <Link href="/analyze">
                  <Button className="w-full bg-red-600 text-white rounded-none font-mono uppercase">
                    {t("header.try_free")}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
