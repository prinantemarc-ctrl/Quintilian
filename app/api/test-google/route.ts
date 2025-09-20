import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const apiKey = process.env.GOOGLE_API_KEY
  const cseId = process.env.GOOGLE_CSE_CX

  console.log("=== GOOGLE API TEST ===")
  console.log("API Key exists:", !!apiKey)
  console.log("API Key length:", apiKey?.length || 0)
  console.log("CSE ID exists:", !!cseId)
  console.log("CSE ID value:", cseId || "N/A")

  if (!apiKey || !cseId) {
    return Response.json(
      {
        error: "Missing credentials",
        details: {
          hasApiKey: !!apiKey,
          hasCseId: !!cseId,
          apiKeyLength: apiKey?.length || 0,
          cseId: cseId || null,
        },
      },
      { status: 400 },
    )
  }

  try {
    const testQuery = "test news"
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cseId}&q=${encodeURIComponent(testQuery)}&num=1`

    console.log("Making test request to Google CSE...")
    const response = await fetch(url)
    const data = await response.text()

    console.log("Response status:", response.status)
    console.log("Response data:", data.substring(0, 500))

    if (!response.ok) {
      return Response.json(
        {
          error: "Google API Error",
          status: response.status,
          statusText: response.statusText,
          response: data,
        },
        { status: response.status },
      )
    }

    const jsonData = JSON.parse(data)

    return Response.json({
      success: true,
      status: response.status,
      itemsFound: jsonData.items?.length || 0,
      searchInformation: jsonData.searchInformation,
      firstItem: jsonData.items?.[0]
        ? {
            title: jsonData.items[0].title,
            link: jsonData.items[0].link,
            snippet: jsonData.items[0].snippet?.substring(0, 100),
          }
        : null,
      error: jsonData.error || null,
    })
  } catch (error) {
    console.error("Test failed:", error)
    return Response.json(
      {
        error: "Test failed",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
