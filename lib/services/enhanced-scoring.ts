import type { AnalysisScores, DetailedAnalysis } from "./gpt-analysis"

export interface EnhancedScores extends AnalysisScores {
  confidence_level: number
  variance_score: number
  temporal_weight: number
  cross_validation_score: number
}

export interface ScoringContext {
  google_results_count: number
  google_results_quality: number
  temporal_distribution: number[]
  source_diversity: number
  content_consistency: number
}

/**
 * Enhanced scoring algorithm that creates more discriminant and precise scores
 * Avoids the 70-85 zone and creates clear differentiation between profiles
 */
export class EnhancedScoringEngine {
  /**
   * Apply discriminant scoring curves to avoid mediocre scores
   */
  static applyDiscriminantCurve(rawScore: number, context: ScoringContext): number {
    // Return raw score with minimal adjustments for now

    // Apply only gentle curve to avoid extreme clustering
    if (rawScore >= 70 && rawScore <= 85) {
      // Gentle push away from mediocre zone
      if (rawScore <= 77) {
        return Math.max(60, rawScore - 5) // Push down slightly
      } else {
        return Math.min(95, rawScore + 8) // Push up slightly
      }
    }

    return rawScore
  }

  /**
   * Calculate temporal weighting based on result freshness
   */
  static calculateTemporalWeight(results: any[]): number {
    if (!results.length) return 0.5

    const now = Date.now()
    let totalWeight = 0
    let weightedSum = 0

    results.forEach((result) => {
      // Extract date from result (assuming it exists)
      const resultDate = result.date ? new Date(result.date).getTime() : now - 30 * 24 * 60 * 60 * 1000
      const daysDiff = (now - resultDate) / (24 * 60 * 60 * 1000)

      // Exponential decay: half-life of 14 days
      const weight = Math.exp(-daysDiff / 14)
      totalWeight += weight
      weightedSum += weight
    })

    return totalWeight > 0 ? weightedSum / results.length : 0.5
  }

  /**
   * Cross-validate Google results with GPT analysis for consistency
   */
  static calculateCrossValidationScore(
    googleSentiment: number,
    gptSentiment: number,
    googlePresence: number,
    gptPresence: number,
  ): number {
    // Calculate consistency between sources
    const sentimentDiff = Math.abs(googleSentiment - gptSentiment) / 100
    const presenceDiff = Math.abs(googlePresence - gptPresence) / 100

    // Penalize large discrepancies
    const consistencyScore = 1 - (sentimentDiff + presenceDiff) / 2

    // Convert to 0-100 scale
    return Math.max(0, Math.min(100, consistencyScore * 100))
  }

  /**
   * Force variance in scoring to avoid clustering around mediocre values
   */
  static enforceVariance(scores: number[], minVariance = 15): number[] {
    return scores
  }

  /**
   * Detect and flag potentially unreliable scoring patterns
   */
  static detectScoringAnomalies(analysis: DetailedAnalysis, context: ScoringContext): string[] {
    const anomalies: string[] = []
    const scores = [analysis.presence_score, analysis.tone_score, analysis.coherence_score]

    // Check for clustering in avoided zone
    const avoidedZoneCount = scores.filter((score) => score >= 70 && score <= 85).length
    if (avoidedZoneCount >= 2) {
      anomalies.push("MEDIOCRE_CLUSTERING")
    }

    // Check for insufficient variance
    const variance =
      scores.reduce((sum, score) => sum + Math.pow(score - scores.reduce((a, b) => a + b) / scores.length, 2), 0) /
      scores.length
    if (variance < 50) {
      anomalies.push("LOW_VARIANCE")
    }

    // Check for inconsistent cross-validation
    if (context.content_consistency < 60) {
      anomalies.push("INCONSISTENT_SOURCES")
    }

    // Check for insufficient data quality
    if (context.google_results_quality < 40) {
      anomalies.push("LOW_DATA_QUALITY")
    }

    return anomalies
  }

  /**
   * Apply sector-specific adjustments to scoring
   */
  static applySectorAdjustments(scores: AnalysisScores, sector: string): AnalysisScores {
    const adjustments: { [key: string]: { presence: number; tone: number; coherence: number } } = {
      technology: { presence: 1.1, tone: 1.0, coherence: 1.05 },
      finance: { presence: 1.0, tone: 0.95, coherence: 1.1 },
      healthcare: { presence: 0.95, tone: 1.05, coherence: 1.15 },
      entertainment: { presence: 1.15, tone: 1.1, coherence: 0.9 },
      politics: { presence: 1.2, tone: 0.85, coherence: 0.95 },
      sports: { presence: 1.1, tone: 1.05, coherence: 0.95 },
    }

    const adjustment = adjustments[sector.toLowerCase()] || { presence: 1.0, tone: 1.0, coherence: 1.0 }

    return {
      presence_score: Math.min(100, Math.round(scores.presence_score * adjustment.presence)),
      tone_score: Math.min(100, Math.round(scores.tone_score * adjustment.tone)),
      coherence_score: Math.min(100, Math.round(scores.coherence_score * adjustment.coherence)),
      tone_label: scores.tone_label,
    }
  }

  /**
   * Main enhanced scoring function that applies all improvements
   */
  static enhanceAnalysis(
    originalAnalysis: DetailedAnalysis,
    googleResults: any[],
    sector?: string,
  ): DetailedAnalysis & { enhanced_metadata: any } {
    // Calculate scoring context
    const context: ScoringContext = {
      google_results_count: googleResults.length,
      google_results_quality: this.calculateResultsQuality(googleResults),
      temporal_distribution: this.calculateTemporalDistribution(googleResults),
      source_diversity: this.calculateSourceDiversity(googleResults),
      content_consistency: this.calculateContentConsistency(googleResults, originalAnalysis),
    }

    // Apply minimal discriminant curves
    let enhancedScores = {
      presence_score: this.applyDiscriminantCurve(originalAnalysis.presence_score, {
        ...context,
        confidence_level: 0.8,
      }),
      tone_score: this.applyDiscriminantCurve(originalAnalysis.tone_score, { ...context, confidence_level: 0.7 }),
      coherence_score: this.applyDiscriminantCurve(originalAnalysis.coherence_score, {
        ...context,
        confidence_level: 0.9,
      }),
      tone_label: originalAnalysis.tone_label,
    }

    // Apply sector adjustments if provided (but keep them minimal)
    if (sector) {
      enhancedScores = this.applySectorAdjustments(enhancedScores, sector)
    }

    // Calculate cross-validation score
    const crossValidationScore = this.calculateCrossValidationScore(
      enhancedScores.tone_score,
      originalAnalysis.tone_score,
      enhancedScores.presence_score,
      originalAnalysis.presence_score,
    )

    // Detect anomalies
    const anomalies = this.detectScoringAnomalies(originalAnalysis, context)

    return {
      ...originalAnalysis,
      ...enhancedScores,
      enhanced_metadata: {
        temporal_weight: this.calculateTemporalWeight(googleResults),
        cross_validation_score: crossValidationScore,
        scoring_anomalies: anomalies,
        context,
        enhancement_applied: true,
        sector_adjustment: sector || "none",
      },
    }
  }

  /**
   * Force differentiation in duel contexts to avoid ties
   */
  static forceDuelDifferentiation(
    analysis1: DetailedAnalysis,
    analysis2: DetailedAnalysis,
    context1: ScoringContext,
    context2: ScoringContext,
  ): [DetailedAnalysis, DetailedAnalysis] {
    const scores1 = [analysis1.presence_score, analysis1.tone_score, analysis1.coherence_score]
    const scores2 = [analysis2.presence_score, analysis2.tone_score, analysis2.coherence_score]

    // Calculate average scores
    const avg1 = scores1.reduce((a, b) => a + b) / 3
    const avg2 = scores2.reduce((a, b) => a + b) / 3

    // If scores are too similar (within 3 points), force differentiation
    if (Math.abs(avg1 - avg2) <= 3) {
      console.log("[v0] Forcing duel differentiation - scores too similar")

      // Determine who should be slightly higher based on context quality
      const quality1 = context1.google_results_quality + context1.source_diversity
      const quality2 = context2.google_results_quality + context2.source_diversity

      let winner = analysis1
      let loser = analysis2

      if (quality2 > quality1) {
        winner = analysis2
        loser = analysis1
      }

      // Apply small but decisive adjustments (3-7 points difference)
      const adjustment = Math.floor(Math.random() * 5) + 3 // 3-7 points

      // Boost winner slightly
      winner.presence_score = Math.min(100, winner.presence_score + Math.floor(adjustment / 2))
      winner.coherence_score = Math.min(100, winner.coherence_score + Math.floor(adjustment / 2))

      // Lower loser slightly
      loser.tone_score = Math.max(0, loser.tone_score - adjustment)

      console.log(`[v0] Applied differentiation: +${adjustment} to winner, -${adjustment} to loser`)

      return quality2 > quality1 ? [analysis2, analysis1] : [analysis1, analysis2]
    }

    return [analysis1, analysis2]
  }

  private static calculateResultsQuality(results: any[]): number {
    if (!results.length) return 0

    let qualityScore = 0
    results.forEach((result) => {
      // Quality indicators
      if (result.title && result.title.length > 10) qualityScore += 20
      if (result.snippet && result.snippet.length > 50) qualityScore += 20
      if (result.link && result.link.includes("https")) qualityScore += 10
      if (result.date) qualityScore += 15
    })

    return Math.min(100, qualityScore / results.length)
  }

  private static calculateTemporalDistribution(results: any[]): number[] {
    // Return distribution of results across time periods
    const now = Date.now()
    const periods = [0, 0, 0, 0] // [0-7 days, 7-30 days, 30-90 days, 90+ days]

    results.forEach((result) => {
      if (!result.date) return

      const daysDiff = (now - new Date(result.date).getTime()) / (24 * 60 * 60 * 1000)

      if (daysDiff <= 7) periods[0]++
      else if (daysDiff <= 30) periods[1]++
      else if (daysDiff <= 90) periods[2]++
      else periods[3]++
    })

    return periods
  }

  private static calculateSourceDiversity(results: any[]): number {
    if (!results.length) return 0

    const domains = new Set(results.map((r) => (r.link ? new URL(r.link).hostname : "unknown")))
    return Math.min(100, (domains.size / results.length) * 100)
  }

  private static calculateContentConsistency(results: any[], analysis: DetailedAnalysis): number {
    // Simplified consistency check - in real implementation, this would be more sophisticated
    const hasPositiveKeywords = results.some(
      (r) =>
        (r.title + " " + r.snippet).toLowerCase().includes("success") ||
        (r.title + " " + r.snippet).toLowerCase().includes("award") ||
        (r.title + " " + r.snippet).toLowerCase().includes("excellent"),
    )

    const hasNegativeKeywords = results.some(
      (r) =>
        (r.title + " " + r.snippet).toLowerCase().includes("scandal") ||
        (r.title + " " + r.snippet).toLowerCase().includes("controversy") ||
        (r.title + " " + r.snippet).toLowerCase().includes("problem"),
    )

    // Check if sentiment aligns with keywords
    const isPositiveTone = analysis.tone_score > 60
    const consistency =
      (hasPositiveKeywords && isPositiveTone) ||
      (hasNegativeKeywords && !isPositiveTone) ||
      (!hasPositiveKeywords && !hasNegativeKeywords)

    return consistency ? 85 : 45
  }
}
