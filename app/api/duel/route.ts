import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

const DuelRequestSchema = z.object({
  brand1: z.string().min(1, "Le premier nom est requis"),
  brand2: z.string().min(1, "Le second nom est requis"),
  message: z.string().min(1, "Le message est requis"),
  language: z.string().min(1, "La langue est requise"),
  country: z.string().optional(),
})

interface GoogleSearchResult {
  title?: string
  link?: string
  snippet?: string
}

interface GoogleSearchResponse {
  items?: GoogleSearchResult[]
}

async function searchGoogle(query: string, language: string, country?: string): Promise<GoogleSearchResult[]> {
  const apiKey = process.env.GOOGLE_API_KEY
  const cseId = process.env.GOOGLE_CSE_CX

  if (!apiKey || !cseId) {
    console.log("[v0] Google API credentials missing, using fallback")
    return []
  }

  try {
    const encodedQuery = encodeURIComponent(query)
    let url = `https://customsearch.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cseId}&q=${encodedQuery}&num=10&lr=lang_${language}`

    if (country) {
      url += `&gl=${country}&cr=country${country.toUpperCase()}`
    }

    console.log(`[v0] Making Google API request for: ${query}`, country ? `(Country: ${country})` : "")

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    const response = await fetch(url, {
      signal: controller.signal,
      cache: "no-store",
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      console.log(`[v0] Google API error: ${response.status}`)
      return []
    }

    const data: GoogleSearchResponse = await response.json()
    console.log(`[v0] Google search completed, found ${data.items?.length || 0} results`)

    return data.items || []
  } catch (error) {
    console.log("[v0] Google search failed:", error)
    return []
  }
}

async function analyzeBrand(
  brand: string,
  message: string,
  googleResults: GoogleSearchResult[],
  language: string,
): Promise<{
  presence_score: number
  tone_score: number
  coherence_score: number
  tone_label: string
  rationale: string
  google_summary: string
  gpt_summary: string
  presence_details: string
  tone_details: string
  coherence_details: string
}> {
  console.log(`[v0] Starting GPT analysis for: ${brand}`)

  const googleContent = googleResults
    .slice(0, 10)
    .map((item, index) => {
      const title = item.title || "Sans titre"
      const snippet = item.snippet || "Pas de description"
      return `${index + 1}. ${title}\n   ${snippet}`
    })
    .join("\n\n")

  const prompt = `Tu es un expert en analyse de réputation digitale. Analyse "${brand}" concernant le message "${message}" en ${language}.

RÉSULTATS GOOGLE (${googleResults.length} sources) :
${googleContent}

Tu dois fournir une analyse JSON avec ces champs EXACTS :
{
  "presence_score": [0-100],
  "tone_score": [0-100], 
  "coherence_score": [0-100],
  "tone_label": "positif|neutre|négatif",
  "rationale": "Explication générale des scores",
  "google_summary": "Résumé de ce que révèlent les résultats Google",
  "gpt_summary": "Ton analyse indépendante de cette entité",
  "presence_details": "Explication détaillée du score de présence (2-3 phrases)",
  "tone_details": "Explication détaillée du sentiment (2-3 phrases)",
  "coherence_details": "Explication détaillée de la cohérence (2-3 phrases)"
}

CRITÈRES D'ÉVALUATION :
- presence_score : Visibilité et présence digitale (0-100)
- tone_score : Sentiment général trouvé (0-100)
- coherence_score : Le message correspond-il à la réalité ? (0-100)
- tone_label : "positif", "neutre" ou "négatif"
- rationale : Justification claire des scores
- google_summary : Synthèse des résultats de recherche
- gpt_summary : Analyse basée sur tes connaissances
- presence_details : Justification spécifique du score de présence
- tone_details : Justification spécifique du score de sentiment
- coherence_details : Justification spécifique du score de cohérence

Sois DIRECT et FACTUEL dans ton analyse.`

  try {
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
      temperature: 0.3,
    })

    console.log(`[v0] GPT response for ${brand}:`, text)

    let cleanedText = text.trim()
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText.replace(/```json\s*/, "").replace(/```\s*$/, "")
    }

    const analysis = JSON.parse(cleanedText)
    console.log(`[v0] GPT analysis completed for ${brand}`)

    return {
      presence_score: analysis.presence_score || 0,
      tone_score: analysis.tone_score || 0,
      coherence_score: analysis.coherence_score || 0,
      tone_label: analysis.tone_label || "neutre",
      rationale: analysis.rationale || "Analyse non disponible",
      google_summary: analysis.google_summary || "Résumé non disponible",
      gpt_summary: analysis.gpt_summary || "Analyse non disponible",
      presence_details: analysis.presence_details || "Détails non disponibles",
      tone_details: analysis.tone_details || "Détails non disponibles",
      coherence_details: analysis.coherence_details || "Détails non disponibles",
    }
  } catch (error) {
    console.log(`[v0] GPT analysis failed for ${brand}:`, error)
    return {
      presence_score: 0,
      tone_score: 0,
      coherence_score: 0,
      tone_label: "neutre",
      rationale: "Erreur lors de l'analyse",
      google_summary: "Erreur lors de l'analyse Google",
      gpt_summary: "Erreur lors de l'analyse GPT",
      presence_details: "Erreur lors de l'analyse",
      tone_details: "Erreur lors de l'analyse",
      coherence_details: "Erreur lors de l'analyse",
    }
  }
}

async function generateComparison(
  brand1: string,
  brand1Analysis: any,
  brand2: string,
  brand2Analysis: any,
  message: string,
  language: string,
): Promise<{
  detailed_comparison: string
  winner: string
  summary: string
}> {
  console.log("[v0] Starting comparison generation")

  const brand1GlobalScore = Math.round(
    (brand1Analysis.presence_score + brand1Analysis.tone_score + brand1Analysis.coherence_score) / 3,
  )
  const brand2GlobalScore = Math.round(
    (brand2Analysis.presence_score + brand2Analysis.tone_score + brand2Analysis.coherence_score) / 3,
  )

  const scoreDiff = Math.abs(brand1GlobalScore - brand2GlobalScore)
  let winner = brand1GlobalScore > brand2GlobalScore ? brand1 : brand2

  if (scoreDiff <= 3) {
    winner = "Match nul"
  }

  const prompt = `Tu es un expert en analyse comparative. Compare "${brand1}" et "${brand2}" concernant "${message}" en ${language}.

DONNÉES D'ANALYSE :

**${brand1}** (Score global: ${brand1GlobalScore}/100) :
- Présence digitale : ${brand1Analysis.presence_score}/100 (${brand1Analysis.presence_details})
- Sentiment : ${brand1Analysis.tone_score}/100 (${brand1Analysis.tone_details}) (${brand1Analysis.tone_label})
- Cohérence : ${brand1Analysis.coherence_score}/100 (${brand1Analysis.coherence_details})
- Résumé Google : ${brand1Analysis.google_summary}
- Résumé GPT : ${brand1Analysis.gpt_summary}

**${brand2}** (Score global: ${brand2GlobalScore}/100) :
- Présence digitale : ${brand2Analysis.presence_score}/100 (${brand2Analysis.presence_details})
- Sentiment : ${brand2Analysis.tone_score}/100 (${brand2Analysis.tone_details}) (${brand2Analysis.tone_label})
- Cohérence : ${brand2Analysis.coherence_score}/100 (${brand2Analysis.coherence_details})
- Résumé Google : ${brand2Analysis.google_summary}
- Résumé GPT : ${brand2Analysis.gpt_summary}

Crée une comparaison détaillée en format Markdown avec :

# ⚔️ **DUEL COMPARATIF**

## **🏆 VERDICT FINAL**
[Annonce du gagnant avec justification]

## **📊 COMPARAISON DÉTAILLÉE**

### **🔍 Présence Digitale**
[Comparaison des scores de présence]

### **💭 Sentiment Public**
[Comparaison des réputations]

### **⚖️ Cohérence Message**
[Évaluation de l'alignement avec le message]

## **🎯 POINTS FORTS ET FAIBLESSES**

### **${brand1}**
**Forces :** [Points forts]
**Faiblesses :** [Points faibles]

### **${brand2}**
**Forces :** [Points forts]
**Faiblesses :** [Points faibles]

## **📈 RECOMMANDATIONS**
[Recommandations pour chaque marque]

Sois DIRECT et FACTUEL dans ta comparaison.`

  try {
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
      temperature: 0.3,
    })

    console.log("[v0] Comparison generated successfully")

    return {
      detailed_comparison: text,
      winner,
      summary: `${brand1} (${brand1GlobalScore}/100) vs ${brand2} (${brand2GlobalScore}/100). ${
        winner === "Match nul"
          ? "Scores très proches, match nul !"
          : `${winner} l'emporte avec ${scoreDiff} points d'avance.`
      }`,
    }
  } catch (error) {
    console.log("[v0] Comparison generation failed:", error)
    return {
      detailed_comparison: "# ❌ **ERREUR DE COMPARAISON**\n\nImpossible de générer la comparaison.",
      winner: "Erreur",
      summary: "Erreur lors de la comparaison",
    }
  }
}

export async function POST(request: NextRequest) {
  console.log("[v0] Duel API called - starting simplified process")

  try {
    console.log("[v0] Parsing request body...")
    const body = await request.json()
    console.log("[v0] Body parsed successfully:", Object.keys(body))

    console.log("[v0] Validating schema...")
    const { brand1, brand2, message, language, country } = DuelRequestSchema.parse(body)
    console.log("[v0] Schema validation passed")

    console.log(`[v0] Processing duel: ${brand1} vs ${brand2}`, country ? `(Country: ${country})` : "")

    console.log(`[v0] Starting Google search for: ${brand1}`)
    const brand1Results = await searchGoogle(brand1, language, country)

    console.log(`[v0] Starting Google search for: ${brand2}`)
    const brand2Results = await searchGoogle(brand2, language, country)

    console.log(`[v0] Starting analysis for: ${brand1}`)
    const brand1Analysis = await analyzeBrand(brand1, message, brand1Results, language)

    console.log(`[v0] Starting analysis for: ${brand2}`)
    const brand2Analysis = await analyzeBrand(brand2, message, brand2Results, language)

    const comparison = await generateComparison(brand1, brand1Analysis, brand2, brand2Analysis, message, language)

    const brand1GlobalScore = Math.round(
      (brand1Analysis.presence_score + brand1Analysis.tone_score + brand1Analysis.coherence_score) / 3,
    )
    const brand2GlobalScore = Math.round(
      (brand2Analysis.presence_score + brand2Analysis.tone_score + brand2Analysis.coherence_score) / 3,
    )

    const result = {
      brand1_analysis: {
        ...brand1Analysis,
        global_score: brand1GlobalScore,
        sources: brand1Results.slice(0, 5).map((item) => ({
          title: item.title || "Sans titre",
          link: item.link || "#",
        })),
      },
      brand2_analysis: {
        ...brand2Analysis,
        global_score: brand2GlobalScore,
        sources: brand2Results.slice(0, 5).map((item) => ({
          title: item.title || "Sans titre",
          link: item.link || "#",
        })),
      },
      winner: comparison.winner,
      score_difference: Math.abs(brand1GlobalScore - brand2GlobalScore),
      detailed_comparison: comparison.detailed_comparison,
      summary: comparison.summary,
    }

    console.log("[v0] Duel analysis completed successfully")
    console.log(`[v0] Winner: ${comparison.winner}`)
    console.log(`[v0] Scores: ${brand1} (${brand1GlobalScore}) vs ${brand2} (${brand2GlobalScore})`)

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Duel API error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Données invalides", details: error.errors }, { status: 400 })
    }

    return NextResponse.json(
      {
        error: "Erreur lors du duel",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    )
  }
}
