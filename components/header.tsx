"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, Swords, Globe, ChevronDown } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { language, setLanguage, t } = useLanguage()

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
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="group flex items-center space-x-2">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-primary rounded-lg blur-sm opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative bg-gradient-to-r from-primary via-secondary to-primary text-primary-foreground px-3 py-1 rounded-lg font-bold text-lg">
                  QI
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Quintilian Index
                </span>
                <span className="text-xs text-muted-foreground -mt-1">Reputation Analytics</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection("features")}
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              {t("header.features")}
            </button>
            <Link
              href="/duel"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              <Swords className="w-4 h-4" />
              {t("header.duel")}
            </Link>
            <button
              onClick={() => scrollToSection("pricing")}
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              {t("header.pricing")}
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              {t("header.contact")}
            </button>
          </nav>

          {/* Desktop CTA and Language Toggle */}
          <div className="hidden md:flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1 bg-transparent">
                  <Globe className="w-4 h-4" />
                  {getLanguageLabel(language)}
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLanguage("fr")}>🇫🇷 Français</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("en")}>🇺🇸 English</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("es")}>🇪🇸 Español</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link href="/analyze">
              <Button className="bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:from-primary/90 hover:to-secondary/90 shadow-lg hover:shadow-xl transition-all duration-200">
                {t("header.try_free")}
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
              <button
                onClick={() => scrollToSection("features")}
                className="block px-3 py-2 text-base font-medium text-foreground hover:text-primary transition-colors w-full text-left"
              >
                {t("header.features")}
              </button>
              <Link
                href="/duel"
                className="block px-3 py-2 text-base font-medium text-foreground hover:text-primary transition-colors w-full text-left flex items-center gap-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <Swords className="w-4 h-4" />
                {t("header.duel")}
              </Link>
              <button
                onClick={() => scrollToSection("pricing")}
                className="block px-3 py-2 text-base font-medium text-foreground hover:text-primary transition-colors w-full text-left"
              >
                {t("header.pricing")}
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className="block px-3 py-2 text-base font-medium text-foreground hover:text-primary transition-colors w-full text-left"
              >
                {t("header.contact")}
              </button>

              <div className="px-3 py-2">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Langue / Language / Idioma
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setLanguage("fr")
                        setIsMenuOpen(false)
                      }}
                      className={`px-3 py-1 rounded text-sm ${
                        language === "fr"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      🇫🇷 FR
                    </button>
                    <button
                      onClick={() => {
                        setLanguage("en")
                        setIsMenuOpen(false)
                      }}
                      className={`px-3 py-1 rounded text-sm ${
                        language === "en"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      🇺🇸 EN
                    </button>
                    <button
                      onClick={() => {
                        setLanguage("es")
                        setIsMenuOpen(false)
                      }}
                      className={`px-3 py-1 rounded text-sm ${
                        language === "es"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      🇪🇸 ES
                    </button>
                  </div>
                </div>
              </div>

              <div className="px-3 py-2">
                <Link href="/analyze">
                  <Button className="w-full bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:from-primary/90 hover:to-secondary/90 shadow-lg">
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
