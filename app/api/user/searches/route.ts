import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
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

    const { data: searches, error } = await supabase
      .from("search_logs")
      .select("*")
      .eq("user_id", user.id) // Filtrer par user_id
      .order("created_at", { ascending: false })
      .limit(50)

    if (error) {
      console.error("Erreur lors de la récupération des recherches:", error)
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
    }

    console.log("[v0] Nombre de recherches trouvées pour l'utilisateur:", searches?.length || 0)
    console.log("[v0] User ID:", user.id)

    // Calculer les statistiques
    const totalSearches = searches?.length || 0
    const thisMonth =
      searches?.filter((search) => {
        const searchDate = new Date(search.created_at)
        const now = new Date()
        return searchDate.getMonth() === now.getMonth() && searchDate.getFullYear() === now.getFullYear()
      }).length || 0

    const avgScore =
      searches?.length > 0
        ? searches.reduce((acc, search) => {
            if (search.scores && typeof search.scores === "object") {
              const scores = search.scores as any
              const totalScore =
                (scores.presence_score || 0) + (scores.sentiment_score || 0) + (scores.coherence_score || 0)
              return acc + totalScore / 3
            }
            return acc
          }, 0) / searches.length
        : 0

    const lastAnalysis = searches?.[0]?.created_at || null

    return NextResponse.json({
      searches: searches || [],
      stats: {
        totalAnalyses: totalSearches,
        thisMonth,
        avgScore: Math.round(avgScore * 10) / 10,
        lastAnalysis,
      },
    })
  } catch (error) {
    console.error("Erreur API:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
