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
    return new Date(dateString).toLocaleDateString("fr-FR", {
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
        return "Achat"
      case "usage":
        return "Utilisation"
      case "refund":
        return "Remboursement"
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
            Paiement réussi ! Vos crédits ont été ajoutés à votre compte.
          </AlertDescription>
        </Alert>
      )}

      {paymentStatus === "canceled" && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <XCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Paiement annulé. Vous pouvez réessayer quand vous le souhaitez.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mes crédits</h1>
          <p className="text-muted-foreground">Gérez vos crédits et consultez votre historique</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/history">
            <History className="w-4 h-4 mr-2" />
            Historique complet
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
            Acheter des crédits
          </CardTitle>
          <CardDescription>Choisissez le package qui correspond à vos besoins</CardDescription>
        </CardHeader>
        <CardContent>
          <CreditPackages />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Transactions récentes
          </CardTitle>
          <CardDescription>Vos dernières transactions de crédits</CardDescription>
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
              <p>Aucune transaction</p>
              <p className="text-sm">Vos achats et utilisations de crédits apparaîtront ici</p>
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
                    {transaction.amount} crédits
                  </div>
                </div>
              ))}

              {transactions.length > 10 && (
                <div className="text-center pt-4">
                  <Button asChild variant="outline">
                    <Link href="/dashboard/history">
                      Voir toutes les transactions
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
          <CardTitle className="text-lg">Besoin d'aide ?</CardTitle>
          <CardDescription>Questions fréquentes sur les crédits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">Comment fonctionnent les crédits ?</h4>
              <p className="text-sm text-muted-foreground">
                Chaque recherche IA consomme 1 crédit. Les crédits n'expirent jamais.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Puis-je obtenir un remboursement ?</h4>
              <p className="text-sm text-muted-foreground">
                Les crédits non utilisés peuvent être remboursés sous 30 jours.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Y a-t-il des réductions ?</h4>
              <p className="text-sm text-muted-foreground">
                Plus vous achetez de crédits, plus le prix unitaire diminue.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Support client</h4>
              <p className="text-sm text-muted-foreground">Contactez-nous pour toute question sur vos crédits.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
