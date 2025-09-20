import { NextResponse } from "next/server"
import { searchCache, analysisCache, resultsCache } from "@/lib/cache"

export async function GET() {
  try {
    const stats = {
      search: searchCache.getStats(),
      analysis: analysisCache.getStats(),
      results: resultsCache.getStats(),
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("[v0] Error getting cache stats:", error)
    return NextResponse.json({ error: "Failed to get cache statistics" }, { status: 500 })
  }
}
