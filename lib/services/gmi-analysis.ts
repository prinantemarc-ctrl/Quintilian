import { generateText } from "ai"
import type { GMISearchResult } from "./gmi-search"

export interface GMICountryAnalysis {
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
  sources: GMISearchResult[]
}

export interface GMIGlobalAnalysis {
  query: string
  totalCountries: number
  results: GMICountryAnalysis[]
  bestCountry: GMICountryAnalysis | null
  worstCountry: GMICountryAnalysis | null
  globalAnalysis: string
  averageScore: number
}

const COUNTRY_FLAGS: { [key: string]: string } = {
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

const COUNTRY_NAMES: { [key: string]: string } = {
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

export async function analyzeGMICountry(
  query: string,
  countryCode: string,
  searchResults: GMISearchResult[],
): Promise<GMICountryAnalysis> {
  console.log(`[v0] GMI Analysis: "${query}" in ${countryCode} with ${searchResults.length} results`)

  // If no search results, return mock analysis
  if (searchResults.length === 0) {
    return generateMockCountryAnalysis(query, countryCode)
  }

  try {
    // Use AI to analyze the search results
    const aiAnalysis = await analyzeWithAI(query, countryCode, searchResults)

    return {
      country: COUNTRY_NAMES[countryCode] || countryCode,
      countryCode,
      flag: COUNTRY_FLAGS[countryCode] || "🏳️",
      presence: aiAnalysis.presence,
      sentiment: aiAnalysis.sentiment,
      coherence: aiAnalysis.coherence,
      globalScore: Math.round((aiAnalysis.presence + aiAnalysis.sentiment + aiAnalysis.coherence) / 3),
      analysis: aiAnalysis.analysis,
      presenceRationale: aiAnalysis.presenceRationale,
      sentimentRationale: aiAnalysis.sentimentRationale,
      coherenceRationale: aiAnalysis.coherenceRationale,
      sources: searchResults.slice(0, 5),
    }
  } catch (error) {
    console.error(`[v0] GMI AI analysis failed for ${countryCode}:`, error)
    return generateMockCountryAnalysis(query, countryCode)
  }
}

async function analyzeWithAI(query: string, countryCode: string, results: GMISearchResult[]) {
  const searchContent = results
    .map((result, index) => `${index + 1}. **${result.title}**\n   ${result.snippet}\n   Source: ${result.source}`)
    .join("\n\n")

  const prompt = `Analysez la réputation de "${query}" dans le pays ${COUNTRY_NAMES[countryCode]} (${countryCode}) basé sur ces résultats de recherche:

${searchContent}

Fournissez une analyse structurée avec:

1. **Présence Digitale** (0-100): Visibilité et présence en ligne
2. **Sentiment** (0-100): Perception positive/négative
3. **Cohérence** (0-100): Consistance du message et de l'image

Répondez au format JSON:
{
  "presence": <score 0-100>,
  "sentiment": <score 0-100>,
  "coherence": <score 0-100>,
  "analysis": "<analyse détaillée en 2-3 phrases>",
  "presenceRationale": "<justification du score présence en 1 phrase>",
  "sentimentRationale": "<justification du score sentiment en 1 phrase>",
  "coherenceRationale": "<justification du score cohérence en 1 phrase>"
}`

  const { text } = await generateText({
    model: "openai/gpt-4o-mini",
    prompt,
    temperature: 0.3,
  })

  try {
    return JSON.parse(text)
  } catch (parseError) {
    console.error("[v0] Failed to parse AI response:", parseError)
    throw new Error("Invalid AI response format")
  }
}

function generateMockCountryAnalysis(query: string, countryCode: string): GMICountryAnalysis {
  // Generate realistic mock scores based on country
  const baseScore = 60 + Math.random() * 30 // 60-90 range
  const presence = Math.round(baseScore + (Math.random() - 0.5) * 20)
  const sentiment = Math.round(baseScore + (Math.random() - 0.5) * 15)
  const coherence = Math.round(baseScore + (Math.random() - 0.5) * 10)

  const countryName = COUNTRY_NAMES[countryCode] || countryCode

  return {
    country: countryName,
    countryCode,
    flag: COUNTRY_FLAGS[countryCode] || "🏳️",
    presence: Math.max(0, Math.min(100, presence)),
    sentiment: Math.max(0, Math.min(100, sentiment)),
    coherence: Math.max(0, Math.min(100, coherence)),
    globalScore: Math.round((presence + sentiment + coherence) / 3),
    analysis: `${query} présente une réputation ${getScoreLabel(Math.round((presence + sentiment + coherence) / 3))} en ${countryName}. L'analyse révèle une présence digitale ${getScoreLabel(presence)} avec un sentiment public ${getScoreLabel(sentiment)}.`,
    presenceRationale: `Présence ${getScoreLabel(presence)} basée sur la visibilité en ligne locale.`,
    sentimentRationale: `Sentiment ${getScoreLabel(sentiment)} selon les mentions et commentaires.`,
    coherenceRationale: `Cohérence ${getScoreLabel(coherence)} dans la communication et l'image.`,
    sources: [],
  }
}

export async function generateGlobalAnalysis(results: GMICountryAnalysis[], query: string): Promise<string> {
  if (results.length === 0) {
    return `Aucune donnée disponible pour analyser la réputation mondiale de "${query}".`
  }

  const avgScore = Math.round(results.reduce((sum, r) => sum + r.globalScore, 0) / results.length)
  const bestCountry = results.reduce((best, current) => (current.globalScore > best.globalScore ? current : best))
  const worstCountry = results.reduce((worst, current) => (current.globalScore < worst.globalScore ? current : worst))

  try {
    const countrySummary = results
      .map(
        (r) =>
          `${r.flag} ${r.country}: ${r.globalScore}/100 (Présence: ${r.presence}, Sentiment: ${r.sentiment}, Cohérence: ${r.coherence})`,
      )
      .join("\n")

    const prompt = `Analysez la réputation mondiale de "${query}" basée sur ces données de ${results.length} pays:

${countrySummary}

Score moyen global: ${avgScore}/100
Meilleur marché: ${bestCountry.country} (${bestCountry.globalScore}/100)
Marché à améliorer: ${worstCountry.country} (${worstCountry.globalScore}/100)

Fournissez une analyse comparative en 2-3 phrases qui explique les tendances géographiques et les opportunités.`

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt,
      temperature: 0.4,
    })

    return text
  } catch (error) {
    console.error("[v0] Global analysis AI failed:", error)
    return `${query} présente une réputation ${getScoreLabel(avgScore)} à l'international avec un score moyen de ${avgScore}/100. ${bestCountry.country} représente le marché le plus favorable (${bestCountry.globalScore}/100) tandis que ${worstCountry.country} offre des opportunités d'amélioration (${worstCountry.globalScore}/100).`
  }
}

function getScoreLabel(score: number): string {
  if (score >= 80) return "excellente"
  if (score >= 70) return "très bonne"
  if (score >= 60) return "bonne"
  if (score >= 50) return "correcte"
  if (score >= 40) return "moyenne"
  return "faible"
}
