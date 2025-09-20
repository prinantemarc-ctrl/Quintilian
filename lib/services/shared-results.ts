import { createClient } from "@supabase/supabase-js"

export interface SharedResult {
  id: string
  url: string
  analysis_data: any
  created_at: string
  expires_at: string
  view_count: number
  is_active: boolean
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
        url: `${window.location.origin}/shared/${crypto.randomUUID()}`,
        analysis_data: {
          brand: analysis.brand,
          message: analysis.message,
          language: analysis.language,
          type: analysis.type,
          results: analysis.results,
          created_at: new Date().toISOString(),
        },
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        is_active: true,
        view_count: 0,
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
      .eq("is_active", true)
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
