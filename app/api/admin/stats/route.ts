import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET() {
  try {
    console.log("[v0] Starting stats API call")
    const supabase = createAdminClient()

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("[v0] Missing Supabase environment variables")
      return NextResponse.json({ error: "Configuration manquante" }, { status: 500 })
    }

    const { data: logs, error } = await supabase
      .from("search_logs")
      .select("*")
      .order("created_at", { ascending: false })

    console.log("[v0] Database query result:", { logsCount: logs?.length, error })

    if (error) {
      console.error("[v0] Supabase error:", error)
      return NextResponse.json({ error: "Erreur base de données", details: error.message }, { status: 500 })
    }

    if (!logs || logs.length === 0) {
      console.log("[v0] No logs found in database")
      return NextResponse.json({
        total: 0,
        today: 0,
        week: 0,
        month: 0,
        byType: { analyze: 0, duel: 0 },
        byLanguage: {},
        avgProcessingTime: 0,
        errors: 0,
      })
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
        analyze: logs.filter((log) => log.analysis_type === "seo" || !log.analysis_type).length,
        duel: logs.filter((log) => log.analysis_type === "duel").length,
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
        logs.length > 0 ? logs.reduce((sum, log) => sum + (log.processing_time_ms || 0), 0) / logs.length / 1000 : 0,
      errors: logs.filter((log) => log.error_message).length,
    }

    console.log("[v0] Computed stats:", stats)
    return NextResponse.json(stats)
  } catch (error) {
    console.error("[v0] Error in stats API:", error)
    return NextResponse.json(
      { error: "Erreur serveur", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
