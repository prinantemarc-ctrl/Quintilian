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
import { CreditManager } from "@/lib/credits" // Added CreditManager import

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
  presentationLanguage = "fr",
): Promise<{
  detailed_comparison: string
  winner: string
  summary: string
  message_analysis?: string
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

  if (scoreDiff <= 1) {
    winner = "Tie"
  }

  const responseLanguageMap: Record<string, string> = {
    fr: "français",
    en: "English",
    es: "español",
  }
  const responseLanguage = responseLanguageMap[presentationLanguage] || "français"

  const hasMessage = message && message.trim().length > 0
  const messageAnalysisPrompt = hasMessage
    ? `

[MESSAGE/HYPOTHESIS ANALYSIS]
Message/Hypothesis to analyze: "${message}"

Compare in detail (minimum 200 words) how each entity aligns with this message/hypothesis:
- ${brand1}: SPECIFIC analysis of alignment with "${message}". Use coherence data (${brand1Analysis.coherence_score}/100) and details (${brand1Analysis.coherence_details}). Explain PRECISELY why this entity matches or not the message. Give concrete examples.
- ${brand2}: SPECIFIC analysis of alignment with "${message}". Use coherence data (${brand2Analysis.coherence_score}/100) and details (${brand2Analysis.coherence_details}). Explain PRECISELY why this entity matches or not the message. Give concrete examples.
- VERDICT: Which entity corresponds BEST to "${message}"? ${brand1} or ${brand2}? Justify with FACTS and PRECISE FIGURES. What is the relevance difference between the two (quantify it)?

This analysis must be ULTRA DETAILED, FACTUAL and QUANTIFIED.`
    : ""

  const prompt = `Tu es un analyste expert en réputation digitale. Compare "${brand1}" et "${brand2}" de manière TRÈS SPÉCIFIQUE et DÉTAILLÉE.

IMPORTANT: Réponds ENTIÈREMENT en ${responseLanguage}. Tous les titres, textes et analyses doivent être en ${responseLanguage}.

DONNÉES D'ANALYSE COMPLÈTES :

${brand1} (Score global: ${brand1GlobalScore}/100) :
- Présence digitale : ${brand1Analysis.presence_score}/100
  Détails: ${brand1Analysis.presence_details}
- Sentiment public : ${brand1Analysis.tone_score}/100 (${brand1Analysis.tone_label})
  Détails: ${brand1Analysis.tone_details}
- Cohérence message : ${brand1Analysis.coherence_score}/100
  Détails: ${brand1Analysis.coherence_details}
- Analyse détaillée : ${brand1Analysis.detailed_analysis}

${brand2} (Score global: ${brand2GlobalScore}/100) :
- Présence digitale : ${brand2Analysis.presence_score}/100
  Détails: ${brand2Analysis.presence_details}
- Sentiment public : ${brand2Analysis.tone_score}/100 (${brand2Analysis.tone_label})
  Détails: ${brand2Analysis.tone_details}
- Cohérence message : ${brand2Analysis.coherence_score}/100
  Détails: ${brand2Analysis.coherence_details}
- Analyse détaillée : ${brand2Analysis.detailed_analysis}

INSTRUCTIONS CRITIQUES :
1. Sois ULTRA SPÉCIFIQUE - utilise des chiffres, des faits, des exemples concrets
2. Compare point par point avec des DIFFÉRENCES QUANTIFIÉES
3. Cite des plateformes, canaux, types de contenu PRÉCIS
4. Donne des recommandations ACTIONNABLES et MESURABLES
5. N'utilise AUCUN markdown (**, ##, emoji) - texte brut uniquement
6. Sois factuel, analytique et professionnel
7. RÉPONDS ENTIÈREMENT EN ${responseLanguage.toUpperCase()}

STRUCTURE EXACTE (texte brut en ${responseLanguage}, séparé par sauts de ligne) :

[VERDICT]
${winner === "Tie" ? `Les deux entités sont au coude-à-coude avec seulement ${scoreDiff} points d'écart (${brand1}: ${brand1GlobalScore}/100, ${brand2}: ${brand2GlobalScore}/100).` : `${winner} domine avec ${scoreDiff} points d'avance (${brand1GlobalScore} vs ${brand2GlobalScore}).`} Explique en 2-3 phrases PRÉCISES pourquoi, avec des éléments QUANTIFIÉS des données ci-dessus.
${messageAnalysisPrompt}

[PRÉSENCE DIGITALE]
Compare SPÉCIFIQUEMENT les scores (${brand1}: ${brand1Analysis.presence_score}/100 vs ${brand2}: ${brand2Analysis.presence_score}/100). Mentionne les plateformes, types de médias, autorité des sources. 3-4 phrases avec DONNÉES CHIFFRÉES.

[SENTIMENT PUBLIC]
Analyse DÉTAILLÉE des sentiments (${brand1}: ${brand1Analysis.tone_label} ${brand1Analysis.tone_score}/100 vs ${brand2}: ${brand2Analysis.tone_label} ${brand2Analysis.tone_score}/100). Explique les RAISONS des différences de perception avec exemples concrets. 3-4 phrases.

[COHÉRENCE]
Compare l'alignement message/image (${brand1}: ${brand1Analysis.coherence_score}/100 vs ${brand2}: ${brand2Analysis.coherence_score}/100). Identifie PRÉCISÉMENT les écarts ou cohérences. 3 phrases minimum.

[STRENGTHS ${brand1.toUpperCase()}]
- Strength 1: [élément précis avec chiffre ou fait]
- Strength 2: [plateforme/canal spécifique avec impact quantifié]
- Strength 3: [avantage concurrentiel mesurable]
- Strength 4: [atout distinctif avec preuve]

[RISKS ${brand1.toUpperCase()}]
- Risk 1: [point faible identifié avec impact chiffré]
- Risk 2: [manque spécifique sur canal/plateforme]
- Risk 3: [risque ou lacune mesurable]

[STRENGTHS ${brand2.toUpperCase()}]
- Strength 1: [élément précis avec chiffre ou fait]
- Strength 2: [plateforme/canal spécifique avec impact quantifié]
- Strength 3: [avantage concurrentiel mesurable]
- Strength 4: [atout distinctif avec preuve]

[RISKS ${brand2.toUpperCase()}]
- Risk 1: [point faible identifié avec impact chiffré]
- Risk 2: [manque spécifique sur canal/plateforme]
- Risk 3: [risque ou lacune mesurable]

[RECOMMANDATIONS]
Pour ${brand1}: 2-3 actions PRÉCISES et MESURABLES (ex: "augmenter présence LinkedIn de 40%", "publier 3 articles/mois sur médias autorité").
Pour ${brand2}: 2-3 actions PRÉCISES et MESURABLES avec KPIs.

RAPPEL : Texte brut uniquement en ${responseLanguage}, sans **, ##, ou emoji. Sois FACTUEL et SPÉCIFIQUE.`

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
        temperature: 0.3, // Keep low temperature for factual analysis
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

    let messageAnalysis: string | undefined
    if (hasMessage) {
      const messageAnalysisMatch = cleanedText.match(/\[MESSAGE\/HYPOTHESIS ANALYSIS\](.*?)(?=\[|$)/s)
      if (messageAnalysisMatch) {
        messageAnalysis = messageAnalysisMatch[1].trim()
        console.log("[v0] Message analysis extracted:", messageAnalysis.substring(0, 100) + "...")
      }
    }

    console.log("[v0] Comparison generated successfully")

    return {
      detailed_comparison: cleanedText,
      winner,
      summary: `${brand1} (${brand1GlobalScore}/100) vs ${brand2} (${brand2GlobalScore}/100). ${
        winner === "Tie" ? "Tie - Very close scores!" : `${winner} wins with a ${scoreDiff} point lead.`
      }`,
      ...(messageAnalysis && { message_analysis: messageAnalysis }),
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
  let user: any = null // Variable to store authenticated user (optional)

  try {
    body = await request.json()
    logApiRequest("DUEL", body)

    try {
      const supabase = await createClient()
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (authUser) {
        user = authUser
        console.log("[v0] User authenticated:", user.id)
      } else {
        console.log("[v0] User not authenticated - allowing partial duel")
      }
    } catch (error) {
      console.error("[v0] Authentication check error (non-blocking):", error)
      // Continue without user - allows partial duel
    }

    const { brand1, brand2, message, language, country } = DuelAnalysisSchema.parse(body)

    const hasMessage = message && message.trim().length > 0

    const userLanguage = "en"
    console.log(
      `[v0] Processing duel: ${brand1} vs ${brand2}`,
      country ? `(Country: ${country})` : "",
      hasMessage ? `(Message: ${message})` : "(No message)",
      `| UI language (for GPT): ${userLanguage}`,
    )

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      console.error("[v0] CRITICAL: No OpenAI API key found for duel analysis!")
      throw new Error("Configuration manquante - clé API OpenAI non trouvée")
    }
    console.log("[v0] OpenAI API key verified for duel analysis")

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
      generateDetailedAnalysis(brand1, message, brand1Results, language, "duel", userLanguage),
      generateDetailedAnalysis(brand2, message, brand2Results, language, "duel", userLanguage),
    ])

    if (brand1Analysis.rationale.includes("FALLBACK") || brand2Analysis.rationale.includes("FALLBACK")) {
      console.error("[v0] WARNING: Fallback data detected in duel analysis!")
    }

    const comparison = await generateComparison(
      brand1,
      brand1Analysis,
      brand2,
      brand2Analysis,
      message,
      language,
      userLanguage,
    )

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
        ...(hasMessage ? {} : { coherence_score: null, coherence_details: null }),
      },
      brand2_analysis: {
        ...brand2Analysis,
        global_score: brand2GlobalScore,
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
      ...(comparison.message_analysis && { message_analysis: comparison.message_analysis }),
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
          processing_time: processingTime / 1000,
          google_results_count: brand1Results.length + brand2Results.length,
          openai_tokens_used: undefined,
        },
        user_agent: request.headers.get("user-agent") || "",
        ip_address: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined,
        full_response_text: fullResponseText,
        ...(user && { user_id: user.id }),
      })
    } catch (logError) {
      console.error("[v0] Failed to log search:", logError)
    }

    if (user) {
      try {
        const userCredits = await CreditManager.getUserCredits(user.id)
        if (userCredits >= 1) {
          const creditDeducted = await CreditManager.deductCredits(user.id, 1, `Duel: ${brand1} vs ${brand2}`)
          if (creditDeducted) {
            console.log("[v0] Credit deducted successfully for user:", user.id)
          } else {
            console.error("[v0] Failed to deduct credit for user:", user.id)
          }
        } else {
          console.log("[v0] User has no credits, but duel was performed (partial)")
        }
      } catch (creditError) {
        console.error("[v0] Error checking/deducting credits (non-blocking):", creditError)
        // Don't fail the duel if credit deduction fails
      }
    } else {
      console.log("[v0] No user authenticated - no credit deduction (partial duel)")
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
          processing_time: processingTime / 1000,
          google_results_count: 0,
        },
        user_agent: request.headers.get("user-agent") || "",
        ip_address: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined,
        error: error instanceof Error ? error.message : "Unknown error",
        full_response_text: `ERREUR DE DUEL: ${body?.brand1 || "unknown"} vs ${body?.brand2 || "unknown"}

Erreur: ${error instanceof Error ? error.message : "Unknown error"}
Temps de traitement: ${processingTime}ms
Date: ${new Date().toLocaleString("fr-FR")}`,
        ...(user && { user_id: user.id }),
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
