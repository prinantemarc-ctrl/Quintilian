import { NextResponse } from "next/server"
import { searchCache, analysisCache, resultsCache } from "@/lib/cache"

export async function POST() {
  try {
    searchCache.clear()
    analysisCache.clear()
    resultsCache.clear()

    return NextResponse.json({
      message: "Cache cleared successfully",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Error clearing cache:", error)
    return NextResponse.json({ error: "Failed to clear cache" }, { status: 500 })
  }
}
