import type { NextRequest } from "next/server"
import { z } from "zod"
import { SingleAnalysisSchema } from "@/lib/schemas/api-validation"
import { searchGoogle } from "@/lib/services/google-search"
import { analyzeGoogleResults, independentGPTAnalysis, generateDetailedAnalysis } from "@/lib/services/gpt-analysis"
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
    const body = await request.json()
    logApiRequest("ANALYZE", body)

    const parsedData = SingleAnalysisSchema.parse(body)
    const { brand, message, language, country } = parsedData

    console.log("[v0] Processing brand:", brand, country ? `(Country: ${country})` : "")

    // Step 1: Search Google
    const searchResults = await searchGoogle(brand, { language, country })

    // Step 2: Analyze Google results
    const googleSummary = await analyzeGoogleResults(searchResults, brand, language)

    // Step 3: Independent GPT analysis
    const gptSummary = await independentGPTAnalysis(brand, message, language)

    // Step 4: Generate detailed comparative analysis
    const detailedAnalysis = await generateDetailedAnalysis(brand, message, searchResults, language, "single")

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
    logApiResponse("ANALYZE", true, processingTime)

    return createSuccessResponse(response, { processingTime })
  } catch (error) {
    const processingTime = Date.now() - startTime
    logApiResponse("ANALYZE", false, processingTime)

    if (error instanceof z.ZodError) {
      return createValidationErrorResponse(error.errors)
    }

    return handleApiError(error)
  }
}
