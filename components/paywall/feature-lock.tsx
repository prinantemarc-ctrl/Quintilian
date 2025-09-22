"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lock, Sparkles, CreditCard } from "lucide-react"

interface FeatureLockProps {
  title: string
  description: string
  requiredCredits: number
  features?: string[]
  compact?: boolean
}

export function FeatureLock({ title, description, requiredCredits, features = [], compact = false }: FeatureLockProps) {
  if (compact) {
    return (
      <div className="relative">
        <div className="absolute inset-0 bg-black/10 backdrop-blur-sm rounded-lg z-10 flex items-center justify-center">
          <Card className="w-full max-w-sm">
            <CardHeader className="text-center pb-2">
              <Lock className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
              <Badge variant="secondary" className="mb-2">
                <Sparkles className="h-3 w-3 mr-1" />
                Premium
              </Badge>
              <CardTitle className="text-lg">{title}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-4">{description}</p>
              <Button asChild size="sm">
                <a href="/dashboard/credits">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Débloquer ({requiredCredits} crédits)
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
        <div className="opacity-30 pointer-events-none">
          {/* Le contenu verrouillé sera affiché ici en arrière-plan */}
        </div>
      </div>
    )
  }

  return (
    <Card className="border-2 border-dashed border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
          <Lock className="h-6 w-6 text-yellow-600" />
        </div>
        <Badge variant="secondary" className="mb-2 bg-yellow-100 text-yellow-800">
          <Sparkles className="h-3 w-3 mr-1" />
          Fonctionnalité Premium
        </Badge>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">{requiredCredits}</div>
          <div className="text-sm text-muted-foreground">crédit{requiredCredits > 1 ? "s" : ""} requis</div>
        </div>

        {features.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">Cette fonctionnalité inclut :</h4>
            <ul className="text-sm space-y-1">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <Sparkles className="h-3 w-3 text-yellow-500 mr-2" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex gap-2">
          <Button asChild className="flex-1">
            <a href="/dashboard/credits">
              <CreditCard className="mr-2 h-4 w-4" />
              Acheter des crédits
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/dashboard">Dashboard</a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
