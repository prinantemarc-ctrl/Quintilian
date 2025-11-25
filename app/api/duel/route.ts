import type { NextRequest } from "next/server"
import { z } from "zod"
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
import { logger } from "@/lib/logger" // Updated import path
import { createClient } from "@/lib/supabase/server" // Added Supabase client for user auth

function cleanMarkdownFormatting(text: string): string {
  return (
    text
      // Remove emojis
      .replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, "")
      // Remove markdown bold but keep the text
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      // Remove markdown headers but keep the text
      .replace(/^#{1,6}\s+/gm, "")
      // Clean up multiple spaces
      .replace(/ +/g, " ")
      // Normalize line breaks (keep double line breaks)
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  )
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

${brand1} (Score global: ${brand1GlobalScore}/100) :
- Présence digitale : ${brand1Analysis.presence_score}/100 (${brand1Analysis.presence_details})
- Sentiment : ${brand1Analysis.tone_score}/100 (${brand1Analysis.tone_details}) (${brand1Analysis.tone_label})
- Cohérence : ${brand1Analysis.coherence_score}/100 (${brand1Analysis.coherence_details})

${brand2} (Score global: ${brand2GlobalScore}/100) :
- Présence digitale : ${brand2Analysis.presence_score}/100 (${brand2Analysis.presence_details})
- Sentiment : ${brand2Analysis.tone_score}/100 (${brand2Analysis.tone_details}) (${brand2Analysis.tone_label})
- Cohérence : ${brand2Analysis.coherence_score}/100 (${brand2Analysis.coherence_details})

STRUCTURE EXACTE (N'utilise AUCUN symbole markdown, juste du texte simple avec sauts de ligne) :

[VERDICT]
${winner} remporte cette confrontation. Justification en 2-3 phrases courtes et percutantes basées sur les données.

[PRÉSENCE DIGITALE]
Comparaison objective des scores de présence. 2 phrases max.

[SENTIMENT PUBLIC]
Analyse des perceptions et tonalités. 2 phrases max.

[COHÉRENCE]
Évaluation de l'alignement avec le message. 2 phrases max.

[FORCES ${brand1.toUpperCase()}]
- Point fort 1
- Point fort 2
- Point fort 3

[FAIBLESSES ${brand1.toUpperCase()}]
- Faiblesse 1
- Faiblesse 2

[FORCES ${brand2.toUpperCase()}]
- Point fort 1
- Point fort 2
- Point fort 3

[FAIBLESSES ${brand2.toUpperCase()}]
- Faiblesse 1
- Faiblesse 2

[RECOMMANDATIONS]
Conseils concrets et actionnables. 3-4 phrases maximum.

RÈGLES :
- N'utilise AUCUN **, ##, emoji
- Texte simple, factuel, professionnel
- Sépare chaque section par une ligne vide
- Phrases courtes et percutantes
- Utilise EXACTEMENT les marqueurs [SECTION] fournis`

  try {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY not found")
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] OpenAI API error:", response.status, errorText)
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const rawText = data.choices[0].message.content

    const cleanedText = cleanMarkdownFormatting(rawText)

    console.log("[v0] Comparison generated successfully")

    return {
      detailed_comparison: cleanedText,
      winner,
      summary: `${brand1} (${brand1GlobalScore}/100) vs ${brand2} (${brand2GlobalScore}/100). ${
        winner === "Match nul"
          ? "Scores très proches, match nul !"
          : `${winner} l'emporte avec ${scoreDiff} points d'avance.`
      }`,
    }
  } catch (error) {
    console.error("[v0] Comparison generation failed:", error)
    return {
      detailed_comparison: "[ERREUR]\n\nImpossible de générer la comparaison détaillée.",
      winner: "Erreur",
      summary: "Erreur lors de la comparaison",
    }
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  logApiRequest("DUEL", {})

  let body: any
  let user: any = null // Added user variable for authentication

  try {
    body = await request.json()
    logApiRequest("DUEL", body)

    try {
      const supabase = await createClient()
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()
      user = authUser
      console.log("[v0] User authenticated:", user?.id || "anonymous")
    } catch (error) {
      console.log("[v0] User not authenticated, continuing as anonymous")
    }

    const { brand1, brand2, message, language, country } = DuelAnalysisSchema.parse(body)

    const hasMessage = message && message.trim().length > 0
    console.log(
      `[v0] Processing duel: ${brand1} vs ${brand2}`,
      country ? `(Country: ${country})` : "",
      hasMessage ? `(Message: ${message})` : "(No message)",
    )

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

    const brand1GlobalScore = hasMessage
      ? Math.round((brand1Analysis.presence_score + brand1Analysis.tone_score + brand1Analysis.coherence_score) / 3)
      : Math.round((brand1Analysis.presence_score + brand1Analysis.tone_score) / 2)

    const brand2GlobalScore = hasMessage
      ? Math.round((brand2Analysis.presence_score + brand2Analysis.tone_score + brand2Analysis.coherence_score) / 3)
      : Math.round((brand2Analysis.presence_score + brand2Analysis.tone_score) / 2)

    const result = {
      brand1_name: brand1,
      brand2_name: brand2,
      has_message: hasMessage,
      brand1_analysis: {
        ...brand1Analysis,
        global_score: brand1GlobalScore,
        // Supprimer coherence_score si pas de message
        ...(hasMessage ? {} : { coherence_score: null, coherence_details: null }),
      },
      brand2_analysis: {
        ...brand2Analysis,
        global_score: brand2GlobalScore,
        // Supprimer coherence_score si pas de message
        ...(hasMessage ? {} : { coherence_score: null, coherence_details: null }),
      },
      brand1_sources: brand1Results.map((item) => ({
        title: item.title || "Sans titre",
        link: item.link || "#",
        snippet: item.snippet || "",
      })),
      brand2_sources: brand2Results.map((item) => ({
        title: item.title || "Sans titre",
        link: item.link || "#",
        snippet: item.snippet || "",
      })),
      winner: comparison.winner,
      score_difference: Math.abs(brand1GlobalScore - brand2GlobalScore),
      detailed_comparison: comparison.detailed_comparison,
      summary: comparison.summary,
    }

    const processingTime = Date.now() - startTime
    logApiResponse("DUEL", true, processingTime)

    console.log(`[v0] Winner: ${comparison.winner}`)
    console.log(`[v0] Scores: ${brand1} (${brand1GlobalScore}) vs ${brand2} (${brand2GlobalScore})`)

    const fullResponseText = `DUEL COMPARATIF: ${brand1} vs ${brand2}

VERDICT FINAL: ${comparison.winner}
${comparison.summary}

SCORES DÉTAILLÉS:

${brand1}:
- Présence digitale: ${brand1Analysis.presence_score}/10
- Tonalité: ${brand1Analysis.tone_score}/10 (${brand1Analysis.tone_label})
- Cohérence: ${brand1Analysis.coherence_score}/10
- Score global: ${brand1GlobalScore}/10

${brand2}:
- Présence digitale: ${brand2Analysis.presence_score}/10
- Tonalité: ${brand2Analysis.tone_score}/10 (${brand2Analysis.tone_label})
- Cohérence: ${brand2Analysis.coherence_score}/10
- Score global: ${brand2GlobalScore}/10

ANALYSE DÉTAILLÉE ${brand1}:
${brand1Analysis.detailed_analysis}

ANALYSE DÉTAILLÉE ${brand2}:
${brand2Analysis.detailed_analysis}

COMPARAISON COMPLÈTE:
${comparison.detailed_comparison}

SOURCES ${brand1}:
${brand1Results
  .slice(0, 5)
  .map((source, index) => `${index + 1}. ${source.title} - ${source.link}`)
  .join("\n")}

SOURCES ${brand2}:
${brand2Results
  .slice(0, 5)
  .map((source, index) => `${index + 1}. ${source.title} - ${source.link}`)
  .join("\n")}

---
Duel généré le ${new Date().toLocaleString("fr-FR")}
Temps de traitement: ${processingTime}ms
Résultats Google: ${brand1Results.length + brand2Results.length}
`

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
          processing_time: processingTime / 1000, // Convert to seconds
          google_results_count: brand1Results.length + brand2Results.length,
          openai_tokens_used: undefined,
        },
        user_agent: request.headers.get("user-agent") || "",
        ip_address: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined,
        full_response_text: fullResponseText, // Added full response text
        ...(user && { user_id: user.id }), // Added user_id if authenticated
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
          processing_time: processingTime / 1000, // Convert to seconds
          google_results_count: 0,
        },
        user_agent: request.headers.get("user-agent") || "",
        ip_address: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined,
        error: error instanceof Error ? error.message : "Unknown error",
        full_response_text: `ERREUR DE DUEL: ${body?.brand1 || "unknown"} vs ${body?.brand2 || "unknown"}

Erreur: ${error instanceof Error ? error.message : "Unknown error"}
Temps de traitement: ${processingTime}ms
Date: ${new Date().toLocaleString("fr-FR")}`, // Added full response text for errors
        ...(user && { user_id: user.id }), // Added user_id if authenticated
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
