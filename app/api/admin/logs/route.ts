import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = createClient()

    const { data: logs, error } = await supabase
      .from("search_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100)

    if (error) {
      console.error("Erreur Supabase:", error)
      return NextResponse.json({ error: "Erreur base de données" }, { status: 500 })
    }

    const formattedLogs = logs.map((log) => ({
      id: log.id,
      timestamp: new Date(log.created_at),
      type: log.type,
      query: log.query,
      identity: log.identity,
      brand1: log.brand1,
      brand2: log.brand2,
      language: log.language,
      results: {
        presence_score: log.presence_score,
        sentiment_score: log.sentiment_score,
        coherence_score: log.coherence_score,
        processing_time: log.processing_time,
        google_results_count: log.google_results_count,
        openai_tokens_used: log.openai_tokens_used,
      },
      user_agent: log.user_agent,
      ip_address: log.ip_address,
      error: log.error,
    }))

    return NextResponse.json(formattedLogs)
  } catch (error) {
    console.error("Erreur lors de la récupération des logs:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
