"use client"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"

export function CTASection() {
  const { t } = useLanguage()

  const scrollToHero = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <section className="py-20 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl lg:text-4xl font-bold text-balance">{t("cta.title")}</h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto text-pretty">{t("cta.subtitle")}</p>
          </div>

          <Button
            onClick={scrollToHero}
            size="lg"
            className="bg-accent text-accent-foreground hover:bg-accent/90 text-lg px-8 py-4 h-auto"
          >
            {t("cta.button")}
          </Button>
        </div>
      </div>
    </section>
  )
}
