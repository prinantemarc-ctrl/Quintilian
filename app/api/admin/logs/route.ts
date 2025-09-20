import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

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
      type: log.analysis_type || "analyze",
      query: log.query || log.url,
      language: log.language || "fr",
      results: {
        processing_time: log.processing_time_ms || 0,
        ...(log.scores || {}),
        ...(log.results || {}),
      },
      user_agent: log.user_agent,
      ip_address: log.ip_address,
      error: log.error_message,
    }))

    return NextResponse.json(formattedLogs)
  } catch (error) {
    console.error("Erreur lors de la récupération des logs:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
