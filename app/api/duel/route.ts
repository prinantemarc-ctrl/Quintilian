import type { NextRequest } from "next/server"
import { z } from "zod"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { DuelAnalysisSchema } from "@/lib/schemas/api-validation"
import { searchGoogle } from "@/lib/services/google-search"
import { generateDetailedAnalysis } from "@/lib/services/gpt-analysis"
import {
  createSuccessResponse,
  createValidationErrorResponse,
  handleApiError,
  logApiRequest,
  logApiResponse,
} from "@/lib/utils/api-response"

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
  const startTime = Date.now()
  logApiRequest("DUEL", {})

  try {
    const body = await request.json()
    logApiRequest("DUEL", body)

    const { brand1, brand2, message, language, country } = DuelAnalysisSchema.parse(body)

    console.log(`[v0] Processing duel: ${brand1} vs ${brand2}`, country ? `(Country: ${country})` : "")

    // Search and analyze both brands in parallel
    const [brand1Results, brand2Results] = await Promise.all([
      searchGoogle(brand1, { language, country }),
      searchGoogle(brand2, { language, country }),
    ])

    const [brand1Analysis, brand2Analysis] = await Promise.all([
      generateDetailedAnalysis(brand1, message, brand1Results, language, "duel"),
      generateDetailedAnalysis(brand2, message, brand2Results, language, "duel"),
    ])

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

    const processingTime = Date.now() - startTime
    logApiResponse("DUEL", true, processingTime)

    console.log(`[v0] Winner: ${comparison.winner}`)
    console.log(`[v0] Scores: ${brand1} (${brand1GlobalScore}) vs ${brand2} (${brand2GlobalScore})`)

    return createSuccessResponse(result, { processingTime })
  } catch (error) {
    const processingTime = Date.now() - startTime
    logApiResponse("DUEL", false, processingTime)

    if (error instanceof z.ZodError) {
      return createValidationErrorResponse(error.errors)
    }

    return handleApiError(error)
  }
}
