import type { NextRequest } from "next/server"
import { z } from "zod"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { DuelAnalysisSchema } from "@/lib/schemas/api-validation"
import { searchGoogle } from "@/lib/services/google-search"
import { generateDetailedAnalysis, forceDuelDifferentiation } from "@/lib/services/gpt-analysis"
import {
  createSuccessResponse,
  createValidationErrorResponse,
  handleApiError,
  logApiRequest,
  logApiResponse,
} from "@/lib/utils/api-response"
import { logger } from "@/lib/services/logger" // Ensure logger is imported

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

  const [adjustedBrand1Analysis, adjustedBrand2Analysis] = forceDuelDifferentiation(
    brand1Analysis,
    brand2Analysis,
    brand1,
    brand2,
  )

  const brand1GlobalScore = Math.round(
    (adjustedBrand1Analysis.presence_score +
      adjustedBrand1Analysis.tone_score +
      adjustedBrand1Analysis.coherence_score) /
      3,
  )
  const brand2GlobalScore = Math.round(
    (adjustedBrand2Analysis.presence_score +
      adjustedBrand2Analysis.tone_score +
      adjustedBrand2Analysis.coherence_score) /
      3,
  )

  const scoreDiff = Math.abs(brand1GlobalScore - brand2GlobalScore)
  const winner = brand1GlobalScore > brand2GlobalScore ? brand1 : brand2

  console.log(
    `[v0] Forced differentiation applied: ${brand1} (${brand1GlobalScore}) vs ${brand2} (${brand2GlobalScore})`,
  )

  const prompt = `Tu es un expert en analyse comparative. Compare "${brand1}" et "${brand2}" concernant "${message}" en ${language}.

DONNÉES D'ANALYSE :

**${brand1}** (Score global: ${brand1GlobalScore}/100) :
- Présence digitale : ${adjustedBrand1Analysis.presence_score}/100 (${adjustedBrand1Analysis.presence_details})
- Sentiment : ${adjustedBrand1Analysis.tone_score}/100 (${adjustedBrand1Analysis.tone_details}) (${adjustedBrand1Analysis.tone_label})
- Cohérence : ${adjustedBrand1Analysis.coherence_score}/100 (${adjustedBrand1Analysis.coherence_details})
- Résumé Google : ${adjustedBrand1Analysis.google_summary}
- Résumé GPT : ${adjustedBrand1Analysis.gpt_summary}

**${brand2}** (Score global: ${brand2GlobalScore}/100) :
- Présence digitale : ${adjustedBrand2Analysis.presence_score}/100 (${adjustedBrand2Analysis.presence_details})
- Sentiment : ${adjustedBrand2Analysis.tone_score}/100 (${adjustedBrand2Analysis.tone_details}) (${adjustedBrand2Analysis.tone_label})
- Cohérence : ${adjustedBrand2Analysis.coherence_score}/100 (${adjustedBrand2Analysis.coherence_details})
- Résumé Google : ${adjustedBrand2Analysis.google_summary}
- Résumé GPT : ${adjustedBrand2Analysis.gpt_summary}

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
      summary: `${brand1} (${brand1GlobalScore}/100) vs ${brand2} (${brand2GlobalScore}/100). ${winner} l'emporte avec ${scoreDiff} points d'avance.`,
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
  const startTime = Date.now()
  logApiRequest("DUEL", {})

  let body: any
  try {
    body = await request.json()
    logApiRequest("DUEL", body)

    const { brand1, brand2, message, language, country } = DuelAnalysisSchema.parse(body)

    console.log(`[v0] Processing duel: ${brand1} vs ${brand2}`, country ? `(Country: ${country})` : "")

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      console.error("[v0] CRITICAL: No OpenAI API key found for duel analysis!")
      throw new Error("Configuration manquante - clé API OpenAI non trouvée")
    }
    console.log("[v0] OpenAI API key verified for duel analysis")

    // Search and analyze both brands in parallel
    const [brand1Results, brand2Results] = await Promise.all([
      searchGoogle(brand1, { language, country }),
      searchGoogle(brand2, { language, country }),
    ])

    console.log(`[v0] Brand1 search results: ${brand1Results.length} items`)
    console.log(`[v0] Brand2 search results: ${brand2Results.length} items`)

    if (brand1Results.length === 0) {
      console.warn(`[v0] No search results found for ${brand1}`)
    }
    if (brand2Results.length === 0) {
      console.warn(`[v0] No search results found for ${brand2}`)
    }

    const [brand1Analysis, brand2Analysis] = await Promise.all([
      generateDetailedAnalysis(brand1, message, brand1Results, language, "duel"),
      generateDetailedAnalysis(brand2, message, brand2Results, language, "duel"),
    ])

    if (brand1Analysis.rationale.includes("FALLBACK") || brand2Analysis.rationale.includes("FALLBACK")) {
      console.error("[v0] WARNING: Fallback data detected in duel analysis!")
    }

    const comparison = await generateComparison(brand1, brand1Analysis, brand2, brand2Analysis, message, language)

    const [adjustedBrand1Analysis, adjustedBrand2Analysis] = forceDuelDifferentiation(
      brand1Analysis,
      brand2Analysis,
      brand1,
      brand2,
    )

    const brand1GlobalScore = Math.round(
      (adjustedBrand1Analysis.presence_score +
        adjustedBrand1Analysis.tone_score +
        adjustedBrand1Analysis.coherence_score) /
        3,
    )
    const brand2GlobalScore = Math.round(
      (adjustedBrand2Analysis.presence_score +
        adjustedBrand2Analysis.tone_score +
        adjustedBrand2Analysis.coherence_score) /
        3,
    )

    const result = {
      brand1_analysis: {
        ...adjustedBrand1Analysis,
        global_score: brand1GlobalScore,
        sources: brand1Results.slice(0, 5).map((item) => ({
          title: item.title || "Sans titre",
          link: item.link || "#",
        })),
      },
      brand2_analysis: {
        ...adjustedBrand2Analysis,
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

    const processingTime = Date.now() - startTime
    logApiResponse("DUEL", true, processingTime)

    console.log(`[v0] Winner: ${comparison.winner}`)
    console.log(`[v0] Scores: ${brand1} (${brand1GlobalScore}) vs ${brand2} (${brand2GlobalScore})`)

    try {
      await logger.logSearch({
        type: "duel",
        query: brand1,
        brand1: brand1,
        brand2: brand2,
        language: language || "fr",
        results: {
          presence_score: (brand1Analysis.presence_score + brand2Analysis.presence_score) / 2,
          sentiment_score: (brand1Analysis.tone_score + brand2Analysis.tone_score) / 2,
          coherence_score: (brand1Analysis.coherence_score + brand2Analysis.coherence_score) / 2,
          processing_time: processingTime,
          google_results_count: brand1Results.length + brand2Results.length,
          openai_tokens_used: undefined,
        },
        user_agent: request.headers.get("user-agent") || "",
        ip_address: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined,
      })
    } catch (logError) {
      console.error("[v0] Failed to log search:", logError)
      // Don't fail the request if logging fails
    }

    return createSuccessResponse(result, { processingTime })
  } catch (error) {
    const processingTime = Date.now() - startTime
    logApiResponse("DUEL", false, processingTime)

    try {
      await logger.logSearch({
        type: "duel",
        query: body?.brand1 || "unknown",
        brand1: body?.brand1,
        brand2: body?.brand2,
        language: body?.language || "fr",
        results: {
          processing_time: processingTime,
          google_results_count: 0,
        },
        user_agent: request.headers.get("user-agent") || "",
        ip_address: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    } catch (logError) {
      console.error("[v0] Failed to log error:", logError)
    }

    if (error instanceof z.ZodError) {
      return createValidationErrorResponse(error.errors)
    }

    return handleApiError(error)
  }
}
