"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Crown, Sparkles, CreditCard, ArrowRight } from "lucide-react"
import { CreditPackages } from "@/components/stripe/credit-packages"

interface PremiumGuardProps {
  children: React.ReactNode
  feature: string
  requiredCredits?: number
  showUpgrade?: boolean
}

export function PremiumGuard({ children, feature, requiredCredits = 1, showUpgrade = true }: PremiumGuardProps) {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const [credits, setCredits] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const response = await fetch("/api/credits")
        if (response.ok) {
          const data = await response.json()
          setCredits(data)
          setHasAccess(data.remainingCredits >= requiredCredits)
        } else {
          setHasAccess(false)
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de l'accès:", error)
        setHasAccess(false)
      } finally {
        setLoading(false)
      }
    }

    checkAccess()
  }, [requiredCredits])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (hasAccess) {
    return <>{children}</>
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="border-2 border-dashed border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500">
            <Crown className="h-8 w-8 text-white" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              <Sparkles className="h-3 w-3 mr-1" />
              Fonctionnalité Premium
            </Badge>
          </div>
          <CardTitle className="text-2xl">Accès Premium Requis</CardTitle>
          <CardDescription className="text-lg">
            La fonctionnalité "{feature}" nécessite {requiredCredits} crédit{requiredCredits > 1 ? "s" : ""} pour être
            utilisée.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {credits && (
            <div className="text-center p-4 bg-white rounded-lg border">
              <p className="text-sm text-muted-foreground mb-2">Vos crédits actuels</p>
              <div className="text-3xl font-bold text-red-500">{credits.remainingCredits}</div>
              <p className="text-sm text-muted-foreground">
                {credits.usedCredits} utilisés sur {credits.totalCredits} total
              </p>
            </div>
          )}

          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold">Que pouvez-vous faire ?</h3>
            <div className="grid gap-3 text-sm">
              <div className="flex items-center justify-center gap-2">
                <ArrowRight className="h-4 w-4 text-green-500" />
                <span>Acheter des crédits pour débloquer cette fonctionnalité</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <ArrowRight className="h-4 w-4 text-green-500" />
                <span>Accéder à toutes les fonctionnalités premium</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <ArrowRight className="h-4 w-4 text-green-500" />
                <span>Support prioritaire inclus</span>
              </div>
            </div>
          </div>

          {showUpgrade && (
            <div className="space-y-4">
              <div className="text-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600"
                >
                  <a href="/dashboard/credits">
                    <CreditCard className="mr-2 h-5 w-5" />
                    Acheter des crédits
                  </a>
                </Button>
              </div>

              <div className="pt-4">
                <h4 className="text-center font-semibold mb-4">Packages disponibles</h4>
                <CreditPackages />
              </div>
            </div>
          )}

          <div className="text-center pt-4 border-t">
            <Button variant="outline" asChild>
              <a href="/dashboard">Retour au dashboard</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
