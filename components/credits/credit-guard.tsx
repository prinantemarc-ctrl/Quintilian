"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Coins, CreditCard } from "lucide-react"

interface CreditGuardProps {
  children: React.ReactNode
  requiredCredits?: number
  onInsufficientCredits?: () => void
}

export function CreditGuard({ children, requiredCredits = 1, onInsufficientCredits }: CreditGuardProps) {
  const [hasCredits, setHasCredits] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkCredits = async () => {
      try {
        const response = await fetch("/api/credits")
        if (response.ok) {
          const data = await response.json()
          const sufficient = data.remainingCredits >= requiredCredits
          setHasCredits(sufficient)

          if (!sufficient && onInsufficientCredits) {
            onInsufficientCredits()
          }
        }
      } catch (error) {
        console.error("Erreur lors de la vérification des crédits:", error)
        setHasCredits(false)
      } finally {
        setLoading(false)
      }
    }

    checkCredits()
  }, [requiredCredits, onInsufficientCredits])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (hasCredits === false) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <Coins className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle>Insufficient Credits</CardTitle>
          <CardDescription>
            You need {requiredCredits} credit{requiredCredits > 1 ? "s" : ""} to perform this action.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <Button asChild className="w-full">
            <a href="/dashboard/credits">
              <CreditCard className="mr-2 h-4 w-4" />
              Purchase Credits
            </a>
          </Button>
          <Button variant="outline" asChild className="w-full bg-transparent">
            <a href="/dashboard">Back to Dashboard</a>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return <>{children}</>
}
