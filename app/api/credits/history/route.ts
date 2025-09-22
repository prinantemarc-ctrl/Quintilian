import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { CreditManager } from "@/lib/credits"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const history = await CreditManager.getCreditHistory(user.id)
    return NextResponse.json(history)
  } catch (error) {
    console.error("Erreur lors de la récupération de l'historique:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
