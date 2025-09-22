import { type NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { CreditManager } from "@/lib/credits"
import { headers } from "next/headers"

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get("stripe-signature")!

    let event: any

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error("Erreur de signature webhook:", err)
      return NextResponse.json({ error: "Signature invalide" }, { status: 400 })
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object
        const { userId, packageId, credits } = session.metadata

        if (userId && credits) {
          await CreditManager.addCredits(
            userId,
            Number.parseInt(credits),
            `Achat de ${credits} crédits via Stripe (${packageId})`,
          )

          console.log(`Crédits ajoutés: ${credits} pour l'utilisateur ${userId}`)
        }
        break
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object
        console.error("Paiement échoué:", paymentIntent.id)
        break
      }

      default:
        console.log(`Type d'événement non géré: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Erreur webhook Stripe:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
