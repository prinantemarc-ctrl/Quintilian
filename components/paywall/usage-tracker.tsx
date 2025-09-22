"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, AlertTriangle, CreditCard } from "lucide-react"

interface UsageStats {
  totalCredits: number
  usedCredits: number
  remainingCredits: number
  usagePercentage: number
}

export function UsageTracker() {
  const [usage, setUsage] = useState<UsageStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const response = await fetch("/api/credits")
        if (response.ok) {
          const data = await response.json()
          const usagePercentage = data.totalCredits > 0 ? (data.usedCredits / data.totalCredits) * 100 : 0
          setUsage({
            ...data,
            usagePercentage,
          })
        }
      } catch (error) {
        console.error("Erreur lors du chargement de l'utilisation:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsage()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-2 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-1/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!usage) {
    return null
  }

  const getStatusColor = () => {
    if (usage.usagePercentage >= 90) return "text-red-600"
    if (usage.usagePercentage >= 70) return "text-yellow-600"
    return "text-green-600"
  }

  const getStatusBadge = () => {
    if (usage.remainingCredits === 0) {
      return <Badge variant="destructive">Épuisé</Badge>
    }
    if (usage.usagePercentage >= 90) {
      return <Badge variant="destructive">Critique</Badge>
    }
    if (usage.usagePercentage >= 70) {
      return <Badge variant="secondary">Attention</Badge>
    }
    return <Badge variant="default">Bon</Badge>
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Utilisation des crédits</CardTitle>
        <div className="flex items-center gap-2">
          {getStatusBadge()}
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className={`text-2xl font-bold ${getStatusColor()}`}>{usage.remainingCredits}</span>
            <span className="text-sm text-muted-foreground">sur {usage.totalCredits} crédits</span>
          </div>

          <Progress value={usage.usagePercentage} className="h-2" />

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {usage.usedCredits} utilisés ({usage.usagePercentage.toFixed(1)}%)
            </span>
          </div>

          {usage.remainingCredits <= 5 && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800">Crédits faibles</p>
                <p className="text-xs text-yellow-600">
                  Il ne vous reste que {usage.remainingCredits} crédit{usage.remainingCredits > 1 ? "s" : ""}
                </p>
              </div>
              <Button size="sm" asChild>
                <a href="/dashboard/credits">
                  <CreditCard className="mr-1 h-3 w-3" />
                  Recharger
                </a>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
