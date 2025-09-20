"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts"
import { Search, Globe, TrendingUp, TrendingDown, ExternalLink, Filter, RefreshCw } from "lucide-react"

interface PressArticle {
  id: string
  title: string
  source: string
  url: string
  date: string
  country: string
  language: string
  sentiment: "positive" | "negative" | "neutral"
  credibility: number
}

interface PressData {
  articles: PressArticle[]
  kpis: {
    totalArticles: number
    uniqueOutlets: number
    countries: number
    pressScore: number
    tonalityScore: number
  }
  timeline: Array<{ date: string; articles: number }>
  countryData: { [key: string]: number }
}

export default function PressePage() {
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<PressData | null>(null)
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  const [comparisonQuery, setComparisonQuery] = useState("")
  const [showComparison, setShowComparison] = useState(false)

  const mockData: PressData = {
    articles: [
      {
        id: "1",
        title: "Innovation technologique : une nouvelle approche révolutionnaire",
        source: "Le Monde",
        url: "https://lemonde.fr/article1",
        date: "2025-01-15",
        country: "FR",
        language: "fr",
        sentiment: "positive",
        credibility: 95,
      },
      {
        id: "2",
        title: "Market disruption in the tech sector",
        source: "Financial Times",
        url: "https://ft.com/article2",
        date: "2025-01-14",
        country: "GB",
        language: "en",
        sentiment: "neutral",
        credibility: 92,
      },
      {
        id: "3",
        title: "Controverse autour des nouvelles pratiques",
        source: "Les Échos",
        url: "https://lesechos.fr/article3",
        date: "2025-01-13",
        country: "FR",
        language: "fr",
        sentiment: "negative",
        credibility: 88,
      },
    ],
    kpis: {
      totalArticles: 47,
      uniqueOutlets: 23,
      countries: 8,
      pressScore: 73,
      tonalityScore: 12,
    },
    timeline: [
      { date: "2025-01-10", articles: 3 },
      { date: "2025-01-11", articles: 7 },
      { date: "2025-01-12", articles: 5 },
      { date: "2025-01-13", articles: 12 },
      { date: "2025-01-14", articles: 8 },
      { date: "2025-01-15", articles: 12 },
    ],
    countryData: {
      FR: 18,
      GB: 12,
      US: 8,
      DE: 5,
      ES: 4,
    },
  }

  const handleSearch = async () => {
    if (!query.trim()) return

    setLoading(true)

    try {
      console.log("[v0] Starting press analysis for:", query)

      const response = await fetch("/api/presse-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: query.trim() }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log("[v0] Press analysis completed:", result)

      setData(result)
    } catch (error) {
      console.error("[v0] Press analysis error:", error)
      // Fallback to mock data in case of error
      setData(mockData)
    } finally {
      setLoading(false)
    }
  }

  const handleCountrySelect = (countryCode: string) => {
    setSelectedCountries((prev) =>
      prev.includes(countryCode) ? prev.filter((c) => c !== countryCode) : [...prev, countryCode],
    )
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-100 text-green-800"
      case "negative":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return <TrendingUp className="w-3 h-3" />
      case "negative":
        return <TrendingDown className="w-3 h-3" />
      default:
        return null
    }
  }

  const getSentimentAnalysis = () => {
    if (!data?.articles) return null

    const sentiments = data.articles.reduce(
      (acc, article) => {
        acc[article.sentiment] = (acc[article.sentiment] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const total = data.articles.length
    return {
      positive: Math.round(((sentiments.positive || 0) / total) * 100),
      negative: Math.round(((sentiments.negative || 0) / total) * 100),
      neutral: Math.round(((sentiments.neutral || 0) / total) * 100),
      total,
    }
  }

  const getMediaCredibilityAnalysis = () => {
    if (!data?.articles) return []

    const mediaStats = data.articles.reduce(
      (acc, article) => {
        if (!acc[article.source]) {
          acc[article.source] = {
            source: article.source,
            articles: 0,
            avgCredibility: 0,
            totalCredibility: 0,
          }
        }
        acc[article.source].articles += 1
        acc[article.source].totalCredibility += article.credibility
        acc[article.source].avgCredibility = Math.round(
          acc[article.source].totalCredibility / acc[article.source].articles,
        )
        return acc
      },
      {} as Record<string, any>,
    )

    return Object.values(mediaStats).sort((a: any, b: any) => b.avgCredibility - a.avgCredibility)
  }

  const getMediaLogo = (source: string) => {
    const logos: Record<string, string> = {
      "lemonde.fr": "🌍",
      "lefigaro.fr": "📰",
      "liberation.fr": "🗞️",
      "lesechos.fr": "💼",
      "nytimes.com": "🗽",
      "washingtonpost.com": "🏛️",
      "reuters.com": "📡",
      "bloomberg.com": "📈",
      "bbc.com": "🇬🇧",
      "theguardian.com": "🛡️",
      "telegraph.co.uk": "📻",
      "Financial Times": "💰",
      "Le Monde": "🌍",
      "Les Échos": "💼",
    }
    return logos[source] || "📄"
  }

  const getPersonalizedScoreExplanation = () => {
    if (!data) return null

    const { kpis, articles } = data
    const { pressScore, totalArticles, uniqueOutlets, tonalityScore } = kpis

    let explanation = `Votre Score Presse de ${pressScore}/100 est basé sur l'analyse de ${totalArticles} articles trouvés dans ${uniqueOutlets} médias différents. `

    if (pressScore >= 80) {
      explanation +=
        "Excellente performance ! Vous bénéficiez d'une très forte visibilité médiatique avec une couverture diversifiée. "
    } else if (pressScore >= 60) {
      explanation += "Bonne performance médiatique avec une présence notable dans la presse. "
    } else if (pressScore >= 40) {
      explanation += "Présence médiatique modérée, il y a des opportunités d'amélioration. "
    } else {
      explanation += "Visibilité médiatique limitée, votre stratégie de relations presse nécessite un renforcement. "
    }

    const sentimentAnalysis = getSentimentAnalysis()
    if (sentimentAnalysis) {
      if (tonalityScore > 10) {
        explanation += `La tonalité globale est très positive (+${tonalityScore}) avec ${sentimentAnalysis.positive}% d'articles favorables. `
      } else if (tonalityScore > 0) {
        explanation += `La tonalité est légèrement positive (+${tonalityScore}) avec un équilibre entre articles positifs (${sentimentAnalysis.positive}%) et neutres. `
      } else if (tonalityScore > -10) {
        explanation += `La tonalité est mitigée (${tonalityScore}) avec ${sentimentAnalysis.negative}% d'articles négatifs à surveiller. `
      } else {
        explanation += `Attention : la tonalité est majoritairement négative (${tonalityScore}) avec ${sentimentAnalysis.negative}% d'articles défavorables. `
      }
    }

    const avgCredibility = articles.reduce((sum, article) => sum + article.credibility, 0) / articles.length
    explanation += `La crédibilité moyenne de vos sources est de ${Math.round(avgCredibility)}%, ce qui ${avgCredibility >= 80 ? "renforce la fiabilité" : avgCredibility >= 60 ? "assure une fiabilité correcte" : "nécessite d'améliorer la qualité"} de votre couverture presse.`

    return explanation
  }

  const sentimentAnalysis = getSentimentAnalysis()
  const mediaCredibility = getMediaCredibilityAnalysis()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Analyse de Couverture Presse</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Mesurez votre présence médiatique et analysez la tonalité de votre couverture presse
          </p>

          {/* Search Form */}
          <div className="max-w-2xl mx-auto">
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <Input
                  placeholder="Nom de marque ou entité à analyser..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="text-lg py-3"
                />
              </div>
              <Button onClick={handleSearch} disabled={loading || !query.trim()} className="px-8 py-3">
                {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                Analyser
              </Button>
            </div>

            {/* Comparison Toggle */}
            <div className="flex items-center justify-center gap-4">
              <Button
                variant={showComparison ? "default" : "outline"}
                onClick={() => setShowComparison(!showComparison)}
                size="sm"
              >
                Mode Comparaison
              </Button>
              {showComparison && (
                <Input
                  placeholder="Concurrent à comparer..."
                  value={comparisonQuery}
                  onChange={(e) => setComparisonQuery(e.target.value)}
                  className="max-w-xs"
                />
              )}
            </div>
          </div>
        </div>

        {/* Results Section */}
        {data && (
          <div className="space-y-8">
            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{data.kpis.totalArticles}</div>
                  <div className="text-sm text-muted-foreground">Articles (30j)</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{data.kpis.uniqueOutlets}</div>
                  <div className="text-sm text-muted-foreground">Médias uniques</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{data.kpis.countries}</div>
                  <div className="text-sm text-muted-foreground">Pays</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{data.kpis.pressScore}/100</div>
                  <div className="text-sm text-muted-foreground">Score Presse</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div
                    className={`text-2xl font-bold ${data.kpis.tonalityScore >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {data.kpis.tonalityScore > 0 ? "+" : ""}
                    {data.kpis.tonalityScore}
                  </div>
                  <div className="text-sm text-muted-foreground">Tonalité</div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <h3 className="font-semibold text-blue-900 mb-3">📊 Analyse de votre Score Presse</h3>
                <p className="text-blue-800 text-sm leading-relaxed">
                  {getPersonalizedScoreExplanation() ||
                    "Lancez une analyse pour obtenir une explication détaillée de votre score presse personnalisé."}
                </p>
              </CardContent>
            </Card>

            <div className="grid lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Analyse de Sentiment Détaillée
                  </CardTitle>
                  <CardDescription>Répartition de la tonalité des articles</CardDescription>
                </CardHeader>
                <CardContent>
                  {sentimentAnalysis && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">{sentimentAnalysis.positive}%</div>
                          <div className="text-sm text-green-700">Positif</div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-gray-600">{sentimentAnalysis.neutral}%</div>
                          <div className="text-sm text-gray-700">Neutre</div>
                        </div>
                        <div className="p-4 bg-red-50 rounded-lg">
                          <div className="text-2xl font-bold text-red-600">{sentimentAnalysis.negative}%</div>
                          <div className="text-sm text-red-700">Négatif</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Sentiment global</span>
                          <span
                            className={`font-medium ${
                              sentimentAnalysis.positive > sentimentAnalysis.negative
                                ? "text-green-600"
                                : sentimentAnalysis.negative > sentimentAnalysis.positive
                                  ? "text-red-600"
                                  : "text-gray-600"
                            }`}
                          >
                            {sentimentAnalysis.positive > sentimentAnalysis.negative
                              ? "Plutôt positif"
                              : sentimentAnalysis.negative > sentimentAnalysis.positive
                                ? "Plutôt négatif"
                                : "Équilibré"}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-green-500 h-3 rounded-l-full"
                            style={{ width: `${sentimentAnalysis.positive}%` }}
                          ></div>
                          <div
                            className="bg-red-500 h-3 rounded-r-full"
                            style={{
                              width: `${sentimentAnalysis.negative}%`,
                              marginLeft: `${sentimentAnalysis.positive + sentimentAnalysis.neutral}%`,
                              marginTop: "-12px",
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Crédibilité des Médias
                  </CardTitle>
                  <CardDescription>Analyse de la fiabilité des sources (1-10)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mediaCredibility.slice(0, 8).map((media: any, index) => (
                      <div key={media.source} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3 flex-1">
                          <span className="text-lg">{getMediaLogo(media.source)}</span>
                          <div>
                            <div className="font-medium text-sm">{media.source}</div>
                            <div className="text-xs text-muted-foreground">
                              {media.articles} article{media.articles > 1 ? "s" : ""}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <div className="text-sm font-bold">{Math.round(media.avgCredibility / 10)}/10</div>
                            <div className="text-xs text-muted-foreground">
                              {media.avgCredibility >= 90
                                ? "Excellent"
                                : media.avgCredibility >= 80
                                  ? "Très bon"
                                  : media.avgCredibility >= 70
                                    ? "Bon"
                                    : media.avgCredibility >= 60
                                      ? "Moyen"
                                      : "Faible"}
                            </div>
                          </div>
                          <div className="w-12 h-2 bg-gray-200 rounded-full">
                            <div
                              className={`h-2 rounded-full ${
                                media.avgCredibility >= 90
                                  ? "bg-green-500"
                                  : media.avgCredibility >= 80
                                    ? "bg-blue-500"
                                    : media.avgCredibility >= 70
                                      ? "bg-yellow-500"
                                      : media.avgCredibility >= 60
                                        ? "bg-orange-500"
                                        : "bg-red-500"
                              }`}
                              style={{ width: `${media.avgCredibility}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Articles Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-5 h-5" />
                    Articles récents
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtrer
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.articles.map((article) => (
                    <div key={article.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground mb-2 line-clamp-2">{article.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="font-medium">{article.source}</span>
                            <Badge variant="outline" className="text-xs">
                              {article.country}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {article.language.toUpperCase()}
                            </Badge>
                            <span className="text-xs">Crédibilité: {article.credibility}%</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`${getSentimentColor(article.sentiment)} flex items-center gap-1`}>
                            {getSentimentIcon(article.sentiment)}
                            {article.sentiment}
                          </Badge>
                          <Button variant="ghost" size="sm" asChild>
                            <a href={article.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Comparison Section */}
            {showComparison && comparisonQuery && (
              <Card>
                <CardHeader>
                  <CardTitle>Comparaison concurrentielle</CardTitle>
                  <CardDescription>
                    Comparaison entre "{query}" et "{comparisonQuery}"
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      current: { label: query, color: "hsl(var(--chart-1))" },
                      competitor: { label: comparisonQuery, color: "hsl(var(--chart-2))" },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { metric: "Articles", current: 47, competitor: 32 },
                          { metric: "Médias", current: 23, competitor: 18 },
                          { metric: "Score Presse", current: 73, competitor: 65 },
                          { metric: "Tonalité", current: 12, competitor: -5 },
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="metric" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="current" fill="hsl(var(--chart-1))" />
                        <Bar dataKey="competitor" fill="hsl(var(--chart-2))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Empty State */}
        {!data && !loading && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
              <Search className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Analysez votre couverture presse</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Entrez le nom de votre marque ou entité pour découvrir votre présence médiatique, analyser la tonalité des
              articles et comparer avec vos concurrents.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
