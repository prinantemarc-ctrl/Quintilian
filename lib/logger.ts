import { createClient } from "@/lib/supabase/client"

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export interface SearchLog {
  id: string
  timestamp: Date
  type: "analyze" | "duel"
  query: string
  identity?: string
  brand1?: string
  brand2?: string
  language: string
  results: {
    presence_score?: number
    sentiment_score?: number
    coherence_score?: number
    processing_time: number
    google_results_count: number
    openai_tokens_used?: number
  }
  user_agent: string
  ip_address?: string
  error?: string
  user_id?: string // Ajout du user_id optionnel
  full_response_text?: string // Ajout du full_response_text optionnel
}

class Logger {
  async logSearch(logData: Omit<SearchLog, "id" | "timestamp">) {
    const log: SearchLog = {
      id: generateUUID(),
      timestamp: new Date(),
      ...logData,
    }

    try {
      const supabase = createClient()

      const { error } = await supabase.from("search_logs").insert({
        id: log.id,
        created_at: log.timestamp.toISOString(),
        analysis_type: log.type,
        query: log.query,
        competitor_query: log.brand2 || null,
        language: log.language || "fr",
        google_results: {
          count: log.results.google_results_count,
        },
        gpt_analysis: {
          tokens_used: log.results.openai_tokens_used,
        },
        scores: {
          presence_score: log.results.presence_score ? Math.round(log.results.presence_score) : null,
          sentiment_score: log.results.sentiment_score ? Math.round(log.results.sentiment_score) : null,
          coherence_score: log.results.coherence_score ? Math.round(log.results.coherence_score) : null,
          overall_score:
            log.results.presence_score && log.results.sentiment_score && log.results.coherence_score
              ? Math.round(
                  ((log.results.presence_score || 0) +
                    (log.results.sentiment_score || 0) +
                    (log.results.coherence_score || 0)) /
                    3,
                )
              : null,
        },
        presence_score: log.results.presence_score ? Math.round(log.results.presence_score) : null,
        sentiment_score: log.results.sentiment_score ? Math.round(log.results.sentiment_score) : null,
        coherence_score: log.results.coherence_score ? Math.round(log.results.coherence_score) : null,
        user_ip: log.ip_address,
        user_agent: log.user_agent,
        session_id: log.identity || null,
        processing_time_ms: Math.round(log.results.processing_time * 1000),
        error_message: log.error || null,
        user_id: log.user_id || null,
        full_response_text: log.full_response_text || null,
      })

      if (error) {
        console.error("[LOGGER] Failed to save to database:", error.message)
        console.log("[ADMIN LOG] Fallback console log:", JSON.stringify(log))
        return log
      }

      console.log("[ADMIN LOG] Saved to database:", log.id)
    } catch (error) {
      console.error("[LOGGER] Database error:", error instanceof Error ? error.message : "Unknown error")
      console.log("[ADMIN LOG] Fallback console log:", JSON.stringify(log))
    }

    return log
  }

  async getLogs(limit = 100): Promise<SearchLog[]> {
    try {
      const supabase = createClient()

      const { data, error } = await supabase
        .from("search_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit)

      if (error) {
        console.error("[LOGGER] Failed to fetch logs:", error.message)
        return []
      }

      return data.map((record) => ({
        id: record.id,
        timestamp: new Date(record.created_at),
        type: record.analysis_type as "analyze" | "duel",
        query: record.query,
        identity: record.session_id,
        brand1: record.query,
        brand2: record.competitor_query,
        language: record.language || "fr",
        results: {
          presence_score: record.presence_score || record.scores?.presence_score,
          sentiment_score: record.sentiment_score || record.scores?.sentiment_score,
          coherence_score: record.coherence_score || record.scores?.coherence_score,
          processing_time: (record.processing_time_ms || 0) / 1000,
          google_results_count: record.google_results?.count || 0,
          openai_tokens_used: record.gpt_analysis?.tokens_used,
        },
        user_agent: record.user_agent || "",
        ip_address: record.user_ip,
        error: record.error_message,
        user_id: record.user_id,
        full_response_text: record.full_response_text,
      }))
    } catch (error) {
      console.error("[LOGGER] Database error:", error instanceof Error ? error.message : "Unknown error")
      return []
    }
  }

  async getStats() {
    try {
      const supabase = createClient()

      const { count: totalCount } = await supabase.from("search_logs").select("*", { count: "exact", head: true })

      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const { count: todayCount } = await supabase
        .from("search_logs")
        .select("*", { count: "exact", head: true })
        .gte("created_at", today.toISOString())

      const thisWeek = new Date()
      thisWeek.setDate(thisWeek.getDate() - 7)
      const { count: weekCount } = await supabase
        .from("search_logs")
        .select("*", { count: "exact", head: true })
        .gte("created_at", thisWeek.toISOString())

      const thisMonth = new Date()
      thisMonth.setDate(1)
      thisMonth.setHours(0, 0, 0, 0)
      const { count: monthCount } = await supabase
        .from("search_logs")
        .select("*", { count: "exact", head: true })
        .gte("created_at", thisMonth.toISOString())

      const { data: typeData } = await supabase.from("search_logs").select("analysis_type")

      const byType =
        typeData?.reduce(
          (acc, log) => {
            const type = log.analysis_type === "seo" ? "analyze" : log.analysis_type || "analyze"
            acc[type] = (acc[type] || 0) + 1
            return acc
          },
          {} as Record<string, number>,
        ) || {}

      const { data: languageData } = await supabase.from("search_logs").select("language")
      const byLanguage =
        languageData?.reduce(
          (acc, log) => {
            acc[log.language || "fr"] = (acc[log.language || "fr"] || 0) + 1
            return acc
          },
          {} as Record<string, number>,
        ) || {}

      const { data: processingData } = await supabase
        .from("search_logs")
        .select("processing_time_ms")
        .not("processing_time_ms", "is", null)

      const avgProcessingTime = processingData?.length
        ? processingData.reduce((sum, log) => sum + (log.processing_time_ms || 0), 0) / processingData.length
        : 0

      const { count: errorCount } = await supabase
        .from("search_logs")
        .select("*", { count: "exact", head: true })
        .not("error_message", "is", null)

      const { data: userIdData } = await supabase.from("search_logs").select("user_id")
      const byUserId =
        userIdData?.reduce(
          (acc, log) => {
            acc[log.user_id || "unknown"] = (acc[log.user_id || "unknown"] || 0) + 1
            return acc
          },
          {} as Record<string, number>,
        ) || {}

      return {
        total: totalCount || 0,
        today: todayCount || 0,
        week: weekCount || 0,
        month: monthCount || 0,
        byType: {
          analyze: byType.analyze || 0,
          duel: byType.duel || 0,
        },
        byLanguage,
        avgProcessingTime: avgProcessingTime / 1000,
        errors: errorCount || 0,
        byUserId,
      }
    } catch (error) {
      console.error("[LOGGER] Failed to get stats:", error instanceof Error ? error.message : "Unknown error")
      return {
        total: 0,
        today: 0,
        week: 0,
        month: 0,
        byType: { analyze: 0, duel: 0 },
        byLanguage: { fr: 0 },
        avgProcessingTime: 0,
        errors: 0,
        byUserId: { unknown: 0 },
      }
    }
  }

  async exportLogs(format: "json" | "csv" = "csv") {
    try {
      const supabase = createClient()

      const { data, error } = await supabase.from("search_logs").select("*").order("created_at", { ascending: false })

      if (error) {
        throw new Error(`Failed to export logs: ${error.message}`)
      }

      if (format === "json") {
        return JSON.stringify(data, null, 2)
      }

      if (!data || data.length === 0) {
        return "No data to export"
      }

      const headers = [
        "ID",
        "Date",
        "Type",
        "Query",
        "Competitor",
        "Overall Score",
        "Presence Score",
        "Sentiment Score",
        "Coherence Score",
        "Processing Time (ms)",
        "Google Results",
        "User IP",
        "User ID",
        "Full Response Text",
      ]

      const csvRows = [
        headers.join(","),
        ...data.map((row) =>
          [
            row.id,
            new Date(row.created_at).toLocaleString(),
            row.analysis_type,
            `"${row.query.replace(/"/g, '""')}"`,
            row.competitor_query ? `"${row.competitor_query.replace(/"/g, '""')}"` : "",
            row.scores?.overall_score || "",
            row.presence_score || "",
            row.sentiment_score || "",
            row.coherence_score || "",
            row.processing_time_ms || "",
            row.google_results?.count || "",
            row.user_ip || "",
            row.user_id || "",
            row.full_response_text ? `"${row.full_response_text.replace(/"/g, '""').replace(/\n/g, "\\n")}"` : "",
          ].join(","),
        ),
      ]

      return csvRows.join("\n")
    } catch (error) {
      console.error("[LOGGER] Export failed:", error instanceof Error ? error.message : "Unknown error")
      throw error
    }
  }
}

export const logger = new Logger()
