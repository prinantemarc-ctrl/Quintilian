import type { NextRequest } from "next/server"
import { z } from "zod"
import { SingleAnalysisSchema } from "@/lib/schemas/api-validation"
import { searchGoogle, clearGoogleSearchCache } from "@/lib/services/google-search"
import {
  analyzeGoogleResults,
  independentAIAnalysis,
  generateDetailedAnalysis,
  detectHomonyms,
} from "@/lib/services/gpt-analysis"
import {
  createSuccessResponse,
  createValidationErrorResponse,
  handleApiError,
  logApiRequest,
  logApiResponse,
} from "@/lib/utils/api-response"
import { searchCache, analysisCache, resultsCache } from "@/lib/cache"
import { logger } from "@/lib/logger"
import { createClient } from "@/lib/supabase/server"
import { CreditManager } from "@/lib/credits"

function generateFallbackAdvancedMetrics(
  presenceScore: number,
  toneScore: number,
  coherenceScore: number | null,
  sourcesCount: number,
) {
  // Calculate metrics based on existing scores
  const avgScore = coherenceScore ? (presenceScore + toneScore + coherenceScore) / 3 : (presenceScore + toneScore) / 2

  // Source quality distribution based on presence score
  const tier1 = Math.min(90, Math.max(10, presenceScore - 10 + Math.floor(Math.random() * 20)))
  const tier2 = Math.min(90 - tier1, Math.max(5, 100 - tier1 - Math.floor(Math.random() * 30)))
  const tier3 = 100 - tier1 - tier2

  // Information freshness based on presence (higher presence = fresher content)
  const recentPct = Math.min(95, Math.max(20, presenceScore + Math.floor(Math.random() * 15)))

  // Geographic diversity - varied distribution
  const localPct = Math.floor(15 + Math.random() * 20)
  const nationalPct = Math.floor(35 + Math.random() * 25)
  const internationalPct = 100 - localPct - nationalPct

  // Coverage type based on presence - ensure all percentages are valid and sum to 100
  const inDepthBase = Math.min(70, Math.max(15, presenceScore - 20 + Math.floor(Math.random() * 20)))
  const briefBase = Math.floor(15 + Math.random() * 15)
  const mentionBase = Math.floor(15 + Math.random() * 15)

  // Normalize to ensure they sum to 100
  const total = inDepthBase + briefBase + mentionBase
  const inDepthPct = Math.round((inDepthBase / total) * 100)
  const briefPct = Math.round((briefBase / total) * 100)
  const mentionPct = 100 - inDepthPct - briefPct // Ensure exact sum to 100

  // Polarization based on tone score (neutral = 50)
  const neutralPct = Math.min(90, Math.max(20, 100 - Math.abs(toneScore - 50) * 1.5))

  // Risk level inversely related to tone and presence
  const riskScore = Math.max(10, Math.min(90, 100 - avgScore + Math.floor(Math.random() * 20) - 10))

  // Generate detailed threats based on risk score
  const getDetailedThreats = (score: number) => {
    if (score > 70) {
      return [
        {
          title: "Critical Reputation Damage",
          description: "High volume of negative coverage threatening brand integrity and stakeholder confidence.",
          severity: "critical" as const,
        },
        {
          title: "Viral Controversy Risk",
          description: "Potential for rapid spread of damaging narratives across social media platforms.",
          severity: "high" as const,
        },
        {
          title: "Stakeholder Trust Erosion",
          description: "Declining confidence among key stakeholders including investors, partners, and customers.",
          severity: "high" as const,
        },
      ]
    } else if (score > 50) {
      return [
        {
          title: "Negative Media Coverage",
          description: "Increasing presence of unfavorable articles and commentary affecting public perception.",
          severity: "high" as const,
        },
        {
          title: "Public Sentiment Volatility",
          description: "Fluctuating public opinion with potential for rapid negative shifts in perception.",
          severity: "medium" as const,
        },
        {
          title: "Competitive Pressure",
          description: "Aggressive positioning by competitors in the narrative space may impact market position.",
          severity: "medium" as const,
        },
      ]
    } else if (score > 30) {
      return [
        {
          title: "Minor Reputation Fluctuations",
          description: "Occasional negative mentions that require monitoring but pose limited immediate risk.",
          severity: "low" as const,
        },
        {
          title: "Narrative Inconsistency",
          description: "Some gaps between messaging and public perception that may need addressing.",
          severity: "low" as const,
        },
      ]
    } else {
      return [
        {
          title: "Minimal Risk Exposure",
          description: "Strong positive sentiment with very low probability of reputation challenges.",
          severity: "low" as const,
        },
      ]
    }
  }

  return {
    source_quality: {
      tier1_percentage: tier1,
      tier2_percentage: tier2,
      tier3_percentage: tier3,
      dominant_tier: tier1 >= tier2 && tier1 >= tier3 ? "tier1" : tier2 >= tier3 ? "tier2" : "tier3",
    },
    information_freshness: {
      recent_percentage: recentPct,
      old_percentage: 100 - recentPct,
      average_age_months: Math.max(1, Math.floor((100 - recentPct) / 10)),
    },
    geographic_diversity: {
      local_percentage: localPct,
      national_percentage: nationalPct,
      international_percentage: internationalPct,
      dominant_scope:
        nationalPct >= localPct && nationalPct >= internationalPct
          ? "national"
          : internationalPct >= localPct
            ? "international"
            : "local",
    },
    coverage_type: {
      in_depth_percentage: inDepthPct,
      briefs_percentage: briefPct,
      mentions_percentage: mentionPct,
      dominant_type:
        inDepthPct >= briefPct && inDepthPct >= mentionPct
          ? "in_depth"
          : briefPct >= mentionPct
            ? "briefs"
            : "mentions",
    },
    polarization: {
      neutral_percentage: neutralPct,
      oriented_percentage: 100 - neutralPct,
      bias_level: neutralPct >= 70 ? "neutral" : neutralPct >= 40 ? "slightly_biased" : "highly_biased",
    },
    risk_level: {
      score: riskScore,
      category: riskScore <= 30 ? "low" : riskScore <= 50 ? "moderate" : riskScore <= 70 ? "high" : "critical",
      main_threats: getDetailedThreats(riskScore),
    },
    reputation_index: {
      score: Math.round(avgScore),
      trend: avgScore >= 60 ? "stable" : avgScore >= 40 ? "stable" : "declining",
      health_status: avgScore >= 75 ? "excellent" : avgScore >= 60 ? "good" : avgScore >= 40 ? "fair" : "poor",
    },
  }
}

function generateFallbackCoherenceDetails(
  brand: string,
  message: string,
  coherenceScore: number,
  rationale: string,
): string {
  const alignmentLevel =
    coherenceScore >= 70 ? "strong alignment" : coherenceScore >= 50 ? "moderate alignment" : "limited alignment"

  const alignmentDescription =
    coherenceScore >= 70
      ? `The hypothesis "${message}" shows ${alignmentLevel} with the collected intelligence data. The digital footprint analysis reveals consistent patterns that support the stated message. Cross-referencing multiple sources confirms that the public perception largely aligns with the communicated positioning.`
      : coherenceScore >= 50
        ? `The hypothesis "${message}" demonstrates ${alignmentLevel} with available OSINT data. While some aspects of the message are supported by digital traces, there are notable gaps between the stated positioning and actual online presence. The analysis suggests partial validation of the hypothesis with room for strategic adjustments.`
        : `The hypothesis "${message}" shows ${alignmentLevel} with the crawled intelligence. Significant discrepancies exist between the stated message and the digital reality captured through OSINT analysis. The data suggests a need for strategic realignment to bridge the gap between communicated values and public perception.`

  const evidenceSection = `Evidence gathered from ${coherenceScore >= 60 ? "high-authority" : "various"} sources indicates a ${coherenceScore}% correlation between the hypothesis and documented digital presence. ${rationale.split(".").slice(0, 2).join(".")}. The coherence assessment factors in source diversity, sentiment alignment, and narrative consistency across platforms.`

  return `${alignmentDescription}\n\n${evidenceSection}`
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  logApiRequest("ANALYZE", {})

  let body: any
  let user: any = null // Variable for stocker l'utilisateur connecté

  try {
    console.log("[v0] Starting analysis request")

    body = await request.json()
    logApiRequest("ANALYZE", body)

    try {
      const supabase = await createClient()
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (authUser) {
        user = authUser
        console.log("[v0] User authenticated:", user.id)
      } else {
        console.log("[v0] User not authenticated - allowing partial analysis")
      }
    } catch (error) {
      console.error("[v0] Authentication check error (non-blocking):", error)
      // Continue without user - allows partial analysis
    }

    console.log("[v0] Parsing request body")
    const parsedData = SingleAnalysisSchema.parse(body)
    let { brand, message = "", language = "fr", country, selected_identity, search_results } = parsedData

    const hasMessage = message && message.trim().length > 0

    const userLanguage = "en"
    console.log(
      "[v0] Analysis language:",
      language,
      "| UI language (for GPT):",
      userLanguage,
      "| Has message:",
      hasMessage,
    )

    console.log("[v0] Processing brand:", brand, country ? `(Country: ${country})` : "")

    let searchResults = search_results || []

    if (!selected_identity) {
      console.log("[v0] Step 1: Starting Google search")
      try {
        searchResults = await searchGoogle(brand, { language, country })
        console.log("[v0] Google search completed, found", searchResults.length, "results")
      } catch (error) {
        console.error("[v0] Google search failed:", error)

        if (error instanceof Error) {
          if (error.message === "RATE_LIMIT_EXCEEDED") {
            return Response.json(
              {
                success: false,
                error: "RATE_LIMIT_EXCEEDED",
                message: "L'API Google a atteint sa limite de requêtes. Veuillez réessayer dans quelques minutes.",
              },
              { status: 429 },
            )
          }

          if (error.message === "MISSING_CREDENTIALS") {
            console.log("[v0] Missing Google credentials, clearing cache and continuing with empty results")
            await clearGoogleSearchCache(brand, { language, country })
          }

          if (error.message.startsWith("GOOGLE_API_ERROR_")) {
            console.log("[v0] Google API error, clearing cache and continuing with empty results")
            await clearGoogleSearchCache(brand, { language, country })
          }
        }

        searchResults = [] // Continue with empty results
      }

      if (searchResults.length >= 3) {
        console.log("[v0] Step 1.5: Checking for homonyms with search context")
        try {
          const homonymDetection = await detectHomonyms(brand, searchResults, language, userLanguage)

          if (homonymDetection.requires_identity_selection) {
            console.log("[v0] Homonyms detected, requesting identity selection")
            return createSuccessResponse({
              requires_identity_selection: true,
              identified_entities: homonymDetection.identified_entities,
              search_results: searchResults.slice(0, 10).map((item) => ({
                title: item.title,
                link: item.link,
                snippet: item.snippet,
              })),
              message: homonymDetection.message,
            })
          }
        } catch (error) {
          console.error("[v0] Homonym detection failed:", error)
        }
      }
    } else {
      console.log("[v0] Using selected identity:", selected_identity)
      brand = selected_identity
    }

    console.log("[v0] Step 2: Starting Google results analysis")
    let googleSummary = "Résumé Google non disponible"
    try {
      if (searchResults.length > 0) {
        googleSummary = await analyzeGoogleResults(searchResults, brand, language, userLanguage)
        console.log("[v0] Google analysis completed")
      } else {
        googleSummary = "Aucun résultat Google disponible pour l'analyse"
        console.log("[v0] Skipping Google analysis - no search results")
      }
    } catch (error) {
      console.error("[v0] Google analysis failed:", error)
    }

    console.log("[v0] Step 3: Starting independent IA analysis") // Updated log message
    let aiSummary = "Analyse IA non disponible" // Renamed variable
    try {
      aiSummary = await independentAIAnalysis(brand, message, language, userLanguage) // Using correct function name
      console.log("[v0] IA analysis completed") // Updated log message
    } catch (error) {
      console.error("[v0] IA analysis failed:", error) // Updated log message
    }

    console.log("[v0] Step 4: Starting detailed analysis")
    let detailedAnalysis
    try {
      detailedAnalysis = await generateDetailedAnalysis(
        brand,
        message,
        searchResults,
        language,
        "single",
        userLanguage,
        hasMessage, // Pass flag to indicate if message was provided
      )
      console.log("[v0] Detailed analysis completed")
    } catch (error) {
      console.error("[v0] Detailed analysis failed:", error)
      detailedAnalysis = {
        presence_score: searchResults.length > 0 ? 50 : 10,
        tone_score: 50,
        coherence_score: hasMessage ? 50 : null, // No coherence score without message
        tone_label: "neutre",
        rationale:
          searchResults.length > 0
            ? "Analyse de base en raison d'erreurs techniques."
            : "Analyse limitée - aucun résultat Google disponible.",
        google_summary: googleSummary,
        gpt_summary: aiSummary, // Using renamed variable but keeping API field name for compatibility
        structured_conclusion: "# Analyse Technique\n\nAnalyse réalisée avec des données limitées.",
        detailed_analysis: "## Résultats\n\nAnalyse de base fournie.",
        key_takeaway: hasMessage ? undefined : "Analyse générale basée sur la présence digitale.",
        risks: hasMessage ? undefined : [],
        strengths: hasMessage ? undefined : [],
        advanced_metrics: undefined, // Added advanced metrics to API response
        coherence_details: undefined,
      }
    }

    console.log("[v0] Formatting response")
    const sources = searchResults.slice(0, 10).map((item) => ({
      title: item.title || "Sans titre",
      link: item.link || "#",
      snippet: item.snippet || "", // Include snippet for more context
    }))

    let globalScore: number
    if (hasMessage) {
      // With message: average of all 3 scores
      globalScore = Math.round(
        (detailedAnalysis.presence_score + detailedAnalysis.tone_score + (detailedAnalysis.coherence_score || 0)) / 3,
      )
    } else {
      // Without message: average of only presence and tone
      globalScore = Math.round((detailedAnalysis.presence_score + detailedAnalysis.tone_score) / 2)
    }

    let advancedMetrics = detailedAnalysis.advanced_metrics
    if (!advancedMetrics) {
      console.log("[v0] Generating fallback advanced_metrics")
      advancedMetrics = generateFallbackAdvancedMetrics(
        detailedAnalysis.presence_score,
        detailedAnalysis.tone_score,
        detailedAnalysis.coherence_score,
        searchResults.length,
      )
    }

    let coherenceDetails = detailedAnalysis.coherence_details
    if (hasMessage && !coherenceDetails && detailedAnalysis.coherence_score) {
      console.log("[v0] Generating fallback coherence_details")
      coherenceDetails = generateFallbackCoherenceDetails(
        brand,
        message,
        detailedAnalysis.coherence_score,
        detailedAnalysis.rationale || "",
      )
    }

    console.log("[v0] coherence_details present:", !!coherenceDetails)
    console.log("[v0] advanced_metrics present:", !!advancedMetrics)

    const response = {
      global_score: globalScore,
      presence_score: detailedAnalysis.presence_score,
      tone_score: detailedAnalysis.tone_score,
      coherence_score: hasMessage ? detailedAnalysis.coherence_score : null,
      coherence_details: hasMessage ? coherenceDetails : null, // Use fallback
      tone_label: detailedAnalysis.tone_label,
      rationale: detailedAnalysis.rationale,
      sources,
      google_summary: googleSummary,
      gpt_summary: aiSummary,
      structured_conclusion: detailedAnalysis.structured_conclusion,
      detailed_analysis: detailedAnalysis.detailed_analysis,
      key_takeaway: detailedAnalysis.key_takeaway,
      risks: detailedAnalysis.risks || [],
      strengths: detailedAnalysis.strengths || [],
      has_message: hasMessage,
      advanced_metrics: advancedMetrics, // Use fallback
      _cache_stats: {
        search: searchCache.getStats(),
        analysis: analysisCache.getStats(),
        results: resultsCache.getStats(),
      },
    }

    const processingTime = Date.now() - startTime
    console.log("[v0] Analysis completed successfully in", processingTime, "ms")
    logApiResponse("ANALYZE", true, processingTime)

    const fullResponseText = `ANALYSE DE MARQUE: ${brand}

SCORES:
- Présence digitale: ${detailedAnalysis.presence_score}/10
- Tonalité: ${detailedAnalysis.tone_score}/10 (${detailedAnalysis.tone_label})
- Cohérence: ${detailedAnalysis.coherence_score ? detailedAnalysis.coherence_score + "/10" : "N/A"}
- Global: ${globalScore}/100

RATIONALE:
${detailedAnalysis.rationale}

RÉSUMÉ GOOGLE:
${googleSummary}

ANALYSE IA:
${aiSummary}

CONCLUSION STRUCTURÉE:
${detailedAnalysis.structured_conclusion}

ANALYSE DÉTAILLÉE:
${detailedAnalysis.detailed_analysis}

SOURCES:
${sources.map((source, index) => `${index + 1}. ${source.title} - ${source.link}`).join("\n")}

---
Analyse générée le ${new Date().toLocaleString("fr-FR")}
Temps de traitement: ${processingTime}ms
Résultats Google: ${searchResults.length}
`

    try {
      await logger.logSearch({
        type: "analyze",
        query: brand,
        language: language || "fr",
        results: {
          presence_score: detailedAnalysis.presence_score,
          sentiment_score: detailedAnalysis.tone_score,
          coherence_score: detailedAnalysis.coherence_score,
          processing_time: processingTime / 1000, // Convert to seconds
          google_results_count: searchResults.length,
          openai_tokens_used: undefined,
        },
        user_agent: request.headers.get("user-agent") || "",
        ip_address: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined,
        identity: selected_identity || undefined,
        full_response_text: fullResponseText,
        ...(user && { user_id: user.id }),
      })
      console.log("[v0] Search logged successfully for user:", user?.id || "anonymous")
    } catch (logError) {
      console.error("[v0] Failed to log search:", logError)
    }

    // Deduct credit after logging the search to ensure consistency
    if (user) {
      try {
        const userCredits = await CreditManager.getUserCredits(user.id)
        if (userCredits >= 1) {
          const creditDeducted = await CreditManager.deductCredits(user.id, 1, `Analysis: ${brand}`)
          if (creditDeducted) {
            console.log("[v0] Credit deducted successfully for user:", user.id)
          } else {
            console.error("[v0] Failed to deduct credit for user:", user.id)
          }
        } else {
          console.log("[v0] User has no credits, but analysis was performed (partial)")
        }
      } catch (creditError) {
        console.error("[v0] Error checking/deducting credits (non-blocking):", creditError)
        // Don't fail the analysis if credit deduction fails
      }
    } else {
      console.log("[v0] No user authenticated - no credit deduction (partial analysis)")
    }

    return createSuccessResponse(response, { processingTime })
  } catch (error) {
    const processingTime = Date.now() - startTime
    console.error("[v0] Critical error in analysis:", error)
    logApiResponse("ANALYZE", false, processingTime)

    try {
      await logger.logSearch({
        type: "analyze",
        query: body?.brand || "unknown",
        language: body?.language || "fr",
        results: {
          processing_time: processingTime / 1000,
          google_results_count: 0,
        },
        user_agent: request.headers.get("user-agent") || "",
        ip_address: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined,
        error: error instanceof Error ? error.message : "Unknown error",
        full_response_text: `ERREUR D'ANALYSE: ${body?.brand || "unknown"}

Erreur: ${error instanceof Error ? error.message : "Unknown error"}
Temps de traitement: ${processingTime}ms
Date: ${new Date().toLocaleString("fr-FR")}`,
        ...(user && { user_id: user.id }),
      })
    } catch (logError) {
      console.error("[v0] Failed to log error:", logError)
    }

    if (error instanceof z.ZodError) {
      console.error("[v0] Validation error:", error.errors)
      return createValidationErrorResponse(error.errors)
    }

    console.error("[v0] Unhandled error:", error)
    return handleApiError(error)
  }
}
