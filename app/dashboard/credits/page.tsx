"use client"

import { CreditDisplay } from "@/components/credits/credit-display"
import { CreditPackages } from "@/components/stripe/credit-packages"
import { UsageTracker } from "@/components/paywall/usage-tracker"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useEffect, useState } from "react"
import { CreditCard, History, TrendingUp, Coins, ArrowRight, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"

interface CreditTransaction {
  id: string
  amount: number
  type: "purchase" | "usage" | "refund"
  description: string
  createdAt: string
}

export default function CreditsPage() {
  const [transactions, setTransactions] = useState<CreditTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [paymentStatus, setPaymentStatus] = useState<"success" | "canceled" | null>(null)

  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const success = searchParams.get("success")
    const canceled = searchParams.get("canceled")

    if (success === "true") {
      setPaymentStatus("success")
      setTimeout(() => {
        router.replace("/dashboard/credits")
        setPaymentStatus(null)
      }, 5000)
    } else if (canceled === "true") {
      setPaymentStatus("canceled")
      setTimeout(() => {
        router.replace("/dashboard/credits")
        setPaymentStatus(null)
      }, 5000)
    }
  }, [searchParams, router])

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch("/api/credits/history")
        if (response.ok) {
          const data = await response.json()
          setTransactions(data)
        }
      } catch (error) {
        console.error("Erreur lors du chargement de l'historique:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "purchase":
        return <CreditCard className="h-4 w-4 text-green-600" />
      case "usage":
        return <TrendingUp className="h-4 w-4 text-blue-600" />
      case "refund":
        return <CheckCircle className="h-4 w-4 text-yellow-600" />
      default:
        return <Coins className="h-4 w-4" />
    }
  }

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case "purchase":
        return "Purchase"
      case "usage":
        return "Usage"
      case "refund":
        return "Refund"
      default:
        return type
    }
  }

  const getAmountColor = (type: string, amount: number) => {
    if (type === "purchase" || type === "refund") {
      return "text-green-600"
    }
    return "text-red-600"
  }

  return (
    <div className="space-y-6">
      {paymentStatus === "success" && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Payment successful! Credits have been added to your account.
          </AlertDescription>
        </Alert>
      )}

      {paymentStatus === "canceled" && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <XCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">Payment canceled. You can try again anytime.</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Credits</h1>
          <p className="text-muted-foreground">Manage your credits and view your history</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/history">
            <History className="w-4 h-4 mr-2" />
            Full History
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CreditDisplay />
        <UsageTracker />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Purchase Credits
          </CardTitle>
          <CardDescription>Choose the package that fits your needs</CardDescription>
        </CardHeader>
        <CardContent>
          <CreditPackages />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Recent Transactions
          </CardTitle>
          <CardDescription>Your latest credit transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-4 w-4 bg-muted rounded"></div>
                      <div className="space-y-1">
                        <div className="h-4 bg-muted rounded w-32"></div>
                        <div className="h-3 bg-muted rounded w-24"></div>
                      </div>
                    </div>
                    <div className="h-4 bg-muted rounded w-16"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Coins className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No transactions</p>
              <p className="text-sm">Your credit purchases and usage will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.slice(0, 10).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {getTransactionIcon(transaction.type)}
                    <div>
                      <div className="font-medium">{transaction.description}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {getTransactionLabel(transaction.type)}
                        </Badge>
                        <span>{formatDate(transaction.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`font-bold ${getAmountColor(transaction.type, transaction.amount)}`}>
                    {transaction.amount > 0 ? "+" : ""}
                    {transaction.amount} credits
                  </div>
                </div>
              ))}

              {transactions.length > 10 && (
                <div className="text-center pt-4">
                  <Button asChild variant="outline">
                    <Link href="/dashboard/history">
                      View All Transactions
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-lg">Need Help?</CardTitle>
          <CardDescription>Frequently Asked Questions about credits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">How do credits work?</h4>
              <p className="text-sm text-muted-foreground">Each AI search consumes 1 credit. Credits never expire.</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Can I get a refund?</h4>
              <p className="text-sm text-muted-foreground">Unused credits can be refunded within 30 days.</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Are there any discounts?</h4>
              <p className="text-sm text-muted-foreground">The more credits you buy, the lower the unit price.</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Customer Support</h4>
              <p className="text-sm text-muted-foreground">Contact us for any questions about your credits.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
