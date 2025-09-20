import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY
const GOOGLE_CSE_CX = process.env.GOOGLE_CSE_CX

interface CountryResult {
  country: string
  countryCode: string
  flag: string
  presence: number
  sentiment: number
  coherence: number
  globalScore: number
  analysis: string
  presenceRationale: string
  sentimentRationale: string
  coherenceRationale: string
}

const COUNTRY_MAPPING: Record<string, { name: string; flag: string }> = {
  fr: { name: "France", flag: "🇫🇷" },
  de: { name: "Allemagne", flag: "🇩🇪" },
  es: { name: "Espagne", flag: "🇪🇸" },
  it: { name: "Italie", flag: "🇮🇹" },
  gb: { name: "Royaume-Uni", flag: "🇬🇧" },
  ae: { name: "Émirats Arabes Unis", flag: "🇦🇪" },
  sa: { name: "Arabie Saoudite", flag: "🇸🇦" },
  jp: { name: "Japon", flag: "🇯🇵" },
  cn: { name: "Chine", flag: "🇨🇳" },
  us: { name: "États-Unis", flag: "🇺🇸" },
  ca: { name: "Canada", flag: "🇨🇦" },
  ar: { name: "Argentine", flag: "🇦🇷" },
  br: { name: "Brésil", flag: "🇧🇷" },
  za: { name: "Afrique du Sud", flag: "🇿🇦" },
  cd: { name: "R.D. Congo", flag: "🇨🇩" },
  in: { name: "Inde", flag: "🇮🇳" },
  au: { name: "Australie", flag: "🇦🇺" },
}

async function searchGoogle(query: string, countryCode: string) {
  const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CSE_CX}&q=${encodeURIComponent(query)}&num=3&gl=${countryCode}&cr=country${countryCode.toUpperCase()}`

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Google API error: ${response.status}`)
  }

  const data = await response.json()
  return data.items || []
}

function extractJsonFromText(text: string) {
  // Try to extract JSON from markdown code blocks
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/)
  if (jsonMatch) {
    return jsonMatch[1].trim()
  }

  // Try to extract JSON from plain code blocks
  const codeMatch = text.match(/```\s*([\s\S]*?)\s*```/)
  if (codeMatch) {
    return codeMatch[1].trim()
  }

  // Return original text if no code blocks found
  return text.trim()
}

async function analyzeCountryReputation(query: string, countryCode: string, searchResults: any[]) {
  const countryInfo = COUNTRY_MAPPING[countryCode]
  const resultsText = searchResults.map((item) => `${item.title}: ${item.snippet}`).join("\n")

  const prompt = `Analyse la réputation de "${query}" en ${countryInfo.name} basée sur ces résultats de recherche Google :

${resultsText}

Donne des scores de 0 à 100 pour :
1. PRÉSENCE DIGITALE : Visibilité et mentions en ligne
2. SENTIMENT : Perception positive/négative  
3. COHÉRENCE : Consistance du message et de l'image

Réponds EXACTEMENT dans ce format JSON :
{
  "presence": [score 0-100],
  "sentiment": [score 0-100], 
  "coherence": [score 0-100],
  "globalScore": [moyenne des 3 scores],
  "analysis": "[analyse détaillée en 2-3 phrases]",
  "presenceRationale": "[justification du score présence en 1 phrase]",
  "sentimentRationale": "[justification du score sentiment en 1 phrase]", 
  "coherenceRationale": "[justification du score cohérence en 1 phrase]"
}`

  const { text } = await generateText({
    model: openai("gpt-4o-mini"),
    prompt,
    temperature: 0.3,
  })

  try {
    const cleanedText = extractJsonFromText(text)
    return JSON.parse(cleanedText)
  } catch (error) {
    console.error("Erreur parsing JSON:", error)
    console.error("Texte reçu:", text) // Added debug log to see the actual response
    return {
      presence: 50,
      sentiment: 50,
      coherence: 50,
      globalScore: 50,
      analysis: "Analyse non disponible",
      presenceRationale: "Score par défaut",
      sentimentRationale: "Score par défaut",
      coherenceRationale: "Score par défaut",
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { query, countries } = await request.json()

    if (!query || !countries || countries.length === 0) {
      return NextResponse.json({ error: "Query et countries requis" }, { status: 400 })
    }

    if (countries.length > 5) {
      return NextResponse.json({ error: "Maximum 5 pays autorisés" }, { status: 400 })
    }

    console.log(`[v0] Analyse mondiale pour "${query}" dans ${countries.length} pays`)

    const results: CountryResult[] = []

    // Analyser chaque pays
    for (const countryCode of countries) {
      const countryInfo = COUNTRY_MAPPING[countryCode]
      if (!countryInfo) continue

      console.log(`[v0] Recherche Google pour ${countryInfo.name}...`)

      try {
        const searchResults = await searchGoogle(query, countryCode)
        console.log(`[v0] ${searchResults.length} résultats trouvés pour ${countryInfo.name}`)

        const analysis = await analyzeCountryReputation(query, countryCode, searchResults)

        results.push({
          country: countryInfo.name,
          countryCode,
          flag: countryInfo.flag,
          presence: analysis.presence,
          sentiment: analysis.sentiment,
          coherence: analysis.coherence,
          globalScore: analysis.globalScore,
          analysis: analysis.analysis,
          presenceRationale: analysis.presenceRationale,
          sentimentRationale: analysis.sentimentRationale,
          coherenceRationale: analysis.coherenceRationale,
        })
      } catch (error) {
        console.error(`[v0] Erreur pour ${countryInfo.name}:`, error)
        // Ajouter un résultat par défaut en cas d'erreur
        results.push({
          country: countryInfo.name,
          countryCode,
          flag: countryInfo.flag,
          presence: 0,
          sentiment: 0,
          coherence: 0,
          globalScore: 0,
          analysis: "Erreur lors de l'analyse",
          presenceRationale: "Données non disponibles",
          sentimentRationale: "Données non disponibles",
          coherenceRationale: "Données non disponibles",
        })
      }
    }

    // Trouver le meilleur et le pire pays
    const sortedResults = results.sort((a, b) => b.globalScore - a.globalScore)
    const bestCountry = sortedResults[0]
    const worstCountry = sortedResults[sortedResults.length - 1]

    // Générer une analyse comparative globale
    const globalAnalysisPrompt = `Analyse comparative de la réputation de "${query}" dans ${results.length} pays :

${results.map((r) => `${r.flag} ${r.country}: ${r.globalScore}/100 (Présence: ${r.presence}, Sentiment: ${r.sentiment}, Cohérence: ${r.coherence})`).join("\n")}

Génère une analyse comparative en 3-4 phrases identifiant les tendances principales et les différences régionales.`

    const { text: globalAnalysis } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: globalAnalysisPrompt,
      temperature: 0.3,
    })

    console.log(
      `[v0] Analyse mondiale terminée. Meilleur pays: ${bestCountry.country} (${bestCountry.globalScore}/100)`,
    )

    return NextResponse.json({
      query,
      totalCountries: results.length,
      results,
      bestCountry,
      worstCountry,
      globalAnalysis,
      averageScore: Math.round(results.reduce((sum, r) => sum + r.globalScore, 0) / results.length),
    })
  } catch (error) {
    console.error("[v0] Erreur API world-reputation:", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
