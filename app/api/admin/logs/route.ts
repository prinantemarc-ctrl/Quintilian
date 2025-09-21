import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET() {
  try {
    console.log("[v0] Starting logs API call")
    const supabase = createAdminClient()

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("[v0] Missing Supabase environment variables")
      return NextResponse.json({ error: "Configuration manquante" }, { status: 500 })
    }

    const { data: logs, error } = await supabase
      .from("search_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100)

    console.log("[v0] Logs query result:", { logsCount: logs?.length, error })

    if (error) {
      console.error("[v0] Supabase error in logs:", error)
      return NextResponse.json({ error: "Erreur base de données", details: error.message }, { status: 500 })
    }

    if (!logs || logs.length === 0) {
      console.log("[v0] No logs found, returning empty array")
      return NextResponse.json([])
    }

    console.log("[v0] First log sample:", logs[0])

    const formattedLogs = logs.map((log) => ({
      id: log.id,
      timestamp: new Date(log.created_at),
      type: log.analysis_type === "seo" ? "analyze" : log.analysis_type || "analyze",
      query: log.query || log.url,
      language: log.language || "fr",
      results: {
        processing_time: (log.processing_time_ms || 0) / 1000, // Convert to seconds
        presence_score: log.scores?.presence_score,
        sentiment_score: log.scores?.sentiment_score,
        coherence_score: log.scores?.coherence_score,
        google_results_count: log.results?.google_results_count || 0,
        openai_tokens_used: log.results?.openai_tokens_used,
      },
      user_agent: log.user_agent,
      ip_address: log.ip_address?.toString(),
      error: log.error_message,
    }))

    console.log("[v0] Formatted logs count:", formattedLogs.length)
    return NextResponse.json(formattedLogs)
  } catch (error) {
    console.error("[v0] Error in logs API:", error)
    return NextResponse.json(
      { error: "Erreur serveur", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
