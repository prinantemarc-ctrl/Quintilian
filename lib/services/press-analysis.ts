interface AnalyzedArticle {
  id: string
  title: string
  snippet: string
  url: string
  source: string
  date: string
  country: string
  language: string
  sentiment: "positive" | "negative" | "neutral"
  sentimentScore: number
  credibility: number
  relevance: number
}

interface PressScores {
  presenceScore: number
  tonalityScore: number
  volumeScore: number
  authorityScore: number
  diversityScore: number
  recencyScore: number
}

export async function analyzePressResults(articles: any[], brand: string): Promise<AnalyzedArticle[]> {
  console.log("[v0] Analyzing", articles.length, "press articles for", brand)

  const analyzedArticles: AnalyzedArticle[] = []

  for (const article of articles) {
    try {
      // Analyze sentiment using heuristic approach (V1)
      const sentiment = analyzeSentimentHeuristic(article.title, article.snippet)

      // Calculate credibility based on source
      const credibility = calculateSourceCredibility(article.source)

      // Calculate relevance based on brand mention
      const relevance = calculateRelevance(article.title, article.snippet, brand)

      analyzedArticles.push({
        ...article,
        sentiment: sentiment.label,
        sentimentScore: sentiment.score,
        credibility,
        relevance,
      })
    } catch (error) {
      console.error("[v0] Error analyzing article:", article.id, error)
      // Add with default values if analysis fails
      analyzedArticles.push({
        ...article,
        sentiment: "neutral" as const,
        sentimentScore: 0,
        credibility: 50,
        relevance: 50,
      })
    }
  }

  return analyzedArticles
}

export function calculatePressScore(articles: AnalyzedArticle[]): PressScores {
  if (articles.length === 0) {
    return {
      presenceScore: 0,
      tonalityScore: 0,
      volumeScore: 0,
      authorityScore: 0,
      diversityScore: 0,
      recencyScore: 0,
    }
  }

  // Volume Score (40 points) - More aggressive scaling to create variance
  let volumeScore = 0
  if (articles.length <= 2) {
    volumeScore = articles.length * 8 // 8-16 points for very low volume
  } else if (articles.length <= 5) {
    volumeScore = 16 + (articles.length - 2) * 6 // 22-34 points for low volume
  } else if (articles.length <= 10) {
    volumeScore = 34 + (articles.length - 5) * 1 // 35-39 points for medium volume
  } else {
    volumeScore = Math.min(40, 39 + Math.log(articles.length - 9) * 0.5) // 39-40 points for high volume
  }

  const avgCredibility = articles.reduce((sum, article) => sum + article.credibility, 0) / articles.length
  let authorityScore = 0
  if (avgCredibility < 50) {
    authorityScore = avgCredibility * 0.2 // 0-10 points for low credibility
  } else if (avgCredibility < 70) {
    authorityScore = 10 + (avgCredibility - 50) * 0.4 // 10-18 points for medium credibility
  } else if (avgCredibility < 85) {
    authorityScore = 18 + (avgCredibility - 70) * 0.6 // 18-27 points for good credibility
  } else {
    authorityScore = 27 + (avgCredibility - 85) * 0.2 // 27-30 points for excellent credibility
  }

  const uniqueCountries = new Set(articles.map((a) => a.country)).size
  const uniqueLanguages = new Set(articles.map((a) => a.language)).size
  const uniqueDomains = new Set(articles.map((a) => a.source)).size

  let diversityScore = 0
  // Country diversity (0-6 points)
  diversityScore += Math.min(6, uniqueCountries * 1.5)
  // Language diversity (0-4 points)
  diversityScore += Math.min(4, uniqueLanguages * 1.3)
  // Domain diversity (0-5 points)
  diversityScore += Math.min(5, uniqueDomains * 0.8)

  const recencyScore = calculateEnhancedRecencyScore(articles)

  // Total Presence Score with enhanced calculation
  const presenceScore = Math.round(volumeScore + authorityScore + diversityScore + recencyScore)

  const tonalityScore = calculateEnhancedTonalityScore(articles)

  return {
    presenceScore: Math.min(100, presenceScore),
    tonalityScore,
    volumeScore: Math.round(volumeScore),
    authorityScore: Math.round(authorityScore),
    diversityScore: Math.round(diversityScore),
    recencyScore: Math.round(recencyScore),
  }
}

function calculateEnhancedRecencyScore(articles: AnalyzedArticle[]): number {
  const now = new Date()
  let recencyScore = 0

  articles.forEach((article) => {
    const articleDate = new Date(article.date)
    const daysDiff = Math.max(0, (now.getTime() - articleDate.getTime()) / (24 * 60 * 60 * 1000))

    if (daysDiff <= 1) {
      recencyScore += 3 // Very recent articles get high score
    } else if (daysDiff <= 3) {
      recencyScore += 2.5
    } else if (daysDiff <= 7) {
      recencyScore += 2
    } else if (daysDiff <= 14) {
      recencyScore += 1.5
    } else if (daysDiff <= 30) {
      recencyScore += 1
    } else {
      recencyScore += 0.5 // Older articles get minimal score
    }
  })

  return Math.min(15, recencyScore)
}

function calculateEnhancedTonalityScore(articles: AnalyzedArticle[]): number {
  if (articles.length === 0) return 0

  let positiveWeight = 0
  let negativeWeight = 0
  let neutralWeight = 0
  let totalWeight = 0

  articles.forEach((article) => {
    // Weight by both credibility and recency
    const credibilityWeight = article.credibility / 100
    const articleDate = new Date(article.date)
    const daysDiff = Math.max(0, (new Date().getTime() - articleDate.getTime()) / (24 * 60 * 60 * 1000))
    const recencyWeight = Math.max(0.3, Math.exp(-daysDiff / 30)) // 30-day half-life

    const weight = credibilityWeight * recencyWeight
    totalWeight += weight

    if (article.sentiment === "positive") {
      positiveWeight += weight * (1 + Math.abs(article.sentimentScore) / 100)
    } else if (article.sentiment === "negative") {
      negativeWeight += weight * (1 + Math.abs(article.sentimentScore) / 100)
    } else {
      neutralWeight += weight
    }
  })

  if (totalWeight === 0) return 0

  // Calculate net sentiment with enhanced range
  const netPositive = positiveWeight - negativeWeight
  const totalSentiment = positiveWeight + negativeWeight + neutralWeight

  // Enhanced scoring that can reach extreme values
  let tonalityScore = 0
  if (totalSentiment > 0) {
    tonalityScore = (netPositive / totalSentiment) * 120 // Allow scores beyond ±100

    // Apply sigmoid function to create more extreme scores
    tonalityScore = tonalityScore * (1 + Math.abs(tonalityScore) / 200)
  }

  return Math.round(Math.max(-100, Math.min(100, tonalityScore)))
}

function analyzeSentimentHeuristic(
  title: string,
  snippet: string,
): { label: "positive" | "negative" | "neutral"; score: number } {
  const text = `${title} ${snippet}`.toLowerCase()

  const positiveWords = [
    "excellent",
    "great",
    "amazing",
    "wonderful",
    "fantastic",
    "outstanding",
    "success",
    "achievement",
    "innovation",
    "breakthrough",
    "award",
    "winner",
    "best",
    "top",
    "leading",
    "growth",
    "increase",
    "improve",
    "benefit",
    "advantage",
    "positive",
    "good",
    "strong",
    "effective",
    "efficient",
  ]

  const negativeWords = [
    "terrible",
    "awful",
    "bad",
    "worst",
    "failure",
    "problem",
    "issue",
    "crisis",
    "scandal",
    "controversy",
    "decline",
    "decrease",
    "loss",
    "damage",
    "harm",
    "risk",
    "threat",
    "concern",
    "criticism",
    "complaint",
    "negative",
    "poor",
    "weak",
    "ineffective",
    "disappointing",
  ]

  let positiveCount = 0
  let negativeCount = 0

  positiveWords.forEach((word) => {
    if (text.includes(word)) positiveCount++
  })

  negativeWords.forEach((word) => {
    if (text.includes(word)) negativeCount++
  })

  const totalWords = positiveCount + negativeCount
  if (totalWords === 0) {
    return { label: "neutral", score: 0 }
  }

  const score = ((positiveCount - negativeCount) / totalWords) * 100

  if (score > 20) return { label: "positive", score }
  if (score < -20) return { label: "negative", score }
  return { label: "neutral", score }
}

function calculateSourceCredibility(source: string): number {
  const credibilityMap: { [key: string]: number } = {
    // Tier 1 - Premium sources
    "lemonde.fr": 95,
    "ft.com": 95,
    "nytimes.com": 95,
    "wsj.com": 95,
    "bbc.com": 94,
    "theguardian.com": 92,
    "reuters.com": 94,
    "ap.org": 94,

    // Tier 2 - Quality sources
    "lefigaro.fr": 88,
    "lesechos.fr": 90,
    "liberation.fr": 85,
    "telegraph.co.uk": 87,
    "washingtonpost.com": 90,
    "cnn.com": 82,
    "spiegel.de": 88,
    "zeit.de": 90,

    // Tier 3 - Standard sources
    "elpais.com": 85,
    "elmundo.es": 83,
    "abc.es": 80,
    "lavanguardia.com": 82,
  }

  // Check exact match first
  if (credibilityMap[source]) {
    return credibilityMap[source]
  }

  // Check partial matches
  for (const [domain, score] of Object.entries(credibilityMap)) {
    if (source.includes(domain.split(".")[0])) {
      return score - 5 // Slight penalty for partial match
    }
  }

  // Default credibility for unknown sources
  return 65
}

function calculateRelevance(title: string, snippet: string, brand: string): number {
  const text = `${title} ${snippet}`.toLowerCase()
  const brandLower = brand.toLowerCase()

  let relevanceScore = 0

  // Brand mentioned in title
  if (title.toLowerCase().includes(brandLower)) {
    relevanceScore += 40
  }

  // Brand mentioned in snippet
  if (snippet.toLowerCase().includes(brandLower)) {
    relevanceScore += 30
  }

  // Multiple mentions
  const mentions = (text.match(new RegExp(brandLower, "g")) || []).length
  relevanceScore += Math.min(30, mentions * 10)

  return Math.min(100, relevanceScore)
}
