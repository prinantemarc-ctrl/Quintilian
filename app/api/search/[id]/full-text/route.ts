import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    // Vérifier l'authentification
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { data: search, error } = await supabase
      .from("search_logs")
      .select("id, query, competitor_query, analysis_type, full_response_text, created_at, user_id")
      .eq("id", params.id)
      .single()

    if (error) {
      console.error("Erreur lors de la récupération du texte complet:", error)
      return NextResponse.json({ error: "Recherche non trouvée" }, { status: 404 })
    }

    // Vérifier que l'utilisateur a accès à cette recherche (soit c'est la sienne, soit il est admin)
    if (search.user_id !== user.id) {
      // Vérifier si l'utilisateur est admin (vous pouvez ajuster cette logique selon vos besoins)
      const isAdmin = user.email.endsWith("@mak-ia.com") // Ajustez selon votre logique d'admin
      if (!isAdmin) {
        return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
      }
    }

    return NextResponse.json({
      id: search.id,
      query: search.query,
      competitor_query: search.competitor_query,
      analysis_type: search.analysis_type,
      full_response_text: search.full_response_text,
      created_at: search.created_at,
    })
  } catch (error) {
    console.error("Erreur API:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
