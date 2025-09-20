import { createClient } from "@/lib/supabase/server"
import { createClient as createBrowserClient } from "@/lib/supabase/client"
import type { AnalysisHistoryItem } from "@/lib/history"

export interface SharedResult {
  id: string
  brand: string
  message: string
  language: string
  type: string
  results: any
  created_at: string
  expires_at: string
  view_count: number
  is_public: boolean
}

async function checkTableExists(): Promise<boolean> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from("shared_results").select("id").limit(1)

    return !error
  } catch (error) {
    return false
  }
}

export async function shareAnalysisResult(analysis: AnalysisHistoryItem): Promise<string | null> {
  try {
    const tableExists = await checkTableExists()
    if (!tableExists) {
      console.log("[v0] Shared results table not yet created. Please run the SQL script first.")
      return null
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from("shared_results")
      .insert({
        brand: analysis.brand,
        message: analysis.message,
        language: analysis.language,
        type: analysis.type,
        results: analysis.results,
        is_public: true,
      })
      .select("id")
      .single()

    if (error) {
      console.error("[v0] Error sharing result:", error)
      return null
    }

    return data.id
  } catch (error) {
    console.error("[v0] Error sharing result:", error)
    return null
  }
}

export async function getSharedResult(id: string): Promise<SharedResult | null> {
  try {
    const tableExists = await checkTableExists()
    if (!tableExists) {
      console.log("[v0] Shared results table not yet created.")
      return null
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from("shared_results")
      .select("*")
      .eq("id", id)
      .eq("is_public", true)
      .gt("expires_at", new Date().toISOString())
      .single()

    if (error) {
      console.error("[v0] Error fetching shared result:", error)
      return null
    }

    // Increment view count
    await supabase
      .from("shared_results")
      .update({ view_count: data.view_count + 1 })
      .eq("id", id)

    return data
  } catch (error) {
    console.error("[v0] Error fetching shared result:", error)
    return null
  }
}

export function shareAnalysisResultClient(analysis: AnalysisHistoryItem): Promise<string | null> {
  return new Promise(async (resolve) => {
    try {
      const supabase = createBrowserClient()

      const { data, error } = await supabase
        .from("shared_results")
        .insert({
          brand: analysis.brand,
          message: analysis.message,
          language: analysis.language,
          type: analysis.type,
          results: analysis.results,
          is_public: true,
        })
        .select("id")
        .single()

      if (error) {
        if (error.message.includes("table") && error.message.includes("does not exist")) {
          console.log("[v0] Shared results table not yet created. Please run the SQL script first.")
        } else {
          console.error("[v0] Error sharing result:", error)
        }
        resolve(null)
        return
      }

      resolve(data.id)
    } catch (error) {
      console.error("[v0] Error sharing result:", error)
      resolve(null)
    }
  })
}
