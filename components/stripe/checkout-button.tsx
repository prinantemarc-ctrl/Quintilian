"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CreditCard } from "lucide-react"
import { loadStripe } from "@stripe/stripe-js"

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null

interface CheckoutButtonProps {
  packageId: string
  children: React.ReactNode
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  className?: string
}

export function CheckoutButton({ packageId, children, variant = "default", className }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false)

  const isStripeConfigured = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

  const handleCheckout = async () => {
    if (!isStripeConfigured) {
      alert("Le système de paiement n'est pas encore configuré. Veuillez réessayer plus tard.")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ packageId }),
      })

      const { sessionId, error } = await response.json()

      if (error) {
        console.error("Erreur:", error)
        alert("Une erreur est survenue lors de la création de la session de paiement.")
        return
      }

      if (sessionId) {
        const stripe = await stripePromise
        await stripe?.redirectToCheckout({ sessionId })
      }
    } catch (error) {
      console.error("Erreur lors du checkout:", error)
      alert("Une erreur est survenue. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleCheckout} disabled={loading || !isStripeConfigured} variant={variant} className={className}>
      {loading ? (
        "Redirection..."
      ) : !isStripeConfigured ? (
        "Configuration en cours..."
      ) : (
        <>
          <CreditCard className="mr-2 h-4 w-4" />
          {children}
        </>
      )}
    </Button>
  )
}
