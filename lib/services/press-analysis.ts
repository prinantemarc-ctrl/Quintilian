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

  // Volume Score (40 points) - Normalized log of unique articles over 30 days
  const volumeScore = Math.min(40, Math.log(articles.length + 1) * 10)

  // Authority Score (30 points) - Average credibility of sources
  const authorityScore = (articles.reduce((sum, article) => sum + article.credibility, 0) / articles.length) * 0.3

  // Diversity Score (15 points) - Countries + languages + domain variety
  const uniqueCountries = new Set(articles.map((a) => a.country)).size
  const uniqueLanguages = new Set(articles.map((a) => a.language)).size
  const uniqueDomains = new Set(articles.map((a) => a.source)).size
  const diversityScore = Math.min(15, (uniqueCountries * 2 + uniqueLanguages + uniqueDomains) * 0.5)

  // Recency Score (15 points) - Exponential weighting over 14 days
  const recencyScore = calculateRecencyScore(articles)

  // Total Presence Score
  const presenceScore = Math.round(volumeScore + authorityScore + diversityScore + recencyScore)

  // Tonality Score (-100 to +100)
  const tonalityScore = calculateTonalityScore(articles)

  return {
    presenceScore: Math.min(100, presenceScore),
    tonalityScore,
    volumeScore: Math.round(volumeScore),
    authorityScore: Math.round(authorityScore),
    diversityScore: Math.round(diversityScore),
    recencyScore: Math.round(recencyScore),
  }
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

function calculateRecencyScore(articles: AnalyzedArticle[]): number {
  const now = new Date()
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

  let recencyScore = 0

  articles.forEach((article) => {
    const articleDate = new Date(article.date)
    const daysDiff = Math.max(0, (now.getTime() - articleDate.getTime()) / (24 * 60 * 60 * 1000))

    if (daysDiff <= 14) {
      // Exponential decay: more recent = higher score
      const weight = Math.exp(-daysDiff / 7) // Half-life of 7 days
      recencyScore += weight
    }
  })

  return Math.min(15, recencyScore)
}

function calculateTonalityScore(articles: AnalyzedArticle[]): number {
  if (articles.length === 0) return 0

  let weightedPositive = 0
  let weightedNegative = 0
  let totalWeight = 0

  articles.forEach((article) => {
    const weight = article.credibility / 100 // Weight by source credibility
    totalWeight += weight

    if (article.sentiment === "positive") {
      weightedPositive += weight
    } else if (article.sentiment === "negative") {
      weightedNegative += weight
    }
  })

  if (totalWeight === 0) return 0

  const epsilon = 0.01
  const tonalityScore = ((weightedPositive - weightedNegative) / (weightedPositive + weightedNegative + epsilon)) * 100

  return Math.round(Math.max(-100, Math.min(100, tonalityScore)))
}
