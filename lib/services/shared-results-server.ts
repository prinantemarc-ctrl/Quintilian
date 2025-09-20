import { createClient } from "@/lib/supabase/server"
import type { SharedResult } from "./shared-results"

export async function getSharedResultServer(id: string): Promise<SharedResult | null> {
  try {
    const supabase = await createClient()

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
