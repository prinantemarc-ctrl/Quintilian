import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = createClient()

    const { data: logs, error } = await supabase
      .from("search_logs")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Erreur Supabase:", error)
      return NextResponse.json({ error: "Erreur base de données" }, { status: 500 })
    }

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const stats = {
      total: logs.length,
      today: logs.filter((log) => new Date(log.created_at) >= today).length,
      week: logs.filter((log) => new Date(log.created_at) >= weekAgo).length,
      month: logs.filter((log) => new Date(log.created_at) >= monthAgo).length,
      byType: {
        analyze: logs.filter((log) => log.type === "analyze").length,
        duel: logs.filter((log) => log.type === "duel").length,
      },
      byLanguage: logs.reduce(
        (acc, log) => {
          const lang = log.language || "fr"
          acc[lang] = (acc[lang] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      ),
      avgProcessingTime:
        logs.length > 0 ? logs.reduce((sum, log) => sum + (log.processing_time || 0), 0) / logs.length / 1000 : 0,
      errors: logs.filter((log) => log.error).length,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Erreur lors de la récupération des stats:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
