import { createClient } from "@supabase/supabase-js"

interface SearchLogData {
  type: string
  query: string
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
  identity?: string
  error?: string
}

class Logger {
  private supabase

  constructor() {
    this.supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  }

  async logSearch(data: SearchLogData): Promise<void> {
    try {
      const { error } = await this.supabase.from("search_logs").insert({
        type: data.type,
        query: data.query,
        language: data.language,
        results: data.results,
        user_agent: data.user_agent,
        ip_address: data.ip_address,
        identity: data.identity,
        error: data.error,
        created_at: new Date().toISOString(),
      })

      if (error) {
        if (error.message.includes("table") && error.message.includes("does not exist")) {
          console.log("[v0] Search logs table not yet created. Please run the SQL script first.")
        } else {
          console.error("[v0] Error logging search:", error)
        }
      }
    } catch (error) {
      console.error("[v0] Failed to log search:", error)
      // Don't throw error to avoid breaking the main functionality
    }
  }
}

// Export as named export to match the import
export const logger = new Logger()
