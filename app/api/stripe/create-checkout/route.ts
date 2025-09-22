import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { stripe, getCreditPackage, isStripeConfigured } from "@/lib/stripe"

export async function POST(request: NextRequest) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json({ error: "Le système de paiement n'est pas configuré" }, { status: 503 })
    }

    const supabase = await createClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { packageId } = await request.json()

    if (!packageId) {
      return NextResponse.json({ error: "Package ID requis" }, { status: 400 })
    }

    const creditPackage = getCreditPackage(packageId)
    if (!creditPackage) {
      return NextResponse.json({ error: "Package non trouvé" }, { status: 404 })
    }

    const getBaseUrl = () => {
      // Utiliser NEXT_PUBLIC_SITE_URL si disponible
      if (process.env.NEXT_PUBLIC_SITE_URL) {
        return process.env.NEXT_PUBLIC_SITE_URL
      }

      // Fallback basé sur les headers de la requête
      const host = request.headers.get("host")
      const protocol = request.headers.get("x-forwarded-proto") || "https"

      if (host) {
        return `${protocol}://${host}`
      }

      // Fallback final pour le développement
      return "http://localhost:3000"
    }

    const baseUrl = getBaseUrl()
    console.log("[v0] Base URL utilisée pour Stripe:", baseUrl)

    const session = await stripe!.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: creditPackage.name,
              description: `${creditPackage.credits} crédits - ${creditPackage.description}`,
            },
            unit_amount: creditPackage.price,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/dashboard/credits?success=true`,
      cancel_url: `${baseUrl}/dashboard/credits?canceled=true`,
      metadata: {
        userId: user.id,
        packageId: creditPackage.id,
        credits: creditPackage.credits.toString(),
      },
    })

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })
  } catch (error) {
    console.error("Erreur lors de la création de la session Stripe:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
