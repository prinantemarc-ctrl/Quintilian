"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Swords, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"

export function DuelCTASection() {
  const { t } = useLanguage()

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-orange-50 to-red-50">
      <div className="max-w-4xl mx-auto">
        <Card className="p-8 border-2 border-orange-200 shadow-lg bg-white/80 backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="flex-shrink-0">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <Swords className="w-10 h-10 text-white" />
              </div>
            </div>

            <div className="flex-1 text-center lg:text-left">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">{t("duel_cta.title")}</h2>
              <p className="text-lg text-gray-600 mb-6">{t("duel_cta.subtitle")}</p>

              <Link href="/duel">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  {t("duel_cta.button")}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </section>
  )
}
