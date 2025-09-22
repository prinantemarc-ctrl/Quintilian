import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { CreditManager } from "@/lib/credits"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { amount, description } = await request.json()

    const success = await CreditManager.useCredits(user.id, amount, description || "Utilisation de crédit")

    if (!success) {
      return NextResponse.json({ error: "Crédits insuffisants" }, { status: 400 })
    }

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Montant invalide" }, { status: 400 })
    }

    const updatedCredits = await CreditManager.getUserCredits(user.id)
    return NextResponse.json({ success: true, credits: updatedCredits })
  } catch (error) {
    console.error("Erreur lors de l'utilisation des crédits:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
