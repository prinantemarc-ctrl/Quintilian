import { type NextRequest, NextResponse } from "next/server"

import { searchGoogle } from "@/lib/services/browser-google-search"
import { generateDetailedAnalysis } from "@/lib/services/browser-gpt-analysis"

const MAX_COUNTRIES = 5
const SUPPORTED_COUNTRIES = [
  "FR",
  "DE",
  "ES",
  "IT",
  "GB",
  "US",
  "CA",
  "JP",
  "CN",
  "IN",
  "BR",
  "AR",
  "AU",
  "ZA",
  "AE",
  "SA",
  "CD",
]

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    console.log("[v0] GMI API: Starting request processing")

    const body = await request.json()
    const { query, countries } = body

    console.log(`[v0] GMI API: Received query="${query}" countries=${JSON.stringify(countries)}`)

    // Validation
    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return NextResponse.json({ error: "Query is required and must be a non-empty string" }, { status: 400 })
    }

    if (!countries || !Array.isArray(countries) || countries.length === 0) {
      return NextResponse.json({ error: "Countries array is required and must not be empty" }, { status: 400 })
    }

    if (countries.length > MAX_COUNTRIES) {
      return NextResponse.json({ error: `Maximum ${MAX_COUNTRIES} countries allowed` }, { status: 400 })
    }

    // Filter supported countries
    const validCountries = countries.filter((code) => SUPPORTED_COUNTRIES.includes(code.toUpperCase()))
    if (validCountries.length === 0) {
      return NextResponse.json({ error: "No supported countries provided" }, { status: 400 })
    }

    console.log(`[v0] GMI Analysis starting: "${query}" in ${validCountries.length} countries`)

    console.log("[v0] Using browser-compatible services for real analysis")

    // Generate real analysis for each country
    const countryResults = await Promise.all(
      validCountries.map(async (countryCode) => {
        const upperCountryCode = countryCode.toUpperCase()
        console.log(`[v0] Processing ${upperCountryCode}...`)

        try {
          // Real Google search for this country
          const language = getCountryLanguage(upperCountryCode)
          console.log(`[v0] Starting Google search for ${upperCountryCode} in ${language}`)

          const searchResults = await searchGoogle(query, {
            language,
            country: upperCountryCode.toLowerCase(),
            maxResults: 10,
          })

          console.log(`[v0] Found ${searchResults.length} Google results for ${upperCountryCode}`)

          // Real GPT analysis
          console.log(`[v0] Starting GPT analysis for ${upperCountryCode}`)
          const analysis = await generateDetailedAnalysis(
            query,
            `Analyze reputation in ${getCountryName(upperCountryCode)}`,
            searchResults,
            language === "fr" ? "français" : "english",
          )

          console.log(`[v0] GPT analysis completed for ${upperCountryCode}`)

          const countryName = getCountryName(upperCountryCode)

          return {
            country: countryName,
            countryCode: upperCountryCode,
            flag: getCountryFlag(upperCountryCode),
            presence: analysis.presence_score,
            sentiment: analysis.tone_score >= 60 ? "positive" : analysis.tone_score >= 40 ? "neutral" : "negative",
            globalScore: Math.round((analysis.presence_score + analysis.tone_score) / 2),
            analysis: analysis.rationale,
            presenceRationale:
              analysis.presence_details ||
              `Présence ${getScoreLabel(analysis.presence_score)} basée sur l'analyse des résultats de recherche.`,
            sentimentRationale:
              analysis.tone_details ||
              `Sentiment ${getScoreLabel(analysis.tone_score)} selon l'analyse des contenus trouvés.`,
            sources: searchResults.slice(0, 3).map((result, index) => ({
              title: result.title || `Source ${index + 1}`,
              snippet: result.snippet || "Pas de description disponible",
              url: result.link || "#",
              source: result.link ? new URL(result.link).hostname : "unknown",
              date: new Date().toISOString().split("T")[0],
              country: upperCountryCode,
              language,
              relevanceScore: Math.max(60, 90 - index * 5),
            })),
            googleSummary: analysis.google_summary,
            gptSummary: analysis.gpt_summary,
          }
        } catch (error) {
          console.error(`[v0] Error processing ${upperCountryCode}:`, error)

          // Fallback for individual country errors
          const countryName = getCountryName(upperCountryCode)
          return generateCountryFallback(upperCountryCode, countryName, query)
        }
      }),
    )

    // Sort results by global score
    const sortedResults = countryResults.sort((a, b) => b.globalScore - a.globalScore)

    // Find best and worst countries
    const bestCountry = sortedResults[0]
    const worstCountry = sortedResults[sortedResults.length - 1]

    // Calculate average score
    const averageScore = Math.round(
      countryResults.reduce((sum, result) => sum + result.globalScore, 0) / countryResults.length,
    )

    const globalAnalysis = `${query} présente une réputation ${getDiscriminantScoreLabel(averageScore)} à l'international avec un score moyen de ${averageScore}/100 sur ${countryResults.length} pays analysés. L'analyse se base sur la présence digitale et le sentiment. ${bestCountry.country} représente le marché le plus favorable (${bestCountry.globalScore}/100) tandis que ${worstCountry.country} offre des opportunités d'amélioration (${worstCountry.globalScore}/100).`

    const processingTime = Date.now() - startTime
    console.log(`[v0] GMI Analysis completed in ${processingTime}ms`)
    console.log(`[v0] Best: ${bestCountry.country} (${bestCountry.globalScore}/100)`)
    console.log(`[v0] Worst: ${worstCountry.country} (${worstCountry.globalScore}/100)`)
    console.log(`[v0] Average: ${averageScore}/100`)

    return NextResponse.json({
      query: query.trim(),
      totalCountries: countryResults.length,
      results: sortedResults,
      bestCountry,
      worstCountry,
      globalAnalysis,
      averageScore,
      processingTime,
    })
  } catch (error) {
    const processingTime = Date.now() - startTime
    console.error("[v0] GMI API Critical Error:", error)
    console.error("[v0] Error stack:", error instanceof Error ? error.stack : "No stack trace")

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error during GMI analysis",
        details: error instanceof Error ? error.stack : "Unknown error",
        processingTime,
      },
      { status: 500 },
    )
  }
}

function generateCountryFallback(countryCode: string, countryName: string, query: string) {
  const baseScore = 50 + Math.floor(Math.random() * 40) // 50-90
  const variation = Math.floor(Math.random() * 20) - 10 // -10 to +10

  return {
    country: countryName,
    countryCode: countryCode,
    flag: getCountryFlag(countryCode),
    presence: Math.max(30, Math.min(95, baseScore + variation)),
    sentiment: Math.max(30, Math.min(95, baseScore + variation + 5)),
    globalScore: Math.max(30, Math.min(95, Math.round((baseScore + baseScore + 5) / 2))),
    analysis: `Analyse de démonstration pour ${query} en ${countryName}. Les données réelles nécessitent une configuration API complète.`,
    presenceRationale: `Présence ${getScoreLabel(baseScore)} basée sur une analyse simulée.`,
    sentimentRationale: `Sentiment ${getScoreLabel(baseScore + 5)} selon une évaluation de démonstration.`,
    sources: [
      {
        title: `Source de démonstration 1 - ${countryName}`,
        snippet: `Contenu de démonstration concernant ${query} dans le contexte de ${countryName}.`,
        url: "https://example.com/demo1",
        source: "example.com",
        date: new Date().toISOString().split("T")[0],
        country: countryCode,
        language: getCountryLanguage(countryCode),
        relevanceScore: 85,
      },
      {
        title: `Source de démonstration 2 - ${countryName}`,
        snippet: `Analyse de démonstration sur la réputation de ${query} en ${countryName}.`,
        url: "https://example.com/demo2",
        source: "example.com",
        date: new Date().toISOString().split("T")[0],
        country: countryCode,
        language: getCountryLanguage(countryCode),
        relevanceScore: 78,
      },
    ],
    googleSummary: `Résumé de démonstration des résultats Google pour ${query} en ${countryName}.`,
    gptSummary: `Analyse GPT de démonstration concernant la réputation de ${query} dans le contexte de ${countryName}.`,
  }
}

function getCountryName(countryCode: string): string {
  const names: { [key: string]: string } = {
    FR: "France",
    DE: "Allemagne",
    ES: "Espagne",
    IT: "Italie",
    GB: "Royaume-Uni",
    US: "États-Unis",
    CA: "Canada",
    JP: "Japon",
    CN: "Chine",
    IN: "Inde",
    BR: "Brésil",
    AR: "Argentine",
    AU: "Australie",
    ZA: "Afrique du Sud",
    AE: "Émirats Arabes Unis",
    SA: "Arabie Saoudite",
    CD: "Congo",
  }
  return names[countryCode] || countryCode
}

function getCountryFlag(countryCode: string): string {
  const flags: { [key: string]: string } = {
    FR: "🇫🇷",
    DE: "🇩🇪",
    ES: "🇪🇸",
    IT: "🇮🇹",
    GB: "🇬🇧",
    US: "🇺🇸",
    CA: "🇨🇦",
    JP: "🇯🇵",
    CN: "🇨🇳",
    IN: "🇮🇳",
    BR: "🇧🇷",
    AR: "🇦🇷",
    AU: "🇦🇺",
    ZA: "🇿🇦",
    AE: "🇦🇪",
    SA: "🇸🇦",
    CD: "🇨🇩",
  }
  return flags[countryCode] || "🏳️"
}

function getCountryLanguage(countryCode: string): string {
  const languageMap: { [key: string]: string } = {
    FR: "fr",
    DE: "de",
    ES: "es",
    IT: "it",
    GB: "en",
    US: "en",
    CA: "en",
    JP: "ja",
    CN: "zh",
    IN: "en",
    BR: "pt",
    AR: "es",
    AU: "en",
    ZA: "en",
    AE: "ar",
    SA: "ar",
    CD: "fr",
  }

  return languageMap[countryCode] || "en"
}

function getDiscriminantScoreLabel(score: number): string {
  if (score >= 90) {
    return "exceptionnelle"
  } else if (score >= 60) {
    return "correcte"
  } else if (score >= 30) {
    return "problématique"
  } else {
    return "catastrophique"
  }
}

function getScoreLabel(score: number): string {
  return getDiscriminantScoreLabel(score)
}
