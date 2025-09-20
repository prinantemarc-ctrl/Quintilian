import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Press Simple API: Starting request processing")

    const body = await request.json()
    const { query } = body

    console.log(`[v0] Press Simple API: Received query="${query}"`)

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    // Simulation d'une recherche Google dans les médias
    const mockResults = [
      {
        title: `${query} - Analyse Le Monde`,
        snippet: `Analyse détaillée de ${query} par nos journalistes spécialisés.`,
        url: "https://lemonde.fr/article-1",
        source: "lemonde.fr",
      },
      {
        title: `${query} fait débat - Le Figaro`,
        snippet: `Les implications de ${query} analysées par notre rédaction.`,
        url: "https://lefigaro.fr/article-2",
        source: "lefigaro.fr",
      },
      {
        title: `${query} : ce qu'il faut savoir - Reuters`,
        snippet: `Point complet sur ${query} et ses enjeux actuels.`,
        url: "https://reuters.com/article-3",
        source: "reuters.com",
      },
    ]

    // Calcul des scores
    const coverageScore = Math.min(100, mockResults.length * 20)
    const qualityScore = 75

    return NextResponse.json({
      query: query.trim(),
      coverageScore,
      qualityScore,
      totalArticles: mockResults.length,
      mediaCount: 3,
      analysis: `Analyse de la couverture presse pour "${query}". ${mockResults.length} articles trouvés dans les médias reconnus. La couverture semble équilibrée avec une bonne représentation dans la presse française et internationale.`,
      articles: mockResults,
    })
  } catch (error) {
    console.error("[v0] Press Simple API Error:", error)

    return NextResponse.json(
      {
        error: "Erreur lors de l'analyse",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
