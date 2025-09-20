import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q") || "test"

  console.log("[v0] Testing Google Custom Search API...")
  console.log("[v0] Query:", query)
  console.log("[v0] API Key present:", !!process.env.GOOGLE_API_KEY)
  console.log("[v0] CSE CX present:", !!process.env.GOOGLE_CSE_CX)
  console.log("[v0] CSE CX value:", process.env.GOOGLE_CSE_CX)

  try {
    const apiKey = process.env.GOOGLE_API_KEY
    const cseId = "150ca924a0b9541d4" // Using your CSE ID directly

    if (!apiKey) {
      return NextResponse.json({
        error: "GOOGLE_API_KEY not found",
        debug: { apiKey: !!apiKey, cseId: !!cseId },
      })
    }

    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cseId}&q=${encodeURIComponent(query)}&num=10`
    console.log("[v0] Request URL:", url.replace(apiKey, "HIDDEN_API_KEY"))

    const response = await fetch(url)
    console.log("[v0] Response status:", response.status)
    console.log("[v0] Response headers:", Object.fromEntries(response.headers.entries()))

    const data = await response.json()
    console.log("[v0] Response data:", data)

    if (!response.ok) {
      return NextResponse.json({
        error: "Google API Error",
        status: response.status,
        data: data,
        debug: {
          apiKeyPresent: !!apiKey,
          cseId: cseId,
          url: url.replace(apiKey, "HIDDEN_API_KEY"),
        },
      })
    }

    return NextResponse.json({
      success: true,
      itemsCount: data.items?.length || 0,
      totalResults: data.searchInformation?.totalResults || 0,
      items: data.items?.slice(0, 3) || [], // First 3 results only
      debug: {
        apiKeyPresent: !!apiKey,
        cseId: cseId,
        searchTime: data.searchInformation?.searchTime,
      },
    })
  } catch (error) {
    console.log("[v0] Fetch error:", error)
    return NextResponse.json({
      error: "Network Error",
      message: error instanceof Error ? error.message : "Unknown error",
      debug: {
        apiKeyPresent: !!process.env.GOOGLE_API_KEY,
        cseId: "150ca924a0b9541d4",
      },
    })
  }
}
