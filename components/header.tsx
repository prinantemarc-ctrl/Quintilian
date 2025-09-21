"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, Swords, Globe, ChevronDown, Lightbulb, Newspaper, User, LogOut } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { language, setLanguage, t } = useLanguage()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
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
  }, [supabase.auth])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push("/")
    } catch (error) {
      console.log("[v0] Logout error:", error)
      // Force logout même en cas d'erreur
      setUser(null)
      router.push("/")
    }
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
    setIsMenuOpen(false)
  }

  const scrollToHero = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
    setIsMenuOpen(false)
  }

  const getLanguageLabel = (lang: string) => {
    const labels = {
      fr: "🇫🇷 FR",
      en: "🇺🇸 EN",
      es: "🇪🇸 ES",
    }
    return labels[lang as keyof typeof labels] || lang.toUpperCase()
  }

  const getLanguageName = (lang: string) => {
    const names = {
      fr: "Français",
      en: "English",
      es: "Español",
    }
    return names[lang as keyof typeof names] || lang
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="group flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-secondary rounded-xl blur-sm opacity-60 group-hover:opacity-80 transition-all duration-300"></div>
                <div className="relative bg-gradient-to-br from-primary via-accent to-secondary text-primary-foreground px-3 py-2 rounded-xl font-bold text-lg shadow-lg">
                  QI
                </div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                Quintilian Index
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 ml-8">
            <Link
              href="/duel"
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-all duration-200 hover:scale-105 flex items-center gap-1"
            >
              <Swords className="w-4 h-4" />
              Duel
            </Link>
            <Link
              href="/world-reputation"
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-all duration-200 hover:scale-105 flex items-center gap-1"
            >
              <Globe className="w-4 h-4" />
              GMI
            </Link>
            <Link
              href="/presse"
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-all duration-200 hover:scale-105 flex items-center gap-1"
            >
              <Newspaper className="w-4 h-4" />
              Presse
            </Link>
            <Link
              href="/solutions"
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-all duration-200 hover:scale-105 flex items-center gap-1"
            >
              <Lightbulb className="w-4 h-4" />
              Solutions
            </Link>
            <Link
              href="/contact"
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-all duration-200 hover:scale-105"
            >
              {t("header.contact")}
            </Link>
          </nav>

          {/* Desktop CTA and Auth */}
          <div className="hidden md:flex items-center space-x-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 bg-card/50 border-border/60 hover:bg-card hover:border-primary/20 transition-all duration-200 relative z-[60] cursor-pointer touch-manipulation min-h-[36px] px-3"
                >
                  <Globe className="w-4 h-4" />
                  {getLanguageLabel(language)}
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-card/95 backdrop-blur-sm border-border/60 z-[200] min-w-[140px]"
                sideOffset={4}
              >
                <DropdownMenuItem
                  onClick={() => setLanguage("fr")}
                  className="hover:bg-primary/10 cursor-pointer touch-manipulation min-h-[36px] px-3"
                >
                  🇫🇷 Français
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setLanguage("en")}
                  className="hover:bg-primary/10 cursor-pointer touch-manipulation min-h-[36px] px-3"
                >
                  🇺🇸 English
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setLanguage("es")}
                  className="hover:bg-primary/10 cursor-pointer touch-manipulation min-h-[36px] px-3"
                >
                  🇪🇸 Español
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {!isLoading && (
              <>
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 bg-transparent relative z-[60] cursor-pointer touch-manipulation min-h-[36px] px-3"
                      >
                        <User className="w-4 h-4" />
                        {user.email?.split("@")[0]}
                        <ChevronDown className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="z-[200] min-w-[140px]" sideOffset={4}>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-2 cursor-pointer touch-manipulation min-h-[36px] px-3 w-full"
                        >
                          <User className="w-4 h-4" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-destructive cursor-pointer touch-manipulation min-h-[36px] px-3"
                      >
                        <LogOut className="w-4 h-4" />
                        Déconnexion
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/auth/login">Connexion</Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link href="/auth/sign-up">Inscription</Link>
                    </Button>
                  </div>
                )}
              </>
            )}

            <Link href="/analyze">
              <Button className="bg-gradient-to-r from-primary via-accent to-secondary text-primary-foreground hover:from-primary/90 hover:via-accent/90 hover:to-secondary/90 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 font-semibold">
                {t("header.try_free")}
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer touch-manipulation z-[60]"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden z-[100]">
            <div className="px-2 pt-4 pb-6 space-y-2 border-t border-border/40 bg-card/30 backdrop-blur-sm">
              <Link
                href="/duel"
                className="block px-4 py-3 text-base font-medium text-foreground/80 hover:text-primary hover:bg-primary/5 transition-all duration-200 w-full text-left rounded-lg flex items-center gap-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <Swords className="w-4 h-4" />
                {t("header.duel")}
              </Link>
              <Link
                href="/world-reputation"
                className="block px-4 py-3 text-base font-medium text-foreground/80 hover:text-primary hover:bg-primary/5 transition-all duration-200 w-full text-left rounded-lg flex items-center gap-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <Globe className="w-4 h-4" />
                GMI
              </Link>
              <Link
                href="/presse"
                className="block px-4 py-3 text-base font-medium text-foreground/80 hover:text-primary hover:bg-primary/5 transition-all duration-200 w-full text-left rounded-lg flex items-center gap-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <Newspaper className="w-4 h-4" />
                Presse
              </Link>
              <Link
                href="/solutions"
                className="block px-4 py-3 text-base font-medium text-foreground/80 hover:text-primary hover:bg-primary/5 transition-all duration-200 w-full text-left rounded-lg flex items-center gap-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <Lightbulb className="w-4 h-4" />
                Solutions
              </Link>
              <Link
                href="/contact"
                className="block px-4 py-3 text-base font-medium text-foreground/80 hover:text-primary hover:bg-primary/5 transition-all duration-200 w-full text-left rounded-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                {t("header.contact")}
              </Link>

              {!isLoading && (
                <div className="px-4 py-3 space-y-2">
                  {user ? (
                    <>
                      <p className="text-sm text-muted-foreground">Connecté en tant que {user.email}</p>
                      <Link href="/dashboard">
                        <Button
                          variant="outline"
                          className="w-full bg-transparent"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <User className="w-4 h-4 mr-2" />
                          Dashboard
                        </Button>
                      </Link>
                      <Button variant="outline" className="w-full bg-transparent" onClick={handleLogout}>
                        <LogOut className="w-4 h-4 mr-2" />
                        Déconnexion
                      </Button>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <Link href="/auth/login">
                        <Button
                          variant="outline"
                          className="w-full bg-transparent"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Connexion
                        </Button>
                      </Link>
                      <Link href="/auth/sign-up">
                        <Button className="w-full" onClick={() => setIsMenuOpen(false)}>
                          Inscription
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}

              <div className="px-4 py-3">
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Langue / Language / Idioma
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setLanguage("fr")
                        setIsMenuOpen(false)
                      }}
                      className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer touch-manipulation min-h-[44px] flex-1 ${
                        language === "fr"
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      🇫🇷 FR
                    </button>
                    <button
                      onClick={() => {
                        setLanguage("en")
                        setIsMenuOpen(false)
                      }}
                      className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer touch-manipulation min-h-[44px] flex-1 ${
                        language === "en"
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      🇺🇸 EN
                    </button>
                    <button
                      onClick={() => {
                        setLanguage("es")
                        setIsMenuOpen(false)
                      }}
                      className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer touch-manipulation min-h-[44px] flex-1 ${
                        language === "es"
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      🇪🇸 ES
                    </button>
                  </div>
                </div>
              </div>

              <div className="px-4 py-2">
                <Link href="/analyze">
                  <Button className="w-full bg-gradient-to-r from-primary via-accent to-secondary text-primary-foreground hover:from-primary/90 hover:via-accent/90 hover:to-secondary/90 shadow-lg font-semibold">
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
