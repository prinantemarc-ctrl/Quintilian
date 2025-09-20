"use client"

import { useLanguage } from "@/contexts/language-context"

export function Footer() {
  const { t } = useLanguage()

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold">QUINTILIAN INDEX</h3>
            <p className="text-sm opacity-90">{t("footer.description")}</p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold">{t("footer.quick_links")}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => scrollToSection("features")}
                  className="opacity-90 hover:opacity-100 transition-opacity"
                >
                  {t("footer.features")}
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("pricing")}
                  className="opacity-90 hover:opacity-100 transition-opacity"
                >
                  {t("footer.pricing")}
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("contact")}
                  className="opacity-90 hover:opacity-100 transition-opacity"
                >
                  {t("footer.contact")}
                </button>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="font-semibold">{t("footer.legal")}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/legal/mentions" className="opacity-90 hover:opacity-100 transition-opacity">
                  {t("footer.legal_mentions")}
                </a>
              </li>
              <li>
                <a href="/legal/privacy" className="opacity-90 hover:opacity-100 transition-opacity">
                  {t("footer.privacy")}
                </a>
              </li>
              <li>
                <a href="/legal/terms" className="opacity-90 hover:opacity-100 transition-opacity">
                  {t("footer.terms")}
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="font-semibold">{t("footer.contact_title")}</h4>
            <div className="text-sm space-y-2">
              <p>
                <a href="mailto:contact@seogptscore.com" className="opacity-90 hover:opacity-100 transition-opacity">
                  contact@quintilian.app
                </a>
              </p>
              <p className="opacity-90">{t("footer.support")}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center">
          <p className="text-sm opacity-90">© 2025 Quintilian App</p>
        </div>
      </div>
    </footer>
  )
}
