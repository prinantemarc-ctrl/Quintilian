import { type NextRequest, NextResponse } from "next/server"
import { searchGoogle } from "@/lib/services/browser-google-search"
import { generateDetailedAnalysis } from "@/lib/services/browser-gpt-analysis"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Press Analysis API: Starting request processing")

    const body = await request.json()
    const { query } = body

    console.log(`[v0] Press Analysis API: Received query="${query}"`)

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    // Recherche spécifique dans les médias reconnus
    const mediaQueries = [
      `"${query}" site:lemonde.fr OR site:lefigaro.fr OR site:liberation.fr`,
      `"${query}" site:nytimes.com OR site:washingtonpost.com OR site:reuters.com`,
      `"${query}" site:bbc.com OR site:theguardian.com`,
      `"${query}" news press article journal media`,
    ]

    console.log("[v0] Starting Google searches for press coverage")

    const searchResults = await Promise.all(
      mediaQueries.map((searchQuery) =>
        searchGoogle(searchQuery, {
          language: "fr",
          country: "fr",
          maxResults: 5,
        }),
      ),
    )

    const allResults = searchResults.flat()
    console.log(`[v0] Found ${allResults.length} total search results`)

    // Filtrer pour ne garder que les vrais médias
    const recognizedDomains = [
      "lemonde.fr",
      "lefigaro.fr",
      "liberation.fr",
      "leparisien.fr",
      "nytimes.com",
      "washingtonpost.com",
      "reuters.com",
      "ap.org",
      "bbc.com",
      "theguardian.com",
      "telegraph.co.uk",
    ]

    const filteredResults = allResults.filter((result) => {
      if (!result.link) return false
      const domain = new URL(result.link).hostname.replace("www.", "")
      return recognizedDomains.some((media) => domain.includes(media))
    })

    console.log(`[v0] Filtered to ${filteredResults.length} results from recognized media`)

    // Analyse GPT
    const analysis = await generateDetailedAnalysis(
      query,
      `Analyser la couverture médiatique de "${query}" dans la presse reconnue. Évaluer la qualité et la tonalité de la couverture.`,
      filteredResults,
      "français",
    )

    console.log("[v0] GPT analysis completed")

    const coverageScore = Math.min(100, filteredResults.length * 15)
    const qualityScore = analysis.coherence_score || 50

    return NextResponse.json({
      query: query.trim(),
      coverageScore,
      qualityScore,
      totalArticles: filteredResults.length,
      mediaCount: new Set(filteredResults.map((r) => new URL(r.link).hostname)).size,
      analysis:
        analysis.rationale ||
        `Analyse de la couverture presse pour "${query}". ${filteredResults.length} articles trouvés.`,
      articles: filteredResults.slice(0, 5).map((result, index) => ({
        title: result.title || `Article ${index + 1}`,
        snippet: result.snippet || "Pas de description",
        url: result.link || "#",
        source: result.link ? new URL(result.link).hostname : "unknown",
      })),
    })
  } catch (error) {
    console.error("[v0] Press Analysis API Error:", error)

    return NextResponse.json(
      {
        error: "Erreur lors de l'analyse",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
