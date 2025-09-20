import type { NextRequest } from "next/server"
import { z } from "zod"
import { PressComparisonSchema } from "@/lib/schemas/api-validation"
import { searchGoogleNews, searchCustomSearchEngine } from "@/lib/services/press-search"
import { analyzePressResults, calculatePressScore } from "@/lib/services/press-analysis"
import {
  createSuccessResponse,
  createValidationErrorResponse,
  handleApiError,
  logApiRequest,
  logApiResponse,
} from "@/lib/utils/api-response"

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  logApiRequest("PRESS_COMPARISON", {})

  try {
    const body = await request.json()
    logApiRequest("PRESS_COMPARISON", body)

    const parsedData = PressComparisonSchema.parse(body)
    const { brand1, brand2, dateFrom, dateTo, countries } = parsedData

    console.log("[v0] Processing press comparison:", brand1, "vs", brand2)

    // Search for both brands in parallel
    const [results1, results2] = await Promise.all([
      searchBrandPress(brand1, { dateFrom, dateTo, countries }),
      searchBrandPress(brand2, { dateFrom, dateTo, countries }),
    ])

    // Analyze results for both brands
    const [analyzed1, analyzed2] = await Promise.all([
      analyzePressResults(results1, brand1),
      analyzePressResults(results2, brand2),
    ])

    // Calculate scores for both brands
    const [scores1, scores2] = [calculatePressScore(analyzed1), calculatePressScore(analyzed2)]

    const response = {
      brand1: {
        name: brand1,
        articles: analyzed1.slice(0, 10),
        kpis: {
          totalArticles: analyzed1.length,
          uniqueOutlets: getUniqueOutlets(analyzed1).length,
          countries: getUniqueCountries(analyzed1).length,
          pressScore: scores1.presenceScore,
          tonalityScore: scores1.tonalityScore,
        },
        scores: scores1,
      },
      brand2: {
        name: brand2,
        articles: analyzed2.slice(0, 10),
        kpis: {
          totalArticles: analyzed2.length,
          uniqueOutlets: getUniqueOutlets(analyzed2).length,
          countries: getUniqueCountries(analyzed2).length,
          pressScore: scores2.presenceScore,
          tonalityScore: scores2.tonalityScore,
        },
        scores: scores2,
      },
      comparison: {
        winner: scores1.presenceScore > scores2.presenceScore ? brand1 : brand2,
        scoreDifference: Math.abs(scores1.presenceScore - scores2.presenceScore),
        tonalityDifference: scores1.tonalityScore - scores2.tonalityScore,
      },
    }

    const processingTime = Date.now() - startTime
    logApiResponse("PRESS_COMPARISON", true, processingTime)

    return createSuccessResponse(response, { processingTime })
  } catch (error) {
    const processingTime = Date.now() - startTime
    logApiResponse("PRESS_COMPARISON", false, processingTime)

    if (error instanceof z.ZodError) {
      return createValidationErrorResponse(error.errors)
    }

    return handleApiError(error)
  }
}

async function searchBrandPress(brand: string, options: any) {
  const newsResults = await searchGoogleNews(brand, options)
  const cseResults = await searchCustomSearchEngine(brand, options)

  const allResults = [...newsResults, ...cseResults]
  return deduplicateArticles(allResults)
}

function deduplicateArticles(articles: any[]) {
  const seen = new Set()
  return articles.filter((article) => {
    const key = `${normalizeTitle(article.title)}-${article.source}-${article.date}`
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

function getUniqueOutlets(articles: any[]) {
  const outlets = new Set()
  articles.forEach((article) => {
    if (article.source) {
      outlets.add(article.source)
    }
  })
  return Array.from(outlets)
}

function getUniqueCountries(articles: any[]) {
  const countries = new Set()
  articles.forEach((article) => {
    if (article.country) {
      countries.add(article.country)
    }
  })
  return Array.from(countries)
}
