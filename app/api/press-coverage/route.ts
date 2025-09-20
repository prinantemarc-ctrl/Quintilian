import { type NextRequest, NextResponse } from "next/server"

import { searchGoogle } from "@/lib/services/browser-google-search"
import { generateDetailedAnalysis } from "@/lib/services/browser-gpt-analysis"

// Médias reconnus par pays
const RECOGNIZED_MEDIA = {
  FR: ["lemonde.fr", "lefigaro.fr", "liberation.fr", "leparisien.fr", "franceinfo.fr", "bfmtv.com"],
  US: ["nytimes.com", "washingtonpost.com", "wsj.com", "cnn.com", "reuters.com", "ap.org"],
  GB: ["bbc.com", "theguardian.com", "telegraph.co.uk", "independent.co.uk", "thetimes.co.uk"],
  DE: ["spiegel.de", "zeit.de", "faz.net", "sueddeutsche.de", "welt.de"],
  ES: ["elpais.com", "elmundo.es", "abc.es", "lavanguardia.com"],
  IT: ["corriere.it", "repubblica.it", "gazzetta.it", "lastampa.it"],
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    console.log("[v0] Press Coverage API: Starting request processing")

    const body = await request.json()
    const { query } = body

    console.log(`[v0] Press Coverage API: Received query="${query}"`)

    // Validation
    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return NextResponse.json({ error: "Query is required and must be a non-empty string" }, { status: 400 })
    }

    console.log(`[v0] Press Coverage Analysis starting: "${query}"`)

    const mediaResults = await Promise.all([
      // Recherche générale dans les médias français
      searchGoogle(`"${query}" site:lemonde.fr OR site:lefigaro.fr OR site:liberation.fr`, {
        language: "fr",
        country: "fr",
        maxResults: 5,
      }),

      // Recherche dans les médias internationaux
      searchGoogle(`"${query}" site:nytimes.com OR site:washingtonpost.com OR site:reuters.com`, {
        language: "en",
        country: "us",
        maxResults: 5,
      }),

      // Recherche dans les médias britanniques
      searchGoogle(`"${query}" site:bbc.com OR site:theguardian.com OR site:telegraph.co.uk`, {
        language: "en",
        country: "gb",
        maxResults: 5,
      }),

      // Recherche générale avec terme "news" ou "press"
      searchGoogle(`"${query}" news OR press OR article OR journal`, {
        language: "fr",
        country: "fr",
        maxResults: 10,
      }),
    ])

    const allResults = mediaResults.flat()
    console.log(`[v0] Found ${allResults.length} total search results`)

    // Filtrer pour ne garder que les médias reconnus
    const recognizedMediaDomains = Object.values(RECOGNIZED_MEDIA).flat()
    const filteredResults = allResults.filter((result) => {
      if (!result.link) return false
      const domain = new URL(result.link).hostname.replace("www.", "")
      return recognizedMediaDomains.some((media) => domain.includes(media.replace("www.", "")))
    })

    console.log(`[v0] Filtered to ${filteredResults.length} results from recognized media`)

    const pressAnalysis = await generateDetailedAnalysis(
      query,
      `Analyser la couverture médiatique de "${query}" dans la presse reconnue. Évaluer la qualité, la quantité et la tonalité de la couverture par les médias établis.`,
      filteredResults,
      "français",
    )

    console.log("[v0] Press coverage GPT analysis completed")

    const coverageScore = Math.min(100, Math.max(0, filteredResults.length * 10)) // 10 points par article trouvé
    const qualityScore = pressAnalysis.coherence_score || 50
    const reachScore = calculateReachScore(filteredResults)
    const globalScore = Math.round((coverageScore + qualityScore + reachScore) / 3)

    const sourcesByType = categorizeMediaSources(filteredResults)

    const processingTime = Date.now() - startTime
    console.log(`[v0] Press Coverage Analysis completed in ${processingTime}ms`)
    console.log(`[v0] Coverage Score: ${coverageScore}/100`)
    console.log(`[v0] Quality Score: ${qualityScore}/100`)
    console.log(`[v0] Reach Score: ${reachScore}/100`)
    console.log(`[v0] Global Score: ${globalScore}/100`)

    return NextResponse.json({
      query: query.trim(),
      globalScore,
      coverageScore,
      qualityScore,
      reachScore,
      totalArticles: filteredResults.length,
      recognizedMediaCount: new Set(filteredResults.map((r) => new URL(r.link).hostname)).size,
      analysis:
        pressAnalysis.rationale ||
        `Analyse de la couverture presse pour "${query}". ${filteredResults.length} articles trouvés dans les médias reconnus.`,
      sourcesByType,
      topSources: filteredResults.slice(0, 5).map((result, index) => ({
        title: result.title || `Article ${index + 1}`,
        snippet: result.snippet || "Pas de description disponible",
        url: result.link || "#",
        source: result.link ? new URL(result.link).hostname : "unknown",
        date: new Date().toISOString().split("T")[0],
        relevanceScore: Math.max(60, 90 - index * 5),
        mediaType: getMediaType(result.link || ""),
      })),
      recommendations: generatePressRecommendations(globalScore, filteredResults.length),
      processingTime,
    })
  } catch (error) {
    const processingTime = Date.now() - startTime
    console.error("[v0] Press Coverage API Critical Error:", error)
    console.error("[v0] Error stack:", error instanceof Error ? error.stack : "No stack trace")

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error during press coverage analysis",
        details: error instanceof Error ? error.stack : "Unknown error",
        processingTime,
      },
      { status: 500 },
    )
  }
}

function calculateReachScore(results: any[]): number {
  const mediaWeights: { [key: string]: number } = {
    "nytimes.com": 20,
    "washingtonpost.com": 18,
    "lemonde.fr": 18,
    "bbc.com": 17,
    "reuters.com": 16,
    "lefigaro.fr": 15,
    "theguardian.com": 15,
    "liberation.fr": 12,
    "telegraph.co.uk": 12,
    default: 8,
  }

  let totalReach = 0
  results.forEach((result) => {
    if (result.link) {
      const domain = new URL(result.link).hostname.replace("www.", "")
      const weight = mediaWeights[domain] || mediaWeights["default"]
      totalReach += weight
    }
  })

  return Math.min(100, totalReach)
}

function categorizeMediaSources(results: any[]) {
  const categories = {
    national: [],
    international: [],
    specialized: [],
    regional: [],
  }

  results.forEach((result) => {
    if (!result.link) return

    const domain = new URL(result.link).hostname.replace("www.", "")

    if (["nytimes.com", "washingtonpost.com", "bbc.com", "reuters.com"].includes(domain)) {
      categories.international.push(result)
    } else if (["lemonde.fr", "lefigaro.fr", "liberation.fr"].includes(domain)) {
      categories.national.push(result)
    } else {
      categories.specialized.push(result)
    }
  })

  return categories
}

function getMediaType(url: string): string {
  if (!url) return "unknown"

  const domain = new URL(url).hostname.replace("www.", "")

  if (["nytimes.com", "washingtonpost.com", "bbc.com", "reuters.com"].includes(domain)) {
    return "international"
  } else if (["lemonde.fr", "lefigaro.fr", "liberation.fr"].includes(domain)) {
    return "national"
  } else {
    return "specialized"
  }
}

function generatePressRecommendations(score: number, articleCount: number): string[] {
  const recommendations = []

  if (score < 30) {
    recommendations.push("Couverture presse très faible - envisager une stratégie de relations presse")
    recommendations.push("Contacter directement les journalistes spécialisés dans votre secteur")
  } else if (score < 60) {
    recommendations.push("Couverture presse modérée - opportunités d'amélioration")
    recommendations.push("Développer des communiqués de presse plus percutants")
  } else {
    recommendations.push("Bonne couverture presse - maintenir la dynamique")
    recommendations.push("Capitaliser sur les relations médias existantes")
  }

  if (articleCount < 3) {
    recommendations.push("Peu d'articles trouvés - augmenter la visibilité médiatique")
  }

  return recommendations
}
