"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Coins, CreditCard, Check, ExternalLink } from "lucide-react"
import { CREDIT_PACKAGES } from "@/lib/stripe"

export function CreditPackages() {
  const [loading, setLoading] = useState<string | null>(null)

  const handlePurchase = async (packageId: string) => {
    setLoading(packageId)

    try {
      console.log("[v0] Début de l'achat pour le package:", packageId)

      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ packageId }),
      })

      const data = await response.json()
      console.log("[v0] Réponse de l'API:", data)

      if (data.url) {
        console.log("[v0] Ouverture de l'URL Stripe dans un nouvel onglet:", data.url)
        window.open(data.url, "_blank", "noopener,noreferrer")
      } else if (data.sessionId) {
        // Fallback: construire l'URL manuellement si seulement sessionId est retourné
        const checkoutUrl = `https://checkout.stripe.com/c/pay/${data.sessionId}`
        console.log("[v0] Ouverture de l'URL construite dans un nouvel onglet:", checkoutUrl)
        window.open(checkoutUrl, "_blank", "noopener,noreferrer")
      } else {
        throw new Error("Aucune URL de checkout reçue")
      }
    } catch (error) {
      console.error("[v0] Erreur lors de l'achat:", error)
      alert("Erreur lors de la création de la session de paiement. Veuillez réessayer.")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {CREDIT_PACKAGES.map((pkg) => (
        <Card key={pkg.id} className={`relative ${pkg.popular ? "border-green-500 shadow-lg" : ""}`}>
          {pkg.popular && <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-green-500">Populaire</Badge>}
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <Coins className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle>{pkg.name}</CardTitle>
            <CardDescription>{pkg.description}</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div>
              <div className="text-3xl font-bold">{pkg.credits}</div>
              <div className="text-sm text-muted-foreground">crédits</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{(pkg.price / 100).toFixed(2)}€</div>
              <div className="text-sm text-muted-foreground">
                {(pkg.price / 100 / pkg.credits).toFixed(3)}€ par crédit
              </div>
            </div>
            <ul className="text-sm space-y-2">
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                {pkg.credits} recherches incluses
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                Accès complet à l'IA
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                Support prioritaire
              </li>
            </ul>
            <Button
              onClick={() => handlePurchase(pkg.id)}
              disabled={loading === pkg.id}
              className="w-full"
              variant={pkg.popular ? "default" : "outline"}
            >
              {loading === pkg.id ? (
                "Ouverture..."
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Acheter maintenant
                  <ExternalLink className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
