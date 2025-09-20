import type { NextRequest } from "next/server"
import { z } from "zod"
import { SingleAnalysisSchema } from "@/lib/schemas/api-validation"
import { searchGoogle, clearGoogleSearchCache } from "@/lib/services/google-search"
import {
  analyzeGoogleResults,
  independentGPTAnalysis,
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

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  logApiRequest("ANALYZE", {})

  try {
    console.log("[v0] Starting analysis request")

    const body = await request.json()
    logApiRequest("ANALYZE", body)

    console.log("[v0] Parsing request body")
    const parsedData = SingleAnalysisSchema.parse(body)
    let { brand, message, language, country, selected_identity, search_results } = parsedData

    console.log("[v0] Processing brand:", brand, country ? `(Country: ${country})` : "")

    // If we have a selected identity, use the provided search results
    let searchResults = search_results || []

    if (!selected_identity) {
      // Step 1: Search Google
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
        console.log("[v0] Step 1.5: Checking for homonyms")
        try {
          const homonymDetection = await detectHomonyms(searchResults, brand, language)

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
          // Continue with normal analysis if homonym detection fails
        }
      }
    } else {
      console.log("[v0] Using selected identity:", selected_identity)
      // Modify the brand for analysis to include the selected identity context
      brand = selected_identity
    }

    // Step 2: Analyze Google results
    console.log("[v0] Step 2: Starting Google results analysis")
    let googleSummary = "Résumé Google non disponible"
    try {
      if (searchResults.length > 0) {
        googleSummary = await analyzeGoogleResults(searchResults, brand, language)
        console.log("[v0] Google analysis completed")
      } else {
        googleSummary = "Aucun résultat Google disponible pour l'analyse"
        console.log("[v0] Skipping Google analysis - no search results")
      }
    } catch (error) {
      console.error("[v0] Google analysis failed:", error)
    }

    // Step 3: Independent GPT analysis
    console.log("[v0] Step 3: Starting independent GPT analysis")
    let gptSummary = "Analyse GPT non disponible"
    try {
      gptSummary = await independentGPTAnalysis(brand, message, language)
      console.log("[v0] GPT analysis completed")
    } catch (error) {
      console.error("[v0] GPT analysis failed:", error)
    }

    // Step 4: Generate detailed comparative analysis
    console.log("[v0] Step 4: Starting detailed analysis")
    let detailedAnalysis
    try {
      detailedAnalysis = await generateDetailedAnalysis(brand, message, searchResults, language, "single")
      console.log("[v0] Detailed analysis completed")
    } catch (error) {
      console.error("[v0] Detailed analysis failed:", error)
      detailedAnalysis = {
        presence_score: searchResults.length > 0 ? 50 : 10, // Lower score when no Google results
        tone_score: 50,
        coherence_score: 50,
        tone_label: "neutre",
        rationale:
          searchResults.length > 0
            ? "Analyse de base en raison d'erreurs techniques."
            : "Analyse limitée - aucun résultat Google disponible pour évaluer la présence digitale.",
        google_summary: googleSummary,
        gpt_summary: gptSummary,
        structured_conclusion: "# Analyse Technique\n\nAnalyse réalisée avec des données limitées.",
        detailed_analysis: "## Résultats\n\nAnalyse de base fournie.",
      }
    }

    console.log("[v0] Formatting response")
    // Format sources
    const sources = searchResults.slice(0, 5).map((item) => ({
      title: item.title || "Sans titre",
      link: item.link || "#",
    }))

    const response = {
      presence_score: detailedAnalysis.presence_score,
      tone_score: detailedAnalysis.tone_score,
      coherence_score: detailedAnalysis.coherence_score,
      tone_label: detailedAnalysis.tone_label,
      rationale: detailedAnalysis.rationale,
      sources,
      google_summary: googleSummary,
      gpt_summary: gptSummary,
      structured_conclusion: detailedAnalysis.structured_conclusion,
      detailed_analysis: detailedAnalysis.detailed_analysis,
      _cache_stats: {
        search: searchCache.getStats(),
        analysis: analysisCache.getStats(),
        results: resultsCache.getStats(),
      },
    }

    const processingTime = Date.now() - startTime
    console.log("[v0] Analysis completed successfully in", processingTime, "ms")
    logApiResponse("ANALYZE", true, processingTime)

    return createSuccessResponse(response, { processingTime })
  } catch (error) {
    const processingTime = Date.now() - startTime
    console.error("[v0] Critical error in analysis:", error)
    logApiResponse("ANALYZE", false, processingTime)

    if (error instanceof z.ZodError) {
      console.error("[v0] Validation error:", error.errors)
      return createValidationErrorResponse(error.errors)
    }

    console.error("[v0] Unhandled error:", error)
    return handleApiError(error)
  }
}
