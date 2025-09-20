import { createClient } from "@/lib/supabase/server"
import crypto from "crypto"

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
}

class Logger {
  async logSearch(logData: Omit<SearchLog, "id" | "timestamp">) {
    const log: SearchLog = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      ...logData,
    }

    try {
      const supabase = await createClient()

      const { error } = await supabase.from("search_logs").insert({
        id: log.id,
        created_at: log.timestamp.toISOString(),
        search_type: log.type,
        query: log.query,
        competitor_query: log.brand2 || null,
        google_results: {
          count: log.results.google_results_count,
        },
        gpt_analysis: {
          tokens_used: log.results.openai_tokens_used,
        },
        scores: {
          presence_score: log.results.presence_score,
          sentiment_score: log.results.sentiment_score,
          coherence_score: log.results.coherence_score,
          overall_score:
            ((log.results.presence_score || 0) +
              (log.results.sentiment_score || 0) +
              (log.results.coherence_score || 0)) /
            3,
        },
        user_ip: log.ip_address,
        user_agent: log.user_agent,
        session_id: log.identity || null,
        processing_time_ms: log.results.processing_time,
      })

      if (error) {
        console.error("[LOGGER] Failed to save to database:", error)
        // Fallback: still log to console for debugging
        console.log("[ADMIN LOG]", JSON.stringify(log))
        return log
      }

      console.log("[ADMIN LOG] Saved to database:", log.id)
    } catch (error) {
      console.error("[LOGGER] Database error:", error)
      console.log("[ADMIN LOG]", JSON.stringify(log))
    }

    return log
  }

  async getLogs(limit = 100): Promise<SearchLog[]> {
    try {
      const supabase = await createClient()

      const { data, error } = await supabase
        .from("search_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit)

      if (error) {
        console.error("[LOGGER] Failed to fetch logs:", error)
        return []
      }

      return data.map((record) => ({
        id: record.id,
        timestamp: new Date(record.created_at),
        type: record.search_type as "analyze" | "duel",
        query: record.query,
        identity: record.session_id,
        brand1: record.query,
        brand2: record.competitor_query,
        language: "fr", // Default for now
        results: {
          presence_score: record.scores?.presence_score,
          sentiment_score: record.scores?.sentiment_score,
          coherence_score: record.scores?.coherence_score,
          processing_time: record.processing_time_ms || 0,
          google_results_count: record.google_results?.count || 0,
          openai_tokens_used: record.gpt_analysis?.tokens_used,
        },
        user_agent: record.user_agent || "",
        ip_address: record.user_ip,
        error: undefined,
      }))
    } catch (error) {
      console.error("[LOGGER] Database error:", error)
      return []
    }
  }

  async getStats() {
    try {
      const supabase = await createClient()

      // Get total count
      const { count: totalCount } = await supabase.from("search_logs").select("*", { count: "exact", head: true })

      // Get today's count
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const { count: todayCount } = await supabase
        .from("search_logs")
        .select("*", { count: "exact", head: true })
        .gte("created_at", today.toISOString())

      // Get this week's count
      const thisWeek = new Date()
      thisWeek.setDate(thisWeek.getDate() - 7)
      const { count: weekCount } = await supabase
        .from("search_logs")
        .select("*", { count: "exact", head: true })
        .gte("created_at", thisWeek.toISOString())

      // Get this month's count
      const thisMonth = new Date()
      thisMonth.setDate(1)
      thisMonth.setHours(0, 0, 0, 0)
      const { count: monthCount } = await supabase
        .from("search_logs")
        .select("*", { count: "exact", head: true })
        .gte("created_at", thisMonth.toISOString())

      // Get counts by type
      const { data: typeData } = await supabase.from("search_logs").select("search_type")

      const byType =
        typeData?.reduce(
          (acc, log) => {
            acc[log.search_type] = (acc[log.search_type] || 0) + 1
            return acc
          },
          {} as Record<string, number>,
        ) || {}

      // Get average processing time
      const { data: processingData } = await supabase
        .from("search_logs")
        .select("processing_time_ms")
        .not("processing_time_ms", "is", null)

      const avgProcessingTime = processingData?.length
        ? processingData.reduce((sum, log) => sum + (log.processing_time_ms || 0), 0) / processingData.length
        : 0

      return {
        total: totalCount || 0,
        today: todayCount || 0,
        week: weekCount || 0,
        month: monthCount || 0,
        byType: {
          analyze: byType.analyze || 0,
          duel: byType.duel || 0,
        },
        byLanguage: {
          fr: totalCount || 0, // Default for now
        },
        avgProcessingTime,
        errors: 0, // TODO: implement error tracking
      }
    } catch (error) {
      console.error("[LOGGER] Failed to get stats:", error)
      return {
        total: 0,
        today: 0,
        week: 0,
        month: 0,
        byType: { analyze: 0, duel: 0 },
        byLanguage: { fr: 0 },
        avgProcessingTime: 0,
        errors: 0,
      }
    }
  }

  async exportLogs(format: "json" | "csv" = "csv") {
    try {
      const supabase = await createClient()

      const { data, error } = await supabase.from("search_logs").select("*").order("created_at", { ascending: false })

      if (error) {
        throw new Error(`Failed to export logs: ${error.message}`)
      }

      if (format === "json") {
        return JSON.stringify(data, null, 2)
      }

      // CSV format
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
      ]

      const csvRows = [
        headers.join(","),
        ...data.map((row) =>
          [
            row.id,
            new Date(row.created_at).toLocaleString(),
            row.search_type,
            `"${row.query.replace(/"/g, '""')}"`,
            row.competitor_query ? `"${row.competitor_query.replace(/"/g, '""')}"` : "",
            row.scores?.overall_score || "",
            row.scores?.presence_score || "",
            row.scores?.sentiment_score || "",
            row.scores?.coherence_score || "",
            row.processing_time_ms || "",
            row.google_results?.count || "",
            row.user_ip || "",
          ].join(","),
        ),
      ]

      return csvRows.join("\n")
    } catch (error) {
      console.error("[LOGGER] Export failed:", error)
      throw error
    }
  }
}

export const logger = new Logger()
