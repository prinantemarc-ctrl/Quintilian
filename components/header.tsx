"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, Swords, BarChart3, Shield } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { UserMenu } from "@/components/auth/user-menu-new"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
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
        <div className="flex h-14 sm:h-16 items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center shrink-0">
            <Link href="/" className="group flex items-center gap-2 sm:gap-4">
              <div className="relative shrink-0">
                <div className="absolute inset-0 bg-violet-600/20 rounded-sm blur-md group-hover:bg-violet-600/30 transition-all duration-300"></div>
                <div className="relative border border-violet-900 bg-black text-violet-500 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center font-heading font-black text-lg sm:text-xl tracking-tighter rounded-sm">
                  M
                </div>
              </div>
              <span className="text-base sm:text-xl font-heading font-bold tracking-widest text-white group-hover:text-violet-400 transition-colors uppercase whitespace-nowrap">
                MAK-IA
              </span>
            </Link>
          </div>

          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 mx-6">
            <Link
              href="/analyze"
              className="text-xs font-medium tracking-widest text-zinc-400 hover:text-white transition-colors flex items-center gap-2 uppercase whitespace-nowrap"
            >
              <BarChart3 className="w-4 h-4 text-violet-500/50" />
              Analysis
            </Link>
            <Link
              href="/duel"
              className="text-xs font-medium tracking-widest text-zinc-400 hover:text-white transition-colors flex items-center gap-2 uppercase whitespace-nowrap"
            >
              <Swords className="w-4 h-4 text-violet-500/50" />
              Duel
            </Link>
            <Link
              href="/renseignement"
              className="text-xs font-medium tracking-widest text-zinc-400 hover:text-white transition-colors flex items-center gap-2 uppercase whitespace-nowrap"
            >
              <Shield className="w-4 h-4 text-violet-500/50" />
              Intel
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-4 lg:gap-8 shrink-0">
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
              <Button className="bg-violet-600 hover:bg-violet-700 text-white rounded-sm font-bold text-[10px] sm:text-xs uppercase tracking-widest px-3 sm:px-6 py-4 sm:py-5 shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] transition-all duration-300 border-none whitespace-nowrap">
                TRY FREE
              </Button>
            </Link>
          </div>

          <button
            className="md:hidden p-2 text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden z-[100] border-t border-white/10 bg-black">
            <div className="px-4 pt-4 pb-6 space-y-3">
              <Link
                href="/analyze"
                className="block py-2 text-sm font-sans uppercase text-zinc-400 hover:text-violet-400"
                onClick={() => setIsMenuOpen(false)}
              >
                <BarChart3 className="w-4 h-4 inline mr-2" />
                Basic Analysis
              </Link>
              <Link
                href="/duel"
                className="block py-2 text-sm font-sans uppercase text-zinc-400 hover:text-violet-400"
                onClick={() => setIsMenuOpen(false)}
              >
                <Swords className="w-4 h-4 inline mr-2" />
                Duel
              </Link>
              <Link
                href="/renseignement"
                className="block py-2 text-sm font-sans uppercase text-zinc-400 hover:text-violet-400"
                onClick={() => setIsMenuOpen(false)}
              >
                <Shield className="w-4 h-4 inline mr-2" />
                Intel
              </Link>
              <Link
                href="/contact"
                className="block py-2 text-sm font-sans uppercase text-zinc-400 hover:text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>

              <div className="pt-3 border-t border-white/10">
                <Link href="/analyze">
                  <Button className="w-full bg-violet-600 text-white rounded-none font-medium uppercase">
                    TRY FREE
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
