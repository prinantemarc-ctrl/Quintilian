"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Coins } from "lucide-react"

interface UserCredits {
  userId: string
  totalCredits: number
  usedCredits: number
  remainingCredits: number
}

export function CreditDisplay() {
  const [credits, setCredits] = useState<UserCredits | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const response = await fetch("/api/credits")
        if (response.ok) {
          const data = await response.json()
          setCredits(data)
        }
      } catch (error) {
        console.error("Error loading credits:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCredits()
  }, [])

  if (loading) {
    return (
      <Card className="w-full max-w-sm">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!credits) {
    return null
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">My Credits</CardTitle>
        <Coins className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-green-600">{credits.remainingCredits}</div>
        <p className="text-xs text-muted-foreground">
          {credits.usedCredits} used of {credits.totalCredits} total
        </p>
        <div className="mt-2">
          <Badge variant={credits.remainingCredits > 5 ? "default" : "destructive"}>
            {credits.remainingCredits > 5 ? "Sufficient" : "Low"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
