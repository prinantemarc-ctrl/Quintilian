"use client"

import { useLanguage } from "@/contexts/language-context"
import { Button } from "@/components/ui/button"
import { Zap } from "lucide-react"
import Link from "next/link"

export function DuelAnnouncement() {
  const { t } = useLanguage()

  return (
    <div className="bg-red-600 text-white py-4">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-4 text-center">
          <Zap className="h-6 w-6 text-yellow-300" />
          <div className="flex-1">
            <h3 className="text-lg font-bold mb-1">{t.duelAnnouncement?.title || "🔥 NOUVEAU : Mode Duel !"}</h3>
            <p className="text-sm opacity-90">
              {t.duelAnnouncement?.description ||
                "Vous avez un concurrent ? Ou vous voulez vous comparer ? Testez le mode duel !"}
            </p>
          </div>
          <Button
            asChild
            variant="secondary"
            size="sm"
            className="bg-white text-red-600 hover:bg-gray-100 font-semibold"
          >
            <Link href="/duel">{t.duelAnnouncement?.cta || "Essayer maintenant"}</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
