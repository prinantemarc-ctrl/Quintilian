"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Sparkles, CreditCard } from "lucide-react"

export function FreemiumBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [credits, setCredits] = useState<any>(null)

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const response = await fetch("/api/credits")
        if (response.ok) {
          const data = await response.json()
          setCredits(data)
          // Afficher la bannière si l'utilisateur a peu de crédits
          setIsVisible(data.remainingCredits <= 10)
        }
      } catch (error) {
        console.error("Erreur lors du chargement des crédits:", error)
      }
    }

    fetchCredits()
  }, [])

  if (!isVisible || !credits) {
    return null
  }

  return (
    <Card className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100">
              <Sparkles className="h-4 w-4 text-yellow-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  Freemium
                </Badge>
                <span className="font-medium">
                  Plus que {credits.remainingCredits} crédit{credits.remainingCredits > 1 ? "s" : ""} !
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Rechargez vos crédits pour continuer à utiliser toutes les fonctionnalités
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" asChild>
              <a href="/dashboard/credits">
                <CreditCard className="mr-2 h-3 w-3" />
                Recharger
              </a>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsVisible(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
