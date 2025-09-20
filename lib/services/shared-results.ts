import { createClient } from "@supabase/supabase-js"

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

function createSupabaseClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

export async function shareAnalysisResult(analysis: any): Promise<string | null> {
  try {
    const supabase = createSupabaseClient()

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
    const supabase = createSupabaseClient()

    const { data, error } = await supabase
      .from("shared_results")
      .select("*")
      .eq("id", id)
      .eq("is_public", true)
      .gt("expires_at", new Date().toISOString())
      .single()

    if (error) {
      if (error.message.includes("table") && error.message.includes("does not exist")) {
        console.log("[v0] Shared results table not yet created.")
      } else {
        console.error("[v0] Error fetching shared result:", error)
      }
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

export const shareAnalysisResultClient = shareAnalysisResult
